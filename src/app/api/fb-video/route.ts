import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const videoUrl = searchParams.get('url')

  if (!videoUrl) {
    return NextResponse.json({ error: 'URL parameter required' }, { status: 400 })
  }

  // Generate multiple embed URL formats to test
  const embedUrls = [
    // Format 1: Standard plugins/video.php
    {
      name: 'Standard Plugin',
      url: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(videoUrl)}&show_text=0&autoplay=1`,
      html: generateIframeHtml(videoUrl, 'standard')
    },
    // Format 2: With allowfullscreen
    {
      name: 'With Fullscreen',
      url: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(videoUrl)}&show_text=0&autoplay=1&allowfullscreen=true`,
      html: generateIframeHtml(videoUrl, 'fullscreen')
    },
    // Format 3: XFBML format
    {
      name: 'XFBML',
      url: null,
      html: generateXfbmlHtml(videoUrl)
    }
  ]

  return NextResponse.json({
    originalUrl: videoUrl,
    embedUrls,
    recommended: embedUrls[0],
    xfbml: generateXfbmlHtml(videoUrl),
    script: getFbSdkScript()
  })
}

function generateIframeHtml(videoUrl: string, variant: string) {
  const params = new URLSearchParams({
    href: videoUrl,
    show_text: '0',
    show_caption: '0',
    autoplay: '1',
    allowfullscreen: 'true'
  })

  return `<iframe 
    src="https://www.facebook.com/plugins/video.php?${params.toString()}"
    width="100%"
    height="100%"
    style="border:none;overflow:hidden"
    scrolling="no"
    frameborder="0"
    allowfullscreen="true"
    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen"
  ></iframe>`
}

function generateXfbmlHtml(videoUrl: string) {
  return `<div class="fb-video" 
    data-href="${videoUrl}" 
    data-width="100%" 
    data-show-text="false" 
    data-autoplay="true"
    data-allowfullscreen="true"
  ></div>`
}

function getFbSdkScript() {
  return `<div id="fb-root"></div>
<script async defer crossorigin="anonymous" src="https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0"></script>`
}
