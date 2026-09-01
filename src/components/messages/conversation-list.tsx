'use client';

import { formatDistanceToNow } from 'date-fns';
import { MessagesSquare, Plus } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/misc';
import { useToast } from '@/components/ui/toast';
import { useCreateDmMutation, useListConversationsQuery } from '@/lib/api/api';
import { errorMessage } from '@/lib/api/baseQuery';
import { cn } from '@/lib/cn';
import type { ConversationSummary } from '@/lib/types';

const titleOf = (c: ConversationSummary): string =>
  c.kind === 'dm'
    ? c.peer?.username
      ? `@${c.peer.username}`
      : c.peer?.name || 'Direct message'
    : c.thought?.title || 'Thought discussion';

export function ConversationList() {
  const { data } = useListConversationsQuery();
  const params = useParams<{ id?: string }>();
  const activeId = params?.id;
  const items = data?.items ?? [];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-hairline flex items-center justify-between border-b px-4 py-3">
        <h1 className="text-ink font-serif text-base font-semibold">Messages</h1>
        <NewDmButton />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {items.length === 0 ? (
          <EmptyState
            icon={<MessagesSquare size={20} />}
            title="No conversations"
            description="Start one from a shared thought, or with the + button."
          />
        ) : (
          <ul className="flex flex-col gap-0.5">
            {items.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/messages/${c.id}`}
                  className={cn(
                    'flex flex-col gap-0.5 rounded-lg px-2.5 py-2 transition-colors',
                    c.id === activeId ? 'bg-surface-2' : 'hover:bg-surface-2/60',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'min-w-0 flex-1 truncate text-sm',
                        c.unreadCount > 0
                          ? 'text-ink font-semibold'
                          : 'text-ink font-medium',
                      )}
                    >
                      {c.kind === 'thought' ? '# ' : ''}
                      {titleOf(c)}
                    </span>
                    {c.unreadCount > 0 ? (
                      <span className="bg-accent text-accent-fg grid min-w-[18px] place-items-center rounded-full px-1 text-[10px] font-semibold">
                        {c.unreadCount > 9 ? '9+' : c.unreadCount}
                      </span>
                    ) : null}
                  </div>
                  <div className="text-ink-faint flex items-center gap-1.5 text-[12px]">
                    <span className="min-w-0 flex-1 truncate">
                      {c.lastMessage?.body ?? 'No messages yet'}
                    </span>
                    {c.lastMessage ? (
                      <span className="shrink-0">
                        {formatDistanceToNow(new Date(c.lastMessage.at), {
                          addSuffix: false,
                        })}
                      </span>
                    ) : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function NewDmButton() {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [createDm, { isLoading }] = useCreateDmMutation();

  const start = async () => {
    const handle = username.trim().replace(/^@/, '').toLowerCase();
    if (!handle) return;
    try {
      const conv = await createDm({ username: handle }).unwrap();
      setOpen(false);
      setUsername('');
      router.push(`/messages/${conv.id}`);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not start that chat'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        onClick={() => setOpen(true)}
        aria-label="New message"
        className="text-ink-faint hover:bg-surface-2 hover:text-ink rounded-lg p-1.5 transition-colors"
      >
        <Plus size={17} />
      </button>
      <DialogContent title="New message" className="max-w-sm">
        <div className="flex flex-col gap-3">
          <Input
            autoFocus
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && start()}
          />
          <Button onClick={start} loading={isLoading} disabled={!username.trim()}>
            Start chat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
