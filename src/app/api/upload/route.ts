import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'video';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const extension = file.name.split('.').pop();
    const fileName = `${type}/${timestamp}-${randomStr}.${extension}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Supabase Storage
    const response = await fetch(
      `${SUPABASE_URL}/storage/v1/object/aotv-media/${fileName}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY}`,
          'Content-Type': file.type,
          'x-upsert': 'true',
        },
        body: buffer,
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Supabase upload error:', error);
      
      // Fallback: Return a data URL for small files
      if (type === 'image' && buffer.length < 1000000) {
        const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;
        return NextResponse.json({ url: base64 });
      }
      
      return NextResponse.json({ 
        error: 'Failed to upload file',
        details: error 
      }, { status: 500 });
    }

    const result = await response.json();
    
    // Construct public URL
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/aotv-media/${fileName}`;

    return NextResponse.json({ 
      url: publicUrl,
      path: fileName,
      Key: result.Key 
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
