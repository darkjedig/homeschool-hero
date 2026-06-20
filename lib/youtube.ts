/**
 * YouTube URL helpers. The player needs a real video URL (watch/embed/shorts/
 * youtu.be). AI-generated lessons often contain a *search* URL instead, which
 * cannot be played — these helpers detect that so the UI can prompt for a real
 * video and show a preview.
 */

export function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/,
  );
  return m ? m[1] : null;
}

export function isYouTubeVideoUrl(url: string): boolean {
  return getYouTubeId(url) !== null;
}

export function isYouTubeSearchUrl(url: string): boolean {
  return /youtube\.com\/results\?search_query=/.test(url);
}

export function youTubeThumb(url: string): string | null {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

export function youTubeSearchQuery(url: string): string | null {
  const m = url.match(/search_query=([^&]+)/);
  return m ? decodeURIComponent(m[1]).replace(/\+/g, " ") : null;
}
