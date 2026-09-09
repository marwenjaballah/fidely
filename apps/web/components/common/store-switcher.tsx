'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, Coffee, Plus, Store as StoreIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMerchantStore, type Store } from '@/store/merchant-store'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { CreateStoreDialog } from './create-store-dialog'

interface StoreSwitcherProps {
  variant?: 'sidebar' | 'header'
  className?: string
}

export function StoreSwitcher({ variant = 'sidebar', className }: StoreSwitcherProps) {
  const { stores, activeStore, setActiveStore, fetchStores } = useMerchantStore()
  const { isMobile, state: sidebarState } = useSidebar()
  const [createOpen, setCreateOpen] = React.useState(false)

  React.useEffect(() => {
    fetchStores()
  }, [fetchStores])

  // If used in top header or outside sidebar
  if (variant === 'header') {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                'flex items-center gap-2 rounded-lg border border-border/70 bg-background/80 px-3 py-1.5 text-sm font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                className
              )}
            >
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Coffee className="h-3.5 w-3.5" />
              </div>
              <span className="truncate max-w-[140px] text-left font-semibold">
                {activeStore?.name || 'Select Coffee Shop'}
              </span>
              <ChevronsUpDown className="h-3.5 w-3.5 opacity-60 ml-1 shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 p-1.5 shadow-lg">
            <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              My Coffee Shops
            </DropdownMenuLabel>
            {stores.length === 0 ? (
              <div className="px-2 py-2 text-xs text-muted-foreground text-center">
                No coffee shops yet
              </div>
            ) : (
              stores.map((store) => {
                const isSelected = activeStore?.id === store.id
                return (
                  <DropdownMenuItem
                    key={store.id}
                    onClick={() => setActiveStore(store.id)}
                    className={cn(
                      'flex items-center justify-between gap-2 px-2.5 py-2 cursor-pointer rounded-md text-sm',
                      isSelected && 'bg-accent font-semibold text-accent-foreground'
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Coffee className="h-3.5 w-3.5" />
                      </div>
                      <div className="truncate text-left">
                        <div className="truncate">{store.name}</div>
                        <div className="text-[10px] text-muted-foreground font-normal truncate">
                          /{store.slug}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check className="h-4 w-4 shrink-0 text-primary" />}
                  </DropdownMenuItem>
                )
              })
            )}
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 px-2.5 py-2 cursor-pointer rounded-md text-sm text-primary font-medium hover:bg-primary/10"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-dashed border-primary/40">
                <Plus className="h-3.5 w-3.5" />
              </div>
              <span>Add Coffee Shop</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <CreateStoreDialog open={createOpen} onOpenChange={setCreateOpen} />
      </>
    )
  }

  // Sidebar variant
  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent/60 transition-colors"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold shadow-xs">
                  {activeStore ? (
                    <Coffee className="size-4" />
                  ) : (
                    <StoreIcon className="size-4" />
                  )}
                </div>
                {sidebarState !== 'collapsed' && (
                  <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                    <span className="truncate font-semibold text-sidebar-foreground">
                      {activeStore?.name || 'Select Coffee Shop'}
                    </span>
                    <span className="truncate text-xs text-sidebar-foreground/60 font-normal">
                      {activeStore ? `fidely.app/${activeStore.slug}` : `${stores.length} coffee shop${stores.length === 1 ? '' : 's'}`}
                    </span>
                  </div>
                )}
                {sidebarState !== 'collapsed' && (
                  <ChevronsUpDown className="ml-auto size-4 shrink-0 text-sidebar-foreground/60" />
                )}
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-60 rounded-lg p-1.5 shadow-xl border border-sidebar-border/50"
              align="start"
              side={isMobile ? 'bottom' : 'right'}
              sideOffset={4}
            >
              <DropdownMenuLabel className="px-2.5 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                My Coffee Shops ({stores.length})
              </DropdownMenuLabel>
              {stores.length === 0 ? (
                <div className="px-3 py-3 text-xs text-muted-foreground text-center">
                  No coffee shops created yet.
                </div>
              ) : (
                stores.map((store) => {
                  const isSelected = activeStore?.id === store.id
                  return (
                    <DropdownMenuItem
                      key={store.id}
                      onClick={() => setActiveStore(store.id)}
                      className={cn(
                        'flex items-center justify-between gap-3 px-2.5 py-2 cursor-pointer rounded-md text-sm transition-colors',
                        isSelected && 'bg-sidebar-accent font-semibold text-sidebar-accent-foreground'
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <Coffee className="h-4 w-4" />
                        </div>
                        <div className="truncate text-left">
                          <div className="truncate font-medium text-foreground">{store.name}</div>
                          <div className="text-[11px] text-muted-foreground font-normal truncate">
                            fidely.app/{store.slug}
                          </div>
                        </div>
                      </div>
                      {isSelected && <Check className="h-4 w-4 shrink-0 text-primary" />}
                    </DropdownMenuItem>
                  )
                })
              )}
              <DropdownMenuSeparator className="my-1.5" />
              <DropdownMenuItem
                onClick={() => setCreateOpen(true)}
                className="flex items-center gap-2.5 px-2.5 py-2 cursor-pointer rounded-md text-sm text-primary font-medium hover:bg-primary/10"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-dashed border-primary/50 text-primary">
                  <Plus className="h-4 w-4" />
                </div>
                <span>Create New Coffee Shop</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <CreateStoreDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  )
}
