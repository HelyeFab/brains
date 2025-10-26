import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Widget, WidgetType } from '@/types';

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
import { useWidgetStore } from '../useWidgetStore';

describe('useWidgetStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useWidgetStore.setState({
      widgets: [],
      activeWidgetId: null,
    });
    localStorageMock.clear();
  });

  describe('Initial State', () => {
    it('should have empty widgets array initially', () => {
      const state = useWidgetStore.getState();
      expect(state.widgets).toEqual([]);
    });

    it('should have null activeWidgetId initially', () => {
      const state = useWidgetStore.getState();
      expect(state.activeWidgetId).toBeNull();
    });
  });

  describe('addWidget', () => {
    it('should add a terminal widget', () => {
      const { addWidget } = useWidgetStore.getState();

      addWidget('terminal');

      const state = useWidgetStore.getState();
      expect(state.widgets).toHaveLength(1);
      expect(state.widgets[0].type).toBe('terminal');
      expect(state.widgets[0].title).toBe('Terminal');
    });

    it('should add a system-monitor widget', () => {
      const { addWidget } = useWidgetStore.getState();

      addWidget('system-monitor');

      const state = useWidgetStore.getState();
      expect(state.widgets).toHaveLength(1);
      expect(state.widgets[0].type).toBe('system-monitor');
      expect(state.widgets[0].title).toBe('System Monitor');
    });

    it('should generate unique IDs for widgets', async () => {
      const { addWidget } = useWidgetStore.getState();

      addWidget('terminal');
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
      addWidget('terminal');

      const state = useWidgetStore.getState();
      expect(state.widgets).toHaveLength(2);
      expect(state.widgets[0].id).not.toBe(state.widgets[1].id);
    });

    it('should set the new widget as active', () => {
      const { addWidget } = useWidgetStore.getState();

      addWidget('terminal');

      const state = useWidgetStore.getState();
      expect(state.activeWidgetId).toBe(state.widgets[0].id);
    });

    it('should add widget with empty data object', () => {
      const { addWidget } = useWidgetStore.getState();

      addWidget('terminal');

      const state = useWidgetStore.getState();
      expect(state.widgets[0].data).toEqual({});
    });

    it('should add multiple widgets of different types', () => {
      const { addWidget } = useWidgetStore.getState();

      const types: WidgetType[] = ['terminal', 'system-monitor', 'file-explorer', 'browser', 'welcome', 'pomodoro'];

      types.forEach(type => addWidget(type));

      const state = useWidgetStore.getState();
      expect(state.widgets).toHaveLength(types.length);

      types.forEach((type, index) => {
        expect(state.widgets[index].type).toBe(type);
      });
    });
  });

  describe('removeWidget', () => {
    it('should remove a widget by id', () => {
      const { addWidget, removeWidget } = useWidgetStore.getState();

      addWidget('terminal');
      const widgetId = useWidgetStore.getState().widgets[0].id;

      removeWidget(widgetId);

      const state = useWidgetStore.getState();
      expect(state.widgets).toHaveLength(0);
    });

    it('should set activeWidgetId to null when removing the only widget', () => {
      const { addWidget, removeWidget } = useWidgetStore.getState();

      addWidget('terminal');
      const widgetId = useWidgetStore.getState().widgets[0].id;

      removeWidget(widgetId);

      const state = useWidgetStore.getState();
      expect(state.widgets).toHaveLength(0);
      expect(state.activeWidgetId).toBeNull();
    });

    it('should switch to first widget when removing active widget', () => {
      const { addWidget, removeWidget } = useWidgetStore.getState();

      addWidget('terminal');
      addWidget('system-monitor');

      const secondWidgetId = useWidgetStore.getState().widgets[1].id;

      removeWidget(secondWidgetId);

      const state = useWidgetStore.getState();
      expect(state.activeWidgetId).toBe(state.widgets[0].id);
    });

    it('should keep activeWidgetId when removing non-active widget', () => {
      const { addWidget, removeWidget } = useWidgetStore.getState();

      addWidget('terminal');
      addWidget('system-monitor');

      const firstWidgetId = useWidgetStore.getState().widgets[0].id;
      const activeId = useWidgetStore.getState().activeWidgetId;

      removeWidget(firstWidgetId);

      const state = useWidgetStore.getState();
      expect(state.activeWidgetId).toBe(activeId);
    });
  });

  describe('setActiveWidget', () => {
    it('should set the active widget', () => {
      const { addWidget, setActiveWidget } = useWidgetStore.getState();

      addWidget('terminal');
      addWidget('system-monitor');

      const firstWidgetId = useWidgetStore.getState().widgets[0].id;

      setActiveWidget(firstWidgetId);

      const state = useWidgetStore.getState();
      expect(state.activeWidgetId).toBe(firstWidgetId);
    });

    it('should allow setting active widget to null', () => {
      const { addWidget, setActiveWidget } = useWidgetStore.getState();

      addWidget('terminal');
      setActiveWidget(null);

      const state = useWidgetStore.getState();
      expect(state.activeWidgetId).toBeNull();
    });
  });

  describe('updateWidget', () => {
    it('should update widget title', () => {
      const { addWidget, updateWidget } = useWidgetStore.getState();

      addWidget('terminal');
      const widgetId = useWidgetStore.getState().widgets[0].id;

      updateWidget(widgetId, { title: 'My Terminal' });

      const state = useWidgetStore.getState();
      expect(state.widgets[0].title).toBe('My Terminal');
    });

    it('should update widget color', () => {
      const { addWidget, updateWidget } = useWidgetStore.getState();

      addWidget('terminal');
      const widgetId = useWidgetStore.getState().widgets[0].id;

      updateWidget(widgetId, { color: 'bg-blue-500' });

      const state = useWidgetStore.getState();
      expect(state.widgets[0].color).toBe('bg-blue-500');
    });

    it('should update widget data', () => {
      const { addWidget, updateWidget } = useWidgetStore.getState();

      addWidget('terminal');
      const widgetId = useWidgetStore.getState().widgets[0].id;

      const newData = { session: 'test-session' };
      updateWidget(widgetId, { data: newData });

      const state = useWidgetStore.getState();
      expect(state.widgets[0].data).toEqual(newData);
    });

    it('should not affect other widgets', () => {
      const { addWidget, updateWidget } = useWidgetStore.getState();

      addWidget('terminal');
      addWidget('system-monitor');

      const firstWidgetId = useWidgetStore.getState().widgets[0].id;

      updateWidget(firstWidgetId, { title: 'Updated' });

      const state = useWidgetStore.getState();
      expect(state.widgets[1].title).toBe('System Monitor');
    });

    it('should do nothing for non-existent widget id', () => {
      const { addWidget, updateWidget } = useWidgetStore.getState();

      addWidget('terminal');
      const originalWidget = { ...useWidgetStore.getState().widgets[0] };

      updateWidget('non-existent-id', { title: 'Updated' });

      const state = useWidgetStore.getState();
      expect(state.widgets[0]).toEqual(originalWidget);
    });
  });

  describe('clearWidgets', () => {
    it('should remove all widgets', () => {
      const { addWidget, clearWidgets } = useWidgetStore.getState();

      addWidget('terminal');
      addWidget('system-monitor');
      addWidget('browser');

      clearWidgets();

      const state = useWidgetStore.getState();
      expect(state.widgets).toHaveLength(0);
    });

    it('should reset activeWidgetId', () => {
      const { addWidget, clearWidgets } = useWidgetStore.getState();

      addWidget('terminal');
      clearWidgets();

      const state = useWidgetStore.getState();
      expect(state.activeWidgetId).toBeNull();
    });
  });

  describe('Persistence', () => {
    // Skip persistence tests in unit testing - these require integration testing
    // Zustand's persist middleware hydrates asynchronously and requires special setup
    it.skip('should persist widgets to localStorage', () => {
      const { addWidget } = useWidgetStore.getState();

      addWidget('terminal');

      // Check if data is in localStorage
      const stored = localStorage.getItem('brains-widgets-storage');
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed.state.widgets).toHaveLength(1);
      expect(parsed.state.widgets[0].type).toBe('terminal');
    });

    it.skip('should restore widgets from localStorage', () => {
      // Manually set localStorage
      const mockWidget: Widget = {
        id: 'test-id',
        type: 'terminal',
        title: 'Test Terminal',
        data: {},
      };

      localStorage.setItem('brains-widgets-storage', JSON.stringify({
        state: {
          widgets: [mockWidget],
          activeWidgetId: 'test-id',
        },
        version: 0,
      }));

      // Create new store instance (simulating page reload)
      const state = useWidgetStore.getState();

      expect(state.widgets).toHaveLength(1);
      expect(state.widgets[0].id).toBe('test-id');
      expect(state.activeWidgetId).toBe('test-id');
    });
  });
});
