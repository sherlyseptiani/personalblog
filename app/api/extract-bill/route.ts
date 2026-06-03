import { NextRequest, NextResponse } from 'next/server'
import { filterReceiptText, parseReceiptText } from '../../split-bill/lib/receipt-parser'

// Google Vision API endpoint
const GOOGLE_VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate'

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

    // Get API key from environment
    const apiKey = process.env.GOOGLE_VISION_API_KEY

    if (!apiKey) {
      // Fallback: return mock data for development if no API key
      console.warn('GOOGLE_VISION_API_KEY not set, using mock parser')
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
    note: 'Using mock data. Set GOOGLE_VISION_API_KEY for real OCR.',
  })
}
