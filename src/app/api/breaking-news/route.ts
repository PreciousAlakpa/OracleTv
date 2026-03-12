import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

// GET - Fetch breaking news
export async function GET() {
  if (!isSupabaseConfigured() || !supabase) {
    return NextResponse.json({ news: [] })
  }

  try {
    const { data, error } = await supabase
      .from('breaking_news')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error && error.code !== 'PGRST116') throw error

    return NextResponse.json({ news: data || [] })
  } catch (error: any) {
    console.error('Error fetching breaking news:', error)
    return NextResponse.json({ news: [] })
  }
}

// POST - Create breaking news
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured() || !supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { headline, image_url, is_live } = body

    if (!headline) {
      return NextResponse.json({ error: 'Headline is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('breaking_news')
      .insert([{
        id: `news_${Date.now()}`,
        headline,
        image_url: image_url || null,
        is_live: is_live !== undefined ? is_live : false,
        created_at: new Date().toISOString()
      }])
      .select()

    if (error) throw error

    return NextResponse.json({ news: data[0], success: true })
  } catch (error: any) {
    console.error('Error creating breaking news:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Remove breaking news
export async function DELETE(request: NextRequest) {
  if (!isSupabaseConfigured() || !supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('breaking_news')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting breaking news:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
