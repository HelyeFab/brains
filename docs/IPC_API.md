# Electron IPC API Reference

Complete reference for the Electron IPC API exposed to the renderer process.

## API Structure

The API is exposed via the `window.api` object in the renderer process. All methods are type-safe and defined in `src/types/index.ts`.

## Terminal API

### `terminal.spawn(opts?)`

Spawn a new PTY process for the terminal.

**Parameters:**
```typescript
opts?: {
  cols?: number;  // Terminal columns (default: 80)
  rows?: number;  // Terminal rows (default: 24)
}
```

**Returns:**
```typescript
Promise<{
  ok: boolean;
  error?: string;
}>
```

**Example:**
```typescript
const result = await window.api.terminal.spawn({ cols: 120, rows: 30 });
if (!result.ok) {
  console.error('Failed to spawn terminal:', result.error);
}
```

---

### `terminal.write(data)`

Write data to the terminal (user input).

**Parameters:**
```typescript
data: string  // Data to write to PTY
```

**Returns:** `void`

**Example:**
```typescript
window.api.terminal.write('ls -la\n');
```

---

### `terminal.resize(size)`

Resize the PTY to match terminal dimensions.

**Parameters:**
```typescript
size: {
  cols: number;
  rows: number;
}
```

**Returns:** `void`

**Example:**
```typescript
window.api.terminal.resize({ cols: 100, rows: 40 });
```

---

### `terminal.onData(callback)`

Listen for output from the terminal.

**Parameters:**
```typescript
callback: (data: string) => void
```

**Returns:** `() => void` (cleanup function)

**Example:**
```typescript
const cleanup = window.api.terminal.onData((data) => {
  console.log('Terminal output:', data);
  term.write(data);
});

// Later, to stop listening:
cleanup();
```

## System API

### `system.getSnapshot()`

Get a one-time snapshot of system metrics.

**Returns:**
```typescript
Promise<{
  ok: boolean;
  data?: SystemMetrics;
  error?: string;
}>
```

**SystemMetrics:**
```typescript
{
  cpu: {
    avgLoad: number;
    currentLoad: number;
    currentLoadUser: number;
    currentLoadSystem: number;
    cores: number[];  // Per-core load percentages
  };
  mem: {
    total: number;
    free: number;
    used: number;
    active: number;
    available: number;
    swapused: number;
  };
}
```

**Example:**
```typescript
const result = await window.api.system.getSnapshot();
if (result.ok) {
  console.log('CPU Load:', result.data.cpu.currentLoad);
  console.log('Memory Used:', result.data.mem.used);
}
```

---

### `system.subscribe(intervalMs, callback)`

Subscribe to periodic system metrics updates.

**Parameters:**
```typescript
intervalMs: number            // Update interval (min 250ms)
callback: (data: SystemMetrics) => void
```

**Returns:**
```typescript
Promise<() => void>  // Cleanup function
```

**Example:**
```typescript
const unsubscribe = await window.api.system.subscribe(1000, (metrics) => {
  setCurrentMetrics(metrics);
});

// Later, to stop receiving updates:
unsubscribe();
```

## Browser API

### `browser.open(url)`

Open a URL in a new browser window.

**Parameters:**
```typescript
url: string  // Must start with http:// or https://
```

**Returns:**
```typescript
Promise<{
  ok: boolean;
  error?: string;
}>
```

**Example:**
```typescript
const result = await window.api.browser.open('https://example.com');
if (!result.ok) {
  alert(result.error);
}
```

## Windows API (Deprecated)

### `windows.open(kind)`

**Deprecated:** This API is kept for compatibility but widgets are now managed in the main window.

**Parameters:**
```typescript
kind: string  // 'terminal' | 'system'
```

**Returns:**
```typescript
Promise<boolean>
```

## Adding Custom IPC Handlers

### 1. Main Process

Add handler in `electron/main.cjs`:

```javascript
ipcMain.handle('my-feature:do-something', async (event, arg1, arg2) => {
  try {
    const result = await performOperation(arg1, arg2);
    return { ok: true, data: result };
  } catch (error) {
    return { ok: false, error: error.message };
  }
});
```

### 2. Preload Script

Expose API in `electron/preload.cjs`:

```javascript
contextBridge.exposeInMainWorld('api', {
  // ... existing APIs
  myFeature: {
    doSomething: (arg1, arg2) => ipcRenderer.invoke('my-feature:do-something', arg1, arg2),
  },
});
```

### 3. TypeScript Types

Update `src/types/index.ts`:

```typescript
export interface ElectronAPI {
  // ... existing APIs
  myFeature?: {
    doSomething: (arg1: string, arg2: number) => Promise<{
      ok: boolean;
      data?: any;
      error?: string;
    }>;
  };
}
```

## Best Practices

### Error Handling

Always check for API availability:

```typescript
if (!window.api?.terminal) {
  console.error('Terminal API not available');
  return;
}
```

### Cleanup

Always cleanup listeners:

```typescript
useEffect(() => {
  if (!window.api?.terminal) return;

  const cleanup = window.api.terminal.onData(handleData);
  return () => cleanup();
}, []);
```

### Type Safety

Use TypeScript types:

```typescript
import type { SystemMetrics } from '@/types';

const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
```

### Async Operations

Handle promises properly:

```typescript
const fetchData = async () => {
  try {
    const result = await window.api.system.getSnapshot();
    if (result.ok) {
      setData(result.data);
    } else {
      setError(result.error);
    }
  } catch (err) {
    setError('Unexpected error');
  }
};
```

## Security Considerations

### Context Isolation

The app uses `contextIsolation: true`, which means:
- Renderer can't directly access Node.js APIs
- Only exposed APIs via `contextBridge` are available
- Protects against XSS and injection attacks

### Input Validation

Always validate inputs in main process:

```javascript
ipcMain.handle('my-api:process', async (event, userInput) => {
  // Validate
  if (typeof userInput !== 'string' || userInput.length > 1000) {
    return { ok: false, error: 'Invalid input' };
  }

  // Process safely
  const result = await processInput(userInput);
  return { ok: true, data: result };
});
```

### Sandboxing

Note: Sandbox is currently disabled for native module compatibility (node-pty). For production:
- Minimize native dependencies
- Validate all IPC inputs
- Use CSP headers
- Keep Electron updated

## Performance Tips

1. **Debounce frequent calls**
   ```typescript
   const debouncedResize = debounce((size) => {
     window.api.terminal.resize(size);
   }, 100);
   ```

2. **Unsubscribe when not needed**
   ```typescript
   useEffect(() => {
     const unsub = await window.api.system.subscribe(1000, handleMetrics);
     return () => unsub();
   }, []);
   ```

3. **Batch operations**
   - Don't make IPC calls in tight loops
   - Collect data and send in batches

4. **Use appropriate intervals**
   - System metrics: 1000ms (1 second)
   - Less frequent: 5000ms (5 seconds)
   - Avoid intervals < 250ms

## Debugging

Enable Electron DevTools:

```javascript
// In development
if (isDev) {
  win.webContents.openDevTools();
}
```

Monitor IPC in console:

```typescript
window.api.system.getSnapshot().then(console.log);
```

Check for errors:

```typescript
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});
```
