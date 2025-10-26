import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { useWidgetStore } from '@/stores/useWidgetStore';
import { useThemeStore } from '@/stores/useThemeStore';
import type { Widget, WidgetType } from '@/types';

/**
 * Custom render function that wraps components with providers
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

/**
 * Create a mock widget for testing
 */
export function createMockWidget(
  type: WidgetType = 'welcome',
  overrides?: Partial<Widget>
): Widget {
  return {
    id: `${type}-${Date.now()}`,
    type,
    title: `Test ${type}`,
    data: {},
    ...overrides,
  };
}

/**
 * Reset all Zustand stores to their initial state
 */
export function resetStores() {
  useWidgetStore.setState({
    widgets: [],
    activeWidgetId: null,
  });

  useThemeStore.setState({
    theme: 'dark',
  });
}

/**
 * Setup Zustand store with initial widgets
 */
export function setupWidgetStore(widgets: Widget[], activeWidgetId?: string | null) {
  useWidgetStore.setState({
    widgets,
    activeWidgetId: activeWidgetId ?? widgets[0]?.id ?? null,
  });
}

/**
 * Mock system metrics data for testing
 */
export const mockSystemMetrics = {
  cpu: {
    avgLoad: 0.5,
    currentLoad: 25.5,
    currentLoadUser: 15.2,
    currentLoadSystem: 10.3,
    cores: [20, 25, 30, 35, 22, 28, 32, 36],
  },
  mem: {
    total: 16000000000,
    free: 8000000000,
    used: 8000000000,
    active: 6000000000,
    available: 10000000000,
    swapused: 1000000000,
  },
};

/**
 * Wait for async state updates
 */
export const waitForStoreUpdate = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Create mock Electron API for testing
 */
export function createMockElectronAPI() {
  return {
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
        data: mockSystemMetrics,
      }),
      subscribe: vi.fn().mockImplementation((interval, callback) => {
        const unsubscribe = vi.fn();
        return Promise.resolve(unsubscribe);
      }),
    },
    files: {
      readDir: vi.fn().mockResolvedValue({
        ok: true,
        files: [
          { name: 'test.txt', type: 'file', path: '/home/test/test.txt', isHidden: false },
          { name: 'folder', type: 'directory', path: '/home/test/folder', isHidden: false },
        ],
      }),
      readFile: vi.fn().mockResolvedValue({
        ok: true,
        content: 'Test file content',
      }),
    },
  };
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
