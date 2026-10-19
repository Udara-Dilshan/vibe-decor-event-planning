export type EventCategory = 'Wedding' | 'Birthday' | 'Engagement' | 'Party' | 'Corporate' | 'Religious' | 'Decoration' | 'Other'
export type PublishStatus = 'draft' | 'published'

export interface EventItem {
  id: string
  title: string
  slug: string
  category: EventCategory | string
  event_date: string
  location: string
  short_description: string
  full_description: string
  services: string[]
  cover_image: string
  gallery_images: string[]
  video_urls: string[]
  featured: boolean
  status: PublishStatus
  created_at?: string
  updated_at?: string
}

export interface ServiceItem {
  id: string
  title: string
  description: string
  image: string
  icon: string
  offerings: string[]
  sort_order: number
  active: boolean
}


export interface EngagementPackage {
  id: string
  title: string
  price: number
  short_description: string
  image: string
  features: string[]
  add_ons: string[]
  decor_note: string
  transport_note: string
  sort_order: number
  active: boolean
  created_at?: string
  updated_at?: string
}

export interface TestimonialItem {
  id: string
  customer_name: string
  event_type: string
  review: string
  rating: number
  photo_url: string
  active: boolean
}

export interface VideoItem {
  id: string
  title: string
  caption: string
  video_url: string
  thumbnail_url: string
  sort_order: number
  active: boolean
}

export interface ServiceAreaItem {
  id: string
  name: string
  description: string
  sort_order: number
  active: boolean
}

export interface SiteSettings {
  id: string
  about_text: string
  phone: string
  whatsapp_number: string
  email: string
  address: string
  facebook_url: string
  instagram_url: string
  tagline: string
  secondary_tagline: string
}

export type CmsRow = Record<string, unknown> & { id?: string }
