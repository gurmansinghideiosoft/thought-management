'use client';

import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { useState } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/misc';
import { useToast } from '@/components/ui/toast';
import { downloadFromApi } from '@/lib/download';

export default function SettingsPage() {
  const toast = useToast();
  const [busy, setBusy] = useState<string | null>(null);

  const run = async (key: string, path: string, name: string, done: string) => {
    setBusy(key);
    try {
      await downloadFromApi(path, name);
      toast.success(done);
    } catch {
      toast.error('Could not prepare the download. Try again.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <PageHeader title="Settings" />

      <div className="content-column flex w-full flex-col gap-4 px-4 py-6 sm:px-6">
        <Card className="p-5">
          <h2 className="text-ink font-serif text-lg font-semibold">Export your data</h2>
          <p className="text-ink-muted mt-1 max-w-prose text-sm leading-relaxed">
            Download a copy of everything you&rsquo;ve put into Margin — readable files
            plus a <code className="text-[13px]">data.json</code> holding the complete
            record.
          </p>

          <ul className="text-ink-muted mt-3 flex flex-col gap-1 text-[13px]">
            <li>Journal — one Markdown file per day</li>
            <li>Thoughts — Markdown, with every entry</li>
            <li>Finance, tasks, habits, captures — CSV</li>
            <li>Weekly / monthly reviews — Markdown</li>
          </ul>
          <p className="text-ink-faint mt-3 text-[12px]">
            Messages and your vault aren&rsquo;t included.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              onClick={() =>
                run('zip', '/export/archive', 'margin-backup.zip', 'Backup downloaded')
              }
              loading={busy === 'zip'}
              disabled={busy !== null}
            >
              <Download size={15} />
              Download backup (.zip)
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                run('md', '/export/journal.md', 'margin-journal.md', 'Journal downloaded')
              }
              loading={busy === 'md'}
              disabled={busy !== null}
            >
              <FileText size={15} />
              Journal (.md)
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                run(
                  'csv',
                  '/export/transactions.csv',
                  'margin-transactions.csv',
                  'Finance data downloaded',
                )
              }
              loading={busy === 'csv'}
              disabled={busy !== null}
            >
              <FileSpreadsheet size={15} />
              Finance (.csv)
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
