import React from 'react';
import Script from 'next/script';
import { Moon, Sun, Settings, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useThemeStore } from '@/stores/useThemeStore';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useWidgetStore } from '@/stores/useWidgetStore';
import type { WidgetType } from '@/types';

export function Topbar() {
  const { theme, toggleTheme } = useThemeStore();
  const addWidget = useWidgetStore((state) => state.addWidget);

  const handleClose = () => {
    if (typeof window !== 'undefined' && (window as any).api?.windows?.close) {
      (window as any).api.windows.close();
    }
  };

  const widgetTypes: { type: WidgetType; label: string; icon: string }[] = [
    { type: 'terminal', label: 'Terminal', icon: '>' },
    { type: 'system-monitor', label: 'System Monitor', icon: '📊' },
    { type: 'file-explorer', label: 'File Explorer', icon: '📁' },
    { type: 'browser', label: 'Browser', icon: '🌐' },
    { type: 'pomodoro', label: 'Pomodoro Timer', icon: '⏱️' },
    { type: 'notepad', label: 'Notes', icon: '📝' },
    { type: 'calendar', label: 'Calendar', icon: '📅' },
    { type: 'ai-chat', label: 'AI Chat', icon: '🤖' },
    { type: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <header className="h-12 border-b border-border bg-card px-4 flex items-center justify-between" role="banner">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          Brains
        </h1>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button variant="ghost" size="sm" className="gap-2" aria-label="Add new widget">
              <Plus className="h-4 w-4" aria-hidden="true" />
              New Widget
            </Button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="min-w-[200px] bg-popover text-popover-foreground border border-border rounded-md shadow-lg p-1"
              sideOffset={5}
              aria-label="Widget types"
            >
              {widgetTypes.map((widget) => (
                <DropdownMenu.Item
                  key={widget.type}
                  className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground rounded outline-none"
                  onSelect={() => addWidget(widget.type)}
                >
                  <span aria-hidden="true">{widget.icon}</span>
                  <span>{widget.label}</span>
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      <div className="flex items-center gap-2" role="toolbar" aria-label="Application controls">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => addWidget('settings')}
          aria-label="Open settings"
        >
          <Settings className="h-5 w-5" aria-hidden="true" />
        </Button>
        <a
          href="https://www.buymeacoffee.com/YbEwc5qvHT"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#5F7FFF] hover:bg-[#4F6FEF] rounded-md transition-colors"
          style={{ fontFamily: 'Cookie, cursive' }}
        >
          <span>☕</span>
          <span>Buy me a coffee</span>
        </a>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          aria-label="Close application"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>
    </header>
  );
}
