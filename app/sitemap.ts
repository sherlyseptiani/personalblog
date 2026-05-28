import { createServerClient } from '@/lib/supabase'
import type { Post } from '@/lib/types'

export default async function sitemap() {
  const baseUrl = 'https://acuriousnote.com'

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
  ]

  // Dynamic post pages
  try {
    const db = createServerClient()
    const { data: posts } = await db
      .from('posts')
      .select('slug, updated_at')
      .eq('published', true)

    const postPages = (posts || []).map((post) => ({
      url: `${baseUrl}/posts/${post.slug}`,
      lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }))

    return [...staticPages, ...postPages]
  } catch {
    return staticPages
  }
}
