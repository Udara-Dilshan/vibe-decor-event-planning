import {
  Facebook,
  Instagram,
  MapPin,
  MessageCircle,
  Phone,
  Mail,
} from 'lucide-react'
import { siteNav, defaultSettings } from '../data/siteData'
import type { SiteSettings } from '../types'

export default function Footer({
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
  const whatsappLink = `https://wa.me/${whatsappNumber}`

  const socials = [
    { label: 'Facebook', href: settings.facebook_url, icon: Facebook },
    { label: 'Instagram', href: settings.instagram_url, icon: Instagram },
    { label: 'WhatsApp', href: whatsappLink, icon: MessageCircle },
  ].filter((item) => Boolean(item.href))

  const services = [
    'Weddings',
    'Birthdays',
    'Engagements',
    'Corporate Events',
    'Religious Events',
    'Full Event Planning',
  ]

  return (
    <footer className="site-footer">
      <div className="footer-top-line" aria-hidden="true" />
      <div className="footer-main page-container">
        <div className="footer-brand-block">
          <a className="footer-brand" href="/#home" aria-label="Vibe Decor home">
            <img className="brand-logo" src="/logo.webp" alt="Vibe Decor emblem" width="50" height="50" loading="lazy" />
            <span className="brand-words">
              <span className="brand-name">VIBE DECOR</span>
              <span className="brand-subtitle">EVENT PLANNING</span>
            </span>
          </a>
          <p className="footer-tagline">{settings.tagline || defaultSettings.tagline}</p>
          <span className="footer-secondary">{settings.secondary_tagline || defaultSettings.secondary_tagline}</span>
          <div className="footer-process">
            <span>PLAN</span><i />
            <span>CREATE</span><i />
            <span>CELEBRATE</span><i />
            <span>REMEMBER</span>
          </div>
        </div>

        <div className="footer-column">
          <h3>Explore</h3>
          <nav className="footer-nav" aria-label="Footer navigation">
            {siteNav.map((link) => (
              <a href={`/${link.href}`} key={link.href}>{link.label}</a>
            ))}
            <a href="/portfolio">All Events</a>
          </nav>
        </div>

        <div className="footer-column">
          <h3>Our Services</h3>
          <nav className="footer-nav" aria-label="Footer services">
            {services.map((service) => <a href="/#services" key={service}>{service}</a>)}
          </nav>
        </div>

        <div className="footer-column footer-contact">
          <h3>Get in Touch</h3>
          <a href={`tel:${phoneLink}`}><Phone size={15} aria-hidden="true" /><span>{phone}</span></a>
          <a href={`mailto:${email}`}><Mail size={15} aria-hidden="true" /><span>{email}</span></a>
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} target="_blank" rel="noreferrer">
            <MapPin size={15} aria-hidden="true" /><span>{address}</span>
          </a>
          <div className="footer-socials">
            {socials.map(({ label, href, icon: Icon }) => (
              <a href={href} key={label} target="_blank" rel="noreferrer" aria-label={label} title={label}><Icon size={17} /></a>
            ))}
          </div>
        </div>
      </div>

      <div className="footer-bottom-wrap">
        <div className="footer-bottom page-container">
          <p>© {new Date().getFullYear()} Vibe Decor Event Planning. All rights reserved.</p>
          <span className="footer-bottom-message">Crafted for unforgettable moments.</span>
        </div>
      </div>
    </footer>
  )
}
