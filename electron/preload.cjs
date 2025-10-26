const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  windows: {
    open: (kind) => ipcRenderer.invoke('windows:open', kind),
    close: () => ipcRenderer.invoke('windows:close'),
  },
  browser: {
    open: (url) => ipcRenderer.invoke('browser:open', url),
  },
  terminal: {
    spawn: (opts) => ipcRenderer.invoke('terminal:spawn', opts),
    write: (data) => ipcRenderer.send('terminal:in', data),
    resize: (size) => ipcRenderer.send('terminal:resize', size),
    onData: (cb) => {
      const listener = (_evt, data) => cb(data);
      ipcRenderer.on('terminal:out', listener);
      return () => ipcRenderer.off('terminal:out', listener);
    },
  },
  system: {
    getSnapshot: () => ipcRenderer.invoke('system:getSnapshot'),
    subscribe: async (intervalMs, cb) => {
      const listener = (_evt, payload) => cb(payload);
      ipcRenderer.on('system:metrics', listener);
      await ipcRenderer.invoke('system:subscribe', intervalMs);
      return () => {
        ipcRenderer.off('system:metrics', listener);
        ipcRenderer.invoke('system:unsubscribe');
      };
    },
  },
  files: {
    readDir: (path) => ipcRenderer.invoke('files:readDir', path),
    readFile: (path) => ipcRenderer.invoke('files:readFile', path),
    getHomeDir: () => ipcRenderer.invoke('files:getHomeDir'),
  },
  notes: {
    export: (note) => ipcRenderer.invoke('notes:export', note),
    import: () => ipcRenderer.invoke('notes:import'),
  },
});
