import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { createHash } from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { contact, type } = await req.json()

    if (!contact || !['email', 'phone'].includes(type)) {
      return NextResponse.json({ error: 'Invalid input.' }, { status: 400 })
    }

    const trimmed = String(contact).trim()

    if (type === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
      }
    } else {
      if (!/^\+?[0-9\s\-\(\)]{7,20}$/.test(trimmed)) {
        return NextResponse.json({ error: 'Please enter a valid phone number.' }, { status: 400 })
      }
    }

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      req.headers.get('x-real-ip') ??
      'unknown'
    const ipHash = createHash('sha256').update(ip).digest('hex').slice(0, 16)

    const db = createServerClient()

    // Rate limit: 3 subscriptions per IP per hour
    const { count } = await db
      .from('subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', new Date(Date.now() - 3_600_000).toISOString())

    if ((count ?? 0) >= 3) {
      return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 })
    }

    const { error } = await db
      .from('subscribers')
      .insert({ contact: trimmed.toLowerCase(), type, ip_hash: ipHash })

    if (error) {
      if (error.code === '23505') {
        // Already subscribed — treat as success
        return NextResponse.json({ ok: true })
      }
      console.error('[subscribe]', error)
      return NextResponse.json({ error: 'Failed to save. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[subscribe] exception:', e)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
