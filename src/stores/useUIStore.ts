import { create } from 'zustand';

/**
 * UI Store - Manages ephemeral UI state (active selections, etc.)
 *
 * This store is intentionally NOT persisted to localStorage.
 * UI selections should reset on app reload for a clean state.
 *
 * Separated from data stores to:
 * - Allow clearing UI without losing user data
 * - Make data export/import easier
 * - Improve testability
 */
interface UIStore {
  // Active widget selection
  activeWidgetId: string | null;
  setActiveWidgetId: (id: string | null) => void;

  // Active note selection
  activeNoteId: string | null;
  setActiveNoteId: (id: string | null) => void;

  // Active conversation selection
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;

  // Reset all UI state
  resetUI: () => void;
}

const initialState = {
  activeWidgetId: null,
  activeNoteId: null,
  activeConversationId: null,
};

export const useUIStore = create<UIStore>((set) => ({
  ...initialState,

  setActiveWidgetId: (id) => set({ activeWidgetId: id }),
  setActiveNoteId: (id) => set({ activeNoteId: id }),
  setActiveConversationId: (id) => set({ activeConversationId: id }),

  resetUI: () => set(initialState),
}));
