import { NextRequest, NextResponse } from 'next/server'
import { filterReceiptText, parseReceiptText } from '../../split-bill/lib/receipt-parser'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Google Vision API endpoint
const GOOGLE_VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate'

// Gemini client
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null

// Debug: Log if API key is configured (don't log the actual key!)
console.log('Gemini API Key configured:', !!process.env.GEMINI_API_KEY)

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
    let geminiErrorInfo = null
    let geminiRawResponse = null
    if (genAI) {
      try {
        console.log('Trying Gemini extraction...')
        const geminiResult = await extractWithGemini(base64Image, file.type)
        console.log('Gemini extraction successful')
        return NextResponse.json(geminiResult)
      } catch (geminiError: any) {
        geminiErrorInfo = {
          message: geminiError?.message || 'Unknown error',
          stack: geminiError?.stack || null,
        }
        geminiRawResponse = geminiError?.rawResponse || null
        console.error('Gemini extraction FAILED with error:', geminiError?.message || geminiError)
        console.error('Error details:', geminiError)
        // Fall through to Vision API
      }
    } else {
      geminiErrorInfo = { message: 'GEMINI_API_KEY not configured' }
      geminiRawResponse = null
      console.log('Gemini client not initialized - GEMINI_API_KEY may be missing')
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
      _debug: {
        geminiConfigured: !!process.env.GEMINI_API_KEY,
        geminiError: geminiErrorInfo,
        geminiRawResponse: geminiRawResponse,
      }
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

  const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })

  const prompt = `You are a receipt parser. Extract data and return ONLY valid JSON. No explanations, no thinking, no markdown - just the JSON object.

EXACT JSON STRUCTURE REQUIRED:
{
  "items": [
    { "name": "item name", "quantity": 1, "price": 10000, "lineTotal": 10000 }
  ],
  "tax": 11,
  "taxType": "percent",
  "serviceCharge": 0,
  "serviceChargeType": "amount",
  "discount": 0,
  "discountType": "amount",
  "total": 29000,
  "currency": "IDR",
  "merchant": "Restaurant Name",
  "date": "2024-01-15"
}

RULES:
1. ONLY return the JSON object - no other text, no markdown, no explanations
2. IGNORE receipt headers (store name, address, NPWP, phone) - these are NOT items
3. Extract ONLY food/drink products from the item list section
4. Get the TOTAL amount from bottom of receipt
5. lineTotal = quantity × unit price for each item
6. Include packaging fees as separate items
7. Detect currency from symbols: Rp=IDR, $=USD, €=EUR, £=GBP, ¥=JPY, S$=SGD
8. Clean item names (remove codes)
9. taxType/serviceChargeType/discountType use "percent" or "amount"
10. Return percent values as numbers (e.g., 11 for 11%)`

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
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
    }
  })

  const response = await result.response
  const text = response.text()

  // Log full Gemini response for debugging
  console.log('Gemini raw response:', text)

  // Log rate limit info if available
  const usageMetadata = (response as any).usageMetadata
  if (usageMetadata) {
    console.log('Gemini API Usage:', {
      promptTokens: usageMetadata.promptTokenCount,
      completionTokens: usageMetadata.candidatesTokenCount,
      totalTokens: usageMetadata.totalTokenCount,
    })
  }

  // Extract JSON from response (handle markdown code blocks)
  let jsonText = text

  // Remove markdown code block if present
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) {
    jsonText = codeBlockMatch[1].trim()
  }

  // Try to find complete JSON object first
  let jsonMatch = jsonText.match(/\{[\s\S]*\}/)

  // If no complete object found, try to extract partial JSON
  if (!jsonMatch) {
    // Check if response is truncated (ends mid-value)
    const partialMatch = jsonText.match(/(\{[\s\S]*"price":\s*\d+)$/)
    if (partialMatch) {
      console.warn('JSON appears truncated, attempting to repair...')
      // Try to complete the JSON
      const repaired = partialMatch[1] + ', "lineTotal": 0 }] }'
      try {
        const repairedData = JSON.parse(repaired)
        console.log('Successfully repaired truncated JSON')
        // Continue with repaired data
        jsonMatch = { 0: repaired } as any
      } catch {
        // Repair failed
      }
    }

    if (!jsonMatch) {
      console.error('Could not find JSON in response. Raw text:', text)
      throw new Error(`No valid JSON in Gemini response. Raw: ${text.substring(0, 200)}...`)
    }
  }

  // Try to parse, with better error handling
  let data
  try {
    data = JSON.parse(jsonMatch[0])
  } catch (parseError: any) {
    console.error('JSON parse error:', parseError.message)
    console.error('Attempted to parse:', jsonMatch[0].substring(0, 500))
    throw new Error(`JSON parse error: ${parseError.message}. Raw: ${text.substring(0, 200)}...`)
  }

  // Validate and adjust items if total doesn't match
  const items = (data.items || []).map((item: any, index: number) => ({
    id: `item-${Date.now()}-${index}`,
    name: item.name || 'Unknown Item',
    quantity: item.quantity || 1,
    price: Math.round(item.price || 0),
    lineTotal: Math.round((item.quantity || 1) * (item.price || 0)),
    assignedTo: [],
  }))

  const itemsSubtotal = items.reduce((sum: number, item: any) => sum + item.lineTotal, 0)
  const extractedTotal = data.total || itemsSubtotal

  // Check if receipt uses tax-inclusive pricing (items sum ≈ total)
  const isTaxInclusive = Math.abs(itemsSubtotal - extractedTotal) < 100

  // Only add tax/service charge if they're NOT already included in item prices
  const taxAmount = isTaxInclusive ? 0 : (data.taxType === 'percent'
    ? (itemsSubtotal * (data.tax || 0) / 100)
    : (data.tax || 0))

  const serviceChargeAmount = isTaxInclusive ? 0 : (data.serviceChargeType === 'percent'
    ? (itemsSubtotal * (data.serviceCharge || 0) / 100)
    : (data.serviceCharge || 0))

  const discountAmount = data.discountType === 'percent'
    ? (itemsSubtotal * (data.discount || 0) / 100)
    : (data.discount || 0)

  const calculatedTotal = isTaxInclusive
    ? extractedTotal  // Use extracted total directly for tax-inclusive receipts
    : itemsSubtotal + taxAmount + serviceChargeAmount - discountAmount

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
      tax: isTaxInclusive ? 0 : (data.tax || 0),
      taxType: data.taxType || 'percent',
      taxIncluded: isTaxInclusive ? (data.tax || 0) : undefined,
      serviceCharge: isTaxInclusive ? 0 : (data.serviceCharge || 0),
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
