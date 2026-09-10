'use client'

import { useEffect, useState } from 'react'
import { useMerchantStore, Reward } from '@/store/merchant-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import {
  Store,
  Palette,
  Coins,
  QrCode,
  Gift,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  Coffee,
  Smartphone,
  Save,
} from 'lucide-react'

const COLOR_PRESETS = [
  { name: 'Espresso', color: '#4A2C2A' },
  { name: 'Caramel', color: '#D97706' },
  { name: 'Terracotta', color: '#EA580C' },
  { name: 'Matcha', color: '#059669' },
  { name: 'Cobalt', color: '#2563EB' },
  { name: 'Berry', color: '#9333EA' },
  { name: 'Rose', color: '#E11D48' },
  { name: 'Charcoal', color: '#18181B' },
]

const MULTIPLIER_PRESETS = [5, 10, 15, 20, 25]

export default function StoreSettingsPage() {
  const { activeStore, updateStore, rewards, fetchRewards, createReward, updateReward, deleteReward, loading } = useMerchantStore()
  const { toast } = useToast()

  // Store Customizer Form State
  const [name, setName] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#D97706')
  const [pointsPerTnd, setPointsPerTnd] = useState(10)
  const [isSaving, setIsSaving] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  // Rewards Studio Modal State
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false)
  const [editingReward, setEditingReward] = useState<Reward | null>(null)
  const [rewardName, setRewardName] = useState('')
  const [rewardDescription, setRewardDescription] = useState('')
  const [rewardPoints, setRewardPoints] = useState(100)
  const [isSavingReward, setIsSavingReward] = useState(false)

  useEffect(() => {
    if (activeStore) {
      setName(activeStore.name)
      setPrimaryColor(activeStore.primaryColor || '#D97706')
      setPointsPerTnd(Number(activeStore.pointsPerTnd) || 10)
      fetchRewards(activeStore.id)
    }
  }, [activeStore, fetchRewards])

  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeStore) return
    setIsSaving(true)
    try {
      await updateStore(activeStore.id, {
        name,
        primaryColor,
        pointsPerTnd: Number(pointsPerTnd),
      })
      toast({
        title: 'Store Settings Saved',
        description: 'Branding and point multipliers updated successfully.',
      })
    } catch (err: any) {
      toast({
        title: 'Save Failed',
        description: err.message || 'Could not update store.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCopyPublicLink = () => {
    if (!activeStore) return
    const url = `${window.location.origin}/store/${activeStore.slug}`
    navigator.clipboard.writeText(url)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
    toast({
      title: 'Store Link Copied',
      description: 'Customers can visit this link to join your loyalty program.',
    })
  }

  const handleOpenAddReward = () => {
    setEditingReward(null)
    setRewardName('')
    setRewardDescription('')
    setRewardPoints(100)
    setIsRewardModalOpen(true)
  }

  const handleOpenEditReward = (reward: Reward) => {
    setEditingReward(reward)
    setRewardName(reward.name)
    setRewardDescription(reward.description || '')
    setRewardPoints(reward.pointsCost)
    setIsRewardModalOpen(true)
  }

  const handleSaveReward = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeStore) return
    setIsSavingReward(true)
    try {
      if (editingReward) {
        await updateReward(activeStore.id, editingReward.id, {
          name: rewardName,
          description: rewardDescription,
          pointsCost: Number(rewardPoints),
        })
        toast({ title: 'Reward Updated', description: `Successfully updated '${rewardName}'.` })
      } else {
        await createReward(activeStore.id, {
          name: rewardName,
          description: rewardDescription,
          pointsCost: Number(rewardPoints),
        })
        toast({ title: 'Reward Created', description: `Added '${rewardName}' to rewards catalog.` })
      }
      setIsRewardModalOpen(false)
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to save reward.',
        variant: 'destructive',
      })
    } finally {
      setIsSavingReward(false)
    }
  }

  const handleToggleRewardActive = async (reward: Reward) => {
    if (!activeStore) return
    try {
      await updateReward(activeStore.id, reward.id, { active: !reward.active })
      toast({
        title: reward.active ? 'Reward Deactivated' : 'Reward Activated',
        description: `'${reward.name}' is now ${!reward.active ? 'available' : 'hidden'} for customers.`,
      })
    } catch (err: any) {
      toast({ title: 'Error', description: 'Could not toggle reward state.', variant: 'destructive' })
    }
  }

  const handleDeleteReward = async (reward: Reward) => {
    if (!activeStore) return
    if (!confirm(`Are you sure you want to remove '${reward.name}'?`)) return
    try {
      await deleteReward(activeStore.id, reward.id)
      toast({ title: 'Reward Removed', description: `'${reward.name}' was deleted.` })
    } catch (err: any) {
      toast({ title: 'Error', description: 'Failed to delete reward.', variant: 'destructive' })
    }
  }

  if (!activeStore) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <Card className="max-w-md text-center p-6 border-border/60">
          <Store className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h2 className="text-lg font-bold">No Active Store</h2>
          <p className="text-xs text-muted-foreground mt-1">Please select or create a store from the overview page.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-8 p-4 md:gap-8 md:p-8 overflow-auto">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Store Customizer & Rewards</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Personalize your coffee shop&apos;s digital loyalty card, brand colors, point multipliers, and perks catalog.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyPublicLink} className="gap-1.5 text-xs">
            {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copiedLink ? 'Copied Link' : 'Copy Public Link'}
          </Button>
          <Button size="sm" asChild variant="secondary" className="gap-1.5 text-xs">
            <a href={`/store/${activeStore.slug}`} target="_blank" rel="noopener noreferrer">
              Preview Store <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </div>

      {/* 2-Column Store Styling & Live Simulator */}
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSaveStore}>
            <Card className="border border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Palette className="h-4 w-4 text-primary" />
                  Store Identity & Branding
                </CardTitle>
                <CardDescription>
                  Configure your business name and color theme for digital loyalty cards.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Store Name */}
                <div className="space-y-2">
                  <Label htmlFor="storeName">Coffee Shop Name</Label>
                  <Input
                    id="storeName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Artisan Roast Cafe"
                    required
                  />
                </div>

                {/* Brand Color Picker */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Brand Accent Color</Label>
                    <span className="font-mono text-xs text-muted-foreground">{primaryColor}</span>
                  </div>

                  {/* Preset Swatches */}
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.color}
                        type="button"
                        onClick={() => setPrimaryColor(preset.color)}
                        className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                          primaryColor.toLowerCase() === preset.color.toLowerCase()
                            ? 'border-foreground shadow-xs ring-1 ring-foreground'
                            : 'border-border/60 hover:border-border'
                        }`}
                      >
                        <span
                          className="h-3.5 w-3.5 rounded-full shadow-xs shrink-0"
                          style={{ backgroundColor: preset.color }}
                        />
                        <span>{preset.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Custom Hex Picker Input */}
                  <div className="flex items-center gap-3 pt-1">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-9 w-12 rounded border border-border cursor-pointer bg-transparent p-0.5"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      placeholder="#D97706"
                      className="font-mono text-xs max-w-[140px]"
                    />
                    <span className="text-xs text-muted-foreground">Select custom HEX color</span>
                  </div>
                </div>

                <Separator />

                {/* Points Multiplier */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-1.5">
                    <Coins className="h-4 w-4 text-amber-500" />
                    Loyalty Multiplier (Points per 1 TND Spent)
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Determines how many points customers earn when cashiers record a sale.
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {MULTIPLIER_PRESETS.map((pts) => (
                      <button
                        key={pts}
                        type="button"
                        onClick={() => setPointsPerTnd(pts)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                          Number(pointsPerTnd) === pts
                            ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                            : 'bg-muted/50 border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        1 TND = {pts} pts
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      value={pointsPerTnd}
                      onChange={(e) => setPointsPerTnd(Number(e.target.value))}
                      className="max-w-[120px]"
                    />
                    <span className="text-xs text-muted-foreground">
                      Example: A <span className="font-semibold text-foreground">25 TND</span> bill earns{' '}
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {25 * (Number(pointsPerTnd) || 10)} points
                      </span>
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end pt-4 border-t bg-muted/20">
                <Button type="submit" disabled={isSaving} className="gap-2">
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Saving Changes...' : 'Save Store Branding'}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>

        {/* Right Column: Live Digital Pass Simulator */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Smartphone className="h-4 w-4 text-primary" />
            Live Digital Pass Simulator
          </div>

          {/* Wallet Pass Card Mockup */}
          <div
            className="rounded-3xl p-6 text-white shadow-xl transition-all duration-300 relative overflow-hidden"
            style={{
              backgroundColor: primaryColor,
              backgroundImage: 'radial-gradient(circle at top right, rgba(255,255,255,0.18), transparent 70%)',
            }}
          >
            {/* Header / Brand */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-lg">
                  <Coffee className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base tracking-tight leading-tight">{name || 'Your Coffee Shop'}</h3>
                  <p className="text-[11px] text-white/80">Digital Loyalty Pass</p>
                </div>
              </div>
              <Badge className="bg-white/20 hover:bg-white/20 text-white border-0 text-[10px] backdrop-blur-md px-2 py-0.5">
                1 TND = {pointsPerTnd} pts
              </Badge>
            </div>

            {/* Middle Balance Section */}
            <div className="my-6 bg-black/15 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-white/70 font-semibold">Current Balance</p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-3xl font-extrabold tracking-tight">180</span>
                  <span className="text-xs text-white/80 font-medium">pts</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-white/70 font-medium">Rewards Ready</p>
                <Badge className="bg-emerald-500 text-white border-0 text-[10px] mt-1 font-bold shadow-xs">
                  2 Available
                </Badge>
              </div>
            </div>

            {/* Bottom Pass Barcode Mockup */}
            <div className="mt-6 pt-4 border-t border-white/15 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-white/70 uppercase tracking-wider">Cardholder</p>
                <p className="text-xs font-semibold text-white">Sarah Jenkins</p>
              </div>
              <div className="p-1.5 rounded-lg bg-white shadow-xs">
                <QrCode className="h-7 w-7 text-black" />
              </div>
            </div>
          </div>

          <p className="text-xs text-center text-muted-foreground px-4">
            This digital pass updates in real-time in your customer&apos;s wallet when they earn or redeem points.
          </p>
        </div>
      </div>

      <Separator />

      {/* Rewards & Perks Studio */}
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              Rewards & Perks Catalog
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Define the gifts, beverages, and discounts your customers can redeem using their points.
            </p>
          </div>
          <Button onClick={handleOpenAddReward} className="gap-2 text-xs">
            <Plus className="h-4 w-4" /> Add New Reward
          </Button>
        </div>

        {/* Rewards Grid */}
        {rewards.length === 0 ? (
          <Card className="border-dashed border-2 border-border/70 p-8 text-center bg-muted/10">
            <div className="max-w-md mx-auto space-y-3">
              <Gift className="h-10 w-10 text-muted-foreground mx-auto" />
              <h3 className="font-semibold text-base">No Rewards Added Yet</h3>
              <p className="text-xs text-muted-foreground">
                Create your first reward (e.g. &quot;Free Espresso for 80 pts&quot;) so customers have an incentive to keep returning!
              </p>
              <Button onClick={handleOpenAddReward} variant="outline" size="sm" className="mt-2 gap-1.5">
                <Plus className="h-4 w-4" /> Add First Reward
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rewards.map((reward) => (
              <Card
                key={reward.id}
                className={`border transition-all ${
                  reward.active
                    ? 'border-border/60 hover:shadow-md'
                    : 'border-border/30 opacity-60 bg-muted/20'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-8 w-8 rounded-lg flex items-center justify-center font-bold text-white text-xs shrink-0"
                        style={{ backgroundColor: activeStore.primaryColor || '#D97706' }}
                      >
                        <Gift className="h-4 w-4" />
                      </div>
                      <CardTitle className="text-sm font-semibold truncate leading-tight">
                        {reward.name}
                      </CardTitle>
                    </div>
                    <Badge
                      variant="secondary"
                      className="font-mono font-bold text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 shrink-0"
                    >
                      {reward.pointsCost} pts
                    </Badge>
                  </div>
                  {reward.description && (
                    <CardDescription className="text-xs mt-1 line-clamp-2">
                      {reward.description}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardFooter className="pt-2 border-t flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={reward.active}
                      onCheckedChange={() => handleToggleRewardActive(reward)}
                    />
                    <span className="text-[11px] text-muted-foreground">
                      {reward.active ? 'Active' : 'Hidden'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => handleOpenEditReward(reward)}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteReward(reward)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Reward Modal Dialog */}
      <Dialog open={isRewardModalOpen} onOpenChange={setIsRewardModalOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>{editingReward ? 'Edit Reward' : 'Create New Reward'}</DialogTitle>
            <DialogDescription>
              Set the title, point requirement, and description for this perk.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveReward} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="rewardName">Reward Name</Label>
              <Input
                id="rewardName"
                placeholder="e.g. Free Cappuccino or 20% Off"
                value={rewardName}
                onChange={(e) => setRewardName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rewardPoints">Points Cost</Label>
              <Input
                id="rewardPoints"
                type="number"
                min={1}
                placeholder="100"
                value={rewardPoints}
                onChange={(e) => setRewardPoints(Number(e.target.value))}
                required
              />
              <p className="text-[11px] text-muted-foreground">
                Equivalent to ~{(Number(rewardPoints) / (Number(pointsPerTnd) || 10)).toFixed(1)} TND in spend.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rewardDescription">Description (Optional)</Label>
              <Input
                id="rewardDescription"
                placeholder="e.g. Valid on any hot or cold coffee beverage."
                value={rewardDescription}
                onChange={(e) => setRewardDescription(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setIsRewardModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSavingReward}>
                {isSavingReward ? 'Saving...' : editingReward ? 'Update Reward' : 'Create Reward'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
