import React from 'react';
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

// Load AIChatWidget only on client side (react-syntax-highlighter doesn't support SSR well)
const AIChatWidget = dynamic(
  () => import('@/components/widgets/AIChatWidget').then(mod => ({ default: mod.AIChatWidget })),
  {
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center">
        <div className="text-muted-foreground">Loading AI Chat...</div>
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
  'ai-chat': AIChatWidget as React.ComponentType<{ widgetId: string }>,
};

export function WidgetContainer() {
  const { widgets, activeWidgetId } = useWidgetStore();
  const activeWidget = widgets.find((w) => w.id === activeWidgetId);

  // Always show Welcome widget when no active widget is selected
  if (!activeWidget) {
    return (
      <main className="h-full bg-background overflow-hidden" role="main" aria-label="Welcome widget">
        <WidgetErrorBoundary
          widgetId="welcome-default"
          widgetTitle="Welcome"
          key="welcome-default"
        >
          <WelcomeWidget widgetId="welcome-default" />
        </WidgetErrorBoundary>
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
