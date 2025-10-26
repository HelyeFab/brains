import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Widget, WidgetType } from '@/types';

interface WidgetStore {
  widgets: Widget[];
  activeWidgetId: string | null;
  addWidget: (type: WidgetType) => void;
  removeWidget: (id: string) => void;
  setActiveWidget: (id: string | null) => void;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  clearWidgets: () => void;
}

export const useWidgetStore = create<WidgetStore>()(
  persist(
    (set, get) => ({
      widgets: [],
      activeWidgetId: null,

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
          activeWidgetId: id,
        }));
      },

      removeWidget: (id) => {
        set((state) => {
          const remainingWidgets = state.widgets.filter((w) => w.id !== id);
          return {
            widgets: remainingWidgets,
            activeWidgetId:
              state.activeWidgetId === id ? remainingWidgets[0]?.id ?? null : state.activeWidgetId,
          };
        });
      },

      setActiveWidget: (id) => {
        set({ activeWidgetId: id });
      },

      updateWidget: (id, updates) => {
        set((state) => ({
          widgets: state.widgets.map((w) => (w.id === id ? { ...w, ...updates } : w)),
        }));
      },

      clearWidgets: () => {
        set({ widgets: [], activeWidgetId: null });
      },
    }),
    {
      name: 'brains-widgets-storage',
    }
  )
);
