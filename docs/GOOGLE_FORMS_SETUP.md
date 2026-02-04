# Google Forms Setup

This guide explains how to connect the website forms to Google Forms for data collection.

## Overview

The site has **4 forms** that can submit to Google Forms:

| Form | Purpose | Location |
|------|---------|----------|
| Investor | Investment inquiries | Partnership page (category button) |
| Business | Business partnerships | Partnership page (category button) |
| Barista | Job applications | Partnership page (category button) |
| Unlimited | Membership signups | Subscribe page modal |

## Step 1: Create Your Google Forms

Create a separate Google Form for each form type. Each form should have fields matching the table below.

### Required Fields by Form

**Investor Form:**
- Name (Short answer)
- Email (Short answer)
- Phone (Short answer)
- LinkedIn or Website (Short answer)
- Details (Paragraph)

**Business Form:**
- Name (Short answer)
- Email (Short answer)
- Business Name (Short answer)
- Website (Short answer)
- Details (Paragraph)

**Barista Form:**
- Name (Short answer)
- Email (Short answer)
- Experience (Short answer)
- Availability (Short answer)
- Details (Paragraph)

**Unlimited Membership Form:**
- Name (Short answer)
- Email (Short answer)
- Phone (Short answer)
- Source (Dropdown: Instagram, Twitter, Friend, Visited a location, Other)

## Step 2: Get Your Form ID

1. Open your Google Form
2. Click "Send" button
3. Copy the URL - it looks like:
   ```
   https://docs.google.com/forms/d/e/1FAIpQLSf...ABC123.../viewform
                                       └─────── FORM ID ───────┘
   ```

## Step 3: Get Entry IDs

Each form field has a unique entry ID. To find them:

1. Open your Google Form in edit mode
2. Click the 3-dot menu (top right) → "Get pre-filled link"
3. Fill in dummy data for each field (e.g., "test" for text fields)
4. Click "Get link" → "Copy link"
5. Paste the URL somewhere - it contains entry IDs like:
   ```
   ...?entry.123456789=test&entry.234567890=test@email.com...
            └─ NAME ─┘            └─ EMAIL ─┘
   ```

## Step 4: Update the Configuration

Open `assets/js/modals.js` and find the `googleFormsConfig` object (around line 372). Update each form with your IDs:

```javascript
const googleFormsConfig = {
    'investorForm': {
        formId: '1FAIpQLSf...YOUR_INVESTOR_FORM_ID...',
        fields: {
            'name': 'entry.123456789',      // Replace with your entry IDs
            'email': 'entry.234567890',
            'phone': 'entry.345678901',
            'linkedin': 'entry.456789012',
            'details': 'entry.567890123'
        }
    },
    'businessForm': {
        formId: '1FAIpQLSf...YOUR_BUSINESS_FORM_ID...',
        fields: {
            'name': 'entry.123456789',
            'email': 'entry.234567890',
            'business': 'entry.345678901',
            'website': 'entry.456789012',
            'details': 'entry.567890123'
        }
    },
    'baristaForm': {
        formId: '1FAIpQLSf...YOUR_BARISTA_FORM_ID...',
        fields: {
            'name': 'entry.123456789',
            'email': 'entry.234567890',
            'experience': 'entry.345678901',
            'availability': 'entry.456789012',
            'details': 'entry.567890123'
        }
    },
    'unlimitedForm': {
        formId: '1FAIpQLSf...YOUR_UNLIMITED_FORM_ID...',
        fields: {
            'name': 'entry.123456789',
            'email': 'entry.234567890',
            'phone': 'entry.345678901',
            'source': 'entry.456789012'
        },
        successMessage: 'unlimited membership signup'
    }
};
```

## Testing

Before configuring real form IDs, forms work in **demo mode**. When submitted:
- Data is logged to the browser console
- Success notification still appears
- No data is actually sent anywhere

Check the browser console (F12 → Console) to see:
```
Google Form not configured for: investorForm {name: "Test", email: "test@test.com", ...}
```

Once configured with real IDs, submissions go directly to your Google Forms and appear in the Responses tab.

## Troubleshooting

**Form submits but no data in Google Forms:**
- Double-check your Form ID is correct
- Verify each entry ID matches your form fields exactly
- Make sure the Google Form is set to accept responses

**Getting CORS errors:**
- This is normal - the form still submits via hidden iframe
- Check Google Forms Responses tab to confirm data arrived

**Fields not mapping correctly:**
- Entry IDs must match the exact field in your Google Form
- Re-generate pre-filled link if you've edited form fields
