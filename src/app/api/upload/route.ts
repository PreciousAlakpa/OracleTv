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
        details: 'Supabase credentials not configured.'
      }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'image';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ 
        error: 'File too large',
        details: 'Maximum file size is 10MB'
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

    console.log('Uploading to bucket: oracletv-media, file:', fileName, 'size:', file.size);

    // Determine content type
    let contentType = file.type || 'image/jpeg';
    if (!contentType.startsWith('image/')) {
      contentType = 'image/jpeg';
    }

    // Upload to Supabase Storage
    const response = await fetch(
      `${SUPABASE_URL}/storage/v1/object/oracletv-media/${fileName}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': contentType,
          'x-upsert': 'true',
        },
        body: buffer,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Supabase upload error:', response.status, errorText);
      
      // Fallback: Return base64 for any image under 2MB
      if (type === 'image' && buffer.length < 2000000) {
        const base64 = `data:${contentType};base64,${buffer.toString('base64')}`;
        console.log('Using base64 fallback, size:', base64.length);
        return NextResponse.json({ url: base64, fallback: true });
      }
      
      return NextResponse.json({ 
        error: 'Upload failed. Try a smaller image (under 2MB)',
        details: `Error: ${response.status}`
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
