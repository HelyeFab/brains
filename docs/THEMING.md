# Theming Guide

## Overview

Brains uses a CSS variable-based theming system powered by Tailwind CSS, supporting both dark and light modes with seamless transitions.

## Theme Architecture

### CSS Variables

All theme colors are defined as HSL CSS variables in `src/styles/globals.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  /* ... more variables */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... dark mode overrides */
}
```

### Tailwind Configuration

`tailwind.config.cjs` extends the theme with CSS variable references:

```javascript
theme: {
  extend: {
    colors: {
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',
      primary: {
        DEFAULT: 'hsl(var(--primary))',
        foreground: 'hsl(var(--primary-foreground))',
      },
      // ... more color definitions
    }
  }
}
```

## Using Themes

### Applying Theme Colors

Use Tailwind utility classes that reference CSS variables:

```tsx
// Background colors
<div className="bg-background text-foreground" />

// Primary colors
<button className="bg-primary text-primary-foreground" />

// Card styling
<div className="bg-card text-card-foreground border border-border" />
```

### Theme Toggle

The theme is managed by `useThemeStore`:

```typescript
import { useThemeStore } from '@/stores/useThemeStore';

function MyComponent() {
  const { theme, toggleTheme, setTheme } = useThemeStore();
  
  return (
    <button onClick={toggleTheme}>
      Current: {theme}
    </button>
  );
}
```

### Theme Application

`AppShell` automatically applies the theme class to the document root:

```typescript
useEffect(() => {
  const root = window.document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
}, [theme]);
```

## Color System

### Semantic Colors

| Variable | Purpose | Light Mode | Dark Mode |
|----------|---------|------------|-----------|
| `background` | Page background | White | Dark gray |
| `foreground` | Primary text | Dark | Light |
| `card` | Card backgrounds | Off-white | Darker gray |
| `primary` | Primary actions | Blue | Blue |
| `secondary` | Secondary UI | Light gray | Medium gray |
| `muted` | Disabled/subtle | Gray | Dark gray |
| `accent` | Highlights | Light blue | Medium blue |
| `destructive` | Errors/delete | Red | Red |

### Border & Ring Colors

- `border` - UI element borders
- `input` - Input field borders
- `ring` - Focus ring color

## Adding Custom Themes

### 1. Define CSS Variables

Add new theme in `globals.css`:

```css
[data-theme="ocean"] {
  --background: 210 100% 95%;
  --foreground: 210 100% 10%;
  --primary: 200 100% 40%;
  /* ... */
}
```

### 2. Update Theme Store

Extend `useThemeStore` to support custom themes:

```typescript
interface ThemeStore {
  theme: 'light' | 'dark' | 'ocean';
  // ...
}
```

### 3. Apply Custom Theme

```typescript
const { setTheme } = useThemeStore();
setTheme('ocean');
```

## Per-Widget Theming

Widgets can have custom colors via the `color` property:

```typescript
// In Sidebar.tsx
const colorOptions = [
  { name: 'Blue', value: 'bg-blue-500' },
  { name: 'Green', value: 'bg-green-500' },
  // ...
];

// Usage
updateWidget(widgetId, { color: 'bg-blue-500' });
```

Widget color appears as a sidebar indicator:

```tsx
{widget.color && (
  <div className={cn('w-1 h-full absolute left-0 top-0', widget.color)} />
)}
```

## Theme Persistence

Themes are automatically persisted to localStorage via Zustand middleware:

- Storage key: `brains-theme-storage`
- Survives app restarts
- Hydrates on mount

## Terminal Theming

Terminal widget has its own color scheme in `TerminalWidget.tsx`:

```typescript
const term = new Terminal({
  theme: {
    background: '#0a0a0a',
    foreground: '#e0e0e0',
    cursor: '#00ff00',
    black: '#000000',
    red: '#ff5555',
    // ... ANSI colors
  },
});
```

### Sync Terminal with App Theme

```typescript
const { theme } = useThemeStore();

const terminalTheme = theme === 'dark' ? {
  background: '#0a0a0a',
  foreground: '#e0e0e0',
} : {
  background: '#ffffff',
  foreground: '#000000',
};
```

## Recharts Theming

System monitor charts use CSS variables for theming:

```tsx
<Tooltip
  contentStyle={{
    backgroundColor: 'hsl(var(--popover))',
    border: '1px solid hsl(var(--border))',
  }}
/>

<YAxis
  tick={{ fill: 'hsl(var(--muted-foreground))' }}
/>
```

## Dark Mode Best Practices

### 1. Always Use Semantic Variables

❌ Don't:
```tsx
<div className="bg-white text-black" />
```

✅ Do:
```tsx
<div className="bg-background text-foreground" />
```

### 2. Test Both Themes

Always verify components in both light and dark modes.

### 3. Consider Contrast

Ensure WCAG AA compliance:
- Normal text: 4.5:1 contrast ratio
- Large text: 3:1 contrast ratio

### 4. Use Muted for Secondary Text

```tsx
<p className="text-muted-foreground">Secondary information</p>
```

## Animation & Transitions

Theme switches are smoothed with CSS transitions:

```css
* {
  transition: background-color 0.2s ease, color 0.2s ease;
}
```

Disable for specific elements:

```tsx
<div className="transition-none" />
```

## System Preference Detection

Add system theme detection:

```typescript
useEffect(() => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleChange = (e: MediaQueryListEvent) => {
    setTheme(e.matches ? 'dark' : 'light');
  };
  
  mediaQuery.addEventListener('change', handleChange);
  return () => mediaQuery.removeEventListener('change', handleChange);
}, []);
```

## Troubleshooting

### Theme Not Applying

1. Check if `dark` class is on `<html>` element
2. Verify CSS variables are defined in `globals.css`
3. Ensure Tailwind is processing the theme config

### Colors Look Wrong

1. Check HSL format in CSS variables
2. Verify Tailwind config syntax
3. Clear Tailwind JIT cache: `npm run clean`

### Theme Persists Across Restarts

This is expected behavior via Zustand persistence. To reset:

```typescript
localStorage.removeItem('brains-theme-storage');
```

## Advanced Customization

### Multiple Color Schemes

Create theme presets:

```typescript
const themes = {
  light: { /* CSS variables */ },
  dark: { /* CSS variables */ },
  highContrast: { /* CSS variables */ },
  solarized: { /* CSS variables */ },
};
```

### Widget-Specific Themes

Pass theme overrides to widgets:

```typescript
<WidgetComponent 
  widgetId={id}
  themeOverrides={{
    background: '#custom',
    foreground: '#custom',
  }}
/>
```

### Export/Import Themes

```typescript
const exportTheme = () => {
  const styles = getComputedStyle(document.documentElement);
  const theme = {};
  // Extract all CSS variables
  return JSON.stringify(theme);
};

const importTheme = (json: string) => {
  const theme = JSON.parse(json);
  Object.entries(theme).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
};
```

## Resources

- [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [shadcn/ui Theming](https://ui.shadcn.com/docs/theming)
- [Radix UI Styling](https://www.radix-ui.com/primitives/docs/overview/styling)
