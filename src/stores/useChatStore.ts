import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Conversation, ChatMessage } from '@/types';

/**
 * Chat Data Store - Manages persistent conversation data only
 *
 * UI state (activeConversationId) has been moved to useUIStore
 * This separation allows:
 * - Easier data export/import
 * - Testing CRUD without UI state
 * - Clearing UI selections without losing conversations
 */
interface ChatStore {
  conversations: Conversation[];

  // Conversation management
  createConversation: (model: string, systemPrompt?: string) => string;
  deleteConversation: (id: string) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  getConversation: (id: string) => Conversation | undefined;

  // Message management
  addMessage: (conversationId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateMessage: (conversationId: string, messageId: string, content: string) => void;
  clearMessages: (conversationId: string) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      conversations: [],

      createConversation: (model, systemPrompt) => {
        const id = `conversation-${Date.now()}`;
        const conversation: Conversation = {
          id,
          title: 'New Chat',
          messages: [],
          model,
          systemPrompt,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set((state) => ({
          conversations: [...state.conversations, conversation],
        }));

        return id;
      },

      deleteConversation: (id) => {
        set((state) => ({
          conversations: state.conversations.filter((c) => c.id !== id),
        }));
      },

      updateConversation: (id, updates) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: Date.now() } : c
          ),
        }));
      },

      getConversation: (id) => {
        return get().conversations.find((c) => c.id === id);
      },

      addMessage: (conversationId, message) => {
        const messageId = `message-${Date.now()}-${Math.random()}`;
        const fullMessage: ChatMessage = {
          ...message,
          id: messageId,
          timestamp: Date.now(),
        };

        set((state) => ({
          conversations: state.conversations.map((c) => {
            if (c.id !== conversationId) return c;

            const messages = [...c.messages, fullMessage];

            // Auto-generate title from first user message
            let title = c.title;
            if (title === 'New Chat' && message.role === 'user' && messages.length <= 2) {
              title = message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '');
            }

            return {
              ...c,
              messages,
              title,
              updatedAt: Date.now(),
            };
          }),
        }));
      },

      updateMessage: (conversationId, messageId, content) => {
        set((state) => ({
          conversations: state.conversations.map((c) => {
            if (c.id !== conversationId) return c;

            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === messageId ? { ...m, content } : m
              ),
              updatedAt: Date.now(),
            };
          }),
        }));
      },

      clearMessages: (conversationId) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? { ...c, messages: [], updatedAt: Date.now() }
              : c
          ),
        }));
      },
    }),
    {
      name: 'brains-chat-storage',
    }
  )
);
