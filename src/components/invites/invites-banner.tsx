'use client';

import { Check, Mail, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { useMyInvitesQuery, useRespondToInviteMutation } from '@/lib/api/api';
import { errorMessage } from '@/lib/api/baseQuery';
import type { ThoughtInvite } from '@/lib/types';

export function InvitesBanner() {
  const { data: invites = [] } = useMyInvitesQuery();
  if (invites.length === 0) return null;

  return (
    <div className="mb-5 flex flex-col gap-2">
      {invites.map((inv) => (
        <InviteRow key={inv.id} invite={inv} />
      ))}
    </div>
  );
}

function InviteRow({ invite }: { invite: ThoughtInvite }) {
  const toast = useToast();
  const [respond, { isLoading }] = useRespondToInviteMutation();

  const act = async (action: 'accept' | 'decline') => {
    try {
      await respond({ id: invite.id, action }).unwrap();
      toast.success(action === 'accept' ? 'Joined the thought' : 'Invite declined');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not respond to the invite'));
    }
  };

  const who = invite.invitedBy.username
    ? `@${invite.invitedBy.username}`
    : invite.invitedBy.name || 'Someone';

  return (
    <div className="border-accent/30 bg-accent/8 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border px-3.5 py-2.5">
      <Mail size={15} className="text-accent shrink-0" />
      <p className="text-ink min-w-0 flex-1 text-sm">
        <span className="font-medium">{who}</span> shared{' '}
        <span className="font-medium">“{invite.thought.title}”</span> with you.
      </p>
      <div className="flex shrink-0 gap-1.5">
        <Button size="sm" onClick={() => act('accept')} loading={isLoading}>
          <Check size={14} />
          Accept
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => act('decline')}
          disabled={isLoading}
        >
          <X size={14} />
          Decline
        </Button>
      </div>
    </div>
  );
}
