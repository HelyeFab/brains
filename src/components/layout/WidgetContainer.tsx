import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useWidgetStore } from '@/stores/useWidgetStore';
import { SystemMonitorWidget } from '@/components/widgets/SystemMonitorWidget';
import { FileExplorerWidget } from '@/components/widgets/FileExplorerWidget';
import { BrowserWidget } from '@/components/widgets/BrowserWidget';
import { WelcomeWidget } from '@/components/widgets/WelcomeWidget';
import type { WidgetType } from '@/types';

// Load TerminalWidget only on client side (xterm doesn't support SSR)
const TerminalWidget = dynamic(
  () => import('@/components/widgets/TerminalWidget').then(mod => ({ default: mod.TerminalWidget })),
  {
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center">
        <div className="text-muted-foreground">Loading terminal...</div>
      </div>
    ),
  }
);

const widgetComponents: Record<WidgetType, React.ComponentType<{ widgetId: string }>> = {
  terminal: TerminalWidget as React.ComponentType<{ widgetId: string }>,
  'system-monitor': SystemMonitorWidget,
  'file-explorer': FileExplorerWidget,
  browser: BrowserWidget,
  welcome: WelcomeWidget,
};

export function WidgetContainer() {
  const { widgets, activeWidgetId, addWidget } = useWidgetStore();
  const activeWidget = widgets.find((w) => w.id === activeWidgetId);

  // Add welcome widget on first load if no widgets exist
  useEffect(() => {
    if (widgets.length === 0) {
      addWidget('welcome');
    }
  }, []);

  if (!activeWidget) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Welcome to Brains</h2>
          <p className="text-muted-foreground">
            Add a widget to get started
          </p>
        </div>
      </div>
    );
  }

  const WidgetComponent = widgetComponents[activeWidget.type];

  return (
    <div className="h-full bg-background overflow-hidden">
      <WidgetComponent widgetId={activeWidget.id} />
    </div>
  );
}
