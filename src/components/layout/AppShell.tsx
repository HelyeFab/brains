import React from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Sidebar } from './Sidebar';
import { WidgetContainer } from './WidgetContainer';
import { Topbar } from './Topbar';
import { ThemeBackground } from './ThemeBackground';
import { useThemeStore } from '@/stores/useThemeStore';
import { cn } from '@/lib/utils';

export function AppShell() {
  const theme = useThemeStore((state) => state.theme);
  const themeId = useThemeStore((state) => state.themeId);

  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  // Simple color mapping for testing
  const colorMap = {
    'dark': 'rgb(0, 0, 0)',
    'light': 'rgb(255, 255, 255)',
    'creativity': 'rgb(255, 0, 0)', // RED
    'love': 'rgb(0, 255, 0)', // GREEN
    'cozy': 'rgb(0, 0, 255)', // BLUE
  };

  const bgColor = colorMap[themeId] || 'rgb(0, 0, 0)';

  console.log('AppShell theme:', { themeId, bgColor });

  return (
    <div
      className={cn('h-screen w-screen overflow-hidden relative', theme)}
      style={{ backgroundColor: bgColor }}
    >
      <div className="relative z-10">
        <Topbar className="bg-background/50 backdrop-blur-md" />
        <div className="flex h-[calc(100vh-3rem)]">
          <PanelGroup direction="horizontal">
            <Panel defaultSize={15} minSize={10} maxSize={30} className="border-r border-border bg-background/50 backdrop-blur-md">
              <Sidebar />
            </Panel>

            <PanelResizeHandle className="w-1 bg-border hover:bg-primary/50 transition-colors" />

            <Panel defaultSize={85} minSize={50} className="bg-background/50 backdrop-blur-md">
              <WidgetContainer />
            </Panel>
          </PanelGroup>
        </div>
      </div>
    </div>
  );
}
