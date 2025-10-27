import React from 'react';
import { useThemeStore } from '@/stores/useThemeStore';
import { getTheme } from '@/config/themes';

export function ThemeBackground() {
  const themeId = useThemeStore((state) => state.themeId);
  const theme = getTheme(themeId);

  // Simple color mapping for testing
  const colorMap = {
    'dark': 'rgba(0, 0, 0, 0)', // No background
    'light': 'rgba(0, 0, 0, 0)', // No background
    'creativity': 'rgba(255, 0, 0, 0.2)', // RED
    'love': 'rgba(0, 255, 0, 0.2)', // GREEN
    'cozy': 'rgba(0, 0, 255, 0.2)', // BLUE
  };

  const bgColor = colorMap[themeId] || 'rgba(0, 0, 0, 0)';

  console.log('ThemeBackground:', { themeId, bgColor });

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        backgroundColor: bgColor,
        zIndex: 0,
      }}
      aria-hidden="true"
    />
  );
}
