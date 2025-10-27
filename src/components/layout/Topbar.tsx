import React, { useState, useEffect, useCallback } from 'react';
import Script from 'next/script';
import { Moon, Sun, Settings, Plus, X, Maximize, Minimize, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useThemeStore } from '@/stores/useThemeStore';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useWidgetStore } from '@/stores/useWidgetStore';
import type { WidgetType } from '@/types';
import { ConfirmDialog } from '@/components/custom';
import { themes } from '@/config/themes';

export function Topbar() {
  const { themeId, setTheme } = useThemeStore();
  const addWidget = useWidgetStore((state) => state.addWidget);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const handleToggleFullscreen = useCallback(() => {
    if (typeof window !== 'undefined' && (window as any).api?.window?.toggleFullscreen) {
      (window as any).api.window.toggleFullscreen().then((fullscreen: boolean) => {
        setIsFullscreen(fullscreen);
      });
    }
  }, []);

  // Check fullscreen status on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).api?.window?.isFullscreen) {
      (window as any).api.window.isFullscreen().then((fullscreen: boolean) => {
        setIsFullscreen(fullscreen);
      });
    }
  }, []);

  // Handle F11 keyboard shortcut for fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F11') {
        e.preventDefault();
        handleToggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToggleFullscreen]);

  const handleCloseApp = () => {
    if (typeof window !== 'undefined' && (window as any).api?.windows?.close) {
      (window as any).api.windows.close();
    }
  };

  // Check if running in Electron
  const isElectron = typeof window !== 'undefined' && (window as any).api?.terminal;

  const widgetTypes: { type: WidgetType; label: string; icon: string }[] = [
    // Only show terminal in Electron
    ...(isElectron ? [{ type: 'terminal' as WidgetType, label: 'Terminal', icon: '>' }] : []),
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
    <header className="h-12 border-b border-border bg-card px-4 flex items-center justify-between drag-region" role="banner">
      <div className="flex items-center gap-4">
        <div className="no-drag">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 text-xl font-bold select-none cursor-pointer hover:opacity-80 transition-opacity pointer-events-auto"
                aria-label="Application menu"
              >
                <img
                  src="/brain.svg"
                  alt="Brains Logo"
                  className="h-8 w-8 pointer-events-none"
                />
                <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent pointer-events-none">
                  Brains
                </span>
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="min-w-[180px] bg-popover text-popover-foreground border border-border rounded-md shadow-lg p-1 z-50"
                sideOffset={5}
                aria-label="Application menu"
              >
                <DropdownMenu.Sub>
                  <DropdownMenu.SubTrigger className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground rounded outline-none">
                    <Moon className="h-4 w-4" aria-hidden="true" />
                    <span>Theme</span>
                  </DropdownMenu.SubTrigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.SubContent className="min-w-[180px] bg-popover text-popover-foreground border border-border rounded-md shadow-lg p-1 z-50">
                      {themes.map((theme) => (
                        <DropdownMenu.Item
                          key={theme.id}
                          className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground rounded outline-none"
                          onSelect={() => setTheme(theme.id)}
                        >
                          <span className="text-lg w-5 flex items-center justify-center" aria-hidden="true">
                            {theme.icon}
                          </span>
                          <span className="flex-1">{theme.name}</span>
                          {themeId === theme.id && (
                            <Check className="h-4 w-4 text-primary" aria-hidden="true" />
                          )}
                        </DropdownMenu.Item>
                      ))}
                    </DropdownMenu.SubContent>
                  </DropdownMenu.Portal>
                </DropdownMenu.Sub>

                <DropdownMenu.Item
                  className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground rounded outline-none"
                  onSelect={() => addWidget('settings')}
                >
                  <Settings className="h-4 w-4" aria-hidden="true" />
                  <span>Settings</span>
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground rounded outline-none"
                  onSelect={handleToggleFullscreen}
                >
                  {isFullscreen ? (
                    <>
                      <Minimize className="h-4 w-4" aria-hidden="true" />
                      <span>Exit Fullscreen</span>
                    </>
                  ) : (
                    <>
                      <Maximize className="h-4 w-4" aria-hidden="true" />
                      <span>Fullscreen</span>
                    </>
                  )}
                </DropdownMenu.Item>

                <DropdownMenu.Separator className="h-px bg-border my-1" />

                <DropdownMenu.Item
                  className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground rounded outline-none text-destructive"
                  onSelect={() => setShowCloseConfirm(true)}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  <span>Close App</span>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>

        <div className="no-drag">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button variant="ghost" size="sm" className="gap-2" aria-label="Add new widget">
                <Plus className="h-4 w-4" aria-hidden="true" />
                New Widget
              </Button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="min-w-[200px] bg-popover text-popover-foreground border border-border rounded-md shadow-lg p-1 z-50"
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
      </div>

      <div className="flex items-center gap-2 no-drag" role="toolbar" aria-label="Application controls">
        <a
          href="https://www.buymeacoffee.com/YbEwc5qvHT"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#5F7FFF] hover:bg-[#4F6FEF] rounded-md transition-colors"
        >
          <span>☕</span>
          <span>Buy me a coffee</span>
        </a>
      </div>

      <ConfirmDialog
        open={showCloseConfirm}
        onOpenChange={setShowCloseConfirm}
        title="Close Brains"
        description="Are you sure you want to close Brains? Any unsaved changes will be lost."
        confirmText="Close App"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleCloseApp}
      />
    </header>
  );
}
