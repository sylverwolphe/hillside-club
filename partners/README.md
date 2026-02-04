# Partner Logos

Add partner logos to this folder and configure them in `partners.json`.

## Adding a Partner

1. Add the logo file to this folder
2. Edit `partners.json` and add an entry:

```json
{
  "partners": [
    {
      "name": "Partner Name",
      "logo": "filename.png",
      "url": "https://partner-website.com"
    }
  ]
}
```

## Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Shown on hover |
| `logo` | Yes | Filename in this folder |
| `url` | No | Makes logo clickable |

## Supported Formats

png, jpg, jpeg, svg, webp, gif

## Notes

- Logos display at 150x80px, auto-scaled to fit
- Use transparent backgrounds for best results
- SVG recommended for crisp display at all sizes
