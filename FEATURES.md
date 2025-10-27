# Brains - Complete Feature List

> Comprehensive documentation of all features, widgets, and capabilities in Brains

## Table of Contents
- [Widgets](#widgets)
  - [Development Tools](#development-tools)
  - [AI & Productivity](#ai--productivity)
  - [Web & System](#web--system)
  - [Configuration](#configuration)
- [Theme System](#theme-system)
- [Browser Features](#browser-features)
- [UI/UX Features](#uiux-features)
- [Security Features](#security-features)
- [State Persistence](#state-persistence)

---

## Widgets

Brains includes **12 powerful widgets** that can be arranged in your custom workspace layout.

### Development Tools

#### 💻 Terminal Widget
**Full-featured terminal emulator** (Electron only)

**Features:**
- Full xterm.js integration with 256-color support
- Multiple terminal instances
- PTY backend via node-pty
- Automatic resize handling
- Customizable colors and fonts
- Copy/paste support
- Scrollback buffer

**Technical Details:**
- Powered by @xterm/xterm v5.5.0
- Node-pty v1.0.0 for shell integration
- Security: Rate limiting (100 writes/sec), input sanitization (10K char max), max 5 terminals per session

**Platform:** Electron only (requires native bindings)

---

#### 💻 Code Server Widget
**Connect to remote code-server instances** for full VS Code experience

**Features:**
- Connect to self-hosted code-server instances
- Persistent URL storage across app restarts
- Settings dialog for server configuration
- Navigation controls (back, forward, reload, home)
- Open in external window
- OAuth popup support for authentication
- Works in both Electron (webview) and browser (iframe)
- CORS warning for browser mode

**Setup:**
1. Install code-server on your remote machine
2. Open Code Server widget
3. Click Settings icon and enter server URL
4. Login with your code-server password

**Technical Details:**
- Uses Electron webview in desktop mode
- Uses sandboxed iframe in browser mode
- Persistent session with localStorage
- File path: `src/components/widgets/CodeServerWidget.tsx`

**Platform:** Both Electron and Browser

---

#### 📄 Code Editor Widget
**Built-in Monaco Editor** for quick code editing without leaving Brains

**Features:**
- **16 Programming Languages:**
  - JavaScript, TypeScript, Python
  - HTML, CSS, JSON, Markdown
  - YAML, XML, SQL, Shell
  - Rust, Go, Java, C++, C
- Multi-file tab system
- Create and delete files
- Import files from disk
- Export files to disk
- Auto-save to localStorage per widget instance
- Full syntax highlighting
- IntelliSense and auto-completion
- Theme-aware (matches Brains dark/light theme)
- Line numbers and minimap
- Find and replace

**Technical Details:**
- Powered by @monaco-editor/react v4.7.0
- Same editor used in VS Code
- File path: `src/components/widgets/CodeEditorWidget.tsx`

**Platform:** Both Electron and Browser

---

#### 📁 File Explorer Widget
**Navigate your file system** with tree-based interface

**Features:**
- Tree-based file/folder navigation
- File and folder icons
- Expandable directories
- Hidden file support (show/hide toggle)
- Home directory access
- Quick navigation breadcrumbs

**Security:**
- Sandboxed to home directory only
- Path traversal protection
- Read-only access

**Technical Details:**
- File path: `src/components/widgets/FileExplorerWidget.tsx`

**Platform:** Electron only (requires file system access)

---

### AI & Productivity

#### 🤖 AI Chat Widget
**Chat with Ollama AI models locally** - no cloud, no API keys

**Features:**
- **Multiple Conversation Management:**
  - Create unlimited conversations
  - Color-code conversations for organization
  - Rename conversations
  - Delete conversations
  - Switch between conversations instantly
- **Model Selection:**
  - Automatic detection of installed Ollama models
  - Model size display
  - Easy model switching
  - Status indicator (connected/disconnected)
- **Rich Message Display:**
  - Full Markdown rendering with remarkGfm
  - Syntax highlighting for code blocks (8 languages)
  - Copy code button on all code blocks
  - User/assistant message distinction
  - Timestamp on each message
- **Streaming Responses:**
  - Real-time token streaming
  - Abort generation button
  - Loading indicators
- **Conversation Export:**
  - Export conversations as JSON
  - Import previous conversations
- **System Prompts:**
  - Customize AI behavior per conversation
  - Default system prompt support

**Setup:**
1. Install Ollama: `curl -fsSL https://ollama.com/install.sh | sh`
2. Pull a model: `ollama pull llama3.2`
3. Start Ollama: `ollama serve`
4. Open AI Chat widget and start chatting!

**Supported Code Languages:**
JavaScript, TypeScript, Python, Bash, JSON, CSS, HTML, XML

**Technical Details:**
- Local-first: All data stored in Zustand with localStorage persistence
- Streaming via fetch API with ReadableStream
- No external API calls (except local Ollama on localhost:11434)
- File path: `src/components/widgets/AIChatWidget.tsx`

**Platform:** Both Electron and Browser

---

#### ⏱️ Pomodoro Timer Widget
**Focus timer** using the Pomodoro Technique for productivity

**Features:**
- **Three Timer Modes:**
  - Work: 25 minutes
  - Short Break: 5 minutes
  - Long Break: 15 minutes
- **Session Tracking:**
  - Counts completed work sessions
  - Visual progress display
- **Notifications:**
  - Browser desktop notifications
  - Audio alert on completion
  - Permission request on first use
- **Controls:**
  - Start/pause timer
  - Reset to default duration
  - Mode switching buttons
- **Visual Feedback:**
  - Large countdown display
  - Color-coded modes (red for work, green for break)
  - Progress indication

**Technical Details:**
- Browser Notification API
- Web Audio API for sound alerts
- localStorage for session persistence
- File path: `src/components/widgets/PomodoroWidget.tsx`

**Platform:** Both Electron and Browser

---

#### 📝 Notes Widget
**Rich text editor** with Tiptap for beautiful note-taking

**Features:**
- **WYSIWYG Editor:**
  - Bold, italic, underline, strikethrough
  - Headings (H1, H2, H3)
  - Bullet and numbered lists
  - Blockquotes
  - Code blocks with syntax highlighting
  - Inline code
  - Links
  - Hard breaks
- **Multiple Notes:**
  - Create unlimited notes
  - Color-code notes for organization (10 colors)
  - Quick note switching in sidebar
  - Delete notes
  - Auto-save as you type
- **Export/Import:**
  - Export individual notes as JSON
  - Import notes from JSON files
  - Electron dialog integration for file operations
- **Toolbar:**
  - Rich text formatting toolbar
  - One-click formatting
  - Keyboard shortcuts support

**Keyboard Shortcuts:**
- Bold: Ctrl+B / Cmd+B
- Italic: Ctrl+I / Cmd+I
- Underline: Ctrl+U / Cmd+U
- Code: Ctrl+E / Cmd+E

**Technical Details:**
- Powered by @tiptap/react v3.8.0
- Lowlight for code syntax highlighting
- Zustand store with localStorage persistence
- File path: `src/components/widgets/NotePadWidget.tsx`

**Platform:** Both Electron and Browser

---

#### 📅 Calendar Widget
**Full calendar and event management** system

**Features:**
- **Calendar Views:**
  - Month view
  - Week view
  - Day view
  - Agenda view
- **Event Management:**
  - Create events with title, start, end times
  - All-day event support
  - Event descriptions
  - Color-code events (10 colors)
  - Edit events
  - Delete events
  - Drag-and-drop rescheduling
  - Resize events to change duration
- **Navigation:**
  - Next/previous month/week/day
  - Today button for quick return
  - Date picker for jumping to specific dates
- **Data Persistence:**
  - All events saved to localStorage
  - Survives app restarts

**Technical Details:**
- Powered by react-big-calendar v1.19.4
- Date manipulation with date-fns v4.1.0
- Zustand store with localStorage persistence
- File path: `src/components/widgets/CalendarWidget.tsx`

**Platform:** Both Electron and Browser

---

### Web & System

#### 🌐 Browser Widget
**Embedded web browser** with advanced features

**Features:**
- **Full Web Browsing:**
  - Navigate to any URL
  - Back/forward navigation
  - Reload page
  - Home button (returns to Google)
  - Open in external window
  - Auto-add https:// to URLs
  - Loading indicator
- **Smart Bookmarks System:**
  - Star any page to bookmark it
  - Persistent bookmarks across sessions
  - Bookmarks dropdown menu
  - Click bookmark to navigate
  - Delete bookmarks
  - Domain name extraction for titles
- **Bookmark-to-Widget Conversion:**
  - Convert any bookmark into a dedicated browser widget
  - New widget opens with bookmarked URL pre-loaded
  - Persistent widget with saved state
  - Unlimited bookmark widgets
- **OAuth Support:**
  - Popup window support for authentication flows
  - Works with Firebase, Google Sign-In, etc.
  - New window handling for OAuth redirects
- **Error Handling:**
  - User-friendly error messages
  - Domain resolution errors
  - Connection errors
  - SSL/TLS errors
- **Session Persistence:**
  - Cookies and session data saved
  - Login states preserved
  - Cache for faster loading

**Technical Details:**
- Electron: Uses webview with `partition="persist:browser"`
- Browser: Uses sandboxed iframe
- OAuth: `allowpopups="true"` and `new-window` event handling
- Bookmarks: Zustand store with localStorage
- File path: `src/components/widgets/BrowserWidget.tsx`

**Platform:** Both Electron and Browser (with limitations in browser mode)

---

#### 📊 System Monitor Widget
**Real-time system metrics** with beautiful visualizations

**Features:**
- **CPU Monitoring:**
  - Overall CPU usage percentage
  - User vs system load breakdown
  - Per-core CPU usage
  - Individual core visualizations
  - Historical chart (line graph)
  - Load average (1, 5, 15 minutes)
- **Memory Monitoring:**
  - Total memory
  - Used memory
  - Free memory
  - Active memory
  - Available memory
  - Swap usage
  - Memory usage percentage
  - Visual progress bars
- **Live Updates:**
  - Real-time metrics every 1 second
  - TanStack Query for efficient polling
  - Automatic cleanup on widget close
- **Visualizations:**
  - Recharts line charts for CPU history
  - Color-coded bars for memory
  - Responsive layouts

**Technical Details:**
- Powered by systeminformation v5.27.11
- Charts via Recharts v3.3.0
- TanStack Query v5 for server state
- IPC bridge to Electron main process
- File path: `src/components/widgets/SystemMonitorWidget.tsx`

**Platform:** Electron only (requires native system access)

---

### Configuration

#### ⚙️ Settings Widget
**Configure Brains preferences**

**Features:**
- Theme selection (5 themes)
- Widget management
- Appearance customization
- Keyboard shortcuts reference
- About information

**Technical Details:**
- File path: `src/components/widgets/SettingsWidget.tsx`

**Platform:** Both Electron and Browser

---

#### 🚀 Welcome Widget
**Onboarding and quick start**

**Features:**
- App introduction
- Widget showcase
- Quick-start buttons
- Feature highlights
- Keyboard shortcuts

**Technical Details:**
- File path: `src/components/widgets/WelcomeWidget.tsx`

**Platform:** Both Electron and Browser

---

## Theme System

Brains includes **5 beautiful themes**, not just dark and light!

### Available Themes

#### 🌙 Dark Theme
Classic dark theme with high contrast for comfortable night coding.

**Details:**
- Base: Dark
- Best for: Low-light environments, reduced eye strain

---

#### ☀️ Light Theme
Classic light theme with clean, bright interface.

**Details:**
- Base: Light
- Best for: Well-lit environments, daytime work

---

#### 🎨 Creativity Theme
**Dark theme with artistic icon pattern background**

**Features:**
- 20 creativity-themed icons as background stickers
- Icons: Drawing tablet, paint, light bulb, brainstorm, rocket, etc.
- Animated subtle pattern
- Configurable opacity (default: 40%)
- Icon size: 80px, spacing: 140px

**Best for:** Creative work, design, brainstorming sessions

---

#### 💝 Love Theme
**Dark theme with romantic icon pattern background**

**Features:**
- 20 love-themed icons as background stickers
- Animated subtle pattern
- Configurable opacity (default: 40%)
- Icon size: 80px, spacing: 140px

**Best for:** Personal projects, journaling, mood-setting

---

#### 🏠 Cozy Home Theme
**Dark theme with comfortable home icon pattern background**

**Features:**
- 20 cozy home icons: slippers, candles, plants, cat, fireplace, etc.
- Animated subtle pattern
- Warm, comfortable aesthetic
- Configurable opacity (default: 40%)
- Icon size: 80px, spacing: 140px

**Best for:** Relaxed coding, evening work, comfortable sessions

---

### Theme Features

- **Instant Switching:** Change themes with zero lag
- **Animated Gradients:** Logo and headers use animated gradient effects
- **Background Patterns:** Advanced themes use SVG sticker patterns
- **Persistent Selection:** Theme choice saved across sessions
- **CSS Variables:** Fully customizable color system
- **Component Theming:** All UI components respect theme

**Technical Details:**
- Configuration: `src/config/themes.ts`
- Background component: `src/components/layout/ThemeBackground.tsx`
- Theme store: `src/stores/useThemeStore.ts`
- CSS variables: `src/styles/globals.css`

---

## Browser Features

### Smart Bookmarks System

**Save and organize your favorite websites:**
- Click star icon to bookmark current page
- Bookmarks saved to localStorage
- Persistent across app restarts
- Bookmarks dropdown shows all saved sites
- Click any bookmark to navigate instantly
- Delete bookmarks with trash icon
- Auto-extracted domain names as titles

**Location:** BrowserWidget.tsx, useBookmarksStore.ts

---

### Bookmark-to-Widget Conversion

**Turn any bookmark into a dedicated widget:**
1. Open bookmarks dropdown
2. Hover over any bookmark
3. Click the "Open as Widget" icon (plus square)
4. New browser widget opens with that URL
5. Widget persists with that URL across restarts

**Use Cases:**
- Pin Gmail, Calendar, or work tools as separate widgets
- Keep documentation always visible
- Monitor dashboards in dedicated widgets
- Quick access to frequently used web apps

**Technical Implementation:**
- Widget data stores initial URL
- URL loaded on widget mount
- Persistent via Zustand store
- Unlimited bookmark widgets

---

### OAuth & Authentication Support

**Login to web services with popup support:**
- Firebase Authentication ✅
- Google Sign-In ✅
- GitHub OAuth ✅
- Any OAuth provider using popups ✅

**How it works:**
- Webview has `allowpopups="true"` attribute
- New window events captured
- Popups open in separate Electron windows
- Authentication flow completes normally

---

## UI/UX Features

### Window Management

#### Fullscreen Mode
- Toggle: F11 keyboard shortcut
- Menu: Brains menu → Fullscreen
- Exit: F11 or menu
- Status persists across sessions

#### Window Dragging
- Frameless window with custom titlebar
- Drag region on entire topbar
- No-drag regions on interactive elements

#### Close Confirmation
- Dialog before closing app
- Prevents accidental data loss
- Warning about unsaved changes

---

### Layout System

#### Resizable Panels
- Powered by react-resizable-panels
- Drag dividers to resize widgets
- Minimum sizes enforced
- Smooth animations

#### Widget Management
- Add widgets via "+ New Widget" menu
- Close widgets with X button
- Rearrange in sidebar
- Visual indicators for active widget
- Color coding for identification

#### Tab System
- Widget tabs in sidebar
- Click to switch widgets
- Active widget highlighted
- Icon + title display

---

### Visual Features

#### Animated Gradients
- Logo uses animated gradient
- Welcome screen heading animated
- CSS keyframes for smooth transitions
- 4-second animation cycle

#### Color Coding
- Widgets can have custom colors
- Visual identification in tabs
- Conversation color coding (AI Chat)
- Note color coding
- Event color coding (Calendar)

#### Responsive Design
- Works on various screen sizes
- Mobile-friendly layouts
- Adaptive spacing and sizing

---

## Security Features

### Terminal Security Hardening

**Rate Limiting:**
- Maximum 100 writes per second per terminal
- Prevents DoS attacks
- Protects system resources

**Input Sanitization:**
- Maximum 10,000 characters per write
- Type validation (strings only)
- Prevents malicious input

**Session Limits:**
- Maximum 5 terminals per session
- Prevents resource exhaustion
- Memory protection

**Environment Sanitization:**
- Removes dangerous environment variables:
  - LD_PRELOAD
  - LD_LIBRARY_PATH
  - DYLD_INSERT_LIBRARIES
  - DYLD_LIBRARY_PATH
- Prevents library injection attacks

**Implementation:** `electron/main.cjs` lines 26-113

---

### File System Security

**Sandboxing:**
- File access restricted to home directory only
- Path traversal protection
- No access to system files
- Validated file paths

**Implementation:** `electron/lib/security.cjs`, `electron/main.cjs` lines 466-530

---

### IPC Security

**Sender Validation:**
- All IPC handlers validate sender
- Ensures requests come from main window
- Prevents unauthorized access
- Returns error for invalid senders

**Implementation:** `electron/lib/security.cjs`, all IPC handlers

---

### Browser Security

**Electron Configuration:**
- Context isolation: `true`
- Node integration: `false`
- Sandbox: `false` (required for native modules)
- Webview partition isolation
- Secure preload script

**Webview Security:**
- Partitioned sessions
- No insecure content allowed
- User agent set to prevent fingerprinting
- Popup controls

**Implementation:** `electron/main.cjs` lines 131-148

---

## State Persistence

### What Gets Saved

**Widget State:**
- All open widgets
- Widget arrangement
- Widget-specific data
- Active widget selection

**User Preferences:**
- Selected theme
- UI settings
- Window position and size

**Widget Data:**
- AI Chat: All conversations and messages
- Notes: All notes and content
- Calendar: All events
- Browser: All bookmarks
- Code Server: Server URL
- Code Editor: All files and content

**How It Works:**
- Zustand stores with persist middleware
- localStorage for browser compatibility
- Electron Store for desktop app
- JSON serialization
- Automatic save on changes
- Restore on app launch

**Stores with Persistence:**
- `useWidgetStore` - Widget management
- `useThemeStore` - Theme selection
- `useChatStore` - AI conversations
- `useNotesStore` - Notes data
- `useCalendarStore` - Events
- `useBookmarksStore` - Browser bookmarks
- `useCodeServerStore` - Code server URL

---

## Keyboard Shortcuts

### Global

- `F11` - Toggle fullscreen
- `Ctrl+T` / `Cmd+T` - Toggle theme (dark/light)
- `Ctrl+,` / `Cmd+,` - Open settings
- `Ctrl+W` / `Cmd+W` - Close active widget
- `Ctrl+`` / `Cmd+`` - New terminal widget

### Notes Editor

- `Ctrl+B` / `Cmd+B` - Bold
- `Ctrl+I` / `Cmd+I` - Italic
- `Ctrl+U` / `Cmd+U` - Underline
- `Ctrl+E` / `Cmd+E` - Inline code

### AI Chat

- `Enter` - Send message (when not Shift+Enter)
- `Shift+Enter` - New line in message

### Browser

- `Enter` - Navigate to URL in address bar

---

## Technical Stack

### Frontend
- **React 19** - Latest with automatic batching
- **Next.js 16** - Turbopack for fast builds
- **TypeScript 5.9** - Full type safety
- **Tailwind CSS 3.4** - Utility-first styling
- **Radix UI** - Accessible headless components
- **Zustand 5.0** - Lightweight state management
- **TanStack Query 5** - Server state management

### Desktop
- **Electron 38** - Latest stable
- **electron-builder 26** - Application packaging
- **node-pty 1.0** - Terminal PTY bindings

### Editors & Text
- **Monaco Editor 4.7** - VS Code editor
- **Tiptap 3.8** - Rich text editing
- **xterm.js 5.5** - Terminal emulator
- **Lowlight 3.3** - Code syntax highlighting

### Visualization
- **Recharts 3.3** - Chart library
- **Lucide React 0.548** - Icon system

### System
- **systeminformation 5.27** - System metrics

### AI & Data
- **React Markdown 10.1** - Markdown rendering
- **remark-gfm 4.0** - GitHub Flavored Markdown
- **date-fns 4.1** - Date manipulation
- **react-big-calendar 1.19** - Calendar component

---

## Development Features

### Hot Reload
- React Fast Refresh
- Instant component updates
- Preserved state during development

### TypeScript
- Strict mode enabled
- Full type coverage
- IDE autocomplete support

### Testing
- Vitest for unit tests
- React Testing Library
- Coverage reports

### Build Optimization
- Static export support
- Turbopack for fast builds
- Code splitting
- Dynamic imports for heavy components

---

## Deployment

### Supported Platforms
- Linux (AppImage, deb)
- macOS (dmg, zip)
- Windows (NSIS installer)

### Build Outputs
- Compressed for optimal size
- Platform-specific installers
- Auto-updater ready
- Code signing ready

---

## Future Enhancements

### Planned Features
- Docker container widget
- Git integration widget
- Database client widget
- HTTP client widget
- Custom widget API
- Plugin system
- Themes marketplace
- Widget templates

---

**Last Updated:** 2025-01-27
**Version:** 1.0.0
**Documentation Coverage:** 100%
