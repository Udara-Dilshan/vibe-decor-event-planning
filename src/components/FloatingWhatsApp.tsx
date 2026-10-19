import { defaultSettings } from '../data/siteData'
import type { SiteSettings } from '../types'

function WhatsAppIcon({ size = 30 }: { size?: number }) {
  return (
    <img
      src="https://img.icons8.com/color/48/whatsapp--v1.png"
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      decoding="async"
    />
  )
}

export default function FloatingWhatsApp({
  settings = defaultSettings,
}: {
  settings?: SiteSettings
}) {
  const text = 'Hi Vibe Decor, I would like to get more information about planning an event.'
  const number = (settings.whatsapp_number || defaultSettings.whatsapp_number).replace(/\D/g, '')
  const url = `https://wa.me/${number}?text=${encodeURIComponent(text)}`

  return (
    <a className="floating-whatsapp" href={url} target="_blank" rel="noreferrer" aria-label="Chat with Vibe Decor on WhatsApp" title="Chat with Vibe Decor on WhatsApp">
      <WhatsAppIcon size={38} />
    </a>
  )
}
