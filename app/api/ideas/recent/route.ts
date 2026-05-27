import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const db = createServerClient()
    const { data, error } = await db
      .from('ideas')
      .select('content')
      .order('created_at', { ascending: false })
      .limit(3)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ ideas: [], error: error.message }, { status: 500 })
    }
    return NextResponse.json(
      { ideas: data ?? [] },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
    )
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json(
      { ideas: [], error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
