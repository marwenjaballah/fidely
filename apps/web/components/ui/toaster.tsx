'use client'

import { useToast } from '@/hooks/use-toast'
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast'
import {
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Info,
  Gift,
  QrCode,
  ShieldCheck,
} from 'lucide-react'

export function Toaster() {
  const { toasts } = useToast()

  const getToastIcon = (title?: React.ReactNode, variant?: string | null) => {
    const titleStr = typeof title === 'string' ? title.toLowerCase() : ''
    
    if (variant === 'destructive' || titleStr.includes('error') || titleStr.includes('failed')) {
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/20 text-red-400 ring-1 ring-red-500/30">
          <AlertTriangle className="h-4 w-4" />
        </div>
      )
    }

    if (titleStr.includes('qr') || titleStr.includes('pass') || titleStr.includes('scan')) {
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30">
          <QrCode className="h-4 w-4" />
        </div>
      )
    }

    if (titleStr.includes('reward') || titleStr.includes('point') || titleStr.includes('bonus')) {
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary ring-1 ring-primary/30">
          <Gift className="h-4 w-4" />
        </div>
      )
    }

    if (
      variant === 'success' ||
      titleStr.includes('success') ||
      titleStr.includes('refreshed') ||
      titleStr.includes('added') ||
      titleStr.includes('saved') ||
      titleStr.includes('updated') ||
      titleStr.includes('created') ||
      titleStr.includes('copied') ||
      titleStr.includes('welcome')
    ) {
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30">
          <CheckCircle2 className="h-4 w-4" />
        </div>
      )
    }

    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25">
        <Sparkles className="h-4 w-4" />
      </div>
    )
  }

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props} className="relative overflow-hidden group">
            {/* Top Specular Shimmer Line */}
            <div className="absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

            <div className="flex items-start gap-3 w-full">
              {getToastIcon(title, variant)}

              <div className="flex-1 min-w-0 pr-2">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>

            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
