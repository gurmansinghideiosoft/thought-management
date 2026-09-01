'use client';

import { format } from 'date-fns';
import { ImageIcon, SendHorizontal, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { BannerPicker } from '@/components/banners/banner-picker';
import { IconButton } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { CenteredSpinner, Spinner } from '@/components/ui/misc';
import { useToast } from '@/components/ui/toast';
import {
  useConversationMessagesInfiniteQuery,
  useDeleteMessageMutation,
  useMarkConversationReadMutation,
  useMeQuery,
  useSendMessageMutation,
  useSetConversationBackgroundMutation,
} from '@/lib/api/api';
import { errorMessage } from '@/lib/api/baseQuery';
import { bannerFor } from '@/lib/banners';
import { cn } from '@/lib/cn';
import { useConversationRealtime } from '@/lib/realtime/useConversationRealtime';
import type { Message } from '@/lib/types';

export function MessageThread({
  conversationId,
  background = null,
  thoughtId = null,
  className,
}: {
  conversationId: string;
  /** The current user's chat-wallpaper choice for this conversation. */
  background?: string | null;
  /** Set when this is a thought discussion — used to target cache invalidation. */
  thoughtId?: string | null;
  className?: string;
}) {
  const toast = useToast();
  const { data: me } = useMeQuery();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useConversationMessagesInfiniteQuery(conversationId);
  const [send, { isLoading: sending }] = useSendMessageMutation();
  const [deleteMessage] = useDeleteMessageMutation();
  const [markRead] = useMarkConversationReadMutation();
  const [setBackground] = useSetConversationBackgroundMutation();
  const { typingUsers, sendTyping } = useConversationRealtime(conversationId);

  const typingLabel =
    typingUsers.length > 0
      ? `${typingUsers
          .map((u) => (u.username ? `@${u.username}` : u.name || 'Someone'))
          .join(', ')} ${typingUsers.length === 1 ? 'is' : 'are'} typing…`
      : null;

  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const topSentinel = useRef<HTMLDivElement>(null);
  const prevHeight = useRef(0);
  const pinned = useRef(false);

  // Oldest-first: each API page is oldest-first, and "next page" is an older chunk.
  const messages: Message[] = data
    ? [...data.pages].reverse().flatMap((p) => p.items)
    : [];
  const count = messages.length;
  const lastId = messages.at(-1)?.id;

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (!pinned.current && count > 0) {
      el.scrollTop = el.scrollHeight;
      pinned.current = true;
      return;
    }
    if (prevHeight.current > 0) {
      el.scrollTop += el.scrollHeight - prevHeight.current;
      prevHeight.current = 0;
      return;
    }
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 160) {
      el.scrollTop = el.scrollHeight;
    }
  }, [count, lastId]);

  useEffect(() => {
    const sentinel = topSentinel.current;
    const scroller = scrollRef.current;
    if (!sentinel || !scroller || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (records) => {
        if (records[0]?.isIntersecting && !isFetchingNextPage) {
          prevHeight.current = scroller.scrollHeight;
          void fetchNextPage();
        }
      },
      { root: scroller, threshold: 0.1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (lastId) void markRead(conversationId);
  }, [conversationId, lastId, markRead]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setDraft('');
    sendTyping(false);
    try {
      await send({ conversationId, body }).unwrap();
    } catch (err) {
      setDraft(body);
      toast.error(errorMessage(err, 'Message not sent'));
    }
  };

  const chooseBackground = async (banner: string | null) => {
    try {
      await setBackground({ conversationId, banner, thoughtId }).unwrap();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not change the wallpaper'));
    }
  };

  return (
    <div className={cn('relative flex min-h-0 flex-1 flex-col', className)}>
      {background ? (
        <>
          <Image
            src={bannerFor(background).src}
            alt=""
            fill
            sizes="100vw"
            className="pointer-events-none object-cover"
          />
          <div className="bg-paper/88 pointer-events-none absolute inset-0" />
        </>
      ) : null}

      <BannerPicker
        value={background}
        onSelect={chooseBackground}
        title="Chat wallpaper"
        trigger={
          <button
            type="button"
            aria-label="Change wallpaper"
            className="text-ink-faint hover:bg-surface-2 hover:text-ink absolute top-1.5 right-1.5 z-20 rounded-lg p-1.5 transition-colors"
          >
            <ImageIcon size={14} />
          </button>
        }
      />

      <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto px-3 py-3">
        <div ref={topSentinel} />
        {isLoading ? (
          <CenteredSpinner />
        ) : count === 0 ? (
          <p className="text-ink-faint py-10 text-center text-sm">
            No messages yet — say hello.
          </p>
        ) : (
          <div className="flex flex-col">
            {isFetchingNextPage ? (
              <div className="flex justify-center py-1">
                <Spinner />
              </div>
            ) : null}
            {messages.map((m, i) => {
              const mine = m.author.id === me?.user.id;
              const prev = messages[i - 1];
              const grouped = prev?.author.id === m.author.id;
              return (
                <MessageBubble
                  key={m.id}
                  message={m}
                  mine={mine}
                  grouped={grouped}
                  onDelete={
                    mine
                      ? () => deleteMessage({ conversationId, messageId: m.id })
                      : undefined
                  }
                />
              );
            })}
          </div>
        )}
      </div>

      {typingLabel ? (
        <div className="text-ink-muted relative z-10 px-4 pb-1 text-[12px] italic">
          {typingLabel}
        </div>
      ) : null}

      <form
        onSubmit={submit}
        className="border-hairline bg-paper/70 relative z-10 flex items-end gap-2 border-t px-3 py-2.5 backdrop-blur"
      >
        <Textarea
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            sendTyping(e.target.value.trim().length > 0);
          }}
          onBlur={() => sendTyping(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void submit(e);
            }
          }}
          rows={1}
          placeholder="Write a message…"
          className="max-h-32 min-h-[38px] flex-1 resize-none"
        />
        <IconButton
          label="Send"
          type="submit"
          className="bg-accent text-accent-fg hover:bg-accent size-9 shrink-0 hover:brightness-95"
          disabled={sending || !draft.trim()}
        >
          <SendHorizontal size={15} />
        </IconButton>
      </form>
    </div>
  );
}

function MessageBubble({
  message,
  mine,
  grouped,
  onDelete,
}: {
  message: Message;
  mine: boolean;
  grouped: boolean;
  onDelete?: () => void;
}) {
  const name = message.author.username
    ? `@${message.author.username}`
    : message.author.name || 'Someone';

  return (
    <div
      className={cn(
        'group flex flex-col',
        mine ? 'items-end' : 'items-start',
        grouped ? 'mt-[3px]' : 'mt-3',
      )}
    >
      {!grouped && !mine ? (
        <span className="text-ink-faint mb-0.5 px-1 text-[11px]">{name}</span>
      ) : null}
      <div
        className={cn('flex max-w-[85%] items-end gap-1.5', mine && 'flex-row-reverse')}
      >
        <div
          className={cn(
            'w-fit rounded-2xl px-3 py-1.5 text-[13.5px] leading-snug [overflow-wrap:anywhere] whitespace-pre-wrap',
            mine
              ? 'bg-accent text-accent-fg rounded-br-sm'
              : 'bg-surface-2 text-ink border-hairline rounded-bl-sm border',
          )}
        >
          {message.body}
        </div>
        <span className="text-ink-faint mb-0.5 shrink-0 text-[10px] opacity-0 transition-opacity group-hover:opacity-100 pointer-coarse:opacity-100">
          {format(new Date(message.createdAt), 'h:mm a')}
        </span>
        {onDelete ? (
          <button
            type="button"
            aria-label="Delete message"
            onClick={onDelete}
            className="text-ink-faint hover:text-danger mb-0.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 pointer-coarse:opacity-100"
          >
            <Trash2 size={12} />
          </button>
        ) : null}
      </div>
    </div>
  );
}
