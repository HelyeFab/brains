export type WidgetType = 'terminal' | 'system-monitor' | 'file-explorer' | 'browser' | 'welcome' | 'pomodoro' | 'notepad' | 'settings' | 'calendar' | 'ai-chat';

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  icon?: string;
  color?: string; // Tab/sidebar color for visual identification
  data?: Record<string, any>;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  color?: string;
  description?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  model?: string;
  tokens?: number;
  responseTime?: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  model: string;
  systemPrompt?: string;
  color?: string;
  createdAt: number;
  updatedAt: number;
}

export interface OllamaModel {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
  details?: {
    format?: string;
    family?: string;
    parameter_size?: string;
    quantization_level?: string;
  };
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

export interface Note {
  id: string;
  title: string;
  content: string; // Tiptap JSON content as string
  color?: string; // Color coding for visual identification
  createdAt: number;
  updatedAt: number;
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
  notes?: {
    export: (note: Note) => Promise<{ ok: boolean; error?: string }>;
    import: () => Promise<{ ok: boolean; note?: Note; error?: string }>;
  };
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
}
