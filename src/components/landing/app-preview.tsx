import {
  Activity,
  ArrowRight,
  CalendarDays,
  Check,
  Flame,
  Home,
  Image as ImageIcon,
  Inbox,
  KeyRound,
  Lightbulb,
  ListChecks,
  ListTodo,
  LogOut,
  MessagesSquare,
  Monitor,
  Moon,
  NotebookPen,
  Plus,
  Quote as QuoteIcon,
  Search,
  Settings,
  Sun,
  Telescope,
  Trash2,
  Wallet,
} from 'lucide-react';
import Image from 'next/image';

import { LogoMark } from '@/components/brand/logo';
import { BANNERS } from '@/lib/banners';
import { cn } from '@/lib/cn';

const NAV: {
  label: string;
  icon: typeof Home;
  badge?: number;
  active?: boolean;
}[] = [
  { label: 'Home', icon: Home, active: true },
  { label: 'Inbox', icon: Inbox, badge: 3 },
  { label: 'Thoughts', icon: Lightbulb, badge: 1 },
  { label: 'Tasks', icon: CalendarDays },
  { label: 'Messages', icon: MessagesSquare, badge: 2 },
  { label: 'Journal', icon: NotebookPen },
  { label: 'Review', icon: Telescope },
  { label: 'Habits', icon: ListChecks },
  { label: 'Finance', icon: Wallet },
  { label: 'Vault', icon: KeyRound },
  { label: 'Activity', icon: Activity },
  { label: 'Settings', icon: Settings },
  { label: 'Trash', icon: Trash2 },
];

/**
 * A static, pixel-faithful mock of the Margin workspace for the landing page —
 * built from the same tokens and layout as the real app-shell and Home screen,
 * with placeholder data. Decorative: the whole thing is `aria-hidden`.
 */
export function AppPreview() {
  return (
    <div
      aria-hidden
      className="border-hairline bg-paper shadow-modal relative overflow-hidden rounded-2xl border select-none"
    >
      {/* window chrome */}
      <div className="border-hairline bg-surface/70 flex items-center gap-1.5 border-b px-4 py-2.5 backdrop-blur-sm">
        <span className="bg-ink-faint/40 size-2.5 rounded-full" />
        <span className="bg-ink-faint/40 size-2.5 rounded-full" />
        <span className="bg-ink-faint/40 size-2.5 rounded-full" />
        <span className="text-ink-faint ml-3 text-[11px]">app.margin — Home</span>
      </div>

      <div className="flex">
        {/* --- sidebar (mirrors AppShell) --- */}
        <aside className="border-hairline bg-surface/60 hidden w-60 shrink-0 flex-col border-r px-3 py-4 lg:flex">
          <div className="px-2.5 pb-4">
            <span className="text-ink inline-flex items-center gap-2">
              <LogoMark size={24} />
              <span className="font-serif text-lg font-semibold tracking-tight">
                Margin
              </span>
            </span>
          </div>

          {/* quick actions */}
          <div className="border-hairline mb-3 grid grid-cols-4 gap-0.5 rounded-xl border p-1">
            {[Search, Plus, NotebookPen, ListTodo].map((Icon, i) => (
              <span
                key={i}
                className="text-ink-faint flex h-8 items-center justify-center rounded-lg"
              >
                <Icon size={16} />
              </span>
            ))}
          </div>

          {/* nav */}
          <nav className="flex flex-col gap-0.5">
            {NAV.map(({ label, icon: Icon, badge, active }) => (
              <div
                key={label}
                className={cn(
                  'relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm',
                  active ? 'bg-surface-2 text-ink font-medium' : 'text-ink-muted',
                )}
              >
                {active ? (
                  <span className="bg-accent absolute top-1/2 left-0 h-4 w-0.5 -translate-y-1/2 rounded-full" />
                ) : null}
                <Icon size={16} className={active ? 'text-accent' : undefined} />
                {label}
                {badge ? (
                  <span className="bg-accent text-accent-fg ml-auto grid min-w-[18px] place-items-center rounded-full px-1 text-[10px] font-semibold">
                    {badge}
                  </span>
                ) : null}
              </div>
            ))}
          </nav>

          {/* account footer — pinned to the bottom of the sidebar */}
          <div className="border-hairline mt-auto border-t pt-3">
            <div className="flex items-center gap-2.5 px-1.5 py-1">
              <span className="bg-accent/12 text-accent grid size-7 shrink-0 place-items-center rounded-full text-[12px] font-semibold">
                AK
              </span>
              <span className="min-w-0 flex-1 truncate text-sm">
                <span className="text-ink block truncate">Alex Kim</span>
                <span className="text-ink-faint block truncate text-[12px]">
                  @alexkim
                </span>
              </span>
              <LogOut size={15} className="text-ink-faint shrink-0" />
            </div>
            <div className="mt-2 flex items-center justify-between px-1.5">
              <span className="text-ink-faint text-[11px] tracking-wide uppercase">
                Theme
              </span>
              <span className="border-hairline bg-field flex rounded-lg border p-0.5">
                {[Sun, Monitor, Moon].map((Icon, i) => (
                  <span
                    key={i}
                    className={cn(
                      'flex size-7 items-center justify-center rounded-md',
                      Icon === Monitor ? 'bg-surface-2 text-ink' : 'text-ink-faint',
                    )}
                  >
                    <Icon size={14} />
                  </span>
                ))}
              </span>
            </div>
          </div>
        </aside>

        {/* --- main (mirrors Home) --- */}
        <div className="min-w-0 flex-1">
          {/* hero banner */}
          <div className="relative h-44 w-full overflow-hidden sm:h-52">
            <Image
              src={BANNERS[0]!.src}
              alt=""
              fill
              sizes="900px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/5" />
            <span className="bg-overlay/80 text-ink absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium shadow-sm backdrop-blur">
              <ImageIcon size={13} />
              Change background
            </span>
            <div className="absolute right-0 bottom-0 left-0 p-5 sm:p-6">
              <h1 className="font-serif text-2xl font-semibold text-white drop-shadow sm:text-3xl">
                Welcome back, Alex
              </h1>
              <p className="mt-1 text-[13px] font-medium text-white/85">
                Tuesday, September 8 · 9:14 AM
              </p>
            </div>
          </div>

          {/* content column */}
          <div className="flex flex-col gap-4 px-4 py-5 sm:px-6">
            {/* daily quote */}
            <section className="border-hairline bg-surface relative overflow-hidden rounded-xl border p-5">
              <QuoteIcon
                size={64}
                strokeWidth={1.5}
                className="text-ink-faint/10 pointer-events-none absolute -top-2 -right-2"
              />
              <p className="text-ink-faint mb-2 text-[11px] font-medium tracking-wide uppercase">
                Quote of the day
              </p>
              <blockquote className="text-ink font-serif text-[17px] leading-snug">
                “What gets scheduled gets done.”
              </blockquote>
              <p className="text-ink-muted mt-2 text-[13px]">— Michael Hyatt</p>
            </section>

            <div className="grid gap-4 lg:grid-cols-2">
              {/* today's log */}
              <PreviewCard icon={NotebookPen} title="Today's log" hint="4">
                <ul className="flex flex-col">
                  {[
                    ['08:20', 'Shipped the auth fix'],
                    ['09:05', 'Call with the vendor — need a quote'],
                    ['09:40', 'Reviewed next month’s budget'],
                    ['10:15', 'Outlined the Q3 summary'],
                  ].map(([t, text]) => (
                    <li key={t} className="flex items-start gap-2.5 py-1 text-[13.5px]">
                      <span className="text-ink-faint mt-[3px] shrink-0 text-[11px] tabular-nums">
                        {t}
                      </span>
                      <span className="text-ink min-w-0 flex-1 leading-snug">{text}</span>
                    </li>
                  ))}
                </ul>
                <MockInput className="mt-3" placeholder="Just did… (Enter to add)" />
              </PreviewCard>

              {/* today's tasks */}
              <PreviewCard icon={ListTodo} title="Today" link="All tasks">
                <p className="text-ink-muted mb-1.5 text-[12px]">1 done · 3 to go</p>
                <ul className="flex flex-col">
                  {[
                    ['Draft the Q3 summary', 2, false],
                    ['Book the venue', 3, false],
                    ['Send the invoice', 3, false],
                    ['Reply to the design review', 1, true],
                  ].map(([text, prio, done]) => (
                    <li key={text as string} className="flex items-start gap-2.5 py-1">
                      <span
                        className={cn(
                          'mt-0.5 grid size-4 shrink-0 place-items-center rounded-[5px] border',
                          done
                            ? 'border-accent bg-accent text-accent-fg'
                            : 'border-hairline',
                        )}
                      >
                        {done ? <Check size={11} strokeWidth={3} /> : null}
                      </span>
                      <span
                        className={cn(
                          'min-w-0 flex-1 text-[13.5px] leading-snug',
                          done ? 'text-ink-faint line-through' : 'text-ink',
                        )}
                      >
                        {text}
                      </span>
                      <span
                        className={cn(
                          'mt-1.5 size-1.5 shrink-0 rounded-full',
                          prio === 1
                            ? 'bg-danger'
                            : prio === 2
                              ? 'bg-star'
                              : 'bg-ink-faint/50',
                        )}
                      />
                    </li>
                  ))}
                </ul>
                <MockInput
                  className="mt-3"
                  placeholder="Add a task…"
                  trailing={<Plus size={14} />}
                />
              </PreviewCard>

              {/* habits */}
              <PreviewCard icon={ListChecks} title="Habits" hint="2/3">
                <ul className="flex flex-col gap-1">
                  {[
                    ['Morning pages', true, 12],
                    ['Workout', true, 4],
                    ['Read 20 pages', false, 0],
                  ].map(([name, done, streak]) => (
                    <li key={name as string} className="flex items-center gap-2.5 py-1">
                      <span
                        className={cn(
                          'grid size-4 shrink-0 place-items-center rounded-[5px] border',
                          done
                            ? 'border-accent bg-accent text-accent-fg'
                            : 'border-hairline',
                        )}
                      >
                        {done ? <Check size={11} strokeWidth={3} /> : null}
                      </span>
                      <span
                        className={cn(
                          'min-w-0 flex-1 truncate text-[13.5px]',
                          done ? 'text-ink-faint line-through' : 'text-ink',
                        )}
                      >
                        {name}
                      </span>
                      {(streak as number) > 0 ? (
                        <span className="text-accent inline-flex items-center gap-0.5 text-[11px]">
                          <Flame size={11} />
                          {streak}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </PreviewCard>

              {/* recent thoughts */}
              <PreviewCard icon={Lightbulb} title="Recent thoughts" link="All thoughts">
                <ul className="flex flex-col gap-1.5">
                  {[
                    ['Onboarding, rethought', 8, 'updated 2h ago'],
                    ['Pricing experiments', 3, 'updated yesterday'],
                    ['Notes app comparison', 5, 'created 3d ago'],
                  ].map(([title, count, when]) => (
                    <li
                      key={title as string}
                      className="-mx-2 flex flex-col gap-0.5 rounded-lg px-2 py-1.5"
                    >
                      <span className="text-ink truncate text-sm font-medium">
                        {title}
                      </span>
                      <span className="text-ink-faint flex items-center gap-2 text-[12px]">
                        <span className="inline-flex items-center gap-1">
                          <MessagesSquare size={11} />
                          {count}
                        </span>
                        <span>·</span>
                        <span>{when}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </PreviewCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewCard({
  icon: Icon,
  title,
  hint,
  link,
  children,
}: {
  icon: typeof NotebookPen;
  title: string;
  hint?: string;
  link?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-hairline bg-surface flex flex-col rounded-xl border p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-ink flex items-center gap-2 font-serif text-[15px] font-semibold">
          <Icon size={16} className="text-ink-faint" />
          {title}
        </h2>
        {hint ? (
          <span className="text-ink-faint text-[12px] tabular-nums">{hint}</span>
        ) : link ? (
          <span className="text-ink-faint inline-flex items-center gap-1 text-[12px]">
            {link} <ArrowRight size={12} />
          </span>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function MockInput({
  placeholder,
  trailing,
  className,
}: {
  placeholder: string;
  trailing?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('border-hairline border-t pt-3', className)}>
      <div className="flex items-center gap-2">
        <span className="border-hairline bg-field text-ink-faint flex h-9 flex-1 items-center rounded-lg border px-3 text-[13px]">
          {placeholder}
        </span>
        {trailing ? (
          <span className="bg-accent text-accent-fg grid h-9 w-9 place-items-center rounded-lg">
            {trailing}
          </span>
        ) : null}
      </div>
    </div>
  );
}
