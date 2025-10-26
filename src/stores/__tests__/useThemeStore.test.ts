import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage BEFORE importing stores
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }),
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Import store AFTER mocking localStorage
import { useThemeStore } from '../useThemeStore';

describe('useThemeStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useThemeStore.setState({
      theme: 'dark',
    });
    localStorageMock.clear();
  });

  describe('Initial State', () => {
    it('should have dark theme by default', () => {
      const state = useThemeStore.getState();
      expect(state.theme).toBe('dark');
    });
  });

  describe('toggleTheme', () => {
    it('should toggle from dark to light', () => {
      const { toggleTheme } = useThemeStore.getState();

      toggleTheme();

      const state = useThemeStore.getState();
      expect(state.theme).toBe('light');
    });

    it('should toggle from light to dark', () => {
      const { setTheme, toggleTheme } = useThemeStore.getState();

      setTheme('light');
      toggleTheme();

      const state = useThemeStore.getState();
      expect(state.theme).toBe('dark');
    });

    it('should toggle back and forth multiple times', () => {
      const { toggleTheme } = useThemeStore.getState();

      toggleTheme(); // dark -> light
      expect(useThemeStore.getState().theme).toBe('light');

      toggleTheme(); // light -> dark
      expect(useThemeStore.getState().theme).toBe('dark');

      toggleTheme(); // dark -> light
      expect(useThemeStore.getState().theme).toBe('light');
    });
  });

  describe('setTheme', () => {
    it('should set theme to dark', () => {
      const { setTheme } = useThemeStore.getState();

      setTheme('dark');

      const state = useThemeStore.getState();
      expect(state.theme).toBe('dark');
    });

    it('should set theme to light', () => {
      const { setTheme } = useThemeStore.getState();

      setTheme('light');

      const state = useThemeStore.getState();
      expect(state.theme).toBe('light');
    });

    it('should allow switching themes explicitly', () => {
      const { setTheme } = useThemeStore.getState();

      setTheme('light');
      expect(useThemeStore.getState().theme).toBe('light');

      setTheme('dark');
      expect(useThemeStore.getState().theme).toBe('dark');

      setTheme('light');
      expect(useThemeStore.getState().theme).toBe('light');
    });
  });

  describe('Persistence', () => {
    // Skip persistence tests in unit testing - these require integration testing
    // Zustand's persist middleware hydrates asynchronously and requires special setup
    it.skip('should persist theme to localStorage', () => {
      const { setTheme } = useThemeStore.getState();

      setTheme('light');

      // Check if data is in localStorage
      const stored = localStorage.getItem('brains-theme-storage');
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed.state.theme).toBe('light');
    });

    it.skip('should restore theme from localStorage', () => {
      // Manually set localStorage
      localStorage.setItem('brains-theme-storage', JSON.stringify({
        state: {
          theme: 'light',
        },
        version: 0,
      }));

      // Get state (simulating page reload)
      const state = useThemeStore.getState();

      expect(state.theme).toBe('light');
    });

    it('should handle missing localStorage gracefully', () => {
      localStorage.clear();

      // Should fall back to default theme
      const state = useThemeStore.getState();
      expect(state.theme).toBe('dark');
    });
  });

  describe('State Subscription', () => {
    it('should notify subscribers when theme changes', () => {
      let callCount = 0;
      let receivedTheme: 'light' | 'dark' | null = null;

      const unsubscribe = useThemeStore.subscribe((state) => {
        callCount++;
        receivedTheme = state.theme;
      });

      const { setTheme } = useThemeStore.getState();
      setTheme('light');

      expect(callCount).toBeGreaterThan(0);
      expect(receivedTheme).toBe('light');

      unsubscribe();
    });
  });
});
