'use client';

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Field, Input, Textarea } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { useCreateThoughtMutation } from '@/lib/api/api';
import { errorMessage } from '@/lib/api/baseQuery';

export function CreateThoughtDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [create, { isLoading }] = useCreateThoughtMutation();
  const toast = useToast();
  const router = useRouter();

  const reset = () => {
    setTitle('');
    setDescription('');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const thought = await create({
        title: title.trim(),
        description: description.trim() || undefined,
      }).unwrap();
      setOpen(false);
      reset();
      router.push(`/thoughts/${thought.id}`);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not create the thought'));
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus size={15} />
          New thought
        </Button>
      </DialogTrigger>
      <DialogContent
        title="New thought"
        description="Give the idea a name and jot down the gist."
      >
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Field label="Title">
            {({ id }) => (
              <Input
                id={id}
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="A website for…"
                maxLength={200}
              />
            )}
          </Field>
          <Field label="First note" hint="Optional — the raw idea in your head right now">
            {({ id }) => (
              <Textarea
                id={id}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What sparked this?"
                rows={4}
              />
            )}
          </Field>
          <div className="mt-1 flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={isLoading} disabled={!title.trim()}>
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
