# Widget Development Guide

Learn how to create custom widgets for Brains.

## Widget Basics

A widget is a self-contained React component that renders in the main workspace area.

### Minimal Widget

```typescript
// src/components/widgets/MyWidget.tsx
import React from 'react';

interface MyWidgetProps {
  widgetId: string;
}

export function MyWidget({ widgetId }: MyWidgetProps) {
  return (
    <div className="h-full p-6">
      <h2>My Custom Widget</h2>
      <p>Widget ID: {widgetId}</p>
    </div>
  );
}
```

## Step-by-Step Guide

### 1. Define Widget Type

Add your widget type to `src/types/index.ts`:

```typescript
export type WidgetType =
  | 'terminal'
  | 'system-monitor'
  | 'file-explorer'
  | 'browser'
  | 'welcome'
  | 'my-widget'; // Add your type here
```

### 2. Create Widget Component

Create your component in `src/components/widgets/`:

```typescript
// src/components/widgets/MyWidget.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface MyWidgetProps {
  widgetId: string;
}

export function MyWidget({ widgetId }: MyWidgetProps) {
  const [count, setCount] = useState(0);

  return (
    <div className="h-full overflow-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>My Custom Widget</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Count: {count}</p>
          <Button onClick={() => setCount(count + 1)}>
            Increment
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 3. Register Widget

Register it in `src/components/layout/WidgetContainer.tsx`:

```typescript
import { MyWidget } from '@/components/widgets/MyWidget';

const widgetComponents: Record<WidgetType, React.ComponentType<{ widgetId: string }>> = {
  terminal: TerminalWidget,
  'system-monitor': SystemMonitorWidget,
  'file-explorer': FileExplorerWidget,
  browser: BrowserWidget,
  welcome: WelcomeWidget,
  'my-widget': MyWidget, // Add here
};
```

### 4. Add to Sidebar Icons

Add icon mapping in `src/components/layout/Sidebar.tsx`:

```typescript
import { Sparkles } from 'lucide-react'; // Your icon

const widgetIcons: Record<WidgetType, React.ElementType> = {
  terminal: Terminal,
  'system-monitor': Activity,
  'file-explorer': Folder,
  browser: Globe,
  welcome: Home,
  'my-widget': Sparkles, // Add here
};
```

### 5. Add to Menu

Add to the "New Widget" menu in `src/components/layout/Topbar.tsx`:

```typescript
const widgetTypes: { type: WidgetType; label: string; icon: string }[] = [
  { type: 'terminal', label: 'Terminal', icon: '>' },
  { type: 'system-monitor', label: 'System Monitor', icon: '📊' },
  { type: 'file-explorer', label: 'File Explorer', icon: '📁' },
  { type: 'browser', label: 'Browser', icon: '🌐' },
  { type: 'my-widget', label: 'My Widget', icon: '✨' }, // Add here
];
```

## Advanced Patterns

### Using Electron IPC

Access Electron APIs via the preload script:

```typescript
export function MyWidget({ widgetId }: MyWidgetProps) {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Check if API is available
    if (!window.api?.myCustomAPI) return;

    // Call IPC handler
    window.api.myCustomAPI.getData()
      .then(result => {
        if (result.ok) {
          setData(result.data);
        }
      });
  }, []);

  return <div>{/* render data */}</div>;
}
```

**Add IPC handler in `electron/main.cjs`:**

```javascript
ipcMain.handle('my-custom-api:get-data', async () => {
  try {
    const data = await fetchSomeData();
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: error.message };
  }
});
```

**Expose in preload (`electron/preload.cjs`):**

```javascript
contextBridge.exposeInMainWorld('api', {
  // ... existing APIs
  myCustomAPI: {
    getData: () => ipcRenderer.invoke('my-custom-api:get-data'),
  },
});
```

### Widget-Specific State

Store widget-specific data in the widget store:

```typescript
export function MyWidget({ widgetId }: MyWidgetProps) {
  const updateWidget = useWidgetStore((state) => state.updateWidget);
  const widget = useWidgetStore((state) =>
    state.widgets.find(w => w.id === widgetId)
  );

  const setMyData = (value: any) => {
    updateWidget(widgetId, {
      data: { ...widget?.data, myValue: value }
    });
  };

  return (
    <div>
      <p>Stored value: {widget?.data?.myValue}</p>
      <Button onClick={() => setMyData('new value')}>
        Update
      </Button>
    </div>
  );
}
```

### Cleanup on Unmount

Always clean up resources:

```typescript
export function MyWidget({ widgetId }: MyWidgetProps) {
  useEffect(() => {
    const interval = setInterval(() => {
      // Do something
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return <div>...</div>;
}
```

## Styling Guidelines

### Use Tailwind Classes

```typescript
<div className="h-full overflow-auto p-6 bg-background">
  <Card className="max-w-2xl">
    <CardContent className="space-y-4">
      {/* content */}
    </CardContent>
  </Card>
</div>
```

### Theme-Aware Colors

Use CSS variables for theme support:

```typescript
<div className="bg-card text-card-foreground border border-border">
  <span className="text-primary">Highlighted</span>
  <span className="text-muted-foreground">Muted</span>
</div>
```

### Responsive Layouts

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* items */}
</div>
```

## Examples

### Data Fetching Widget

```typescript
export function DataWidget({ widgetId }: { widgetId: string }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('https://api.example.com/data');
        const json = await response.json();
        setData(json);
      } catch (error) {
        console.error('Failed to fetch:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <div className="h-full flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="h-full overflow-auto p-6">
      <div className="space-y-2">
        {data.map((item, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              {JSON.stringify(item)}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

### Interactive Chart Widget

```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function ChartWidget({ widgetId }: { widgetId: string }) {
  const [data, setData] = useState([
    { name: 'A', value: 10 },
    { name: 'B', value: 20 },
    { name: 'C', value: 15 },
  ]);

  return (
    <div className="h-full p-6">
      <Card>
        <CardHeader>
          <CardTitle>Chart Example</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
```

## Best Practices

1. **Always use TypeScript** for type safety
2. **Handle errors gracefully** with try-catch and error boundaries
3. **Clean up resources** in useEffect cleanup functions
4. **Use semantic HTML** for accessibility
5. **Responsive design** - test at different window sizes
6. **Loading states** - show feedback for async operations
7. **Empty states** - handle no-data scenarios
8. **Keyboard navigation** - make widgets keyboard-accessible
9. **Performance** - avoid unnecessary re-renders with React.memo
10. **Consistent styling** - follow existing UI patterns

## Testing Your Widget

1. Add the widget via "New Widget" menu
2. Test theme switching (light/dark)
3. Test window resize
4. Test with multiple instances
5. Test cleanup when widget is removed
6. Test with dev tools open (check for errors)

## Publishing Your Widget

To share your widget:

1. Create a PR with:
   - Widget component
   - Type definition
   - Documentation
   - Screenshots/demo
2. Follow code review feedback
3. Ensure tests pass
4. Update CHANGELOG.md

Happy widget building! 🎉
