/**
 * Twenty full-bleed Unsplash photos for the home hero. One is picked at random
 * on load and they cross-fade while the page is open. If a URL ever 404s the
 * banner component falls back to the next one.
 */
const PARAMS = '?auto=format&fit=crop&w=1920&q=70';

export const HERO_BANNERS: readonly string[] = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
  'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d',
  'https://images.unsplash.com/photo-1501854140801-50d01698950b',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e',
  'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5',
  'https://images.unsplash.com/photo-1439853949127-fa647821eba0',
  'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8',
  'https://images.unsplash.com/photo-1426604966848-d7adac402bff',
  'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd',
  'https://images.unsplash.com/photo-1475924156734-496f6968c780',
  'https://images.unsplash.com/photo-1505142468610-359e7d316be0',
  'https://images.unsplash.com/photo-1490730141103-6cac27aaab94',
  'https://images.unsplash.com/photo-1444927714506-8492d94b4e3d',
  'https://images.unsplash.com/photo-1433086966358-54859d0ed716',
  'https://images.unsplash.com/photo-1465101162946-4377e57745c3',
  'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3',
  'https://images.unsplash.com/photo-1454372182658-c712e4c5a1db',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429',
].map((base) => `${base}${PARAMS}`);
