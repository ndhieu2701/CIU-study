export function buildYouTubeEmbedUrl(url: string) {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./, '')
    const params = new URLSearchParams({
      rel: '0',
      modestbranding: '1',
      controls: '1',
      playsinline: '1',
    })

    if (host === 'youtu.be') {
      const videoId = parsed.pathname.replace(/^\//, '').split('/')[0]
      return videoId ? `https://www.youtube.com/embed/${videoId}?${params}` : url
    }

    if (host.endsWith('youtube.com') && parsed.pathname === '/watch') {
      const videoId = parsed.searchParams.get('v')
      return videoId ? `https://www.youtube.com/embed/${videoId}?${params}` : url
    }

    if (host.endsWith('youtube.com') && parsed.pathname.startsWith('/embed/')) {
      return url
    }
  } catch {
    return url
  }

  return url
}
