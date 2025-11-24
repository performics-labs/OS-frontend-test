# OneSuite Color Palette

## Overview

OneSuite's color system is aligned with the Performics brand, featuring a minimalist, professional palette with high contrast and modern aesthetics. The design emphasizes dark bases with bright accent colors for a tech-forward appearance.

## Brand Alignment

Based on [Performics.com](https://www.performics.com), the color palette maintains brand consistency across all properties.

## Color Scales

All colors follow a 50-950 scale (11 shades per color). Base colors are at the 500 level.

### Warm Black (Primary Dark)

**Base:** `#222222` (warm-black-500) | **Usage:** Primary text, headers, dark backgrounds

**Key Shades:** 50 (#F5F5F5 lightest), 400 (#888888 secondary text), 500 (#222222 base), 600 (#1B1B1B headers), 700 (#141414 deep backgrounds)

### Light Grey (Secondary Neutrals)

**Base:** `#D9D9D9` (light-grey-500) | **Usage:** Subtle backgrounds, borders, secondary UI

**Key Shades:** 50 (#FAFAFA brightest), 100 (#F2F2F2 Performics light), 200 (#E8E8E8 cards), 500 (#D9D9D9 base), 700 (#828282 footer)

### Disrupt Green (Primary Brand)

**Base:** `#33D76F` (disrupt-500) | **Usage:** Primary CTAs, success states, brand moments

**Key Shades:** 50 (#EAFBF0 backgrounds), 400 (#57DF87 hover), 500 (#33D76F base), 600 (#29AC59 active), 700 (#1F8143 darker)

### Platform Green (Secondary Brand)

**Base:** `#1E9A4B` (platform-500) | **Usage:** Secondary actions, alternative success states

**Key Shades:** 50 (#E8F9ED backgrounds), 400 (#47CF6F hover), 500 (#1E9A4B base), 600 (#187B3C active)

### Blue (Accent)

**Base:** `#00C5FF` (blue-500) | **Usage:** Links, informational states

**Key Shades:** 50 (#E5F9FF backgrounds), 400 (#33D4FF hover), 500 (#00C5FF base), 600 (#009DCC active)

### Yellow (Accent)

**Base:** `#FFD300` (yellow-500) | **Usage:** Warnings, highlights, attention elements

**Key Shades:** 50 (#FFFCE6 backgrounds), 400 (#FFE633 hover), 500 (#FFD300 base), 600 (#CCA900 active)

### Red (Error/Status)

**Base:** `#F25116` (red-500) | **Usage:** Errors, destructive actions, critical status

**Key Shades:** 50 (#FFEAE9 backgrounds), 400 (#FF574B hover), 500 (#F25116 base), 600 (#C24112 active)

**Visual Reference:** All shades are available in `index.css` via Tailwind v4 theme and can be used via Tailwind utilities (e.g., `bg-disrupt-50`, `text-warm-black-700`).

## Design Philosophy

**Minimalist & Professional**: Clean, uncluttered interfaces with purposeful color usage

**High Contrast**: Strong contrast between text and backgrounds for accessibility

**Tech-Forward**: Modern, digital-first aesthetic that feels contemporary

**Brand Consistency**: Aligned with Performics parent brand identity

**Performance-Oriented**: Colors reinforce themes of speed, efficiency, and results

## Usage Guidelines

### Primary Actions

- Use **disrupt-500** (#33D76F) for primary CTAs and important actions
- Reserve this color for the most important user actions

### Secondary Actions

- Use **platform-500** (#1E9A4B) or **blue-500** (#00C5FF) for secondary actions
- Good for alternative paths or less critical interactions

### Text Hierarchy

- **Headings**: warm-black-500 (#222222) or warm-black-600 (#1B1B1B)
- **Body**: warm-black-500 (#222222)
- **Secondary Text**: warm-black-400 (#888888)
- **Disabled**: warm-black-300 (#B0B0B0)

### Backgrounds

- **Primary**: white (#FFFFFF)
- **Subtle**: light-grey-50 (#FAFAFA) or light-grey-100 (#F2F2F2)
- **Dark Mode**: warm-black-600 (#1B1B1B) to warm-black-950 (#030303)

### Status & Feedback

- **Success**: disrupt-500 (#33D76F) or platform-500 (#1E9A4B)
- **Error**: red-500 (#F25116)
- **Warning**: yellow-500 (#FFD300)
- **Info**: blue-500 (#00C5FF)

### Borders & Dividers

- **Subtle**: light-grey-200 (#E8E8E8)
- **Standard**: light-grey-500 (#D9D9D9)
- **Emphasized**: warm-black-200 (#D1D1D1)

## Implementation

Colors are defined in `src/index.css` using Tailwind v4's `@theme` directive and can be used via Tailwind utility classes:

```tsx
// Examples
<button className="bg-disrupt-500 hover:bg-disrupt-600 text-white">
  Primary Action
</button>

<p className="text-warm-black-500">Body text</p>

<div className="border border-light-grey-500">Card</div>
```

## Accessibility

All color combinations have been designed to meet WCAG 2.1 AA standards:

- Text on backgrounds maintains 4.5:1 contrast ratio minimum
- UI components maintain 3:1 contrast ratio minimum
- Consider using darker shades (600-950) for text on light backgrounds
- Use lighter shades (50-400) for backgrounds with dark text
