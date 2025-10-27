# Brains 🧠

> A modern, powerful workspace application inspired by Wave Terminal. Built with Electron, Next.js, and TypeScript.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)

## ✨ Standout Features

- **🤖 Local AI Integration** - Chat with Ollama models without sending data to the cloud
- **💻 Dual Code Editing** - Both remote code-server AND built-in Monaco Editor with 16 languages
- **🎨 5 Unique Themes** - Dark, Light, Creativity, Love, and Cozy Home with animated backgrounds
- **📚 Smart Bookmarks** - Convert any bookmarked page into a persistent widget
- **⏱️ Built-in Pomodoro** - Stay focused with integrated timer and notifications
- **🔐 Security Hardened** - Terminal rate limiting, sandboxed file access, IPC validation
- **💾 Zero Config Persistence** - Everything saves automatically (layouts, widgets, data)
- **⚡ Lightning Fast** - React 19, Next.js 16 Turbopack, Electron 38
- **🖥️ 12 Powerful Widgets** - Terminal, Browser, AI Chat, Code Editor, Calendar, Notes, and more
- **📊 Real-Time Monitoring** - Live CPU, memory, and system metrics with beautiful charts

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (recommend using Node 20)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/brains.git
cd brains

# Install dependencies
npm install

# Install node-pty for terminal support (optional but recommended)
npm install node-pty

# Rebuild native modules for Electron
npm run postinstall
```

### Development

```bash
# Start the development server
npm run dev
```

This will:
1. Start Next.js dev server on port 3001
2. Launch Electron in development mode
3. Enable hot reload for both renderer and main process

### Building

```bash
# Build the Next.js app
npm run build:ui

# Create distributable packages
npm run dist
```

This creates platform-specific installers in the `dist/` directory.

## 📖 Documentation

- **[Complete Feature List](./FEATURES.md)** - Comprehensive documentation of all 12 widgets and features
- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Widget Development Guide](./docs/WIDGET_DEVELOPMENT.md)
- [Electron IPC API](./docs/IPC_API.md)
- [Theming Guide](./docs/THEMING.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## 🎯 All Widgets (12 Total)

### 💻 Development Tools

#### Terminal Widget (Electron only)
- Full xterm.js terminal with 256-color support
- Multiple terminal instances
- PTY backend with node-pty
- Customizable colors, fonts, and resize support
- Security: Rate limiting, input sanitization, max 5 terminals/session

#### Code Server Widget
- Connect to remote code-server instances (self-hosted VS Code)
- Persistent URL storage
- OAuth popup support for authentication
- Works in both Electron (webview) and browser (iframe)
- Settings dialog for easy configuration

#### Code Editor Widget
- Built-in Monaco Editor (same as VS Code)
- **16 programming languages**: JavaScript, TypeScript, Python, HTML, CSS, JSON, Markdown, YAML, XML, SQL, Shell, Rust, Go, Java, C++, C
- Multi-file tab system
- Create/delete files, import/export
- Auto-save to localStorage
- Theme-aware (matches app dark/light theme)

#### File Explorer Widget (Electron only)
- Tree-based file navigation
- File and folder icons
- Expandable directories
- Hidden file support
- Sandboxed to home directory for security

---

### 🤖 AI & Productivity

#### AI Chat Widget
- Chat with **Ollama AI models locally** (no cloud, no API keys!)
- Multiple conversation management with color coding
- Markdown rendering with syntax highlighting
- Stream responses with abort capability
- Export/import conversations
- Custom system prompts per conversation
- Model selection and status checking

#### Pomodoro Timer Widget
- **Focus timer using Pomodoro Technique**
- 3 modes: Work (25min), Short Break (5min), Long Break (15min)
- Session counter
- Browser notifications and audio alerts
- Visual progress display

#### Notes Widget
- **Rich text editor powered by Tiptap**
- WYSIWYG editing: bold, italic, headings, lists, code blocks, links
- Multiple notes with color coding
- Export/import notes as JSON
- Auto-save as you type
- Syntax highlighting for code blocks

#### Calendar Widget
- **Full calendar and event management**
- Month, week, day, and agenda views
- Create/edit/delete events
- All-day event support
- Color-coded events
- Drag-and-drop rescheduling
- Persistent across sessions

---

### 🌐 Web & System

#### Browser Widget
- **Embedded web browser** with full navigation
- **Smart Bookmarks** - persistent across sessions
- **Bookmark-to-Widget** - convert any bookmark into a dedicated widget!
- OAuth popup support (Firebase, Google Sign-In, etc.)
- Back/forward/reload navigation
- Open in external window
- Error handling and loading indicators

#### System Monitor Widget (Electron only)
- **Real-time system metrics**
- CPU: Overall usage, user/system breakdown, per-core visualization
- Memory: Total, used, free, active, swap
- Historical charts with Recharts
- Live updates every 1 second
- Load averages (1, 5, 15 minutes)

---

### ⚙️ Configuration

#### Settings Widget
- Theme selection (5 themes)
- Widget management
- Appearance customization
- About information

#### Welcome Widget
- App introduction and onboarding
- Widget showcase with quick-start buttons
- Feature highlights
- Keyboard shortcuts reference

---

**See [FEATURES.md](./FEATURES.md) for complete documentation of all features.**

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **Next.js 16** - React framework with static export
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Headless UI components
- **Framer Motion** - Animations
- **Zustand** - State management

### Terminal & System
- **xterm.js** - Terminal emulator
- **node-pty** - PTY bindings for Node.js
- **systeminformation** - System metrics

### Visualization
- **Recharts** - Chart library
- **Lucide React** - Icons

### Desktop
- **Electron 38** - Desktop framework
- **electron-builder** - Package and distribute

## 📁 Project Structure

```
brains/
├── electron/           # Electron main process
│   ├── main.cjs       # Main process entry
│   └── preload.cjs    # Preload script
├── src/
│   ├── components/    # React components
│   │   ├── layout/   # Layout components (AppShell, Sidebar, etc.)
│   │   ├── ui/       # Reusable UI components
│   │   └── widgets/  # Widget implementations
│   ├── stores/        # Zustand stores
│   ├── lib/          # Utility functions
│   ├── types/        # TypeScript types
│   └── styles/       # Global styles
├── pages/            # Next.js pages
├── docs/             # Documentation
└── package.json
```

## 🎨 Customization

### Adding a New Widget

1. Create a new widget component in `src/components/widgets/`
2. Add the widget type to `src/types/index.ts`
3. Register it in `src/components/layout/WidgetContainer.tsx`
4. Add the widget icon in `src/components/layout/Sidebar.tsx`

See [Widget Development Guide](./docs/WIDGET_DEVELOPMENT.md) for details.

### Themes

The app supports dark and light themes. Theme colors are defined in `src/styles/globals.css` using CSS variables.

## 🐛 Troubleshooting

### Terminal not working

If the terminal widget shows an error:

```bash
npm install node-pty
npm run postinstall
```

Make sure you have Python and build tools installed for native compilation.

### Build fails

Clear cache and rebuild:

```bash
rm -rf .next out dist node_modules
npm install
npm run build:ui
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](./docs/CONTRIBUTING.md) first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

ISC License - see the [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- Inspired by [Wave Terminal](https://www.waveterm.dev/)
- Built with amazing open-source tools and libraries
- Terminal powered by [xterm.js](https://xtermjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

Made with ❤️ and modern web technologies
