import { createContext, useCallback, useContext, useMemo } from 'react';
import { usePersistentState } from '../hooks/usePersistentState';
import { STORAGE_KEYS } from '../utils/storage';
import { createSeedConversations } from '../data/seeds';
import { uid } from '../utils/format';

// Local-only messaging. Messages are kept in localStorage and are never
// delivered to anyone. A real implementation would sit on a realtime service.

const MessagesContext = createContext(null);

export function MessagesProvider({ children }) {
  const [conversations, setConversations] = usePersistentState(STORAGE_KEYS.conversations, createSeedConversations);

  const sortedConversations = useMemo(
    () => [...conversations].sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? '')),
    [conversations],
  );

  const sendMessage = useCallback(
    (conversationId, text) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const now = new Date().toISOString();
      setConversations((list) =>
        list.map((c) =>
          c.id === conversationId
            ? { ...c, messages: [...c.messages, { id: uid('m'), sender: 'me', text: trimmed, sentAt: now }], updatedAt: now }
            : c,
        ),
      );
    },
    [setConversations],
  );

  // Returns the id of an existing or newly created conversation.
  const startConversation = useCallback(
    (artisan) => {
      const existing = conversations.find((c) => c.artisanId === artisan.id);
      if (existing) return existing.id;
      const id = uid('cv');
      setConversations((list) => [
        {
          id,
          artisanId: artisan.id,
          participantName: artisan.name,
          participantCategory: artisan.category,
          isSample: false,
          unread: 0,
          messages: [],
          updatedAt: new Date().toISOString(),
        },
        ...list,
      ]);
      return id;
    },
    [conversations, setConversations],
  );

  const markRead = useCallback(
    (conversationId) =>
      setConversations((list) => list.map((c) => (c.id === conversationId && c.unread ? { ...c, unread: 0 } : c))),
    [setConversations],
  );

  const deleteConversation = useCallback(
    (conversationId) => setConversations((list) => list.filter((c) => c.id !== conversationId)),
    [setConversations],
  );

  const unreadCount = useMemo(() => conversations.reduce((n, c) => n + (c.unread || 0), 0), [conversations]);

  const value = useMemo(
    () => ({ conversations: sortedConversations, unreadCount, sendMessage, startConversation, markRead, deleteConversation }),
    [sortedConversations, unreadCount, sendMessage, startConversation, markRead, deleteConversation],
  );

  return <MessagesContext.Provider value={value}>{children}</MessagesContext.Provider>;
}

export const useMessages = () => useContext(MessagesContext);
