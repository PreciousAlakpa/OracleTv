import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const shareUrl = searchParams.get('url')

  if (!shareUrl) {
    return NextResponse.json({ error: 'URL required' }, { status: 400 })
  }

  console.log('[FB Resolve] Processing URL:', shareUrl)

  try {
    // Method 1: Manual redirect following (HEAD request)
    let currentUrl = shareUrl
    let attempts = 0
    const maxAttempts = 5

    while (attempts < maxAttempts) {
      attempts++
      console.log(`[FB Resolve] Attempt ${attempts}, URL:`, currentUrl)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)

      try {
        // Use HEAD request to check for redirects
        const response = await fetch(currentUrl, {
          method: 'HEAD',
          redirect: 'manual', // Don't auto-follow, we'll handle it
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': '*/*',
          }
        })
        
        clearTimeout(timeoutId)

        const status = response.status
        const location = response.headers.get('location')
        
        console.log(`[FB Resolve] Status: ${status}, Location:`, location)

        // Check for redirect
        if ((status === 301 || status === 302 || status === 303 || status === 307 || status === 308) && location) {
          // Follow the redirect
          currentUrl = location
          
          // If it's no longer a share URL, we found the real URL
          if (!location.includes('/share/')) {
            console.log('[FB Resolve] Found real URL:', location)
            return NextResponse.json({
              success: true,
              videoId: extractVideoId(location),
              resolvedUrl: cleanUrl(location),
              originalUrl: shareUrl,
              method: 'redirect_follow'
            })
          }
          continue
        }

        // No more redirects, check if we have a valid URL
        if (!currentUrl.includes('/share/')) {
          return NextResponse.json({
            success: true,
            videoId: extractVideoId(currentUrl),
            resolvedUrl: cleanUrl(currentUrl),
            originalUrl: shareUrl,
            method: 'redirect_final'
          })
        }

        // If still a share URL, try GET request to parse HTML
        break

      } catch (fetchError: any) {
        clearTimeout(timeoutId)
        console.log('[FB Resolve] HEAD request failed:', fetchError.message)
        break
      }
    }

    // Method 2: Try GET request and parse HTML
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(currentUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        }
      })
      
      clearTimeout(timeoutId)

      const html = await response.text()
      const extracted = extractFromHtml(html)
      
      if (extracted) {
        console.log('[FB Resolve] Extracted from HTML:', extracted)
        return NextResponse.json({
          success: true,
          videoId: extractVideoId(extracted),
          resolvedUrl: extracted,
          originalUrl: shareUrl,
          method: 'html_extraction'
        })
      }
    } catch (getError: any) {
      console.log('[FB Resolve] GET request failed:', getError.message)
    }

    // Fallback: return original URL (Facebook plugin can handle share URLs)
    console.log('[FB Resolve] Using fallback URL')
    return NextResponse.json({
      success: true,
      resolvedUrl: shareUrl,
      originalUrl: shareUrl,
      method: 'fallback'
    })

  } catch (error: any) {
    console.error('[FB Resolve] Error:', error.message)
    return NextResponse.json({
      success: false,
      error: error.message,
      resolvedUrl: shareUrl
    })
  }
}

function cleanUrl(url: string): string {
  try {
    const parsed = new URL(url)
    // Remove tracking parameters
    const cleanParams = new URLSearchParams()
    // Keep only essential params if any
    return `${parsed.origin}${parsed.pathname}`
  } catch {
    return url.split('?')[0]
  }
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /\/reel\/(\d+)/,
    /\/videos\/(\d+)/,
    /\/watch\/?\?.*v=(\d+)/,
    /video_id=(\d+)/,
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

function extractFromHtml(html: string): string | null {
  // Look for reel URL in various formats
  const patterns = [
    /facebook\.com\/reel\/(\d+)/,
    /"reel_id"\s*:\s*"(\d+)"/,
    /"video_id"\s*:\s*"(\d+)"/,
    /share_url["\s:]+["']([^"']*(?:reel|video)[^"']*)["']/,
  ]
  
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match) {
      if (pattern.source.includes('reel')) {
        return `https://www.facebook.com/reel/${match[1]}/`
      }
      if (pattern.source.includes('video_id')) {
        return `https://www.facebook.com/videos/${match[1]}/`
      }
    }
  }
  
  // Look for URL in script tags
  const scriptMatch = html.match(/"url"\s*:\s*"([^"]*(?:reel|videos)[^"]*)"/)
  if (scriptMatch) {
    const decoded = scriptMatch[1].replace(/\\u0025/g, '%').replace(/\\u002F/g, '/')
    try {
      return decodeURIComponent(decoded)
    } catch {
      return decoded
    }
  }
  
  return null
}
