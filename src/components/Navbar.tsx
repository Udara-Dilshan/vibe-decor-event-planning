import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { siteNav, defaultSettings } from '../data/siteData'
import type { SiteSettings } from '../types'

export default function Navbar({
  settings = defaultSettings,
}: {
  settings?: SiteSettings
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(
    () => window.location.pathname !== '/' || window.scrollY > 24,
  )
  const [activeHref, setActiveHref] = useState(() =>
    window.location.pathname.replace(/\/$/, '') === '/portfolio'
      ? '#portfolio'
      : window.location.pathname === '/'
        ? '#home'
        : '',
  )

  useEffect(() => {
    let frame = 0

    const updateNavigation = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const path = window.location.pathname.replace(/\/$/, '') || '/'
        const isHomePage = path === '/'
        setIsScrolled(!isHomePage || window.scrollY > 24)

        // On standalone pages, keep the header solid and highlight the matching page link.
        if (!isHomePage) {
          setActiveHref(path === '/portfolio' ? '#portfolio' : '')
          return
        }

        // Highlight the last homepage section that has reached the reading line.
        const readingLine = window.scrollY + Math.min(window.innerHeight * 0.34, 220)
        let currentHref = '#home'

        for (const link of siteNav) {
          const section = document.querySelector<HTMLElement>(link.href)
          if (!section) continue

          const sectionTop = window.scrollY + section.getBoundingClientRect().top
          if (sectionTop <= readingLine) currentHref = link.href
        }

        // Near the bottom, Contact remains active even when the footer enters view.
        const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8
        if (atBottom && document.querySelector('#contact')) currentHref = '#contact'

        setActiveHref(currentHref)
      })
    }

    updateNavigation()
    window.addEventListener('scroll', updateNavigation, { passive: true })
    window.addEventListener('resize', updateNavigation)
    window.addEventListener('hashchange', updateNavigation)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', updateNavigation)
      window.removeEventListener('resize', updateNavigation)
      window.removeEventListener('hashchange', updateNavigation)
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [isOpen])

  const closeMenu = () => setIsOpen(false)

  return (
    <header
      className={`site-header${isScrolled ? ' is-scrolled' : ''}${isOpen ? ' menu-open' : ''}`}
    >
      <div className="nav-shell">
        <a
          className="brand"
          href="/#home"
          aria-label="Vibe Decor home"
          title={settings.tagline || defaultSettings.tagline}
          onClick={closeMenu}
        >
          <img className="brand-logo" src="/logo.webp" alt="" aria-hidden="true" />
          <span className="brand-words">
            <span className="brand-name">VIBE DECOR</span>
            <span className="brand-subtitle">EVENT PLANNING</span>
          </span>
        </a>

        <button
          className="mobile-menu-toggle"
          type="button"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
          aria-controls="main-navigation"
          onClick={() => setIsOpen((value) => !value)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <nav
          id="main-navigation"
          className={`main-nav${isOpen ? ' is-open' : ''}`}
          aria-label="Main navigation"
        >
          {siteNav.map((link) => (
            <a
              key={link.href}
              className={`nav-link${activeHref === link.href ? ' active' : ''}`}
              href={`/${link.href}`}
              aria-current={activeHref === link.href ? 'location' : undefined}
              onClick={closeMenu}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}
