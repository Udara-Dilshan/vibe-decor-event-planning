import { defaultServices } from '../data/siteData'
import type { ServiceItem } from '../types'

const serviceImages: Record<string, string> = {
  'service-weddings': '/service1.webp',
  'service-birthdays': '/service2.webp',
  'service-parties': '/service3.webp',
  'service-corporate': '/service4.webp',
  'service-religious': '/service5.webp',
  'service-planning': '/service6.webp',
}

const fallbackTitles: Record<string, string> = {
  'service-weddings': 'Weddings',
  'service-birthdays': 'Birthdays',
  'service-parties': 'Parties & Celebrations',
  'service-corporate': 'Corporate Events',
  'service-religious': 'Religious Events',
  'service-planning': 'Full Event Planning',
}

function containsUnsupportedScript(value: string) {
  return /[\u0D80-\u0DFF]/.test(value)
}

export default function Services({
  services = defaultServices,
}: {
  services?: ServiceItem[]
}) {
  const sourceServices = [...services]
  for (const fallback of defaultServices) {
    if (sourceServices.length >= 6) break
    if (!sourceServices.some((service) => service.id === fallback.id)) {
      sourceServices.push(fallback)
    }
  }

  const visibleServices = sourceServices
    .filter((service) => service.active !== false)
    .sort((a, b) => a.sort_order - b.sort_order)
    .slice(0, 6)

  return (
    <section id="services" className="services-section section-pad">
      <div className="page-container">
        <div className="section-heading centered-heading services-heading">
          <p className="eyebrow">WHAT WE DO<span className="eyebrow-line" aria-hidden="true" /></p>
          <h2>Events for Every Occasion.<span>Beautifully Planned.</span></h2>
          <p>Creative styling. Thoughtful planning. Every detail, brought together with care.</p>
        </div>
        <div className="services-grid">
          {visibleServices.map((service, index) => {
            const title = containsUnsupportedScript(service.title)
              ? fallbackTitles[service.id] || `Event Service ${index + 1}`
              : service.title
            // Keep the site's original service photography separate from portfolio/event photos.
            // Prefer the known service asset for the stable service ID, or its default sort position.
            const defaultService = defaultServices.find((item) => item.sort_order === service.sort_order)
            const canonicalImage = serviceImages[service.id] || defaultService?.image || ''
            const customImage = service.image && !service.image.includes('images.unsplash.com') ? service.image : ''
            const image = canonicalImage || customImage || `/service${index + 1}.webp`
            return (
              <article className="service-card service-card-minimal" key={service.id || title}>
                <div className="service-image-wrap">
                  <img src={image} alt={title} loading="lazy" decoding="async" />
                  <span className="service-image-overlay" aria-hidden="true" />
                </div>
                <div className="service-card-copy"><h3>{title}</h3></div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
