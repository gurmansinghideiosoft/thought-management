'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

import { MessageThread } from '@/components/messages/message-thread';
import { useListConversationsQuery } from '@/lib/api/api';

export default function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data } = useListConversationsQuery();
  const conv = data?.items.find((c) => c.id === id);

  const title = conv
    ? conv.kind === 'dm'
      ? conv.peer?.username
        ? `@${conv.peer.username}`
        : conv.peer?.name || 'Direct message'
      : `# ${conv.thought?.title ?? 'Discussion'}`
    : 'Conversation';

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-hairline bg-paper/80 flex items-center gap-2 border-b px-4 py-3 backdrop-blur">
        <Link
          href="/messages"
          className="text-ink-faint hover:bg-surface-2 hover:text-ink -ml-1 rounded-lg p-1 transition-colors sm:hidden"
          aria-label="Back"
        >
          <ArrowLeft size={17} />
        </Link>
        <h1 className="text-ink truncate font-serif text-sm font-semibold">{title}</h1>
        {conv?.kind === 'thought' && conv.thought ? (
          <Link
            href={`/thoughts/${conv.thought.id}`}
            className="text-accent ml-auto text-[12px] hover:underline"
          >
            Open thought
          </Link>
        ) : null}
      </div>
      <MessageThread conversationId={id} />
    </div>
  );
}
