import { ArrowUpRight } from 'lucide-react'
import EventGallery from './EventGallery'
import type { EventItem } from '../types'

export default function Portfolio({
  events = [],
}: {
  events?: EventItem[]
}) {
  return (
    <section id="portfolio" className="portfolio-section section-pad">
      <div className="page-container">
        <div className="section-heading centered-heading portfolio-main-heading">
          <p className="eyebrow">
            OUR PORTFOLIO
            <span className="eyebrow-line" aria-hidden="true" />
          </p>
          <h2>
            Moments Worth Remembering.
            <span>Beautifully Captured.</span>
          </h2>
          <p>
            Every celebration tells a story. Here is a selection of the
            moments and details that inspire us.
          </p>
        </div>

        <EventGallery
          events={events}
          limit={6}
          featuredFirst
          showFilters
          emptyMessage="Published Vibe Decor events will appear here when they are added through the admin dashboard."
        />

        <div className="portfolio-view-all-wrap">
          <a className="portfolio-view-all" href="/portfolio">
            <span>View All Events</span>
            <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  )
}
