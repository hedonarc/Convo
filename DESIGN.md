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

## ⚠️ Brand Color & Theming — Read This First

The brand color is **`#F56565`** (red). It is **never written as a raw hex or a Tailwind color name** in component code. It lives in one place only — the CSS variables in `apps/web/src/index.css` — and is referenced everywhere else through semantic Tailwind tokens.

### The CSS Variables (source of truth)

```css
/* apps/web/src/index.css */
:root {
  --color-brand: #f56565;
  --color-brand-foreground: #ffffff;
  --color-background: var(--color-gray-50);
  --color-surface: var(--color-white);
  --color-text-primary: var(--color-gray-950);
  --color-text-secondary: var(--color-gray-500);
  --color-border: var(--color-gray-200);
  --color-input: transparent;
  --color-ring: #f56565;
}

.dark {
  --color-brand: #f56565;
  --color-brand-foreground: #ffffff;
  --color-background: var(--color-gray-950);
  --color-surface: var(--color-gray-950);
  --color-text-primary: var(--color-gray-50);
  --color-text-secondary: var(--color-gray-400);
  --color-border: var(--color-gray-800);
  --color-input: transparent;
  --color-ring: #f56565;
}
```

### Semantic Tokens → Tailwind Classes

These tokens are wired into `tailwind.config.ts` and must be used in all components:

| Purpose                      | Tailwind class                           | ❌ Never use                         |
| ---------------------------- | ---------------------------------------- | ------------------------------------ |
| Brand / primary action color | `bg-brand`, `text-brand`, `border-brand` | `bg-red-500`, `#F56565`              |
| Text on brand background     | `text-brand-foreground`                  | `text-white`, `text-gray-50`         |
| Focus ring                   | `ring-ring`                              | `ring-gray-950`, `ring-gray-300`     |
| Page background              | `bg-background`                          | `bg-gray-50`, `bg-gray-950`          |
| Card / surface background    | `bg-surface`                             | `bg-white`, `bg-gray-900`            |
| Primary text                 | `text-text-primary`                      | `text-gray-900`, `text-gray-50`      |
| Secondary / muted text       | `text-text-secondary`                    | `text-gray-500`, `text-gray-400`     |
| Borders                      | `border-border`                          | `border-gray-200`, `border-gray-800` |
| Input background             | `bg-input`                               | `bg-white`, `bg-transparent`         |

### The Rule in Plain English

> **If a class contains a raw gray number (`gray-50`, `gray-200`, `gray-900`, etc.) or a hex value, it is wrong — unless it is a semantic exception listed below.**

Dark mode is already handled by the CSS variables. You never need `dark:` variants for semantic tokens:

```tsx
// ❌ Wrong — hardcoded, breaks if theme changes
<div className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50 border-gray-200 dark:border-gray-800" />

// ✅ Correct — semantic, theme-aware, no dark: needed
<div className="bg-surface text-text-primary border-border" />

// ❌ Wrong — hardcoded brand
<button className="bg-gray-900 text-gray-50 dark:bg-gray-50 dark:text-gray-900" />

// ✅ Correct — brand token
<button className="bg-brand text-brand-foreground" />

// ❌ Wrong — hardcoded ring
className="focus-visible:ring-gray-950 dark:focus-visible:ring-gray-300"

// ✅ Correct — ring token
className="focus-visible:ring-ring"

// ❌ Wrong — hardcoded link
<a className="text-gray-900 dark:text-gray-50" />

// ✅ Correct
<a className="text-brand hover:text-brand/80" />

// ❌ Wrong — hardcoded muted text
<p className="text-gray-500 dark:text-gray-400" />

// ✅ Correct
<p className="text-text-secondary" />
```

### Permitted Exceptions (hardcoded colors that are intentional)

Some colors are semantic and should **not** use brand tokens:

| Use case                   | Allowed classes                                                                          | Reason                          |
| -------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------- |
| Error states, validation   | `text-red-500`, `border-red-500`, `bg-red-50`, `dark:text-red-400`, `dark:bg-red-900/10` | Semantic error color, not brand |
| Required field marker `*`  | `text-red-500 dark:text-red-400`                                                         | Semantic indicator              |
| Success states             | `text-green-500 dark:text-green-400`                                                     | Semantic success color          |
| Warning states             | `text-yellow-500 dark:text-yellow-400`                                                   | Semantic warning color          |
| Destructive button variant | `bg-red-500 text-gray-50 hover:bg-red-500/90`                                            | Intentional danger color        |

For **everything else** — backgrounds, text, borders, rings, interactive states — use semantic tokens.

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
6. **Replace all hardcoded gray classes with semantic tokens** (see table above) — shadcn ships with hardcoded grays; always update them
7. Export it from `shared/ui/index.ts`

### The `cn` Utility

shadcn components use a `cn()` helper that merges Tailwind classes correctly. Ours lives in `shared/utils/index.ts`:

```ts
// shared/utils/index.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

When copying a shadcn component, replace:

```ts
// ❌ shadcn's import — doesn't exist in our project
import { cn } from "@/lib/utils";

// ✅ Ours
import { cn } from "@shared/utils";
```

### Dependencies shadcn Components Need

Install these as you copy components that require them:

| What             | Package                             |
| ---------------- | ----------------------------------- |
| Class merging    | `clsx` + `tailwind-merge`           |
| CVA variants     | `class-variance-authority`          |
| Radix primitives | `@radix-ui/react-*` (per component) |
| Icons            | `lucide-react`                      |

---

## Current Component Inventory

Components already in `shared/ui/src/`:

| Component | Status    | Notes                                                          |
| --------- | --------- | -------------------------------------------------------------- |
| `Button`  | ✅ In use | `default` variant uses `bg-brand text-brand-foreground`        |
| `Card`    | ✅ In use | Uses `border-border bg-surface`                                |
| `Input`   | ✅ In use | Default state uses `border-border`                             |
| `Label`   | ✅ In use | Inherits `text-text-primary`; required `*` uses `text-red-500` |
| `FormField` | ✅ In use | Composes `Label` + `Input` + error text; `error` message drives the input error state |
| `ErrorBanner` | ✅ In use | Form-level error notice; `role="alert"`, semantic-exception red; renders null when no message |
| `AuthCard` | ✅ In use | Auth page shell — centered `Card` with title/description, `form`, and `footer` slot |
| `Modal` | ✅ In use | Standard dialog chrome — backdrop, ESC + click-outside to close, ARIA; compose with `ModalHeader` / `ModalFooter` |
| `Slider` | ✅ In use | Brand-styled native range input — visible thumb on WebKit/Firefox, hover/active scale feedback |

Add new components here as they're copied in.

---

## Styling Approach

Semantic CSS variables are live in `index.css` and wired into `tailwind.config.ts`. All components use semantic tokens — never raw Tailwind grays or hex values (see the theming section above).

### Color Palette Reference

Use these semantic tokens everywhere. Raw Tailwind grays are only permitted in the `index.css` variable definitions and semantic exception cases (error/success/warning).

| Use              | Token                     | Light value | Dark value  |
| ---------------- | ------------------------- | ----------- | ----------- |
| Page background  | `bg-background`           | gray-50     | gray-950    |
| Card / surface   | `bg-surface`              | white       | gray-950    |
| Primary text     | `text-text-primary`       | gray-950    | gray-50     |
| Secondary text   | `text-text-secondary`     | gray-500    | gray-400    |
| Border           | `border-border`           | gray-200    | gray-800    |
| Input background | `bg-input`                | transparent | transparent |
| Brand color      | `bg-brand` / `text-brand` | #F56565     | #F56565     |
| On-brand text    | `text-brand-foreground`   | white       | white       |
| Focus ring       | `ring-ring`               | #F56565     | #F56565     |

### Feedback Colors (hardcoded — semantic exceptions)

```tsx
// Error
"text-red-500 dark:text-red-400";
"bg-red-50 dark:bg-red-900/10";
"border-red-500 dark:border-red-400";

// Success (when needed)
"text-green-500 dark:text-green-400";

// Warning (when needed)
"text-yellow-500 dark:text-yellow-400";
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
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@shared/utils";

// 2. CVA variant definition — use semantic tokens, never hardcoded grays
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-brand text-brand-foreground shadow hover:bg-brand/90",
        destructive:
          "bg-red-500 text-gray-50 shadow-sm hover:bg-red-500/90 dark:bg-red-900 dark:text-gray-50",
        outline:
          "border border-border bg-surface shadow-sm hover:bg-gray-100 hover:text-text-primary dark:hover:bg-gray-800",
        secondary:
          "bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-100/80 dark:bg-gray-800 dark:text-gray-50 dark:hover:bg-gray-800/80",
        ghost:
          "hover:bg-gray-100 hover:text-text-primary dark:hover:bg-gray-800 dark:hover:text-gray-50",
        link: "text-brand underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-sm",
        lg: "h-11 rounded-md px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

// 3. Props interface
export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

// 4. Component — pass ref as a prop (React 19)
const Button = ({ className, variant, size, ref, ...props }: ButtonProps) => (
  <button
    ref={ref}
    className={cn(buttonVariants({ variant, size, className }))}
    {...props}
  />
);
Button.displayName = "Button";

// 5. Named exports only
export { Button, buttonVariants };
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
variant: "primary";

// ✅ shadcn convention — use this
variant: "default";
```

### `size: 'default'` not `size: 'md'`

Same reasoning — shadcn uses `default` for the base size.

### `destructive` not `danger`

```tsx
// ❌
variant: "danger";

// ✅ shadcn convention
variant: "destructive";
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

Every interactive element must have a visible focus ring. Use this exact pattern — `ring-ring` automatically uses the brand color:

```tsx
"focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";
```

Never rely on the browser's default focus outline. Never hardcode `ring-gray-950` or `ring-gray-300`.

---

## Disabled States

Always handle disabled both visually and functionally:

```tsx
"disabled:pointer-events-none disabled:opacity-50";
```

---

## Accessibility

- **Radix UI for complex components** — Dialog, Dropdown, Tooltip, Select, Popover. Never implement ARIA patterns from scratch.
- **`aria-label` on icon-only buttons** — always.
- **`aria-invalid` on error inputs** — pair with visual error state.
- **Keyboard navigable** — every action must be reachable without a mouse.

---

## Dark Mode

Dark mode is toggled by adding the `dark` class to `<html>` (via `ThemeProvider`). When using semantic tokens (`bg-surface`, `text-text-primary`, `border-border`, etc.), dark mode is handled automatically — no `dark:` prefix needed for those classes.

```tsx
// ❌ Wrong — semantic tokens don't need dark: variants
<div className="bg-surface dark:bg-gray-950 text-text-primary dark:text-gray-50" />

// ✅ Correct — semantic token handles both modes
<div className="bg-surface text-text-primary" />
```

Only use `dark:` prefixes for the permitted exception colors (error/success/warning feedback) and for the `secondary` / `ghost` / `outline` button hover states where raw grays are used for subtle UI chrome.

When copying a shadcn component, its `dark:` variants are included for hardcoded grays — replace those grays with semantic tokens and drop the `dark:` pair entirely.

---

## Adding a New Component

1. **Check shadcn first** — [ui.shadcn.com/docs/components](https://ui.shadcn.com/docs/components). If it exists, copy the manual install source.
2. **Place it** in `shared/ui/src/ComponentName/ComponentName.web.tsx`
3. **Fix the `cn` import** — change `@/lib/utils` to `@shared/utils`
4. **Replace hardcoded grays with semantic tokens** — shadcn ships with raw gray values; always update them using the token table above. This is mandatory, not optional.
5. **Install any new Radix deps** it requires
6. **Pass `ref` as a prop** if the copied source uses `forwardRef`, remove it and pass `ref` directly (React 19)
7. **Test light and dark mode**
8. **Export** from `shared/ui/src/ComponentName/index.ts` and `shared/ui/index.ts`
9. **Update the component inventory table** in this file

---

## What NOT to Do

| ❌ Don't                                               | ✅ Do instead                                         |
| ------------------------------------------------------ | ----------------------------------------------------- |
| Install shadcn as a dependency                         | Copy source into `shared/ui/src/`                     |
| Import `cn` from anywhere except `@shared/utils`       | `import { cn } from '@shared/utils'`                  |
| Use `export default`                                   | Use named exports                                     |
| Use `forwardRef`                                       | Remove `forwardRef` and pass `ref` as prop (React 19) |
| Concatenate class strings manually                     | Use `cn()`                                            |
| Use raw hex codes in components                        | Use Tailwind semantic token classes                   |
| Use `bg-gray-900 dark:bg-gray-50` for primary actions  | Use `bg-brand text-brand-foreground`                  |
| Use `text-gray-900 dark:text-gray-50` for body text    | Use `text-text-primary`                               |
| Use `text-gray-500 dark:text-gray-400` for muted text  | Use `text-text-secondary`                             |
| Use `border-gray-200 dark:border-gray-800` for borders | Use `border-border`                                   |
| Use `ring-gray-950 dark:ring-gray-300` for focus       | Use `ring-ring`                                       |
| Use `text-gray-900 dark:text-gray-50` for links        | Use `text-brand hover:text-brand/80`                  |
| Keep shadcn's hardcoded grays when copying             | Replace with semantic tokens (step 4 above)           |
| Name variants `primary`/`danger`/`md`                  | Use shadcn names: `default`/`destructive`/`default`   |
| Build ARIA patterns from scratch                       | Use Radix UI primitives                               |
| Strip `dark:` variants when copying                    | Replace them with semantic tokens instead             |
| Put business logic in `shared/ui`                      | UI is purely presentational                           |

---

## File Locations

| What                                       | Where                                       |
| ------------------------------------------ | ------------------------------------------- |
| UI components                              | `shared/ui/src/ComponentName/`              |
| `cn` utility                               | `shared/utils/index.ts`                     |
| CSS variables (source of truth for colors) | `apps/web/src/index.css`                    |
| Tailwind token wiring                      | `apps/web/tailwind.config.ts`               |
| Theme provider                             | `apps/web/src/providers/theme.provider.tsx` |

---

## Related Documents

- [`docs/frontend/architecture.md`](./docs/frontend/architecture.md) — frontend architecture overview
