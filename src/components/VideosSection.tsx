import { useState } from 'react'
import { ArrowUpRight, CirclePlay, Film, X } from 'lucide-react'
import type { VideoItem } from '../types'

function youtubeEmbed(rawUrl: string) {
  try {
    const url = new URL(rawUrl)
    const host = url.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') return `https://www.youtube-nocookie.com/embed/${url.pathname.slice(1)}`
    if (host.includes('youtube.com')) {
      const id = url.searchParams.get('v') || url.pathname.match(/\/(?:shorts|embed)\/([^/?]+)/)?.[1]
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : ''
    }
  } catch { return '' }
  return ''
}

export default function VideosSection({ videos = [] }: { videos?: VideoItem[] }) {
  const [selected, setSelected] = useState<VideoItem | null>(null)
  const visible = [...videos].filter((video) => video.active !== false).sort((a, b) => a.sort_order - b.sort_order)
  return <section id="videos" className="videos-section section-pad"><div className="page-container"><div className="section-heading centered-heading"><p className="eyebrow">MOVE WITH THE MOMENT <span className="eyebrow-line" /></p><h2>Moments That Deserve to Be Remembered</h2><p>Videos, reels and behind-the-scenes glimpses from the celebrations we help bring to life.</p></div>
    {visible.length ? <div className="video-grid">{visible.map((video) => <button type="button" className="video-card" key={video.id || video.title} onClick={() => setSelected(video)}><span className="video-thumb">{video.thumbnail_url ? <img src={video.thumbnail_url} alt={video.title} loading="lazy" /> : <span className="video-placeholder-pattern"><Film size={32} /></span>}<span className="video-play"><CirclePlay size={42} strokeWidth={1.3} /></span></span><span className="video-caption"><strong>{video.title}</strong><span>{video.caption || 'A moment captured in motion'}</span><ArrowUpRight size={17} /></span></button>)}</div> : <div className="video-empty"><Film size={30} /><div><h3>Good moments, coming soon</h3><p>Event videos and reels added by Vibe Decor will appear here.</p></div><a href="#contact" className="text-link">Talk to our team <span>→</span></a></div>}
  </div>
  {selected && <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={selected.title} onClick={() => setSelected(null)}><button className="modal-close" aria-label="Close video" onClick={() => setSelected(null)}><X size={22} /></button><div className="video-modal" onClick={(event) => event.stopPropagation()}>{youtubeEmbed(selected.video_url) ? <iframe src={youtubeEmbed(selected.video_url)} title={selected.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /> : selected.video_url.startsWith('data:video') || /\.(mp4|webm|ogg)(\?|$)/i.test(selected.video_url) ? <video src={selected.video_url} controls autoPlay /> : <div className="video-external"><Film size={34} /><h3>{selected.title}</h3><p>This video is hosted on an external platform.</p><a className="button button-gold" href={selected.video_url} target="_blank" rel="noreferrer">Watch video <ArrowUpRight size={16} /></a></div>}</div></div>}
  </section>
}
