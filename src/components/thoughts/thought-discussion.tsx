'use client';

import { MessagesSquare, X } from 'lucide-react';
import { useState } from 'react';

import { MessageThread } from '@/components/messages/message-thread';
import { Spinner } from '@/components/ui/misc';
import { useListConversationsQuery, useThoughtConversationQuery } from '@/lib/api/api';
import { cn } from '@/lib/cn';

/** Floating discussion panel for a thought's participants. */
export function ThoughtDiscussion({ thoughtId }: { thoughtId: string }) {
  const [open, setOpen] = useState(false);
  const [everOpened, setEverOpened] = useState(false);

  const { data: conv, isLoading } = useThoughtConversationQuery(thoughtId, {
    skip: !everOpened,
  });
  const { data: convList } = useListConversationsQuery();
  const unread =
    convList?.items.find((c) => c.thought?.id === thoughtId)?.unreadCount ?? 0;

  const toggle = () => {
    setEverOpened(true);
    setOpen((v) => !v);
  };

  return (
    <>
      <button
        onClick={toggle}
        aria-label={open ? 'Close discussion' : 'Open discussion'}
        className={cn(
          'bg-accent text-accent-fg fixed right-5 bottom-5 z-40 flex size-12 items-center justify-center rounded-full shadow-lg shadow-black/20 transition-transform hover:scale-105 active:scale-95',
        )}
      >
        {open ? <X size={20} /> : <MessagesSquare size={20} />}
        {!open && unread > 0 ? (
          <span className="bg-danger text-accent-fg absolute -top-1 -right-1 grid min-w-[18px] place-items-center rounded-full px-1 text-[10px] font-semibold">
            {unread > 9 ? '9+' : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="border-hairline bg-overlay fixed right-5 bottom-20 z-40 flex h-[min(560px,70vh)] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border shadow-2xl shadow-black/25">
          <div className="border-hairline flex items-center justify-between border-b px-4 py-2.5">
            <span className="text-ink font-serif text-sm font-semibold">Discussion</span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="text-ink-faint hover:bg-surface-2 hover:text-ink rounded-lg p-1 transition-colors"
            >
              <X size={15} />
            </button>
          </div>
          {isLoading || !conv ? (
            <div className="flex flex-1 items-center justify-center">
              <Spinner />
            </div>
          ) : (
            <MessageThread conversationId={conv.id} />
          )}
        </div>
      ) : null}
    </>
  );
}
