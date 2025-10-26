import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock Electron API
global.window.api = {
  windows: {
    open: vi.fn().mockResolvedValue(true),
  },
  browser: {
    open: vi.fn().mockResolvedValue({ ok: true }),
  },
  terminal: {
    spawn: vi.fn().mockResolvedValue({ ok: true }),
    write: vi.fn(),
    resize: vi.fn(),
    onData: vi.fn().mockReturnValue(() => {}),
  },
  system: {
    getSnapshot: vi.fn().mockResolvedValue({
      ok: true,
      data: {
        cpu: {
          avgLoad: 0,
          currentLoad: 25,
          currentLoadUser: 15,
          currentLoadSystem: 10,
          cores: [20, 25, 30, 35],
        },
        mem: {
          total: 16000000000,
          free: 8000000000,
          used: 8000000000,
          active: 6000000000,
          available: 10000000000,
          swapused: 0,
        },
      },
    }),
    subscribe: vi.fn().mockResolvedValue(() => {}),
  },
} as any;
