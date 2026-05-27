import { notFound } from 'next/navigation'
import PostPageUI from '@/components/PostPageUI'
import type { Post } from '@/lib/types'
import type { Metadata } from 'next'

async function getPost(slug: string): Promise<Post | null> {
  try {
    const base = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'
    const res = await fetch(`${base}/api/posts/${slug}`, { next: { revalidate: 300 } })
    if (!res.ok) return null
    const data = await res.json()
    return data.post ?? null
  } catch {
    return null
  }
}

async function getRelatedPosts(category: string, excludeSlug: string): Promise<Post[]> {
  try {
    const base = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'
    const res = await fetch(
      `${base}/api/posts?category=${category}&exclude=${excludeSlug}&limit=3`,
      { next: { revalidate: 300 } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return data.posts ?? []
  } catch {
    return []
  }
}

function extractTocItems(markdown: string) {
  return markdown
    .split('\n')
    .flatMap(line => {
      const m = line.match(/^(#{2,3})\s+(.+)$/)
      if (!m) return []
      const level = m[1].length
      const text = m[2].trim().replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1')
      const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
      return [{ level, text, id }]
    })
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug)
  if (!post) return {}
  return {
    title: `${post.title} — A Curious Note`,
    description: post.excerpt ?? undefined,
  }
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)
  if (!post) notFound()

  const relatedPosts = await getRelatedPosts(post.category, post.slug)
  const tocItems = extractTocItems(post.content)

  return <PostPageUI post={post} relatedPosts={relatedPosts} tocItems={tocItems} />
}
