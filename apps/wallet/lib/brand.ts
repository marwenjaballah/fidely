/**
 * @file lib/brand.ts
 *
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  FIDELY BRAND CONFIGURATION — single source of truth        ║
 * ║  To swap the logo app-wide, change BRAND_LOGO_SRC below.    ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

/** Display name — never translated */
export const BRAND_NAME = 'Fidely' as const

/**
 * Path to the primary logo image (served from /public).
 * Change this one value to replace the logo everywhere in the app.
 */
export const BRAND_LOGO_SRC = '/logo-Fidely.png' as const

/**
 * Optional logo variant with text/wordmark included in the image.
 */
export const BRAND_LOGO_WITH_NAME_SRC = '/logowithname-Photoroom.png' as const

/** Alt text for the logo image */
export const BRAND_LOGO_ALT = 'Fidely logo' as const

/** Short marketing tagline */
export const BRAND_TAGLINE = 'Digital Loyalty Platform' as const
