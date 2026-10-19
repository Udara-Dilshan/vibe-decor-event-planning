import { Gem, Heart, UsersRound } from 'lucide-react'
import { defaultSettings } from '../data/siteData'
import type { SiteSettings } from '../types'

const defaultAboutText =
  'Vibe Decor Event Planning is an event planning and decoration business based in Badulla, Sri Lanka. We help individuals, families, couples, and organizations create meaningful celebrations through thoughtful planning, creative decoration, and reliable event coordination. From intimate gatherings to large occasions, we work to understand your vision and bring it to life with care.'

function containsUnsupportedScript(value: string) {
  return /[\u0D80-\u0DFF]/.test(value)
}

export default function About({
  settings = defaultSettings,
}: {
  settings?: SiteSettings
}) {
  const highlights = [
    { icon: Gem, title: 'Creative', second: 'Designs' },
    { icon: UsersRound, title: 'Personal', second: 'Planning' },
    { icon: Heart, title: 'Careful', second: 'Coordination' },
  ]

  const currentAboutText = settings.about_text?.trim() || ''
  const aboutText =
    !currentAboutText || containsUnsupportedScript(currentAboutText)
      ? defaultAboutText
      : currentAboutText

  return (
    <section id="about" className="about-section section-pad">
      <div className="about-grid page-container">
        <div className="about-visual">
          <div className="about-visual-frame" aria-hidden="true" />
          <img
  className="about-logo-image"
  src="/logo1.png"
  alt="Vibe Decor logo"
  loading="lazy"
  decoding="async"
/>

          <span className="image-corner image-corner-one" aria-hidden="true" />
          <span className="image-corner image-corner-two" aria-hidden="true" />
        </div>

        <div className="about-copy">
          <p className="eyebrow about-eyebrow">
            GET TO KNOW VIBE DECOR
            <span className="eyebrow-line" aria-hidden="true" />
          </p>
          <h2>
            Your Event. Your Vibe.
            <br />
            <em>Our Responsibility.</em>
          </h2>
          <p className="section-description about-description">
            {aboutText}
          </p>
          <div className="about-highlights">
            {highlights.map(({ icon: Icon, title, second }) => (
              <div className="highlight" key={title}>
                <Icon size={30} strokeWidth={1.5} aria-hidden="true" />
                <span>{title}<br />{second}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
