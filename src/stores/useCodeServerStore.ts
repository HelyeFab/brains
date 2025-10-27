import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Code Server Settings Store
 *
 * Persists code-server connection settings across app restarts
 */
interface CodeServerStore {
  serverUrl: string;
  setServerUrl: (url: string) => void;
}

export const useCodeServerStore = create<CodeServerStore>()(
  persist(
    (set) => ({
      serverUrl: 'http://localhost:8080',

      setServerUrl: (url) => {
        // Ensure URL has protocol
        const normalizedUrl = url.startsWith('http') ? url : `http://${url}`;
        set({ serverUrl: normalizedUrl });
      },
    }),
    {
      name: 'brains-code-server-storage',
    }
  )
);
