import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(request: NextRequest) {
  try {
    // Check environment variables
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json({ 
        error: 'Server configuration error',
        details: 'Supabase credentials not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to Vercel environment variables.'
      }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'image';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ 
        error: 'File too large',
        details: 'Maximum file size is 5MB'
      }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const extension = file.name.split('.').pop() || 'jpg';
    const fileName = `${type}/${timestamp}-${randomStr}.${extension}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log('Uploading to bucket: oracletv-media, file:', fileName);

    // Upload to Supabase Storage
    const response = await fetch(
      `${SUPABASE_URL}/storage/v1/object/oracletv-media/${fileName}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': file.type || 'image/jpeg',
          'x-upsert': 'true',
        },
        body: buffer,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Supabase upload error:', response.status, errorText);
      
      // Check for specific errors
      if (response.status === 404) {
        return NextResponse.json({ 
          error: 'Storage bucket not found',
          details: 'The "oracletv-media" bucket does not exist. Please create it in Supabase Dashboard > Storage.'
        }, { status: 500 });
      }
      
      if (response.status === 403) {
        return NextResponse.json({ 
          error: 'Permission denied',
          details: 'Storage policies not configured. Please add public policies for the oracletv-media bucket in Supabase.'
        }, { status: 500 });
      }
      
      // Fallback: Return a data URL for small images
      if (type === 'image' && buffer.length < 500000) {
        const base64 = `data:${file.type || 'image/jpeg'};base64,${buffer.toString('base64')}`;
        return NextResponse.json({ url: base64, fallback: true });
      }
      
      return NextResponse.json({ 
        error: 'Failed to upload file',
        details: errorText
      }, { status: 500 });
    }

    const result = await response.json();
    
    // Construct public URL
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/oracletv-media/${fileName}`;

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
