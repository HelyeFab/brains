import React from 'react';
import { useWidgetStore } from '@/stores/useWidgetStore';
import { Terminal, Activity, Folder, Globe, X, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { WidgetType } from '@/types';

const widgetIcons: Record<WidgetType, React.ElementType> = {
  terminal: Terminal,
  'system-monitor': Activity,
  'file-explorer': Folder,
  browser: Globe,
  welcome: Home,
};

export function Sidebar() {
  const { widgets, activeWidgetId, setActiveWidget, removeWidget } = useWidgetStore();

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

            return (
              <div
                key={widget.id}
                className={cn(
                  'group relative flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                )}
                onClick={() => setActiveWidget(widget.id)}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1 text-sm truncate">{widget.title}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity',
                    isActive && 'hover:bg-primary-foreground/20'
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeWidget(widget.id);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
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
