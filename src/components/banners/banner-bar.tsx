'use client';

import { ImageIcon } from 'lucide-react';
import Image from 'next/image';

import { BannerPicker } from '@/components/banners/banner-picker';
import { bannerFor } from '@/lib/banners';
import { cn } from '@/lib/cn';

/**
 * A full-width hero image the user picks (home + journal). The image is fixed
 * until they change it via the hover control.
 */
export function BannerBar({
  value,
  onChange,
  children,
  className,
}: {
  value: string | null;
  onChange: (id: string | null) => void;
  children?: React.ReactNode;
  className?: string;
}) {
  const banner = bannerFor(value);

  return (
    <div
      className={cn(
        'group bg-surface-2 relative w-full overflow-hidden',
        'h-[33vh] max-h-[420px] min-h-[200px]',
        className,
      )}
    >
      <Image
        src={banner.src}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/5" />

      <BannerPicker
        value={value}
        onSelect={onChange}
        trigger={
          <button
            type="button"
            className="bg-overlay/80 text-ink hover:bg-overlay absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium opacity-0 shadow-sm backdrop-blur transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          >
            <ImageIcon size={13} />
            Change background
          </button>
        }
      />

      {children ? (
        <div className="absolute right-0 bottom-0 left-0 p-5 sm:p-8">{children}</div>
      ) : null}
    </div>
  );
}
