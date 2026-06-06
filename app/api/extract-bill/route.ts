import { NextRequest, NextResponse } from 'next/server'
import { filterReceiptText, parseReceiptText } from '../../split-bill/lib/receipt-parser'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Google Vision API endpoint
const GOOGLE_VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate'

// Gemini client
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null

export async function POST(request: NextRequest) {
  try {
    // Parse the multipart form data
    const formData = await request.formData()
    const file = formData.get('image') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload an image.' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString('base64')

    // Try Gemini first (cheaper and smarter)
    if (genAI) {
      try {
        console.log('Trying Gemini extraction...')
        const geminiResult = await extractWithGemini(base64Image, file.type)
        console.log('Gemini extraction successful')
        return NextResponse.json(geminiResult)
      } catch (geminiError) {
        console.warn('Gemini extraction failed, falling back to Vision:', geminiError)
        // Fall through to Vision API
      }
    }

    // Fallback to Google Vision API
    const apiKey = process.env.GOOGLE_VISION_API_KEY

    if (!apiKey) {
      // Fallback: return mock data for development if no API key
      console.warn('No API keys set, using mock data')
      return simulateExtraction()
    }

    // Call Google Vision API
    const visionResponse = await fetch(
      `${GOOGLE_VISION_API_URL}?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: base64Image,
              },
              features: [
                {
                  type: 'DOCUMENT_TEXT_DETECTION',
                  maxResults: 1,
                },
              ],
            },
          ],
        }),
      }
    )

    if (!visionResponse.ok) {
      const error = await visionResponse.json()
      console.error('Vision API error:', error)
      return NextResponse.json(
        { error: 'Failed to process image. Please try again.' },
        { status: 500 }
      )
    }

    const visionData = await visionResponse.json()

    // Extract text from response
    const textAnnotation = visionData.responses?.[0]?.fullTextAnnotation
    if (!textAnnotation || !textAnnotation.text) {
      return NextResponse.json(
        { error: 'No text found in image. Please try a clearer photo.' },
        { status: 422 }
      )
    }

    const extractedText = textAnnotation.text
    const filteredText = filterReceiptText(extractedText)

    // Parse the receipt text
    const parsedReceipt = parseReceiptText(filteredText)

    // Convert to the format expected by split-bill
    const result = {
      items: parsedReceipt.items.map((item, index) => ({
        id: `item-${Date.now()}-${index}`,
        name: item.name,
        quantity: item.quantity,
        price: Math.round(item.price),
        lineTotal: item.lineTotal ? Math.round(item.lineTotal) : undefined,
        assignedTo: [],
      })),
      billData: {
        tax: parsedReceipt.tax || 11,
        taxType: parsedReceipt.taxType,
        serviceCharge: parsedReceipt.serviceCharge || 0,
        serviceChargeType: parsedReceipt.serviceChargeType,
        discount: parsedReceipt.discount || 0,
        discountType: parsedReceipt.discountType,
        currency: parsedReceipt.currency,
        merchant: parsedReceipt.merchant,
        date: parsedReceipt.date,
      },
      rawText: extractedText,
      filteredText,
      source: 'vision',
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Extract bill error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}

// Extract receipt data using Gemini
async function extractWithGemini(base64Image: string, mimeType: string) {
  if (!genAI) {
    throw new Error('Gemini API key not configured')
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const prompt = `Extract structured receipt data from this image. Return ONLY a JSON object with this exact structure:
{
  "items": [
    { "name": "item name", "quantity": 1, "price": 10000, "lineTotal": 10000 }
  ],
  "tax": 11,
  "taxType": "percent" | "amount",
  "serviceCharge": 0,
  "serviceChargeType": "percent" | "amount",
  "discount": 0,
  "discountType": "percent" | "amount",
  "total": 29000,
  "currency": "IDR" | "USD" | "EUR" | "SGD" | "GBP" | "JPY",
  "merchant": "Restaurant Name",
  "date": "2024-01-15"
}

CRITICAL RULES:
1. IGNORE the receipt header section (store name, address, NPWP, store ID, phone numbers, crew names, invoice numbers) - these are NOT items
2. Only extract items from the "QTY ITEM" or item list section - look for food/drink products with quantities and prices
3. Extract the TOTAL amount shown on the receipt (usually at the bottom, labeled "TOTAL", "GRAND TOTAL", "Total", or similar)
4. Calculate lineTotal for each item: quantity × unit price
5. After extracting, VALIDATE: sum of all lineTotals + tax + service charge - discount should equal the TOTAL
6. Common Indonesian receipt format: items listed with prices, then TOTAL at bottom
7. Include takeaway charges, packaging fees, etc. as separate items if listed
8. Detect currency from symbols ($, Rp, €, £, ¥, S$) or context
9. Clean up item names (remove codes, keep readable names)
10. Return percent values as numbers (e.g., 11 for 11%)
11. Use "IDR" for Rupiah/Rp, "USD" for $, etc.`

  const result = await model.generateContent({
    contents: [{
      role: 'user',
      parts: [
        { inlineData: { mimeType, data: base64Image } },
        { text: prompt }
      ]
    }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 2048,
    }
  })

  const response = await result.response
  const text = response.text()

  // Log rate limit info if available
  const usageMetadata = (response as any).usageMetadata
  if (usageMetadata) {
    console.log('Gemini API Usage:', {
      promptTokens: usageMetadata.promptTokenCount,
      completionTokens: usageMetadata.candidatesTokenCount,
      totalTokens: usageMetadata.totalTokenCount,
    })
  }

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('No valid JSON in Gemini response')
  }

  const data = JSON.parse(jsonMatch[0])

  // Validate and adjust items if total doesn't match
  const items = (data.items || []).map((item: any, index: number) => ({
    id: `item-${Date.now()}-${index}`,
    name: item.name || 'Unknown Item',
    quantity: item.quantity || 1,
    price: Math.round(item.price || 0),
    lineTotal: Math.round((item.quantity || 1) * (item.price || 0)),
    assignedTo: [],
  }))

  const taxAmount = data.taxType === 'percent'
    ? (items.reduce((sum: number, item: any) => sum + item.lineTotal, 0) * (data.tax || 0) / 100)
    : (data.tax || 0)

  const serviceChargeAmount = data.serviceChargeType === 'percent'
    ? (items.reduce((sum: number, item: any) => sum + item.lineTotal, 0) * (data.serviceCharge || 0) / 100)
    : (data.serviceCharge || 0)

  const discountAmount = data.discountType === 'percent'
    ? (items.reduce((sum: number, item: any) => sum + item.lineTotal, 0) * (data.discount || 0) / 100)
    : (data.discount || 0)

  const calculatedTotal = items.reduce((sum: number, item: any) => sum + item.lineTotal, 0)
    + taxAmount
    + serviceChargeAmount
    - discountAmount

  const extractedTotal = data.total || calculatedTotal

  // Check if totals match (within 100 IDR tolerance)
  const totalMismatch = Math.abs(calculatedTotal - extractedTotal) > 100

  // Transform to expected format
  return {
    items: items.map((item: any) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      lineTotal: item.lineTotal,
      assignedTo: [],
    })),
    billData: {
      tax: data.tax || 0,
      taxType: data.taxType || 'percent',
      serviceCharge: data.serviceCharge || 0,
      serviceChargeType: data.serviceChargeType || 'amount',
      discount: data.discount || 0,
      discountType: data.discountType || 'amount',
      total: extractedTotal,
      calculatedTotal: Math.round(calculatedTotal),
      totalMismatch,
      currency: data.currency || 'IDR',
      merchant: data.merchant || '',
      date: data.date || '',
    },
    source: 'gemini'
  }
}

// Simulated extraction for development without API key
function simulateExtraction() {
  // Simulate processing delay
  const mockItems = [
    { id: `item-${Date.now()}-1`, name: 'Nasi Goreng Special', quantity: 2, price: 45000, assignedTo: [] },
    { id: `item-${Date.now()}-2`, name: 'Ayam Bakar', quantity: 1, price: 55000, assignedTo: [] },
    { id: `item-${Date.now()}-3`, name: 'Es Teh Manis', quantity: 3, price: 8000, assignedTo: [] },
    { id: `item-${Date.now()}-4`, name: 'Sate Ayam (10 tusuk)', quantity: 1, price: 35000, assignedTo: [] },
  ]

  return NextResponse.json({
    items: mockItems,
    billData: {
      tax: 11,
      taxType: 'percent' as const,
      serviceCharge: 25000,
      serviceChargeType: 'amount' as const,
      discount: 0,
      discountType: 'amount' as const,
      currency: 'IDR',
      merchant: 'Sample Restaurant',
    },
    note: 'Using mock data. Set GEMINI_API_KEY or GOOGLE_VISION_API_KEY for real OCR.',
    source: 'mock',
  })
}
