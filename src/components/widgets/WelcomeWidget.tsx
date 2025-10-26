import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useWidgetStore } from '@/stores/useWidgetStore';
import { Terminal, Activity, Folder, Globe, Sparkles, Calendar } from 'lucide-react';
import type { WidgetType } from '@/types';

interface WelcomeWidgetProps {
  widgetId: string;
}

export function WelcomeWidget({ widgetId }: WelcomeWidgetProps) {
  const addWidget = useWidgetStore((state) => state.addWidget);

  const widgets: { type: WidgetType; title: string; description: string; icon: React.ElementType; color: string }[] = [
    {
      type: 'terminal',
      title: 'Terminal',
      description: 'Full-featured terminal with xterm.js',
      icon: Terminal,
      color: 'text-green-500',
    },
    {
      type: 'system-monitor',
      title: 'System Monitor',
      description: 'Real-time CPU, memory, and system metrics',
      icon: Activity,
      color: 'text-blue-500',
    },
    {
      type: 'calendar',
      title: 'Calendar',
      description: 'Schedule and manage your events',
      icon: Calendar,
      color: 'text-purple-500',
    },
    {
      type: 'file-explorer',
      title: 'File Explorer',
      description: 'Browse and manage your files',
      icon: Folder,
      color: 'text-yellow-500',
    },
  ];

  return (
    <div className="h-full overflow-auto p-8 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="h-12 w-12 text-primary animate-pulse" aria-hidden="true" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Welcome to Brains
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A modern, powerful workspace inspired by Wave Terminal. Combine multiple tools in one beautiful
            interface.
          </p>
        </div>

        {/* Quick start */}
        <Card>
          <CardHeader>
            <CardTitle>🚀 Quick Start</CardTitle>
            <CardDescription>Choose a widget to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="list" aria-label="Available widgets">
              {widgets.map((widget) => {
                const Icon = widget.icon;
                return (
                  <Card key={widget.type} className="hover:border-primary transition-colors cursor-pointer group" role="listitem">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors`} aria-hidden="true">
                          <Icon className={`h-6 w-6 ${widget.color}`} />
                        </div>
                        <div className="flex-1 space-y-2">
                          <h3 className="font-semibold">{widget.title}</h3>
                          <p className="text-sm text-muted-foreground">{widget.description}</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => addWidget(widget.type)}
                            aria-label={`Open ${widget.title}`}
                          >
                            Open
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">⚡ Lightning Fast</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Built with modern web technologies for incredible performance.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">🎨 Beautiful Design</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Stunning UI with dark/light themes and smooth animations.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">🔧 Customizable</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Arrange widgets however you like. Your layout is saved automatically.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Shortcuts */}
        <Card>
          <CardHeader>
            <CardTitle>⌨️ Keyboard Shortcuts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Toggle theme</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl + T</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">New terminal</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl + `</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Close widget</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl + W</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Settings</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl + ,</kbd>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
