"use client"

import Link from "next/link"
import { Coffee, ShieldCheck, Heart } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-border/60 bg-background text-foreground py-14">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand */}
          <div className="space-y-4 md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <Coffee className="h-5 w-5" />
              </div>
              <span className="text-lg font-black tracking-tight">Fidely</span>
            </Link>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-sm leading-relaxed">
              The next-generation loyalty and retention platform for specialty cafes and retail brands. Seamless Fidely Wallet passes, 1-second camera POS scans, and printable counter stands.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-foreground">All Systems Operational</span>
              <span>•</span>
              <span>v1.0 Pro</span>
            </div>
          </div>

          {/* Col 2: Product Links */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-foreground">Product</div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <a href="/#interactive-playground" className="hover:text-foreground transition-colors">
                  Fidely Wallet Simulator
                </a>
              </li>
              <li>
                <a href="/#interactive-playground" className="hover:text-foreground transition-colors">
                  Barista POS Terminal
                </a>
              </li>
              <li>
                <a href="/#interactive-playground" className="hover:text-foreground transition-colors">
                  Acrylic Stand Generator
                </a>
              </li>
              <li>
                <a href="/#features" className="hover:text-foreground transition-colors">
                  Single-Use Vouchers
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Portal Links */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-foreground">Portals</div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/auth/login" className="hover:text-foreground transition-colors">
                  Merchant Login
                </Link>
              </li>
              <li>
                <Link href="/auth/sign-up" className="hover:text-foreground transition-colors">
                  Register Cafe
                </Link>
              </li>
              <li>
                <Link href="/cashier" className="hover:text-foreground transition-colors">
                  Barista Terminal Access
                </Link>
              </li>
              <li>
                <Link href="/customer/overview" className="hover:text-foreground transition-colors">
                  Customer Passbook
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div>
            © {new Date().getFullYear()} Fidely Loyalty Systems. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="/docs" className="hover:text-foreground transition-colors">
              Documentation
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
