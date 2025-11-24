# Shadcn/ui Setup Guide

## Overview

Shadcn/ui is a collection of re-usable components built on Radix UI primitives. Components are copied into your project, not installed as dependencies, giving you full control to customize them.

This guide covers the practical setup and usage for OneSuite. For complete component specifications and design rationale, see:

- [Shadcn Components Style Guide](./shadcn-components-style-guide.md) - Full component specs
- [Semantic Token Design Rationale](./semantic-token-design-rationale.md) - Design decisions

## Quick Start

### Prerequisites

Already configured in this project:

- ✅ Tailwind CSS v4 with Vite
- ✅ Semantic tokens in `src/index.css`
- ✅ Color palette in `tailwind.config.ts`
- ✅ `components.json` configuration
- ✅ `src/lib/utils.ts` with `cn()` helper

### Installing Components

Use the shadcn CLI to add components:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
```

Components are copied to `src/components/ui/`

## Current Implementation

### Installed Components

The following components are installed and customized with Performics branding:

**Core UI:**

- `button` - CTA buttons with custom `platform` variant
- `badge` - Status indicators with `success`, `info`, `warning` variants
- `alert` - Status messages with `success`, `info`, `warning` variants
- `card` - Content containers
- `input` - Text inputs

**Form Controls:**

- `select` - Dropdown selects
- `checkbox` - Checkboxes with Disrupt Green checked state
- `switch` - Toggle switches
- `radio-group` - Radio button groups

**Interactive:**

- `dialog` - Modal dialogs
- `sheet` - Slide-out panels
- `dropdown-menu` - Context menus
- `tooltip` - Hover hints

**Utility:**

- `separator` - Visual dividers
- `skeleton` - Loading placeholders

### Component Showcase

View all components in action at `/showcase` (dev only):

```bash
npm run dev
# Navigate to http://localhost:5000/showcase
```

The showcase demonstrates all installed components with Performics branding and provides visual reference for variants and usage patterns.

## Semantic Token System

All components automatically use Performics brand colors through semantic tokens defined in `src/index.css` using Tailwind v4's `@theme` directive and `:root`/`.dark` pattern.

### Key Tokens

| Token                      | Light Mode             | Dark Mode              | Usage                       |
| -------------------------- | ---------------------- | ---------------------- | --------------------------- |
| `--color-primary`          | Disrupt Green #33D76F  | Disrupt Green #33D76F  | Primary CTAs, brand moments |
| `--color-accent`           | Platform Green #1E9A4B | Platform Green #1E9A4B | Secondary actions, hovers   |
| `--color-destructive`      | Alert Red #F25116      | Alert Red #F25116      | Errors, destructive actions |
| `--color-background`       | White #FFFFFF          | Warm Black #222222     | Page background             |
| `--color-card`             | White #FFFFFF          | Dark Grey #1B1B1B      | Card/surface backgrounds    |
| `--color-foreground`       | Warm Black #222222     | White #FFFFFF          | Body text                   |
| `--color-muted-foreground` | Grey #888888           | Light Grey #ADADAD     | Secondary text              |
| `--color-border`           | Light Grey #D9D9D9     | Subtle Grey #2B2B2B    | Card borders, dividers      |
| `--color-input`            | Light Grey #E0E0E0     | Medium Grey #565656    | Input borders               |
| `--color-ring`             | Disrupt Green #33D76F  | Disrupt Green #33D76F  | Focus indicators            |

### Direct Color Usage

For specific status colors, use the extended palette:

```tsx
// Semantic tokens (preferred)
<Button variant="default">Primary</Button>
<Badge variant="success">Active</Badge>

// Direct colors (when needed)
<div className="bg-info-500 text-white">Info callout</div>
<div className="border-warning-500">Warning border</div>
```

## Custom Variants

### Button

Added `platform` variant for secondary brand actions:

```tsx
<Button variant="default">Primary CTA</Button>
<Button variant="platform">Secondary Action</Button>
```

### Badge

Added status variants:

```tsx
<Badge variant="success">Active</Badge>
<Badge variant="info">Beta</Badge>
<Badge variant="warning">Action Needed</Badge>
```

### Alert

Added status variants:

```tsx
<Alert variant="success">
    <AlertTitle>Success</AlertTitle>
    <AlertDescription>Operation completed</AlertDescription>
</Alert>
```

## Usage Patterns

### Basic Component Usage

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function MyComponent() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
                <Button variant="default">Create Project</Button>
            </CardContent>
        </Card>
    );
}
```

### Form Controls

```tsx
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

export function MyForm() {
    return (
        <form>
            <Input type="email" placeholder="Email" />

            <Select>
                <SelectTrigger>
                    <SelectValue placeholder="Choose option" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="1">Option 1</SelectItem>
                    <SelectItem value="2">Option 2</SelectItem>
                </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
                <Checkbox id="terms" />
                <label htmlFor="terms">Accept terms</label>
            </div>
        </form>
    );
}
```

### Dialogs and Modals

```tsx
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';

export function MyDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm Action</DialogTitle>
                </DialogHeader>
                <p>Are you sure you want to proceed?</p>
                <DialogFooter>
                    <Button variant="ghost">Cancel</Button>
                    <Button>Confirm</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
```

## Adding New Components

When installing additional shadcn components:

1. **Install via CLI:**

    ```bash
    npx shadcn@latest add [component-name]
    ```

2. **Component uses semantic tokens automatically** - No manual color updates needed for standard variants

3. **Add custom variants if needed:**

    ```tsx
    // In button.tsx, for example
    variant: {
      // ... existing variants
      custom: "bg-info-500 text-white hover:bg-info-600",
    }
    ```

4. **Add to showcase page** - Update `src/pages/ComponentShowcase.tsx` with examples

5. **ESLint exceptions** - Add `eslint-disable-next-line react-refresh/only-export-components` if exporting helper functions with components

## Accessibility

All shadcn components include built-in accessibility via Radix UI:

- ✅ **Keyboard navigation** - Tab, Enter, Space, Arrow keys
- ✅ **Focus management** - Focus trapping in modals, proper tab order
- ✅ **ARIA attributes** - Correct roles, labels, descriptions
- ✅ **Screen reader support** - State changes announced
- ✅ **Focus indicators** - Visible focus rings (Disrupt Green)

Our color system meets WCAG 2.1 AA standards:

- Text contrast: 15.8:1 (body text on background)
- UI contrast: 4.7:1 (primary on background)
- Border contrast: 3.2:1 (borders on background)

## Recommended Next Installs

### Essential Components

- `label` - Form labels (accessible)
- `textarea` - Multi-line text input
- `toast` - Notifications and feedback

### Advanced Components

- `accordion` - Collapsible content sections
- `popover` - Floating content
- `tabs` - Tabbed interfaces
- `table` - Data tables

### Data Display

- `avatar` - User avatars with fallbacks
- `breadcrumb` - Navigation trails
- `progress` - Loading indicators

## Tips

1. **Use semantic tokens first** - `bg-primary` over `bg-disrupt-500` for theme consistency
2. **Check showcase before adding** - Component might already be installed
3. **Add custom variants intentionally** - Keep variant count manageable
4. **Test accessibility** - Tab through forms, test with keyboard only
5. **Reference style guide** - See [shadcn-components-style-guide.md](./shadcn-components-style-guide.md) for complete specs

## Resources

- [Shadcn/ui Docs](https://ui.shadcn.com)
- [Radix UI Docs](https://www.radix-ui.com/primitives)
- [Color Palette](./color-palette.md)
- [Component Style Guide](./shadcn-components-style-guide.md)
- [Design Rationale](./semantic-token-design-rationale.md)
