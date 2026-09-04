'use client';

import { AnimatePresence, MotionConfig } from 'framer-motion';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BellOff,
  CalendarDays,
  Download,
  Inbox,
  KeyRound,
  Lightbulb,
  NotebookPen,
  PenLine,
  Plus,
  ShieldCheck,
  Telescope,
  Wallet,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { AppPreview } from '@/components/landing/app-preview';
import {
  EASE,
  fadeIn,
  fadeUp,
  InView,
  lineUp,
  motion,
  ParallaxPhoto,
  riseIn,
  stagger,
  staggerTight,
} from '@/components/landing/motion';
import { Logo, LogoMark } from '@/components/brand/logo';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { BANNERS } from '@/lib/banners';
import { useSession } from '@/lib/auth/useSession';
import { cn } from '@/lib/cn';

/** Resolve one of the app's hero photos by id, with a safe fallback. */
const photo = (id: string): string =>
  BANNERS.find((b) => b.id === id)?.src ?? BANNERS[0]!.src;

/* -------------------------------------------------------------------------- */
/*  small building blocks                                                     */
/* -------------------------------------------------------------------------- */

function CtaLink({
  href,
  children,
  variant = 'primary',
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'invert';
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'focus-halo inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-[background-color,filter,box-shadow,transform] duration-150 hover:-translate-y-0.5 active:translate-y-0',
        variant === 'primary' &&
          'bg-accent text-accent-fg shadow-[0_1px_2px_rgba(26,23,18,0.12)] hover:brightness-[0.94]',
        variant === 'secondary' &&
          'border-hairline bg-surface text-ink hover:bg-surface-2 border',
        variant === 'invert' && 'bg-paper text-ink hover:brightness-95',
        className,
      )}
    >
      {children}
    </Link>
  );
}

type Tone = 'plain' | 'tint' | 'surface' | 'accent';

const TONE: Record<Tone, string> = {
  plain: '',
  tint: 'bg-surface/50',
  surface: 'bg-surface',
  accent: 'bg-accent text-accent-fg',
};

/** A full-bleed section band with its own background + a centred content column. */
function Band({
  tone = 'plain',
  id,
  className,
  children,
}: {
  tone?: Tone;
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn('scroll-mt-20', TONE[tone])}>
      <div
        className={cn('mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28', className)}
      >
        {children}
      </div>
    </section>
  );
}

/** Editorial masthead: an oversized index numeral, an accent kicker, a heading. */
function Masthead({
  index,
  kicker,
  title,
  intro,
  center,
}: {
  index?: string;
  kicker: string;
  title: React.ReactNode;
  intro?: string;
  center?: boolean;
}) {
  return (
    <div className={cn('flex flex-col gap-4', center && 'items-center text-center')}>
      <div className="flex items-baseline gap-3">
        {index ? (
          <span className="text-ink-faint/30 font-serif text-5xl leading-none tabular-nums sm:text-6xl">
            {index}
          </span>
        ) : null}
        <span className="text-accent text-[11px] font-semibold tracking-[0.16em] uppercase">
          {kicker}
        </span>
      </div>
      <h2 className="font-serif text-[26px] font-semibold tracking-tight text-balance sm:text-[34px]">
        {title}
      </h2>
      {intro ? (
        <p className="text-ink-muted max-w-xl text-[15px] leading-relaxed text-pretty">
          {intro}
        </p>
      ) : null}
    </div>
  );
}

/** A borderless, smoothly-expanding FAQ row. */
function FaqItem({
  q,
  a,
  open,
  onToggle,
}: {
  q: string;
  a: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl transition-[background-color,box-shadow] duration-300',
        open ? 'bg-surface shadow-raised' : 'bg-surface/70 hover:bg-surface',
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="text-ink flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[14px] font-medium"
      >
        {q}
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="text-ink-faint shrink-0"
        >
          <Plus size={16} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: EASE }}
            className="overflow-hidden"
          >
            <p className="text-ink-muted px-5 pb-5 text-[13.5px] leading-relaxed">{a}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  content                                                                   */
/* -------------------------------------------------------------------------- */

const FEATURES: {
  icon: typeof CalendarDays;
  title: string;
  body: string;
  span?: string;
  featured?: boolean;
}[] = [
  {
    icon: CalendarDays,
    title: 'Tasks & routines',
    body: 'A calendar you actually plan in. Daily routines that ask for today — and never nag you about the days you missed.',
    span: 'lg:col-span-2 lg:row-span-2',
    featured: true,
  },
  {
    icon: Lightbulb,
    title: 'Thoughts',
    body: 'A running timeline of notes and revisions for an idea, instead of one document that goes stale.',
  },
  {
    icon: NotebookPen,
    title: 'Journal',
    body: 'A page a day, with a streak that keeps you honest and a prompt when it’s blank.',
  },
  {
    icon: Telescope,
    title: 'Review',
    body: 'Weekly and monthly check-ins that turn a pile of activity back into perspective.',
  },
  {
    icon: Wallet,
    title: 'Finance',
    body: 'Spending, earning, budgets, recurring bills, and money you’ve lent — every number real-time.',
  },
  {
    icon: KeyRound,
    title: 'Vault',
    body: 'A zero-knowledge password store. Encrypted in your browser; the server only holds ciphertext.',
  },
];

const DAY = [
  {
    time: '7:30',
    icon: Inbox,
    title: 'A thought lands in the inbox',
    body: 'The day’s first idea shows up before you’re ready. One keystroke captures it — sort it later.',
  },
  {
    time: '9:00',
    icon: CalendarDays,
    title: 'Open Today',
    body: 'Three things to do, your routines already listed. Plan the block, start the work.',
  },
  {
    time: '1:00',
    icon: NotebookPen,
    title: 'Log what you shipped',
    body: 'A quick line in the day log as you go — the trail you’ll be glad to have at standup.',
  },
  {
    time: '4:00',
    icon: Wallet,
    title: 'Record the loan',
    body: 'You covered a colleague’s lunch. Mark it borrowed so your balance still tells the truth.',
  },
  {
    time: '9:30',
    icon: PenLine,
    title: 'A page before bed',
    body: 'The journal streak nudges; the prompt helps when the page is blank.',
  },
  {
    time: 'Sunday',
    icon: Telescope,
    title: 'The weekly review',
    body: 'A week of small entries turns back into a picture of where things went.',
  },
] as const;

const PRIVACY = [
  {
    icon: ShieldCheck,
    title: 'Zero-knowledge vault',
    body: 'Passwords are encrypted in your browser with a key from your master password. The server only ever holds ciphertext it can’t read.',
  },
  {
    icon: Download,
    title: 'Full export, any time',
    body: 'One click gives you a complete, readable copy of everything. Leave whenever you like and take it all with you.',
  },
  {
    icon: BellOff,
    title: 'Quiet by default',
    body: 'No feeds, no engagement loops, no notifications competing for your attention. It waits for you to come back.',
  },
] as const;

const REPLACES = [
  'a notes app',
  'a to-do app',
  'a budget tracker',
  'a habit tracker',
  'a password manager',
] as const;

const EASE_ITEMS = [
  {
    title: 'Capture in two keystrokes',
    body: 'Press C anywhere to drop a thought into your inbox. Sort it later — or don’t.',
  },
  {
    title: 'Keyboard-first',
    body: '⌘K to search everything, quick-add for today’s log and tasks, no reaching for the mouse.',
  },
  {
    title: 'One place, not eight tabs',
    body: 'Notes, plans, money, and passwords under one calm roof, sharing one design.',
  },
  {
    title: 'Yours to keep',
    body: 'Export a full backup of everything, any time. No lock-in, no exceptions.',
  },
] as const;

const FAQ = [
  { q: 'Is Margin free?', a: 'Yes — every feature is free to use.' },
  {
    q: 'Can I get my data out?',
    a: 'Any time. Settings → Export gives you a full archive: journal and notes as Markdown, tasks and finances as CSV, plus a complete JSON dump. Nothing is held hostage.',
  },
  {
    q: 'Is there a mobile app?',
    a: 'Not yet. Margin is a responsive web app, so it works in any mobile browser — a dedicated app may come later.',
  },
  {
    q: 'How are Vault passwords protected?',
    a: 'They’re encrypted in your browser with a key derived from your master password (Argon2id). The server only ever receives ciphertext — we can’t read your credentials, and neither can anyone who gets the database.',
  },
  {
    q: 'Do you run ads or sell my data?',
    a: 'No. No ads, no third-party trackers, nothing sold or used to train models. You’re the user, not the product.',
  },
  {
    q: 'What do I need to get started?',
    a: 'An email and a password. That’s it.',
  },
] as const;

/* -------------------------------------------------------------------------- */
/*  page                                                                      */
/* -------------------------------------------------------------------------- */

export function LandingPage() {
  const { isAuthenticated } = useSession();
  const cta = isAuthenticated
    ? { href: '/home', label: 'Open dashboard' }
    : { href: '/login', label: 'Log in' };
  const primary = isAuthenticated
    ? { href: '/home', label: 'Open dashboard' }
    : { href: '/register', label: 'Get started' };

  // Lift the sticky header off the page once you scroll past the hero top.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <MotionConfig reducedMotion="user">
      <div className="lp flex min-h-full flex-1 flex-col">
        <noscript>
          <style>{`.lp [style]{opacity:1!important;transform:none!important;filter:none!important}`}</style>
        </noscript>

        {/* nav */}
        <header
          className={cn(
            'sticky top-0 z-30 backdrop-blur-sm transition-[background-color,box-shadow] duration-300',
            scrolled
              ? 'bg-paper/85 shadow-[0_6px_24px_-14px_rgba(26,23,18,0.2)]'
              : 'bg-transparent',
          )}
        >
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
            <Logo />
            <div className="flex items-center gap-3">
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>
              <CtaLink href={cta.href} variant="secondary">
                {cta.label}
              </CtaLink>
            </div>
          </div>
        </header>

        <main className="flex-1">
          {/* ---------- hero — the page and its margin ---------- */}
          <section className="relative isolate overflow-hidden">
            {/* the sheet: faint horizontal rules */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(to bottom, transparent 0 43px, color-mix(in oklab, var(--foreground) 4%, transparent) 43px 44px)',
                maskImage:
                  'linear-gradient(to bottom, transparent, #000 14%, #000 80%, transparent)',
                WebkitMaskImage:
                  'linear-gradient(to bottom, transparent, #000 14%, #000 80%, transparent)',
              }}
            />

            {/* margin notes — the mundane stuff, set down so the page stays clear */}
            <motion.ul
              aria-hidden
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="text-ink-faint absolute top-[9rem] left-6 hidden w-[190px] flex-col gap-4 font-serif text-[12.5px] italic 2xl:flex"
            >
              {[
                'pick up the prescription',
                'idea — a weekly digest',
                'call the landlord back',
                'renew the parking permit',
              ].map((n, i) => (
                <motion.li
                  key={n}
                  variants={fadeIn}
                  className="flex items-start gap-2 leading-snug"
                  style={{ rotate: i % 2 ? '-0.7deg' : '0.7deg' }}
                >
                  <span className="bg-accent/50 mt-[0.6em] h-px w-2.5 shrink-0" />
                  {n}
                </motion.li>
              ))}
            </motion.ul>

            <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
              {/* the margin rule + tack — the mark, at page scale */}
              <motion.div
                aria-hidden
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 1.1, ease: EASE }}
                style={{ transformOrigin: 'top' }}
                className="bg-accent/35 absolute inset-y-0 left-4 w-px sm:left-6"
              />
              <motion.span
                aria-hidden
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, duration: 0.5, ease: EASE }}
                className="bg-accent absolute top-[9rem] left-4 size-2.5 -translate-x-1/2 rounded-full sm:left-6"
              />

              {/* the text — set back from the margin, left-aligned */}
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="relative z-10 flex max-w-2xl flex-col items-start gap-6 py-28 pl-8 text-left sm:py-36 sm:pl-16 lg:pl-28"
              >
                <motion.span
                  variants={fadeIn}
                  className="border-hairline text-ink-muted inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[12px] font-medium"
                >
                  <span className="bg-accent size-1.5 rounded-full" />
                  Room to think
                </motion.span>

                <motion.h1
                  variants={staggerTight}
                  className="font-serif text-[42px] leading-[1.05] font-semibold tracking-tight sm:text-[60px]"
                >
                  <span className="block overflow-hidden pb-[0.12em]">
                    <motion.span variants={lineUp} className="block">
                      Everything you’re carrying,
                    </motion.span>
                  </span>
                  <span className="block overflow-hidden pb-[0.12em]">
                    <motion.span variants={lineUp} className="text-accent block">
                      in one calm place.
                    </motion.span>
                  </span>
                </motion.h1>

                <motion.p
                  variants={fadeUp}
                  className="text-ink-muted max-w-xl text-[15px] leading-relaxed text-pretty sm:text-lg"
                >
                  The margin of a page is where you note what matters without disturbing
                  the text. Margin is that space for the rest of your life — tasks, notes,
                  journal, habits, money — set down so your mind doesn’t have to hold
                  them.
                </motion.p>

                <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
                  <CtaLink href={primary.href}>
                    {primary.label}
                    <ArrowRight size={16} />
                  </CtaLink>
                  {!isAuthenticated ? (
                    <CtaLink href="/login" variant="secondary">
                      Log in
                    </CtaLink>
                  ) : null}
                </motion.div>

                <motion.div
                  variants={fadeIn}
                  className="text-ink-faint flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-medium tracking-wide"
                >
                  {['Tasks', 'Thoughts', 'Journal', 'Habits', 'Finance', 'Vault'].map(
                    (t, i) => (
                      <span key={t} className="inline-flex items-center gap-3">
                        {i > 0 ? (
                          <span className="bg-hairline size-1 rounded-full" />
                        ) : null}
                        {t}
                      </span>
                    ),
                  )}
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* ---------- the tour ---------- */}
          <Band tone="tint" id="tour">
            <InView>
              <motion.div variants={fadeUp}>
                <Masthead
                  index="01"
                  kicker="The tour"
                  title="See it in one screen"
                  intro="One workspace, one system. This is the home screen — your whole day at a glance."
                  center
                />
              </motion.div>
              <motion.div variants={riseIn} className="mt-10">
                <AppPreview />
              </motion.div>
              <motion.div variants={fadeUp} className="mt-8 flex justify-center">
                <CtaLink href={cta.href}>
                  {isAuthenticated ? 'Open dashboard' : 'Log in to get started'}
                  <ArrowRight size={16} />
                </CtaLink>
              </motion.div>
            </InView>
          </Band>

          {/* ---------- the rhythm ---------- */}
          <Band>
            <InView>
              <motion.div variants={fadeUp}>
                <Masthead
                  index="02"
                  kicker="The rhythm"
                  title="A day with Margin"
                  intro="The pieces aren’t separate apps bolted together — they’re one rhythm."
                />
              </motion.div>
              <motion.ol
                variants={staggerTight}
                className="mt-12 grid gap-x-8 gap-y-9 sm:grid-cols-2 lg:grid-cols-3"
              >
                {DAY.map(({ time, icon: Icon, title, body }) => (
                  <motion.li
                    key={title}
                    variants={fadeUp}
                    className="border-hairline flex flex-col gap-2 border-t pt-5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="border-hairline bg-surface text-accent grid size-9 shrink-0 place-items-center rounded-full border">
                        <Icon size={16} />
                      </span>
                      <span className="text-ink-faint text-[11px] font-semibold tracking-wide uppercase">
                        {time}
                      </span>
                    </div>
                    <h3 className="text-ink mt-1 text-[15px] font-semibold">{title}</h3>
                    <p className="text-ink-muted text-[13.5px] leading-relaxed">{body}</p>
                  </motion.li>
                ))}
              </motion.ol>
            </InView>
          </Band>

          {/* ---------- the toolkit (bento) ---------- */}
          <Band tone="tint" id="toolkit">
            <InView>
              <motion.div variants={fadeUp}>
                <Masthead
                  index="03"
                  kicker="The toolkit"
                  title="Six tools, one system"
                  intro="Each would be its own app. Built to work together, so nothing falls between them."
                />
              </motion.div>
              <motion.div
                variants={staggerTight}
                className="mt-10 grid gap-4 sm:grid-cols-2 lg:auto-rows-fr lg:grid-cols-3"
              >
                {FEATURES.map(({ icon: Icon, title, body, span, featured }) => (
                  <motion.div
                    key={title}
                    variants={fadeUp}
                    className={cn(
                      'border-hairline bg-surface relative flex flex-col overflow-hidden rounded-2xl border p-5 transition-transform duration-300 hover:-translate-y-1',
                      span,
                      featured && 'justify-end gap-2 p-6',
                    )}
                  >
                    {featured ? (
                      <Icon
                        size={120}
                        strokeWidth={1}
                        className="text-accent/10 pointer-events-none absolute -top-4 -right-4"
                      />
                    ) : null}
                    <span
                      className={cn(
                        'bg-accent/10 text-accent grid place-items-center rounded-lg',
                        featured ? 'size-11' : 'size-9',
                      )}
                    >
                      <Icon size={featured ? 22 : 18} />
                    </span>
                    <h3
                      className={cn(
                        'text-ink mt-3 font-serif font-semibold',
                        featured ? 'text-xl' : 'text-[15px]',
                      )}
                    >
                      {title}
                    </h3>
                    <p
                      className={cn(
                        'text-ink-muted leading-relaxed',
                        featured ? 'text-sm' : 'text-[13.5px]',
                      )}
                    >
                      {body}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </InView>
          </Band>

          {/* ---------- the math ---------- */}
          <Band>
            <InView className="flex flex-col items-center gap-8 text-center">
              <motion.div variants={fadeUp}>
                <Masthead
                  index="04"
                  kicker="The math"
                  title="One tab instead of five"
                  intro="Margin covers what you’d otherwise scatter across separate subscriptions — and keeps them in step."
                  center
                />
              </motion.div>
              <motion.ul
                variants={staggerTight}
                className="flex flex-wrap justify-center gap-2"
              >
                {REPLACES.map((item) => (
                  <motion.li
                    key={item}
                    variants={fadeIn}
                    className="border-hairline text-ink-faint rounded-full border px-3 py-1 text-[13px] line-through"
                  >
                    {item}
                  </motion.li>
                ))}
              </motion.ul>
              <motion.div variants={fadeIn}>
                <ArrowDown className="text-ink-faint/50" size={20} />
              </motion.div>
              <motion.span
                variants={fadeUp}
                className="bg-accent text-accent-fg inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-[0_1px_2px_rgba(26,23,18,0.12)]"
              >
                <LogoMark size={18} />
                One Margin
              </motion.span>
            </InView>
          </Band>

          {/* ---------- the feel (numbered, typographic) ---------- */}
          <Band tone="tint">
            <InView>
              <motion.div variants={fadeUp}>
                <Masthead
                  index="05"
                  kicker="The feel"
                  title="Made to get out of your way"
                />
              </motion.div>
              <motion.div
                variants={staggerTight}
                className="mt-10 grid gap-x-10 gap-y-9 sm:grid-cols-2"
              >
                {EASE_ITEMS.map(({ title, body }, i) => (
                  <motion.div key={title} variants={fadeUp} className="flex gap-4">
                    <span className="text-ink-faint/25 font-serif text-4xl leading-none tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className="text-ink text-[15px] font-semibold">{title}</h3>
                      <p className="text-ink-muted mt-1 text-[13.5px] leading-relaxed">
                        {body}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </InView>
          </Band>

          {/* ---------- the promise (raised, dividers not cards) ---------- */}
          <Band tone="surface" id="promise">
            <InView>
              <motion.div variants={fadeUp}>
                <Masthead
                  index="06"
                  kicker="The promise"
                  title="Your data stays yours"
                  intro="A tool you trust with everything has to earn it. Here’s the deal."
                  center
                />
              </motion.div>
              <motion.div
                variants={staggerTight}
                className="divide-hairline mt-12 grid gap-10 sm:grid-cols-3 sm:gap-0 sm:divide-x"
              >
                {PRIVACY.map(({ icon: Icon, title, body }) => (
                  <motion.div
                    key={title}
                    variants={fadeUp}
                    className="sm:px-7 sm:first:pl-0 sm:last:pr-0"
                  >
                    <span className="text-accent">
                      <Icon size={22} />
                    </span>
                    <h3 className="text-ink mt-3 font-serif text-[15px] font-semibold">
                      {title}
                    </h3>
                    <p className="text-ink-muted mt-1 text-[13.5px] leading-relaxed">
                      {body}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </InView>
          </Band>

          {/* ---------- the idea (display pull-quote over a parallax photo) ---------- */}
          <section className="relative isolate overflow-hidden">
            <ParallaxPhoto src={photo('misty-pines')} />
            <div
              aria-hidden
              className="absolute inset-0 -z-10 bg-gradient-to-b from-black/80 via-black/70 to-black/85"
            />
            <InView className="mx-auto w-full max-w-3xl px-4 py-28 text-center sm:px-6 sm:py-36">
              <motion.span
                variants={fadeIn}
                className="text-[11px] font-semibold tracking-[0.16em] text-white/70 uppercase"
              >
                The idea
              </motion.span>
              <motion.p
                variants={fadeUp}
                className="mt-6 font-serif text-2xl leading-snug text-balance text-white drop-shadow-sm sm:text-[34px]"
              >
                Keep the middle of the page for the work. Let everything else live in the
                margin, close at hand and never in the way.
              </motion.p>
              <motion.p
                variants={fadeUp}
                className="mx-auto mt-6 max-w-lg text-[15px] leading-relaxed text-white/75"
              >
                No feed deciding what you see. No streak keeping score. No red badges. A
                quiet tool that simply waits for you to come back.
              </motion.p>
            </InView>
          </section>

          {/* ---------- faq (single-column, borderless accordion) ---------- */}
          <Band tone="tint" id="faq">
            <InView className="mx-auto max-w-2xl">
              <motion.div variants={fadeUp}>
                <Masthead
                  index="07"
                  kicker="Details"
                  title="Questions, answered"
                  center
                />
              </motion.div>
              <motion.div variants={staggerTight} className="mt-10 flex flex-col gap-2.5">
                {FAQ.map(({ q, a }, i) => (
                  <motion.div key={q} variants={fadeUp}>
                    <FaqItem
                      q={q}
                      a={a}
                      open={openFaq === i}
                      onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </InView>
          </Band>
        </main>

        {/* ---------- closing cta (photo under an accent wash) ---------- */}
        <section className="bg-accent text-accent-fg relative isolate overflow-hidden">
          <Image
            src={photo('alpine-lake')}
            alt=""
            fill
            sizes="100vw"
            className="-z-10 object-cover opacity-25 mix-blend-luminosity"
          />
          <InView className="mx-auto flex w-full max-w-6xl flex-col items-center gap-5 px-4 py-20 text-center sm:px-6 sm:py-28">
            <motion.h2
              variants={fadeUp}
              className="font-serif text-3xl font-semibold tracking-tight text-balance sm:text-5xl"
            >
              Start with a clear page.
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-accent-fg/80 max-w-md text-[15px] leading-relaxed text-pretty"
            >
              Free to use, yours to export, quiet by design. Set the day down and get back
              to the work that needs you.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-2">
              <CtaLink href={primary.href} variant="invert">
                {primary.label}
                <ArrowRight size={16} />
              </CtaLink>
            </motion.div>
          </InView>
        </section>

        {/* ---------- footer ---------- */}
        <footer className="bg-paper">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="flex flex-col gap-12 md:flex-row md:justify-between">
              {/* brand */}
              <div className="max-w-xs">
                <span className="text-ink inline-flex items-center gap-2">
                  <LogoMark size={26} />
                  <span className="font-serif text-lg font-semibold tracking-tight">
                    Margin
                  </span>
                </span>
                <p className="text-ink-muted mt-3 text-[13.5px] leading-relaxed">
                  Room to think — your tasks, notes, journal, habits, and money, set down
                  so your mind doesn&rsquo;t have to hold them.
                </p>
              </div>

              {/* links */}
              <div className="grid grid-cols-2 gap-x-14 gap-y-8">
                <div>
                  <p className="text-ink-faint mb-3 text-[11px] font-semibold tracking-[0.14em] uppercase">
                    Explore
                  </p>
                  <ul className="text-ink-muted flex flex-col gap-2.5 text-[13.5px]">
                    <li>
                      <a href="#tour" className="hover:text-ink transition-colors">
                        The tour
                      </a>
                    </li>
                    <li>
                      <a href="#toolkit" className="hover:text-ink transition-colors">
                        Features
                      </a>
                    </li>
                    <li>
                      <a href="#promise" className="hover:text-ink transition-colors">
                        Privacy
                      </a>
                    </li>
                    <li>
                      <a href="#faq" className="hover:text-ink transition-colors">
                        FAQ
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="text-ink-faint mb-3 text-[11px] font-semibold tracking-[0.14em] uppercase">
                    Get started
                  </p>
                  <ul className="text-ink-muted flex flex-col gap-2.5 text-[13.5px]">
                    {isAuthenticated ? (
                      <li>
                        <Link href="/home" className="hover:text-ink transition-colors">
                          Open dashboard
                        </Link>
                      </li>
                    ) : (
                      <>
                        <li>
                          <Link
                            href="/register"
                            className="hover:text-ink transition-colors"
                          >
                            Create account
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/login"
                            className="hover:text-ink transition-colors"
                          >
                            Log in
                          </Link>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* baseline */}
            <div className="text-ink-faint mt-14 flex flex-col items-center justify-between gap-4 text-[12px] sm:flex-row">
              <span>© {new Date().getFullYear()} Margin</span>
              <span className="inline-flex items-center gap-2">
                <span className="bg-success size-1.5 rounded-full" />
                Quiet by design
              </span>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="hover:text-ink inline-flex items-center gap-1.5 transition-colors"
              >
                Back to top <ArrowUp size={13} />
              </button>
            </div>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}
