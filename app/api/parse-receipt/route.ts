import { NextRequest, NextResponse } from 'next/server'
import { filterReceiptText, parseReceiptText } from '../../split-bill2/lib/receipt-parser'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const rawText = typeof body?.rawText === 'string' ? body.rawText : ''

    if (!rawText.trim()) {
      return NextResponse.json(
        { error: 'No rawText provided' },
        { status: 400 }
      )
    }

    const filteredText = filterReceiptText(rawText)
    const parsedReceipt = parseReceiptText(filteredText)

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
        tax: parsedReceipt.tax ?? 11,
        taxType: parsedReceipt.taxType,
        serviceCharge: parsedReceipt.serviceCharge ?? 0,
        serviceChargeType: parsedReceipt.serviceChargeType,
        discount: parsedReceipt.discount ?? 0,
        discountType: parsedReceipt.discountType,
        currency: parsedReceipt.currency,
        merchant: parsedReceipt.merchant,
        date: parsedReceipt.date,
      },
      rawText,
      filteredText,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Parse receipt error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
