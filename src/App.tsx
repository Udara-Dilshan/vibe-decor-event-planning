
import { useEffect, useState } from 'react'

import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Services from './components/Services'
import Packages from './components/Packages'
import Portfolio from './components/Portfolio'
import WhyChoose from './components/WhyChoose'
import ServiceAreas from './components/ServiceAreas'
import Contact from './components/Contact'
import Footer from './components/Footer'
import FloatingWhatsApp from './components/FloatingWhatsApp'

import AdminPage from './pages/AdminPage'
import EventDetailPage from './pages/EventDetailPage'
import PortfolioPage from './pages/PortfolioPage'

import {
  defaultPackages,
  defaultServiceAreas,
  defaultServices,
  defaultSettings,
} from './data/siteData'

import { listRows } from './lib/cms'
import { hardcodedEvents } from './data/events'

import type {
  CmsRow,
  EngagementPackage,
  ServiceAreaItem,
  ServiceItem,
  SiteSettings,
} from './types'

const currentPath =
  window.location.pathname.replace(/\/+$/, '') || '/'

const eventRoute = currentPath.match(
  /^\/events\/([^/]+)$/,
)

export default function App() {
  if (currentPath === '/vibe/deco/log/adminportal/admin') {
    return <AdminPage />
  }

  if (currentPath === '/portfolio') {
    return <PortfolioPage />
  }

  if (eventRoute) {
    return (
      <EventDetailPage
        slug={decodeURIComponent(eventRoute[1])}
      />
    )
  }

  return <HomePage />
}

function HomePage() {
  const events = hardcodedEvents
  const [packages, setPackages] = useState<EngagementPackage[]>(defaultPackages)
  const [services, setServices] =
    useState<ServiceItem[]>(defaultServices)
  const [areas, setAreas] =
    useState<ServiceAreaItem[]>(defaultServiceAreas)
  const [settings, setSettings] =
    useState<SiteSettings>(defaultSettings)

  useEffect(() => {
    let alive = true

    const loadContent = async () => {
      const [
        packageRows,
        serviceRows,
        areaRows,
        settingRows,
      ] = await Promise.allSettled([
        listRows<EngagementPackage & CmsRow>('packages', true),
        listRows<ServiceItem & CmsRow>('services', true),
        listRows<ServiceAreaItem & CmsRow>(
          'service_areas',
          true,
        ),
        listRows<SiteSettings & CmsRow>(
          'site_settings',
          true,
        ),
      ])

      if (!alive) return

      if (packageRows.status === 'fulfilled' && packageRows.value.length) {
        setPackages(packageRows.value as EngagementPackage[])
      }

      if (serviceRows.status === 'fulfilled' && serviceRows.value.length) {
        setServices(serviceRows.value as ServiceItem[])
      }

      if (areaRows.status === 'fulfilled' && areaRows.value.length) {
        setAreas(areaRows.value as ServiceAreaItem[])
      }

      if (
        settingRows.status === 'fulfilled' &&
        settingRows.value[0]
      ) {
        setSettings({
          ...defaultSettings,
          ...settingRows.value[0],
        })
      }
    }

    void loadContent()

    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    document.title =
      'Vibe Decor Event Planning | Weddings & Event Decoration in Badulla'

    const description = document.querySelector(
      'meta[name="description"]',
    )

    description?.setAttribute(
      'content',
      'Event planning and decoration in Badulla, Bandarawela, Ella and Uva Province, Sri Lanka. Weddings, birthdays, celebrations and corporate events by Vibe Decor.',
    )
  }, [])

  return (
    <>
      <Navbar settings={settings} />

      <main>
        <Hero />
        <About settings={settings} />
        <Services services={services} />
        <Packages packages={packages} settings={settings} />
        <Portfolio events={events} />
        <WhyChoose />
        <ServiceAreas areas={areas} />
        <Contact settings={settings} />
      </main>

      <Footer settings={settings} />
      <FloatingWhatsApp settings={settings} />
    </>
  )
}
