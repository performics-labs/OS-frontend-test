# OneSuite - shadcn/ui Component Style Guide

**Version**: 1.1
**Last Updated**: 2025-10-15

## Design Philosophy

OneSuite inherits the Performics brand identity with:

- **Minimalist & Professional** - Clean, uncluttered interfaces
- **High Contrast** - WCAG 2.1 AA compliant for accessibility
- **Tech-Forward** - Modern, digital-first aesthetic
- **Performance-Oriented** - Colors reinforce speed and efficiency

### Core Brand Colors

| Color              | Hex       | Primary Usage                   |
| ------------------ | --------- | ------------------------------- |
| **Disrupt Green**  | `#33D76F` | Primary CTAs, success states    |
| **Platform Green** | `#1E9A4B` | Secondary actions, hover states |
| **Warm Black**     | `#222222` | Body text, headers              |
| **Light Grey**     | `#D9D9D9` | Borders, dividers               |
| **Blue**           | `#00C5FF` | Links, informational states     |
| **Yellow**         | `#FFD300` | Warnings, highlights            |
| **Red**            | `#F25116` | Errors, destructive actions     |

---

## Setup & Configuration

### 1. Install shadcn/ui

```bash
npx shadcn@latest init
npx shadcn@latest add button card alert  # Add components as needed
```

### 2. Configure Theme Tokens

Add semantic color tokens to `src/index.css`. See complete token configuration in the existing `globals.css` file.

**Key token mappings:**

- `--primary` → Disrupt Green (`#33D76F`)
- `--accent` → Platform Green (`#1E9A4B`)
- `--destructive` → Red (`#F25116`)
- `--ring` → Disrupt Green (for focus states)
- `--border` → Light Grey (`#D9D9D9`)

### 3. Extend Tailwind Config

Add Performics brand color scales to `tailwind.config.ts`. See `docs/color-palette.md` for the complete color system including:

- `disrupt` - Primary brand colors (50-950 scale)
- `platform` - Secondary brand colors (50-950 scale)
- `warm-black` - Neutral dark colors (50-950 scale)
- `light-grey` - Neutral light colors (50-950 scale)
- `info`, `warning`, `alert` - Semantic status colors (50-950 scale)

### 4. Setup Checklist

- [ ] Configure semantic tokens in `globals.css`
- [ ] Extend Tailwind with brand colors
- [ ] Test both light and dark modes
- [ ] Verify WCAG 2.1 AA contrast ratios

---

## Component Design Patterns

### Button (`button.tsx`)

**Default variants:**

- `default` - Disrupt Green for primary CTAs (save, create, submit)
- `destructive` - Red for delete, remove actions
- `outline` - Neutral with Platform Green hover
- `secondary` - Light grey background for less prominent actions
- `ghost` - Transparent with Platform Green hover (cancel, dismiss)
- `link` - Text-only with Disrupt Green color

**Recommended custom variant:**

```tsx
platform: 'bg-platform-500 text-white hover:bg-platform-600';
```

**Usage:**

- Primary CTA = `variant="default"`
- Secondary action = `variant="platform"` or `variant="outline"`
- Tertiary/Cancel = `variant="ghost"`
- All buttons get Disrupt Green focus ring via `--ring`

---

### Badge (`badge.tsx`)

**Default variants:** `default`, `secondary`, `destructive`, `outline`

**Recommended custom variants:**

```tsx
success: 'bg-disrupt-500 text-white';
info: 'bg-info-500 text-white';
warning: 'bg-warning-500 text-warm-black-700';
```

**Usage:** Status indicators, counts, labels, feature flags

---

### Alert (`alert.tsx`)

**Default variants:** `default`, `destructive`

**Recommended custom variants:**

```tsx
success: 'border-disrupt-500/50 bg-disrupt-50 dark:bg-disrupt-950/20 text-disrupt-700';
info: 'border-info-500/50 bg-info-50 dark:bg-info-950/20 text-info-700';
warning: 'border-warning-500/50 bg-warning-50 dark:bg-warning-950/20 text-warning-800';
```

**Design notes:**

- Include icons for visual reinforcement (CheckCircle, Info, AlertCircle)
- Use colored backgrounds with 50% border opacity
- Ensure icon color matches text color via `[&>svg]:text-{color}`

---

### Card (`card.tsx`)

**Base styling:** `bg-card` with `shadow-sm` and subtle border

**Common customizations:**

```tsx
// Highlighted card
<Card className="border-disrupt-500">

// Subtle card
<Card className="border-border/50 shadow-none">
```

**Structure:** `Card` → `CardHeader` (with `CardTitle` + `CardDescription`) → `CardContent` → `CardFooter`

---

### Input Components

**Form controls:** `input.tsx`, `textarea.tsx`, `select.tsx`

**Key styling:**

- `border-input` - Light grey borders
- `focus-visible:ring-ring` - Disrupt Green 2px focus ring
- `placeholder:text-muted-foreground` - Muted grey placeholders
- `h-10` - Consistent 40px height

**State classes:**

```tsx
// Error
className = 'border-destructive focus-visible:ring-destructive';

// Success
className = 'border-disrupt-500 focus-visible:ring-disrupt-500';
```

---

### Dialog/Modal Components

**Components:** `dialog.tsx`, `alert-dialog.tsx`, `sheet.tsx`

**Design notes:**

- Overlay: `bg-black/80` (80% opacity)
- Content: `bg-background` (white/dark card background)
- Shadow: `shadow-lg` for elevation
- Animation: Fade + zoom (200ms)
- Footer: Ghost button for cancel, default button for confirm

---

### Sidebar (`sidebar.tsx`)

**Key characteristics:**

- Dark sidebar: `bg-sidebar` (Warm Black 600 `#1B1B1B`)
- Text: Light grey (`#F2F2F2`)
- Active state: Disrupt Green highlight + medium font weight
- Hover: Darker warm-black (`#141414`)
- Width: 16rem expanded, 3rem collapsed
- Mobile: Use `collapsible="offcanvas"` for slide-out behavior

**Component hierarchy:** `Sidebar` → `SidebarHeader` → `SidebarContent` → `SidebarGroup` → `SidebarMenu` → `SidebarMenuItem` → `SidebarMenuButton`

---

### Additional Components

**Table** - Muted grey headers, subtle hover backgrounds, light grey borders

**Tooltip** - Small text (`text-xs`), popover background, compact padding

**Tabs** - Muted grey list background, active tab gets white background with shadow

**Progress** - Light grey track, Disrupt Green fill, 16px height

**Skeleton** - Muted grey with pulse animation

**Avatar** - 40px circular, muted fallback with initials

**Checkbox/Radio** - Disrupt Green border and fill when checked

**Switch** - Disrupt Green when on, muted grey when off

**Slider** - Light grey track, Disrupt Green range, white thumb with green border

**Chart** - Use brand colors in order: Disrupt Green → Platform Green → Blue → Yellow → Red

**Breadcrumb** - Muted grey links, warm black current page, small text

**Dropdown Menu** - Platform Green hover/focus, popover background, compact items

**Separator** - Light grey, 1px thickness

---

## Styling Strategy

### Priority 1: Semantic Tokens (Preferred)

Use shadcn semantic tokens for automatic light/dark mode adaptation:

- `bg-primary`, `text-primary-foreground` - Primary actions
- `bg-secondary`, `text-secondary-foreground` - Secondary backgrounds
- `bg-destructive`, `text-destructive-foreground` - Errors
- `bg-muted`, `text-muted-foreground` - Subtle elements
- `bg-accent`, `text-accent-foreground` - Hover states
- `bg-card`, `text-card-foreground` - Card backgrounds
- `border-border`, `border-input` - Borders
- `ring-ring` - Focus states

### Priority 2: Brand Color Scales (Specific Cases)

Use direct brand colors when semantic tokens don't fit:

- Status badges: `bg-disrupt-500`, `bg-info-500`, `bg-warning-500`
- Charts and data visualizations
- Brand moments (hero sections, marketing)

### Priority 3: Custom Utilities (Edge Cases)

Use Tailwind utilities for one-off designs and special cases.

---

## Accessibility Standards

All components must meet **WCAG 2.1 AA** minimum:

- **Contrast ratios** - 4.5:1 for text, 3:1 for UI components
- **Focus indicators** - Always visible, 2px ring, Disrupt Green
- **Touch targets** - Minimum 44×44px for interactive elements
- **Keyboard navigation** - Full Tab/Enter/Space support
- **Screen readers** - Proper ARIA labels and semantic HTML
- **Alt text** - Descriptive for images (empty for decorative)

Shadcn/ui components are accessible by default (built on Radix UI).

---

## Responsive Design

Follow **mobile-first** approach:

```tsx
// Full width on mobile, auto on larger screens
<Button className="w-full sm:w-auto">Responsive</Button>

// Stack on mobile, side-by-side on desktop
<div className="flex flex-col sm:flex-row gap-4">
```

For sidebars, use `collapsible="offcanvas"` to convert to slide-out sheet on mobile.

---

## Color Reference Quick Table

| Element         | Light Mode          | Dark Mode              | Token                   |
| --------------- | ------------------- | ---------------------- | ----------------------- |
| Primary CTA     | Disrupt #33D76F     | Disrupt 400 #57DF87    | `bg-primary`            |
| Body text       | Warm Black #222222  | Near White #FAFAFA     | `text-foreground`       |
| Secondary text  | Grey #888888        | Light Grey #A6A6A6     | `text-muted-foreground` |
| Card background | White #FFFFFF       | Warm Black 600 #1B1B1B | `bg-card`               |
| Border          | Light Grey #D9D9D9  | Dark Grey #333333      | `border-border`         |
| Focus ring      | Disrupt #33D76F     | Disrupt 400 #57DF87    | `ring-ring`             |
| Success         | Disrupt 500 #33D76F | Disrupt 400 #57DF87    | `bg-disrupt-500`        |
| Error           | Red 500 #F25116     | Red 400 #FF574B        | `bg-destructive`        |
| Warning         | Yellow 500 #FFD300  | Yellow 400 #FFE633     | `bg-warning-500`        |
| Info            | Blue 500 #00C5FF    | Blue 400 #33D4FF       | `bg-info-500`           |

---

## Performance Best Practices

- Use `React.memo()` for expensive components
- Lazy load heavy components (charts, rich editors)
- Implement virtualization for long lists/tables (e.g., `@tanstack/react-virtual`)
- Import only needed components to optimize bundle size

---

## Version History

- **1.1** (2025-10-15): Condensed for developer readability
- **1.0** (2025-10-14): Initial comprehensive style guide
- Based on POC component audit and Performics brand guidelines
- WCAG 2.1 AA compliant color system

---

**Related Documentation:**

- `docs/color-palette.md` - Complete color system and scales
- `docs/shadcn-setup.md` - Shadcn integration guide
- `CLAUDE.md` - General project guidelines
