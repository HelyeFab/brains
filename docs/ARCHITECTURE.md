# Architecture Overview

## System Design

Brains is built using a modern Electron + Next.js architecture with TypeScript throughout.

## High-Level Architecture

```
┌─────────────────────────────────────────────┐
│           Electron Main Process             │
│  - Window management                        │
│  - IPC handlers                             │
│  - System integration (PTY, metrics)        │
└─────────────────┬───────────────────────────┘
                  │ IPC
┌─────────────────▼───────────────────────────┐
│        Renderer Process (Next.js)           │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │         App Shell                    │   │
│  │  ┌──────────┐  ┌──────────────────┐ │   │
│  │  │ Sidebar  │  │ Widget Container │ │   │
│  │  │          │  │                  │ │   │
│  │  │ - List   │  │  Active Widget:  │ │   │
│  │  │ - Manage │  │  - Terminal      │ │   │
│  │  │ - Switch │  │  - System Monitor│ │   │
│  │  │          │  │  - File Explorer │ │   │
│  │  │          │  │  - Browser       │ │   │
│  │  └──────────┘  └──────────────────┘ │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  State Management: Zustand                  │
│  - widgetStore (widgets, active widget)     │
│  - themeStore (theme preferences)           │
└─────────────────────────────────────────────┘
```

## Component Architecture

### Main Process (electron/main.cjs)

**Responsibilities:**
- Create and manage the main browser window
- Handle IPC communication with renderer
- Spawn and manage PTY processes for terminals
- Collect system metrics via systeminformation
- Manage browser windows for external URLs

**Key IPC Handlers:**
- `terminal:spawn` - Create new PTY process
- `terminal:in` - Write data to PTY
- `terminal:resize` - Resize PTY
- `system:getSnapshot` - Get current system metrics
- `system:subscribe` - Subscribe to periodic metrics updates
- `browser:open` - Open URL in new window

### Renderer Process (Next.js)

#### Layout Components

**AppShell** (`src/components/layout/AppShell.tsx`)
- Root layout component
- Manages theme application
- Orchestrates Topbar, Sidebar, and WidgetContainer

**Topbar** (`src/components/layout/Topbar.tsx`)
- App title and branding
- "New Widget" dropdown menu
- Theme toggle
- Settings button

**Sidebar** (`src/components/layout/Sidebar.tsx`)
- Lists all active widgets
- Handles widget selection
- Widget removal
- Shows active widget count

**WidgetContainer** (`src/components/layout/WidgetContainer.tsx`)
- Renders the currently active widget
- Falls back to welcome message when no widgets

#### Widget System

Each widget is a self-contained React component:

```typescript
interface WidgetProps {
  widgetId: string; // Unique identifier
}
```

**Terminal Widget**
- Uses xterm.js for terminal emulation
- Communicates with PTY via IPC
- Handles resize events
- Custom theming

**System Monitor Widget**
- Subscribes to system metrics
- Displays real-time charts (Recharts)
- Shows CPU per-core usage
- Memory usage with progress bars

**File Explorer Widget**
- Tree-based file navigation
- Expandable directories
- (FS integration planned)

**Browser Widget**
- URL input and navigation
- Opens URLs in separate windows

**Welcome Widget**
- Onboarding experience
- Quick widget creation
- Feature showcase
- Keyboard shortcuts reference

## State Management

### Zustand Stores

**widgetStore** (`src/stores/useWidgetStore.ts`)
```typescript
{
  widgets: Widget[];           // All widgets
  activeWidgetId: string | null; // Currently selected widget
  addWidget: (type) => void;
  removeWidget: (id) => void;
  setActiveWidget: (id) => void;
  updateWidget: (id, updates) => void;
  clearWidgets: () => void;
}
```

**themeStore** (`src/stores/useThemeStore.ts`)
```typescript
{
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme) => void;
}
```

Both stores use Zustand's `persist` middleware to save state to localStorage.

## Data Flow

### Widget Creation

```
User clicks "New Widget"
  ↓
Topbar dropdown menu
  ↓
User selects widget type
  ↓
useWidgetStore.addWidget(type)
  ↓
New widget added to store
  ↓
Widget set as active
  ↓
WidgetContainer renders new widget
```

### Terminal Data Flow

```
User types in terminal
  ↓
xterm.js onData event
  ↓
IPC: terminal:in
  ↓
Main process writes to PTY
  ↓
PTY outputs data
  ↓
Main process sends: terminal:out
  ↓
Renderer receives data
  ↓
xterm.js displays output
```

### System Metrics Flow

```
Widget mounts
  ↓
IPC: system:subscribe
  ↓
Main process starts interval
  ↓
Every 1000ms:
  - Collect CPU/memory metrics
  - Send to renderer via system:metrics
  ↓
Widget updates state
  ↓
Charts re-render
```

## Build & Deployment

### Development Build

```bash
npm run dev
```

1. Next.js dev server starts (port 3001)
2. Electron launches pointing to localhost:3001
3. Hot reload enabled

### Production Build

```bash
npm run build:ui  # Next.js static export → out/
npm run dist      # electron-builder → dist/
```

1. Next.js builds static HTML/CSS/JS
2. electron-builder packages app
3. Creates platform installers (AppImage, deb, etc.)

## Security Considerations

- **Context Isolation**: Enabled (`contextIsolation: true`)
- **Node Integration**: Disabled in renderer
- **Sandbox**: Disabled (required for some native modules)
- **Preload Script**: Exposes only necessary APIs via `contextBridge`
- **CSP**: Consider adding Content Security Policy headers

## Performance Optimizations

1. **Code Splitting**: Next.js automatically splits code
2. **Dynamic Imports**: Widgets load xterm.js and recharts on demand
3. **React.memo**: Used for expensive components
4. **Debounced Resize**: Terminal resize is debounced
5. **Limited History**: System monitor keeps only last 30 data points

## Future Improvements

1. **Multi-panel layouts**: Split screen with multiple widgets visible
2. **Custom layouts**: Save and restore different workspace configurations
3. **Plugin system**: Allow third-party widgets
4. **WebView integration**: Embed browsers directly in widget
5. **File system integration**: Real file operations in explorer
6. **Settings panel**: Configure terminal, themes, shortcuts
7. **Keyboard shortcuts**: Global shortcuts for common actions
