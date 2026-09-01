/**
 * Fixed, non-interactive background: a faint dot grid, one soft warm glow, and
 * a barely-there grain. Pure CSS/SVG — no raster assets. Adapts to the theme
 * via the palette variables.
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
      <svg className="absolute inset-0 h-full w-full opacity-[0.025] dark:opacity-[0.04]">
        <filter id="app-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#app-grain)" />
      </svg>
    </div>
  );
}
