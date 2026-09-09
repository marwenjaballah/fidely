import { MarketingShell } from "@/components/common/marketing-shell"

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <MarketingShell>{children}</MarketingShell>
}
