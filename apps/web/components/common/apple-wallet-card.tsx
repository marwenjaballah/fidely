'use client'

import React, { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import {
  Coffee,
  Sparkles,
  Info,
  RotateCcw,
  Check,
  Copy,
  Maximize2,
  Gift,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export interface AppleWalletPassProps {
  storeName: string
  logoUrl?: string | null
  primaryColor?: string
  pointsBalance: number
  pointsPerTnd: number
  qrCodeToken?: string
  memberName?: string
  memberSince?: string
  rewardsCount?: number
  nextRewardName?: string
  nextRewardCost?: number
  showQr?: boolean
  interactive?: boolean
  className?: string
}

export function AppleWalletPass({
  storeName,
  logoUrl,
  primaryColor = '#D97706',
  pointsBalance,
  pointsPerTnd,
  qrCodeToken,
  memberName,
  memberSince,
  rewardsCount = 0,
  nextRewardName,
  nextRewardCost,
  showQr = true,
  interactive = true,
  className = '',
}: AppleWalletPassProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [copiedToken, setCopiedToken] = useState(false)
  const [qrModalOpen, setQrModalOpen] = useState(false)

  const handleCopyToken = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!qrCodeToken) return
    navigator.clipboard.writeText(qrCodeToken)
    setCopiedToken(true)
    setTimeout(() => setCopiedToken(false), 2000)
  }

  // Calculate progress to next reward if available
  const progressPct =
    nextRewardCost && nextRewardCost > 0
      ? Math.min(100, Math.round((pointsBalance / nextRewardCost) * 100))
      : 100

  return (
    <div className={`relative w-full max-w-[400px] mx-auto select-none ${className}`} style={{ perspective: '1200px' }}>
      {/* 3D Card Flipper Container */}
      <div
        className="relative w-full transition-transform duration-700 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* ── FRONT OF PASS ── */}
        <div
          className="w-full rounded-[28px] text-white shadow-2xl relative overflow-hidden border border-white/20 transition-all"
          style={{
            backgroundColor: primaryColor,
            backgroundImage: `
              radial-gradient(circle at 10% 10%, rgba(255, 255, 255, 0.28) 0%, transparent 40%),
              radial-gradient(circle at 90% 90%, rgba(0, 0, 0, 0.35) 0%, transparent 50%),
              linear-gradient(145deg, rgba(255, 255, 255, 0.12) 0%, rgba(0, 0, 0, 0.22) 100%)
            `,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.15) inset',
            backfaceVisibility: 'hidden',
          }}
        >
          {/* Top Apple Wallet Card Header */}
          <div className="p-5 pb-3 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center font-bold text-xl overflow-hidden border border-white/25 shrink-0 shadow-xs">
                {logoUrl ? (
                  <img src={logoUrl} alt={storeName} className="h-full w-full object-cover" />
                ) : (
                  <Coffee className="h-5 w-5 text-white" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold tracking-widest uppercase text-white/70 leading-none">
                  Loyalty Pass
                </p>
                <h3 className="text-base font-extrabold tracking-tight truncate leading-tight mt-1 text-white">
                  {storeName || 'Coffee Shop'}
                </h3>
              </div>
            </div>

            {/* Top Right Header Field */}
            <div className="flex items-center gap-1.5">
              <div className="text-right">
                <p className="text-[9px] font-bold uppercase tracking-wider text-white/70">Rate</p>
                <p className="text-xs font-bold text-white leading-tight">{pointsPerTnd} pts/TND</p>
              </div>
              {interactive && (
                <button
                  type="button"
                  onClick={() => setIsFlipped(true)}
                  className="h-7 w-7 rounded-full bg-white/15 hover:bg-white/25 transition flex items-center justify-center text-white/90 ml-1.5"
                  title="Pass Details"
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Primary Hero Section: Big Points Balance */}
          <div className="px-6 py-5 flex items-baseline justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/75">
                Current Points
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-xs">
                  {pointsBalance.toLocaleString()}
                </span>
                <span className="text-sm font-semibold uppercase tracking-wider text-white/80">PTS</span>
              </div>
            </div>

            {rewardsCount > 0 && (
              <div className="flex flex-col items-end">
                <Badge className="bg-emerald-500/90 text-white border-0 text-[10px] font-bold shadow-xs px-2.5 py-0.5 gap-1 backdrop-blur-xs">
                  <Gift className="h-3 w-3" />
                  {rewardsCount} Ready
                </Badge>
              </div>
            )}
          </div>

          {/* Auxiliary Info Grid (Classic Apple Wallet 3-column metadata) */}
          <div className="px-6 py-3 grid grid-cols-3 gap-2 bg-black/15 backdrop-blur-xs border-y border-white/10 text-left">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-white/60">Member</p>
              <p className="text-xs font-bold text-white truncate mt-0.5">
                {memberName || 'Customer'}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-white/60">Status</p>
              <p className="text-xs font-bold text-white truncate mt-0.5 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-300" /> Active
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold uppercase tracking-wider text-white/60">Joined</p>
              <p className="text-xs font-bold text-white truncate mt-0.5">
                {memberSince || 'Active'}
              </p>
            </div>
          </div>

          {/* Next Perk Goal Progress */}
          {nextRewardName && (
            <div className="px-6 py-2.5 bg-black/10 text-xs text-white/90 border-b border-white/10">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-semibold truncate">Target: {nextRewardName}</span>
                <span className="font-bold shrink-0 ml-2">
                  {nextRewardCost ? Math.max(0, nextRewardCost - pointsBalance) : 0} pts left
                </span>
              </div>
              <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-white h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}

          {/* Perforated Tear Notch Line (Apple Wallet Signature) */}
          <div className="relative h-4 flex items-center justify-between">
            {/* Left circular cutout notch */}
            <div className="h-4 w-2 rounded-r-full bg-background border-r border-border/60 -ml-[1px]" />
            {/* Dashed perforated line */}
            <div className="flex-1 border-b border-dashed border-white/25 mx-2" />
            {/* Right circular cutout notch */}
            <div className="h-4 w-2 rounded-l-full bg-background border-l border-border/60 -mr-[1px]" />
          </div>

          {/* QR Code Barcode Presentation Zone */}
          {showQr && qrCodeToken && (
            <div className="p-6 pt-3 pb-6 flex flex-col items-center justify-center text-center">
              <div
                onClick={() => setQrModalOpen(true)}
                className="p-3 bg-white rounded-2xl shadow-lg border border-white/40 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform group"
                title="Tap for full brightness pass"
              >
                <QRCodeSVG
                  value={qrCodeToken}
                  size={155}
                  level="Q"
                  includeMargin={false}
                />
                <p className="text-[9px] font-bold text-slate-800 tracking-wider uppercase mt-1.5 opacity-80 group-hover:opacity-100">
                  Tap to Enlarge
                </p>
              </div>

              <p className="text-[11px] text-white/80 font-medium mt-3">
                Hold near scanner at barista checkout
              </p>

              {/* Fullscreen QR Modal */}
              <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
                <DialogContent className="sm:max-w-xs text-center p-6 bg-white dark:bg-zinc-950">
                  <DialogHeader>
                    <DialogTitle className="text-center">{storeName}</DialogTitle>
                    <DialogDescription className="text-center text-xs">
                      Maximum brightness pass for scanner
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col items-center justify-center py-4">
                    <div className="p-4 bg-white rounded-2xl shadow-xl border">
                      <QRCodeSVG value={qrCodeToken} size={220} level="Q" includeMargin={true} />
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCopyToken}
                        className="gap-1.5 text-xs"
                      >
                        {copiedToken ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        {copiedToken ? 'Copied ID' : 'Copy Pass ID'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {!showQr && (
            <div className="p-5 text-center text-xs text-white/75 font-medium">
              Present your phone at checkout to collect loyalty points automatically.
            </div>
          )}
        </div>

        {/* ── BACK OF PASS ── */}
        <div
          className="absolute inset-0 w-full rounded-[28px] text-white shadow-2xl p-6 flex flex-col justify-between border border-white/20"
          style={{
            backgroundColor: '#18181B',
            backgroundImage: `
              radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.08) 0%, transparent 40%),
              linear-gradient(160deg, #27272A 0%, #18181B 100%)
            `,
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* Back Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                Pass Information
              </span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsFlipped(false)}
              className="h-7 px-2.5 text-xs text-white hover:bg-white/10 gap-1"
            >
              <RotateCcw className="h-3 w-3" /> Done
            </Button>
          </div>

          {/* Pass Details Body */}
          <div className="space-y-4 text-xs text-white/80 py-4 flex-1 overflow-y-auto">
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Business</p>
              <p className="font-semibold text-white">{storeName}</p>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Loyalty Policy</p>
              <p className="text-white/80 leading-relaxed">
                Earn {pointsPerTnd} points for every 1 TND spent. Points can be redeemed for exclusive beverages and perks at any partner location.
              </p>
            </div>

            {qrCodeToken && (
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Card ID Token</p>
                <p className="font-mono text-[11px] text-white/90 bg-white/5 p-2 rounded-lg break-all">
                  {qrCodeToken}
                </p>
              </div>
            )}

            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Automatic Updates</p>
              <p className="text-emerald-400 font-medium flex items-center gap-1">
                <Check className="h-3.5 w-3.5" /> Real-time balance synchronization enabled
              </p>
            </div>
          </div>

          {/* Back Footer */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-white/60">
            <span>Powered by Fidely</span>
            <button
              type="button"
              onClick={() => setIsFlipped(false)}
              className="text-white font-semibold hover:underline"
            >
              Flip back to pass
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
