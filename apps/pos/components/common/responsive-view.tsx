'use client'

import React, { useEffect, useState } from 'react'
import { useIsMobile } from '@/components/ui/use-mobile'

interface ResponsiveViewProps {
  mobile: React.ReactNode
  desktop: React.ReactNode
  className?: string
}

/**
 * Hydration-safe responsive dispatcher.
 * 
 * During SSR and initial hydration, it renders both views wrapped in CSS media-query
 * classes (block md:hidden / hidden md:block) to prevent layout shifts.
 * Once mounted on the client, it evaluates `useIsMobile()` and can optimize accordingly.
 */
export function ResponsiveView({ mobile, desktop, className = '' }: ResponsiveViewProps) {
  const isMobile = useIsMobile()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className={className}>
        <div className="block md:hidden">{mobile}</div>
        <div className="hidden md:block">{desktop}</div>
      </div>
    )
  }

  return (
    <div className={className}>
      {isMobile ? mobile : desktop}
    </div>
  )
}
