import React from 'react';
import { useWidgetStore } from '@/stores/useWidgetStore';
import { TerminalWidget } from '@/components/widgets/TerminalWidget';
import { SystemMonitorWidget } from '@/components/widgets/SystemMonitorWidget';
import { FileExplorerWidget } from '@/components/widgets/FileExplorerWidget';
import { BrowserWidget } from '@/components/widgets/BrowserWidget';
import { WelcomeWidget } from '@/components/widgets/WelcomeWidget';
import type { WidgetType } from '@/types';

const widgetComponents: Record<WidgetType, React.ComponentType<{ widgetId: string }>> = {
  terminal: TerminalWidget,
  'system-monitor': SystemMonitorWidget,
  'file-explorer': FileExplorerWidget,
  browser: BrowserWidget,
  welcome: WelcomeWidget,
};

export function WidgetContainer() {
  const { widgets, activeWidgetId } = useWidgetStore();
  const activeWidget = widgets.find((w) => w.id === activeWidgetId);

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
