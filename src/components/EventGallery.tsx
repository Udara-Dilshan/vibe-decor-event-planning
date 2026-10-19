import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Images,
  MapPin,
  X,
} from 'lucide-react'
import type { EventItem } from '../types'

const categories = [
  { value: 'All events', label: 'All Events' },
  { value: 'Wedding', label: 'Weddings' },
  { value: 'Birthday', label: 'Birthdays' },
  { value: 'Engagement', label: 'Engagements' },
  { value: 'Party', label: 'Parties' },
  { value: 'Corporate', label: 'Corporate' },
  { value: 'Religious', label: 'Religious' },
  { value: 'Decoration', label: 'Decoration' },
]

type EventGalleryProps = {
  events: EventItem[]
  limit?: number
  showFilters?: boolean
  featuredFirst?: boolean
  emptyMessage?: string
}

const englishCategoryFallback: Record<string, string> = {
  wedding: 'Wedding',
  birthday: 'Birthday',
  engagement: 'Engagement',
  party: 'Party',
  'parties & celebrations': 'Party',
  corporate: 'Corporate',
  religious: 'Religious',
  decoration: 'Decoration',
  other: 'Other',
}

function hasNonEnglishScript(value: string) {
  return /[\u0D80-\u0DFF]/.test(value)
}

function newestFirst(events: EventItem[], featuredFirst = false) {
  return [...events]
    .filter((event) => event.status === 'published')
    .sort((a, b) => {
      if (featuredFirst && Boolean(a.featured) !== Boolean(b.featured)) {
        return Number(Boolean(b.featured)) - Number(Boolean(a.featured))
      }
      const dateA = String(a.created_at || a.event_date || '')
      const dateB = String(b.created_at || b.event_date || '')
      return dateB.localeCompare(dateA)
    })
}

function matchesCategory(event: EventItem, category: string) {
  if (category === 'All events') return true
  const eventCategory = String(event.category || 'Other').trim().toLowerCase()
  const selected = category.toLowerCase()
  if (selected === 'party') {
    return ['party', 'parties & celebrations', 'anniversary', 'homecoming'].some(
      (value) => eventCategory.includes(value),
    )
  }
  if (selected === 'decoration') {
    return ['decoration', 'decor', 'styling'].some((value) => eventCategory.includes(value))
  }
  if (hasNonEnglishScript(eventCategory)) return selected === 'other'
  return eventCategory === selected || eventCategory.includes(selected)
}

function getEventImages(event: EventItem) {
  const source = [
    event.cover_image,
    ...(Array.isArray(event.gallery_images) ? event.gallery_images : []),
  ]
  return [...new Set(source.filter((image): image is string =>
    typeof image === 'string' && image.trim().length > 0,
  ))]
}

function categoryDisplay(value: string) {
  const key = value.trim().toLowerCase()
  if (hasNonEnglishScript(key)) return 'Event'
  return englishCategoryFallback[key] || value
}

function displayText(value: unknown, fallback: string) {
  if (typeof value !== 'string' || !value.trim() || hasNonEnglishScript(value)) return fallback
  return value
}

function formatEventDate(value?: string) {
  if (!value) return ''
  const parsed = new Date(`${value.slice(0, 10)}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat('en-LK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsed)
}

export default function EventGallery({
  events,
  limit,
  showFilters = true,
  featuredFirst = false,
  emptyMessage = 'Published events will appear here when they are added through the admin dashboard.',
}: EventGalleryProps) {
  const [category, setCategory] = useState('All events')
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const publishedEvents = useMemo(
    () => newestFirst(events, featuredFirst),
    [events, featuredFirst],
  )
  const filteredEvents = useMemo(
    () => publishedEvents.filter((event) => matchesCategory(event, category)),
    [publishedEvents, category],
  )
  const visibleEvents = typeof limit === 'number'
    ? filteredEvents.slice(0, limit)
    : filteredEvents
  const images = useMemo(
    () => selectedEvent ? getEventImages(selectedEvent) : [],
    [selectedEvent],
  )
  const activeImage = images[activeImageIndex] || ''

  const closeModal = () => {
    setSelectedEvent(null)
    setActiveImageIndex(0)
  }
  const showPreviousImage = () => {
    if (images.length < 2) return
    setActiveImageIndex((index) => (index - 1 + images.length) % images.length)
  }
  const showNextImage = () => {
    if (images.length < 2) return
    setActiveImageIndex((index) => (index + 1) % images.length)
  }

  useEffect(() => {
    if (!selectedEvent) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeModal()
      if (event.key === 'ArrowLeft') showPreviousImage()
      if (event.key === 'ArrowRight') showNextImage()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
    // Modal keyboard actions operate on the current selected gallery.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEvent, images.length])

  return (
    <div className="event-collection">
      {showFilters && (
        <div className="event-collection-filters" aria-label="Filter events by category">
          {categories.map((item) => (
            <button
              type="button"
              key={item.value}
              className={`event-filter-chip${category === item.value ? ' active' : ''}`}
              aria-pressed={category === item.value}
              onClick={() => setCategory(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {visibleEvents.length > 0 ? (
        <div className="event-collection-grid">
          {visibleEvents.map((event, index) => {
            const cover = event.cover_image || getEventImages(event)[0] || ''
            const date = formatEventDate(event.event_date)
            const title = displayText(event.title, 'Featured Event')
            const location = displayText(event.location, '')
            return (
              <article className="event-collection-card" key={event.id || event.slug || `${title}-${index}`}>
                <button
                  className="event-collection-card-button"
                  type="button"
                  onClick={() => { setSelectedEvent(event); setActiveImageIndex(0) }}
                  aria-label={`View details for ${title}`}
                >
                  <div className="event-collection-card-image">
                    {cover ? (
                      <img src={cover} alt={title} loading="lazy" decoding="async" />
                    ) : (
                      <div className="event-card-no-image">
                        <Images size={30} />
                        <span>Vibe Decor Event</span>
                      </div>
                    )}
                    <span className="event-collection-card-overlay" aria-hidden="true" />
                    <span className="event-collection-card-number">{String(index + 1).padStart(2, '0')}</span>
                    <span className="event-collection-card-open" aria-hidden="true"><ArrowRight size={18} /></span>
                  </div>
                  <div className="event-collection-card-copy">
                    <span className="event-collection-category">{categoryDisplay(String(event.category || 'Other'))}</span>
                    <h3>{title}</h3>
                    <div className="event-collection-meta">
                      {location && <span><MapPin size={13} />{location}</span>}
                      {date && <span><CalendarDays size={13} />{date}</span>}
                    </div>
                  </div>
                </button>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="event-collection-empty">
          <Images size={30} strokeWidth={1.4} />
          <h3>{publishedEvents.length ? 'No events in this category yet' : 'New moments are on the way'}</h3>
          <p>{publishedEvents.length ? 'Choose another category to see available events.' : emptyMessage}</p>
        </div>
      )}

      {selectedEvent && (
        <div
          className="event-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal() }}
        >
          <section className="event-modal" role="dialog" aria-modal="true" aria-labelledby="event-modal-title">
            <button className="event-modal-close" type="button" onClick={closeModal} aria-label="Close event details">
              <X size={22} />
            </button>
            <div className="event-modal-media">
              {activeImage ? <img src={activeImage} alt={`${displayText(selectedEvent.title, 'Event')} gallery image ${activeImageIndex + 1}`} /> : (
                <div className="event-card-no-image"><Images size={34} /><span>No event image added</span></div>
              )}
              {images.length > 1 && (
                <>
                  <button className="event-modal-arrow event-modal-prev" type="button" onClick={showPreviousImage} aria-label="Previous photo"><ArrowLeft size={19} /></button>
                  <button className="event-modal-arrow event-modal-next" type="button" onClick={showNextImage} aria-label="Next photo"><ArrowRight size={19} /></button>
                  <span className="event-modal-counter">{activeImageIndex + 1} / {images.length}</span>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="event-modal-thumbnails" aria-label="Event gallery thumbnails">
                {images.map((image, index) => (
                  <button key={`${image}-${index}`} type="button" className={index === activeImageIndex ? 'active' : ''} onClick={() => setActiveImageIndex(index)} aria-label={`Show photo ${index + 1}`} aria-pressed={index === activeImageIndex}>
                    <img src={image} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
            <div className="event-modal-details">
              <div className="event-modal-copy">
                <p className="eyebrow">{categoryDisplay(String(selectedEvent.category || 'Event'))}<span className="eyebrow-line" /></p>
                <h2 id="event-modal-title">{displayText(selectedEvent.title, 'Featured Event')}</h2>
                <div className="event-modal-meta">
                  {displayText(selectedEvent.location, '') && <span><MapPin size={15} />{displayText(selectedEvent.location, '')}</span>}
                  {selectedEvent.event_date && <span><CalendarDays size={15} />{formatEventDate(selectedEvent.event_date)}</span>}
                </div>
                {displayText(selectedEvent.short_description, '') && <p className="event-modal-short-description">{displayText(selectedEvent.short_description, '')}</p>}
                {displayText(selectedEvent.full_description, '') && <p className="event-modal-full-description">{displayText(selectedEvent.full_description, '')}</p>}
                {Array.isArray(selectedEvent.services) && selectedEvent.services.length > 0 && (
                  <div className="event-modal-services">
                    <h3>Services Provided</h3>
                    <div className="event-modal-service-tags">
                      {selectedEvent.services.filter((service) => !hasNonEnglishScript(String(service))).map((service) => <span key={service}>{service}</span>)}
                    </div>
                  </div>
                )}
              </div>
              <button className="event-modal-done" type="button" onClick={closeModal}>Close Details</button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
