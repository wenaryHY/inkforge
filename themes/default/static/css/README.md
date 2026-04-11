# The Radiant Minimalist Design System

This design system implements the editorial profile and login redesign specifications.

## Usage

Include the design system CSS in your HTML templates:

```html
<link rel="stylesheet" href="{{ theme_assets_url('css/design-system.css') }}">
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
```

## Design Principles

1. **NO 1px borders** - Use background color variations for visual separation
2. **Large rounded corners** - 28px-48px for premium feel
3. **Glassmorphism** - backdrop-filter blur effects
4. **Solid color buttons** - No gradients
5. **Warm color palette** - Orange (#FF6D00) primary with warm neutrals

## Color System

### Surface Layers (No-Line Rule)
- `--surface` (#fff8f6) - Base layer
- `--surface-container-low` (#fff1eb) - Content sections
- `--surface-container` (#feeae2) - Interactive cards
- `--surface-container-high` (#f9e4db) - Primary focus areas

### Primary Colors
- `--primary` (#FF6D00) - Orange primary
- `--primary-container` (#fd6c00)
- `--primary-dark` (#a14200)

### Text Colors (Never Pure Black)
- `--on-surface` (#3d2f29) - Warm dark text
- `--on-surface-variant` (#6b5d56) - Secondary text
- `--on-surface-muted` (#8f8179) - Muted text

## Typography

### Font Families
- **Display/Headings**: Manrope
- **Body/UI**: Plus Jakarta Sans

### Type Scale
- `.display-large` - 3.5rem, 700 Bold, -0.02em
- `.headline-medium` - 1.75rem, 600 Semi-Bold, -0.01em
- `.title-large` - 1.375rem, 600
- `.body-large` - 1rem, 400 Regular, 0.01em
- `.label-medium` - 0.75rem, 500 Medium, 0.05em

## Border Radius

- `--radius-sm` (12px) - Small elements
- `--radius-md` (16px) - Inputs
- `--radius-lg` (32px) - Cards
- `--radius-xl` (48px) - Large cards
- `--radius-full` (9999px) - Pill-shaped buttons

## Components

### Buttons
```html
<button class="btn btn-primary">Primary Action</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-ghost">Ghost</button>
```

### Cards
```html
<div class="card-lg">Card with 32px radius</div>
<div class="card-xl">Card with 48px radius</div>
<div class="card-glass">Glassmorphic card</div>
```

### Form Inputs
```html
<label class="label">Label Text</label>
<input class="input" type="text" placeholder="Enter text">
<textarea class="textarea"></textarea>
<select class="select"></select>
```

### Alerts
```html
<div class="alert alert-success">Success message</div>
<div class="alert alert-error">Error message</div>
```

### Glassmorphism
```html
<div class="glass">Standard glass effect</div>
<div class="glass-strong">Stronger blur</div>
<div class="glass-card">Glass card with shadow</div>
```

## Spacing Scale

- `--space-xs` (8px)
- `--space-sm` (12px)
- `--space-md` (16px)
- `--space-lg` (24px)
- `--space-xl` (32px)
- `--space-2xl` (48px)
- `--space-3xl` (64px)

## Utility Classes

### Spacing
- `.mt-{size}`, `.mb-{size}` - Margin top/bottom
- `.p-{size}` - Padding
- `.gap-{size}` - Gap for flex/grid

### Layout
- `.flex`, `.flex-col` - Flexbox
- `.items-center` - Align items center
- `.justify-between` - Justify space between

### Text
- `.text-muted` - Muted text color
- `.text-primary` - Primary color text

## Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## Requirements Validation

This design system satisfies:
- ✅ Requirement 1.1: No 1px borders, background color variations
- ✅ Requirement 1.2: Border-radius 28px-48px for cards
- ✅ Requirement 1.3: Glassmorphic effects with backdrop-filter
- ✅ Requirement 1.4: Solid color buttons without gradients
- ✅ Requirement 1.5: Manrope and Plus Jakarta Sans fonts
- ✅ Requirement 1.6: Orange (#FF6D00) primary with warm neutrals
