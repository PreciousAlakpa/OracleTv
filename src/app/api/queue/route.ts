import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

interface QueueItem {
  id: string;
  video_id: string;
  order_index: number;
}

// In-memory store for queue when Supabase unavailable
let queueStore: QueueItem[] = []

// Helper function for direct Supabase REST API calls
async function supabaseRequest(table: string, options: {
  method?: string;
  body?: object;
  query?: string;
} = {}) {
  const { method = 'GET', body, query = '' } = options
  
  const headers: Record<string, string> = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
  }
  
  if (method === 'POST' || method === 'PATCH') {
    headers['Prefer'] = 'return=representation'
  }
  
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  })
  
  if (!response.ok) {
    const error = await response.text()
    console.error(`Supabase ${method} error:`, error)
    return { error, data: null }
  }
  
  const data = method !== 'DELETE' ? await response.json() : null
  return { data, error: null }
}

// GET - Fetch video queue
export async function GET() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return NextResponse.json({ queue: queueStore })
  }

  try {
    const { data, error } = await supabaseRequest('video_queue', {
      query: '?select=*&order=order_index.asc'
    })

    if (error || !data) {
      console.error('GET queue error:', error)
      return NextResponse.json({ queue: queueStore })
    }

    queueStore = data as QueueItem[]
    return NextResponse.json({ queue: data })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error fetching queue:', error)
    return NextResponse.json({ queue: queueStore, error: errorMessage }, { status: 500 })
  }
}

// POST - Add video to queue or update entire queue
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // If body is an array, replace entire queue
    if (Array.isArray(body)) {
      const newQueue = body.map((item, index) => ({
        id: item.id || crypto.randomUUID(),
        video_id: item.video_id,
        order_index: index
      }))
      
      queueStore = newQueue
      
      // Save to Supabase - delete existing and insert new
      if (SUPABASE_URL && SUPABASE_ANON_KEY) {
        // Delete all existing queue items
        await supabaseRequest('video_queue', {
          method: 'DELETE',
          query: '?id=neq.00000000-0000-0000-0000-000000000000' // Delete all
        })
        
        // Insert new queue
        if (newQueue.length > 0) {
          await supabaseRequest('video_queue', {
            method: 'POST',
            body: newQueue
          })
        }
      }
      
      return NextResponse.json({ queue: newQueue, success: true })
    }
    
    // Single item add
    const queueItem: QueueItem = {
      id: body.id || crypto.randomUUID(),
      video_id: body.video_id,
      order_index: body.order_index ?? queueStore.length
    }
    
    queueStore = [...queueStore, queueItem]
    
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      await supabaseRequest('video_queue', {
        method: 'POST',
        body: queueItem
      })
    }
    
    return NextResponse.json({ queueItem, success: true })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error updating queue:', error)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// DELETE - Remove video from queue
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Queue item ID required' }, { status: 400 })
    }
    
    queueStore = queueStore.filter(item => item.id !== id)
    
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      await supabaseRequest('video_queue', {
        method: 'DELETE',
        query: `?id=eq.${id}`
      })
    }
    
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error deleting from queue:', error)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
