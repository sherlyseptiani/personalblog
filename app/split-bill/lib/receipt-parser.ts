/**
 * Receipt Parser - Extracts structured bill data from OCR text
 * Supports multiple receipt formats: restaurant, retail, utility bills
 */

export interface ParsedReceipt {
  items: Array<{
    name: string
    quantity: number
    price: number
    lineTotal?: number
  }>
  tax?: number
  taxType: 'percent' | 'amount'
  serviceCharge?: number
  serviceChargeType: 'percent' | 'amount'
  discount?: number
  discountType: 'percent' | 'amount'
  total?: number
  currency: string
  merchant?: string
  date?: string
}

// Currency detection patterns
const CURRENCY_PATTERNS: Record<string, RegExp[]> = {
  IDR: [/Rp[\s.]?/i, /IDR/i, /Rupiah/i],
  USD: [/\$/i, /USD/i],
  EUR: [/€/i, /EUR/i],
  GBP: [/£/i, /GBP/i],
  SGD: [/S\$/, /SGD/i, /SING\$/i],
  JPY: [/¥/i, /JPY/i, /YEN/i],
  MYR: [/RM/i, /MYR/i, /RINGGIT/i],
  THB: [/฿/i, /THB/i, /BAHT/i],
  VND: [/₫/i, /VND/i, /DONG/i],
}

// Tax-related keywords
const TAX_KEYWORDS = [
  /tax/i, /gst/i, /vat/i, /ppn/i, /service\s*tax/i,
  /government\s*tax/i, /sales\s*tax/i, /value\s*added\s*tax/i
]

// Service charge keywords
const SERVICE_CHARGE_KEYWORDS = [
  /service\s*charge/i, /service\s*fee/i, /srv\s*chg/i,
  /pb1/i, /gratuity/i, /sc/i, /service/i
]

// Discount keywords
const DISCOUNT_KEYWORDS = [
  /discount/i, /disc/i, /promo/i, /promotion/i,
  /voucher/i, /coupon/i, /savings/i, /save/i, /off/i
]

// Total keywords (to exclude from items)
const TOTAL_KEYWORDS = [
  /^\s*total/i, /^\s*grand\s*total/i, /^\s*sub\s*total/i, /^\s*subtotal/i, /^\s*sum/i,
  /^\s*amount\s*due/i, /^\s*amount\s*paid/i, /^\s*net\s*total/i,
  /^\s*gross\s*total/i, /^\s*balance/i, /^\s*change/i, /^\s*cash/i,
  /^\s*card/i, /^\s*payment/i, /^\s*tendered/i, /^\s*rounding/i,
  /^\s*packaging/i, /^\s*delivery/i
]

const PAYMENT_KEYWORDS = [
  /paid/i, /qris/i, /change/i, /balance/i, /cash/i, /card/i,
  /debit/i, /credit/i, /bank/i, /transfer/i, /ewallet/i, /e-wallet/i,
  /ovo/i, /gopay/i, /shopee/i, /mandiri/i
]

const SUMMARY_KEYWORDS = [
  /sub\s*tot/i, /grand\s*tot/i, /rounding/i, /packaging/i, /delivery/i,
  /service/i, /tax/i, /discount/i, /total\s*i\s*em/i, /total\s*qty/i
]

const PRICE_LIKE_PATTERN = /(\d{1,3}(?:[.,]\d{3})+|\d+(?:[.,]\d{1,2})?)/

function hasPriceLike(line: string): boolean {
  return PRICE_LIKE_PATTERN.test(line)
}

function isPriceOnlyLine(line: string): boolean {
  const trimmed = line.trim()
  if (!trimmed) return false
  if (/[a-zA-Z]/.test(trimmed)) return false
  return PRICE_LIKE_PATTERN.test(trimmed)
}

function isQtyLine(line: string): boolean {
  return /^\s*\d+\s*[x×]\s*$/i.test(line)
}

function isItemHeaderLine(line: string): boolean {
  const trimmed = line.trim().toLowerCase()
  if (!trimmed) return false
  if (/\b(dine|take)\b/.test(trimmed)) return true
  if (/^table\b/.test(trimmed)) return true
  if (/\bpax\b/.test(trimmed)) return true
  if (/\bpos\b/.test(trimmed)) return true
  return false
}

function selectItemLinesWithinBlock(lines: string[]): string[] {
  const startIndex = lines.findIndex(line => isItemHeaderLine(line))
  if (startIndex === -1) return lines
  return lines.slice(startIndex + 1)
}

function trimToFirstItemLine(lines: string[]): string[] {
  const startIndex = lines.findIndex(line => /^\s*\d+\s*[.)]/.test(line) || /^\s*\d+\s+/.test(line) || isLikelyItemLabel(line))
  if (startIndex === -1) return lines
  return lines.slice(startIndex)
}

function isSummaryLine(line: string): boolean {
  const lowerLine = line.toLowerCase().trim()
  return SUMMARY_KEYWORDS.some(keyword => keyword.test(lowerLine))
}

function isPaymentLine(line: string): boolean {
  const lowerLine = line.toLowerCase().trim()
  return PAYMENT_KEYWORDS.some(keyword => keyword.test(lowerLine))
}

function isItemNameCandidate(line: string): boolean {
  const trimmed = line.trim()
  if (!trimmed) return false
  if (isTotalLine(trimmed)) return false
  if (isSummaryLine(trimmed)) return false
  if (isPaymentLine(trimmed)) return false
  if (isTaxLine(trimmed).isTax) return false
  if (isServiceChargeLine(trimmed).isSC) return false
  if (isDiscountLine(trimmed).isDiscount) return false
  if (isPriceOnlyLine(trimmed)) return false
  if (/\b(dine|take|table|pax|kasir|tanggal|order|cover|pos|re?ff|catatan|notes?)\b/i.test(trimmed)) return false
  if (/\b(rt|rw|jalan|jl\.?|no\.|kav)\b/i.test(trimmed)) return false
  if (/^\d+(?:[.,]\d+)*\s*$/.test(trimmed)) return false
  return /[a-zA-Z]/.test(trimmed)
}

function isLikelyItemLabel(line: string): boolean {
  if (!isItemNameCandidate(line)) return false
  if (!/[A-Z]/.test(line)) return false
  if (/:/.test(line)) return false
  if (isSummaryLine(line) || isPaymentLine(line)) return false
  if (/^\d{1,2}\s+[A-Za-z]/.test(line)) return true
  const words = line.trim().split(/\s+/)
  return words.length >= 2
}

function isLabelLine(line: string): boolean {
  return isTotalLine(line) || isTaxLine(line).isTax || isServiceChargeLine(line).isSC || isDiscountLine(line).isDiscount
}

function selectItemBlock(lines: string[]): string[] {
  if (lines.length === 0) return lines

  const isPriceIndex = (line: string) => hasPriceLike(line) && !isPaymentLine(line)
  const priceIndices = lines
    .map((line, index) => (isPriceIndex(line) ? index : -1))
    .filter(index => index >= 0)

  if (!priceIndices.length) return lines

  let start = priceIndices[0]
  for (let i = start - 1; i >= 0 && start - i <= 3; i -= 1) {
    if (isItemNameCandidate(lines[i])) {
      start = i
    } else {
      break
    }
  }

  let end = priceIndices[priceIndices.length - 1]
  const summaryIndex = lines.findIndex((line, index) => index >= start && (isTotalLine(line) || isSummaryLine(line) || isPaymentLine(line)))
  if (summaryIndex !== -1) end = Math.min(end, summaryIndex - 1)

  return lines.slice(start, end + 1)
}

function mergeReceiptLines(lines: string[]): string[] {
  const merged: string[] = []
  const pendingItems: string[] = []
  let pendingSummaryLabel: string | null = null
  const isQtyUnitLine = (line: string) => /^\s*\d+\s*[x×]\s*\d/.test(line)

  const flushPending = () => {
    if (pendingItems.length) {
      merged.push(...pendingItems)
      pendingItems.length = 0
    }
  }

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]
    const next = lines[i + 1]
    const nextNext = lines[i + 2]

    if (isLabelLine(line)) {
      if (pendingItems.length) {
        pendingSummaryLabel = line
        continue
      }
      if (next && isPriceOnlyLine(next)) {
        merged.push(`${line} ${next}`)
        i += 1
        continue
      }
      merged.push(line)
      continue
    }

    if (isLikelyItemLabel(line) && next && isQtyUnitLine(next)) {
      flushPending()
      merged.push(`${line} ${next}`)
      i += 1
      if (nextNext && isPriceOnlyLine(nextNext)) {
        i += 1
      }
      continue
    }

    if (isLikelyItemLabel(line)) {
      pendingItems.push(line)
      continue
    }

    if (isQtyLine(line)) {
      if (pendingItems.length) {
        const lastIndex = pendingItems.length - 1
        pendingItems[lastIndex] = `${pendingItems[lastIndex]} ${line}`
        continue
      }
      continue
    }

    if (isPriceOnlyLine(line)) {
      if (pendingItems.length) {
        const itemLine = pendingItems.shift() as string
        merged.push(`${itemLine} ${line}`)
        continue
      }

      if (pendingSummaryLabel) {
        merged.push(`${pendingSummaryLabel} ${line}`)
        pendingSummaryLabel = null
        continue
      }

      if (merged.length > 0) {
        const last = merged[merged.length - 1]
        if (isItemNameCandidate(last) && !hasPriceLike(last)) {
          merged[merged.length - 1] = `${last} ${line}`
          continue
        }
      }

      merged.push(line)
      continue
    }

    flushPending()
    if (pendingSummaryLabel) {
      merged.push(pendingSummaryLabel)
      pendingSummaryLabel = null
    }
    merged.push(line)
  }

  flushPending()
  if (pendingSummaryLabel) merged.push(pendingSummaryLabel)
  return merged
}

export function filterReceiptText(text: string): string {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l)
  const block = selectItemBlock(lines)
  const focused = selectItemLinesWithinBlock(block)
  const trimmed = trimToFirstItemLine(focused)
  return trimmed.length ? trimmed.join('\n') : text
}

// Helper to detect if a line is a total/summary line (not an item)
function isTotalLine(line: string): boolean {
  const lowerLine = line.toLowerCase().trim()
  return TOTAL_KEYWORDS.some(keyword => keyword.test(lowerLine))
}

// Helper to detect if a line is a tax line
function isTaxLine(line: string): { isTax: boolean; value?: number; type?: 'percent' | 'amount' } {
  const lowerLine = line.toLowerCase()
  const hasTaxKeyword = TAX_KEYWORDS.some(kw => kw.test(lowerLine))

  if (!hasTaxKeyword) return { isTax: false }

  // Look for percentage pattern (e.g., "Tax 10%", "GST 11%")
  const percentMatch = line.match(/(\d+(?:\.\d+)?)\s*%/)
  if (percentMatch) {
    return { isTax: true, value: parseFloat(percentMatch[1]), type: 'percent' }
  }

  // Look for amount pattern (e.g., "Tax: $5.00", "PPN Rp 10.000")
  const amountMatch = line.match(/(?:tax|gst|vat|ppn)[^\d]*([\d,.]+)/i)
  if (amountMatch) {
    const value = parseFloat(amountMatch[1].replace(/,/g, '').replace(/\./g, ''))
    return { isTax: true, value, type: 'amount' }
  }

  return { isTax: true }
}

// Helper to detect if a line is a service charge line
function isServiceChargeLine(line: string): { isSC: boolean; value?: number; type?: 'percent' | 'amount' } {
  const lowerLine = line.toLowerCase()
  const hasSCKeyword = SERVICE_CHARGE_KEYWORDS.some(kw => kw.test(lowerLine))

  if (!hasSCKeyword) return { isSC: false }

  // Look for percentage pattern
  const percentMatch = line.match(/(\d+(?:\.\d+)?)\s*%/)
  if (percentMatch) {
    return { isSC: true, value: parseFloat(percentMatch[1]), type: 'percent' }
  }

  // Look for amount pattern
  const amountMatch = line.match(/(?:service|charge|fee|pb1)[^\d]*([\d,.]+)/i)
  if (amountMatch) {
    const value = parseFloat(amountMatch[1].replace(/,/g, '').replace(/\./g, ''))
    return { isSC: true, value, type: 'amount' }
  }

  return { isSC: true }
}

// Helper to detect if a line is a discount line
function isDiscountLine(line: string): { isDiscount: boolean; value?: number; type?: 'percent' | 'amount' } {
  const lowerLine = line.toLowerCase()
  const hasDiscountKeyword = DISCOUNT_KEYWORDS.some(kw => kw.test(lowerLine))

  if (!hasDiscountKeyword) return { isDiscount: false }

  // Look for percentage pattern
  const percentMatch = line.match(/(\d+(?:\.\d+)?)\s*%/)
  if (percentMatch) {
    return { isDiscount: true, value: parseFloat(percentMatch[1]), type: 'percent' }
  }

  // Look for amount pattern (negative numbers often indicate discount)
  const amountMatch = line.match(/-?\s*([\d,.]+)/)
  if (amountMatch) {
    const value = parseFloat(amountMatch[1].replace(/,/g, '').replace(/\./g, ''))
    return { isDiscount: true, value, type: 'amount' }
  }

  return { isDiscount: true }
}

// Detect currency from text
function detectCurrency(text: string): string {
  for (const [currency, patterns] of Object.entries(CURRENCY_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        return currency
      }
    }
  }

  // Default based on context clues
  if (/\brp\b/i.test(text) || /indonesia/i.test(text) || /jakarta/i.test(text)) {
    return 'IDR'
  }
  if (/\$/.test(text) && /singapore/i.test(text)) {
    return 'SGD'
  }

  return 'IDR' // Default to IDR for the blog's likely audience
}

// Parse a single line to extract item information
function parseItemLine(line: string, currency: string): { name: string; quantity: number; price: number; lineTotal?: number } | null {
  const trimmed = line.trim()
  if (!trimmed || trimmed.length < 3) return null

  if (!isItemNameCandidate(trimmed)) return null

  // Skip total or price-only lines
  if (isTotalLine(trimmed)) return null
  if (isPriceOnlyLine(trimmed)) return null

  // Skip tax/service/discount lines
  if (isTaxLine(trimmed).isTax) return null
  if (isServiceChargeLine(trimmed).isSC) return null
  if (isDiscountLine(trimmed).isDiscount) return null

  // Pattern 1: "2x Item Name @ $10.00 $20.00" or "2x Item Name $20.00"
  // Pattern 2: "Item Name ....... $20.00" (dotted leaders)
  // Pattern 3: "Item Name $20.00"
  // Pattern 4: "Item Name 20.000" (IDR without currency symbol)

  const hasUnitHint = /@|\beach\b|\bea\b|per\s*item|\b[x×]\b/i.test(trimmed)

  // Remove currency symbols for easier parsing
  const cleanLine = trimmed
    .replace(/Rp[\s.]?/gi, '')
    .replace(/[$€£¥]/g, '')
    .replace(/S\$/g, '')
    .replace(/RM/gi, '')
    .trim()

  // Try to find price at the end (most common format)
  // Match: grouped thousands (1.428.000) or decimals (12.50)
  const priceMatch = cleanLine.match(/(\d{1,3}(?:[.,]\d{3})+|\d+(?:[.,]\d{1,2})?)\s*$/)
  if (!priceMatch) return null

  const rawToken = priceMatch[1]
  const parseNumericToken = (token: string) => {
    const hasDot = token.includes('.')
    const hasComma = token.includes(',')

    if (hasDot && hasComma) {
      return parseFloat(token.replace(/,/g, ''))
    }

    if (hasDot && !hasComma) {
      const parts = token.split('.')
      const last = parts[parts.length - 1]
      if (last.length === 3) {
        return parseFloat(parts.join(''))
      }
      return parseFloat(token)
    }

    if (hasComma && !hasDot) {
      const parts = token.split(',')
      const last = parts[parts.length - 1]
      if (last.length === 3) {
        return parseFloat(parts.join(''))
      }
      return parseFloat(token.replace(/,/g, ''))
    }

    return parseFloat(token)
  }

  const price = parseNumericToken(rawToken)
  if ((currency === 'IDR' || currency === 'MYR') && price < 1000) return null
  if (isNaN(price) || price === 0) return null

  // Everything before the price is the item name
  let namePart = cleanLine.substring(0, cleanLine.lastIndexOf(priceMatch[1])).trim()

  // Remove common quantity patterns from name
  // Pattern: "2x Item" or "2 x Item" or "2× Item"
  const qtyMatch = namePart.match(/^(\d+)\s*[x×]\s*/i)
  let quantity = 1
  if (qtyMatch) {
    quantity = parseInt(qtyMatch[1])
    namePart = namePart.substring(qtyMatch[0].length).trim()
  }

  const trailingQtyMatch = namePart.match(/(\d+)\s*[x×]\s*$/i)
  if (trailingQtyMatch) {
    quantity = parseInt(trailingQtyMatch[1])
    namePart = namePart.replace(trailingQtyMatch[0], '').trim()
  }

  const leadingQtyMatch = namePart.match(/^(\d+)\s+/)
  if (leadingQtyMatch) {
    quantity = parseInt(leadingQtyMatch[1])
    namePart = namePart.substring(leadingQtyMatch[0].length).trim()
  }

  namePart = namePart.replace(/^\d+\s*[x×]\s*/i, '').trim()

  // Pattern: "Item @ 10000" (unit price indication)
  namePart = namePart.replace(/\s*[@]\s*\d+\.?\d*\s*$/, '').trim()

  // Remove dotted leaders (......)
  namePart = namePart.replace(/\.+$/, '').trim()

  // Clean up the name
  namePart = namePart
    .replace(/^\d+\s*[.)]?\s*/, '') // Remove leading numbers ("1.")
    .replace(/^\.+\s*/, '') // Remove leading dots
    .replace(/\s+/g, ' ')   // Normalize whitespace
    .trim()

  if (!namePart) return null

  const basePrice = price
  let unitPrice = basePrice
  let lineTotal = basePrice

  if (quantity > 1) {
    if (hasUnitHint) {
      unitPrice = basePrice
      lineTotal = basePrice * quantity
    } else {
      lineTotal = basePrice
      unitPrice = Math.round(basePrice / quantity)
    }
  }

  return {
    name: namePart,
    quantity,
    price: unitPrice,
    lineTotal,
  }
}

// Extract merchant name from first few lines
function extractMerchant(lines: string[]): string | undefined {
  // Merchant name is typically in the first 3 lines
  for (let i = 0; i < Math.min(3, lines.length); i++) {
    const line = lines[i].trim()
    // Skip empty lines and lines that look like addresses
    if (!line || /^\d+/.test(line) || /street|st\.|ave\.|road|rd\.|jalan|jl\./i.test(line)) {
      continue
    }
    // Skip single words (likely not merchant names)
    if (line.split(/\s+/).length > 1 && line.length > 3) {
      return line.replace(/\s+/g, ' ').trim()
    }
  }
  return undefined
}

// Extract date from text
function extractDate(text: string): string | undefined {
  // Common date patterns
  const datePatterns = [
    // DD/MM/YYYY or DD-MM-YYYY
    /(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/,
    // YYYY/MM/DD
    /(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})/,
    // Month DD, YYYY
    /(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[\s.,]+(\d{1,2})[\s.,]+(\d{4})/i,
  ]

  for (const pattern of datePatterns) {
    const match = text.match(pattern)
    if (match) {
      return match[0]
    }
  }

  return undefined
}

/**
 * Main parser function - converts OCR text to structured receipt data
 */
export function parseReceiptText(text: string): ParsedReceipt {
  const normalizedText = filterReceiptText(text)
  const rawLines = normalizedText.split('\n').map(l => l.trim()).filter(l => l)
  const lines = mergeReceiptLines(rawLines)
  const currency = detectCurrency(text)

  const result: ParsedReceipt = {
    items: [],
    taxType: 'percent',
    serviceChargeType: 'amount',
    discountType: 'amount',
    currency
  }

  // Extract merchant and date
  result.merchant = extractMerchant(lines)
  result.date = extractDate(text)

  const candidateLines = lines.filter(line => hasPriceLike(line) || isTotalLine(line) || isTaxLine(line).isTax || isServiceChargeLine(line).isSC || isDiscountLine(line).isDiscount)
  const processedLines = candidateLines.length ? candidateLines : lines

  // Process each line
  for (const line of processedLines) {
    // Try to parse as tax
    const taxInfo = isTaxLine(line)
    if (taxInfo.isTax && taxInfo.value !== undefined) {
      result.tax = taxInfo.value
      result.taxType = taxInfo.type || 'percent'
      continue
    }

    // Try to parse as service charge
    const scInfo = isServiceChargeLine(line)
    if (scInfo.isSC && scInfo.value !== undefined) {
      result.serviceCharge = scInfo.value
      result.serviceChargeType = scInfo.type || 'amount'
      continue
    }

    // Try to parse as discount
    const discInfo = isDiscountLine(line)
    if (discInfo.isDiscount && discInfo.value !== undefined) {
      result.discount = discInfo.value
      result.discountType = discInfo.type || 'amount'
      continue
    }

    // Try to parse as item
    const item = parseItemLine(line, currency)
    if (item) {
      result.items.push(item)
    }
  }

  // Calculate total if not explicitly found
  if (result.items.length > 0) {
    result.total = result.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  // Post-processing: filter out likely false positives
  // Remove items that are too expensive (likely totals) or too cheap (likely modifiers)
  if (result.total && result.items.length > 1) {
    const avgPrice = result.total / result.items.length
    result.items = result.items.filter(item => {
      // Skip if price is more than 5x average (likely a subtotal)
      if (item.price > avgPrice * 5) return false
      // Skip if price is 0
      if (item.price === 0) return false
      return true
    })
  }

  return result
}

/**
 * Normalize price based on currency
 * Some currencies like IDR often omit last 3 zeros in receipts
 */
export function normalizePrice(price: number, currency: string): number {
  if (currency === 'IDR') {
    // If price seems too low for IDR (less than 1000), it might be in thousands
    if (price > 0 && price < 1000) {
      return price * 1000
    }
  }
  return price
}
