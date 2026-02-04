# Gratified

A coffee + art experience bringing warmth, creativity, and community.

Part of **Buttercup Destiny**.

## Features

- Interactive drink menu with WebGL liquid shader effects
- Custom menu images with automatic square cropping
- Multi-mode particle system (steam, dust, grounds, dots, diamonds)
- Light/dark theme with drink-specific color palettes
- Animated diamond logo on landing page
- Single-page scroll-snap navigation
- Membership subscription tiers
- Partnership inquiry forms with Google Forms integration
- Responsive design with mobile-optimized navigation

## Tech

- Vanilla JavaScript (modular files in `assets/js/`)
- WebGL shader with frame-rate independent animations and context loss recovery
- Canvas particle system with configurable modes
- CSS custom properties for theming
- JSON-based configuration for menu and subscriptions
- No build system required

## Pages

- **Home** - Landing with animated diamond logo and particles
- **Menu** - Drink selection with live shader preview
- **Subscribe** - Membership tiers
- **Partner** - Collaboration opportunities
- **Buttercup** - Parent company

## Drinks

`pour-over` · `cappuccino` · `latte` · `mocha` · `hot-chocolate` · `matcha-latte` · `moroccan-mint` · `something-different`

## Menu Images

Add custom images to menu cards:

1. Place images in `config/menu-images/`
2. Update `config/menu-config.json`:
```json
{
  "id": "pour-over",
  "image": "config/menu-images/pour-over.jpg"
}
```

Images are automatically cropped to square. Leave `"image": ""` to use SVG icons.

## Development

```bash
python -m http.server 8000
```

Open `http://localhost:8000`

## Project Structure

```
config/                    # JSON configs and menu images
  menu-config.json         # Drink data
  menu-icons.json          # SVG icons for drinks
  menu-images/             # Drink photos
  subscribe-config.json    # Subscription tiers
  partnership-config.json  # Partnership info cards
assets/js/                 # Modular JavaScript files
partners/                  # Partner logos and config
archive/                   # Archived components
docs/                      # Documentation and code reviews
```
