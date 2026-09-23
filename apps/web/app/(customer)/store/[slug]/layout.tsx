import { Metadata } from 'next'

const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/$/, '')

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const cleanSlug = decodeURIComponent(slug).trim()

  try {
    const res = await fetch(`${apiBase}/api/v1/customer/store/${encodeURIComponent(cleanSlug)}`, {
      next: { revalidate: 60 },
    })

    if (res.ok) {
      const store = await res.json()
      const storeName = store.name || cleanSlug.replace(/-/g, ' ')
      const title = `${storeName} — Digital Loyalty Pass & Rewards`
      const description = `Join ${storeName}'s loyalty club. Earn points on every purchase and unlock exclusive perks with zero app downloads.`

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          type: 'website',
          url: `/store/${cleanSlug}`,
          images: store.logoUrl ? [{ url: store.logoUrl, alt: storeName }] : undefined,
        },
        twitter: {
          card: 'summary',
          title,
          description,
          images: store.logoUrl ? [store.logoUrl] : undefined,
        },
      }
    }
  } catch {}

  const formattedName = cleanSlug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())

  return {
    title: `${formattedName} — Digital Loyalty Pass`,
    description: `Collect points and unlock exclusive perks at ${formattedName} with your digital loyalty pass.`,
  }
}

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
