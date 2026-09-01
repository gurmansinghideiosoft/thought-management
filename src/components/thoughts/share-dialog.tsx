'use client';

import { LogOut, Mail, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button, IconButton } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { CenteredSpinner } from '@/components/ui/misc';
import { useToast } from '@/components/ui/toast';
import {
  useInviteToThoughtMutation,
  useMeQuery,
  useRemoveMemberMutation,
  useRevokeInviteMutation,
  useThoughtMembersQuery,
} from '@/lib/api/api';
import { errorMessage } from '@/lib/api/baseQuery';
import type { PublicUser, ThoughtRole } from '@/lib/types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const displayName = (u: PublicUser): string =>
  u.username ? `@${u.username}` : u.name || 'Someone';

const avatarChar = (u: PublicUser): string =>
  (u.username || u.name || '?').slice(0, 1).toUpperCase();

export function ShareDialog({
  thoughtId,
  role,
  trigger,
}: {
  thoughtId: string;
  role: ThoughtRole;
  trigger: React.ReactNode;
}) {
  const toast = useToast();
  const router = useRouter();
  const { data: me } = useMeQuery();
  const { data, isLoading } = useThoughtMembersQuery(thoughtId);
  const [invite, { isLoading: inviting }] = useInviteToThoughtMutation();
  const [revokeInvite] = useRevokeInviteMutation();
  const [removeMember] = useRemoveMemberMutation();

  const [raw, setRaw] = useState('');
  const isOwner = role === 'owner';

  const send = async () => {
    const emails = [
      ...new Set(
        raw
          .split(/[\s,]+/)
          .map((s) => s.trim())
          .filter(Boolean),
      ),
    ];
    if (emails.length === 0) return;
    const bad = emails.find((e) => !EMAIL_RE.test(e));
    if (bad) {
      toast.error(`Not a valid email: ${bad}`);
      return;
    }
    try {
      const res = await invite({ thoughtId, emails }).unwrap();
      setRaw('');
      const skipped = res.skipped.length;
      toast.success(
        skipped
          ? `Invited ${String(emails.length - skipped)}, skipped ${String(skipped)}`
          : `Sent ${String(emails.length)} invite${emails.length === 1 ? '' : 's'}`,
      );
    } catch (err) {
      toast.error(errorMessage(err, 'Could not send the invites'));
    }
  };

  const leave = async () => {
    if (!me) return;
    try {
      await removeMember({ thoughtId, userId: me.user.id }).unwrap();
      router.push('/thoughts');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not leave'));
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        title="Share this thought"
        description={
          isOwner
            ? 'Invite people by email — they join once they accept.'
            : 'Everyone here can read the thought and its discussion.'
        }
        className="max-w-lg"
      >
        {isLoading || !data ? (
          <CenteredSpinner />
        ) : (
          <div className="flex flex-col gap-4">
            {isOwner ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={raw}
                  onChange={(e) => setRaw(e.target.value)}
                  placeholder="alex@example.com, sam@example.com"
                  rows={2}
                  className="border-hairline bg-field text-ink placeholder:text-ink-faint focus:border-accent/55 focus:ring-accent/20 resize-none rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                />
                <Button size="sm" className="self-end" onClick={send} loading={inviting}>
                  <Mail size={14} />
                  Send invites
                </Button>
              </div>
            ) : null}

            <div className="flex flex-col gap-1">
              <p className="text-ink-faint px-1 text-[11px] tracking-wide uppercase">
                People
              </p>
              <div className="border-hairline bg-surface flex items-center gap-2.5 rounded-lg border px-2.5 py-1.5">
                <span className="bg-accent/12 text-accent grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold">
                  {avatarChar(data.owner)}
                </span>
                <span className="text-ink min-w-0 flex-1 truncate text-sm">
                  {displayName(data.owner)}
                </span>
                <span className="text-ink-faint text-[11px]">Owner</span>
              </div>
              {data.collaborators.map((c) => (
                <div
                  key={c.id}
                  className="border-hairline bg-surface flex items-center gap-2.5 rounded-lg border px-2.5 py-1.5"
                >
                  <span className="bg-accent/12 text-accent grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold">
                    {avatarChar(c)}
                  </span>
                  <span className="text-ink min-w-0 flex-1 truncate text-sm">
                    {displayName(c)}
                  </span>
                  {isOwner ? (
                    <IconButton
                      label={`Remove ${displayName(c)}`}
                      className="size-6"
                      onClick={async () => {
                        try {
                          await removeMember({ thoughtId, userId: c.id }).unwrap();
                        } catch (err) {
                          toast.error(errorMessage(err, 'Could not remove'));
                        }
                      }}
                    >
                      <X size={13} />
                    </IconButton>
                  ) : null}
                </div>
              ))}
            </div>

            {data.pendingInvites.length > 0 ? (
              <div className="flex flex-col gap-1">
                <p className="text-ink-faint px-1 text-[11px] tracking-wide uppercase">
                  Pending
                </p>
                {data.pendingInvites.map((inv) => (
                  <div
                    key={inv.id}
                    className="border-hairline bg-surface flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm"
                  >
                    <Mail size={13} className="text-ink-faint shrink-0" />
                    <span className="text-ink-muted min-w-0 flex-1 truncate">
                      {inv.email}
                    </span>
                    {isOwner ? (
                      <IconButton
                        label={`Cancel invite to ${inv.email}`}
                        className="size-6"
                        onClick={async () => {
                          try {
                            await revokeInvite({
                              thoughtId,
                              inviteId: inv.id,
                            }).unwrap();
                          } catch (err) {
                            toast.error(errorMessage(err, 'Could not cancel'));
                          }
                        }}
                      >
                        <X size={13} />
                      </IconButton>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}

            {!isOwner ? (
              <Button size="sm" variant="danger" className="self-start" onClick={leave}>
                <LogOut size={14} />
                Leave thought
              </Button>
            ) : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
