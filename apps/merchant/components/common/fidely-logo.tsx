/**
 * @file components/common/fidely-logo.tsx
 *
 * Reusable FidelyLogo component — renders the brand logo image inside
 * a styled container. Import this instead of hard-coding icons or images
 * so that swapping the logo only requires editing lib/brand.ts.
 *
 * Usage:
 *   <FidelyLogo />                          → default 40×40 rounded container
 *   <FidelyLogo size="sm" />               → 32×32
 *   <FidelyLogo size="lg" />               → 48×48
 *   <FidelyLogo size="xl" />               → 64×64
 *   <FidelyLogo variant="solid" />         → primary-coloured background
 *   <FidelyLogo variant="subtle" />        → light tinted background (default)
 *   <FidelyLogo variant="ghost" />         → transparent background
 *   <FidelyLogo className="shadow-xl" />   → extra Tailwind classes on wrapper
 */

import Image from 'next/image'
import { BRAND_LOGO_ALT, BRAND_LOGO_SRC } from '@/lib/brand'
import { cn } from '@/lib/utils'

type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
type LogoVariant = 'solid' | 'subtle' | 'ghost' | 'none'

interface FidelyLogoProps {
  /** Visual container size */
  size?: LogoSize
  /** Background style of the container */
  variant?: LogoVariant
  /** Optional custom image src override */
  src?: string
  /** Extra Tailwind classes applied to the outer wrapper */
  className?: string
  /** Extra classes for image element */
  imageClassName?: string
  /** Whether Next.js image priority is active */
  priority?: boolean
}

const sizeMap: Record<LogoSize, { wrapper: string; img: number }> = {
  xs:  { wrapper: 'h-6 w-6 rounded-lg',     img: 18 },
  sm:  { wrapper: 'h-8 w-8 rounded-lg',     img: 24 },
  md:  { wrapper: 'h-10 w-10 rounded-xl',   img: 28 },
  lg:  { wrapper: 'h-12 w-12 rounded-xl',   img: 34 },
  xl:  { wrapper: 'h-16 w-16 rounded-2xl',  img: 46 },
  '2xl': { wrapper: 'h-24 w-24 rounded-3xl', img: 72 },
}

const variantMap: Record<LogoVariant, string> = {
  solid:  'bg-primary text-primary-foreground shadow-md shadow-primary/25',
  subtle: 'bg-primary/10 ring-1 ring-primary/20',
  ghost:  'bg-transparent',
  none:   '',
}

export function FidelyLogo({
  size = 'md',
  variant = 'subtle',
  src = BRAND_LOGO_SRC,
  className,
  imageClassName,
  priority = true,
}: FidelyLogoProps) {
  const { wrapper, img } = sizeMap[size]
  const variantClass = variantMap[variant]

  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center transition-colors overflow-hidden',
        wrapper,
        variantClass,
        className,
      )}
    >
      <Image
        src={src}
        alt={BRAND_LOGO_ALT}
        width={img}
        height={img}
        className={cn('object-contain', imageClassName)}
        priority={priority}
      />
    </span>
  )
}
