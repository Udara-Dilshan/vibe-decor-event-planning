import { ArrowUpRight, MapPin } from 'lucide-react'
import { defaultServiceAreas } from '../data/siteData'
import type { ServiceAreaItem } from '../types'

const fallbackAreas: Record<string, { name: string; description: string }> = {
  'area-badulla': { name: 'Badulla', description: 'Our home base' },
  'area-bandarawela': { name: 'Bandarawela', description: 'Event planning and decoration' },
  'area-ella': { name: 'Ella', description: 'Intimate celebrations and destination occasions' },
  'area-mahiyanganaya': { name: 'Mahiyanganaya', description: 'Local event coordination' },
  'area-passara': { name: 'Passara', description: 'Event setups and celebrations' },
  'area-uva': { name: 'Across Uva Province', description: 'Ask us about your location' },
}

function containsUnsupportedScript(value: string) {
  return /[\u0D80-\u0DFF]/.test(value)
}

export default function ServiceAreas({
  areas = defaultServiceAreas,
}: {
  areas?: ServiceAreaItem[]
}) {
  const visibleAreas = [...areas]
    .filter((area) => area.active !== false)
    .sort((a, b) => a.sort_order - b.sort_order)

  return (
    <section id="service-areas" className="areas-section section-pad">
      <div className="areas-map-layer" aria-hidden="true"><img src="/sri-lanka-map.svg" alt="" loading="lazy" /></div>
      <div className="page-container">
        <div className="areas-layout">
          <div className="areas-intro">
            <p className="eyebrow">WHERE WE GO<span className="eyebrow-line" aria-hidden="true" /></p>
            <h2>Bringing the Vibe<br /><em>Across Uva.</em></h2>
            <p>
              Planning something special? We are based in Badulla and work
              with clients across nearby towns. Tell us where your event
              will take place.
            </p>
            <a href="#contact" className="areas-cta"><span>Plan Your Event With Us</span><ArrowUpRight size={17} aria-hidden="true" /></a>
            <div className="areas-location-note"><MapPin size={15} aria-hidden="true" /><span>BADULLA, SRI LANKA</span></div>
          </div>

          <div className="areas-list" aria-label="Vibe Decor service locations">
            {visibleAreas.map((area) => {
              const fallback = fallbackAreas[area.id]
              const name = containsUnsupportedScript(area.name) ? fallback?.name || 'Service Area' : area.name
              const description = containsUnsupportedScript(area.description) ? fallback?.description || 'Contact us to check availability in your area.' : area.description
              return (
                <article className="area-row" key={area.id || name}>
                  <span className="area-pin"><MapPin size={18} strokeWidth={1.6} aria-hidden="true" /></span>
                  <span className="area-name">{name}</span>
                  <span className="area-description">{description}</span>
                  <span className="area-arrow"><ArrowUpRight size={18} aria-hidden="true" /></span>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
