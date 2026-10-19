import { ArrowRight, ArrowUpRight, CalendarDays, MapPin } from 'lucide-react'
import { inspirationGallery } from '../data/siteData'
import type { EventItem } from '../types'

export default function FeaturedEvents({ events = [] }: { events?: EventItem[] }) {
  const published = [...events].filter((event) => event.status === 'published').sort((a, b) => String(b.created_at || b.event_date || '').localeCompare(String(a.created_at || a.event_date || '')))
  const markedFeatured = published.filter((event) => event.featured)
  const featured = (markedFeatured.length ? markedFeatured : published).slice(0, 3)
  const samples = inspirationGallery.slice(0, 3)
  return <section className="featured-section section-pad"><div className="page-container"><div className="featured-heading"><div className="section-heading"><p className="eyebrow">{markedFeatured.length ? 'SELECTED MOMENTS' : published.length ? 'LATEST EVENTS' : 'SELECTED MOMENTS'} <span className="eyebrow-line" /></p><h2>Featured Celebrations</h2><p>Beautiful details begin with thoughtful planning.</p></div><a href="#portfolio" className="text-link">Explore the gallery <ArrowRight size={16} /></a></div>
    {featured.length ? <div className="featured-grid">{featured.map((event, index) => <a className={`featured-card featured-card-${index + 1}`} href={`/events/${event.slug}`} key={event.id}><img src={event.cover_image} alt={`${event.category} event in ${event.location}`} loading="lazy" /><span className="featured-card-shade" /><span className="featured-card-content"><small>{event.category}</small><strong>{event.title}</strong><span className="featured-meta">{event.location && <span><MapPin size={13} /> {event.location}</span>}{event.event_date && <span><CalendarDays size={13} /> {event.event_date}</span>}</span><span className="featured-view">View event <ArrowUpRight size={16} /></span></span></a>)}</div> : <><div className="featured-grid">{samples.map((item, index) => <button type="button" className={`featured-card featured-card-${index + 1}`} key={item.title} onClick={() => window.location.assign('#portfolio')}><img src={item.image} alt={item.alt} loading="lazy" /><span className="featured-card-shade" /><span className="featured-card-content"><small>INSPIRATION / {item.category.toUpperCase()}</small><strong>{item.title}</strong><span className="featured-view">View the gallery <ArrowUpRight size={16} /></span></span></button>)}</div><p className="sample-disclaimer">Featured Vibe Decor events will appear here when published through the admin dashboard.</p></>}
  </div></section>
}
