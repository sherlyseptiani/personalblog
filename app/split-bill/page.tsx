'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import './split-bill2.css'
import { ParsedReceipt } from './lib/receipt-parser'

interface BillItem {
  id: string
  name: string
  quantity: number
  price: number
  lineTotal?: number
  assignedTo: string[]
  assignedQty?: Record<string, number>
}

interface Participant {
  id: string
  name: string
  initial: string
  color: string
  isHost?: boolean
}

interface PaymentInfo {
  payerId: string
  bankName: string
  accountNumber: string
}

interface BillData {
  title: string
  subtotal: number
  tax: number
  taxType: 'percent' | 'amount'
  tip: number
  serviceCharge: number
  serviceChargeType: 'percent' | 'amount'
  other: number
  otherType: 'percent' | 'amount'
  discount: number
  currency: string
}

const ACCENT_COLORS = [
  '#9869D3',
  '#6BA39A',
  '#E8A0C0',
  '#8CA8D8',
  '#C08A64',
  '#DB718E',
]

const CURRENCIES = [
  { code: 'IDR', symbol: 'Rp', name: 'Rupiah' },
  { code: 'USD', symbol: '$', name: 'Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'Pound' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Yen' },
]

function formatCurrency(amount: number, currencyCode: string): string {
  const currency = CURRENCIES.find(c => c.code === currencyCode)
  if (!currency) return `${amount}`
  const formatted = amount.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  return `${currency.symbol} ${formatted}`
}

function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  const progress = (currentStep / totalSteps) * 100
  return (
    <div className="sb2-step-indicator">
      <div className="sb2-step-bar">
        <div
          className="sb2-step-fill"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={currentStep}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-label={`Step ${currentStep} of ${totalSteps}`}
        />
      </div>
      <div className="sb2-step-labels">
        <span className="sb2-step-current">Step {currentStep}</span>
        <span className="sb2-step-total">of {totalSteps}</span>
      </div>
    </div>
  )
}

// Step 1: Bill Start
function Step1BillStart({
  data,
  onUpdate,
  onNext,
  onChooseMethod,
  onFileSelect,
  onExtract,
  onCancelFile,
  fileInputRef,
  imagePreview,
  isExtracting,
  extractError,
  extractionStep,
}: {
  data: BillData
  onUpdate: (data: Partial<BillData>) => void
  onNext: () => void
  onChooseMethod: (method: 'camera' | 'manual') => void
  onFileSelect: (file: File) => void
  onExtract: () => void
  onCancelFile: () => void
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>
  imagePreview: string | null
  isExtracting: boolean
  extractError: string | null
  extractionStep: 'select' | 'preview' | 'processing'
}) {
  const [errors, setErrors] = useState<string[]>([])

  const validate = () => {
    const errs: string[] = []
    if (!data.title.trim()) errs.push('Bill name is required')
    setErrors(errs)
    return errs.length === 0
  }

  const handleChoice = (method: 'camera' | 'manual') => {
    if (!validate()) return
    onChooseMethod(method)
    onNext()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelect(file)
    }
  }

  const handleUploadClick = () => {
    if (!validate()) return
    fileInputRef.current?.click()
  }

  // Preview mode - show selected image
  if (extractionStep === 'preview' || extractionStep === 'processing') {
    return (
      <div className="sb2-step">
        <div className="sb2-card glass">
          <div className="sb2-field">
            <label className="sb2-label" htmlFor="billName">
              BILL NAME <span className="sb2-opt">or merchant</span>
            </label>
            <input
              id="billName"
              className="sb2-input-underline"
              type="text"
              placeholder="e.g. Dinner at Sushi House"
              value={data.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
            />
          </div>
        </div>

        <div className="sb2-image-preview-card">
          <div className="sb2-preview-header">
            <span className="sb2-preview-title">Receipt Preview</span>
            {!isExtracting && (
              <button
                className="sb2-preview-change"
                onClick={onCancelFile}
                type="button"
              >
                Change photo
              </button>
            )}
          </div>

          {imagePreview && (
            <div className="sb2-preview-image-container">
              <img
                src={imagePreview}
                alt="Receipt preview"
                className="sb2-preview-image"
              />
            </div>
          )}

          {extractError && (
            <div className="sb2-extract-error" role="alert">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{extractError}</span>
            </div>
          )}

          <div className="sb2-preview-actions">
            <button
              className="sb2-btn-secondary"
              onClick={onCancelFile}
              type="button"
              disabled={isExtracting}
            >
              Cancel
            </button>
            <button
              className="sb2-btn-primary"
              onClick={onExtract}
              type="button"
              disabled={isExtracting}
            >
              {isExtracting ? (
                <>
                  <span className="sb2-spinner" />
                  Extracting...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                  </svg>
                  Extract Items
                </>
              )}
            </button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>
    )
  }

  // Select mode - default view
  return (
    <div className="sb2-step">
      <div className="sb2-card glass">
        <div className="sb2-field">
          <label className="sb2-label" htmlFor="billName">
            BILL NAME <span className="sb2-opt">or merchant</span>
          </label>
          <input
            id="billName"
            className="sb2-input-underline"
            type="text"
            placeholder="e.g. Dinner at Sushi House"
            value={data.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            autoFocus
          />
        </div>
        {errors.length > 0 && (
          <div className="sb2-errors" role="alert">
            {errors.map((err, i) => (
              <div key={i} className="sb2-error">{err}</div>
            ))}
          </div>
        )}
      </div>

      <button
        className="sb2-upload-card"
        onClick={handleUploadClick}
        type="button"
        aria-label="Upload bill photo to auto-fill items"
      >
        <div className="sb2-upload-card-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </div>
        <div className="sb2-upload-card-body">
          <span className="sb2-option-title">Upload bill photo</span>
          <span className="sb2-option-sub">Scan a receipt to auto-fill items</span>
        </div>
      </button>

      <button
        className="sb2-manual-card"
        onClick={() => handleChoice('manual')}
        type="button"
        aria-label="Manually enter bill items and totals"
      >
        <div className="sb2-manual-card-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </div>
        <div className="sb2-upload-card-body">
          <span className="sb2-option-title">Manual input</span>
          <span className="sb2-option-sub">Type items and totals yourself</span>
        </div>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  )
}

// helpers for price formatting
function formatPrice(value: number, currencyCode: string): string {
  if (!value) return ''
  return value.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}
function parsePrice(str: string, currencyCode: string): number {
  if (!str) return 0
  const cleaned = str.replace(/\./g, '').replace(/,/g, '')
  return parseFloat(cleaned) || 0
}

// Step 2: Bill Itemization
function Step2BillItems({
  items,
  billData,
  inputMethod,
  onUpdateItems,
  onUpdateBill,
  onNext,
  onBack,
}: {
  items: BillItem[]
  billData: BillData
  inputMethod: 'camera' | 'manual'
  onUpdateItems: (items: BillItem[]) => void
  onUpdateBill: (data: Partial<BillData>) => void
  onNext: () => void
  onBack: () => void
}) {
  const [focusedPriceId, setFocusedPriceId] = useState<string | null>(null)
  const [nextError, setNextError] = useState('')
  const [priceModes, setPriceModes] = useState<Record<string, 'unit' | 'total'>>({})
  const currencySymbol = CURRENCIES.find(c => c.code === billData.currency)?.symbol || 'Rp'

  const getPriceMode = (id: string) => priceModes[id] || 'total'
  const togglePriceMode = (id: string) => {
    setPriceModes(prev => ({ ...prev, [id]: prev[id] === 'total' ? 'unit' : 'total' }))
  }
  const getDisplayPrice = (item: BillItem) => {
    const qty = item.quantity || 1
    return getPriceMode(item.id) === 'total' ? item.price * qty : item.price
  }
  const handlePriceChange = (id: string, rawVal: number) => {
    const item = items.find(i => i.id === id)
    const qty = item?.quantity || 1
    const unitPrice = getPriceMode(id) === 'total' ? (qty > 0 ? rawVal / qty : 0) : rawVal
    updateItem(id, 'price', unitPrice)
  }

  const addItem = () => {
    onUpdateItems([...items, { id: `item-${Date.now()}`, name: '', quantity: 1, price: 0, assignedTo: [] }])
  }

  const updateItem = (id: string, field: keyof BillItem, value: string | number) => {
    onUpdateItems(items.map(item => item.id === id ? { ...item, [field]: value } : item))
  }

  const removeItem = (id: string) => {
    if (items.length <= 1) return
    onUpdateItems(items.filter(item => item.id !== id))
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0)
  const serviceAmount = billData.serviceChargeType === 'percent'
    ? subtotal * (billData.serviceCharge / 100)
    : billData.serviceCharge
  const taxAmount = billData.taxType === 'percent'
    ? (subtotal + serviceAmount) * (billData.tax / 100)
    : billData.tax
  const otherAmount = billData.otherType === 'percent'
    ? (subtotal + serviceAmount + taxAmount) * (billData.other / 100)
    : billData.other
  const total = subtotal + serviceAmount + taxAmount + otherAmount

  const hasValidItems = items.some(i => i.name.trim() && i.price > 0)

  const getNextError = () => {
    if (items.length === 0 || items.every(i => !i.name.trim() && !i.price)) return 'Add at least one item to continue.'
    if (items.every(i => !i.name.trim())) return 'Each item needs a name.'
    if (items.every(i => !i.price)) return 'Enter a price for at least one item.'
    if (!items.some(i => i.name.trim() && i.price > 0)) return 'At least one item needs both a name and a price.'
    return ''
  }

  const handleNext = () => {
    if (hasValidItems) {
      setNextError('')
      onNext()
    } else {
      setNextError(getNextError())
    }
  }

  return (
    <div className="sb2-step">
      <div style={{ padding: '0 2px' }}>
        <span className="sb2-section-label">
          {inputMethod === 'camera' ? 'Scanned items — tap to edit' : 'Line items'}
        </span>
      </div>

      <div className="sb2-bill-items-list">
        {items.map((item) => {
          const qty = item.quantity || 1
          const lineTotal = item.price * qty
          return (
            <div key={item.id} className="sb2-bill-item sb2-bill-item-card">
              <div className="sb2-bill-item-row">
                <div className="sb2-bill-item-left">
                  <input
                    className="sb2-bill-item-name"
                    type="text"
                    placeholder="Item name"
                    value={item.name}
                    onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                  />
                  <div className="sb2-bill-item-qty">
                    <span>QTY:</span>
                    <input
                      className="sb2-bill-item-qty-input"
                      type="text"
                      inputMode="numeric"
                      placeholder="1"
                      value={item.quantity > 0 ? item.quantity : ''}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '')
                        updateItem(item.id, 'quantity', raw ? parseInt(raw) : 0)
                      }}
                      onBlur={() => {
                        if (!item.quantity || item.quantity < 1) updateItem(item.id, 'quantity', 1)
                      }}
                    />
                  </div>
                </div>

                <div className="sb2-bill-item-right">
                  <div className="sb2-bill-item-price">
                    <span className="sb2-bill-item-price-sym">{currencySymbol}</span>
                    <input
                      className="sb2-bill-item-price-input"
                      type="text"
                      inputMode="decimal"
                      placeholder={getPriceMode(item.id) === 'total' ? '0 total' : '0 / item'}
                      value={focusedPriceId === item.id
                        ? (getDisplayPrice(item) || '')
                        : formatPrice(getDisplayPrice(item), billData.currency)}
                      onChange={(e) => handlePriceChange(item.id, parsePrice(e.target.value, billData.currency))}
                      onFocus={() => setFocusedPriceId(item.id)}
                      onBlur={() => setFocusedPriceId(null)}
                    />
                  </div>
                  <div className="sb2-price-mode-toggle">
                    <button
                      type="button"
                      className={getPriceMode(item.id) === 'unit' ? 'active' : ''}
                      onClick={() => { if (getPriceMode(item.id) !== 'unit') togglePriceMode(item.id) }}
                    >/ item</button>
                    <button
                      type="button"
                      className={getPriceMode(item.id) === 'total' ? 'active' : ''}
                      onClick={() => { if (getPriceMode(item.id) !== 'total') togglePriceMode(item.id) }}
                    >total</button>
                  </div>
                </div>

                {items.length > 1 && (
                  <button className="sb2-bill-item-remove" onClick={() => removeItem(item.id)} type="button" aria-label="Remove item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {item.lineTotal && item.lineTotal > 0 && item.lineTotal !== lineTotal && (
                <div className="sb2-item-price-line-total">
                  Line total: {currencySymbol} {formatPrice(item.lineTotal, billData.currency)}
                </div>
              )}

              {/* Footer: price per item · subtotal */}
              {item.price > 0 && qty > 1 && (
                <div className="sb2-item-price-footer">
                  <span className="sb2-item-price-unit">
                    {currencySymbol} {formatPrice(item.price, billData.currency)} <strong>per item</strong>
                  </span>
                  <span className="sb2-item-price-subtotal">
                    × {qty} = {currencySymbol} {formatPrice(lineTotal, billData.currency)}
                  </span>
                </div>
              )}
            </div>
          )
        })}

        <button className="sb2-add-item-dashed" onClick={addItem} type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="17" height="17">
            <circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" />
          </svg>
          ADD ITEM
        </button>
      </div>

      <div className="sb2-totals-card">
        {/* Tax row */}
        <div className="sb2-totals-row">
          <label className="sb2-totals-label">Tax</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="sb2-type-toggle">
              <button
                type="button"
                className={billData.taxType === 'percent' ? 'active' : ''}
                onClick={() => onUpdateBill({ taxType: 'percent' })}
              >%</button>
              <button
                type="button"
                className={billData.taxType === 'amount' ? 'active' : ''}
                onClick={() => onUpdateBill({ taxType: 'amount' })}
              >{currencySymbol}</button>
            </div>
            <div className="sb2-totals-input-wrap">
              <input
                className="sb2-totals-input"
                type="number"
                min="0"
                step={billData.taxType === 'percent' ? '0.1' : '1000'}
                placeholder="0"
                value={billData.tax || ''}
                onChange={(e) => onUpdateBill({ tax: parseFloat(e.target.value) || 0 })}
              />
              <span className="sb2-totals-sym">{billData.taxType === 'percent' ? '%' : currencySymbol}</span>
            </div>
          </div>
        </div>

        {/* Service charge row */}
        <div className="sb2-totals-row">
          <label className="sb2-totals-label">Service Charge</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="sb2-type-toggle">
              <button
                type="button"
                className={billData.serviceChargeType === 'percent' ? 'active' : ''}
                onClick={() => onUpdateBill({ serviceChargeType: 'percent' })}
              >%</button>
              <button
                type="button"
                className={billData.serviceChargeType === 'amount' ? 'active' : ''}
                onClick={() => onUpdateBill({ serviceChargeType: 'amount' })}
              >{currencySymbol}</button>
            </div>
            <div className="sb2-totals-input-wrap">
              <input
                className="sb2-totals-input"
                type="number"
                min="0"
                step={billData.serviceChargeType === 'percent' ? '0.1' : '1000'}
                placeholder="0"
                value={billData.serviceCharge || ''}
                onChange={(e) => onUpdateBill({ serviceCharge: parseFloat(e.target.value) || 0 })}
              />
              <span className="sb2-totals-sym">{billData.serviceChargeType === 'percent' ? '%' : currencySymbol}</span>
            </div>
          </div>
        </div>

        {/* Other row */}
        <div className="sb2-totals-row">
          <label className="sb2-totals-label">Other</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="sb2-type-toggle">
              <button
                type="button"
                className={billData.otherType === 'percent' ? 'active' : ''}
                onClick={() => onUpdateBill({ otherType: 'percent' })}
              >%</button>
              <button
                type="button"
                className={billData.otherType === 'amount' ? 'active' : ''}
                onClick={() => onUpdateBill({ otherType: 'amount' })}
              >{currencySymbol}</button>
            </div>
            <div className="sb2-totals-input-wrap">
              <input
                className="sb2-totals-input"
                type="number"
                min="0"
                step={billData.otherType === 'percent' ? '0.1' : '1000'}
                placeholder="0"
                value={billData.other || ''}
                onChange={(e) => onUpdateBill({ other: parseFloat(e.target.value) || 0 })}
              />
              <span className="sb2-totals-sym">{billData.otherType === 'percent' ? '%' : currencySymbol}</span>
            </div>
          </div>
        </div>

        <div className="sb2-totals-divider" />
        <div className="sb2-total-amount-row">
          <span className="sb2-totals-label">Total Amount</span>
          <span className="sb2-total-amount">{formatCurrency(total, billData.currency)}</span>
        </div>
      </div>

      {nextError && (
        <p style={{ fontSize: '12px', color: 'var(--sb2-error)', textAlign: 'center', margin: '0' }}>
          {nextError}
        </p>
      )}
      <div className="sb2-actions">
        <button className="sb2-btn-secondary" onClick={onBack} type="button">Back</button>
        <button
          className="sb2-btn-primary"
          onClick={handleNext}
          type="button"
          style={!hasValidItems ? { opacity: 0.5 } : undefined}
        >
          Next
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// Step 3: People
function Step2People({
  participants,
  onUpdate,
  paymentInfo,
  onUpdatePayment,
  onNext,
  onBack,
}: {
  participants: Participant[]
  onUpdate: (participants: Participant[]) => void
  paymentInfo: PaymentInfo
  onUpdatePayment: (info: Partial<PaymentInfo>) => void
  onNext: () => void
  onBack: () => void
}) {
  const [nextError, setNextError] = useState('')
  const [showPayment, setShowPayment] = useState(
    !!(paymentInfo.payerId || paymentInfo.bankName || paymentInfo.accountNumber)
  )

  const addPerson = () => {
    const color = ACCENT_COLORS[participants.length % ACCENT_COLORS.length]
    const id = `p-${Date.now()}`
    onUpdate([...participants, { id, name: '', initial: '?', color }])
  }

  const updateName = (id: string, name: string) => {
    onUpdate(participants.map(p => p.id === id
      ? { ...p, name, initial: name.trim().charAt(0).toUpperCase() || '?' }
      : p
    ))
  }

  const removePerson = (id: string) => {
    onUpdate(participants.filter(p => p.id !== id))
  }

  const hasValidPeople = participants.some(p => p.name.trim())

  const handleNext = () => {
    if (hasValidPeople) {
      setNextError('')
      onNext()
    } else {
      setNextError('Add at least one person with a name to continue.')
    }
  }

  return (
    <div className="sb2-step">
      <div style={{ padding: '0 2px' }}>
        <span className="sb2-section-label">Participants ({participants.length})</span>
        <p style={{ fontSize: '13px', color: 'var(--ink-3)', margin: '6px 0 0', lineHeight: 1.5 }}>
          Add everyone splitting this bill. Tap a name to edit it.
        </p>
      </div>

      <div className="sb2-bill-items-list">
        {participants.map((p) => (
          <div key={p.id} className="sb2-bill-item">
            <div className="sb2-person-avatar" style={{ background: p.color, flexShrink: 0 }}>
              {p.initial}
            </div>
            <div className="sb2-bill-item-body">
              <input
                className="sb2-bill-item-name"
                type="text"
                placeholder={p.isHost ? 'Your name' : 'Name'}
                value={p.name}
                onChange={(e) => updateName(p.id, e.target.value)}
                autoFocus={!p.name && !p.isHost}
              />
              {p.isHost && (
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--sb2-primary)',
                }}>You</span>
              )}
            </div>
            {!p.isHost && (
              <button
                className="sb2-bill-item-remove"
                onClick={() => removePerson(p.id)}
                type="button"
                aria-label={`Remove ${p.name}`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}

        <button className="sb2-add-item-dashed" onClick={addPerson} type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="17" height="17">
            <circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" />
          </svg>
          ADD PERSON
        </button>
      </div>

      {/* Optional payment details */}
      <button
        type="button"
        className="sb2-payment-toggle"
        onClick={() => setShowPayment(v => !v)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" width="15" height="15">
          <rect x="2" y="5" width="20" height="14" rx="2"/>
          <path d="M2 10h20"/>
        </svg>
        Payment details
        <svg
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"
          style={{ marginLeft: 'auto', transform: showPayment ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {showPayment && (
        <div className="sb2-payment-panel">
          <div className="sb2-field">
            <label className="sb2-label">Who paid upfront? <span className="sb2-opt">optional</span></label>
            <div className="sb2-payer-chips">
              <button
                type="button"
                className={`sb2-payer-chip${!paymentInfo.payerId ? ' on' : ''}`}
                onClick={() => onUpdatePayment({ payerId: '' })}
              >
                No one
              </button>
              {participants.filter(p => p.name.trim()).map(p => (
                <button
                  key={p.id}
                  type="button"
                  className={`sb2-payer-chip${paymentInfo.payerId === p.id ? ' on' : ''}`}
                  onClick={() => onUpdatePayment({ payerId: p.id })}
                >
                  <div className="sb2-assign-chip-av" style={{ background: p.color, width: '22px', height: '22px', fontSize: '10px' }}>
                    {p.initial}
                  </div>
                  {p.name}
                </button>
              ))}
            </div>
          </div>
          <div className="sb2-field">
            <label className="sb2-label">Bank name <span className="sb2-opt">optional</span></label>
            <input
              className="sb2-input"
              type="text"
              placeholder="e.g. BCA, Mandiri, GoPay"
              value={paymentInfo.bankName}
              onChange={e => onUpdatePayment({ bankName: e.target.value })}
            />
          </div>
          <div className="sb2-field">
            <label className="sb2-label">Account number <span className="sb2-opt">optional</span></label>
            <input
              className="sb2-input"
              type="text"
              inputMode="numeric"
              placeholder="e.g. 1234567890"
              value={paymentInfo.accountNumber}
              onChange={e => onUpdatePayment({ accountNumber: e.target.value })}
            />
          </div>
        </div>
      )}

      {nextError && (
        <p style={{ fontSize: '12px', color: 'var(--sb2-error)', textAlign: 'center', margin: '0' }}>
          {nextError}
        </p>
      )}
      <div className="sb2-actions">
        <button className="sb2-btn-secondary" onClick={onBack} type="button">Back</button>
        <button
          className="sb2-btn-primary"
          onClick={handleNext}
          type="button"
          style={!hasValidPeople ? { opacity: 0.5 } : undefined}
        >
          Next
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// Step 3: Split Method
function Step3Method({
  method,
  onUpdate,
  onNext,
  onBack,
}: {
  method: string
  onUpdate: (method: 'equal' | 'custom' | 'percentage' | 'itemized') => void
  onNext: () => void
  onBack: () => void
}) {
  const methods: { id: 'equal' | 'custom' | 'percentage' | 'itemized'; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: 'equal',
      label: 'Split equally',
      desc: 'Split evenly among everyone',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M8 12h8" /></svg>,
    },
    {
      id: 'percentage',
      label: 'By percentage',
      desc: 'Split by percentage shares',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M19 5 5 19" /><circle cx="7.5" cy="7.5" r="2.5" /><circle cx="16.5" cy="16.5" r="2.5" /></svg>,
    },
    {
      id: 'itemized',
      label: 'By item',
      desc: 'Assign specific items to people',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" /><path d="M9 8h6M9 12h6" /></svg>,
    },
    {
      id: 'custom',
      label: 'Custom amounts',
      desc: "Enter each person's share manually",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 7h16M4 12h10M4 17h7" /></svg>,
    },
  ]

  return (
    <div className="sb2-step">
      <div className="sb2-methods">
        {methods.map((m) => (
          <button
            key={m.id}
            className={`sb2-method ${method === m.id ? 'active' : ''}`}
            data-method={m.id}
            onClick={() => onUpdate(m.id)}
            type="button"
          >
            <div className="sb2-method-icon" aria-hidden="true">{m.icon}</div>
            <div className="sb2-method-content">
              <span className="sb2-method-label">{m.label}</span>
              <span className="sb2-method-desc">{m.desc}</span>
            </div>
            {method === m.id && (
              <svg className="sb2-method-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            )}
          </button>
        ))}
      </div>

      <div className="sb2-actions">
        <button className="sb2-btn-secondary" onClick={onBack} type="button">Back</button>
        <button className="sb2-btn-primary" onClick={onNext} type="button">
          Next
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// Step 4: Items
function Step4Items({
  items,
  participants,
  onUpdate,
  onNext,
  onBack,
}: {
  items: BillItem[]
  participants: Participant[]
  onUpdate: (items: BillItem[]) => void
  onNext: () => void
  onBack: () => void
}) {
  const addItem = () => {
    const id = `item-${Date.now()}`
    onUpdate([...items, { id, name: '', quantity: 1, price: 0, assignedTo: [] }])
  }

  const updateItem = (id: string, field: keyof BillItem, value: string | number | string[]) => {
    onUpdate(items.map(item => item.id === id ? { ...item, [field]: value } : item))
  }

  const removeItem = (id: string) => {
    onUpdate(items.filter(item => item.id !== id))
  }

  const toggleAssignee = (itemId: string, participantId: string) => {
    const item = items.find(i => i.id === itemId)
    if (!item) return
    const assignedTo = item.assignedTo.includes(participantId)
      ? item.assignedTo.filter(id => id !== participantId)
      : [...item.assignedTo, participantId]
    updateItem(itemId, 'assignedTo', assignedTo)
  }

  return (
    <div className="sb2-step">
      <div className="sb2-items-list">
        {items.map((item) => (
          <div key={item.id} className="sb2-card glass sb2-item-card">
            <div className="sb2-item-header">
              <input
                className="sb2-input"
                type="text"
                placeholder="Item name"
                value={item.name}
                onChange={(e) => updateItem(item.id, 'name', e.target.value)}
              />
              <button className="sb2-item-remove" onClick={() => removeItem(item.id)} type="button" aria-label="Remove item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="sb2-item-row">
              <div className="sb2-item-qty">
                <label>Qty</label>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="sb2-item-price">
                <label>Price</label>
                <input
                  className="sb2-input"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  value={item.price || ''}
                  onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            {participants.length > 0 && (
              <div className="sb2-item-assignees">
                <span className="sb2-label-small">Who shared this?</span>
                <div className="sb2-assignee-list">
                  {participants.map((p) => (
                    <button
                      key={p.id}
                      className={`sb2-assignee ${item.assignedTo.includes(p.id) ? 'active' : ''}`}
                      onClick={() => toggleAssignee(item.id, p.id)}
                      type="button"
                      title={p.name}
                      aria-label={`${item.assignedTo.includes(p.id) ? 'Remove' : 'Add'} ${p.name}`}
                    >
                      <div className="sb2-assignee-avatar" style={{ background: p.color }}>
                        {p.initial}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button className="sb2-pill sb2-add-item" onClick={addItem} type="button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Add item
      </button>

      <div className="sb2-actions">
        <button className="sb2-btn-secondary" onClick={onBack} type="button">Back</button>
        <button className="sb2-btn-primary" onClick={onNext} disabled={items.length === 0} type="button">
          Summary
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// Step 4: Assign Items
function Step4Assign({
  items,
  participants,
  billData,
  onUpdateItems,
  onNext,
  onBack,
}: {
  items: BillItem[]
  participants: Participant[]
  billData: BillData
  onUpdateItems: (items: BillItem[]) => void
  onNext: () => void
  onBack: () => void
}) {
  const [nextError, setNextError] = useState('')
  const [expandedQty, setExpandedQty] = useState<Set<string>>(new Set())
  const currencySymbol = CURRENCIES.find(c => c.code === billData.currency)?.symbol || 'Rp'

  const toggleAssign = (itemId: string, personId: string) => {
    onUpdateItems(items.map(item => {
      if (item.id !== itemId) return item
      const isOn = item.assignedTo.includes(personId)
      const newAssignedTo = isOn
        ? item.assignedTo.filter(id => id !== personId)
        : [...item.assignedTo, personId]
      // Remove that person's custom qty entry; reset if now only 1 person
      const newQty = item.assignedQty
        ? Object.fromEntries(Object.entries(item.assignedQty).filter(([id]) => newAssignedTo.includes(id)))
        : undefined
      return { ...item, assignedTo: newAssignedTo, assignedQty: Object.keys(newQty || {}).length ? newQty : undefined }
    }))
  }

  const setPersonQty = (itemId: string, personId: string, qty: number) => {
    onUpdateItems(items.map(item => {
      if (item.id !== itemId) return item
      const n = item.assignedTo.length
      const defQty = Math.floor((item.quantity || 1) / n)
      // Seed all assigned people with default if not yet set
      const base: Record<string, number> = Object.fromEntries(
        item.assignedTo.map(id => [id, item.assignedQty?.[id] ?? defQty])
      )
      return { ...item, assignedQty: { ...base, [personId]: Math.max(0, qty) } }
    }))
  }

  const getPersonQty = (item: BillItem, personId: string): number => {
    if (item.assignedQty?.[personId] !== undefined) return item.assignedQty[personId]
    const n = item.assignedTo.length
    return n > 0 ? Math.floor((item.quantity || 1) / n) : 0
  }

  const validItems = items.filter(i => i.name.trim() && i.price > 0)
  const allAssigned = validItems.length > 0 && validItems.every(i => i.assignedTo.length > 0)

  const handleNext = () => {
    if (validItems.length === 0) { setNextError('No items to assign.'); return }
    if (!allAssigned) { setNextError('Assign each item to at least one person.'); return }
    setNextError('')
    onNext()
  }

  return (
    <div className="sb2-step">
      <div style={{ padding: '0 2px' }}>
        <span className="sb2-section-label">Assign items to people</span>
        <p style={{ fontSize: '13px', color: 'var(--ink-3)', margin: '6px 0 0', lineHeight: 1.5 }}>
          Tap a person to assign them. Shared items split equally by default.
        </p>
      </div>

      <div className="sb2-bill-items-list">
        {validItems.map(item => {
          const qty = item.quantity || 1
          const total = item.price * qty
          const count = item.assignedTo.length
          const isUnassigned = count === 0
          const isExpanded = expandedQty.has(item.id)
          const showAdjust = qty > count && count >= 2

          // Compute per-person amounts for footer
          const perPersonTotal = count > 0
            ? item.assignedTo.reduce((s, id) => s + getPersonQty(item, id), 0)
            : 0
          const perPersonEqual = count > 0 ? item.price * (qty / count) : 0
          const hasCustomQty = !!item.assignedQty && Object.keys(item.assignedQty).length > 0

          return (
            <div key={item.id} className={`sb2-assign-card${isUnassigned ? ' unassigned' : ''}`}>
              <div className="sb2-assign-header">
                <span>
                  <span className="sb2-assign-item-name">{item.name}</span>
                  {qty > 1 && <span className="sb2-assign-qty">× {qty}</span>}
                </span>
                <span className="sb2-assign-price">
                  {currencySymbol} {formatPrice(total, billData.currency)}
                </span>
              </div>

              <div className="sb2-assign-people">
                {participants.map(p => {
                  const isOn = item.assignedTo.includes(p.id)
                  return (
                    <button
                      key={p.id}
                      className={`sb2-assign-chip${isOn ? ' on' : ''}`}
                      onClick={() => toggleAssign(item.id, p.id)}
                      type="button"
                    >
                      <div className="sb2-assign-chip-av" style={{ background: p.color }}>
                        {p.initial}
                      </div>
                      {p.name || 'Person'}
                    </button>
                  )
                })}
              </div>

              {/* Qty adjuster — only when qty>1 and someone assigned */}
              {showAdjust && isExpanded && (
                <div className="sb2-qty-adjust">
                  {item.assignedTo.map(id => {
                    const p = participants.find(x => x.id === id)
                    if (!p) return null
                    const pQty = getPersonQty(item, id)
                    return (
                      <div key={id} className="sb2-qty-row">
                        <div className="sb2-assign-chip-av" style={{ background: p.color, width: '22px', height: '22px', fontSize: '10px' }}>
                          {p.initial}
                        </div>
                        <span className="sb2-qty-name">{p.name || 'Person'}</span>
                        <div className="sb2-qty-controls">
                          <button type="button" className="sb2-qty-step" onClick={() => setPersonQty(item.id, id, pQty - 1)} disabled={pQty <= 0}>−</button>
                          <span className="sb2-qty-val">{pQty}</span>
                          <button type="button" className="sb2-qty-step" onClick={() => setPersonQty(item.id, id, pQty + 1)}>+</button>
                        </div>
                        <span className="sb2-qty-amt">
                          {currencySymbol} {formatPrice(item.price * pQty, billData.currency)}
                        </span>
                      </div>
                    )
                  })}
                  <div className="sb2-qty-sum">
                    <span>Total assigned</span>
                    <span className={perPersonTotal === qty ? 'ok' : 'warn'}>
                      {perPersonTotal} / {qty}
                      {perPersonTotal !== qty && ` (${perPersonTotal < qty ? qty - perPersonTotal + ' unassigned' : perPersonTotal - qty + ' over'})`}
                    </span>
                  </div>
                </div>
              )}

              <div className="sb2-assign-footer">
                {isUnassigned ? (
                  <span className="sb2-assign-warning">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>
                      <path d="M12 9v4M12 17h.01"/>
                    </svg>
                    Not assigned
                  </span>
                ) : (
                  <span className="sb2-assign-each">
                    {hasCustomQty ? 'Custom split' : `${currencySymbol} ${formatPrice(perPersonEqual, billData.currency)} each`}
                  </span>
                )}
                {showAdjust ? (
                  <button
                    type="button"
                    className={`sb2-adjust-toggle-btn${isExpanded ? ' active' : ''}`}
                    onClick={() => setExpandedQty(prev => {
                      const next = new Set(prev)
                      next.has(item.id) ? next.delete(item.id) : next.add(item.id)
                      return next
                    })}
                  >
                    {isExpanded ? 'Done' : 'Adjust'}
                  </button>
                ) : (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--ink-3)' }}>
                    {count > 0 ? `${count} ${count === 1 ? 'person' : 'people'}` : ''}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {nextError && (
        <p style={{ fontSize: '12px', color: 'var(--sb2-error)', textAlign: 'center', margin: '0' }}>
          {nextError}
        </p>
      )}
      <div className="sb2-actions">
        <button className="sb2-btn-secondary" onClick={onBack} type="button">Back</button>
        <button
          className="sb2-btn-primary"
          onClick={handleNext}
          type="button"
          style={!allAssigned ? { opacity: 0.5 } : undefined}
        >
          Next
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// Step 5: Summary
function Step5Summary({
  billData,
  participants,
  method,
  items,
  paymentInfo,
  onBack,
  onReset,
}: {
  billData: BillData
  participants: Participant[]
  method: string
  items: BillItem[]
  paymentInfo: PaymentInfo
  onBack: () => void
  onReset: () => void
}) {
  const subtotal = items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0)
  const serviceAmount = billData.serviceChargeType === 'percent' ? subtotal * (billData.serviceCharge / 100) : billData.serviceCharge
  const taxAmount = billData.taxType === 'percent' ? (subtotal + serviceAmount) * (billData.tax / 100) : billData.tax
  const otherAmount = billData.otherType === 'percent' ? (subtotal + serviceAmount + taxAmount) * (billData.other / 100) : billData.other
  const total = Math.max(0, subtotal + taxAmount + serviceAmount + otherAmount - billData.discount)

  const getShares = () => {
    if (participants.length === 0) return []

    // Per-person item subtotal from assignments
    const personItemTotals = new Map<string, number>()
    participants.forEach(p => personItemTotals.set(p.id, 0))

    let assignedSubtotal = 0
    items.forEach(item => {
      const itemTotal = item.price * (item.quantity || 1)
      const who = item.assignedTo.filter(id => participants.find(p => p.id === id))
      if (who.length === 0) return // will split unassigned equally below
      const share = itemTotal / who.length
      who.forEach(id => personItemTotals.set(id, (personItemTotals.get(id) || 0) + share))
      assignedSubtotal += itemTotal
    })

    // Unassigned items split equally
    const unassignedTotal = subtotal - assignedSubtotal
    if (unassignedTotal > 0) {
      const equalShare = unassignedTotal / participants.length
      participants.forEach(p => personItemTotals.set(p.id, (personItemTotals.get(p.id) || 0) + equalShare))
    }

    // Distribute adjustments proportionally
    const adjustments = taxAmount + serviceAmount + otherAmount
    return participants.map(p => {
      const myItems = personItemTotals.get(p.id) || 0
      const proportion = subtotal > 0 ? myItems / subtotal : 1 / participants.length
      return { participant: p, amount: myItems + adjustments * proportion }
    })
  }

  const summaryRef = useRef<HTMLDivElement>(null)
  const [saving, setSaving] = useState(false)

  const captureCanvas = async () => {
    const html2canvas = (await import('html2canvas')).default
    return html2canvas(summaryRef.current!, { backgroundColor: null, scale: 2, useCORS: true, logging: false })
  }

  const saveImage = async () => {
    if (!summaryRef.current || saving) return
    setSaving(true)
    try {
      const canvas = await captureCanvas()
      const link = document.createElement('a')
      link.download = `${(billData.title || 'split-bill').toLowerCase().replace(/\s+/g, '-')}-summary.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } finally { setSaving(false) }
  }

  const handleShare = async () => {
    if (saving) return
    // Detect if Web Share API with file support is available (mobile browsers)
    const canShareFile = typeof navigator.share === 'function' &&
      typeof navigator.canShare === 'function' &&
      navigator.canShare({ files: [new File([''], 'test.png', { type: 'image/png' })] })

    if (canShareFile && summaryRef.current) {
      setSaving(true)
      try {
        const canvas = await captureCanvas()
        canvas.toBlob(async (blob) => {
          if (!blob) return
          const file = new File([blob], `${(billData.title || 'split-bill').toLowerCase().replace(/\s+/g, '-')}-summary.png`, { type: 'image/png' })
          try {
            await navigator.share({ title: billData.title || 'Split Bill Summary', text: summaryText, files: [file] })
          } catch { /* user cancelled */ }
        }, 'image/png')
      } finally { setSaving(false) }
    } else {
      // Desktop fallback: copy text
      navigator.clipboard?.writeText(summaryText)
    }
  }

  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b)
  const portionLabel = (myQty: number, totalQty: number, count: number): string => {
    if (myQty === 0) return ''
    if (totalQty === 1 && count === 1) return ''  // 1 item, 1 person — no label
    // Custom integer qty
    if (Number.isInteger(myQty)) {
      if (myQty === totalQty) return totalQty > 1 ? `(${totalQty})` : ''
      return `(${myQty})`
    }
    // Equal fractional split
    const g = gcd(totalQty, count)
    const num = totalQty / g, den = count / g
    return den === 1 ? `(${num})` : `(${num}/${den})`
  }

  // Build per-person detailed breakdown
  const personBreakdowns = participants.map(p => {
    const myItems = items
      .filter(item => item.assignedTo.includes(p.id))
      .map(item => {
        const totalQty = item.quantity || 1
        const n = item.assignedTo.length
        // Use custom qty if set, otherwise equal share
        const myQty = item.assignedQty?.[p.id] !== undefined
          ? item.assignedQty[p.id]
          : totalQty / n
        const share = item.price * myQty
        return { name: item.name, myQty, totalQty, count: n, share }
      })
    const mySubtotal = myItems.reduce((s, i) => s + i.share, 0)
    const proportion = subtotal > 0 ? mySubtotal / subtotal : 1 / participants.length
    const myCharges = (taxAmount + serviceAmount + otherAmount) * proportion
    return { participant: p, myItems, mySubtotal, myCharges, total: mySubtotal + myCharges }
  })

  const summaryText = [
    billData.title || 'Split Bill',
    '',
    ...personBreakdowns.map(b => `${b.participant.name}: ${formatCurrency(b.total, billData.currency)}`),
    '',
    `Grand Total: ${formatCurrency(total, billData.currency)}`,
    'Split with A Curious Note · acuriousnote.com',
  ].join('\n')

  const chargeNote = [
    billData.tax > 0 ? `${billData.tax}${billData.taxType === 'percent' ? '%' : ''} Tax` : '',
    billData.serviceCharge > 0 ? 'Service' : '',
    billData.other > 0 ? 'Other' : '',
  ].filter(Boolean).join(' · ')


  return (
    <div className="sb2-step">

      {/* Capturable summary area */}
      <div ref={summaryRef} className="sb2-capture-area">

      {/* Branded header inside screenshot */}
      <div className="sb2-capture-header">
        <div className="sb2-capture-brand">
          <span className="mark" style={{ width: '14px', height: '14px' }} />
          <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '13px', fontWeight: 600 }}>Split Bill</span>
        </div>
        <div className="sb2-capture-title">
          <span className="sb2-capture-bill-name">{billData.title || 'Split Bill'}</span>
          <span className="sb2-capture-label">Summary</span>
        </div>
      </div>

      {/* Per-person cards */}
      {personBreakdowns.map(({ participant, myItems, mySubtotal, myCharges, total: personTotal }, i) => (
        <div key={participant.id} className="sb2-person-card">
          <div className="sb2-person-card-header">
            <div className="sb2-person-card-avatar" style={{ background: participant.color }}>
              {participant.initial}
            </div>
            <div>
              <p className="sb2-person-card-name">{participant.name || 'Person'}</p>
              <span className="sb2-person-card-role">
                {paymentInfo.payerId
                  ? participant.id === paymentInfo.payerId ? 'Primary Payer' : 'Participant'
                  : i === 0 && participant.isHost ? 'Primary Payer' : 'Participant'}
              </span>
            </div>
          </div>

          {myItems.length > 0 && (
            <div className="sb2-person-items">
              {myItems.map((item, j) => (
                <div key={j} className="sb2-person-item-row">
                  <span className="sb2-person-item-name">
                    {item.name}
                    {portionLabel(item.myQty, item.totalQty, item.count) && (
                      <span style={{ opacity: 0.5, fontSize: '12px', marginLeft: '4px' }}>
                        {portionLabel(item.myQty, item.totalQty, item.count)}
                      </span>
                    )}
                  </span>
                  <span className="sb2-person-item-amount">{formatCurrency(item.share, billData.currency)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="sb2-person-card-divider" />

          <div className="sb2-person-totals">
            <div className="sb2-person-subtotal-row">
              <span>Subtotal</span>
              <span>{formatCurrency(mySubtotal, billData.currency)}</span>
            </div>
            {myCharges > 0 && (
              <div className="sb2-person-subtotal-row">
                <span>Tax & Charges Share</span>
                <span>{formatCurrency(myCharges, billData.currency)}</span>
              </div>
            )}
            <div className="sb2-person-due-row">
              <span className="sb2-person-due-label">Total Due</span>
              <span className="sb2-person-due-amount">{formatCurrency(personTotal, billData.currency)}</span>
            </div>
          </div>
        </div>
      ))}

      {/* Grand total */}
      <div className="sb2-grand-total-card">
        <span className="sb2-grand-total-label">Grand Total Settlement</span>
        <span className="sb2-grand-total-amount">{formatCurrency(total, billData.currency)}</span>
        {chargeNote && <p className="sb2-grand-total-note">Incl. {chargeNote}</p>}
      </div>

      {/* Actions */}
      {/* Payment info card — only if payer or bank info is set */}
      {(paymentInfo.payerId || paymentInfo.bankName || paymentInfo.accountNumber) && (() => {
        const payer = participants.find(p => p.id === paymentInfo.payerId)
        return (
          <div className="sb2-payment-info-card">
            <div className="sb2-payment-info-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" width="16" height="16">
                <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>
              </svg>
              <span>Send payment to</span>
            </div>
            {payer && (
              <div className="sb2-payment-payer">
                <div className="sb2-assign-chip-av" style={{ background: payer.color, width: '28px', height: '28px', fontSize: '12px' }}>
                  {payer.initial}
                </div>
                <span className="sb2-payment-payer-name">{payer.name}</span>
              </div>
            )}
            {(paymentInfo.bankName || paymentInfo.accountNumber) && (
              <div className="sb2-payment-detail">
                {paymentInfo.bankName && <span className="sb2-payment-bank">{paymentInfo.bankName}</span>}
                {paymentInfo.accountNumber && <span className="sb2-payment-account">{paymentInfo.accountNumber}</span>}
              </div>
            )}
          </div>
        )
      })()}

      {/* Branded footer inside screenshot */}
      <div className="sb2-capture-footer">
        Split with A Curious Note · <strong>acuriousnote.com</strong>
      </div>

      </div>{/* end capture area */}

      <div className="sb2-summary-actions">
        <button className="sb2-btn-primary" onClick={handleShare} disabled={saving} type="button">
          {saving ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" style={{ animation: 'spin 1s linear infinite' }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              Processing…
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>
              </svg>
              Share Summary
            </>
          )}
        </button>
        <button className="sb2-pill" onClick={saveImage} disabled={saving} type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" width="16" height="16">
            <path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/>
          </svg>
          Save Image
        </button>
        <button className="sb2-pill sb2-reset-btn" onClick={onReset} type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" width="16" height="16">
            <path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 4v4h4"/>
          </svg>
          Start over
        </button>
      </div>

      <div className="sb2-actions">
        <button className="sb2-btn-secondary" onClick={onBack} type="button">Back</button>
      </div>
    </div>
  )
}

// Palette definitions
const PALETTES = [
  { id: 'rose',   label: 'Rose',   p1: '#d96b8a', p2: '#a07ab5', r: 217, g: 107, b: 138 },
  { id: 'ocean',  label: 'Ocean',  p1: '#6f9bd1', p2: '#6ba39a', r: 111, g: 155, b: 209 },
  { id: 'amber',  label: 'Amber',  p1: '#c08a64', p2: '#d96b8a', r: 192, g: 138, b: 100 },
  { id: 'violet', label: 'Violet', p1: '#a07ab5', p2: '#6f9bd1', r: 160, g: 122, b: 181 },
  { id: 'teal',   label: 'Teal',   p1: '#6ba39a', p2: '#4a8f9a', r: 107, g: 163, b: 154 },
  { id: 'coral',  label: 'Coral',  p1: '#e07878', p2: '#c08a64', r: 224, g: 120, b: 120 },
]

function PaletteSwitcher({ activePalette, onChange }: { activePalette: string; onChange: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="sb2-palette-switcher">
      {open && (
        <div className="sb2-palette-panel">
          {PALETTES.map(p => (
            <button
              key={p.id}
              className={`sb2-swatch${activePalette === p.id ? ' active' : ''}`}
              style={{ background: `linear-gradient(135deg, ${p.p1}, ${p.p2})` }}
              title={p.label}
              onClick={() => { onChange(p.id); setOpen(false) }}
              type="button"
              aria-label={`${p.label} palette`}
            />
          ))}
        </div>
      )}
      <button
        className="sb2-palette-btn"
        onClick={() => setOpen(o => !o)}
        type="button"
        aria-label="Change colour palette"
        title="Change colour palette"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
          <path d="M12 2v8"/>
          <rect x="8" y="10" width="8" height="2.5" rx="1"/>
          <rect x="3.5" y="12.5" width="17" height="7" rx="2"/>
        </svg>
      </button>
    </div>
  )
}

// Main Page Component
export default function SplitBill2Page() {
  const [step, setStep] = useState(1)
  const totalSteps = 5
  const [paletteId, setPaletteId] = useState('rose')

  const applyPalette = useCallback((id: string) => {
    const p = PALETTES.find(x => x.id === id) || PALETTES[0]
    const r = document.documentElement
    r.style.setProperty('--sb2-pal-1', p.p1)
    r.style.setProperty('--sb2-pal-2', p.p2)
    r.style.setProperty('--video-r', String(p.r))
    r.style.setProperty('--video-g', String(p.g))
    r.style.setProperty('--video-b', String(p.b))
    setPaletteId(id)
  }, [])

  const [billData, setBillData] = useState<BillData>({
    title: '',
    subtotal: 0,
    tax: 11,
    taxType: 'percent',
    tip: 0,
    serviceCharge: 0,
    serviceChargeType: 'amount',
    other: 0,
    otherType: 'amount',
    discount: 0,
    currency: 'IDR',
  })

  const [participants, setParticipants] = useState<Participant[]>([
    { id: 'host', name: 'Me', initial: 'M', color: ACCENT_COLORS[0], isHost: true },
  ])

  const [method, setMethod] = useState<'equal' | 'custom' | 'percentage' | 'itemized'>('equal')
  const [items, setItems] = useState<BillItem[]>([])
  const [inputMethod, setInputMethod] = useState<'camera' | 'manual'>('manual')
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({ payerId: '', bankName: '', accountNumber: '' })

  // File upload and extraction states
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractError, setExtractError] = useState<string | null>(null)
  const [extractionStep, setExtractionStep] = useState<'select' | 'preview' | 'processing'>('select')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }) }, [step])

  const goNext = useCallback(() => setStep(s => Math.min(s + 1, totalSteps)), [totalSteps])
  const goBack = useCallback(() => setStep(s => Math.max(s - 1, 1)), [])

  const handleChooseMethod = useCallback((m: 'camera' | 'manual') => {
    setInputMethod(m)
    if (m === 'camera') {
      const id = () => `item-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`
      setItems([
        { id: id(), name: 'Sushi Platter', quantity: 1, price: 240000, assignedTo: [] },
        { id: id(), name: 'Edamame & Drinks', quantity: 1, price: 160000, assignedTo: [] },
        { id: id(), name: 'Mochi Dessert', quantity: 2, price: 45000, assignedTo: [] },
      ])
      setBillData(prev => ({ ...prev, tax: 11, taxType: 'percent' as const, serviceCharge: 30000, serviceChargeType: 'amount' as const }))
    } else {
      setItems([{ id: `item-${Date.now()}`, name: '', quantity: 1, price: 0, assignedTo: [] }])
    }
  }, [])

  const reset = useCallback(() => {
    setStep(1)
    setBillData({ title: '', subtotal: 0, tax: 11, taxType: 'percent', tip: 0, serviceCharge: 0, serviceChargeType: 'amount', other: 0, otherType: 'amount', discount: 0, currency: 'IDR' })
    setParticipants([{ id: 'host', name: 'Me', initial: 'M', color: ACCENT_COLORS[0], isHost: true }])
    setMethod('equal')
    setItems([])
    setInputMethod('manual')
    setPaymentInfo({ payerId: '', bankName: '', accountNumber: '' })
    setSelectedFile(null)
    setImagePreview(null)
    setIsExtracting(false)
    setExtractError(null)
    setExtractionStep('select')
  }, [])

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file)
    setExtractError(null)

    // Create preview URL
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
      setExtractionStep('preview')
    }
    reader.readAsDataURL(file)
  }, [])

  // Handle extraction from uploaded image
  const handleExtractBill = useCallback(async () => {
    if (!selectedFile) return

    setIsExtracting(true)
    setExtractError(null)
    setExtractionStep('processing')

    try {
      const formData = new FormData()
      formData.append('image', selectedFile)

      const response = await fetch('/api/extract-bill', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to extract bill information')
      }

      const data = await response.json()

      // Populate items
      if (data.items && data.items.length > 0) {
        setItems(data.items)
      } else {
        // Fallback to empty item if no items extracted
        setItems([{ id: `item-${Date.now()}`, name: '', quantity: 1, price: 0, assignedTo: [] }])
      }

      // Update bill data with extracted info
      if (data.billData) {
        setBillData(prev => ({
          ...prev,
          tax: data.billData.tax ?? prev.tax,
          taxType: data.billData.taxType ?? prev.taxType,
          serviceCharge: data.billData.serviceCharge ?? prev.serviceCharge,
          serviceChargeType: data.billData.serviceChargeType ?? prev.serviceChargeType,
          discount: data.billData.discount ?? prev.discount,
          currency: data.billData.currency ?? prev.currency,
          // If merchant name was extracted and no title set, use merchant
          ...(data.billData.merchant && !billData.title ? { title: data.billData.merchant } : {}),
        }))
      }

      setInputMethod('camera')
      goNext()
    } catch (error) {
      console.error('Extraction error:', error)
      setExtractError(error instanceof Error ? error.message : 'Failed to extract bill information')
      setExtractionStep('preview')
    } finally {
      setIsExtracting(false)
    }
  }, [selectedFile, billData.title, goNext])

  // Cancel file selection and go back
  const handleCancelFile = useCallback(() => {
    setSelectedFile(null)
    setImagePreview(null)
    setExtractError(null)
    setExtractionStep('select')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const renderStep = () => {
    switch (step) {
      case 1: return (
        <Step1BillStart
          data={billData}
          onUpdate={(d) => setBillData(prev => ({ ...prev, ...d }))}
          onNext={goNext}
          onChooseMethod={handleChooseMethod}
          onFileSelect={handleFileSelect}
          onExtract={handleExtractBill}
          onCancelFile={handleCancelFile}
          fileInputRef={fileInputRef}
          imagePreview={imagePreview}
          isExtracting={isExtracting}
          extractError={extractError}
          extractionStep={extractionStep}
        />
      )
      case 2: return (
        <Step2BillItems
          items={items}
          billData={billData}
          inputMethod={inputMethod}
          onUpdateItems={setItems}
          onUpdateBill={(d) => setBillData(prev => ({ ...prev, ...d }))}
          onNext={goNext}
          onBack={goBack}
        />
      )
      case 3: return (
        <Step2People
          participants={participants}
          onUpdate={setParticipants}
          paymentInfo={paymentInfo}
          onUpdatePayment={(info) => setPaymentInfo(prev => ({ ...prev, ...info }))}
          onNext={goNext}
          onBack={goBack}
        />
      )
      case 4: return (
        <Step4Assign
          items={items}
          participants={participants}
          billData={billData}
          onUpdateItems={setItems}
          onNext={goNext}
          onBack={goBack}
        />
      )
      case 5: return (
        <Step5Summary
          billData={billData}
          participants={participants}
          method={method}
          items={items}
          paymentInfo={paymentInfo}
          onBack={goBack}
          onReset={reset}
        />
      )
      default: return null
    }
  }

  return (
    <div className="sb2-page">
      <main className="sb2-main">
        {step === 1 && (
          <header className="sb2-header">
            <div className="eyebrow">
              <span className="dot" />
              <span>A small tool</span>
            </div>
            <h1>Split <em>Bill</em>.</h1>
            <p className="lede">Divide shared expenses fairly, quickly, and clearly.</p>
          </header>
        )}

        {step === 5 && (
          <header className="sb2-summary-header">
            <h1 className="sb2-summary-header-title">Summary</h1>
            <p className="sb2-summary-header-sub">{billData.title ? `${billData.title} —  Review distribution` : 'Review the final distribution'}</p>
          </header>
        )}

        {step < 5 && <StepIndicator currentStep={step} totalSteps={totalSteps} />}

        <div className="sb2-content">
          {renderStep()}
        </div>
      </main>

      <footer className="sb2-footer">
        <p>We'll handle the math, you handle the memories.<br/>No data stored, no account needed.</p>
        <p style={{ marginTop: '6px', opacity: 0.6 }}>
          A tool by <a href="https://acuriousnote.com" target="_blank" rel="noopener" style={{ color: 'inherit', textDecoration: 'underline' }}>acuriousnote.com</a>
        </p>
      </footer>

      <PaletteSwitcher activePalette={paletteId} onChange={applyPalette} />
    </div>
  )
}
