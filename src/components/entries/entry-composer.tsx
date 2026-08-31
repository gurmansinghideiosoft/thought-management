'use client';

import { Link2, Paperclip, SendHorizonal, X } from 'lucide-react';
import { useRef, useState } from 'react';

import { Button, IconButton } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { useAddEntryMutation, useUploadEntryFileMutation } from '@/lib/api/api';
import { errorMessage } from '@/lib/api/baseQuery';
import { fileSize } from '@/lib/format';

export function EntryComposer({ thoughtId }: { thoughtId: string }) {
  const toast = useToast();
  const [text, setText] = useState('');
  const [linkMode, setLinkMode] = useState(false);
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const [addEntry, { isLoading: adding }] = useAddEntryMutation();
  const [uploadFile, { isLoading: uploading }] = useUploadEntryFileMutation();
  const busy = adding || uploading;

  const reset = () => {
    setText('');
    setUrl('');
    setLinkMode(false);
    setFile(null);
  };

  const send = async () => {
    if (busy) return;
    try {
      if (file) {
        const form = new FormData();
        form.append('file', file);
        if (text.trim()) form.append('body', text.trim());
        await uploadFile({ thoughtId, form }).unwrap();
      } else if (linkMode) {
        if (!url.trim()) return;
        await addEntry({
          thoughtId,
          kind: 'link',
          link: { url: url.trim() },
          body: text.trim() || undefined,
        }).unwrap();
      } else {
        if (!text.trim()) return;
        await addEntry({ thoughtId, kind: 'note', body: text.trim() }).unwrap();
      }
      reset();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not add the entry'));
    }
  };

  const canSend =
    file != null || (linkMode ? url.trim().length > 0 : text.trim().length > 0);

  return (
    <div className="border-hairline bg-paper/90 border-t backdrop-blur">
      <div className="reading-column px-4 py-3">
        {file ? (
          <div className="border-hairline bg-surface mb-2 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
            <Paperclip size={14} className="text-ink-faint" />
            <span className="flex-1 truncate">{file.name}</span>
            <span className="text-ink-faint text-[12px]">{fileSize(file.size)}</span>
            <IconButton label="Remove file" onClick={() => setFile(null)}>
              <X size={13} />
            </IconButton>
          </div>
        ) : null}

        {linkMode && !file ? (
          <div className="mb-2 flex items-center gap-2">
            <Link2 size={15} className="text-ink-faint shrink-0" />
            <Input
              autoFocus
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
              className="h-9"
            />
            <IconButton label="Cancel link" onClick={() => setLinkMode(false)}>
              <X size={14} />
            </IconButton>
          </div>
        ) : null}

        <div className="flex items-end gap-2">
          {!file ? (
            <>
              <input
                ref={fileInput}
                type="file"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setFile(f);
                  e.target.value = '';
                }}
              />
              <IconButton
                label="Attach a file"
                onClick={() => fileInput.current?.click()}
                className="mb-0.5"
              >
                <Paperclip size={16} />
              </IconButton>
              <IconButton
                label="Add a link"
                onClick={() => setLinkMode((v) => !v)}
                className="mb-0.5"
              >
                <Link2 size={16} />
              </IconButton>
            </>
          ) : null}

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            rows={1}
            placeholder={
              file
                ? 'Add a caption…'
                : linkMode
                  ? 'Add a note about this link…'
                  : 'Add to this thought…'
            }
            className="border-hairline bg-surface text-ink placeholder:text-ink-faint focus:border-accent/50 focus:ring-accent/20 max-h-40 min-h-[40px] flex-1 resize-none rounded-lg border px-3 py-2 text-sm leading-relaxed focus:ring-2 focus:outline-none"
          />

          <Button
            size="sm"
            className="mb-0.5 h-9 px-3"
            onClick={send}
            loading={busy}
            disabled={!canSend}
          >
            <SendHorizonal size={15} />
          </Button>
        </div>
      </div>
    </div>
  );
}
