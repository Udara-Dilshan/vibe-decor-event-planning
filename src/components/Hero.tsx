import { useEffect, useState } from 'react'
import { ArrowRight, ArrowUpRight } from 'lucide-react'

const slides = [
  {
    eyebrow: 'EVENTS THAT TELL YOUR STORY',
    firstLine: 'Every Event Has a Vibe.',
    goldLine: 'Make Yours Unforgettable.',
    description:
      'Every celebration has its own character. Let us turn your special day into a beautiful memory you will cherish for a lifetime.',
    image: '/hero-bg1.webp',
    alt: 'Elegant wedding reception with white flowers and golden candlelight',
  },
  {
    eyebrow: 'A CELEBRATION MADE FOR YOU',
    firstLine: 'Your Vision.',
    goldLine: 'Beautifully Planned.',
    description:
      'We bring your ideas to life with thoughtful planning, creative styling, and details designed around your vision.',
    image: '/hero-bg2.webp',
    alt: 'Beautiful wedding ceremony with a floral arch and warm lighting',
  },
  {
    eyebrow: 'CELEBRATE THE MOMENTS',
    firstLine: 'Beautiful Moments.',
    goldLine: 'Lasting Memories.',
    description:
      'From birthdays to once-in-a-lifetime occasions, we help turn the moments that matter into lasting memories.',
    image: '/hero-bg3.webp',
    alt: 'Luxury outdoor wedding reception at sunset',
  },
  {
    eyebrow: 'ELEGANCE IN EVERY DETAIL',
    firstLine: 'Thoughtfully Planned.',
    goldLine: 'Beautifully Celebrated.',
    description:
      'Every detail deserves care. We bring together elegant decoration, clear planning, and dependable coordination for your event.',
    image: '/hero-bg4.webp',
    alt: 'Romantic wedding venue with chandeliers and elegant floral decorations',
  },
  {
    eyebrow: 'FROM YOUR FIRST IDEA',
    firstLine: 'Your Event.',
    goldLine: 'Our Responsibility.',
    description:
      'Leave the planning to our team and enjoy your celebration. We support your event from the first idea to the final moment.',
    image: '/hero-bg5.webp',
    alt: 'Premium wedding reception with sunset views and candlelit tables',
  },
]

export default function Hero() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length)
    }, 5000)

    return () => window.clearInterval(timer)
  }, [])

  const slide = slides[active]

  return (
    <section
      id="home"
      className="hero-section"
      aria-label="Welcome to Vibe Decor Event Planning"
    >
      {slides.map((item, index) => (
        <div
          key={item.image}
          className={`hero-image ${index === active ? 'visible' : ''}`}
          style={{
            backgroundImage:
              index === active ||
              index === (active + 1) % slides.length ||
              index === (active + slides.length - 1) % slides.length
                ? `url("${item.image}")`
                : 'none',
          }}
          role="img"
          aria-label={item.alt}
          aria-hidden={index !== active}
        />
      ))}

      <div className="hero-shade" aria-hidden="true" />

      <div className="hero-content page-container">
        <div key={slide.eyebrow} className="hero-copy">
          <p className="eyebrow hero-eyebrow">
            {slide.eyebrow}
            <span className="eyebrow-line" aria-hidden="true" />
          </p>

          <h1>
            {slide.firstLine}
            <br />
            <span>{slide.goldLine}</span>
          </h1>

          <p className="hero-description">{slide.description}</p>
        </div>

        <div className="hero-actions">
          <a className="button button-gold hero-button-primary" href="#contact">
            <span>Plan Your Event</span>
            <ArrowRight size={18} aria-hidden="true" />
          </a>

          <a className="button button-ghost hero-button-secondary" href="#portfolio">
            <span>View Our Work</span>
            <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </div>
      </div>

      <span className="hero-edge-line" aria-hidden="true" />
    </section>
  )
}
