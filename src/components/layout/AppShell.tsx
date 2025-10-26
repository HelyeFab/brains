import React from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Sidebar } from './Sidebar';
import { WidgetContainer } from './WidgetContainer';
import { Topbar } from './Topbar';
import { useThemeStore } from '@/stores/useThemeStore';
import { cn } from '@/lib/utils';

export function AppShell() {
  const theme = useThemeStore((state) => state.theme);

  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  return (
    <div className={cn('h-screen w-screen overflow-hidden bg-background', theme)}>
      <Topbar />
      <div className="flex h-[calc(100vh-3rem)]">
        <PanelGroup direction="horizontal">
          <Panel defaultSize={15} minSize={10} maxSize={30} className="border-r border-border">
            <Sidebar />
          </Panel>

          <PanelResizeHandle className="w-1 bg-border hover:bg-primary/50 transition-colors" />

          <Panel defaultSize={85} minSize={50}>
            <WidgetContainer />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
