"use client"

import Link from "next/link"
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Coffee,
  ExternalLink,
  Gift,
  KeyRound,
  Layers,
  Loader2,
  QrCode,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Store as StoreIcon,
  TrendingUp,
  User,
  Users,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { strings } from "@/lib/strings"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ApiError } from "@/lib/api-client"
import { createReview, listReviews, type Review } from "@/features/site/services/site-service"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

export function HomePageContent() {
  const { isAuthenticated, hasHydrated, profile } = useAuth()
  const router = useRouter()

  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviewsError, setReviewsError] = useState<string | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewsTotal, setReviewsTotal] = useState(0)
  const [averageRating, setAverageRating] = useState(0)

  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewSubmitError, setReviewSubmitError] = useState<string | null>(null)
  const [reviewSubmitSuccess, setReviewSubmitSuccess] = useState<string | null>(null)
  const [reviewForm, setReviewForm] = useState({
    name: "",
    company: "",
    rating: 5,
    title: "",
    message: "",
  })

  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      if (profile?.role === "CASHIER") {
        router.replace("/cashier")
      } else if (profile?.role === "CUSTOMER") {
        router.replace("/customer/overview")
      } else if (profile?.role === "MERCHANT" || profile?.role === "SUPER_ADMIN") {
        router.replace("/merchant/overview")
      }
    }
  }, [hasHydrated, isAuthenticated, profile?.role, router])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setReviewsLoading(true)
      setReviewsError(null)
      try {
        const data = await listReviews({ limit: 12 })
        if (cancelled) return
        setReviews(data.items)
        setReviewsTotal(data.total)
        setAverageRating(data.averageRating)
      } catch (err) {
        if (cancelled) return
        setReviewsError(err instanceof ApiError ? err.message : "Could not load reviews.")
      } finally {
        if (!cancelled) setReviewsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setReviewSubmitting(true)
    setReviewSubmitError(null)
    setReviewSubmitSuccess(null)
    try {
      await createReview({
        name: reviewForm.name,
        company: reviewForm.company || undefined,
        rating: reviewForm.rating,
        title: reviewForm.title || undefined,
        message: reviewForm.message || undefined,
      })
      setReviewSubmitSuccess("Thank you! Your cafe review has been submitted.")
      setReviewForm({ name: "", company: "", rating: 5, title: "", message: "" })
      const data = await listReviews({ limit: 12 })
      setReviews(data.items)
      setReviewsTotal(data.total)
      setAverageRating(data.averageRating)
    } catch (err) {
      setReviewSubmitError(err instanceof ApiError ? err.message : "Failed to post review.")
    } finally {
      setReviewSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* ─── Hero Section ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-border/40 bg-gradient-to-b from-background via-card/30 to-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] pointer-events-none" />

        <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-6">
            <Badge
              variant="outline"
              className="gap-2 px-3.5 py-1.5 text-xs font-semibold bg-primary/10 text-primary border-primary/20 rounded-full"
            >
              <Coffee className="h-3.5 w-3.5" />
              Digital Loyalty for Specialty Coffee Shops & Cafes
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              Turn Coffee Drinkers into{" "}
              <span className="bg-gradient-to-r from-primary via-amber-500 to-primary bg-clip-text text-transparent">
                Lifelong Regulars
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Ditch lost paper punch cards. Launch an instant, app-less digital loyalty card for your coffee shop in under 2 minutes. Fast POS scanning, automated points, and real customer retention.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full sm:w-auto">
              <Button asChild size="lg" className="w-full sm:w-auto gap-2 text-base px-8 h-12 shadow-lg shadow-primary/20">
                <Link href="/auth/sign-up">
                  Get Started Free <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-base h-12 px-6">
                <Link href="/docs">View Documentation</Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium">
                <Check className="h-4 w-4 text-emerald-500" /> Zero app store downloads
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Check className="h-4 w-4 text-emerald-500" /> Fast camera QR scanning
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Check className="h-4 w-4 text-emerald-500" /> Multi-store & staff management
              </span>
            </div>
          </div>

          {/* ── Interactive Preview Mockups ── */}
          <div className="mt-16 grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
            {/* Customer Digital Pass Card Preview */}
            <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
                    <Coffee className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">Blue Bottle Specialty Cafe</h3>
                    <p className="text-xs text-muted-foreground">Customer Loyalty Card</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-[11px] bg-primary/15 text-primary">
                  PWA Ready
                </Badge>
              </div>

              {/* Loyalty Balance Card */}
              <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-6 shadow-md relative overflow-hidden mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/80">
                      Points Balance
                    </p>
                    <p className="text-4xl font-black mt-1">1,250 <span className="text-lg font-normal opacity-80">pts</span></p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-xs">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs">
                  <span>Next Reward: Free Flat White</span>
                  <span className="font-bold">250 pts away</span>
                </div>
              </div>

              {/* QR Code Presentation */}
              <div className="flex flex-col items-center justify-center text-center p-4 bg-muted/40 rounded-2xl border border-border/40">
                <div className="p-3 bg-white rounded-xl shadow-xs">
                  <QrCode className="h-28 w-28 text-slate-900" />
                </div>
                <p className="text-xs text-muted-foreground mt-3 font-medium">
                  Scan at checkout to earn points or redeem rewards
                </p>
              </div>
            </div>

            {/* Cashier Terminal Scanner Preview */}
            <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 font-bold">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">Cashier Point of Sale</h3>
                    <p className="text-xs text-muted-foreground">Barista Fast Scanner</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live Terminal
                </span>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-muted/50 border border-border/40 space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Order Amount</span>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold font-mono">18.500 <span className="text-sm font-normal text-muted-foreground">TND</span></span>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">
                      +185 pts reward
                    </Badge>
                  </div>
                </div>

                <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-6 text-center flex flex-col items-center justify-center">
                  <QrCode className="h-12 w-12 text-primary mb-2 animate-bounce" />
                  <p className="font-semibold text-sm text-foreground">Camera Scanner Active</p>
                  <p className="text-xs text-muted-foreground mt-1">Ready to scan customer QR pass</p>
                </div>

                <Button className="w-full py-6 text-base font-semibold rounded-xl gap-2">
                  <Check className="h-5 w-5" /> Issue Points in 1 Second
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features Grid ──────────────────────────────────────────────────────────── */}
      <section id="features" className="py-20 bg-muted/20 border-b border-border/40">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
              Everything You Need
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Built for Fast-Paced Coffee Shops
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Say goodbye to punch card printing costs, lost cards, and slow apps. Fidely is built for speed and delight.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <Card className="border border-border/60 bg-card/60 shadow-xs hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
                  <QrCode className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">Zero-App Digital Pass</CardTitle>
                <CardDescription className="text-sm">
                  Customers scan your counter QR to immediately open their digital card in Safari or Chrome. They can save it to their home screen with 1 tap.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 2 */}
            <Card className="border border-border/60 bg-card/60 shadow-xs hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 mb-3">
                  <Zap className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">Instant POS Scanner</CardTitle>
                <CardDescription className="text-sm">
                  Cashiers enter the bill amount and scan the customer pass using any phone, tablet, or POS camera. Points are credited immediately.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 3 */}
            <Card className="border border-border/60 bg-card/60 shadow-xs hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 mb-3">
                  <StoreIcon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">Multi-Store & Switcher</CardTitle>
                <CardDescription className="text-sm">
                  Manage multiple cafes or locations from one merchant dashboard. Switch between branches seamlessly to view customers and staff.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 4 */}
            <Card className="border border-border/60 bg-card/60 shadow-xs hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 mb-3">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">Complete Staff Control</CardTitle>
                <CardDescription className="text-sm">
                  Create dedicated cashier logins for each barista, instantly change forgotten passwords, and revoke access when staff members change.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 5 */}
            <Card className="border border-border/60 bg-card/60 shadow-xs hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 mb-3">
                  <Gift className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">Custom Rewards Catalog</CardTitle>
                <CardDescription className="text-sm">
                  Define custom points costs for rewards like free coffees, pastries, or merchandise. Customers unlock vouchers as they earn.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 6 */}
            <Card className="border border-border/60 bg-card/60 shadow-xs hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 mb-3">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">Real-Time CRM & Insights</CardTitle>
                <CardDescription className="text-sm">
                  Track member growth, lifetime points issued vs. redeemed, customer visit frequencies, and cashier performance all in real-time.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* ─── How It Works ──────────────────────────────────────────────────────────── */}
      <section id="use-cases" className="py-20 border-b border-border/40">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
              Simple 3-Step Setup
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              How Fidely Works in Your Cafe
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="relative flex flex-col items-center text-center p-6 rounded-2xl bg-card border border-border/60">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-black text-xl mb-4 shadow-md">
                1
              </div>
              <h3 className="font-bold text-lg mb-2">Create Your Store</h3>
              <p className="text-sm text-muted-foreground">
                Sign up, enter your coffee shop name, pick your points-per-dinar ratio, and add your reward items.
              </p>
            </div>

            <div className="relative flex flex-col items-center text-center p-6 rounded-2xl bg-card border border-border/60">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-black text-xl mb-4 shadow-md">
                2
              </div>
              <h3 className="font-bold text-lg mb-2">Customers Scan to Join</h3>
              <p className="text-sm text-muted-foreground">
                Place your store QR sticker at checkout. Customers scan once with their phone camera to get their digital loyalty card.
              </p>
            </div>

            <div className="relative flex flex-col items-center text-center p-6 rounded-2xl bg-card border border-border/60">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-black text-xl mb-4 shadow-md">
                3
              </div>
              <h3 className="font-bold text-lg mb-2">Cashiers Reward & Redeem</h3>
              <p className="text-sm text-muted-foreground">
                Baristas use the dedicated Cashier Terminal on any device to scan passes in 1 second and issue points on every order.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Reviews / Testimonials ─────────────────────────────────────────────────── */}
      <section id="reviews" className="py-20 bg-muted/20 border-b border-border/40">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs mb-2">
                Cafe Owners Love Fidely
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                What Coffee Shops Say
              </h2>
              {reviewsTotal > 0 && (
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-foreground">{averageRating.toFixed(1)}</span> out of 5 stars ({reviewsTotal} reviews)
                </p>
              )}
            </div>

            <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Star className="h-4 w-4" /> Leave a Cafe Review
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[440px]">
                <form onSubmit={handleReviewSubmit}>
                  <DialogHeader>
                    <DialogTitle>Review Fidely</DialogTitle>
                    <DialogDescription>
                      Share your experience using Fidely for your coffee shop or cafe.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="rev-name">Your Name</Label>
                      <Input
                        id="rev-name"
                        value={reviewForm.name}
                        onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                        placeholder="Karim B."
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="rev-company">Cafe / Coffee Shop Name</Label>
                      <Input
                        id="rev-company"
                        value={reviewForm.company}
                        onChange={(e) => setReviewForm({ ...reviewForm, company: e.target.value })}
                        placeholder="Brew & Bean Coffee House"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="rev-rating">Rating (1 to 5 Stars)</Label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                            className="p-1 hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`h-6 w-6 ${
                                star <= reviewForm.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="rev-title">Headline</Label>
                      <Input
                        id="rev-title"
                        value={reviewForm.title}
                        onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                        placeholder="Our regulars love not carrying cards!"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="rev-msg">Your Feedback</Label>
                      <Textarea
                        id="rev-msg"
                        value={reviewForm.message}
                        onChange={(e) => setReviewForm({ ...reviewForm, message: e.target.value })}
                        placeholder="Fidely helped us increase our weekly return customers by 30%..."
                        rows={3}
                      />
                    </div>

                    {reviewSubmitError && (
                      <p className="text-xs text-destructive font-medium">{reviewSubmitError}</p>
                    )}
                    {reviewSubmitSuccess && (
                      <p className="text-xs text-emerald-600 font-medium">{reviewSubmitSuccess}</p>
                    )}
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setReviewModalOpen(false)}
                      disabled={reviewSubmitting}
                    >
                      Close
                    </Button>
                    <Button type="submit" disabled={reviewSubmitting}>
                      {reviewSubmitting ? "Submitting..." : "Submit Review"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {reviewsLoading ? (
            <div className="flex justify-center py-12 text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading reviews...
            </div>
          ) : reviews.length === 0 ? (
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border border-border/60 p-6">
                <div className="flex gap-1 text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm font-semibold mb-1">&ldquo;The fastest loyalty setup we&apos;ve seen&rdquo;</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Our baristas love how fast the cashier camera scans. No typing phone numbers or looking up accounts.
                </p>
                <div className="mt-4 pt-3 border-t border-border/40 text-xs font-medium">
                  Ahmed M. — <span className="text-muted-foreground">Artisan Roastery</span>
                </div>
              </Card>

              <Card className="border border-border/60 p-6">
                <div className="flex gap-1 text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm font-semibold mb-1">&ldquo;Customers love the PWA pass&rdquo;</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  People always lost our paper punch cards. With Fidely they just tap and show their QR. Our loyalty signups doubled!
                </p>
                <div className="mt-4 pt-3 border-t border-border/40 text-xs font-medium">
                  Sarra K. — <span className="text-muted-foreground">The Daily Espresso</span>
                </div>
              </Card>

              <Card className="border border-border/60 p-6">
                <div className="flex gap-1 text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm font-semibold mb-1">&ldquo;Multi-store support is awesome&rdquo;</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Managing both our downtown and university branches in one dashboard with separate cashier logins is super smooth.
                </p>
                <div className="mt-4 pt-3 border-t border-border/40 text-xs font-medium">
                  Youssef T. — <span className="text-muted-foreground">Café Nomad</span>
                </div>
              </Card>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {reviews.map((rev) => (
                <Card key={rev.id} className="border border-border/60 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex gap-1 text-amber-400 mb-3">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400" />
                      ))}
                    </div>
                    {rev.title && <p className="text-sm font-semibold mb-1">{rev.title}</p>}
                    {rev.message && (
                      <p className="text-xs text-muted-foreground leading-relaxed">{rev.message}</p>
                    )}
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/40 text-xs font-medium">
                    {rev.name} {rev.company && <span className="text-muted-foreground">— {rev.company}</span>}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── CTA Banner ────────────────────────────────────────────────────────────── */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-br from-primary/90 to-primary text-primary-foreground">
        <div className="container relative mx-auto max-w-5xl px-4 text-center space-y-6">
          <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs uppercase tracking-wider">
            Start Rewarding Today
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            Ready to Launch Loyalty for Your Cafe?
          </h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto text-base sm:text-lg">
            Create your merchant account now, add your coffee shop, and start issuing digital points to your regulars in minutes.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-white text-primary hover:bg-white/90 text-base font-semibold px-8 h-12 shadow-xl"
            >
              <Link href="/auth/sign-up">Create Free Account</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/30 text-white bg-white/10 hover:bg-white/20 text-base h-12 px-6"
            >
              <Link href="/auth/login">Merchant Sign In</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
