import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useWidgetStore } from '@/stores/useWidgetStore';
import { SystemMonitorWidget } from '@/components/widgets/SystemMonitorWidget';
import { FileExplorerWidget } from '@/components/widgets/FileExplorerWidget';
import { BrowserWidget } from '@/components/widgets/BrowserWidget';
import { WelcomeWidget } from '@/components/widgets/WelcomeWidget';
import { PomodoroWidget } from '@/components/widgets/PomodoroWidget';
import { NotePadWidget } from '@/components/widgets/NotePadWidget';
import { SettingsWidget } from '@/components/widgets/SettingsWidget';
import { CalendarWidget } from '@/components/widgets/CalendarWidget';
import { AIChatWidget } from '@/components/widgets/AIChatWidget';
import { WidgetErrorBoundary } from '@/components/widgets/WidgetErrorBoundary';
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
  pomodoro: PomodoroWidget,
  notepad: NotePadWidget,
  settings: SettingsWidget,
  calendar: CalendarWidget,
  'ai-chat': AIChatWidget,
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
      <main className="h-full flex items-center justify-center bg-background" role="main" aria-label="Widget workspace">
        <div className="text-center" role="status">
          <h2 className="text-2xl font-bold mb-2">Welcome to Brains</h2>
          <p className="text-muted-foreground">
            Add a widget to get started
          </p>
        </div>
      </main>
    );
  }

  const WidgetComponent = widgetComponents[activeWidget.type];

  return (
    <main className="h-full bg-background overflow-hidden" role="main" aria-label={`${activeWidget.title} widget`}>
      <WidgetErrorBoundary
        widgetId={activeWidget.id}
        widgetTitle={activeWidget.title}
        key={activeWidget.id} // Remount on widget change to reset error state
      >
        <WidgetComponent widgetId={activeWidget.id} />
      </WidgetErrorBoundary>
    </main>
  );
}
