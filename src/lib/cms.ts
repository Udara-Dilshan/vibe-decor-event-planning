import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { defaultPackages, defaultServiceAreas, defaultServices, defaultSettings } from '../data/siteData'
import type { CmsRow } from '../types'

const env = import.meta.env as ImportMetaEnv & {
  VITE_SUPABASE_URL?: string
  VITE_SUPABASE_ANON_KEY?: string
}

const supabaseUrl = (env.VITE_SUPABASE_URL ?? '').trim()
const supabaseAnonKey = (env.VITE_SUPABASE_ANON_KEY ?? '').trim()
const hasPlaceholderCredentials = /YOUR_PROJECT|YOUR_SUPABASE|PLACEHOLDER/i.test(
  `${supabaseUrl} ${supabaseAnonKey}`,
)
const hasValidSupabaseUrl = (() => {
  try {
    const parsed = new URL(supabaseUrl)
    return (parsed.protocol === 'https:' || parsed.protocol === 'http:') && Boolean(parsed.hostname)
  } catch {
    return false
  }
})()

// Placeholder values are treated as missing credentials until a Supabase project is configured.
export const supabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && hasValidSupabaseUrl && !hasPlaceholderCredentials,
)
export const browserImageFallbackEnabled = import.meta.env.DEV && !supabaseConfigured
export const supabase: SupabaseClient | null = supabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null

const storageKey = (table: string) => `vibe-decor-cms-${table}`

function readLocal<T extends CmsRow>(table: string): T[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(storageKey(table))
    if (raw) return JSON.parse(raw) as T[]
  } catch {
    // Ignore malformed cached content and use the starter content.
  }
  if (table === 'packages') return defaultPackages as unknown as T[]
  if (table === 'services') return defaultServices as unknown as T[]
  if (table === 'service_areas') return defaultServiceAreas as unknown as T[]
  if (table === 'site_settings') return [defaultSettings as unknown as T]
  return []
}

function writeLocal<T extends CmsRow>(table: string, rows: T[]) {
  if (typeof window === 'undefined') throw new Error('Browser storage is only available in a browser.')
  window.localStorage.setItem(storageKey(table), JSON.stringify(rows))
}

export async function listRows<T extends CmsRow = CmsRow>(table: string, publicOnly = false): Promise<T[]> {
  if (supabase) {
    let query = supabase.from(table).select('*')
    if (publicOnly) {
      if (table === 'events') query = query.eq('status', 'published')
      else if (['services', 'packages', 'testimonials', 'videos', 'service_areas'].includes(table)) query = query.eq('active', true)
    }
    const { data, error } = await query
    if (error) throw error
    return (data ?? []) as T[]
  }
  const rows = readLocal<T>(table)
  if (!publicOnly) return rows
  if (table === 'events') return rows.filter((row) => row.status === 'published')
  if (['services', 'packages', 'testimonials', 'videos', 'service_areas'].includes(table)) return rows.filter((row) => row.active === true)
  return rows
}

export async function getPublicEventBySlug(slug: string) {
  if (supabase) {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()
    if (error) throw error
    return (data ?? null) as CmsRow | null
  }

  const rows = await listRows<CmsRow>('events', true)
  return rows.find((row) => row.slug === slug) ?? null
}

export async function saveRow<T extends CmsRow>(table: string, row: T): Promise<T> {
  const now = new Date().toISOString()
  if (supabase) {
    const payload = { ...row, updated_at: now }
    const { data, error } = await supabase.from(table).upsert(payload).select().single()
    if (error) throw error
    return data as T
  }
  const rows = readLocal<T>(table)
  const id = row.id || (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `content-${Date.now()}`)
  const normalized = {
    ...row,
    id,
    created_at: row.created_at || now,
    updated_at: now,
  } as T
  const index = rows.findIndex((item) => item.id === id)
  if (index >= 0) rows[index] = normalized
  else rows.unshift(normalized)
  writeLocal(table, rows)
  return normalized
}

export async function deleteRow(table: string, id: string) {
  if (supabase) {
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) throw error
    return
  }
  const rows = readLocal<CmsRow>(table).filter((row) => row.id !== id)
  writeLocal(table, rows)
}

async function optimizeImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || typeof createImageBitmap === 'undefined' || file.size < 700_000) return file
  try {
    const bitmap = await createImageBitmap(file)
    const maxEdge = 2000
    const ratio = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
    if (ratio === 1 && file.size < 1_500_000) { bitmap.close(); return file }
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(bitmap.width * ratio))
    canvas.height = Math.max(1, Math.round(bitmap.height * ratio))
    const context = canvas.getContext('2d')
    if (!context) { bitmap.close(); return file }
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.84))
    if (!blob || blob.size >= file.size) return file
    const name = file.name.replace(/\.[^.]+$/, '') + '.webp'
    return new File([blob], name, { type: 'image/webp', lastModified: Date.now() })
  } catch { return file }
}

export async function uploadAsset(file: File, folder: string): Promise<string> {
  if (supabase) {
    const uploadFile = await optimizeImage(file)
    const cleanName = uploadFile.name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(-100)
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 9)}-${cleanName}`
    const { error } = await supabase.storage.from('event-media').upload(path, uploadFile, {
      cacheControl: '31536000',
      upsert: false,
      contentType: uploadFile.type || undefined,
    })
    if (error) throw error
    const { data } = supabase.storage.from('event-media').getPublicUrl(path)
    return data.publicUrl
  }

  if (!browserImageFallbackEnabled) throw new Error('The media library is not configured. Connect the website database before uploading media.')
  if (file.size > 900_000) throw new Error('This upload requires the website media library to be configured.')
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read this file.'))
    reader.onerror = () => reject(new Error('Could not read this file.'))
    reader.readAsDataURL(file)
  })
}

export async function signIn(username: string, password: string) {
  if (!supabase) throw new Error('Secure admin access has not been connected yet. Configure the website database before signing in.')
  const normalized = username.trim().toLowerCase()
  const email =
  normalized === 'sidath'
    ? 'syntaxwithdilshan@gmail.com'
    : normalized
  if (!email.includes('@')) throw new Error('Enter the approved admin username.')
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data.session
}

export async function signOut() {
  if (!supabase) return
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
