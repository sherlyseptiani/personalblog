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

async function getNextPost(currentPost: Post): Promise<Post | null> {
  try {
    const base = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'
    // Get all posts sorted by published_at descending (newest first)
    const res = await fetch(
      `${base}/api/posts?limit=100`,
      { next: { revalidate: 300 } }
    )
    if (!res.ok) return null
    const data = await res.json()
    const posts: Post[] = data.posts ?? []

    // Find current post index
    const currentIndex = posts.findIndex(p => p.slug === currentPost.slug)
    if (currentIndex === -1) return null

    // Return the next post (older post, next in the array since sorted desc)
    // If at the end, return the first post (loop back)
    const nextIndex = currentIndex + 1
    if (nextIndex < posts.length) {
      return posts[nextIndex]
    }
    // No next post - don't loop, just return null
    return null
  } catch {
    return null
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

  const nextPost = await getNextPost(post)
  const tocItems = extractTocItems(post.content)

  return <PostPageUI post={post} nextPost={nextPost} tocItems={tocItems} />
}
