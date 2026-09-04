'use client';

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from 'framer-motion';
import Image from 'next/image';
import { useRef } from 'react';

import { cn } from '@/lib/cn';

/** A slow, confident ease — the "settle into place" curve modern sites lean on. */
export const EASE = [0.22, 1, 0.36, 1] as const;

/** Rise + fade + un-blur. The workhorse for headings and content blocks. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.85, ease: EASE },
  },
};

/** A gentler fade for small accents (kickers, chips, arrows). */
export const fadeIn: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

/** For a headline line masked by an `overflow-hidden` parent. */
export const lineUp: Variants = {
  hidden: { y: '120%' },
  visible: { y: 0, transition: { duration: 0.9, ease: EASE } },
};

/** The product screenshot — more travel + a settle from slightly small. */
export const riseIn: Variants = {
  hidden: { opacity: 0, y: 48, scale: 0.965 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 1, ease: EASE },
  },
};

/** Container that releases its children one after another. */
export const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.06 } },
};

/** Tighter stagger for dense grids (cards, list rows). */
export const staggerTight: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};

const TAGS = {
  div: motion.div,
  section: motion.section,
  ol: motion.ol,
  ul: motion.ul,
} as const;

/**
 * Runs its `stagger` timeline the first time it scrolls into view, then stays
 * put. Children opt in with `variants={fadeUp}` (etc.) on a `motion.*` element.
 */
export function InView({
  children,
  className,
  as = 'div',
  variants = stagger,
  amount = 0.2,
}: {
  children: React.ReactNode;
  className?: string;
  as?: keyof typeof TAGS;
  variants?: Variants;
  amount?: number;
}) {
  const Tag = TAGS[as];
  return (
    <Tag
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
    >
      {children}
    </Tag>
  );
}

/** A full-bleed photo that drifts slightly against the scroll. */
export function ParallaxPhoto({ src, className }: { src: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], ['-6%', '6%']);
  return (
    <div
      ref={ref}
      aria-hidden
      className={cn('absolute inset-0 -z-10 overflow-hidden', className)}
    >
      <motion.div style={reduced ? undefined : { y }} className="absolute inset-[-7%]">
        <Image src={src} alt="" fill sizes="100vw" className="object-cover" />
      </motion.div>
    </div>
  );
}

export { motion };
