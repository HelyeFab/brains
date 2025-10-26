# Brains 🧠

> A modern, powerful workspace application inspired by Wave Terminal. Built with Electron, Next.js, and TypeScript.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)

## ✨ Features

- **🖥️ Single Window, Multiple Widgets**: Combine terminal, system monitor, file explorer, and browser in one beautiful interface
- **⚡ Lightning Fast**: Built with modern web technologies (React 19, Next.js 16, TypeScript)
- **🎨 Stunning Design**: Beautiful UI with Tailwind CSS, dark/light themes, and smooth animations
- **📊 Real-Time Monitoring**: Live CPU, memory, and system metrics with beautiful charts
- **💻 Integrated Terminal**: Full-featured terminal powered by xterm.js and node-pty
- **🔧 Resizable Panels**: Customize your workspace layout with react-resizable-panels
- **💾 Layout Persistence**: Your workspace layout is automatically saved
- **🎭 Theme System**: Seamless dark/light mode switching

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

- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Widget Development Guide](./docs/WIDGET_DEVELOPMENT.md)
- [Electron IPC API](./docs/IPC_API.md)
- [Theming Guide](./docs/THEMING.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## 🎯 Widgets

### Terminal Widget
- Full xterm.js integration
- Multiple terminal instances
- Customizable colors and fonts
- Resize support

### System Monitor Widget
- Real-time CPU and memory usage
- Per-core CPU metrics
- Historical charts with Recharts
- Live updates every second

### File Explorer Widget
- Tree-based file navigation
- File/folder icons
- Expandable directories
- (File system integration coming soon)

### Browser Widget
- Open external URLs
- Separate browser windows
- URL navigation

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
