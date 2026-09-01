'use client';

import { format } from 'date-fns';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import { HERO_BANNERS } from '@/lib/home/banners';

const ROTATE_MS = 11_000;
const randomIndex = () => Math.floor(Math.random() * HERO_BANNERS.length);

export function HeroBanner({ name }: { name: string }) {
  // `(app)` routes render a spinner on the server, so a random first image here
  // never causes a hydration mismatch.
  const [{ front, back }, setPair] = useState(() => {
    const i = randomIndex();
    return { front: i, back: i };
  });
  const [frontReady, setFrontReady] = useState(true);
  const failed = useRef<Set<number>>(new Set());

  useEffect(() => {
    const id = setInterval(() => {
      setFrontReady(false);
      setPair((cur) => {
        let next = (cur.front + 1) % HERO_BANNERS.length;
        for (let n = 0; n < HERO_BANNERS.length && failed.current.has(next); n += 1) {
          next = (next + 1) % HERO_BANNERS.length;
        }
        return { front: next, back: cur.front };
      });
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  const firstName = name.trim().split(/\s+/)[0] || name.trim() || 'there';

  return (
    <div className="bg-surface-2 relative h-[33vh] max-h-[420px] min-h-[220px] w-full overflow-hidden">
      {/* settled image underneath */}
      <Image
        src={HERO_BANNERS[back] ?? HERO_BANNERS[0]}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {/* incoming image fades in on top */}
      <Image
        key={front}
        src={HERO_BANNERS[front] ?? HERO_BANNERS[0]}
        alt=""
        fill
        sizes="100vw"
        onLoad={() => setFrontReady(true)}
        onError={() => {
          failed.current.add(front);
          setFrontReady(true);
        }}
        className={`object-cover transition-opacity duration-1000 ${
          frontReady ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* scrim + greeting */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/5" />
      <div className="absolute right-0 bottom-0 left-0 p-5 sm:p-8">
        <h1 className="font-serif text-2xl font-semibold text-white drop-shadow sm:text-3xl">
          Welcome back, {firstName}
        </h1>
        <Clock />
      </div>
    </div>
  );
}

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <p className="mt-1 text-[13px] font-medium text-white/85 sm:text-sm">
      {format(now, 'EEEE, MMMM d')} · {format(now, 'h:mm a')}
    </p>
  );
}
