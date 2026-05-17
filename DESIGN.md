# DESIGN.md — Convo Design System

> Authoritative style guide for all UI work in this codebase.
> Read this before writing any component, page, or style.

---

## Philosophy

Convo follows the **shadcn/ui philosophy**:

1. **Copy, don't black-box.** Components live in `shared/ui/src/` as readable, editable source — not locked in `node_modules`. Customize by editing the file directly.
2. **Composition over configuration.** Small, focused primitives composed together. No monolithic components with 20 props.
3. **Unstyled core, styled shell.** Radix UI handles accessibility and keyboard behavior. Tailwind handles visuals. Keep them separate.
4. **Dark mode is not optional.** Every component must have `dark:` variants from day one.

---

## How We Use shadcn/ui

We do **not** install shadcn as a dependency. Instead, we copy component source from shadcn into `shared/ui/src/` and own it from there. This means:

- You can read and modify every component
- No upstream breaking changes affect you silently
- Components are always exactly what the codebase needs — nothing more

### Getting a shadcn Component

When you need a new component that shadcn provides:

1. Go to [ui.shadcn.com/docs/components](https://ui.shadcn.com/docs/components)
2. Find the component — click **Manual** installation tab (not CLI)
3. Copy the source code into `shared/ui/src/ComponentName/ComponentName.web.tsx`
4. Copy any required dependencies it lists (e.g. Radix UI primitive)
5. Replace the shadcn `cn` import with your local one (see below)
6. Export it from `shared/ui/index.ts`

### The `cn` Utility

shadcn components use a `cn()` helper that merges Tailwind classes correctly. Ours lives in `shared/utils/index.ts`:

```ts
// shared/utils/index.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

When copying a shadcn component, replace:
```ts
// ❌ shadcn's import — doesn't exist in our project
import { cn } from '@/lib/utils'

// ✅ Ours
import { cn } from '@shared/utils'
```

### Dependencies shadcn Components Need

Install these as you copy components that require them:

| What | Package |
|------|---------|
| Class merging | `clsx` + `tailwind-merge` |
| CVA variants | `class-variance-authority` |
| Radix primitives | `@radix-ui/react-*` (per component) |
| Icons | `lucide-react` |

---

## Current Component Inventory

Components already in `shared/ui/src/`:

| Component | Status | Notes |
|-----------|--------|-------|
| `Button` | ✅ In use | Used in Login, Register |
| `Card` | ✅ In use | Used in Login, Register |
| `Input` | ✅ In use | Used in Login, Register |
| `Label` | ✅ In use | Used in Login, Register |

Add new components here as they're copied in.

---

## Styling Approach (Current Phase)

We are currently in **Phase 1** of the design system. This means:

- Plain Tailwind classes are used directly
- `dark:` prefix variants are used for dark mode
- No semantic token layer yet (coming in Phase 3 — see `DESIGN_SYSTEM_PLAN.md`)

### What This Looks Like in Practice

```tsx
// ✅ Correct for current phase — plain Tailwind + dark: variants
<div className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50" />

// ✅ Also correct — shadcn-style neutral palette usage
<p className="text-sm text-muted-foreground" />  // once tokens are wired up
```

### Color Palette

Use Tailwind's `gray` scale as the neutral palette (matches what Login/Register pages already use):

| Use | Light | Dark |
|-----|-------|------|
| Page background | `bg-gray-50` | `dark:bg-gray-950` |
| Card/surface | `bg-white` | `dark:bg-gray-900` |
| Primary text | `text-gray-900` | `dark:text-gray-50` |
| Secondary text | `text-gray-500` | `dark:text-gray-400` |
| Border | `border-gray-200` | `dark:border-gray-800` |
| Input background | `bg-white` | `dark:bg-gray-950` |

For brand/accent color — use `gray-900` (light) / `gray-50` (dark) for primary actions. This matches the current Login and Register buttons.

### Feedback Colors

```tsx
// Error
'text-red-500 dark:text-red-400'
'bg-red-50 dark:bg-red-900/10'

// Success (when needed)
'text-green-500 dark:text-green-400'

// Warning (when needed)
'text-yellow-500 dark:text-yellow-400'
```

---

## Component Conventions

### File Structure

```
shared/ui/src/
└── Button/
    ├── Button.web.tsx     ← component source
    └── index.ts           ← re-exports
```

Every component file follows this structure:

```tsx
// 1. Imports
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@shared/utils'

// 2. CVA variant definition
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-gray-300',
  {
    variants: {
      variant: {
        default:     'bg-gray-900 text-gray-50 hover:bg-gray-900/90 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90',
        destructive: 'bg-red-500 text-gray-50 hover:bg-red-500/90 dark:bg-red-900 dark:text-gray-50',
        outline:     'border border-gray-200 bg-white hover:bg-gray-100 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50',
        ghost:       'hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-50',
        link:        'text-gray-900 underline-offset-4 hover:underline dark:text-gray-50',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm:      'h-9 rounded-md px-3',
        lg:      'h-11 rounded-md px-8',
        icon:    'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

// 3. Props interface
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

// 4. Component — pass ref as a prop (React 19)
const Button = ({ className, variant, size, ref, ...props }: ButtonProps) => (
  <button
    ref={ref}
    className={cn(buttonVariants({ variant, size, className }))}
    {...props}
  />
)
Button.displayName = 'Button'

// 5. Named exports only
export { Button, buttonVariants }
```

### Rules

**Pass `ref` as a prop** — every component wrapping a DOM element. No `forwardRef` needed in React 19.

**Named exports only** — never `export default`. It breaks barrel file re-exports.

**Always `cn()`** — never manually concatenate class strings.

```tsx
// ❌ Wrong
className={`base-class ${isActive ? 'active' : ''} ${className}`}

// ✅ Correct
className={cn('base-class', isActive && 'active', className)}
```

**Spread order** — always in this order so consumer `className` can override:

```tsx
<div
  ref={ref}
  className={cn(variants({ variant, size }), className)}
  {...props}
/>
```

---

## Patterns Copied from shadcn

These are conventions shadcn uses that we follow exactly — consistency matters when copying components.

### Variant name: `default` not `primary`

```tsx
// ❌ Our old instinct
variant: 'primary'

// ✅ shadcn convention — use this
variant: 'default'
```

### `size: 'default'` not `size: 'md'`

Same reasoning — shadcn uses `default` for the base size.

### `destructive` not `danger`

```tsx
// ❌
variant: 'danger'

// ✅ shadcn convention
variant: 'destructive'
```

### Compound components for Card, Dialog, etc.

shadcn breaks complex components into named sub-components. Follow the same pattern:

```tsx
// ✅ shadcn-style compound component
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Subtitle</CardDescription>
  </CardHeader>
  <CardContent>Body content</CardContent>
  <CardFooter>Actions</CardFooter>
</Card>
```

Each sub-component (`CardHeader`, `CardTitle`, etc.) accepts `ref` as a prop and is exported from the same file.

---

## Focus Styles

Every interactive element must have a visible focus ring. Use this exact pattern (matches shadcn):

```tsx
'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 dark:focus-visible:ring-gray-300'
```

Never rely on the browser's default focus outline.

---

## Disabled States

Always handle disabled both visually and functionally:

```tsx
'disabled:pointer-events-none disabled:opacity-50'
```

---

## Accessibility

- **Radix UI for complex components** — Dialog, Dropdown, Tooltip, Select, Popover. Never implement ARIA patterns from scratch.
- **`aria-label` on icon-only buttons** — always.
- **`aria-invalid` on error inputs** — pair with visual error state.
- **Keyboard navigable** — every action must be reachable without a mouse.

---

## Dark Mode

Dark mode is toggled by adding the `dark` class to `<html>` (via `ThemeProvider`). Tailwind's `dark:` prefix handles the rest.

```tsx
// Every component must have dark: variants
<div className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50" />
```

When copying a shadcn component, its `dark:` variants are already included — don't strip them.

---

## Adding a New Component

1. **Check shadcn first** — [ui.shadcn.com/docs/components](https://ui.shadcn.com/docs/components). If it exists, copy the manual install source.
2. **Place it** in `shared/ui/src/ComponentName/ComponentName.web.tsx`
3. **Fix the `cn` import** — change `@/lib/utils` to `@shared/utils`
4. **Install any new Radix deps** it requires
5. **Pass `ref` as a prop** if the copied source uses `forwardRef`, remove it and pass `ref` directly (React 19)
6. **Test light and dark mode**
7. **Export** from `shared/ui/src/ComponentName/index.ts` and `shared/ui/index.ts`
8. **Update the component inventory table** in this file

---

## What NOT to Do

| ❌ Don't | ✅ Do instead |
|----------|--------------|
| Install shadcn as a dependency | Copy source into `shared/ui/src/` |
| Import `cn` from anywhere except `@shared/utils` | `import { cn } from '@shared/utils'` |
| Use `export default` | Use named exports |
| Use `forwardRef` | Remove `forwardRef` and pass `ref` as prop (React 19) |
| Concatenate class strings manually | Use `cn()` |
| Use raw hex codes in components | Use Tailwind classes |
| Name variants `primary`/`danger`/`md` | Use shadcn names: `default`/`destructive`/`default` |
| Build ARIA patterns from scratch | Use Radix UI primitives |
| Strip `dark:` variants when copying | Keep all dark variants from shadcn source |
| Put business logic in `shared/ui` | UI is purely presentational |

---

## File Locations

| What | Where |
|------|-------|
| UI components | `shared/ui/src/ComponentName/` |
| `cn` utility | `shared/utils/index.ts` |
| Theme provider | `apps/web/src/providers/theme.provider.tsx` |
| CSS variables (Phase 3) | `apps/web/src/index.css` |
| Design tokens (Phase 3) | `shared/tokens/src/` |
| Tailwind config | `apps/web/tailwind.config.ts` |
| Phased rollout plan | `DESIGN_SYSTEM_PLAN.md` |

---

## Related Documents

- [`DESIGN_SYSTEM_PLAN.md`](./DESIGN_SYSTEM_PLAN.md) — what to build and when
- [`docs/frontend/architecture.md`](./docs/frontend/architecture.md) — frontend architecture overview
