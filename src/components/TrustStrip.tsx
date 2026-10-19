import { CalendarHeart, Flower2, Heart, PartyPopper, Sparkles } from 'lucide-react'

const items = [
  { icon: Heart, label: 'Weddings' },
  { icon: PartyPopper, label: 'Birthdays' },
  { icon: CalendarHeart, label: 'Corporate Events' },
  { icon: Flower2, label: 'Special Celebrations' },
  { icon: Sparkles, label: 'Full Event Planning' },
]

export default function TrustStrip() {
  return <section id="trust-strip" className="trust-strip"><div className="trust-strip-inner page-container">{items.map(({ icon: Icon, label }) => <a href="#services" className="trust-item" key={label}><Icon size={20} strokeWidth={1.5} /><span>{label}</span></a>)}</div><p className="process-line">PLAN <i /> CREATE <i /> CELEBRATE <i /> REMEMBER</p></section>
}
