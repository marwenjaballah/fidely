"use client"

import Link from "next/link"
import { ArrowRight, Check, ChevronLeft, ChevronRight, Code2, ExternalLink, Github, Globe, KeyRound, Layers, Linkedin, Loader2, Mail, Shield, ShieldCheck, Star, Terminal, User, Workflow, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { strings } from "@/lib/strings"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ApiError } from "@/lib/api-client"
import { createReview, listReviews, type Review } from "@/features/site/services/site-service"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

const GITHUB_REPO_URL = "https://github.com/Khalil-Bchir/saas-boilerplate-next-hono"
const GITHUB_PROFILE_URL = "https://github.com/Khalil-Bchir"
const LINKEDIN_URL = "https://www.linkedin.com/in/mohamed-khalil-bchir/"

// ─── Architecture Diagram ──────────────────────────────────────────────────────
/** Theme tokens are oklch (see globals.css); SVG must use `var(--token)`, not `hsl(var(--token))`. */
function ArchitectureDiagram() {
  return (
    <svg
      viewBox="0 0 720 320"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-3xl mx-auto text-foreground"
      aria-label="Monorepo architecture diagram"
    >
      <defs>
        <marker
          id="arch-dep-arrow"
          markerWidth="5"
          markerHeight="5"
          refX="4"
          refY="2.5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0 0 L5 2.5 L0 5 z" fill="var(--primary)" fillOpacity="0.45" />
        </marker>
      </defs>
      {/* Background */}
      <rect width="720" height="320" rx="16" fill="var(--muted)" fillOpacity="0.45" stroke="var(--border)" strokeWidth="1" />

      {/* ── APPS row ── */}
      <text x="360" y="34" textAnchor="middle" fontSize="11" fontFamily="monospace" fill="var(--muted-foreground)" opacity="0.85">apps/</text>

      {/* apps/web */}
      <rect x="80" y="46" width="160" height="64" rx="10" fill="var(--primary)" fillOpacity="0.12" stroke="var(--primary)" strokeOpacity="0.45" strokeWidth="1.5" />
      <text x="160" y="72" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="monospace" fill="var(--foreground)">apps/web</text>
      <text x="160" y="90" textAnchor="middle" fontSize="10" fontFamily="monospace" fill="var(--muted-foreground)">Next.js 16 · App Router</text>
      <text x="160" y="103" textAnchor="middle" fontSize="10" fontFamily="monospace" fill="var(--muted-foreground)">shadcn/ui · Zustand</text>

      {/* apps/api */}
      <rect x="480" y="46" width="160" height="64" rx="10" fill="var(--primary)" fillOpacity="0.12" stroke="var(--primary)" strokeOpacity="0.45" strokeWidth="1.5" />
      <text x="560" y="72" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="monospace" fill="var(--foreground)">apps/api</text>
      <text x="560" y="90" textAnchor="middle" fontSize="10" fontFamily="monospace" fill="var(--muted-foreground)">Hono · OpenAPI/Zod</text>
      <text x="560" y="103" textAnchor="middle" fontSize="10" fontFamily="monospace" fill="var(--muted-foreground)">JWT · Cookie sessions</text>

      {/* ── connectors: web → API + types; API → database + types (matches workspace deps) ── */}
      <line
        x1="240"
        y1="78"
        x2="480"
        y2="78"
        stroke="var(--primary)"
        strokeOpacity="0.28"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        markerEnd="url(#arch-dep-arrow)"
      />
      <line
        x1="160"
        y1="110"
        x2="540"
        y2="190"
        stroke="var(--primary)"
        strokeOpacity="0.28"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        markerEnd="url(#arch-dep-arrow)"
      />
      <line
        x1="560"
        y1="110"
        x2="188"
        y2="190"
        stroke="var(--primary)"
        strokeOpacity="0.28"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        markerEnd="url(#arch-dep-arrow)"
      />
      <line
        x1="560"
        y1="110"
        x2="548"
        y2="190"
        stroke="var(--primary)"
        strokeOpacity="0.28"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        markerEnd="url(#arch-dep-arrow)"
      />

      {/* ── PACKAGES row ── */}
      <text x="360" y="178" textAnchor="middle" fontSize="11" fontFamily="monospace" fill="var(--muted-foreground)" opacity="0.85">packages/</text>

      {/* packages/database */}
      <rect x="80" y="190" width="200" height="64" rx="10" fill="var(--card)" fillOpacity="0.9" stroke="var(--border)" strokeOpacity="1" strokeWidth="1.5" />
      <text x="180" y="216" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="monospace" fill="var(--foreground)">@repo/database</text>
      <text x="180" y="234" textAnchor="middle" fontSize="10" fontFamily="monospace" fill="var(--muted-foreground)">Prisma schema · migrations</text>
      <text x="180" y="247" textAnchor="middle" fontSize="10" fontFamily="monospace" fill="var(--muted-foreground)">generated client · seed</text>

      {/* packages/types */}
      <rect x="440" y="190" width="200" height="64" rx="10" fill="var(--card)" fillOpacity="0.9" stroke="var(--border)" strokeOpacity="1" strokeWidth="1.5" />
      <text x="540" y="216" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="monospace" fill="var(--foreground)">@repo/types</text>
      <text x="540" y="234" textAnchor="middle" fontSize="10" fontFamily="monospace" fill="var(--muted-foreground)">shared TS types · enums</text>
      <text x="540" y="247" textAnchor="middle" fontSize="10" fontFamily="monospace" fill="var(--muted-foreground)">role constants · Prisma re-export</text>

      {/* ── connector lines: packages → supabase ── */}
      <line x1="180" y1="254" x2="230" y2="286" stroke="var(--primary)" strokeOpacity="0.22" strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1="540" y1="254" x2="490" y2="286" stroke="var(--primary)" strokeOpacity="0.22" strokeWidth="1.5" strokeDasharray="4 3" />

      {/* ── INFRA row ── */}
      <rect x="160" y="284" width="400" height="28" rx="8" fill="var(--card)" fillOpacity="0.85" stroke="var(--border)" strokeWidth="1" />
      <text x="360" y="302" textAnchor="middle" fontSize="11" fontFamily="monospace" fill="var(--muted-foreground)">Supabase Auth · PostgreSQL · pnpm workspaces · Turborepo</text>
    </svg>
  )
}

// ─── Code Preview ─────────────────────────────────────────────────────────────
const HONO_ROUTE_SNIPPET = `// apps/api/src/routes/v1/users.ts
const route = createRoute({
  method: "get",
  path: "/api/v1/users/me",
  middleware: [authMiddleware],
  responses: {
    200: { content: { "application/json": { schema: UserSchema } } },
  },
})

app.openapi(route, async (c) => {
  const user = c.get("user")          // typed — set by authMiddleware
  const profile = await userService
    .findById(user.id)                 // @repo/database Prisma client
  return c.json(profile)
})`

const NEXT_SNIPPET = `// apps/web/app/(dashboard)/overview/page.tsx
import { getServerUser } from "@/lib/auth/server"
import { redirect } from "next/navigation"

export default async function OverviewPage() {
  const user = await getServerUser()
  if (!user) redirect("/auth/sign-in")

  return <Dashboard user={user} />
}`

function CodeBlock({ code, label }: { code: string; label: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/60 overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/40 bg-muted/40">
        <span className="w-2.5 h-2.5 rounded-full bg-destructive/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600/70 dark:bg-emerald-500/60" />
        <span className="ml-2 text-xs text-primary font-mono font-medium">{label}</span>
      </div>
      <pre className="p-4 text-xs font-mono text-muted-foreground leading-relaxed overflow-x-auto whitespace-pre [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <code>{code}</code>
      </pre>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────
export function HomePageContent() {
  const { isAuthenticated, hasHydrated } = useAuth()
  const router = useRouter()

  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviewsError, setReviewsError] = useState<string | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewsTotal, setReviewsTotal] = useState(0)
  const [averageRating, setAverageRating] = useState(0)

  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [reviewDetail, setReviewDetail] = useState<Review | null>(null)
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
      router.replace("/overview")
    }
  }, [hasHydrated, isAuthenticated, router])

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
    return () => { cancelled = true }
  }, [])

  const features = [
    {
      icon: KeyRound,
      title: strings.landing_feature_auth_title,
      description: strings.landing_feature_auth_desc,
    },
    {
      icon: Shield,
      title: strings.landing_feature_authz_title,
      description: strings.landing_feature_authz_desc,
    },
    {
      icon: User,
      title: strings.landing_feature_user_title,
      description: strings.landing_feature_user_desc,
    },
  ]

  if (hasHydrated && isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-muted-foreground">Redirecting to dashboard…</p>
      </div>
    )
  }

  const averageStars = useMemo(() => {
    const full = Math.floor(averageRating)
    return Array.from({ length: 5 }).map((_, i) => i < full)
  }, [averageRating])

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setReviewSubmitting(true)
    setReviewSubmitError(null)
    setReviewSubmitSuccess(null)
    try {
      await createReview({
        name: reviewForm.name.trim(),
        company: reviewForm.company.trim() || undefined,
        rating: reviewForm.rating,
        title: reviewForm.title.trim() || undefined,
        message: reviewForm.message.trim() || undefined,
      })

      const refreshed = await listReviews({ limit: 12 })
      setReviews(refreshed.items)
      setReviewsTotal(refreshed.total)
      setAverageRating(refreshed.averageRating)
      setReviewSubmitSuccess("Thanks for your review!")
      setReviewForm({ name: "", company: "", rating: 5, title: "", message: "" })
      setReviewModalOpen(false)
    } catch (err) {
      setReviewSubmitError(err instanceof ApiError ? err.message : "Could not submit review.")
    } finally {
      setReviewSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section
        id="intro"
        className="relative scroll-mt-24 py-20 lg:py-40 overflow-hidden border-b border-primary/10"
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute top-1/2 -right-20 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
        </div>
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl relative">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-5 py-2.5 rounded-full text-sm font-semibold border border-primary/40 backdrop-blur-md hover:bg-primary/25 transition-colors">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              {strings.landing_badge}
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-balance leading-tight tracking-tight">
              {strings.landing_title_main}{" "}
              <span className="text-primary">
                {strings.landing_title_highlight}
              </span>
            </h1>
            {/* ↓ CHANGED: leading with the real differentiator */}
            <p className="text-lg md:text-xl text-muted-foreground/90 max-w-2xl mx-auto text-balance leading-relaxed">
              A Turborepo monorepo where{" "}
              <span className="text-foreground font-medium">Hono runs as a real backend</span>
              {" "}— not Next.js API routes. Typed end-to-end with OpenAPI, Prisma, and Supabase Auth wired from day one.
            </p>
            {/* ↓ CHANGED: added a quick differentiator badge row */}
            <div className="flex flex-wrap justify-center gap-2 text-xs font-mono">
              {["Next.js 16", "Hono API", "Prisma ORM", "Supabase Auth", "OpenAPI/Zod", "Turborepo"].map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full border border-primary/30 bg-primary/12 text-primary text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex flex-col items-center gap-6 pt-6">

              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="group w-full max-w-xl cursor-pointer rounded-2xl border border-primary/25 bg-card/50 p-5 text-left shadow-sm backdrop-blur-sm transition-all hover:border-primary/45 hover:bg-card/70 hover:shadow-md hover:shadow-primary/10"
              >
                <div className="flex gap-4 sm:gap-5">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20 transition-colors group-hover:bg-primary/25">
                    <Github className="h-6 w-6" />
                  </span>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-base font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
                        {strings.landing_repo_title}
                      </span>
                      <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" aria-hidden />
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {strings.landing_repo_description}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                      {strings.landing_repo_cta}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── ARCHITECTURE DIAGRAM ─────────────────────────────────────────── */}
      {/* NEW SECTION */}
      <section className="py-20 lg:py-28 border-b border-primary/10 bg-background">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          <div className="max-w-3xl mx-auto text-center space-y-4 pb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-balance">How it fits together</h2>
            <p className="text-base md:text-lg text-muted-foreground/90 text-balance leading-relaxed">
              Two apps, two shared packages, one build graph. The API is a real Hono server — not a Next.js route handler.
            </p>
          </div>
          <div className="rounded-xl border border-border/50 bg-card/50 p-4 sm:p-6 md:p-8 shadow-sm max-w-3xl mx-auto">
            <ArchitectureDiagram />
          </div>
          <div className="mt-10 grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto text-sm">
            <div className="rounded-xl border border-border/50 bg-card/50 p-5 space-y-2 shadow-sm transition-colors duration-200 hover:border-border hover:bg-card/70">
              <div className="font-mono text-xs font-semibold text-primary">apps/web</div>
              <p className="text-xs leading-relaxed text-muted-foreground/90">Next.js App Router with auth-aware layouts, dashboard scaffold, and shadcn/ui components.</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-card/50 p-5 space-y-2 shadow-sm transition-colors duration-200 hover:border-border hover:bg-card/70">
              <div className="font-mono text-xs font-semibold text-primary">apps/api</div>
              <p className="text-xs leading-relaxed text-muted-foreground/90">Hono server with versioned routes, Zod/OpenAPI schemas, service layer, and JWT middleware.</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-card/50 p-5 space-y-2 shadow-sm transition-colors duration-200 hover:border-border hover:bg-card/70">
              <div className="font-mono text-xs font-semibold text-primary">packages/*</div>
              <p className="text-xs leading-relaxed text-muted-foreground/90">
                Prisma and migrations in <span className="font-mono">database</span>; shared contracts in{" "}
                <span className="font-mono">types</span>. The API imports both; the web app imports{" "}
                <span className="font-mono">types</span> and calls the API.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CODE PREVIEW ─────────────────────────────────────────────────── */}
      {/* NEW SECTION */}
      <section className="py-20 lg:py-28 border-b border-primary/10 bg-background">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          <div className="max-w-3xl mx-auto text-center space-y-4 pb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-balance">What the code looks like</h2>
            <p className="text-base md:text-lg text-muted-foreground/90 text-balance leading-relaxed">
              Schema-first API routes. Typed user context. Protected server pages. This is what you clone into.
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Code2 className="h-4 w-4 shrink-0" aria-hidden />
                Hono route with OpenAPI + auth
              </div>
              <CodeBlock code={HONO_ROUTE_SNIPPET} label="apps/api/src/routes/v1/users.ts" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Layers className="h-4 w-4 shrink-0" aria-hidden />
                Next.js protected server page
              </div>
              <CodeBlock code={NEXT_SNIPPET} label="apps/web/app/(dashboard)/overview/page.tsx" />
              <div className="rounded-xl border border-border/50 bg-card/60 p-4 space-y-3 shadow-sm">
                <div className="text-xs font-semibold text-foreground">Also included out of the box</div>
                <ul className="space-y-2 text-xs text-muted-foreground/90 font-mono leading-relaxed">
                  {(
                    [
                      "Sign-up / sign-in / forgot password flows",
                      "Token refresh + HTTP-only cookie sessions",
                      "RBAC middleware (USER / ADMIN / DEMO roles)",
                      "Prisma migrations workflow with seed scripts",
                    ] as const
                  ).map((line) => (
                    <li key={line} className="flex gap-2">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                      <span>{line}</span>
                    </li>
                  ))}
                  <li className="flex gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                    <span>
                      OpenAPI docs served at{" "}
                      <span className="font-medium text-primary">/api/v1/docs</span>
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                    <span>Husky + commitlint + pnpm workspace scripts</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section id="features" className="py-20 lg:py-28 scroll-mt-24 border-b border-primary/10 bg-background">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          <div className="max-w-3xl mx-auto text-center space-y-4 pb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-balance">{strings.landing_architecture_title}</h2>
            <p className="text-base md:text-lg text-muted-foreground/90 text-balance leading-relaxed">{strings.landing_architecture_desc}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card
                  key={feature.title}
                  className="group border border-border/50 bg-card/50 shadow-sm transition-all duration-300 hover:border-border hover:bg-card/70 hover:shadow-md hover:shadow-primary/5"
                >
                  <CardHeader className="space-y-3">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-primary/15 group-hover:bg-primary/25 transition-all">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg font-semibold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="leading-relaxed text-muted-foreground/80">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="grid lg:grid-cols-3 gap-6 pt-12">
            <Card className="group border border-border/50 bg-card/50 shadow-sm transition-all duration-300 hover:border-border hover:bg-card/70 hover:shadow-md hover:shadow-primary/5">
              <CardHeader className="space-y-3">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-primary/12 group-hover:bg-primary/20 transition-all">
                  <Workflow className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg font-semibold">Turborepo workflow</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="leading-relaxed text-muted-foreground/85">
                  Run dev/build/lint/typecheck across apps and packages with caching-friendly tasks and pnpm workspaces.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="group border border-border/50 bg-card/50 shadow-sm transition-all duration-300 hover:border-border hover:bg-card/70 hover:shadow-md hover:shadow-primary/5">
              <CardHeader className="space-y-3">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-primary/12 group-hover:bg-primary/20 transition-all">
                  <Code2 className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg font-semibold">Typed API contracts</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="leading-relaxed text-muted-foreground/85">
                  Hono routes with schema-first validation and OpenAPI docs; shared TypeScript types live in packages for reuse.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="group border border-border/50 bg-card/50 shadow-sm transition-all duration-300 hover:border-border hover:bg-card/70 hover:shadow-md hover:shadow-primary/5">
              <CardHeader className="space-y-3">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-primary/12 group-hover:bg-primary/20 transition-all">
                  <Terminal className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg font-semibold">{strings.landing_quickstart_title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="leading-relaxed text-muted-foreground/85">
                  {strings.landing_quickstart_desc}
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── USE CASES ────────────────────────────────────────────────────── */}
      <section id="use-cases" className="scroll-mt-24 border-b border-border/40 bg-background py-20 lg:py-28">
        <div className="container mx-auto max-w-7xl space-y-12 px-4 lg:px-8">
          <div className="mx-auto max-w-4xl space-y-4 text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">Build real SaaS faster</h2>
            <p className="text-balance text-base leading-relaxed text-muted-foreground/90 md:text-lg">
              Opinionated where it matters (auth, API contracts, DB workflow), flexible where it counts (your product).
            </p>
          </div>

          <Card className="border-border/50 bg-card/50 shadow-sm">
            <CardHeader className="space-y-4">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-bold tracking-tight md:text-3xl">Use cases, benefits, deployment</CardTitle>
                <CardDescription className="text-muted-foreground/90">
                  Explore the starter from three angles. Each tab has room to be specific.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-0">
              <Tabs defaultValue="use-cases" className="gap-0">
                <TabsList className="grid h-auto w-full grid-cols-1 gap-1.5 rounded-xl border border-border/50 bg-muted/30 p-1.5 sm:grid-cols-3 sm:gap-1">
                  <TabsTrigger
                    value="use-cases"
                    className="h-auto min-h-10 flex-1 gap-2 rounded-lg border border-transparent bg-transparent px-3 py-2.5 text-sm font-medium text-muted-foreground shadow-none transition-colors data-[state=active]:border-border/60 data-[state=active]:bg-card data-[state=active]:font-semibold data-[state=active]:text-primary data-[state=active]:shadow-sm [&_svg]:shrink-0 [&_svg]:text-muted-foreground data-[state=active]:[&_svg]:text-primary"
                  >
                    <Layers className="h-4 w-4" aria-hidden />
                    Use cases
                  </TabsTrigger>
                  <TabsTrigger
                    value="benefits"
                    className="h-auto min-h-10 flex-1 gap-2 rounded-lg border border-transparent bg-transparent px-3 py-2.5 text-sm font-medium text-muted-foreground shadow-none transition-colors data-[state=active]:border-border/60 data-[state=active]:bg-card data-[state=active]:font-semibold data-[state=active]:text-primary data-[state=active]:shadow-sm [&_svg]:shrink-0 [&_svg]:text-muted-foreground data-[state=active]:[&_svg]:text-primary"
                  >
                    <ShieldCheck className="h-4 w-4" aria-hidden />
                    Benefits
                  </TabsTrigger>
                  <TabsTrigger
                    value="deployment"
                    className="h-auto min-h-10 flex-1 gap-2 rounded-lg border border-transparent bg-transparent px-3 py-2.5 text-sm font-medium text-muted-foreground shadow-none transition-colors data-[state=active]:border-border/60 data-[state=active]:bg-card data-[state=active]:font-semibold data-[state=active]:text-primary data-[state=active]:shadow-sm [&_svg]:shrink-0 [&_svg]:text-muted-foreground data-[state=active]:[&_svg]:text-primary"
                  >
                    <Globe className="h-4 w-4" aria-hidden />
                    Deployment
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="use-cases" className="mt-0 pt-8 outline-none">
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="space-y-4">
                      <div className="text-sm font-semibold text-foreground">Who this is for</div>
                      <ul className="space-y-4 text-sm text-muted-foreground/85 leading-relaxed">
                        <li className="flex gap-3">
                          <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary">
                            <Zap className="h-4 w-4" />
                          </span>
                          <div>
                            <div className="font-semibold text-foreground">MVP builders</div>
                            <div>
                              You want signup/login, protected pages, and a real database on day one—not mock auth.
                            </div>
                          </div>
                        </li>
                        <li className="flex gap-3">
                          <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary">
                            <Zap className="h-4 w-4" />
                          </span>
                          <div>
                            <div className="font-semibold text-foreground">Teams shipping internal tools</div>
                            <div>
                              You need RBAC, a clean service layer, and a typed API surface you can extend safely.
                            </div>
                          </div>
                        </li>
                        <li className="flex gap-3">
                          <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary">
                            <Zap className="h-4 w-4" />
                          </span>
                          <div>
                            <div className="font-semibold text-foreground">B2B SaaS</div>
                            <div>
                              You value explicit contracts (OpenAPI) and predictable backend structure as features grow.
                            </div>
                          </div>
                        </li>
                        <li className="flex gap-3">
                          <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary">
                            <Zap className="h-4 w-4" />
                          </span>
                          <div>
                            <div className="font-semibold text-foreground">Client work / templates</div>
                            <div>
                              You want a consistent foundation you can reuse, customize, and keep maintainable across projects.
                            </div>
                          </div>
                        </li>
                      </ul>
                    </div>

                    <div className="rounded-xl border border-border/50 bg-muted/25 p-5">
                      <div className="text-sm font-semibold text-foreground">Typical first changes</div>
                      <ul className="mt-3 space-y-3 text-sm text-muted-foreground/85 leading-relaxed list-disc pl-5">
                        <li>Update landing copy/branding and the nav anchors</li>
                        <li>Add your first domain model in Prisma and run migrations</li>
                        <li>Create your first feature module (web) + versioned route (api)</li>
                        <li>Lock down protected endpoints and role rules</li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="benefits" className="mt-0 pt-8 outline-none">
                  <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-2 rounded-xl border border-border/50 bg-muted/25 p-5">
                      <div className="flex items-center gap-2 text-foreground font-semibold">
                        <Shield className="h-4 w-4 text-primary" />
                        Sessions you can trust
                      </div>
                      <p className="text-sm text-muted-foreground/85 leading-relaxed">
                        Cookie-based, HTTP-only auth with a refresh flow—so you don’t end up storing tokens in localStorage.
                      </p>
                    </div>
                    <div className="space-y-2 rounded-xl border border-border/50 bg-muted/25 p-5">
                      <div className="flex items-center gap-2 text-foreground font-semibold">
                        <Code2 className="h-4 w-4 text-primary" />
                        Contracts stay explicit
                      </div>
                      <p className="text-sm text-muted-foreground/85 leading-relaxed">
                        Schema-first endpoints + OpenAPI keeps frontend and backend aligned as you iterate quickly.
                      </p>
                    </div>
                    <div className="space-y-2 rounded-xl border border-border/50 bg-muted/25 p-5">
                      <div className="flex items-center gap-2 text-foreground font-semibold">
                        <Terminal className="h-4 w-4 text-primary" />
                        Predictable database changes
                      </div>
                      <p className="text-sm text-muted-foreground/85 leading-relaxed">
                        Prisma schema is the source of truth; migrations and generated client follow from commands (not hand edits).
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-6 lg:grid-cols-2">
                    <div className="rounded-xl border border-border/50 bg-card/50 p-5 shadow-sm">
                      <div className="text-sm font-semibold text-foreground">Developer workflow</div>
                      <p className="mt-2 text-sm text-muted-foreground/85 leading-relaxed">
                        pnpm + Turborepo gives you consistent dev/build/lint/typecheck across apps and packages.
                      </p>
                      <div className="mt-3 overflow-x-auto rounded-lg border border-border/50 bg-muted/30 p-3 font-mono text-xs text-muted-foreground">
                        pnpm dev · pnpm lint · pnpm check-types · pnpm build
                      </div>
                    </div>
                    <div className="rounded-xl border border-border/50 bg-card/50 p-5 shadow-sm">
                      <div className="text-sm font-semibold text-foreground">UI that’s easy to customize</div>
                      <p className="mt-2 text-sm text-muted-foreground/85 leading-relaxed">
                        Tailwind + shadcn-style components help you move fast while keeping accessibility and consistency.
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="deployment" className="mt-0 pt-8 outline-none">
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-xl border border-border/50 bg-muted/25 p-6">
                      <div className="text-foreground font-semibold">Low-cost starter setup</div>
                      <p className="mt-2 text-sm text-muted-foreground/85 leading-relaxed">
                        A common “$0 to start” path for MVPs:
                      </p>
                      <ul className="mt-4 space-y-3 text-sm text-muted-foreground/85 leading-relaxed">
                        <li>
                          <span className="font-semibold text-foreground">Web</span>: Next.js on Vercel
                        </li>
                        <li>
                          <span className="font-semibold text-foreground">API</span>: Hono on Vercel too (or any Node host)
                        </li>
                        <li>
                          <span className="font-semibold text-foreground">Auth + DB</span>: Supabase free tier to start
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-xl border border-border/50 bg-muted/25 p-6">
                        <div className="text-sm font-semibold text-foreground">What you configure</div>
                        <p className="mt-2 text-sm text-muted-foreground/85 leading-relaxed">
                          Set{" "}
                          <span className="font-mono text-foreground">NEXT_PUBLIC_API_URL</span>, Supabase keys, and your DB URLs.
                          Once that’s done, you’re live with real auth and a real database.
                        </p>
                      </div>
                      <div className="rounded-xl border border-border/50 bg-muted/25 p-6">
                        <div className="text-sm font-semibold text-foreground">Release checklist (minimal)</div>
                        <ul className="mt-3 list-disc pl-5 space-y-2 text-sm text-muted-foreground/85 leading-relaxed">
                          <li>Set production env vars for web + api</li>
                          <li>Run DB migrations as part of deploy</li>
                          <li>Verify CORS + cookie settings match your domains</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── REVIEWS ──────────────────────────────────────────────────────── */}
      <section id="reviews" className="py-20 lg:py-28 scroll-mt-24 border-b border-border/40 bg-muted/25">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl space-y-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-balance">Community Reviews</h2>
              {/* ↓ CHANGED: removed the "hundreds of developers" lie */}
              <p className="text-base md:text-lg text-muted-foreground/90 leading-relaxed">
                Used this boilerplate? Share a quick note — it helps other developers decide.
              </p>
            </div>

            {reviewsTotal > 0 && (
              <div className="flex items-center gap-4 rounded-xl border border-border/50 bg-card/50 px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  {averageStars.map((filled, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${filled ? "text-primary fill-primary" : "text-muted-foreground/30"}`}
                    />
                  ))}
                </div>
                <div className="text-sm font-semibold text-foreground">
                  {averageRating.toFixed(1)} • {reviewsTotal} {reviewsTotal === 1 ? "review" : "reviews"}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 w-full lg:w-auto bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all font-semibold h-11">
                  <Star className="h-4 w-4" />
                  Share your feedback
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xl border-primary/30 bg-card/95 backdrop-blur-sm">
                <DialogHeader>
                  <DialogTitle>Leave a review</DialogTitle>
                  <DialogDescription>Public feedback shown on the landing page.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="review-name">Name</Label>
                      <Input
                        id="review-name"
                        value={reviewForm.name}
                        onChange={(e) => setReviewForm((p) => ({ ...p, name: e.target.value }))}
                        placeholder="Your name"
                        required
                        minLength={2}
                        maxLength={120}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="review-company">Company (optional)</Label>
                      <Input
                        id="review-company"
                        value={reviewForm.company}
                        onChange={(e) => setReviewForm((p) => ({ ...p, company: e.target.value }))}
                        placeholder="Your company"
                        maxLength={120}
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Rating</Label>
                      <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
                        {Array.from({ length: 5 }).map((_, i) => {
                          const value = i + 1
                          const selected = value === reviewForm.rating
                          return (
                            <button
                              key={value}
                              type="button"
                              role="radio"
                              aria-checked={selected}
                              aria-label={`${value} star${value === 1 ? "" : "s"}`}
                              className="rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background"
                              onClick={() => setReviewForm((p) => ({ ...p, rating: value }))}
                            >
                              <Star
                                className={`h-5 w-5 ${
                                  value <= reviewForm.rating
                                    ? "text-primary fill-primary"
                                    : "text-muted-foreground"
                                }`}
                              />
                            </button>
                          )
                        })}
                        <span className="ml-2 text-xs text-muted-foreground">
                          {reviewForm.rating}/5
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="review-title">Title (optional)</Label>
                      <Input
                        id="review-title"
                        value={reviewForm.title}
                        onChange={(e) => setReviewForm((p) => ({ ...p, title: e.target.value }))}
                        placeholder="Short summary"
                        maxLength={120}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="review-message">Message (optional)</Label>
                    <Textarea
                      id="review-message"
                      value={reviewForm.message}
                      onChange={(e) => setReviewForm((p) => ({ ...p, message: e.target.value }))}
                      placeholder="What did you like? What would you improve?"
                      maxLength={2000}
                    />
                  </div>

                  {reviewSubmitError && <p className="text-sm text-destructive">{reviewSubmitError}</p>}
                  {reviewSubmitSuccess && <p className="text-sm text-primary">{reviewSubmitSuccess}</p>}

                  <Button type="submit" disabled={reviewSubmitting} className="gap-2">
                    {reviewSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      <>
                        <Star className="h-4 w-4" />
                        Submit review
                      </>
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <div className="text-sm text-muted-foreground/70">
              💡 Your feedback helps other developers find the right starter.
            </div>
          </div>

          <Card className="border border-border/50 bg-card/50 shadow-sm">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl font-bold">What builders say</CardTitle>
              <CardDescription className="text-muted-foreground/80">Swipe through recent reviews from the community.</CardDescription>
            </CardHeader>
            <CardContent>
              {reviewsLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading reviews…
                </div>
              ) : reviewsError ? (
                <p className="text-sm text-destructive">{reviewsError}</p>
              ) : reviews.length === 0 ? (
                <Empty className="bg-muted/10">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Star className="h-6 w-6" />
                    </EmptyMedia>
                    <EmptyTitle>Be the first to review</EmptyTitle>
                    <EmptyDescription>
                      If this boilerplate saved you time, share a quick note—your feedback helps other builders.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button className="gap-2" onClick={() => setReviewModalOpen(true)}>
                      <Star className="h-4 w-4" />
                      Leave a review
                    </Button>
                  </EmptyContent>
                </Empty>
              ) : (
                <>
                  <Carousel
                    opts={{ align: "start", loop: reviews.length > 1 }}
                    className={
                      reviews.length >= 4
                        ? "relative pl-12 pr-12 sm:pl-14 sm:pr-14"
                        : "relative"
                    }
                  >
                    <CarouselContent>
                      {reviews.map((r) => (
                        <CarouselItem key={r.id} className="md:basis-1/2 lg:basis-1/3">
                          <button
                            type="button"
                            onClick={() => setReviewDetail(r)}
                            className="flex h-full w-full flex-col rounded-xl border border-border/50 bg-card/50 p-5 text-left transition-all duration-300 hover:border-border hover:bg-card/70 hover:shadow-md hover:shadow-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
                            aria-label={`Read full review from ${r.name}`}
                          >
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="space-y-1.5 flex-1 min-w-0">
                                <div className="text-sm font-semibold text-foreground">{r.name}</div>
                                {r.company ? <div className="text-xs text-muted-foreground/70">{r.company}</div> : null}
                                {r.title ? <div className="text-sm font-medium text-primary mt-1">{r.title}</div> : null}
                              </div>
                              <div className="flex items-center gap-0.5 flex-shrink-0">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3.5 w-3.5 ${i < r.rating ? "text-primary fill-primary" : "text-muted-foreground/20"}`}
                                  />
                                ))}
                              </div>
                            </div>

                            {r.message ? (
                              <p className="text-sm text-muted-foreground/80 line-clamp-6 whitespace-pre-wrap flex-1">
                                {r.message}
                              </p>
                            ) : (
                              <p className="text-sm text-muted-foreground/50 italic flex-1">Shared their thoughts</p>
                            )}

                            <div className="mt-3 border-t border-border/50 pt-3 text-xs text-muted-foreground/60">
                              {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </div>
                          </button>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    {reviews.length >= 4 ? (
                      <>
                        <CarouselPrevious
                          className="left-0 top-1/2 z-10 size-10 -translate-y-1/2 rounded-lg border-border/70 bg-background/95 shadow-sm backdrop-blur-sm hover:bg-muted/90 disabled:opacity-40"
                        >
                          <ChevronLeft className="size-5" strokeWidth={2.25} />
                        </CarouselPrevious>
                        <CarouselNext
                          className="right-0 top-1/2 z-10 size-10 -translate-y-1/2 rounded-lg border-border/70 bg-background/95 shadow-sm backdrop-blur-sm hover:bg-muted/90 disabled:opacity-40"
                        >
                          <ChevronRight className="size-5" strokeWidth={2.25} />
                        </CarouselNext>
                      </>
                    ) : null}
                  </Carousel>

                  <Dialog open={reviewDetail !== null} onOpenChange={(open) => !open && setReviewDetail(null)}>
                    <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col border-border/50 bg-card/95 backdrop-blur-sm">
                      {reviewDetail ? (
                        <>
                          <DialogHeader className="space-y-3 shrink-0 pr-12 text-left sm:pr-14">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="min-w-0 space-y-1">
                                <DialogTitle className="text-lg leading-snug">{reviewDetail.name}</DialogTitle>
                                {reviewDetail.company ? (
                                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{reviewDetail.company}</p>
                                ) : null}
                                {reviewDetail.title ? (
                                  <p className="text-sm font-medium text-primary">{reviewDetail.title}</p>
                                ) : null}
                              </div>
                              <div className="flex shrink-0 items-center gap-0.5" aria-hidden>
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${i < reviewDetail.rating ? "text-primary fill-primary" : "text-muted-foreground/25"}`}
                                  />
                                ))}
                              </div>
                            </div>
                            <DialogDescription className="text-xs text-muted-foreground/80">
                              {new Date(reviewDetail.createdAt).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                            {reviewDetail.message ? (
                              <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">{reviewDetail.message}</p>
                            ) : (
                              <p className="text-sm italic text-muted-foreground">No written message for this review.</p>
                            )}
                          </div>
                        </>
                      ) : null}
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── CONTACT ──────────────────────────────────────────────────────── */}
      <section id="contact" className="scroll-mt-24 border-t border-border/40 bg-background py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div>
                <h2 className="mb-3 text-3xl md:text-4xl font-bold tracking-tight text-balance">Let's connect</h2>
                <p className="text-base md:text-lg text-muted-foreground/90 leading-relaxed">
                  Have questions, feedback, or ideas? I'd love to hear from you. Reach out anytime.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button size="lg" variant="outline" className="gap-2 border-primary/30 hover:bg-primary/10 h-11" asChild>
                  <a href="mailto:contact@khalilbchir.com">
                    <Mail className="h-4 w-4" />
                    Email
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="gap-2 border-primary/30 hover:bg-primary/10 h-11" asChild>
                  <a href={LINKEDIN_URL} target="_blank" rel="noreferrer">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="gap-2 border-primary/30 hover:bg-primary/10 h-11" asChild>
                  <a href={GITHUB_PROFILE_URL} target="_blank" rel="noreferrer">
                    <Github className="h-4 w-4" />
                    GitHub
                  </a>
                </Button>
              </div>
            </div>

            <Card className="border border-border/50 bg-card/50 shadow-sm transition-colors hover:border-border">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Quick contact</CardTitle>
                <CardDescription>Direct links to connect—no forms, no spam.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full gap-2 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 h-10 font-semibold" asChild>
                    <a href="mailto:contact@khalilbchir.com">
                      <Mail className="h-4 w-4" />
                      Send an email
                    </a>
                  </Button>
                  <div className="grid sm:grid-cols-2 gap-2">
                    <Button variant="outline" className="gap-2 border-primary/30 hover:bg-primary/10 h-10" asChild>
                      <a href={LINKEDIN_URL} target="_blank" rel="noreferrer">
                        <Linkedin className="h-4 w-4" />
                        LinkedIn
                      </a>
                    </Button>
                    <Button variant="outline" className="gap-2 border-primary/30 hover:bg-primary/10 h-10" asChild>
                      <a href={GITHUB_PROFILE_URL} target="_blank" rel="noreferrer">
                        <Github className="h-4 w-4" />
                        GitHub
                      </a>
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground/60 italic pt-2">
                    💬 Your feedback helps us improve!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
