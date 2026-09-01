'use client';

import { format } from 'date-fns';
import { useEffect, useState } from 'react';

import { BannerBar } from '@/components/banners/banner-bar';

export function HeroBanner({
  name,
  bannerId,
  onChangeBanner,
}: {
  name: string;
  bannerId: string | null;
  onChangeBanner: (id: string | null) => void;
}) {
  const firstName = name.trim().split(/\s+/)[0] || name.trim() || 'there';

  return (
    <BannerBar value={bannerId} onChange={onChangeBanner}>
      <h1 className="font-serif text-2xl font-semibold text-white drop-shadow sm:text-3xl">
        Welcome back, {firstName}
      </h1>
      <Clock />
    </BannerBar>
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
