# 🎨 MultiMaze Image Assets Creation Guide

## Overview

This guide provides specifications and instructions for creating all required image assets for MultiMaze SEO, social media sharing, and PWA functionality.

## Required Assets Checklist

### Priority: HIGH (Critical for SEO)

- [ ] **og-image.png** (1200x630px) - Open Graph / Facebook
- [ ] **twitter-image.png** (1200x675px) - Twitter Card
- [ ] **favicon-16x16.png** (16x16px) - Browser tab icon (small)
- [ ] **favicon-32x32.png** (32x32px) - Browser tab icon (standard)
- [ ] **apple-touch-icon.png** (180x180px) - iOS home screen

### Priority: MEDIUM (PWA & Mobile)

- [ ] **icon-192x192.png** (192x192px) - PWA icon (standard)
- [ ] **icon-512x512.png** (512x512px) - PWA icon (large)
- [ ] **icon-maskable-192x192.png** (192x192px) - Android adaptive icon
- [ ] **icon-maskable-512x512.png** (512x512px) - Android adaptive icon

### Priority: LOW (Enhanced Features)

- [ ] **mstile-70x70.png** (70x70px) - Windows tile (small)
- [ ] **mstile-150x150.png** (150x150px) - Windows tile (medium)
- [ ] **mstile-310x150.png** (310x150px) - Windows tile (wide)
- [ ] **mstile-310x310.png** (310x310px) - Windows tile (large)
- [ ] **icon-create-96x96.png** (96x96px) - Create room shortcut
- [ ] **icon-join-96x96.png** (96x96px) - Join room shortcut
- [ ] **screenshot-1.png** (1280x720px) - Lobby screenshot
- [ ] **screenshot-2.png** (1280x720px) - Gameplay screenshot
- [ ] **screenshot.png** (1280x720px) - General screenshot
- [ ] **logo.png** (400x400px) - Square logo

---

## Design Guidelines

### Brand Colors

- **Primary Background**: `#0f172a` (Dark navy blue)
- **Accent Purple**: `#8b5cf6`
- **Accent Pink**: `#ec4899`
- **Success Green**: `#10b981`
- **Warning Yellow**: `#f59e0b`

### Design Elements

1. **Maze Pattern**: Incorporate a subtle maze design
2. **Player Dots**: Use colorful dots to represent multiplayer
3. **Modern Look**: Clean, minimalist, tech-forward aesthetic
4. **High Contrast**: Ensure readability on all backgrounds

---

## Detailed Specifications

### 1. Open Graph Image (og-image.png)

**Size**: 1200x630px  
**Format**: PNG or JPG  
**Max File Size**: 8MB (aim for <500KB)

**Content Elements**:

```
┌─────────────────────────────────────────┐
│  MULTIMAZE                              │
│                                         │
│     [Maze Visual with Players]          │
│                                         │
│  Race Through Mazes with Friends!       │
│  Free • Multiplayer • Real-Time         │
└─────────────────────────────────────────┘
```

**Requirements**:

- Clear branding (MultiMaze logo/text)
- Engaging maze visual or gameplay scene
- 3-4 colorful player indicators
- Tagline or key benefit
- Good contrast for thumbnail view

### 2. Twitter Card Image (twitter-image.png)

**Size**: 1200x675px  
**Format**: PNG or JPG  
**Max File Size**: 5MB (aim for <500KB)

**Content**: Similar to OG image but with 16:9 ratio

- Adjust layout for wider aspect ratio
- Keep text large and readable
- Focus on visual appeal

### 3. Favicons

#### favicon-16x16.png & favicon-32x32.png

**Sizes**: 16x16px and 32x32px  
**Format**: PNG with transparency  
**Max File Size**: <10KB each

**Design**:

- Simplified "M" or maze icon
- Use brand colors
- Must be recognizable at tiny size
- Test on both light and dark backgrounds

**Example ASCII concept**:

```
████████
█  █   █
█  █ █ █
█    █ █
████████
```

### 4. Apple Touch Icon (apple-touch-icon.png)

**Size**: 180x180px  
**Format**: PNG  
**Max File Size**: <100KB

**Design**:

- Rounded corners not needed (iOS adds automatically)
- Full bleed design
- Vibrant colors
- Maze + "M" combination
- Should work on any background

### 5. PWA Icons (Standard)

#### icon-192x192.png

**Size**: 192x192px  
**Format**: PNG with transparency  
**Max File Size**: <100KB

**Design**:

- Full maze icon with branding
- Clear at medium size
- Transparent or solid background
- Consistent with brand

#### icon-512x512.png

**Size**: 512x512px  
**Format**: PNG with transparency  
**Max File Size**: <200KB

**Design**:

- High-resolution version of 192x192
- More detail possible
- Sharp edges
- Professional appearance

### 6. Maskable Icons (Android Adaptive)

#### icon-maskable-192x192.png & icon-maskable-512x512.png

**Sizes**: 192x192px and 512x512px  
**Format**: PNG  
**Max File Size**: <100KB and <200KB

**Critical Requirements**:

- **Safe Zone**: Keep important content in center 80% (circular area)
- **Bleed Area**: Outer 20% can be cropped
- **Solid Background**: Must have opaque background (no transparency)

**Design Template**:

```
┌─────────────────┐
│ ░░░░BLEED░░░░░  │ <- Can be cropped
│ ░┌───────────┐░ │
│ ░│ SAFE ZONE │░ │ <- Logo/icon here
│ ░│  (80%)    │░ │
│ ░└───────────┘░ │
│ ░░░░BLEED░░░░░  │ <- Can be cropped
└─────────────────┘
```

**Testing Tool**: [Maskable.app](https://maskable.app/)

### 7. Microsoft Tiles

#### mstile-70x70.png

**Size**: 70x70px  
**Design**: Minimal icon, centered

#### mstile-150x150.png

**Size**: 150x150px  
**Design**: Standard icon with breathing room

#### mstile-310x150.png (Wide Tile)

**Size**: 310x150px  
**Design**: Logo + tagline horizontal layout

#### mstile-310x310.png (Large Tile)

**Size**: 310x310px  
**Design**: Detailed icon with text elements

**Note**: All tiles should have solid background (#0f172a)

### 8. App Shortcuts Icons

#### icon-create-96x96.png

**Size**: 96x96px  
**Icon**: "+" or "New" symbol with maze element

#### icon-join-96x96.png

**Size**: 96x96px  
**Icon**: Door or entrance symbol with maze element

### 9. Screenshots

#### screenshot-1.png (Lobby)

**Size**: 1280x720px  
**Content**:

- Room code visible
- Multiple players in lobby
- Game settings shown
- Clean, organized interface

#### screenshot-2.png (Gameplay)

**Size**: 1280x720px  
**Content**:

- Active maze with players
- Timer visible
- Player positions clear
- Exciting moment captured

#### screenshot.png (General)

**Size**: 1280x720px  
**Content**: Best overall view of the game

### 10. Logo

#### logo.png

**Size**: 400x400px  
**Format**: PNG with transparency  
**Content**:

- MultiMaze branding
- Maze element
- Scalable design
- Works on any background

---

## Creation Methods

### Option 1: Design Tools (Recommended)

**Figma** (Free, Web-based):

1. Create frames with exact dimensions
2. Design assets with brand guidelines
3. Export as PNG (2x resolution for sharp images)
4. Optimize with TinyPNG or Squoosh

**Canva** (Free tier available):

1. Use custom dimensions
2. Apply brand colors
3. Use templates and customize
4. Download as PNG

**Adobe Photoshop/Illustrator**:

1. Professional quality
2. Vector-based for scaling
3. Export at various sizes
4. Batch export feature

### Option 2: Online Generators

**Favicon Generator**: [RealFaviconGenerator](https://realfavicongenerator.net/)

- Upload 512x512 source image
- Auto-generates all favicon sizes
- Provides code snippets
- Tests on various platforms

**PWA Asset Generator**: [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)

```bash
npx pwa-asset-generator logo-source.png ./public --manifest manifest.json
```

### Option 3: AI Generation

**DALL-E, Midjourney, Stable Diffusion**:

**Prompt example**:

```
"Modern minimalist logo for a multiplayer maze racing game called MultiMaze,
dark navy blue background, vibrant purple and pink accents, maze pattern,
colorful player dots, tech-forward design, clean lines, game icon style"
```

Then resize and optimize outputs.

---

## Optimization Tips

### File Size Optimization

1. **Use TinyPNG** (https://tinypng.com/)

   - Reduces PNG file size by 50-80%
   - Maintains visual quality
   - Batch processing available

2. **Use Squoosh** (https://squoosh.app/)

   - Advanced compression options
   - Visual comparison
   - WebP conversion

3. **ImageOptim** (Mac) or **FileOptimizer** (Windows)
   - Lossless compression
   - Removes metadata
   - Batch processing

### Quality Guidelines

- **Favicons**: Sharp edges, simple design
- **Social Images**: Engaging, high contrast
- **PWA Icons**: Professional, recognizable
- **Screenshots**: Real gameplay, clean UI

### Testing

**Before finalizing**:

1. Test on multiple devices
2. Check on light/dark backgrounds
3. View at actual display sizes
4. Test social media cards
5. Validate maskable icons

---

## Quick Start Template

If you need placeholders to start:

1. **Use the existing vite.svg** as temporary favicon
2. **Create basic colored squares** with text for testing
3. **Take actual screenshots** of your running game
4. **Replace placeholders** with final assets later

### Command to create placeholder (Linux/Mac):

```bash
cd frontend/public

# Create simple colored placeholder (requires ImageMagick)
convert -size 512x512 xc:"#0f172a" -fill "#8b5cf6" -font Arial -pointsize 48 \
  -gravity center -annotate +0+0 "M" icon-512x512.png
```

---

## File Placement

All assets should be placed in:

```
frontend/public/
├── og-image.png
├── twitter-image.png
├── favicon-16x16.png
├── favicon-32x32.png
├── apple-touch-icon.png
├── icon-192x192.png
├── icon-512x512.png
├── icon-maskable-192x192.png
├── icon-maskable-512x512.png
├── mstile-*.png
├── icon-create-96x96.png
├── icon-join-96x96.png
├── screenshot-*.png
└── logo.png
```

---

## Validation Checklist

After creating assets:

- [ ] All files in correct location
- [ ] Correct dimensions for each file
- [ ] File sizes optimized (<500KB for social, <100KB for icons)
- [ ] PNG format with proper transparency (where needed)
- [ ] Maskable icons tested at [Maskable.app](https://maskable.app/)
- [ ] Social cards tested at:
  - [ ] [Facebook Debugger](https://developers.facebook.com/tools/debug/)
  - [ ] [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [ ] Favicons visible in browser
- [ ] PWA installable on mobile
- [ ] Windows tiles display correctly

---

## Resources

### Design Inspiration

- [Dribbble - Game Icons](https://dribbble.com/search/game-icon)
- [Behance - App Icons](https://www.behance.net/search/projects?search=app%20icon)
- [App Icon Gallery](https://www.appicontemplate.com/gallery)

### Tools

- [Figma](https://figma.com) - Design tool
- [Canva](https://canva.com) - Quick design
- [RealFaviconGenerator](https://realfavicongenerator.net/) - Favicon generator
- [Maskable.app](https://maskable.app/) - Test maskable icons
- [TinyPNG](https://tinypng.com) - Optimize images
- [Squoosh](https://squoosh.app) - Image compression

### Learning

- [PWA Icon Guidelines](https://web.dev/maskable-icon/)
- [Open Graph Image Best Practices](https://www.opengraph.xyz/)
- [Favicon Best Practices](https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs)

---

## Next Steps

1. ✅ Read this guide
2. 📐 Choose creation method (Figma recommended)
3. 🎨 Design HIGH priority assets first
4. 🔍 Test and validate
5. 📱 Deploy and verify on live site
6. 📊 Monitor results in Search Console

---

**Document Version**: 1.0  
**Last Updated**: October 16, 2025  
**Priority**: HIGH - Complete within 1 week for optimal SEO impact
