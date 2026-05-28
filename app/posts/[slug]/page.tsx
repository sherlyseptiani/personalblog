import { notFound } from 'next/navigation'
import PostPageUI from '@/components/PostPageUI'
import { createServerClient } from '@/lib/supabase'
import type { Post } from '@/lib/types'
import type { Metadata } from 'next'

// Force dynamic rendering - fetch fresh data on each request
export const dynamic = 'force-dynamic'

async function getPost(slug: string): Promise<Post | null> {
  try {
    const db = createServerClient()
    const { data, error } = await db
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()

    if (error || !data) {
      console.error('[SSR] getPost error:', error)
      return null
    }
    return data as Post
  } catch (e) {
    console.error('[SSR] getPost exception:', e)
    return null
  }
}

async function getNextPost(currentPost: Post): Promise<Post | null> {
  try {
    const db = createServerClient()
    const { data, error } = await db
      .from('posts')
      .select('*')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .order('id', { ascending: false })

    if (error || !data) return null

    const posts = data as Post[]
    const currentIndex = posts.findIndex(p => p.slug === currentPost.slug)
    if (currentIndex === -1) return null

    const nextIndex = currentIndex + 1
    if (nextIndex < posts.length) {
      return posts[nextIndex]
    }
    return null
  } catch {
    return null
  }
}

function extractTocItems(content: string) {
  const isHtml = /<h[23][\s>]/i.test(content)

  if (isHtml) {
    const items: { level: number; text: string; id: string }[] = []
    const re = /<h([23])(?:[^>]*\bid="([^"]*)")?[^>]*>([\s\S]*?)<\/h[23]>/gi
    let m: RegExpExecArray | null
    while ((m = re.exec(content)) !== null) {
      const level = parseInt(m[1], 10)
      const existingId = m[2] ?? ''
      const text = m[3].replace(/<[^>]+>/g, '').trim()
      const id = existingId || text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
      if (text) items.push({ level, text, id })
    }
    return items
  }

  return content
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

  const ogImage = post.post_thumbnail || 'https://acuriousnote.com/og-image.svg'

  const postUrl = `https://acuriousnote.com/posts/${post.slug}`

  const og: Metadata['openGraph'] = {
    type: 'article',
    locale: 'en_US',
    url: postUrl,
    siteName: 'A Curious Note',
    title: post.title,
    description: post.excerpt ?? undefined,
    modifiedTime: post.updated_at,
    authors: ['Sherly'],
    tags: post.category,
    images: [
      {
        url: ogImage,
        alt: post.title,
      },
    ],
  }

  if (post.published_at) {
    og.publishedTime = post.published_at
  }

  return {
    title: `${post.title} — A Curious Note`,
    description: post.excerpt ?? undefined,
    openGraph: og,
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt ?? undefined,
      images: [ogImage],
    },
    alternates: {
      canonical: postUrl,
    },
  }
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)
  if (!post) notFound()

  const nextPost = await getNextPost(post)
  const tocItems = extractTocItems(post.content)

  return <PostPageUI post={post} nextPost={nextPost} tocItems={tocItems} />
}
