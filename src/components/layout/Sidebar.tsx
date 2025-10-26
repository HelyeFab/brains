import React, { useState } from 'react';
import { useWidgetStore } from '@/stores/useWidgetStore';
import { Terminal, Activity, Folder, Globe, X, Home, Edit2, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { WidgetType } from '@/types';
import * as Popover from '@radix-ui/react-popover';

const widgetIcons: Record<WidgetType, React.ElementType> = {
  terminal: Terminal,
  'system-monitor': Activity,
  'file-explorer': Folder,
  browser: Globe,
  welcome: Home,
};

const colorOptions = [
  { name: 'Blue', value: 'bg-blue-500' },
  { name: 'Green', value: 'bg-green-500' },
  { name: 'Red', value: 'bg-red-500' },
  { name: 'Yellow', value: 'bg-yellow-500' },
  { name: 'Purple', value: 'bg-purple-500' },
  { name: 'Orange', value: 'bg-orange-500' },
  { name: 'Pink', value: 'bg-pink-500' },
  { name: 'Cyan', value: 'bg-cyan-500' },
  { name: 'Indigo', value: 'bg-indigo-500' },
  { name: 'Teal', value: 'bg-teal-500' },
];

export function Sidebar() {
  const { widgets, activeWidgetId, setActiveWidget, removeWidget, updateWidget } = useWidgetStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleStartEdit = (widgetId: string, currentTitle: string) => {
    setEditingId(widgetId);
    setEditTitle(currentTitle);
  };

  const handleSaveEdit = (widgetId: string) => {
    if (editTitle.trim()) {
      updateWidget(widgetId, { title: editTitle.trim() });
    }
    setEditingId(null);
  };

  const handleColorChange = (widgetId: string, color: string) => {
    updateWidget(widgetId, { color });
  };

  return (
    <div className="h-full bg-card flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Widgets
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {widgets.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No widgets yet.
            <br />
            Click "New Widget" to add one.
          </div>
        ) : (
          widgets.map((widget) => {
            const Icon = widgetIcons[widget.type] || Home;
            const isActive = widget.id === activeWidgetId;
            const isEditing = editingId === widget.id;

            return (
              <div
                key={widget.id}
                className={cn(
                  'group relative flex items-center gap-2 px-3 py-2 rounded-md transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground cursor-pointer'
                )}
              >
                {/* Color indicator */}
                {widget.color && (
                  <div className={cn('w-1 h-full absolute left-0 top-0 rounded-l-md', widget.color)} />
                )}

                <div
                  className="flex items-center gap-2 flex-1 min-w-0"
                  onClick={() => !isEditing && setActiveWidget(widget.id)}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />

                  {isEditing ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(widget.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 text-sm bg-background text-foreground px-2 py-1 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                      autoFocus
                    />
                  ) : (
                    <span className="flex-1 text-sm truncate">{widget.title}</span>
                  )}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isEditing ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        'h-6 w-6',
                        isActive && 'hover:bg-primary-foreground/20'
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveEdit(widget.id);
                      }}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  ) : (
                    <>
                      <Popover.Root>
                        <Popover.Trigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              'h-6 w-6',
                              isActive && 'hover:bg-primary-foreground/20'
                            )}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className={cn('h-3 w-3 rounded-full border-2', widget.color || 'border-current')} />
                          </Button>
                        </Popover.Trigger>
                        <Popover.Portal>
                          <Popover.Content
                            className="bg-popover text-popover-foreground border border-border rounded-md shadow-lg p-3 z-50"
                            sideOffset={5}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="space-y-2">
                              <p className="text-xs font-semibold">Tab Color</p>
                              <div className="grid grid-cols-5 gap-2">
                                {colorOptions.map((color) => (
                                  <button
                                    key={color.value}
                                    className={cn(
                                      'h-6 w-6 rounded-full transition-transform hover:scale-110',
                                      color.value,
                                      widget.color === color.value && 'ring-2 ring-offset-2 ring-primary'
                                    )}
                                    onClick={() => handleColorChange(widget.id, color.value)}
                                    title={color.name}
                                  />
                                ))}
                              </div>
                              <button
                                className="w-full text-xs text-muted-foreground hover:text-foreground mt-2"
                                onClick={() => handleColorChange(widget.id, '')}
                              >
                                Clear color
                              </button>
                            </div>
                          </Popover.Content>
                        </Popover.Portal>
                      </Popover.Root>

                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          'h-6 w-6',
                          isActive && 'hover:bg-primary-foreground/20'
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(widget.id, widget.title);
                        }}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          'h-6 w-6',
                          isActive && 'hover:bg-primary-foreground/20'
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeWidget(widget.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-4 border-t border-border text-xs text-muted-foreground">
        {widgets.length} widget{widgets.length !== 1 ? 's' : ''} active
      </div>
    </div>
  );
}
