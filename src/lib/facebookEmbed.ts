// Facebook URL utilities

export function normalizeFacebookUrl(url: string): string {
  if (!url) return '';
  
  // Remove tracking parameters but keep the core URL
  let cleanUrl = url.split('?')[0].split('&')[0];
  
  // Handle share URLs - these are redirect URLs that need special handling
  // Facebook SDK can resolve these, so we pass them as-is
  if (cleanUrl.includes('/share/v/') || cleanUrl.includes('/share/r/')) {
    return cleanUrl;
  }
  
  // Handle Reels
  if (cleanUrl.includes('/reel/')) {
    return cleanUrl.endsWith('/') ? cleanUrl : `${cleanUrl}/`;
  }
  
  // Handle standard videos
  if (cleanUrl.includes('/videos/')) {
    return cleanUrl.endsWith('/') ? cleanUrl : `${cleanUrl}/`;
  }
  
  // Handle watch URLs
  if (cleanUrl.includes('/watch/')) {
    return cleanUrl;
  }
  
  // Handle fb.watch short URLs
  if (cleanUrl.includes('fb.watch')) {
    return cleanUrl;
  }
  
  return cleanUrl;
}

export function getAspectRatio(url: string): number {
  if (url.includes('/reel/')) {
    return 9 / 16;
  }
  return 16 / 9;
}

export function isFacebookUrl(url: string): boolean {
  if (!url) return false;
  return url.includes('facebook.com') || url.includes('fb.watch');
}
