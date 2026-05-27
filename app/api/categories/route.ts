import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function GET() {
  const db = createAdminClient()

  // Get unique categories from published posts
  const { data, error } = await db
    .from('posts')
    .select('category')
    .eq('published', true)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Get unique categories
  const categorySet = new Set(data?.map(p => p.category) || [])
  const categories = Array.from(categorySet).filter(Boolean).sort()

  return NextResponse.json({ categories })
}
