# Quick Start Guide

Get up and running with Brains in 5 minutes!

## Installation

### 1. Prerequisites

Ensure you have:
- **Node.js 18+** (Node 20 recommended)
- **npm** (comes with Node.js)

Check versions:
```bash
node --version  # Should be v18 or higher
npm --version   # Should be v6 or higher
```

### 2. Clone & Install

```bash
# Clone the repository
git clone https://github.com/yourusername/brains.git
cd brains

# Install dependencies
npm install
```

This will take 2-3 minutes on first install.

### 3. Optional: Install Terminal Support

For full terminal functionality:

```bash
npm install node-pty
npm run postinstall
```

**Note:** This requires build tools:
- **Linux**: `sudo apt-get install build-essential python3`
- **macOS**: `xcode-select --install`
- **Windows**: Visual Studio Build Tools

## Running the App

### Development Mode

```bash
npm run dev
```

This will:
1. Start Next.js dev server on `localhost:3001`
2. Launch Electron with hot reload
3. Open DevTools automatically

The app window will appear within 10-15 seconds.

### Your First Widget

1. Click "New Widget" in the top bar
2. Select "Welcome" to see the feature showcase
3. Or select "Terminal" to open a terminal
4. Try "System Monitor" to see live metrics

### Quick Tour

**Top Bar:**
- **Brains** logo - App branding
- **New Widget** - Add widgets
- **Theme toggle** (sun/moon icon) - Switch dark/light
- **Settings** - App settings (coming soon)

**Sidebar (Left):**
- Lists all your widgets
- Click to switch between widgets
- Hover and click X to remove a widget

**Main Area:**
- Shows the currently active widget
- Resize the sidebar by dragging the divider

## Common Tasks

### Adding Multiple Widgets

```
1. Click "New Widget"
2. Select "Terminal"
3. Click "New Widget" again
4. Select "System Monitor"
5. Switch between them in the sidebar
```

### Switching Themes

- Click the sun/moon icon in the top right
- Theme persists between sessions

### Terminal Usage

```bash
# The terminal works like any terminal
ls
pwd
cd Documents
npm --version

# Use Ctrl+C to stop processes
# Resize automatically adjusts
```

### System Monitor

- View real-time CPU and memory usage
- Per-core CPU graphs update every second
- Historical chart shows last 30 seconds

## Development Workflow

### Making Changes

1. Edit files in `src/`
2. Changes hot-reload automatically
3. Check console for errors

### Building for Production

```bash
# Build the UI
npm run build:ui

# Create distributables
npm run dist

# Or platform-specific:
npm run dist:linux
npm run dist:win
npm run dist:mac
```

Built packages appear in `dist/`.

### Cleaning Build Artifacts

```bash
npm run clean
npm run build:ui
```

## Troubleshooting

### Terminal Doesn't Work

**Problem:** Terminal widget shows "Terminal backend unavailable"

**Solution:**
```bash
npm install node-pty
npm run postinstall
# Restart the app
npm run dev
```

### Build Fails

**Problem:** `npm run build:ui` fails

**Solution:**
```bash
npm run clean
rm -rf node_modules
npm install
npm run build:ui
```

### App Won't Start

**Problem:** Electron window doesn't appear

**Solution:**
1. Check if port 3001 is available
2. Kill any running Next.js processes
3. Restart: `npm run dev`

### Blank Screen

**Problem:** App shows blank white screen

**Solution:**
1. Open DevTools (F12)
2. Check Console tab for errors
3. Try refreshing (Ctrl+R)

## Next Steps

### Learn More

- Read the [README](../README.md) for overview
- Check [ARCHITECTURE](./ARCHITECTURE.md) to understand the design
- Follow [WIDGET_DEVELOPMENT](./WIDGET_DEVELOPMENT.md) to create widgets
- See [IPC_API](./IPC_API.md) for Electron integration
- Read [DEPLOYMENT](./DEPLOYMENT.md) for distribution

### Create Your First Widget

See the [Widget Development Guide](./WIDGET_DEVELOPMENT.md) for a step-by-step tutorial.

### Contribute

Want to help improve Brains? Check out [CONTRIBUTING](./CONTRIBUTING.md).

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+T` | Toggle theme (planned) |
| `Ctrl+`` | New terminal (planned) |
| `Ctrl+W` | Close widget (planned) |
| `Ctrl+,` | Settings (planned) |
| `F12` | Open DevTools (dev mode) |
| `Ctrl+R` | Refresh (dev mode) |

## Tips

1. **Start with Welcome Widget** to see all features
2. **Use Terminal Widget** for command-line tasks
3. **System Monitor** to keep an eye on resources
4. **File Explorer** to browse files (demo)
5. **Theme switching** adapts colors automatically

## Getting Help

- Check [Documentation](../README.md#documentation)
- Search [Issues](https://github.com/yourusername/brains/issues)
- Ask in [Discussions](https://github.com/yourusername/brains/discussions)
- Report bugs with detailed description

Happy hacking! 🚀
