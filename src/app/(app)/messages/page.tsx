'use client';

import { MessagesSquare } from 'lucide-react';

import { ConversationList } from '@/components/messages/conversation-list';

export default function MessagesIndexPage() {
  return (
    <>
      {/* Desktop: the list lives in the layout sidebar — just prompt. */}
      <div className="hidden flex-1 flex-col items-center justify-center gap-2 p-8 text-center sm:flex">
        <div className="bg-surface-2 text-ink-faint grid size-12 place-items-center rounded-full">
          <MessagesSquare size={22} />
        </div>
        <p className="text-ink font-serif text-lg font-semibold">Your messages</p>
        <p className="text-ink-muted max-w-xs text-sm">
          Pick a conversation, or start a new one.
        </p>
      </div>

      {/* Mobile: no sidebar, so show the list here. */}
      <div className="flex flex-1 flex-col sm:hidden">
        <ConversationList />
      </div>
    </>
  );
}
