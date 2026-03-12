import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

const SETTINGS_ID = 'main'

// GET - Fetch settings
export async function GET() {
  if (!isSupabaseConfigured() || !supabase) {
    // Return default settings
    return NextResponse.json({
      settings: {
        site_name: 'TRUMPETER TV',
        slider_interval: 6000,
        youtube_live_url: '',
        facebook_live_url: '',
        tv_program_queue: []
      }
    })
  }

  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', SETTINGS_ID)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    if (data) {
      return NextResponse.json({ settings: data })
    }

    // Return default settings if not found
    return NextResponse.json({
      settings: {
        id: SETTINGS_ID,
        site_name: 'TRUMPETER TV',
        slider_interval: 6000,
        youtube_live_url: '',
        facebook_live_url: '',
        tv_program_queue: []
      }
    })
  } catch (error: any) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({
      settings: {
        site_name: 'TRUMPETER TV',
        slider_interval: 6000,
        youtube_live_url: '',
        facebook_live_url: '',
        tv_program_queue: []
      }
    })
  }
}

// POST - Update settings
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured() || !supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const settings = body.settings

    if (!settings) {
      return NextResponse.json({ error: 'Settings data required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('settings')
      .upsert([{
        id: SETTINGS_ID,
        site_name: settings.site_name || 'TRUMPETER TV',
        slider_interval: settings.slider_interval || 6000,
        youtube_live_url: settings.youtube_live_url || null,
        facebook_live_url: settings.facebook_live_url || null,
        tv_program_queue: settings.tv_program_queue || [],
        updated_at: new Date().toISOString()
      }], { onConflict: 'id' })
      .select()

    if (error) throw error

    return NextResponse.json({ settings: data[0], success: true })
  } catch (error: any) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
