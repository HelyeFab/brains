const path = require('path');
const fs = require('fs').promises;
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const isDev = !!process.env.ELECTRON_START_URL;
const startUrl = process.env.ELECTRON_START_URL || '';
const si = require('systeminformation');
const { validateSender, unauthorizedError, validateFilePath } = require('./lib/security.cjs');

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

/**
 * Safely extract error message from unknown error type
 * @param {unknown} error - The error to extract message from
 * @returns {string} Error message
 */
function getErrorMessage(error) {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Unknown error occurred';
}

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

// IPC: Close window
ipcMain.handle('windows:close', (event) => {
  // Security: Validate sender is from main window
  if (!validateSender(event, windows.main)) {
    return unauthorizedError('windows:close');
  }

  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    win.close();
  }
  return { ok: true };
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
    return { ok: false, error: getErrorMessage(e) };
  }
});

// IPC: Terminal
ipcMain.handle('terminal:spawn', (event, opts = {}) => {
  // Security: Validate sender is from main window
  if (!validateSender(event, windows.main)) {
    return unauthorizedError('terminal:spawn');
  }

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
  // Security: Validate sender is from main window
  if (!validateSender(event, windows.main)) {
    return;
  }

  const term = ptyByWebContents.get(event.sender.id);
  if (term) term.write(data);
});

ipcMain.on('terminal:resize', (event, size) => {
  // Security: Validate sender is from main window
  if (!validateSender(event, windows.main)) {
    return;
  }

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

ipcMain.handle('system:getSnapshot', async (event) => {
  // Security: Validate sender is from main window
  if (!validateSender(event, windows.main)) {
    return unauthorizedError('system:getSnapshot');
  }

  try {
    return { ok: true, data: await readMetrics() };
  } catch (e) {
    return { ok: false, error: getErrorMessage(e) };
  }
});

ipcMain.handle('system:subscribe', async (event, intervalMs = 1000) => {
  // Security: Validate sender is from main window
  if (!validateSender(event, windows.main)) {
    return unauthorizedError('system:subscribe');
  }

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
  // Security: Validate sender is from main window
  if (!validateSender(event, windows.main)) {
    return unauthorizedError('system:unsubscribe');
  }

  const id = event.sender.id;
  if (systemIntervals.has(id)) clearInterval(systemIntervals.get(id));
  systemIntervals.delete(id);
  return { ok: true };
});

// IPC: File System
ipcMain.handle('files:readDir', async (event, dirPath) => {
  // Security: Validate sender is from main window
  if (!validateSender(event, windows.main)) {
    return unauthorizedError('files:readDir');
  }

  try {
    // Security: Only allow access to home directory and subdirectories
    const homeDir = require('os').homedir();
    const resolvedPath = path.resolve(dirPath);

    if (!validateFilePath(resolvedPath, homeDir)) {
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
    return { ok: false, error: getErrorMessage(e) };
  }
});

ipcMain.handle('files:readFile', async (event, filePath) => {
  // Security: Validate sender is from main window
  if (!validateSender(event, windows.main)) {
    return unauthorizedError('files:readFile');
  }

  try {
    const homeDir = require('os').homedir();
    const resolvedPath = path.resolve(filePath);

    if (!validateFilePath(resolvedPath, homeDir)) {
      return { ok: false, error: 'Access denied: Path must be within home directory' };
    }

    const content = await fs.readFile(resolvedPath, 'utf-8');
    return { ok: true, content };
  } catch (e) {
    return { ok: false, error: getErrorMessage(e) };
  }
});

ipcMain.handle('files:getHomeDir', (event) => {
  // Security: Validate sender is from main window
  if (!validateSender(event, windows.main)) {
    return unauthorizedError('files:getHomeDir');
  }

  return { ok: true, path: require('os').homedir() };
});

// IPC: Notes - Export and Import
ipcMain.handle('notes:export', async (event, note) => {
  // Security: Validate sender is from main window
  if (!validateSender(event, windows.main)) {
    return unauthorizedError('notes:export');
  }

  try {
    const homeDir = require('os').homedir();
    const notesDir = path.join(homeDir, 'Documents', 'Brains', 'Notes');

    // Ensure notes directory exists
    await fs.mkdir(notesDir, { recursive: true });

    const sanitizedTitle = note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const defaultPath = path.join(notesDir, `${sanitizedTitle}.json`);

    const result = await dialog.showSaveDialog({
      title: 'Export Note',
      defaultPath,
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['createDirectory']
    });

    if (result.canceled || !result.filePath) {
      return { ok: false, error: 'Export cancelled' };
    }

    await fs.writeFile(result.filePath, JSON.stringify(note, null, 2), 'utf-8');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: getErrorMessage(e) };
  }
});

ipcMain.handle('notes:import', async (event) => {
  // Security: Validate sender is from main window
  if (!validateSender(event, windows.main)) {
    return unauthorizedError('notes:import');
  }

  try {
    const homeDir = require('os').homedir();
    const notesDir = path.join(homeDir, 'Documents', 'Brains', 'Notes');

    const result = await dialog.showOpenDialog({
      title: 'Import Note',
      defaultPath: notesDir,
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    });

    if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
      return { ok: false, error: 'Import cancelled' };
    }

    const content = await fs.readFile(result.filePaths[0], 'utf-8');
    const note = JSON.parse(content);

    // Basic validation
    if (!note.id || !note.title || !note.content) {
      return { ok: false, error: 'Invalid note file format' };
    }

    return { ok: true, note };
  } catch (e) {
    return { ok: false, error: getErrorMessage(e) };
  }
});
