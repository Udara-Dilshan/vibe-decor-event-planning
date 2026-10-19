import { ArrowRight, Check, Sparkles } from 'lucide-react'
import { defaultPackages, defaultSettings } from '../data/siteData'
import type { EngagementPackage, SiteSettings } from '../types'

type PackagesProps = { packages?: EngagementPackage[]; settings?: SiteSettings }

const money = (price: number) => `Rs. ${price.toLocaleString('en-LK')}.00`

export default function Packages({ packages = defaultPackages, settings = defaultSettings }: PackagesProps) {
  const number = (settings.whatsapp_number || defaultSettings.whatsapp_number).replace(/\D/g, '')
  const visiblePackages = [...packages].filter((item) => item.active !== false).sort((a, b) => a.sort_order - b.sort_order)

  return (
    <section id="packages" className="packages-section section-pad">
      <div className="page-container">
        <div className="section-heading centered-heading packages-heading">
          <p className="eyebrow">ENGAGEMENT DECORATION PACKAGES<span className="eyebrow-line" aria-hidden="true" /></p>
          <h2>Beautiful Beginnings.<span>Thoughtfully Arranged.</span></h2>
          <p>Choose the setup that feels right for your celebration. Each package can be discussed with our team before you confirm.</p>
        </div>
        <div className="packages-grid">
          {visiblePackages.map((item, index) => {
            const featureList = Array.isArray(item.features) ? item.features : []
            const addons = Array.isArray(item.add_ons) ? item.add_ons : []
            const message = `Hi Vibe Decor, I would like to enquire about the ${item.title} ( ${money(Number(item.price) || 0)} ). Please share availability and full details.`
            const href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`
            return (
              <article className={`package-card package-card-${index + 1}`} key={item.id || item.title}>
                <div className="package-image-wrap">
                  <img src={item.image || '/service1.webp'} alt={`${item.title} engagement decoration setup`} loading="lazy" decoding="async" />
                  <span className="package-number">{String(index + 1).padStart(2, '0')}</span>
                  <span className="package-image-shade" aria-hidden="true" />
                </div>
                <div className="package-card-content">
                  <div className="package-card-heading"><span className="package-kicker">ENGAGEMENT PACKAGE</span><h3>{item.title}</h3><p>{item.short_description}</p></div>
                  <div className="package-price"><span>PACKAGE PRICE</span><strong>{money(Number(item.price) || 0)}</strong></div>
                  <div className="package-detail-block"><h4>Included in this package</h4><ul>{featureList.map((feature, featureIndex) => <li key={`${item.id}-feature-${featureIndex}`}><Check size={15} aria-hidden="true" /><span>{feature}</span></li>)}</ul></div>
                  <div className="package-addons"><h4><Sparkles size={15} aria-hidden="true" /> Optional add-ons</h4><div className="package-addon-tags">{addons.map((addon, addonIndex) => <span key={`${item.id}-addon-${addonIndex}`}>{addon}</span>)}</div></div>
                  <p className="package-decoration-note">{item.decor_note}</p>
                  <p className="package-transport-note">{item.transport_note}</p>
                  <a href={href} target="_blank" rel="noreferrer" className="package-inquire-button"><span>Enquire About This Package</span><ArrowRight size={17} aria-hidden="true" /></a>
                </div>
              </article>
            )
          })}
        </div>
        <p className="packages-footnote">Final details, availability and transport charges are confirmed with the Vibe Decor team before booking.</p>
      </div>
    </section>
  )
}
