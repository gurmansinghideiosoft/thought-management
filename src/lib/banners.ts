/**
 * The fixed set of Unsplash hero photos. The user picks one for their home
 * banner, their journal banner, and per-conversation as a chat wallpaper. The
 * stored value is the `id` (an opaque slug); unknown / null falls back to the
 * first entry.
 */

export interface Banner {
  id: string;
  label: string;
  /** Unsplash photo id (the part after `photo-`). */
  photo: string;
}

const CATALOG: readonly Banner[] = [
  { id: 'mountain-lake', label: 'Mountain lake', photo: '1506905925346-21bda4d32df4' },
  { id: 'foggy-forest', label: 'Foggy forest', photo: '1470071459604-3b5ec3a7fe05' },
  { id: 'sunlit-woods', label: 'Sunlit woods', photo: '1441974231531-c6227db76b6e' },
  { id: 'forest-path', label: 'Forest path', photo: '1447752875215-b2761acb3c5d' },
  { id: 'green-hills', label: 'Green hills', photo: '1501854140801-50d01698950b' },
  { id: 'golden-field', label: 'Golden field', photo: '1472214103451-9374bd1c798e' },
  { id: 'misty-pines', label: 'Misty pines', photo: '1418065460487-3e41a6c84dc5' },
  { id: 'alpine-lake', label: 'Alpine lake', photo: '1439853949127-fa647821eba0' },
  { id: 'red-canyon', label: 'Red canyon', photo: '1470252649378-9c29740c9fa8' },
  { id: 'valley-river', label: 'Valley river', photo: '1426604966848-d7adac402bff' },
  { id: 'calm-shore', label: 'Calm shore', photo: '1470240731273-7821a6eeb6bd' },
  { id: 'ocean-dusk', label: 'Ocean dusk', photo: '1475924156734-496f6968c780' },
  { id: 'coast-aerial', label: 'Coast from above', photo: '1505142468610-359e7d316be0' },
  { id: 'sunset-meadow', label: 'Sunset meadow', photo: '1490730141103-6cac27aaab94' },
  { id: 'mountain-dawn', label: 'Mountain dawn', photo: '1444927714506-8492d94b4e3d' },
  { id: 'waterfall', label: 'Waterfall', photo: '1433086966358-54859d0ed716' },
  { id: 'night-sky', label: 'Night sky', photo: '1465101162946-4377e57745c3' },
  { id: 'blue-ridges', label: 'Blue ridges', photo: '1444703686981-a3abbc4d4fe3' },
  { id: 'snow-forest', label: 'Snowy forest', photo: '1454372182658-c712e4c5a1db' },
  { id: 'desert-road', label: 'Desert road', photo: '1500534314209-a25ddb2bd429' },
];

const url = (photo: string, w: number): string =>
  `https://images.unsplash.com/photo-${photo}?auto=format&fit=crop&q=70&w=${String(w)}`;

export interface ResolvedBanner extends Banner {
  /** Full-bleed hero source. */
  src: string;
  /** Small preview for the picker grid. */
  thumb: string;
}

export const BANNERS: readonly ResolvedBanner[] = CATALOG.map((b) => ({
  ...b,
  src: url(b.photo, 1920),
  thumb: url(b.photo, 480),
}));

export const DEFAULT_BANNER = BANNERS[0]!;

/** Resolve a stored id (or null) to a banner, falling back to the default. */
export const bannerFor = (id: string | null | undefined): ResolvedBanner =>
  BANNERS.find((b) => b.id === id) ?? DEFAULT_BANNER;
