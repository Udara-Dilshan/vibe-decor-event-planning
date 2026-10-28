import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowUpRight, CalendarDays, Images, MapPin, Share2 } from 'lucide-react'
import { listRows } from '../lib/cms'
import { hardcodedEvents } from '../data/events'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import FloatingWhatsApp from '../components/FloatingWhatsApp'
import { defaultSettings } from '../data/siteData'
import type { CmsRow, EventItem, SiteSettings } from '../types'

function hasNonEnglishScript(value: string) {
  return /[\u0D80-\u0DFF]/.test(value)
}

function displayText(value: unknown, fallback = ''): string {
  if (typeof value !== 'string' || !value.trim() || hasNonEnglishScript(value)) return fallback
  return value
}

function categoryName(value: string): string {
  const normalized = value.trim().toLowerCase()
  const labels: Record<string, string> = {
    wedding: 'Wedding', birthday: 'Birthday', engagement: 'Engagement',
    party: 'Party', 'parties & celebrations': 'Party', corporate: 'Corporate',
    religious: 'Religious', decoration: 'Decoration', other: 'Other',
  }
  if (hasNonEnglishScript(value)) return 'Event'
  return labels[normalized] || value
}

function eventDateLabel(value: unknown): string {
  if (typeof value !== 'string' || !value) return ''
  const date = new Date(`${value.slice(0, 10)}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-LK', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}

export default function EventDetailPage({ slug }: { slug: string }) {
  const [event, setEvent] = useState<EventItem | null>(null)
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [failedImages, setFailedImages] = useState<string[]>([])

  useEffect(() => {
    let alive = true
    const eventRow = hardcodedEvents.find(
      (item) => item.slug === slug && item.status === 'published',
    ) ?? null
    setEvent(eventRow)
    setFailedImages([])
    setLoading(false)

    const eventTitle = displayText(eventRow?.title, 'Vibe Decor Event')
    document.title = `${eventTitle} | Vibe Decor Event Planning`
    document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute(
      'content',
      displayText(eventRow?.short_description, 'Vibe Decor Event Planning portfolio — Badulla, Sri Lanka.'),
    )
    document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute(
      'content', `${eventTitle} | Vibe Decor Event Planning`,
    )

    const loadSettings = async () => {
      try {
        const settingRows = await listRows<SiteSettings & CmsRow>('site_settings', true)
        if (!alive) return
        if (settingRows[0]) setSettings({ ...defaultSettings, ...settingRows[0] })
      } catch {
        // Keep the original site defaults when the CMS is unavailable.
      }
    }
    void loadSettings()

    return () => { alive = false }
  }, [slug])

  const images = event
    ? [...new Set([event.cover_image, ...(Array.isArray(event.gallery_images) ? event.gallery_images : [])]
      .filter((item): item is string => typeof item === 'string' && item.trim().length > 0))]
    : []
  const visibleImages = images.filter((image) => !failedImages.includes(image))
  const videos = event && Array.isArray(event.video_urls)
    ? event.video_urls.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : []
  const whatsappNumber = (settings.whatsapp_number || defaultSettings.whatsapp_number).replace(/\D/g, '')
  const title = displayText(event?.title, 'Vibe Decor Event')

  const shareEvent = async () => {
    if (navigator.share) {
      try { await navigator.share({ title, url: window.location.href }) } catch { /* Share sheet dismissed. */ }
      return
    }
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(window.location.href)
        window.alert('Event link copied.')
      } catch {
        window.prompt('Copy this link:', window.location.href)
      }
      return
    }
    window.prompt('Copy this link:', window.location.href)
  }

  const inquiryText = `Hi Vibe Decor, I would like to ask about planning an event like “${title}”.`

  return (
    <>
      <Navbar settings={settings} />
      <main className="event-detail-page page-container">
        {loading ? (
          <div className="event-detail-loading">Loading event details…</div>
        ) : event ? (
          <>
            <a href="/#portfolio" className="back-to-gallery"><ArrowLeft size={15} aria-hidden="true" />Back to Gallery</a>
            <div className="event-detail-top">
              <div>
                <p className="eyebrow">{categoryName(String(event.category || 'Other'))}<span className="eyebrow-line" aria-hidden="true" /></p>
                <h1>{title}</h1>
                <p className="event-detail-lead">{displayText(event.short_description)}</p>
                <div className="event-meta">
                  {Boolean(event.location) && <span><MapPin size={16} aria-hidden="true" />{displayText(event.location)}</span>}
                  {Boolean(event.event_date) && <span><CalendarDays size={16} aria-hidden="true" />{eventDateLabel(event.event_date)}</span>}
                </div>
              </div>
              <button className="button button-outline" type="button" onClick={() => void shareEvent()}><Share2 size={16} aria-hidden="true" />Share Event</button>
            </div>

            {images.length > 0 && (
              <div className="event-gallery">
                {visibleImages.map((image, index) => (
                  <a href={image} target="_blank" rel="noreferrer" className={index === 0 ? 'event-gallery-cover' : ''} key={`${image}-${index}`}>
                    <img
                      src={image}
                      alt={`${title} — photo ${index + 1}`}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                      onError={() => setFailedImages((current) => current.includes(image) ? current : [...current, image])}
                    />
                  </a>
                ))}
                {visibleImages.length === 0 && (
                  <div className="event-card-no-image"><Images size={34} /><span>Event photos will appear here</span></div>
                )}
              </div>
            )}

            <div className="event-detail-body">
              <div>
                <p className="eyebrow">THE EVENT STORY<span className="eyebrow-line" aria-hidden="true" /></p>
                <h2>A Beautiful Memory, Thoughtfully Created.</h2>
                <p>{displayText(event.full_description || event.short_description)}</p>
                {Array.isArray(event.services) && event.services.some((item) => String(item).trim() && !hasNonEnglishScript(String(item))) && (
                  <>
                    <h3>Services Provided</h3>
                    <div className="event-service-tags">
                      {event.services.filter((item) => String(item).trim() && !hasNonEnglishScript(String(item))).map((item) => <span key={String(item)}>{String(item)}</span>)}
                    </div>
                  </>
                )}
              </div>
              <aside className="event-detail-cta">
                <span className="eyebrow">LET’S PLAN YOUR EVENT</span>
                <h3>Make Your Special Day Unforgettable.</h3>
                <p>Share your ideas with us and start planning your celebration.</p>
                <a className="button button-gold" href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(inquiryText)}`} target="_blank" rel="noreferrer">
                  Ask on WhatsApp<ArrowUpRight size={16} aria-hidden="true" />
                </a>
              </aside>
            </div>

            {videos.length > 0 && (
              <section className="event-videos">
                <h2>Event Videos</h2>
                {videos.map((video, index) => (
                  <a href={video} target="_blank" rel="noreferrer" key={`${video}-${index}`}>Watch Video {index + 1}<ArrowUpRight size={15} aria-hidden="true" /></a>
                ))}
              </section>
            )}
          </>
        ) : (
          <div className="event-not-found">
            <span className="eyebrow">EVENT NOT FOUND</span>
            <h1>This event is currently unavailable.</h1>
            <p>It may not have been published yet, or it may have been removed from the gallery.</p>
            <a className="button button-gold" href="/#portfolio"><ArrowLeft size={16} aria-hidden="true" />Back to Portfolio</a>
          </div>
        )}
      </main>
      <Footer settings={settings} />
      <FloatingWhatsApp settings={settings} />
    </>
  )
}
