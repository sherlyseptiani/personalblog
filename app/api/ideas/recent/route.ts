import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const db = createAdminClient()
  const { data, error } = await db
    .from('ideas')
    .select('content')
    .order('created_at', { ascending: false })
    .limit(3)

  if (error) return NextResponse.json({ ideas: [] })
  return NextResponse.json(
    { ideas: data ?? [] },
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
  )
}
