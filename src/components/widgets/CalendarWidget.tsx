import React, { useState, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, Views, SlotInfo } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addHours } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useCalendarStore } from '@/stores/useCalendarStore';
import { CalendarIcon, Plus, X, Edit2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CalendarEvent } from '@/types';
import * as Dialog from '@radix-ui/react-dialog';

interface CalendarWidgetProps {
  widgetId: string;
}

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const colorOptions = [
  { name: 'Blue', value: 'bg-blue-500' },
  { name: 'Green', value: 'bg-green-500' },
  { name: 'Red', value: 'bg-red-500' },
  { name: 'Yellow', value: 'bg-yellow-500' },
  { name: 'Purple', value: 'bg-purple-500' },
  { name: 'Orange', value: 'bg-orange-500' },
  { name: 'Pink', value: 'bg-pink-500' },
];

export function CalendarWidget({ widgetId }: CalendarWidgetProps) {
  const { events, createEvent, updateEvent, deleteEvent } = useCalendarStore();
  const [view, setView] = useState<typeof Views[keyof typeof Views]>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    start: new Date(),
    end: addHours(new Date(), 1),
    allDay: false,
    color: 'bg-blue-500',
    description: '',
  });

  const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
    setSelectedEvent(null);
    setFormData({
      title: '',
      start: slotInfo.start,
      end: slotInfo.end,
      allDay: slotInfo.action === 'doubleClick',
      color: 'bg-blue-500',
      description: '',
    });
    setIsDialogOpen(true);
  }, []);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      start: event.start,
      end: event.end,
      allDay: event.allDay || false,
      color: event.color || 'bg-blue-500',
      description: event.description || '',
    });
    setIsDialogOpen(true);
  }, []);

  const handleSaveEvent = () => {
    if (!formData.title.trim()) return;

    if (selectedEvent) {
      updateEvent(selectedEvent.id, formData);
    } else {
      createEvent(formData);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      deleteEvent(selectedEvent.id);
      setIsDialogOpen(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      start: new Date(),
      end: addHours(new Date(), 1),
      allDay: false,
      color: 'bg-blue-500',
      description: '',
    });
    setSelectedEvent(null);
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    const colorClass = event.color || 'bg-blue-500';

    // Map Tailwind color classes to actual hex colors
    const colorMap: Record<string, string> = {
      'bg-blue-500': '#3b82f6',
      'bg-green-500': '#22c55e',
      'bg-red-500': '#ef4444',
      'bg-yellow-500': '#eab308',
      'bg-purple-500': '#a855f7',
      'bg-orange-500': '#f97316',
      'bg-pink-500': '#ec4899',
    };

    const backgroundColor = colorMap[colorClass] || '#3b82f6';

    return {
      style: {
        backgroundColor,
        border: 'none',
        borderRadius: '4px',
        color: 'white',
        padding: '2px 5px',
        fontWeight: '500',
      },
    };
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-primary" aria-hidden="true" />
            <h2 className="text-2xl font-bold">Calendar</h2>
          </div>
          <Button
            onClick={() => {
              setSelectedEvent(null);
              resetForm();
              setIsDialogOpen(true);
            }}
            className="gap-2"
            aria-label="Create new event"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Event
          </Button>
        </div>
      </div>

      {/* Calendar */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="h-full calendar-container">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            titleAccessor="title"
            view={view}
            onView={setView}
            date={date}
            onNavigate={setDate}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            selectable
            eventPropGetter={eventStyleGetter}
            style={{ height: '100%' }}
            className="rounded-lg border border-border bg-card"
          />
        </div>
      </div>

      {/* Event Dialog */}
      <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-lg shadow-lg p-6 w-full max-w-md z-50"
            aria-labelledby="dialog-title"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Dialog.Title id="dialog-title" className="text-xl font-bold">
                  {selectedEvent ? 'Edit Event' : 'New Event'}
                </Dialog.Title>
                <Dialog.Close asChild>
                  <Button variant="ghost" size="icon" aria-label="Close dialog">
                    <X className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </Dialog.Close>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label htmlFor="event-title" className="text-sm font-medium">
                  Title
                </label>
                <input
                  id="event-title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Event title"
                  autoFocus
                />
              </div>

              {/* Start Date/Time */}
              <div className="space-y-2">
                <label htmlFor="event-start" className="text-sm font-medium">
                  Start
                </label>
                <input
                  id="event-start"
                  type={formData.allDay ? 'date' : 'datetime-local'}
                  value={
                    formData.allDay
                      ? format(formData.start, 'yyyy-MM-dd')
                      : format(formData.start, "yyyy-MM-dd'T'HH:mm")
                  }
                  onChange={(e) =>
                    setFormData({ ...formData, start: new Date(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* End Date/Time */}
              <div className="space-y-2">
                <label htmlFor="event-end" className="text-sm font-medium">
                  End
                </label>
                <input
                  id="event-end"
                  type={formData.allDay ? 'date' : 'datetime-local'}
                  value={
                    formData.allDay
                      ? format(formData.end, 'yyyy-MM-dd')
                      : format(formData.end, "yyyy-MM-dd'T'HH:mm")
                  }
                  onChange={(e) =>
                    setFormData({ ...formData, end: new Date(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* All Day */}
              <div className="flex items-center gap-2">
                <input
                  id="event-allday"
                  type="checkbox"
                  checked={formData.allDay}
                  onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
                  className="rounded border-border"
                />
                <label htmlFor="event-allday" className="text-sm">
                  All day event
                </label>
              </div>

              {/* Color */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Color</label>
                <div className="flex gap-2" role="group" aria-label="Event color">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      className={cn(
                        'h-8 w-8 rounded-full transition-transform hover:scale-110',
                        color.value,
                        formData.color === color.value && 'ring-2 ring-offset-2 ring-primary'
                      )}
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      aria-label={color.name}
                      aria-pressed={formData.color === color.value}
                    />
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label htmlFor="event-description" className="text-sm font-medium">
                  Description
                </label>
                <textarea
                  id="event-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={3}
                  placeholder="Event description (optional)"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-4">
                {selectedEvent && (
                  <Button
                    variant="destructive"
                    onClick={handleDeleteEvent}
                    className="gap-2"
                    aria-label="Delete event"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Delete
                  </Button>
                )}
                <div className="flex gap-2 ml-auto">
                  <Dialog.Close asChild>
                    <Button variant="outline">Cancel</Button>
                  </Dialog.Close>
                  <Button onClick={handleSaveEvent} disabled={!formData.title.trim()}>
                    {selectedEvent ? 'Update' : 'Create'}
                  </Button>
                </div>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <style jsx global>{`
        .calendar-container .rbc-calendar {
          font-family: inherit;
        }

        .calendar-container .rbc-header {
          padding: 8px 4px;
          font-weight: 600;
          border-bottom: 1px solid hsl(var(--border));
          background: hsl(var(--card));
        }

        .calendar-container .rbc-today {
          background-color: hsl(var(--accent));
        }

        .calendar-container .rbc-off-range-bg {
          background: hsl(var(--muted) / 0.3);
        }

        .calendar-container .rbc-event {
          padding: 2px 5px;
          border-radius: 4px;
        }

        .calendar-container .rbc-event.rbc-selected {
          background-color: hsl(var(--primary)) !important;
        }

        .calendar-container .rbc-slot-selection {
          background-color: hsl(var(--primary) / 0.3);
        }

        .calendar-container .rbc-toolbar button {
          color: hsl(var(--foreground));
          border: 1px solid hsl(var(--border));
          background: hsl(var(--background));
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 14px;
        }

        .calendar-container .rbc-toolbar button:hover {
          background: hsl(var(--accent));
        }

        .calendar-container .rbc-toolbar button.rbc-active {
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          border-color: hsl(var(--primary));
        }

        .calendar-container .rbc-month-view,
        .calendar-container .rbc-time-view,
        .calendar-container .rbc-agenda-view {
          border: 1px solid hsl(var(--border));
          background: hsl(var(--background));
        }

        .calendar-container .rbc-day-bg,
        .calendar-container .rbc-time-slot {
          border-color: hsl(var(--border));
        }

        .calendar-container .rbc-current-time-indicator {
          background-color: hsl(var(--destructive));
        }
      `}</style>
    </div>
  );
}
