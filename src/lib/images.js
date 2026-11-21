export const FALLBACK_PROJECT_IMG =
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80'
export const FALLBACK_EXPERIENCE_IMG =
  'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=800&q=80'
export const FALLBACK_ACTIVITY_IMG =
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'

export const NO_IMAGE_SVG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="440" viewBox="0 0 640 440">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#3f9968"/><stop offset="1" stop-color="#4b3fd8"/></linearGradient></defs>
      <rect width="640" height="440" fill="url(#g)"/>
      <text x="50%" y="50%" fill="white" fill-opacity=".85" font-family="sans-serif" font-size="28"
            text-anchor="middle" dominant-baseline="middle">No Image</text></svg>`
  )

/** Dipakai di @error pada <img>: ganti dengan gambar cadangan sekali saja. */
export function onImgError(event, fallback = FALLBACK_PROJECT_IMG) {
  const img = event.target
  if (img.dataset.fallbackApplied) return
  img.dataset.fallbackApplied = '1'
  img.src = fallback
}
