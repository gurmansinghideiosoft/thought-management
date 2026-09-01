'use client';

import { useEffect, useState } from 'react';

import { api } from '../api/api';
import { useAppDispatch } from '../hooks';
import type { Message, PublicUser } from '../types';
import { getSocket } from './socket';

interface TypingEvent {
  conversationId: string;
  user: PublicUser;
  isTyping: boolean;
}

/**
 * Live updates for one open conversation: joins its room, folds `message:new`
 * / `message:removed` straight into the RTK cache, and tracks who's typing.
 */
export function useConversationRealtime(conversationId: string) {
  const dispatch = useAppDispatch();
  const [typingUsers, setTypingUsers] = useState<PublicUser[]>([]);

  useEffect(() => {
    const socket = getSocket();
    // Per-user "stopped typing" fallback timers, scoped to this open conversation.
    const timers = new Map<string, ReturnType<typeof setTimeout>>();
    socket.emit('conversation:join', { id: conversationId });

    const onNew = ({ message }: { message: Message }) => {
      if (message.conversationId !== conversationId) return;
      dispatch(
        api.util.updateQueryData('conversationMessages', conversationId, (draft) => {
          const first = draft.pages[0];
          if (!first) return;
          if (first.items.some((m) => m.id === message.id)) return;
          first.items.push(message);
        }),
      );
    };

    const onRemoved = ({
      conversationId: cid,
      messageId,
    }: {
      conversationId: string;
      messageId: string;
    }) => {
      if (cid !== conversationId) return;
      dispatch(
        api.util.updateQueryData('conversationMessages', conversationId, (draft) => {
          for (const page of draft.pages) {
            page.items = page.items.filter((m) => m.id !== messageId);
          }
        }),
      );
    };

    const onTyping = (evt: TypingEvent) => {
      if (evt.conversationId !== conversationId) return;
      const existing = timers.get(evt.user.id);
      if (existing) clearTimeout(existing);

      if (evt.isTyping) {
        setTypingUsers((prev) =>
          prev.some((u) => u.id === evt.user.id) ? prev : [...prev, evt.user],
        );
        timers.set(
          evt.user.id,
          setTimeout(() => {
            setTypingUsers((prev) => prev.filter((u) => u.id !== evt.user.id));
            timers.delete(evt.user.id);
          }, 4000),
        );
      } else {
        setTypingUsers((prev) => prev.filter((u) => u.id !== evt.user.id));
        timers.delete(evt.user.id);
      }
    };

    socket.on('message:new', onNew);
    socket.on('message:removed', onRemoved);
    socket.on('typing', onTyping);

    return () => {
      socket.emit('conversation:leave', { id: conversationId });
      socket.off('message:new', onNew);
      socket.off('message:removed', onRemoved);
      socket.off('typing', onTyping);
      for (const t of timers.values()) clearTimeout(t);
      timers.clear();
      setTypingUsers([]);
    };
  }, [conversationId, dispatch]);

  const sendTyping = (isTyping: boolean) => {
    getSocket().emit(isTyping ? 'typing:start' : 'typing:stop', { id: conversationId });
  };

  return { typingUsers, sendTyping };
}
