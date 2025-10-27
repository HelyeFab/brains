import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Widget, WidgetType } from '@/types';

/**
 * Widget Data Store - Manages persistent widget configuration only
 *
 * UI state (activeWidgetId) has been moved to useUIStore
 * This separation allows:
 * - Easier widget export/import
 * - Testing widget operations without UI state
 * - Clearing active selection without losing widgets
 */
interface WidgetStore {
  widgets: Widget[];
  addWidget: (type: WidgetType) => string;
  removeWidget: (id: string) => void;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  clearWidgets: () => void;
}

export const useWidgetStore = create<WidgetStore>()(
  persist(
    (set, get) => ({
      widgets: [],

      addWidget: (type) => {
        const id = `${type}-${Date.now()}`;
        const titles: Record<WidgetType, string> = {
          terminal: 'Terminal',
          'system-monitor': 'System Monitor',
          'file-explorer': 'File Explorer',
          browser: 'Browser',
          welcome: 'Welcome',
          pomodoro: 'Pomodoro Timer',
          notepad: 'Notes',
          settings: 'Settings',
          calendar: 'Calendar',
          'ai-chat': 'AI Chat',
          'code-server': 'Code Server',
          'code-editor': 'Code Editor',
        };

        set((state) => ({
          widgets: [
            ...state.widgets,
            {
              id,
              type,
              title: titles[type] || type,
              data: {},
            },
          ],
        }));

        return id;
      },

      removeWidget: (id) => {
        set((state) => ({
          widgets: state.widgets.filter((w) => w.id !== id),
        }));
      },

      updateWidget: (id, updates) => {
        set((state) => ({
          widgets: state.widgets.map((w) => (w.id === id ? { ...w, ...updates } : w)),
        }));
      },

      clearWidgets: () => {
        set({ widgets: [] });
      },
    }),
    {
      name: 'brains-widgets-storage',
    }
  )
);
