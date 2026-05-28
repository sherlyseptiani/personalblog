import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createServerClient()

  const { data: posts, error } = await supabase
    .from('posts')
    .select('slug, title, cover_art')
    .eq('published', true)
    .order('published_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  return NextResponse.json({ posts })
}
