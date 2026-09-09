type MarketingArticleProps = {
  title: string
  description?: string
  children: React.ReactNode
}

export function MarketingArticle({ title, description, children }: MarketingArticleProps) {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-14 lg:px-8 lg:py-20">
      <header className="mb-12 space-y-4 border-b border-border/80 pb-10">
        <h1 className="text-4xl font-bold tracking-tight text-balance text-foreground">{title}</h1>
        {description ? (
          <p className="text-lg leading-relaxed text-muted-foreground text-pretty">{description}</p>
        ) : null}
      </header>
      <article className="marketing-article text-[15px] leading-relaxed text-muted-foreground">
        {children}
      </article>
    </div>
  )
}
