import { create } from 'zustand';
import { Chat, Message } from '../types';
import { fetchApi, streamApi } from '../lib/api';

interface ChatStore {
  chats: Chat[];
  activeChatId: string | null;
  activeChat: Chat | null;
  isStreaming: boolean;
  streamingMessage: string;
  fetchChats: () => Promise<void>;
  selectChat: (id: string) => Promise<void>;
  createNewChat: () => void;
  sendMessage: (content: string, mode?: string) => Promise<void>;
  togglePinChat: (id: string) => Promise<void>;
  deleteChat: (id: string) => Promise<void>;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  chats: [],
  activeChatId: null,
  activeChat: null,
  isStreaming: false,
  streamingMessage: '',

  fetchChats: async () => {
    try {
      const chats = await fetchApi<Chat[]>('/chats');
      set({ chats });
    } catch (e) {
      console.error('Failed to load chats:', e);
    }
  },

  selectChat: async (id: string) => {
    try {
      const chat = await fetchApi<Chat>(`/chats/${id}`);
      set({ activeChatId: id, activeChat: chat, streamingMessage: '' });
    } catch (e) {
      console.error('Failed to select chat:', e);
    }
  },

  createNewChat: () => {
    set({ activeChatId: null, activeChat: null, streamingMessage: '' });
  },

  sendMessage: async (content: string, mode = 'chat') => {
    const { activeChatId, activeChat, fetchChats } = get();

    // Create optimistic user message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      chatId: activeChatId || 'temp',
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };

    const currentMessages = activeChat?.messages || [];
    const updatedMessages = [...currentMessages, userMsg];

    set({
      activeChat: {
        id: activeChatId || 'temp',
        title: activeChat?.title || (content.length > 25 ? content.substring(0, 25) + '...' : content),
        pinned: activeChat?.pinned || false,
        createdAt: activeChat?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: updatedMessages,
      },
      isStreaming: true,
      streamingMessage: '',
    });

    try {
      await streamApi(
        '/chat/stream',
        { chatId: activeChatId, message: content, mode },
        (token) => {
          set((state) => ({ streamingMessage: state.streamingMessage + token }));
        },
        async (fullResponse) => {
          const assistantMsg: Message = {
            id: `assistant-${Date.now()}`,
            chatId: activeChatId || 'temp',
            role: 'assistant',
            content: fullResponse,
            createdAt: new Date().toISOString(),
          };

          set((state) => ({
            isStreaming: false,
            streamingMessage: '',
            activeChat: state.activeChat
              ? {
                  ...state.activeChat,
                  messages: [...(state.activeChat.messages || []), assistantMsg],
                }
              : null,
          }));

          await fetchChats();
        },
        (error) => {
          console.error('Send message stream error:', error);
          set({ isStreaming: false });
        }
      );
    } catch (e) {
      console.error('Send message exception:', e);
      set({ isStreaming: false });
    }
  },

  togglePinChat: async (id: string) => {
    const chat = get().chats.find((c) => c.id === id);
    if (!chat) return;
    try {
      await fetchApi(`/chats/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ pinned: !chat.pinned }),
      });
      await get().fetchChats();
    } catch (e) {
      console.error('Pin toggle failed:', e);
    }
  },

  deleteChat: async (id: string) => {
    try {
      await fetchApi(`/chats/${id}`, { method: 'DELETE' });
      if (get().activeChatId === id) {
        set({ activeChatId: null, activeChat: null });
      }
      await get().fetchChats();
    } catch (e) {
      console.error('Delete chat failed:', e);
    }
  },
}));
