import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { createAdminClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { content, source_page, post_slug } = body

  if (!content || typeof content !== 'string') {
    return NextResponse.json({ error: 'content is required' }, { status: 400 })
  }
  if (content.trim().length === 0) {
    return NextResponse.json({ error: 'content cannot be empty' }, { status: 400 })
  }
  if (content.length > 280) {
    return NextResponse.json({ error: 'content exceeds 280 characters' }, { status: 400 })
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  const ipHash = createHash('sha256')
    .update(ip + (process.env.ADMIN_SECRET ?? 'salt'))
    .digest('hex')

  const admin = createAdminClient()

  // Rate limit: max 3 ideas from same IP in 10 minutes
  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString()
  const { count } = await admin
    .from('ideas')
    .select('*', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .gte('created_at', since)

  if ((count ?? 0) >= 3) {
    return NextResponse.json({ error: 'Rate limit exceeded. Try again later.' }, { status: 429 })
  }

  const { error } = await admin.from('ideas').insert({
    content: content.trim(),
    source_page: source_page ?? null,
    post_slug: post_slug ?? null,
    ip_hash: ipHash,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
