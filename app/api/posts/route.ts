import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')
  const category = searchParams.get('category')
  const exclude = searchParams.get('exclude')
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '8', 10)
  const offset = (page - 1) * limit

  const db = createAdminClient()
  let query = db.from('posts').select('*', { count: 'exact' }).eq('published', true)

  if (search) {
    query = query.textSearch('search_vector', search, { type: 'websearch', config: 'english' })
  }
  if (category && category !== 'all') {
    query = query.eq('category', category)
  }
  if (exclude) {
    query = query.neq('slug', exclude)
  }

  query = query.order('published_at', { ascending: false }).order('id', { ascending: false }).range(offset, offset + limit - 1)

  const { data: posts, count, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ posts: posts ?? [], total: count ?? 0, page })
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const admin = createAdminClient()

  if (!body.slug && body.title) {
    body.slug = body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const { data, error } = await admin.from('posts').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ post: data }, { status: 201 })
}
