import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

// GET - Fetch content rows
export async function GET() {
  if (!isSupabaseConfigured() || !supabase) {
    return NextResponse.json({ rows: [] })
  }

  try {
    const { data, error } = await supabase
      .from('content_rows')
      .select('*')
      .order('order_index', { ascending: true })

    if (error && error.code !== 'PGRST116') throw error

    return NextResponse.json({ rows: data || [] })
  } catch (error: any) {
    console.error('Error fetching content rows:', error)
    return NextResponse.json({ rows: [] })
  }
}

// POST - Create or update content row
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured() || !supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 403 })
  }

  try {
    const body = await request.json()
    
    // Handle bulk update (reorder)
    if (body.rows) {
      // Delete existing rows
      await supabase.from('content_rows').delete().neq('id', 'dummy')
      
      // Insert new rows
      if (body.rows.length > 0) {
        const { data, error } = await supabase
          .from('content_rows')
          .insert(body.rows.map((row: any, index: number) => ({
            id: row.id || `row_${Date.now()}_${index}`,
            title: row.title,
            videos: row.videos || [],
            order_index: index
          })))
          .select()

        if (error) throw error
        return NextResponse.json({ rows: data, success: true })
      }
      return NextResponse.json({ rows: [], success: true })
    }
    
    // Handle single row
    const { id, title, videos, order_index } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('content_rows')
      .upsert([{
        id: id || `row_${Date.now()}`,
        title,
        videos: videos || [],
        order_index: order_index || 0
      }])
      .select()

    if (error) throw error

    return NextResponse.json({ row: data[0], success: true })
  } catch (error: any) {
    console.error('Error saving content row:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Remove content row
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
      .from('content_rows')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting content row:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
