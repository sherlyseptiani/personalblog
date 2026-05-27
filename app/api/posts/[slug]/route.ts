import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const db = createAdminClient()
  const { data: post, error } = await db
    .from('posts')
    .select('*')
    .eq('slug', params.slug)
    .eq('published', true)
    .single()

  if (error || !post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ post })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const authHeader = request.headers.get('Authorization')
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('posts')
    .update(body)
    .eq('slug', params.slug)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ post: data })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const authHeader = request.headers.get('Authorization')
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('posts')
    .update({ published: false })
    .eq('slug', params.slug)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
