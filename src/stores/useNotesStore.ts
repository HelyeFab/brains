import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Note } from '@/types';

interface NotesStore {
  notes: Note[];
  activeNoteId: string | null;
  createNote: (title?: string) => string;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  getNote: (id: string) => Note | undefined;
  getAllNotes: () => Note[];
  setActiveNote: (id: string | null) => void;
}

export const useNotesStore = create<NotesStore>()(
  persist(
    (set, get) => ({
      notes: [],
      activeNoteId: null,

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
          activeNoteId: id,
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
        set((state) => {
          const newNotes = state.notes.filter((n) => n.id !== id);
          const newActiveId =
            state.activeNoteId === id
              ? newNotes.length > 0
                ? newNotes[0].id
                : null
              : state.activeNoteId;

          return {
            notes: newNotes,
            activeNoteId: newActiveId,
          };
        });
      },

      getNote: (id) => {
        return get().notes.find((n) => n.id === id);
      },

      getAllNotes: () => {
        return get().notes;
      },

      setActiveNote: (id) => {
        set({ activeNoteId: id });
      },
    }),
    {
      name: 'brains-notes-storage',
    }
  )
);
