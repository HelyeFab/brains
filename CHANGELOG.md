# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-26

### Added

#### Core Features
- **Single Window Architecture**: Complete redesign from multi-window to single-window with widget system
- **Widget System**: Modular widget architecture with persistent layout
- **Modern UI**: Beautiful interface built with Tailwind CSS 4 and Radix UI components
- **Theme System**: Dark and light theme support with seamless switching
- **Resizable Panels**: Flexible layout with react-resizable-panels

#### Widgets
- **Terminal Widget**: Full-featured terminal powered by xterm.js and node-pty
  - Custom theme support
  - Auto-resize on window changes
  - Multiple instances support
- **System Monitor Widget**: Real-time system metrics
  - Live CPU and memory usage graphs
  - Per-core CPU monitoring
  - Historical charts with Recharts
  - 1-second update interval
- **File Explorer Widget**: Tree-based file navigation
  - Expandable directories
  - File/folder icons
  - (Demo implementation, real FS integration planned)
- **Browser Widget**: External URL launcher
  - Opens web pages in separate windows
  - URL validation
- **Welcome Widget**: Onboarding and quick start
  - Feature showcase
  - Quick widget creation
  - Keyboard shortcuts reference

#### Developer Experience
- **TypeScript**: Full type safety throughout the application
- **Modern Stack**: React 19, Next.js 16, Electron 38
- **State Management**: Zustand with persistence
- **Component Library**: Reusable UI components
- **Error Boundaries**: Graceful error handling
- **Development Tools**: Hot reload, TypeScript checking

#### Documentation
- Comprehensive README with quick start guide
- Architecture documentation
- Widget development guide
- IPC API reference
- Deployment guide
- Contributing guidelines

#### Build & Distribution
- Production build configuration
- Cross-platform support (Linux, macOS, Windows)
- Electron Builder integration
- Optimized bundle size
- AppImage and .deb packages for Linux

### Changed
- Migrated from multi-window to single-window architecture
- Updated to Next.js 16 with Turbopack
- Updated to React 19
- Updated to Tailwind CSS 4
- Improved IPC communication patterns

### Removed
- Separate terminal and system monitor windows
- Old inline-styled UI components

### Technical Details

**Stack:**
- Electron 38.4.0
- Next.js 16.0.0
- React 19.2.0
- TypeScript 5.9.3
- Tailwind CSS 4.1.16
- Zustand 5.0.8
- xterm.js 5.3.0
- Recharts 3.3.0

**Development:**
- Node.js 18+ required
- npm or yarn package manager
- Optional node-pty for terminal functionality

## [Unreleased]

### Planned Features
- Multi-panel layouts (split screen)
- Custom workspace configurations
- Plugin system for third-party widgets
- WebView integration for in-app browsing
- Real file system integration for file explorer
- Settings panel for customization
- Global keyboard shortcuts
- Search functionality across widgets
- Widget tabs within panels
- Performance monitoring widget
- Network monitor widget
- Docker container management widget
- Git repository viewer widget
- Code editor widget
- Notes/markdown widget

### Future Improvements
- Unit and integration tests
- E2E testing with Playwright
- Performance optimizations
- Reduced bundle size
- Auto-update system
- Code signing for all platforms
- macOS notarization
- Windows code signing
- Linux AppImage updates
- Custom theme creation
- Plugin marketplace
- Cloud sync for layouts

---

## Version History

- **1.0.0** (2025-10-26) - Initial production-ready release
- **0.1.0** (Earlier) - Basic skeleton implementation
