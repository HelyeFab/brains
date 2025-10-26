# Deployment Guide

Complete guide for building and distributing Brains.

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- For Linux: `build-essential` package
- For Windows: Visual Studio Build Tools
- For macOS: Xcode Command Line Tools

## Development Build

```bash
# Install dependencies
npm install

# Install native dependencies (optional but recommended)
npm install node-pty

# Rebuild for Electron
npm run postinstall

# Start development server
npm run dev
```

The app will open automatically with hot-reload enabled.

## Production Build

### Build UI

```bash
npm run build:ui
```

This creates a static export in the `out/` directory using Next.js.

### Create Distributable

```bash
npm run dist
```

This uses electron-builder to create platform-specific installers in `dist/`.

## Platform-Specific Builds

### Linux

```bash
npm run dist
```

Creates:
- `dist/brains-1.0.0.AppImage` - Portable AppImage
- `dist/brains_1.0.0_amd64.deb` - Debian package

**Install AppImage:**
```bash
chmod +x brains-1.0.0.AppImage
./brains-1.0.0.AppImage
```

**Install .deb:**
```bash
sudo dpkg -i brains_1.0.0_amd64.deb
```

### Windows

```bash
npm run dist
```

Creates:
- `dist/brains-1.0.0.exe` - Windows installer

**Note:** For code signing on Windows, set environment variables:
```bash
set CSC_LINK=path/to/certificate.pfx
set CSC_KEY_PASSWORD=your_password
```

### macOS

```bash
npm run dist
```

Creates:
- `dist/brains-1.0.0.dmg` - macOS disk image
- `dist/brains-1.0.0-mac.zip` - ZIP archive

**Code signing:**
```bash
export APPLEID=your@email.com
export APPLEIDPASS=app-specific-password
```

## Electron Builder Configuration

The build configuration is in `package.json` under the `"build"` key:

```json
{
  "build": {
    "appId": "com.example.brains",
    "productName": "Brains",
    "files": [
      "electron/**/*",
      "out/**/*",
      "package.json"
    ],
    "directories": {
      "buildResources": "build"
    },
    "linux": {
      "target": ["AppImage", "deb"],
      "category": "Development"
    },
    "mac": {
      "target": ["dmg", "zip"],
      "category": "public.app-category.developer-tools"
    },
    "win": {
      "target": ["nsis"],
      "icon": "build/icon.ico"
    }
  }
}
```

## Adding Icons

### Prepare Icons

Create icons in these formats:
- Linux: `build/icon.png` (512x512 or 1024x1024)
- macOS: `build/icon.icns`
- Windows: `build/icon.ico`

### Generate Icons

Use electron-icon-maker or similar tools:

```bash
npm install --global electron-icon-maker
electron-icon-maker --input=icon.png --output=./build
```

## Environment Variables

### Development

```bash
# Use development server
ELECTRON_START_URL=http://localhost:3001 npm start
```

### Production

No environment variables needed. The app uses static files from `out/`.

## Optimization

### Reduce Bundle Size

1. **Remove unused dependencies:**
   ```bash
   npm prune --production
   ```

2. **Enable compression:**
   ```json
   {
     "build": {
       "compression": "maximum"
     }
   }
   ```

3. **Exclude dev dependencies:**
   ```json
   {
     "build": {
       "files": [
         "!**/node_modules/**/{CHANGELOG.md,README.md,README,readme.md,readme}",
         "!**/node_modules/**/{test,__tests__,tests,powered-test,example,examples}",
         "!**/node_modules/**/*.d.ts"
       ]
     }
   }
   ```

### Performance

1. **Code splitting:** Next.js handles this automatically
2. **Lazy loading:** Widgets load dependencies on demand
3. **Tree shaking:** Enabled by default in production

## Auto-Updates

### Setup (Optional)

1. **Install electron-updater:**
   ```bash
   npm install electron-updater
   ```

2. **Add to main process:**
   ```javascript
   const { autoUpdater } = require('electron-updater');

   app.whenReady().then(() => {
     autoUpdater.checkForUpdatesAndNotify();
   });
   ```

3. **Configure release server:**
   ```json
   {
     "build": {
       "publish": {
         "provider": "github",
         "owner": "yourusername",
         "repo": "brains"
       }
     }
   }
   ```

## CI/CD

### GitHub Actions

Create `.github/workflows/build.yml`:

```yaml
name: Build

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run dist

      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: ${{ matrix.os }}
          path: dist/*
```

## Troubleshooting

### node-pty build fails

**Linux:**
```bash
sudo apt-get install build-essential python3
npm rebuild node-pty
```

**macOS:**
```bash
xcode-select --install
npm rebuild node-pty
```

**Windows:**
Install Visual Studio Build Tools, then:
```bash
npm config set msvs_version 2022
npm rebuild node-pty
```

### electron-builder fails

Clear cache:
```bash
rm -rf dist
rm -rf node_modules
npm install
npm run dist
```

### Large bundle size

Check what's included:
```bash
npx electron-builder --dir
du -sh dist/linux-unpacked
```

Analyze:
```bash
npm install --save-dev webpack-bundle-analyzer
```

### App doesn't start

Check logs:
- Linux: `~/.config/Brains/logs/`
- macOS: `~/Library/Logs/Brains/`
- Windows: `%APPDATA%\Brains\logs\`

## Distribution

### GitHub Releases

1. Create a new release tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. Upload built artifacts to GitHub Releases

3. Users can download from:
   ```
   https://github.com/yourusername/brains/releases/latest
   ```

### Package Managers

**Linux (Snap):**
```bash
snapcraft
snapcraft push brains_1.0.0_amd64.snap
```

**macOS (Homebrew):**
Create a Homebrew cask formula.

**Windows (Chocolatey):**
Create a Chocolatey package.

## Security

### Code Signing

**Importance:**
- Prevents "Unknown Publisher" warnings
- Required for macOS notarization
- Builds trust with users

**Get certificates:**
- macOS: Apple Developer Program
- Windows: DigiCert, Sectigo, etc.
- Linux: Not required

### Notarization (macOS)

Required for macOS 10.15+:

```bash
export APPLEID=your@email.com
export APPLEIDPASS=app-specific-password
npm run dist
```

electron-builder handles notarization automatically if credentials are set.

## Testing Builds

Before release:

1. ✅ Test on clean VMs
2. ✅ Verify all features work
3. ✅ Check terminal functionality
4. ✅ Test system monitor
5. ✅ Verify file explorer
6. ✅ Test browser widget
7. ✅ Check theme switching
8. ✅ Test resize/layout
9. ✅ Verify build size is reasonable
10. ✅ Check for console errors

## Versioning

Follow Semantic Versioning:
- `MAJOR.MINOR.PATCH`
- Example: `1.2.3`

Update version:
```bash
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.0 → 1.1.0
npm version major  # 1.0.0 → 2.0.0
```

## Checklist

Before release:

- [ ] Update version in `package.json`
- [ ] Update CHANGELOG.md
- [ ] Test on all target platforms
- [ ] Create icons for all platforms
- [ ] Set up code signing (if applicable)
- [ ] Build distributable packages
- [ ] Test installation from packages
- [ ] Create GitHub release
- [ ] Update documentation
- [ ] Announce release

Happy deploying! 🚀
