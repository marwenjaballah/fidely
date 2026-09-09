/** Same mark as navbar `LayoutGrid` in `bg-primary/15` chip — keep in sync with `apps/web/app/icon.svg`. */
export const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" role="img" aria-label="API">
  <rect width="24" height="24" rx="7" fill="oklch(0.6959 0.1491 162.4796 / 0.15)"/>
  <g stroke="oklch(0.6959 0.1491 162.4796)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect width="7" height="7" x="3" y="3" rx="1"/>
    <rect width="7" height="7" x="14" y="3" rx="1"/>
    <rect width="7" height="7" x="14" y="14" rx="1"/>
    <rect width="7" height="7" x="3" y="14" rx="1"/>
  </g>
</svg>
`

export const FAVICON_HEADERS = {
  'Content-Type': 'image/svg+xml; charset=utf-8',
  'Cache-Control': 'public, max-age=86400, immutable',
} as const
