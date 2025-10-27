import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  createdAt: number;
}

interface BookmarksStore {
  bookmarks: Bookmark[];
  addBookmark: (title: string, url: string, favicon?: string) => string;
  removeBookmark: (id: string) => void;
  updateBookmark: (id: string, updates: Partial<Bookmark>) => void;
  getBookmark: (id: string) => Bookmark | undefined;
}

export const useBookmarksStore = create<BookmarksStore>()(
  persist(
    (set, get) => ({
      bookmarks: [],

      addBookmark: (title, url, favicon) => {
        const id = `bookmark-${Date.now()}`;
        const bookmark: Bookmark = {
          id,
          title,
          url,
          favicon,
          createdAt: Date.now(),
        };

        set((state) => ({
          bookmarks: [...state.bookmarks, bookmark],
        }));

        return id;
      },

      removeBookmark: (id) => {
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.id !== id),
        }));
      },

      updateBookmark: (id, updates) => {
        set((state) => ({
          bookmarks: state.bookmarks.map((b) =>
            b.id === id ? { ...b, ...updates } : b
          ),
        }));
      },

      getBookmark: (id) => {
        return get().bookmarks.find((b) => b.id === id);
      },
    }),
    {
      name: 'brains-bookmarks-storage',
    }
  )
);
