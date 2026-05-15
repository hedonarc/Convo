# Design System Plan — Convo

> Practical, phased plan based on the current state of the app (Login, Register, Landing pages with plain Tailwind + dark: classes).

---

## Current State

You already have:
- Tailwind CSS configured
- `dark:` classes used throughout (`dark:bg-gray-950`, `dark:text-gray-50`)
- `shared/ui` with `Button`, `Card`, `Input`, `Label` components
- No theme toggle yet — dark mode isn't wired up

You don't need a token system, CVA variants, or flavors yet. Build only what the app needs.

---

## Phase 1 — Dark Mode (Do This Now)

**Goal:** Make the existing `dark:` classes actually respond to a user toggle.

### 1.1 Update Tailwind Config

```ts
// apps/web/tailwind.config.ts
export default {
  darkMode: 'class', // toggles dark mode via .dark class on <html>
  content: [
    './src/**/*.{ts,tsx}',
    '../../shared/ui/**/*.{ts,tsx}',
  ],
}
```

### 1.2 Add ThemeProvider

```tsx
// apps/web/src/providers/theme.provider.tsx
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

const ThemeContext = createContext<{
  theme: Theme
  toggle: () => void
}>(null!)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('theme') as Theme) ?? 'light'
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggle = () => setTheme(t => (t === 'light' ? 'dark' : 'light'))

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
```

### 1.3 Mount in Root Layout

```tsx
// apps/web/src/app/layouts/root.layout.tsx
import { Outlet } from 'react-router'
import { ThemeProvider } from '../../providers/theme.provider'

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Outlet />
    </ThemeProvider>
  )
}
```

### 1.4 Add a Toggle (Wherever You Need It)

```tsx
import { useTheme } from '../providers/theme.provider'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button onClick={toggle}>
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  )
}
```

**Deliverables**
- [ ] `darkMode: 'class'` in `tailwind.config.ts`
- [ ] `theme.provider.tsx` created
- [ ] `root.layout.tsx` wraps with `ThemeProvider`
- [ ] `ThemeToggle` component added to the nav/header

---

## Phase 2 — Component Hardening (When You Have 5+ Pages)

**Goal:** Make `shared/ui` components handle all their states properly.

Don't do this now. Come back when you're building the chat UI and you notice components needing error states, loading states, or size variants.

### What to Add Per Component

| Component | Missing States to Add |
|-----------|----------------------|
| `Button`  | `loading` prop, `disabled` styling, `size` variants (sm/md/lg) |
| `Input`   | `error` state with red border, `disabled` state |
| `Card`    | Already sufficient for now |
| `Label`   | `required` indicator (red asterisk) |

### Pattern to Follow (Button Example)

```tsx
// shared/ui/src/Button/Button.web.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
}

export function Button({ loading, size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md font-medium
        transition-colors disabled:opacity-50 disabled:cursor-not-allowed
        ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  )
}
```

No CVA needed at this scale. Plain string interpolation is fine.

**Deliverables**
- [ ] `Button` — loading + size variants
- [ ] `Input` — error + disabled states
- [ ] `Label` — required indicator

---

## Phase 3 — Design Tokens (When You Need to Retheme)

**Goal:** Replace scattered Tailwind color literals with semantic CSS variables.

Don't do this until one of these is true:
- You want to change the brand color across the whole app in one place
- Mobile (Expo/NativeWind) is being actively built
- You have 10+ components and colors feel inconsistent

### What It Looks Like When You Get There

```css
/* apps/web/src/index.css */
:root {
  --color-brand: #3b82f6;
  --color-text-primary: #030712;
  --color-surface: #ffffff;
  --color-border: #e5e7eb;
}

.dark {
  --color-text-primary: #f9fafb;
  --color-surface: #0f172a;
  --color-border: #1f2937;
}
```

```ts
// tailwind.config.ts — extend with CSS vars
colors: {
  brand: 'var(--color-brand)',
  'text-primary': 'var(--color-text-primary)',
  surface: 'var(--color-surface)',
  border: 'var(--color-border)',
}
```

Then components use `bg-surface`, `text-text-primary` instead of `bg-white dark:bg-gray-950`.

**Deliverables** *(future)*
- [ ] `shared/tokens/` directory with semantic values
- [ ] CSS variables in `index.css`
- [ ] Tailwind config updated to use CSS vars
- [ ] Existing components migrated from literal colors to token classes

---

## What to Skip Entirely

These were in the original plan. They're not relevant for this project at this stage:

| Item | Why Skip |
|------|----------|
| Primitive token taxonomy | You have ~10 gray shades, not a design system at scale |
| CVA (class-variance-authority) | Plain string interpolation is sufficient |
| Style Dictionary / token generation scripts | Premature automation |
| Storybook | Not worth the setup for a solo project |
| Flavors / white-labeling | Convo is not a white-label product |
| `data-flavor` attribute system | See above |

---

## Execution Order

```
Phase 1: Dark mode toggle     ████████████░░░░░░░░  ~2 hours   ← do this now
Phase 2: Component states     ░░░░░░░████████░░░░░  ~half day  ← when building chat UI
Phase 3: Design tokens        ░░░░░░░░░░░░████████  ~1 day     ← when mobile starts
```

Each phase is independent. Stop after Phase 1 and the app is fully functional for theming.

---

## File Checklist

| File | Status | Phase |
|------|--------|-------|
| `apps/web/tailwind.config.ts` | Update `darkMode: 'class'` | 1 |
| `apps/web/src/providers/theme.provider.tsx` | Create | 1 |
| `apps/web/src/app/layouts/root.layout.tsx` | Add ThemeProvider | 1 |
| `apps/web/src/components/ThemeToggle.tsx` | Create | 1 |
| `shared/ui/src/Button/Button.web.tsx` | Add loading + sizes | 2 |
| `shared/ui/src/Input/Input.web.tsx` | Add error + disabled | 2 |
| `shared/tokens/` | Create token directory | 3 |
| `apps/web/src/index.css` | Add CSS variables | 3 |
