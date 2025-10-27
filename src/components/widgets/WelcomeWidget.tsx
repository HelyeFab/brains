import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useWidgetStore } from '@/stores/useWidgetStore';
import {
  Terminal,
  Activity,
  Folder,
  Globe,
  Calendar,
  Code,
  Monitor,
  Timer,
  FileText,
  Bot,
  Settings
} from 'lucide-react';
import type { WidgetType } from '@/types';

interface WelcomeWidgetProps {
  widgetId: string;
}

export function WelcomeWidget({ widgetId }: WelcomeWidgetProps) {
  const addWidget = useWidgetStore((state) => state.addWidget);

  // Check if running in Electron
  const isElectron = typeof window !== 'undefined' && (window as any).api?.terminal;

  const widgets: { type: WidgetType; title: string; description: string; icon: React.ElementType; color: string; category: string }[] = [
    // Development Tools
    ...(isElectron ? [{
      type: 'terminal' as WidgetType,
      title: 'Terminal',
      description: 'Full-featured xterm.js terminal with PTY backend',
      icon: Terminal,
      color: 'text-green-500',
      category: 'Development',
    }] : []),
    {
      type: 'code-server',
      title: 'Code Server',
      description: 'Connect to remote code-server (VS Code) instances',
      icon: Monitor,
      color: 'text-blue-500',
      category: 'Development',
    },
    {
      type: 'code-editor',
      title: 'Code Editor',
      description: 'Built-in Monaco Editor with 16 languages',
      icon: Code,
      color: 'text-purple-500',
      category: 'Development',
    },
    {
      type: 'file-explorer',
      title: 'File Explorer',
      description: 'Navigate your file system',
      icon: Folder,
      color: 'text-yellow-500',
      category: 'Development',
    },
    // AI & Productivity
    {
      type: 'ai-chat',
      title: 'AI Chat',
      description: 'Chat with Ollama AI models locally',
      icon: Bot,
      color: 'text-cyan-500',
      category: 'AI & Productivity',
    },
    {
      type: 'pomodoro',
      title: 'Pomodoro Timer',
      description: 'Focus timer with 25/5/15 minute cycles',
      icon: Timer,
      color: 'text-red-500',
      category: 'AI & Productivity',
    },
    {
      type: 'notepad',
      title: 'Notes',
      description: 'Rich text editor with Tiptap',
      icon: FileText,
      color: 'text-orange-500',
      category: 'AI & Productivity',
    },
    {
      type: 'calendar',
      title: 'Calendar',
      description: 'Event management with full calendar view',
      icon: Calendar,
      color: 'text-indigo-500',
      category: 'AI & Productivity',
    },
    // Web & System
    {
      type: 'browser',
      title: 'Browser',
      description: 'Embedded browser with smart bookmarks',
      icon: Globe,
      color: 'text-blue-600',
      category: 'Web & System',
    },
    {
      type: 'system-monitor',
      title: 'System Monitor',
      description: 'Real-time CPU, memory, and system metrics',
      icon: Activity,
      color: 'text-green-600',
      category: 'Web & System',
    },
    // Configuration
    {
      type: 'settings',
      title: 'Settings',
      description: 'Configure app preferences and themes',
      icon: Settings,
      color: 'text-gray-500',
      category: 'Configuration',
    },
  ];

  // Group widgets by category
  const categories = ['Development', 'AI & Productivity', 'Web & System', 'Configuration'];
  const widgetsByCategory = categories.map(cat => ({
    category: cat,
    widgets: widgets.filter(w => w.category === cat)
  })).filter(group => group.widgets.length > 0);

  return (
    <div className="h-full overflow-auto p-8 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <div className="flex items-center justify-center gap-3">
            <img
              src="/brain.svg"
              alt="Brains Logo"
              className="h-16 w-16 animate-pulse"
            />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
              Welcome to Brains
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A modern, powerful workspace with <strong>12 amazing widgets</strong>. Combine terminal, AI chat, code editors, browser, calendar, and more in one beautiful interface with 5 unique themes!
          </p>
        </div>

        {/* Quick start - All Widgets by Category */}
        {widgetsByCategory.map((group) => (
          <Card key={group.category}>
            <CardHeader>
              <CardTitle>
                {group.category === 'Development' && '💻 '}
                {group.category === 'AI & Productivity' && '🤖 '}
                {group.category === 'Web & System' && '🌐 '}
                {group.category === 'Configuration' && '⚙️ '}
                {group.category}
              </CardTitle>
              <CardDescription>
                {group.category === 'Development' && 'Code editing and terminal tools'}
                {group.category === 'AI & Productivity' && 'AI chat, timers, notes, and calendar'}
                {group.category === 'Web & System' && 'Browser and system monitoring'}
                {group.category === 'Configuration' && 'Settings and preferences'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="list" aria-label={`${group.category} widgets`}>
                {group.widgets.map((widget) => {
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
        ))}

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">🤖 Local AI Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Chat with Ollama models locally. No cloud, no API keys, complete privacy!
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">🎨 5 Unique Themes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Dark, Light, Creativity, Love, and Cozy Home with animated background patterns.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">💻 Dual Code Editing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Remote code-server AND built-in Monaco Editor with 16 languages.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">📚 Smart Bookmarks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Bookmark any page and convert it into a dedicated persistent widget!
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">🔐 Security Hardened</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Terminal rate limiting, file sandboxing, and IPC validation built-in.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">💾 Zero Config Saves</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Everything saves automatically. Your layout, widgets, and data persist across sessions.
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
