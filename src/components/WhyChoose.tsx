import {
  ArrowUpRight,
  BadgeCheck,
  Handshake,
  HeartHandshake,
  MapPinned,
  Palette,
  WalletCards,
} from 'lucide-react'

const reasons = [
  {
    icon: BadgeCheck,
    title: 'Professional Coordination',
    copy: 'A clear plan and organized support to help the day run smoothly.',
  },
  {
    icon: Palette,
    title: 'Creative Decoration',
    copy: 'Thoughtful themes, styling, and details chosen around your vision.',
  },
  {
    icon: Handshake,
    title: 'One Connected Team',
    copy: 'Planning, decoration, and supplier coordination brought together.',
  },
  {
    icon: HeartHandshake,
    title: 'Personal Attention',
    copy: 'Your preferences, people, and priorities shape the celebration.',
  },
  {
    icon: WalletCards,
    title: 'Flexible Options',
    copy: 'Discuss the scope and budget to find a practical event plan.',
  },
  {
    icon: MapPinned,
    title: 'Local Knowledge',
    copy: 'Based in Badulla and serving Bandarawela, Ella, and Uva Province.',
  },
]

export default function WhyChoose() {
  return (
    <section id="why-choose" className="why-section section-pad">
      <div className="page-container">
        <div className="why-layout">
          <div className="why-intro">
            <p className="eyebrow">
              THE VIBE DECOR DIFFERENCE
              <span className="eyebrow-line" aria-hidden="true" />
            </p>
            <h2>
              Good Events Feel
              <br />
              <em>Effortless.</em>
            </h2>
            <p>
              There is a lot behind a beautiful celebration. We bring the
              details together so you can focus on the people and moments
              that matter.
            </p>
            <a href="#contact" className="why-cta">
              <span>Let’s Talk About Your Event</span>
              <ArrowUpRight size={17} aria-hidden="true" />
            </a>
            <div className="why-brand-note">
              <span>PLAN</span><i aria-hidden="true" />
              <span>CREATE</span><i aria-hidden="true" />
              <span>CELEBRATE</span><i aria-hidden="true" />
              <span>REMEMBER</span>
            </div>
          </div>

          <div className="why-grid">
            {reasons.map(({ icon: Icon, title, copy }, index) => (
              <article className="why-card" key={title}>
                <span className="why-index">{String(index + 1).padStart(2, '0')}</span>
                <div className="why-icon-wrap">
                  <Icon size={27} strokeWidth={1.45} aria-hidden="true" />
                </div>
                <h3>{title}</h3>
                <p>{copy}</p>
                <span className="why-card-bottom-line" aria-hidden="true" />
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
