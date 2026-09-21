'use client'

import * as React from 'react'
import { toast as sonnerToast } from 'sonner'

export interface ToastProps {
  title?: React.ReactNode
  description?: React.ReactNode
  variant?: 'default' | 'destructive' | string
  action?: React.ReactNode
  [key: string]: any
}

export function useToast() {
  const toast = React.useCallback(({ title, description, variant, ...props }: ToastProps) => {
    if (variant === 'destructive') {
      return sonnerToast.error(title as string, {
        description: description as string,
        ...props,
      })
    }
    return sonnerToast.success(title as string, {
      description: description as string,
      ...props,
    })
  }, [])

  return {
    toast,
    dismiss: (toastId?: string) => sonnerToast.dismiss(toastId),
    toasts: [],
  }
}

export const toast = (props: ToastProps) => {
  if (props.variant === 'destructive') {
    return sonnerToast.error(props.title as string, {
      description: props.description as string,
    })
  }
  return sonnerToast.success(props.title as string, {
    description: props.description as string,
  })
}
