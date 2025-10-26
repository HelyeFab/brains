import React from 'react';
import { Moon, Sun, Settings, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useThemeStore } from '@/stores/useThemeStore';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useWidgetStore } from '@/stores/useWidgetStore';
import type { WidgetType } from '@/types';

export function Topbar() {
  const { theme, toggleTheme } = useThemeStore();
  const addWidget = useWidgetStore((state) => state.addWidget);

  const widgetTypes: { type: WidgetType; label: string; icon: string }[] = [
    { type: 'terminal', label: 'Terminal', icon: '>' },
    { type: 'system-monitor', label: 'System Monitor', icon: '📊' },
    { type: 'file-explorer', label: 'File Explorer', icon: '📁' },
    { type: 'browser', label: 'Browser', icon: '🌐' },
  ];

  return (
    <div className="h-12 border-b border-border bg-card px-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          Brains
        </h1>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New Widget
            </Button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="min-w-[200px] bg-popover text-popover-foreground border border-border rounded-md shadow-lg p-1"
              sideOffset={5}
            >
              {widgetTypes.map((widget) => (
                <DropdownMenu.Item
                  key={widget.type}
                  className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground rounded outline-none"
                  onSelect={() => addWidget(widget.type)}
                >
                  <span>{widget.icon}</span>
                  <span>{widget.label}</span>
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
