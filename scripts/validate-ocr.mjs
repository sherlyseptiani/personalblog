import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const OCR_DIR = '/Users/bytedance/personal_blog/.raw/ocr'
const REPORT_PATH = path.join(OCR_DIR, 'report.json')
const PARSE_ENDPOINT = 'http://localhost:3000/api/parse-receipt'

const PAYMENT_KEYWORDS = [
  /paid/i, /qris/i, /change/i, /balance/i, /cash/i, /card/i,
  /debit/i, /credit/i, /bank/i, /transfer/i, /ewallet/i, /e-wallet/i,
  /ovo/i, /gopay/i, /shopee/i
]

const SUMMARY_KEYWORDS = [
  /sub\s*total/i, /grand\s*total/i, /rounding/i, /packaging/i, /delivery/i,
  /service/i, /tax/i, /discount/i
]

const isBadName = (name) => {
  if (!name) return true
  const lower = name.toLowerCase()
  return PAYMENT_KEYWORDS.some(r => r.test(lower)) || SUMMARY_KEYWORDS.some(r => r.test(lower))
}

const priceLooksWeird = (price) => typeof price !== 'number' || price <= 0 || price > 10_000_000_000

const validateFile = (filename, data) => {
  const items = Array.isArray(data.items) ? data.items : []
  const issues = []

  if (items.length < 2) issues.push('items<2')

  const badNames = items.filter(item => isBadName(item.name)).map(item => item.name)
  if (badNames.length) issues.push(`badNames:${badNames.join(',')}`)

  const badPrices = items.filter(item => priceLooksWeird(item.price)).length
  if (badPrices) issues.push(`badPrices:${badPrices}`)

  return {
    file: filename,
    items: items.length,
    issues,
    ok: issues.length === 0,
  }
}

const parseFromRawText = async (rawText) => {
  const response = await fetch(PARSE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawText }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`parse-receipt failed: ${response.status} ${errorText}`)
  }

  return response.json()
}

const run = async () => {
  const files = (await readdir(OCR_DIR)).filter(f => f.endsWith('.ocr.json'))
  const results = []

  for (const file of files) {
    const filePath = path.join(OCR_DIR, file)
    const raw = await readFile(filePath, 'utf-8')
    const data = JSON.parse(raw)
    const rawText = data.rawText || ''

    const parsed = await parseFromRawText(rawText)
    const parsedPath = path.join(OCR_DIR, file.replace('.ocr.json', '.parsed.json'))
    await writeFile(parsedPath, JSON.stringify(parsed, null, 2))

    results.push(validateFile(file, parsed))
  }

  const report = {
    total: results.length,
    ok: results.filter(r => r.ok).length,
    needsReview: results.filter(r => !r.ok).length,
    results,
  }

  await writeFile(REPORT_PATH, JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
