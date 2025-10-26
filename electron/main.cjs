const path = require('path');
const fs = require('fs').promises;
const { app, BrowserWindow, ipcMain } = require('electron');
const isDev = !!process.env.ELECTRON_START_URL;
const startUrl = process.env.ELECTRON_START_URL || '';
const si = require('systeminformation');

let pty = null;
try {
  // Optional: node-pty is not installed by default for Node 22; handled gracefully
  // eslint-disable-next-line import/no-extraneous-dependencies, global-require
  pty = require('node-pty');
} catch (e) {
  console.warn('node-pty not available; terminal will be disabled:', e && e.message);
}

const windows = {
  main: null,
};

const ptyByWebContents = new Map();
const systemIntervals = new Map();

function loadRoute(win, route) {
  if (isDev) {
    return win.loadURL(`${startUrl}${route}`);
  }
  // Static export output
  const clean = route.replace(/^\//, '');
  const file = clean ? path.join('out', clean, 'index.html') : path.join('out', 'index.html');
  const filePath = path.resolve(path.join(__dirname, '..', file));
  return win.loadFile(filePath);
}

function createWindow(kind) {
  const common = {
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.cjs'),
      sandbox: false,
      webviewTag: true,
    },
    show: false,
    backgroundColor: '#0a0a0a',
    titleBarStyle: 'hidden',
    frame: true,
  };

  let win;
  if (kind === 'main') {
    win = new BrowserWindow({ ...common, title: 'Brains - Modern Workspace' });
    loadRoute(win, '/');
  } else if (kind === 'browser') {
    win = new BrowserWindow({
      ...common,
      title: 'Brains - Browser',
      width: 1280,
      height: 900,
      titleBarStyle: 'default',
    });
  }

  win.once('ready-to-show', () => {
    win.show();
    if (isDev) win.webContents.openDevTools();
  });

  win.on('closed', () => {
    if (kind === 'main') windows.main = null;
  });

  return win;
}

function openMain() {
  if (windows.main && !windows.main.isDestroyed()) {
    windows.main.focus();
    return;
  }
  windows.main = createWindow('main');
}

// Removed separate terminal and system window functions - now using single window with widgets

app.whenReady().then(() => {
  openMain();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) openMain();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC: Open windows - deprecated, kept for compatibility
ipcMain.handle('windows:open', (event, kind) => {
  // Widgets are now managed in the main window
  return true;
});

// IPC: Open external URL in dedicated window
ipcMain.handle('browser:open', (event, url) => {
  const win = createWindow('browser');
  try {
    if (/^https?:\/\//i.test(url)) {
      win.loadURL(url);
      return { ok: true };
    }
    return { ok: false, error: 'Invalid URL (must start with http:// or https://)' };
  } catch (e) {
    return { ok: false, error: String(e && e.message) };
  }
});

// IPC: Terminal
ipcMain.handle('terminal:spawn', (event, opts = {}) => {
  if (!pty) {
    return { ok: false, error: 'PTY backend not available (node-pty not installed for this Node/Electron version).' };
  }
  const shell = process.env.SHELL || '/bin/bash';
  const cols = Number(opts.cols || 80);
  const rows = Number(opts.rows || 24);
  const term = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols,
    rows,
    cwd: process.env.HOME || process.cwd(),
    env: process.env,
  });
  const wcid = event.sender.id;
  ptyByWebContents.set(wcid, term);
  term.onData((data) => {
    try {
      event.sender.send('terminal:out', data);
    } catch (_) {
      // ignore if renderer gone
    }
  });

  const cleanup = () => {
    try { term.kill(); } catch (_) {}
    ptyByWebContents.delete(wcid);
  };
  const destroyHandler = () => cleanup();
  event.sender.once('destroyed', destroyHandler);

  return { ok: true };
});

ipcMain.on('terminal:in', (event, data) => {
  const term = ptyByWebContents.get(event.sender.id);
  if (term) term.write(data);
});

ipcMain.on('terminal:resize', (event, size) => {
  const term = ptyByWebContents.get(event.sender.id);
  if (term && size && size.cols && size.rows) {
    try { term.resize(Number(size.cols), Number(size.rows)); } catch (_) {}
  }
});

// IPC: System metrics
async function readMetrics() {
  const [load, mem] = await Promise.all([
    si.currentLoad(),
    si.mem(),
  ]);
  return {
    cpu: {
      avgLoad: load.avgload,
      currentLoad: load.currentload,
      currentLoadUser: load.currentload_user,
      currentLoadSystem: load.currentload_system,
      cores: load.cpus.map((c) => c.load),
    },
    mem: {
      total: mem.total,
      free: mem.free,
      used: mem.used,
      active: mem.active,
      available: mem.available,
      swapused: mem.swapused,
    },
  };
}

ipcMain.handle('system:getSnapshot', async () => {
  try {
    return { ok: true, data: await readMetrics() };
  } catch (e) {
    return { ok: false, error: String(e && e.message) };
  }
});

ipcMain.handle('system:subscribe', async (event, intervalMs = 1000) => {
  const id = event.sender.id;
  if (systemIntervals.has(id)) clearInterval(systemIntervals.get(id));
  const handle = setInterval(async () => {
    try {
      const data = await readMetrics();
      event.sender.send('system:metrics', data);
    } catch (_) {}
  }, Math.max(250, Number(intervalMs)));
  systemIntervals.set(id, handle);
  event.sender.once('destroyed', () => {
    if (systemIntervals.has(id)) clearInterval(systemIntervals.get(id));
    systemIntervals.delete(id);
  });
  return { ok: true };
});

ipcMain.handle('system:unsubscribe', (event) => {
  const id = event.sender.id;
  if (systemIntervals.has(id)) clearInterval(systemIntervals.get(id));
  systemIntervals.delete(id);
  return { ok: true };
});

// IPC: File System
ipcMain.handle('files:readDir', async (event, dirPath) => {
  try {
    // Security: Only allow access to home directory and subdirectories
    const homeDir = require('os').homedir();
    const resolvedPath = path.resolve(dirPath);

    if (!resolvedPath.startsWith(homeDir)) {
      return { ok: false, error: 'Access denied: Path must be within home directory' };
    }

    const entries = await fs.readdir(resolvedPath, { withFileTypes: true });
    const files = entries.map((entry) => ({
      name: entry.name,
      type: entry.isDirectory() ? 'directory' : 'file',
      path: path.join(resolvedPath, entry.name),
      isHidden: entry.name.startsWith('.'),
    }));

    // Sort: directories first, then files, alphabetically
    files.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === 'directory' ? -1 : 1;
    });

    return { ok: true, files };
  } catch (e) {
    return { ok: false, error: String(e && e.message) };
  }
});

ipcMain.handle('files:readFile', async (event, filePath) => {
  try {
    const homeDir = require('os').homedir();
    const resolvedPath = path.resolve(filePath);

    if (!resolvedPath.startsWith(homeDir)) {
      return { ok: false, error: 'Access denied: Path must be within home directory' };
    }

    const content = await fs.readFile(resolvedPath, 'utf-8');
    return { ok: true, content };
  } catch (e) {
    return { ok: false, error: String(e && e.message) };
  }
});

ipcMain.handle('files:getHomeDir', () => {
  return { ok: true, path: require('os').homedir() };
});
