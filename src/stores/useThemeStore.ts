import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type ThemeId, themes, getTheme } from '@/config/themes';

interface ThemeStore {
  themeId: ThemeId;
  // Legacy compatibility
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (themeId: ThemeId) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      themeId: 'creativity',
      theme: 'dark',

      toggleTheme: () => {
        const currentTheme = getTheme(get().themeId);
        const newTheme = currentTheme.baseTheme === 'dark' ? 'light' : 'dark';
        set({
          themeId: newTheme,
          theme: newTheme,
        });
      },

      setTheme: (themeId: ThemeId) => {
        const theme = getTheme(themeId);
        set({
          themeId,
          theme: theme.baseTheme,
        });
      },
    }),
    {
      name: 'brains-theme-storage',
    }
  )
);
