# Bill Photo Upload & OCR Feature

This feature allows users to upload photos of receipts/bills and automatically extract item information using Google Vision API.

## Setup

### 1. Get Google Vision API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable the **Cloud Vision API**
4. Create an API key:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - (Optional) Restrict the key to only Vision API

### 2. Configure Environment

Add to your `.env.local` file:

```bash
GOOGLE_VISION_API_KEY=your_api_key_here
```

### 3. Test Without API Key (Development)

If no API key is set, the system will use mock data for testing:
- Mock restaurant receipt with 4 sample items
- 11% tax, Rp 25,000 service charge
- IDR currency

## How It Works

### User Flow

1. **Step 1**: User enters bill name and clicks "Upload bill photo"
2. **File Selection**: User selects or captures receipt photo
3. **Preview**: User sees image preview with "Extract Items" button
4. **Processing**: Image sent to `/api/extract-bill` endpoint
5. **OCR**: Google Vision API extracts text from image
6. **Parsing**: Receipt parser extracts structured data (items, tax, service charge)
7. **Step 2**: User sees auto-populated items, can edit if needed

### Supported Receipt Types

The parser supports multiple receipt formats:

- **Restaurant receipts** - Food items, service charge, tax
- **Retail invoices** - Products with quantities and prices
- **Multi-currency** - IDR, USD, EUR, GBP, SGD, JPY, MYR, THB, VND

### Extracted Data

- Item names
- Quantities
- Prices (unit or total)
- Tax (percent or amount)
- Service charge (percent or amount)
- Discounts
- Currency detection
- Merchant name (if visible)

## File Structure

```
app/split-bill/
├── page.tsx              # Main component with upload UI
├── split-bill.css       # Styles including preview card
├── lib/
│   └── receipt-parser.ts # OCR text parsing logic
└── README-OCR.md         # This file

app/api/extract-bill/
└── route.ts              # API route for Vision API
```

## API Response Format

```typescript
{
  items: [
    {
      id: "item-123",
      name: "Nasi Goreng",
      quantity: 2,
      price: 45000,
      assignedTo: []
    }
  ],
  billData: {
    tax: 11,
    taxType: "percent",
    serviceCharge: 25000,
    serviceChargeType: "amount",
    discount: 0,
    currency: "IDR",
    merchant: "Restaurant Name"
  }
}
```

## Limitations & Notes

1. **Image Quality**: Clear, well-lit photos work best
2. **Handwritten Receipts**: May not be recognized accurately
3. **Complex Layouts**: Some receipt formats may need manual correction
4. **File Size**: Max 10MB per image
5. **Privacy**: Images are processed by Google Vision API (not stored by us)

## Cost

- **Google Vision API**: 1000 requests/month free, then $1.50 per 1000
- Typical usage: 1 request per bill split

## Troubleshooting

### "No text found in image"
- Try a clearer photo with better lighting
- Ensure the receipt is flat and not crumpled
- Avoid glare or shadows on the receipt

### Incorrect item extraction
- The parser uses heuristics that work for most receipts
- Some edge cases may need manual editing in Step 2
- Non-standard receipt formats may need manual entry

### API errors
- Check that `GOOGLE_VISION_API_KEY` is set correctly
- Verify the API key has Vision API enabled
- Check Google Cloud Console for quota limits
