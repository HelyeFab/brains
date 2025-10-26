# Contributing to Brains

Thank you for your interest in contributing to Brains! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful, constructive, and professional in all interactions.

## Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/brains.git
   cd brains
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

## Development Workflow

### Branching Strategy

- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes

### Creating a Branch

```bash
git checkout -b feature/my-new-feature
```

### Committing Changes

Use conventional commits:

```
feat: add new widget type
fix: resolve terminal resize issue
docs: update README
style: format code
refactor: simplify widget store
test: add unit tests for utils
chore: update dependencies
```

### Pull Request Process

1. **Update your branch**
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Run tests** (when available)
   ```bash
   npm test
   ```

3. **Build to verify**
   ```bash
   npm run build:ui
   ```

4. **Create PR**
   - Write clear description
   - Reference related issues
   - Add screenshots for UI changes
   - Request review

5. **Address feedback**
   - Make requested changes
   - Push updates
   - Re-request review

## Development Guidelines

### TypeScript

- Use TypeScript for all new code
- Define interfaces for props and state
- Avoid `any` types
- Export types from `src/types/`

### React Components

- Use functional components with hooks
- Extract reusable logic to custom hooks
- Use proper prop types
- Clean up effects

Example:
```typescript
import React, { useState, useEffect } from 'react';

interface MyComponentProps {
  title: string;
  onClose: () => void;
}

export function MyComponent({ title, onClose }: MyComponentProps) {
  const [data, setData] = useState<string[]>([]);

  useEffect(() => {
    // Fetch data
    return () => {
      // Cleanup
    };
  }, []);

  return <div>{title}</div>;
}
```

### Styling

- Use Tailwind CSS utility classes
- Follow existing patterns
- Support dark/light themes
- Use CSS variables for colors

### File Organization

```
src/
  components/
    ui/         # Reusable UI components
    widgets/    # Widget implementations
    layout/     # Layout components
  stores/       # Zustand stores
  lib/          # Utility functions
  types/        # TypeScript types
  styles/       # Global styles
```

### State Management

- Use Zustand for global state
- Use React state for local state
- Persist important state with `persist` middleware

### IPC Communication

- Define handlers in `electron/main.cjs`
- Expose via `electron/preload.cjs`
- Type in `src/types/index.ts`
- Always return `{ ok, data?, error? }` format

## Widget Development

See [WIDGET_DEVELOPMENT.md](./WIDGET_DEVELOPMENT.md) for detailed guide.

Quick checklist:
- [ ] Define widget type in `src/types/`
- [ ] Create component in `src/components/widgets/`
- [ ] Register in `WidgetContainer.tsx`
- [ ] Add icon in `Sidebar.tsx`
- [ ] Add to menu in `Topbar.tsx`
- [ ] Test in dev mode
- [ ] Add documentation

## Testing

### Manual Testing

Before submitting PR:

1. Test in development mode
2. Test production build
3. Test on target platform (Linux/Mac/Windows)
4. Check console for errors
5. Verify no memory leaks
6. Test theme switching
7. Test window resize
8. Test with multiple widgets

### Automated Testing (Future)

We plan to add:
- Unit tests with Jest
- Component tests with React Testing Library
- E2E tests with Playwright

## Documentation

Update documentation when:
- Adding new features
- Changing APIs
- Fixing bugs
- Improving performance

Documentation locations:
- `README.md` - Overview and quick start
- `docs/ARCHITECTURE.md` - System design
- `docs/WIDGET_DEVELOPMENT.md` - Widget guide
- `docs/IPC_API.md` - API reference
- `docs/DEPLOYMENT.md` - Build and deploy
- Code comments - Complex logic

## Performance

- Avoid unnecessary re-renders
- Use React.memo for expensive components
- Debounce/throttle frequent operations
- Clean up listeners and timers
- Profile with React DevTools

## Accessibility

- Use semantic HTML
- Support keyboard navigation
- Provide ARIA labels
- Maintain color contrast
- Test with screen readers

## Security

- Validate IPC inputs
- Sanitize user input
- Avoid eval and innerHTML
- Keep dependencies updated
- Follow Electron security best practices

## Debugging

### React DevTools

Install React DevTools for debugging:
```bash
# Main process opens DevTools by default in dev mode
```

### Electron Debugging

```javascript
// In main process
console.log('Main process:', data);

// In renderer
console.log('Renderer:', data);
```

### Common Issues

**Terminal not working:**
```bash
npm install node-pty
npm run postinstall
```

**Build fails:**
```bash
npm run clean
npm install
npm run build:ui
```

**Types errors:**
```bash
npx tsc --noEmit
```

## Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create release commit
4. Tag release: `git tag v1.0.0`
5. Push: `git push && git push --tags`
6. Build distributables
7. Create GitHub release
8. Upload artifacts

## Getting Help

- Check [documentation](../README.md)
- Search [existing issues](https://github.com/yourusername/brains/issues)
- Ask in discussions
- Open new issue with template

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Given credit in relevant code

Thank you for contributing! 🎉
