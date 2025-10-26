export type WidgetType = 'terminal' | 'system-monitor' | 'file-explorer' | 'browser' | 'welcome';

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  icon?: string;
  data?: Record<string, any>;
}

export interface Layout {
  id: string;
  name: string;
  widgets: Widget[];
  gridLayout?: any; // react-grid-layout configuration
}

export interface SystemMetrics {
  cpu: {
    avgLoad: number;
    currentLoad: number;
    currentLoadUser: number;
    currentLoadSystem: number;
    cores: number[];
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

export interface ElectronAPI {
  windows: {
    open: (kind: string) => Promise<boolean>;
  };
  browser: {
    open: (url: string) => Promise<{ ok: boolean; error?: string }>;
  };
  terminal: {
    spawn: (opts?: { cols?: number; rows?: number }) => Promise<{ ok: boolean; error?: string }>;
    write: (data: string) => void;
    resize: (size: { cols: number; rows: number }) => void;
    onData: (callback: (data: string) => void) => () => void;
  };
  system: {
    getSnapshot: () => Promise<{ ok: boolean; data?: SystemMetrics; error?: string }>;
    subscribe: (
      intervalMs: number,
      callback: (data: SystemMetrics) => void
    ) => Promise<() => void>;
  };
  files?: {
    readDir: (path: string) => Promise<{ ok: boolean; files?: any[]; error?: string }>;
    readFile: (path: string) => Promise<{ ok: boolean; content?: string; error?: string }>;
  };
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
}
