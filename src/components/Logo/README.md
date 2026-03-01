# ReachFire Logo System

## Overview

The ReachFire logo is a custom SVG-based design system that represents the brand's core values: **reaching financial freedom through the fire of compound growth**.

## Design Elements

### Logo Mark
The logo combines three key visual concepts:

1. **Flame Shape** — Represents FIRE (Financial Independence, Retire Early) and the warmth of financial security
2. **Upward Arrow** — Symbolizes growth, reaching, and upward momentum toward financial goals
3. **Reach Indicators** — Small circles on left and right represent the "reach" in ReachFire, suggesting expansion and accessibility
4. **Inner Highlight** — Creates depth and emphasizes the upward movement

### Color Scheme
Uses the ReachFire ember gradient matching the design system:
- **Start:** `oklch(0.62 0.26 35)` — Deep ember
- **Mid:** `oklch(0.70 0.24 50)` — Medium flame orange
- **End:** `oklch(0.78 0.18 75)` — Bright highlight

## Components

### `<Logo />` - Full Logo with Text
```tsx
import { Logo } from '@/components/Logo';

<Logo size="md" showText={true} />
```

**Props:**
- `size`: `'sm' | 'md' | 'lg'` — Controls overall size (default: `'md'`)
- `showText`: `boolean` — Show/hide "ReachFire" text (default: `true`)
- `className`: `string` — Additional Tailwind classes

**Use cases:**
- Navbar branding
- Footer branding
- Large hero sections
- Brand introduction

### `<LogoSymbol />` - Logo Mark Only
```tsx
import { LogoSymbol } from '@/components/Logo';

<LogoSymbol size="sm" />
```

**Props:**
- `size`: `'sm' | 'md' | 'lg'` — Controls icon size (default: `'md'`)
- `className`: `string` — Additional Tailwind classes

**Use cases:**
- Favicon
- Compact headers
- Icon buttons
- Inline badges

## Size Reference

| Size | Container | Typical Use |
|------|-----------|------------|
| `sm` | `w-8 h-8` | Navbar, compact UI |
| `md` | `w-10 h-10` | Standard branding, footer |
| `lg` | `w-12 h-12` | Hero sections, large displays |

## Favicon

A static SVG favicon is available at:
- `public/logo.svg`

Can be referenced in Next.js metadata or as a favicon file.

## Brand Integration

The logo is used throughout the application:

- **Navbar** — `<Logo size="sm" />` (compact with text)
- **Footer** — `<Logo size="md" />` (standard with text)
- **Meta Tags** — Logo symbol used as favicon
- **Hero Sections** — Can be scaled up with `<Logo size="lg" />`

## Design Rationale

### Why This Design?

1. **Flame (FIRE)** — The core product is a FIRE calculator; the flame is immediately recognizable
2. **Arrow (Growth)** — Financial planning is about reaching goals; upward arrows = growth
3. **Reach (Accessibility)** — ReachFire is free and accessible to everyone; the spread indicators suggest inclusive reach
4. **Gradient (Premium Feel)** — The ember gradient gives a modern, professional appearance while staying warm and approachable

### Color Philosophy

The ember gradient is warm and inviting, not cold or clinical. It conveys:
- **Warmth** — Financial security, comfort
- **Energy** — Action, momentum, growth
- **Trust** — Amber/orange tones are associated with reliability
- **Optimization** — Matches the existing design system throughout the app

## Future Extensions

Possible additions:
- Animated logo version (Lottie)
- Dark mode variant (if needed)
- Monochrome version for restricted uses
- Logo lockup variations (horizontal, vertical)
- Social media avatars (round/square crops)
