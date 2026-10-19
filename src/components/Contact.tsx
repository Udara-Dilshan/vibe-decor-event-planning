import {
  ArrowUpRight,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from 'lucide-react'
import { defaultSettings } from '../data/siteData'
import type { SiteSettings } from '../types'

export default function Contact({
  settings = defaultSettings,
}: {
  settings?: SiteSettings
}) {
  const phone = settings.phone || defaultSettings.phone
  const phoneLink = phone.replace(/[^\d+]/g, '')
  const whatsappNumber = (
    settings.whatsapp_number || defaultSettings.whatsapp_number
  ).replace(/\D/g, '')
  const email = settings.email || defaultSettings.email
  const address = settings.address || defaultSettings.address

  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    'Hi Vibe Decor, I would like to get more information about planning an event.',
  )}`
  const locationLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`

  const socials = [
    { label: 'Facebook', href: settings.facebook_url, icon: Facebook },
    { label: 'Instagram', href: settings.instagram_url, icon: Instagram },
  ].filter((item) => Boolean(item.href))

  return (
    <section id="contact" className="contact-section">
      <div className="contact-backdrop" aria-hidden="true" />
      <div className="contact-glow" aria-hidden="true" />

      <div className="page-container contact-shell">
        <div className="contact-heading">
          <p className="eyebrow">
            LET’S MAKE IT HAPPEN
            <span className="eyebrow-line" aria-hidden="true" />
          </p>
          <h2>
            Let’s Plan Your
            <br />
            <em>Next Event.</em>
          </h2>
          <p className="contact-intro">
            Tell us about your special day. Share your ideas and plans with
            our team, and let’s create an experience that feels uniquely yours.
          </p>
        </div>

        <div className="contact-info-grid">
          <a className="contact-info-card" href={`tel:${phoneLink}`}>
            <span className="contact-detail-icon"><Phone size={21} strokeWidth={1.5} /></span>
            <span className="contact-info-copy">
              <span className="contact-info-label">CALL US</span>
              <strong>{phone}</strong>
              <small>Speak with our team</small>
            </span>
            <ArrowUpRight className="contact-info-arrow" size={18} aria-hidden="true" />
          </a>

          <a className="contact-info-card" href={`mailto:${email}`}>
            <span className="contact-detail-icon"><Mail size={21} strokeWidth={1.5} /></span>
            <span className="contact-info-copy">
              <span className="contact-info-label">EMAIL US</span>
              <strong>{email}</strong>
              <small>Send us your ideas</small>
            </span>
            <ArrowUpRight className="contact-info-arrow" size={18} aria-hidden="true" />
          </a>

          <a className="contact-info-card" href={locationLink} target="_blank" rel="noreferrer">
            <span className="contact-detail-icon"><MapPin size={21} strokeWidth={1.5} /></span>
            <span className="contact-info-copy">
              <span className="contact-info-label">FIND US</span>
              <strong>{address}</strong>
              <small>Badulla, Sri Lanka</small>
            </span>
            <ArrowUpRight className="contact-info-arrow" size={18} aria-hidden="true" />
          </a>
        </div>

        <div className="contact-action-area">
          <p className="contact-action-label">LET’S START A CONVERSATION</p>
          <div className="contact-actions">
            <a className="contact-primary-action" href={whatsappLink} target="_blank" rel="noreferrer">
              <MessageCircle size={19} />
              <span>Chat on WhatsApp</span>
              <ArrowUpRight size={17} />
            </a>
            <a className="contact-secondary-action" href={`tel:${phoneLink}`}>
              <Phone size={17} />
              <span>Call Us</span>
            </a>
          </div>

          {socials.length > 0 && (
            <div className="contact-socials">
              <span>FOLLOW OUR JOURNEY</span>
              {socials.map(({ label, href, icon: Icon }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} title={label}>
                  <Icon size={17} />
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="contact-brand-line">
          <span />
          <p>Your Event. Your Vibe. Our Responsibility.</p>
          <span />
        </div>
      </div>
    </section>
  )
}
