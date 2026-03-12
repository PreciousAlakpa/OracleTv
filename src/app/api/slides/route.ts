import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory store for slides when Supabase is slow/unavailable
let slidesStore: Array<{ id: string; imageUrl: string; title: string }> = []

// Helper to check Supabase config
async function getSupabaseClient() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) return null
    const { createClient } = await import('@supabase/supabase-js')
    return createClient(url, key)
  } catch {
    return null
  }
}

export async function GET() {
  const supabase = await getSupabaseClient()
  
  if (!supabase) {
    return NextResponse.json({ slides: slidesStore })
  }
  
  try {
    const { data, error } = await supabase
      .from('slides')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('GET slides error:', error)
      return NextResponse.json({ slides: slidesStore })
    }
    
    const slides = (data || []).map((s: Record<string, unknown>) => ({ 
      id: s.id as string, 
      image_url: s.image_url || s.imageUrl, 
      title: s.title || '' 
    }))
    
    slidesStore = slides
    
    return NextResponse.json({ slides })
  } catch (e) {
    console.error('GET slides exception:', e)
    return NextResponse.json({ slides: slidesStore })
  }
}

export async function POST(request: NextRequest) {
  const supabase = await getSupabaseClient()
  
  try {
    const body = await request.json()
    const slide = body.slide || body
    
    if (!slide.imageUrl && !slide.image_url) {
      return NextResponse.json({ error: 'Image URL required' }, { status: 400 })
    }
    
    const image_url = slide.imageUrl || slide.image_url
    const title = slide.title || 'Slider Image'
    const id = slide.id || crypto.randomUUID()
    
    const newSlide = { id, image_url, title }
    
    slidesStore = [newSlide, ...slidesStore]
    
    if (supabase) {
      try {
        await supabase.from('slides').insert([{
          id: id,
          image_url: image_url,
          title: title
        }])
      } catch (e) {
        console.error('POST slides save error:', e)
      }
    }
    
    return NextResponse.json({ slide: newSlide, success: true })
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error'
    console.error('POST slides exception:', e)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = await getSupabaseClient()
  
  try {
    const id = new URL(request.url).searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }
    
    slidesStore = slidesStore.filter(s => s.id !== id)
    
    if (supabase) {
      try {
        await supabase.from('slides').delete().eq('id', id)
      } catch (e) {
        console.error('DELETE slides error:', e)
      }
    }
    
    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error'
    console.error('DELETE slides exception:', e)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
