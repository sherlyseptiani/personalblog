export type Category = 'essay' | 'craft' | 'field' | 'reading' | 'systems' | 'science' | 'language' | 'perspective' | 'book' | 'personal' | 'environment' | 'animal' | 'others' | 'uncategorized'

export type CoverArt = {
  p1?: string
  p2?: string
  kind?: string
  thumb?: string
}

export type Post = {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  pull_quote: string | null
  category: Category
  tags: string[]
  read_time: string | null
  issue: string | null
  cover_art: CoverArt | null
  post_thumbnail: string | null
  text_only: boolean
  featured: boolean
  published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

export type Idea = {
  id: string
  content: string
  source_page: string | null
  post_slug: string | null
  created_at: string
}
