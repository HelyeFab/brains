# Custom Components

This folder contains custom, reusable components specific to the Brains application.

## Purpose

Custom components are built on top of base UI components (from `src/components/ui`) and include:
- Application-specific logic
- Custom theming and styling
- Complex user interactions
- Business logic integration

## Structure

```
custom/
├── README.md           # This file
├── index.ts           # Export all custom components
├── ConfirmDialog.tsx  # Themed confirmation dialog
└── ...                # Future custom components
```

## Adding New Components

When creating a new custom component:

1. **Create the component file**: `ComponentName.tsx`
2. **Export from index**: Add to `index.ts`
3. **Document usage**: Add JSDoc comments
4. **Use theming**: Ensure it respects dark/light themes
5. **Follow conventions**: Use existing patterns

## Current Components

### ConfirmDialog

A themed confirmation dialog that replaces native `window.confirm()`.

**Usage:**
```tsx
import { ConfirmDialog } from '@/components/custom';

function MyComponent() {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <button onClick={() => setShowConfirm(true)}>
        Delete
      </button>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Delete Item"
        description="Are you sure you want to delete this item?"
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={() => console.log('Deleted')}
      />
    </>
  );
}
```

**Props:**
- `open`: boolean - Controls dialog visibility
- `onOpenChange`: (open: boolean) => void - Called when dialog should open/close
- `title`: string - Dialog title
- `description`: string - Dialog description/message
- `confirmText?`: string - Confirm button text (default: "Confirm")
- `cancelText?`: string - Cancel button text (default: "Cancel")
- `variant?`: 'default' | 'destructive' - Button style (default: "default")
- `onConfirm`: () => void - Called when confirmed
- `onCancel?`: () => void - Called when cancelled

## Future Components

Ideas for future custom components:
- **Toast notifications** - Themed toast messages
- **Modal dialogs** - Full-featured modal dialogs
- **Context menus** - Right-click context menus
- **Command palette** - Quick action search
- **Notifications panel** - System notifications
- **Loading screens** - Custom loading states
- **Empty states** - Themed empty state displays
