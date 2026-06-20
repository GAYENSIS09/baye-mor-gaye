interface JsonLdProps {
  data: Record<string, unknown>
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export function PersonJsonLd({ name, jobTitle, url, image, sameAs }: {
  name: string
  jobTitle?: string | null
  url?: string | null
  image?: string | null
  sameAs?: string[]
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Person',
        name,
        ...(jobTitle && { jobTitle }),
        ...(url && { url }),
        ...(image && { image }),
        ...(sameAs && sameAs.length > 0 && { sameAs }),
      }}
    />
  )
}

export function WebSiteJsonLd({ name, url, description }: {
  name: string
  url: string
  description: string
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name,
        url,
        description,
      }}
    />
  )
}

export function ArticleJsonLd({ headline, description, image, datePublished, dateModified, authorName }: {
  headline: string
  description: string
  image?: string | null
  datePublished: string
  dateModified?: string | null
  authorName: string
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline,
        description,
        ...(image && { image }),
        datePublished,
        ...(dateModified && { dateModified }),
        author: {
          '@type': 'Person',
          name: authorName,
        },
      }}
    />
  )
}

export function BreadcrumbJsonLd({ items }: {
  items: { name: string; url: string }[]
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  )
}
