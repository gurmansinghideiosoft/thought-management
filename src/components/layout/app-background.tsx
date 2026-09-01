// A small SVG noise tile, rasterised once by the browser as a background image
// rather than composited as a live filter over the whole viewport every frame.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/**
 * Fixed, non-interactive background: a faint dot grid, one soft warm glow, and
 * a barely-there grain. Adapts to the theme via the palette variables.
 */
export function AppBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* dot grid */}
      <div
        className="absolute inset-0 opacity-[0.5] dark:opacity-[0.35]"
        style={{
          backgroundImage:
            'radial-gradient(color-mix(in oklab, var(--foreground) 22%, transparent) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
          maskImage: 'radial-gradient(ellipse 90% 60% at 50% 0%, black, transparent 75%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 90% 60% at 50% 0%, black, transparent 75%)',
        }}
      />
      {/* warm glow, top-right */}
      <div
        className="absolute -top-48 -right-40 h-[36rem] w-[36rem] rounded-full opacity-[0.14] blur-3xl dark:opacity-[0.18]"
        style={{ background: 'radial-gradient(circle, var(--accent), transparent 70%)' }}
      />
      {/* grain */}
      <div
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
        style={{ backgroundImage: GRAIN, backgroundRepeat: 'repeat' }}
      />
    </div>
  );
}
