import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Note } from '@/types';

/**
 * Notes Data Store - Manages persistent note data only
 *
 * UI state (activeNoteId) has been moved to useUIStore
 * This separation allows:
 * - Easier data export/import
 * - Testing CRUD without UI state
 * - Clearing UI selections without losing data
 */
interface NotesStore {
  notes: Note[];
  createNote: (title?: string) => string;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  getNote: (id: string) => Note | undefined;
  getAllNotes: () => Note[];
}

export const useNotesStore = create<NotesStore>()(
  persist(
    (set, get) => ({
      notes: [],

      createNote: (title = 'Untitled Note') => {
        const id = `note-${Date.now()}`;
        const now = Date.now();
        const newNote: Note = {
          id,
          title,
          content: JSON.stringify({
            type: 'doc',
            content: [
              {
                type: 'paragraph',
              },
            ],
          }),
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          notes: [newNote, ...state.notes],
        }));

        return id;
      },

      updateNote: (id, updates) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? {
                  ...note,
                  ...updates,
                  updatedAt: Date.now(),
                }
              : note
          ),
        }));
      },

      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((n) => n.id !== id),
        }));
      },

      getNote: (id) => {
        return get().notes.find((n) => n.id === id);
      },

      getAllNotes: () => {
        return get().notes;
      },
    }),
    {
      name: 'brains-notes-storage',
    }
  )
);
