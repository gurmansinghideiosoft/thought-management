'use client';

import { formatDistanceToNow } from 'date-fns';
import { SendHorizontal, Trash2 } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { IconButton } from '@/components/ui/button';
import { CenteredSpinner, Spinner } from '@/components/ui/misc';
import { useToast } from '@/components/ui/toast';
import {
  useConversationMessagesInfiniteQuery,
  useDeleteMessageMutation,
  useMarkConversationReadMutation,
  useMeQuery,
  useSendMessageMutation,
} from '@/lib/api/api';
import { errorMessage } from '@/lib/api/baseQuery';
import { cn } from '@/lib/cn';
import type { Message } from '@/lib/types';

export function MessageThread({
  conversationId,
  typingLabel,
  onTyping,
  className,
}: {
  conversationId: string;
  /** e.g. "@alex is typing…" — wired by the realtime layer. */
  typingLabel?: string | null;
  onTyping?: (typing: boolean) => void;
  className?: string;
}) {
  const toast = useToast();
  const { data: me } = useMeQuery();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useConversationMessagesInfiniteQuery(conversationId);
  const [send, { isLoading: sending }] = useSendMessageMutation();
  const [deleteMessage] = useDeleteMessageMutation();
  const [markRead] = useMarkConversationReadMutation();

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
    // A new message at the bottom while we're near it — follow it.
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

  // Mark the conversation read whenever the newest message changes.
  useEffect(() => {
    if (lastId) void markRead(conversationId);
  }, [conversationId, lastId, markRead]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setDraft('');
    onTyping?.(false);
    try {
      await send({ conversationId, body }).unwrap();
    } catch (err) {
      setDraft(body);
      toast.error(errorMessage(err, 'Message not sent'));
    }
  };

  return (
    <div className={cn('flex min-h-0 flex-1 flex-col', className)}>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3">
        <div ref={topSentinel} />
        {isLoading ? (
          <CenteredSpinner />
        ) : count === 0 ? (
          <p className="text-ink-faint py-10 text-center text-sm">
            No messages yet — say hello.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
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
        <div className="text-ink-faint px-4 pb-1 text-[12px] italic">{typingLabel}</div>
      ) : null}

      <form
        onSubmit={submit}
        className="border-hairline flex items-end gap-2 border-t px-3 py-2.5"
      >
        <textarea
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            onTyping?.(e.target.value.trim().length > 0);
          }}
          onBlur={() => onTyping?.(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void submit(e);
            }
          }}
          rows={1}
          placeholder="Write a message…"
          className="border-hairline bg-field text-ink placeholder:text-ink-faint focus:border-accent/55 focus:ring-accent/20 max-h-32 min-h-[38px] flex-1 resize-none rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
        />
        <IconButton
          label="Send"
          className="bg-accent text-accent-fg hover:bg-accent size-9 shrink-0 hover:brightness-95"
          disabled={sending || !draft.trim()}
          onClick={(e) => void submit(e as unknown as React.FormEvent)}
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
        grouped ? 'mt-0.5' : 'mt-2',
      )}
    >
      {!grouped && !mine ? (
        <span className="text-ink-faint mb-0.5 px-1 text-[11px]">{name}</span>
      ) : null}
      <div className={cn('flex items-center gap-1.5', mine && 'flex-row-reverse')}>
        <div
          className={cn(
            'max-w-[78%] rounded-2xl px-3 py-1.5 text-[13.5px] leading-snug break-words whitespace-pre-wrap',
            mine
              ? 'bg-accent text-accent-fg rounded-br-sm'
              : 'bg-surface-2 text-ink rounded-bl-sm',
          )}
        >
          {message.body}
        </div>
        {onDelete ? (
          <IconButton
            label="Delete message"
            className="size-6 opacity-0 group-hover:opacity-100"
            onClick={onDelete}
          >
            <Trash2 size={12} />
          </IconButton>
        ) : null}
      </div>
      <span className="text-ink-faint mt-0.5 px-1 text-[10px] opacity-0 group-hover:opacity-100">
        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
      </span>
    </div>
  );
}
