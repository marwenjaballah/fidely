'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useMerchantStore } from '@/store/merchant-store'
import { Coffee, Loader2, Sparkles } from 'lucide-react'

interface CreateStoreDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateStoreDialog({ open, onOpenChange }: CreateStoreDialogProps) {
  const { createStore, loading, error } = useMerchantStore()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (!name.trim()) {
      setLocalError('Coffee shop name is required.')
      return
    }

    const candidateSlug = slug.trim() || name.trim()

    try {
      await createStore(name.trim(), candidateSlug)
      setName('')
      setSlug('')
      onOpenChange(false)
    } catch (err: any) {
      setLocalError(err?.message || 'Failed to create coffee shop.')
    }
  }

  const handleNameChange = (val: string) => {
    setName(val)
    const normalized = val
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    if (!slug || slug === normalized.slice(0, slug.length)) {
      setSlug(normalized)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Coffee className="h-5 w-5" />
              </div>
              <DialogTitle className="text-xl">Create Coffee Shop</DialogTitle>
            </div>
            <DialogDescription>
              Add a new coffee shop or branch to manage loyalty points, staff, and analytics.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-store-name" className="text-sm font-medium">
                Coffee Shop Name
              </Label>
              <Input
                id="create-store-name"
                placeholder="e.g. Blue Bottle Specialty Coffee"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-store-slug" className="text-sm font-medium">
                Store URL Identifier (Slug)
              </Label>
              <div className="flex items-center rounded-md border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
                <span className="font-mono text-muted-foreground/80 select-none">fidely.app/store/</span>
                <input
                  id="create-store-slug"
                  type="text"
                  className="w-full bg-transparent p-1 text-foreground font-mono font-medium outline-none"
                  placeholder="blue-bottle-coffee"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  required
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Unique public link for customer check-ins and passes. Duplicates automatically resolve safely.
              </p>
            </div>

            {(localError || error) && (
              <p className="text-xs font-medium text-destructive">
                {localError || error}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Create Coffee
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
