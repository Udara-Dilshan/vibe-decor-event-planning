import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import FloatingWhatsApp from '../components/FloatingWhatsApp'
import EventGallery from '../components/EventGallery'
import { defaultSettings } from '../data/siteData'
import { listRows } from '../lib/cms'
import { hardcodedEvents } from '../data/events'
import type { CmsRow, SiteSettings } from '../types'

export default function PortfolioPage() {
  const events = hardcodedEvents
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)

  useEffect(() => {
    let alive = true
    const loadPage = async () => {
      const [settingResult] = await Promise.allSettled([
        listRows<SiteSettings & CmsRow>('site_settings', true),
      ])
      if (!alive) return
      if (settingResult.status === 'fulfilled' && settingResult.value[0]) {
        setSettings({ ...defaultSettings, ...settingResult.value[0] })
      }
      document.title = 'Event Portfolio | Vibe Decor Event Planning'
      document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute(
        'content',
        'Explore weddings, birthdays, corporate events, and celebrations by Vibe Decor Event Planning in Badulla and Uva Province, Sri Lanka.',
      )
    }
    void loadPage()
    return () => { alive = false }
  }, [])

  return (
    <>
      <Navbar settings={settings} />
      <main className="portfolio-all-page">
        <section id="portfolio" className="portfolio-all-section section-pad">
          <div className="page-container">
            <a className="portfolio-back-home" href="/#home"><ArrowLeft size={15} />Back to Home</a>
            <div className="section-heading centered-heading portfolio-main-heading">
              <p className="eyebrow">THE VIBE DECOR COLLECTION<span className="eyebrow-line" /></p>
              <h1>Every Event Has a Vibe.<span>Every Memory Has a Story.</span></h1>
              <p>Explore a collection of event inspiration and celebrations designed with care.</p>
            </div>
            <EventGallery events={events} showFilters emptyMessage="Add your event details in src/data/events.ts to show them in this gallery." />
          </div>
        </section>
      </main>
      <Footer settings={settings} />
      <FloatingWhatsApp settings={settings} />
    </>
  )
}
