import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CalendarEvent } from '@/types';

interface CalendarStore {
  events: CalendarEvent[];
  createEvent: (event: Omit<CalendarEvent, 'id'>) => string;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  getEvent: (id: string) => CalendarEvent | undefined;
}

export const useCalendarStore = create<CalendarStore>()(
  persist(
    (set, get) => ({
      events: [],

      createEvent: (event) => {
        const id = `event-${Date.now()}`;
        const newEvent: CalendarEvent = {
          ...event,
          id,
        };

        set((state) => ({
          events: [...state.events, newEvent],
        }));

        return id;
      },

      updateEvent: (id, updates) => {
        set((state) => ({
          events: state.events.map((event) =>
            event.id === id ? { ...event, ...updates } : event
          ),
        }));
      },

      deleteEvent: (id) => {
        set((state) => ({
          events: state.events.filter((event) => event.id !== id),
        }));
      },

      getEvent: (id) => {
        return get().events.find((event) => event.id === id);
      },
    }),
    {
      name: 'brains-calendar-storage',
      // Custom serialization to handle Date objects
      partialize: (state) => ({
        events: state.events.map((event) => ({
          ...event,
          start: event.start.toISOString(),
          end: event.end.toISOString(),
        })),
      }),
      // Custom deserialization to convert back to Date objects
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.events = state.events.map((event: any) => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end),
          }));
        }
      },
    }
  )
);
