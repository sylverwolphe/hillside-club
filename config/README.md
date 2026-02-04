# Config

JSON configuration files for site content. Edit these to update drinks, subscription tiers, and page content without touching code.

## Files

### menu-config.json

Drink menu data loaded by `assets/js/menu-loader.js`.

```json
{
  "drinks": [
    {
      "id": "pour-over",        // Used for theming (CSS, particles, shader)
      "name": "Pour Over",      // Display name
      "shortDesc": "...",       // Card description
      "fullDesc": "...",        // Detail view description
      "extras": ["...", "..."], // Bullet points in detail view
      "icon": "pour-over",      // Key into menu-icons.json (fallback)
      "image": "config/menu-images/pour-over.jpg"  // Optional: custom image
    }
  ]
}
```

### menu-icons.json

SVG icons for drinks (used when no image is provided).

```json
{
  "pour-over": "<svg>...</svg>",
  "cappuccino": "<svg>...</svg>"
}
```

### menu-images/

Folder for drink images. Images are cropped to square using CSS `object-fit: cover`.

To add an image:
1. Place image in `config/menu-images/`
2. Update `menu-config.json`: `"image": "config/menu-images/filename.jpg"`
3. Leave `"image": ""` or omit the field to use the SVG icon from `menu-icons.json`

**Drink IDs** must match the theming system:
- `pour-over`, `cappuccino`, `latte`, `mocha`, `hot-chocolate`, `matcha-latte`, `moroccan-mint`, `something-different`

Adding a new drink requires updating color configs in:
- `assets/js/particles.js` - `drinkSpiceColors`, `drinkLogoColorsLight`, `drinkLogoColorsDark`, `drinkNavbarColors`
- `assets/js/liquid-shader.js` - `drinkConfigs`

### subscribe-config.json

Subscription page content loaded by `assets/js/subscribe-loader.js`.

```json
{
  "page": {
    "title": "Subscribe",
    "tagline": "join the journey"
  },
  "joinSection": {
    "title": "Join Us",
    "intro": "..."
  },
  "tiers": [
    {
      "id": "follow",
      "name": "Follow",
      "price": "Free",
      "priceSubtext": "",
      "featured": false,         // Adds visual highlight
      "perks": ["...", "..."],
      "buttons": [
        {
          "text": "Substack",
          "url": "https://...",
          "type": "link",        // "link" or "modal"
          "primary": false
        }
      ]
    }
  ]
}
```

**Button types:**
- `"type": "link"` - Opens URL in new tab
- `"type": "modal"` - Opens modal by `modalId` (e.g., `"unlimitedModal"`)

---

### partnership-config.json

Partnership page info cards loaded by `assets/js/partnership-loader.js`.

```json
{
  "infoCards": {
    "default": {
      "title": "Let's Build Together",
      "intro": "Tell us who you are..."
    },
    "investor": {
      "title": "Invest in Gratified",
      "intro": "Join us as a founding investor...",
      "tier": {
        "amount": "$25,000",
        "equity": "0.2% equity stake",
        "label": "Founding Investor"
      },
      "listTitle": "What you get:",
      "items": ["Equity stake...", "Quarterly updates..."],
      "note": "We're raising a small friends & family round..."
    },
    "business": {
      "title": "Business Partnerships",
      "intro": "...",
      "listTitle": "We work with:",
      "items": ["Venues & coworking spaces", "..."],
      "note": "..."
    },
    "barista": {
      "title": "Join as a Barista",
      "intro": "...",
      "listTitle": "What we offer:",
      "items": ["Training provided", "..."],
      "note": "..."
    }
  }
}
```

**Info card fields:**
- `title` - Card heading (required)
- `intro` - Opening paragraph (required)
- `tier` - Investment tier display (investor only, optional)
- `listTitle` - Heading above bullet list (optional)
- `items` - Array of bullet points (optional)
- `note` - Footer text, styled subtly (optional)

**Category keys** must match the form category buttons: `default`, `investor`, `business`, `barista`
