import { useCallback, useEffect, useMemo, useState, useRef, type ChangeEvent, type FormEvent } from 'react'
import {
  Activity, ArrowLeft, ArrowUpRight, BadgeCheck, CalendarDays, Check, ChevronRight,
  FileImage, FolderOpen, Gauge, LayoutDashboard, LogOut, MapPin, Package as PackageIcon,
  Plus, Save, Settings2, ShieldCheck, Trash2, Upload, Menu, X,
} from 'lucide-react'
import { defaultSettings } from '../data/siteData'
import { deleteRow, listRows, saveRow, signIn, signOut, supabase, supabaseConfigured, uploadAsset } from '../lib/cms'
import { slugify } from '../lib/slugify'
import type { CmsRow } from '../types'

type TabKey = 'dashboard' | 'events' | 'services' | 'packages' | 'service_areas' | 'site_settings'
type FieldSpec = { key: string; label: string; type?: 'text' | 'textarea' | 'date' | 'number' | 'checkbox' | 'select' | 'url' | 'email'; placeholder?: string; options?: string[]; helper?: string; rows?: number }

const tabs: { key: TabKey; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'events', label: 'Events', icon: CalendarDays },
  { key: 'services', label: 'Services', icon: FolderOpen },
  { key: 'packages', label: 'Packages', icon: PackageIcon },
  { key: 'service_areas', label: 'Service areas', icon: MapPin },
  { key: 'site_settings', label: 'Contact & settings', icon: Settings2 },
]

const fields: Record<Exclude<TabKey, 'dashboard'>, FieldSpec[]> = {
  events: [
    { key: 'title', label: 'Event title', placeholder: 'A short, descriptive event title' },
    { key: 'category', label: 'Event category', type: 'select', options: ['Wedding', 'Birthday', 'Engagement', 'Party', 'Corporate', 'Religious', 'Decoration', 'Other'] },
    { key: 'event_date', label: 'Event date', type: 'date' },
    { key: 'location', label: 'Location', placeholder: 'Town or venue' },
    { key: 'short_description', label: 'Short description', type: 'textarea', rows: 2, placeholder: 'A short summary shown on the portfolio card' },
    { key: 'full_description', label: 'Full event description', type: 'textarea', rows: 4, placeholder: 'Describe the event and the work carried out' },
    { key: 'services', label: 'Services provided', type: 'textarea', rows: 2, placeholder: 'Wedding planning, decoration, coordination', helper: 'Separate each service with a comma.' },
    { key: 'cover_image', label: 'Thumbnail / cover image URL', type: 'url', placeholder: 'https://…', helper: 'This image appears on the portfolio card. Or upload one below.' },
    { key: 'gallery_images', label: 'Gallery image URLs', type: 'textarea', rows: 3, placeholder: 'Paste one image URL per line' },
    { key: 'video_urls', label: 'Video URLs', type: 'textarea', rows: 2, placeholder: 'Paste YouTube, Instagram, Facebook or hosted video URLs' },
    { key: 'featured', label: 'Feature on homepage', type: 'checkbox' },
    { key: 'status', label: 'Publishing status', type: 'select', options: ['draft', 'published'] },
  ],
  services: [
    { key: 'title', label: 'Service name', placeholder: 'e.g. Wedding planning' },
    { key: 'description', label: 'Short description', type: 'textarea', rows: 3 },
    { key: 'offerings', label: 'What is included', type: 'textarea', rows: 3, helper: 'Separate each item with a comma.' },
    { key: 'image', label: 'Image URL', type: 'url', placeholder: 'https://…' },
    { key: 'icon', label: 'Icon identifier', placeholder: 'rings, cake, sparkles, briefcase, flower, calendar' },
    { key: 'sort_order', label: 'Display order', type: 'number' },
    { key: 'active', label: 'Show on website', type: 'checkbox' },
  ],
  packages: [
    { key: 'title', label: 'Package name', placeholder: 'Basic Package' },
    { key: 'price', label: 'Price (LKR)', type: 'number', placeholder: '24500' },
    { key: 'short_description', label: 'Short description', type: 'textarea', rows: 2 },
    { key: 'features', label: 'Included features', type: 'textarea', rows: 6, helper: 'One item per line, in the brochure order.' },
    { key: 'add_ons', label: 'Optional add-ons', type: 'textarea', rows: 4, helper: 'One item per line.' },
    { key: 'decor_note', label: 'Decoration note', type: 'text' },
    { key: 'transport_note', label: 'Transport note', type: 'text' },
    { key: 'image', label: 'Package photo URL', type: 'url', placeholder: 'https://… or upload below' },
    { key: 'sort_order', label: 'Display order', type: 'number' },
    { key: 'active', label: 'Show on website', type: 'checkbox' },
  ],
  service_areas: [
    { key: 'name', label: 'Area / town name' },
    { key: 'description', label: 'Short description', type: 'textarea', rows: 2 },
    { key: 'sort_order', label: 'Display order', type: 'number' },
    { key: 'active', label: 'Show on website', type: 'checkbox' },
  ],
  site_settings: [
    { key: 'about_text', label: 'About Vibe Decor', type: 'textarea', rows: 5 },
    { key: 'tagline', label: 'Main tagline', type: 'textarea', rows: 2 },
    { key: 'secondary_tagline', label: 'Secondary brand line', type: 'text' },
    { key: 'phone', label: 'Phone number', type: 'text' },
    { key: 'whatsapp_number', label: 'WhatsApp number with country code', type: 'text', placeholder: '94781800001', helper: 'Digits only, with Sri Lanka country code 94.' },
    { key: 'email', label: 'Business email', type: 'email' },
    { key: 'address', label: 'Business address', type: 'textarea', rows: 2 },
    { key: 'facebook_url', label: 'Facebook URL', type: 'url' },
    { key: 'instagram_url', label: 'Instagram URL', type: 'url' },
  ],
}

const freshRecord = (tab: Exclude<TabKey, 'dashboard'>): CmsRow => {
  const defaults: Record<string, unknown> = { active: true, sort_order: 1, featured: false, status: 'draft', category: 'Wedding', event_date: '', services: [], offerings: [], features: [], add_ons: [], gallery_images: [], video_urls: [] }
  return tab === 'site_settings' ? { ...defaultSettings } : defaults
}

function asInput(value: unknown, type = 'text'): string {
  if (value === null || value === undefined) return ''
  if (Array.isArray(value)) return value.join(type === 'textarea' ? '\n' : ', ')
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  return String(value)
}

function titleForRow(tab: TabKey, row: CmsRow): string {
  const keys: Record<TabKey, string[]> = {
    dashboard: ['title'], events: ['title'], services: ['title'], packages: ['title'], service_areas: ['name'], site_settings: ['id'],
  }
  for (const key of keys[tab]) if (row[key] !== undefined && row[key] !== '') return String(row[key])
  return 'Untitled item'
}

export default function AdminPage() {
  const [tab, setTab] = useState<TabKey>('dashboard')
  const [records, setRecords] = useState<Record<string, CmsRow[]>>({})
  const [editing, setEditing] = useState<CmsRow | null>(null)
  const [sessionReady, setSessionReady] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [tableLoading, setTableLoading] = useState(false)
  const pendingTableLoads = useRef(0)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)
  const [uploadingField, setUploadingField] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!mobileMenuOpen) return
    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [mobileMenuOpen])

  const canShowDashboard = authenticated
  const visibleTab = tab === 'dashboard' ? null : tab

  const loadTable = useCallback(async (table: Exclude<TabKey, 'dashboard'>) => {
    pendingTableLoads.current += 1
    setTableLoading(true)
    try {
      const rows = await listRows<CmsRow>(table)
      setRecords((previous) => ({ ...previous, [table]: rows }))
    } catch (error) {
      setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Could not load content.' })
    } finally {
      pendingTableLoads.current = Math.max(0, pendingTableLoads.current - 1)
      setTableLoading(pendingTableLoads.current > 0)
    }
  }, [])

  const checkAdmin = useCallback(async (sessionOverride?: { user: { id: string } } | null) => {
    if (!supabase) { setSessionReady(true); return }
    try {
      const session = sessionOverride === undefined ? (await supabase.auth.getSession()).data.session : sessionOverride
      if (!session) { setAuthenticated(false); setSessionReady(true); return }
      const { data, error } = await supabase.from('admin_users').select('user_id').eq('user_id', session.user.id).maybeSingle()
      if (error || !data) {
        setAuthenticated(false)
        setNotice({ type: 'error', text: 'This account is not approved to manage Vibe Decor. Ask the project owner to grant admin access.' })
      } else setAuthenticated(true)
    } catch {
      setAuthenticated(false)
      setNotice({ type: 'error', text: 'Could not verify admin access. Check your Supabase configuration.' })
    } finally { setSessionReady(true) }
  }, [])

  useEffect(() => {
    void checkAdmin()
    if (!supabase) return
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) { setAuthenticated(false); setSessionReady(true) }
      else queueMicrotask(() => { void checkAdmin(session) })
    })
    return () => authListener.subscription.unsubscribe()
  }, [checkAdmin])

  useEffect(() => {
    if (!canShowDashboard || tab === 'dashboard') return
    void loadTable(tab)
  }, [canShowDashboard, tab, loadTable])

  useEffect(() => {
    if (!canShowDashboard || tab !== 'dashboard') return
    void Promise.all((['events', 'services', 'packages', 'service_areas', 'site_settings'] as const).map(loadTable))
  }, [canShowDashboard, tab, loadTable])

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setLoading(true); setNotice(null)
    try {
      await signIn(loginUsername.trim(), loginPassword)
      setLoginPassword('')
      await checkAdmin()
    } catch (error) { setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Sign in failed.' }) }
    finally { setLoading(false) }
  }

  const handleLogout = async () => {
    try { await signOut() } catch (error) { setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Could not sign out.' }) }
    setAuthenticated(false); setEditing(null); setTab('dashboard'); setMobileMenuOpen(false)
  }

  const startNew = () => {
    if (tab === 'dashboard') return
    setEditing(freshRecord(tab))
    setNotice(null)
  }

  const startEdit = (row: CmsRow) => { setEditing({ ...row }); setNotice(null) }

  const handleUpload = async (field: string, fileList: FileList | null, mode: 'single' | 'multiple' = 'single') => {
    if (!editing || !fileList?.length) return
    const files = Array.from(fileList)
    setUploadingField(field); setNotice(null)
    try {
      const uploaded: string[] = []
      for (const file of files) uploaded.push(await uploadAsset(file, tab))
      const priorValue = editing[field]
      if (mode === 'multiple') {
        const prior = Array.isArray(priorValue) ? priorValue.map(String) : typeof priorValue === 'string' ? priorValue.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean) : []
        setEditing((previous) => previous ? { ...previous, [field]: [...prior, ...uploaded] } : previous)
      } else setEditing((previous) => previous ? { ...previous, [field]: uploaded[0] } : previous)
      setNotice({ type: 'success', text: `${uploaded.length} file${uploaded.length === 1 ? '' : 's'} uploaded.` })
    } catch (error) { setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Upload failed.' }) }
    finally { setUploadingField(null) }
  }

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editing || tab === 'dashboard') return
    setSaving(true); setNotice(null)
    try {
      const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null
      const payload: CmsRow = { ...editing }
      if (tab === 'events' && (submitter?.value === 'draft' || submitter?.value === 'published')) payload.status = submitter.value
      if (tab === 'events') {
        const baseSlug = slugify(String(payload.title || 'event')) || 'event'
        const usedSlugs = new Set((records.events ?? []).filter((item) => item.id !== payload.id).map((item) => String(item.slug || '')))
        let uniqueSlug = baseSlug
        let suffix = 2
        while (usedSlugs.has(uniqueSlug)) uniqueSlug = `${baseSlug}-${suffix++}`
        payload.slug = uniqueSlug
        if (payload.event_date === '') payload.event_date = null
        for (const key of ['services', 'gallery_images', 'video_urls']) {
          const value = payload[key]
          if (typeof value === 'string') payload[key] = value.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean)
        }
        payload.featured = Boolean(payload.featured)
        payload.status = payload.status === 'published' ? 'published' : 'draft'
      }
      if (tab === 'services' && typeof payload.offerings === 'string') payload.offerings = payload.offerings.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean)
      if (tab === 'packages') {
        for (const key of ['features', 'add_ons']) {
          const value = payload[key]
          if (typeof value === 'string') payload[key] = value.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean)
        }
        payload.price = Math.max(0, Number(payload.price) || 0)
        payload.active = Boolean(payload.active)
      }
      if (['services', 'service_areas'].includes(tab)) payload.active = Boolean(payload.active)
      if (tab === 'site_settings') payload.id = 'main'
      await saveRow(tab, payload)
      await loadTable(tab)
      setEditing(null)
      setNotice({ type: 'success', text: 'Saved successfully.' })
    } catch (error) { setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Could not save this item.' }) }
    finally { setSaving(false) }
  }

  const handleDelete = async (row: CmsRow) => {
    if (!row.id || tab === 'dashboard') return
    if (!window.confirm(`Delete “${titleForRow(tab, row)}”? This cannot be undone.`)) return
    try { await deleteRow(tab, String(row.id)); await loadTable(tab); setNotice({ type: 'success', text: 'Item deleted.' }) }
    catch (error) { setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Could not delete the item.' }) }
  }

  const currentRows = visibleTab ? records[visibleTab] ?? [] : []
  const filteredRows = useMemo(() => currentRows.filter((row) => JSON.stringify(row).toLowerCase().includes(search.toLowerCase())), [currentRows, search])

  if (!sessionReady) return <div className="admin-loading"><span className="admin-spinner" /><p>Checking admin access…</p></div>
  if (!canShowDashboard) return <div className="admin-login-shell"><a href="/#home" className="back-to-site"><ArrowLeft size={16} /> Back to website</a><form className="admin-login-card" onSubmit={handleLogin}><div className="admin-login-mark">V</div><p className="eyebrow centered">PRIVATE CONTENT MANAGEMENT</p><h1>Vibe Decor <em>Admin</em></h1><p className="admin-muted">Sign in to manage events, photos, services, packages and website details.</p>
    {supabaseConfigured ? <><label>Username<input type="text" autoComplete="username" value={loginUsername} onChange={(event) => setLoginUsername(event.target.value)} placeholder="Sidath" required /></label><label>Password<input type="password" autoComplete="current-password" value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} required /></label><button className="button button-gold full-width" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in securely'} <ArrowUpRight size={16} /></button></> : <div className="setup-alert"><ShieldCheck size={20} /><div><strong>Admin access needs configuration</strong><p>Connect the website database and approve the owner account before using this dashboard.</p></div></div>}
    {notice && <p className={`admin-notice ${notice.type}`} role="status">{notice.text}</p>}<p className="login-footnote"><ShieldCheck size={13} /> Only approved owner accounts should have access to the live dashboard.</p>
  </form></div>

  return <div className={`admin-shell${mobileMenuOpen ? ' mobile-menu-open' : ''}`}>
    <aside className="admin-sidebar" id="admin-navigation" aria-label="Admin navigation"><button type="button" className="admin-sidebar-close" aria-label="Close navigation menu" onClick={() => setMobileMenuOpen(false)}><X size={21} /></button><a className="admin-brand" href="/#home"><span className="admin-brand-mark">V</span><span><strong>VIBE DECOR</strong><small>CONTENT STUDIO</small></span></a><div className="admin-side-label">WORKSPACE</div><nav>{tabs.map(({ key, label, icon: Icon }) => <button type="button" key={key} className={`admin-nav-item ${tab === key ? 'active' : ''}`} onClick={() => { setTab(key); setEditing(null); setNotice(null); setSearch(''); setMobileMenuOpen(false) }}><Icon size={18} /><span>{label}</span>{tab === key && <ChevronRight size={15} />}</button>)}</nav><div className="admin-sidebar-bottom"><div className="admin-status-dot" /><span>Secure owner session</span><button onClick={handleLogout} type="button" aria-label="Sign out"><LogOut size={17} /></button></div></aside>
    {mobileMenuOpen && <button type="button" className="admin-sidebar-backdrop" aria-label="Close navigation menu" onClick={() => setMobileMenuOpen(false)} />}
    <main className="admin-main"><header className="admin-topbar"><button type="button" className="admin-mobile-menu-toggle" aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-controls="admin-navigation" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen((open) => !open)}>{mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}</button><div className="admin-topbar-copy"><span className="admin-breadcrumb">Workspace <ChevronRight size={13} /> {tabs.find((item) => item.key === tab)?.label}</span><h1>{tab === 'dashboard' ? 'Good to see you.' : tab === 'site_settings' ? 'Contact & settings' : `Manage ${tabs.find((item) => item.key === tab)?.label.toLowerCase()}`}</h1></div><div className="admin-topbar-actions"><a className="preview-site-link" href="/#home" target="_blank" rel="noreferrer">View website <ArrowUpRight size={15} /></a>{visibleTab && tab !== 'site_settings' && <button className="button button-gold admin-add-button" onClick={startNew}><Plus size={17} /> Add new</button>}</div></header>
    {notice && <div className={`admin-notice admin-notice-bar ${notice.type}`} role="status">{notice.type === 'success' ? <Check size={16} /> : <Activity size={16} />}{notice.text}<button aria-label="Dismiss message" onClick={() => setNotice(null)}>×</button></div>}
    {tab === 'dashboard' ? <Dashboard records={records} onNavigate={(nextTab) => { setTab(nextTab); setNotice(null) }} onAdd={(nextTab) => { setTab(nextTab); setEditing(freshRecord(nextTab)); setNotice(null) }} /> : editing ? <Editor tab={tab as Exclude<TabKey, 'dashboard'>} editing={editing} setEditing={setEditing} fields={fields[tab as Exclude<TabKey, 'dashboard'>]} saving={saving} uploadingField={uploadingField} onUpload={handleUpload} onSave={handleSave} onCancel={() => setEditing(null)} /> : tab === 'site_settings' ? <SettingsIntro record={records.site_settings?.[0] ?? defaultSettings as unknown as CmsRow} onEdit={startEdit} /> : <section className="admin-content-panel"><div className="admin-list-header"><div><h2>{tabs.find((item) => item.key === tab)?.label}</h2><p>Manage the content visible on your public website.</p></div><label className="admin-search"><span className="sr-only">Search items</span><input type="search" placeholder="Search items…" value={search} onChange={(event) => setSearch(event.target.value)} /></label></div>
      {tableLoading ? <div className="admin-empty"><span className="admin-spinner" /> Loading content…</div> : filteredRows.length ? <div className="admin-record-list">{filteredRows.map((row) => <article className="admin-record" key={String(row.id || titleForRow(tab, row))}><div className="admin-record-image">{/^(https?:|data:image\/|\/)/.test(String(row.cover_image || row.image || row.thumbnail_url || row.photo_url || '')) ? <img src={String(row.cover_image || row.image || row.thumbnail_url || row.photo_url)} alt="" loading="lazy" /> : <FileImage size={23} />}</div><div className="admin-record-copy"><h3>{titleForRow(tab, row)}</h3><p>{String(row.category || row.short_description || row.description || row.address || (row.price ? `Rs. ${Number(row.price).toLocaleString('en-LK')}` : ''))}</p><div className="admin-record-badges">{Boolean(row.status) && <span className={`record-status ${row.status === 'published' ? 'published' : 'draft'}`}>{String(row.status)}</span>}{row.active === false && <span className="record-status draft">Hidden</span>}{row.featured === true && <span className="record-status featured">Featured</span>}</div></div><div className="admin-record-actions"><button type="button" onClick={() => startEdit(row)} className="admin-edit-btn">Edit</button><button type="button" aria-label={`Delete ${titleForRow(tab, row)}`} onClick={() => void handleDelete(row)} className="admin-delete-btn"><Trash2 size={17} /></button></div></article>)}</div> : <div className="admin-empty"><FolderOpen size={28} /><h3>Nothing here just yet</h3><p>Add an item when you’re ready. Published content can appear on the public website.</p><button type="button" className="button button-gold" onClick={startNew}><Plus size={16} /> Add {tab === 'events' ? 'event' : tab === 'packages' ? 'package' : tab === 'service_areas' ? 'area' : 'service'}</button></div>}
    </section>}
    <footer className="admin-page-footer"><span>Vibe Decor Content Studio</span><span>Access controlled by owner authentication and database policies</span></footer>
    </main>
  </div>
}

function Dashboard({ records, onNavigate, onAdd }: { records: Record<string, CmsRow[]>; onNavigate: (tab: TabKey) => void; onAdd: (tab: Exclude<TabKey, 'dashboard'>) => void }) {
  const events = records.events ?? []
  const packages = records.packages ?? []
  const services = records.services ?? []
  const photos = events.reduce((count, item) => count + (Array.isArray(item.gallery_images) ? item.gallery_images.length : 0) + (item.cover_image ? 1 : 0), 0)
  const stats = [
    { label: 'Total events', value: events.length, icon: CalendarDays, target: 'events' as const },
    { label: 'Event photos', value: photos, icon: FileImage, target: 'events' as const },
    { label: 'Services', value: services.length, icon: FolderOpen, target: 'services' as const },
    { label: 'Packages', value: packages.length, icon: PackageIcon, target: 'packages' as const },
  ]
  const recent = [...events].sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || ''))).slice(0, 4)
  return <div className="admin-dashboard">
    <section className="admin-stats-grid">{stats.map(({ label, value, icon: Icon, target }) => <button type="button" className="admin-stat-card" key={label} onClick={() => onNavigate(target)}><span className="admin-stat-icon"><Icon size={20} /></span><span className="admin-stat-label">{label}</span><strong>{value}</strong><span className="admin-stat-foot">View details <ArrowUpRight size={13} /></span></button>)}</section>
    <div className="admin-dashboard-grid">
      <section className="admin-content-panel recent-panel"><div className="panel-heading"><div><span className="admin-overline">YOUR CONTENT</span><h2>Recent events</h2></div><button className="admin-text-button" type="button" onClick={() => onNavigate('events')}>View all <ArrowUpRight size={14} /></button></div>{recent.length ? <div className="admin-mini-list">{recent.map((row) => <article key={String(row.id)} className="admin-mini-record"><span className="mini-record-image">{String(row.cover_image || '').startsWith('http') ? <img src={String(row.cover_image)} alt="" /> : <FileImage size={18} />}</span><span className="mini-record-copy"><strong>{String(row.title || 'Untitled event')}</strong><small>{String(row.category || 'Event')} · {String(row.location || 'Location not set')}</small></span><span className={`record-status ${row.status === 'published' ? 'published' : 'draft'}`}>{String(row.status || 'draft')}</span></article>)}</div> : <div className="dashboard-empty"><CalendarDays size={25} /><p>Add your first event to begin building your portfolio.</p><button type="button" className="button button-gold" onClick={() => onAdd('events')}><Plus size={16} /> Add event</button></div>}</section>
      <section className="admin-content-panel quick-actions-panel"><div className="panel-heading"><div><span className="admin-overline">QUICK ACTIONS</span><h2>Manage your website</h2></div><Gauge size={21} /></div><button type="button" className="quick-action" onClick={() => onAdd('events')}><span><CalendarDays size={18} /></span><div><strong>Add an event</strong><small>Publish photos and event details</small></div><ChevronRight size={16} /></button><button type="button" className="quick-action" onClick={() => onAdd('packages')}><span><PackageIcon size={18} /></span><div><strong>Add a package</strong><small>Set pricing and inclusions</small></div><ChevronRight size={16} /></button><button type="button" className="quick-action" onClick={() => onNavigate('services')}><span><FolderOpen size={18} /></span><div><strong>Update services</strong><small>Keep service details current</small></div><ChevronRight size={16} /></button><button type="button" className="quick-action" onClick={() => onNavigate('site_settings')}><span><Settings2 size={18} /></span><div><strong>Update contact details</strong><small>Phone, WhatsApp, email and links</small></div><ChevronRight size={16} /></button></section>
    </div>
    <div className="admin-guidance"><ShieldCheck size={21} /><div><strong>Before publishing</strong><p>Use real event images, verify dates and locations, and keep public contact details up to date. Draft events stay out of the public gallery.</p></div><BadgeCheck size={21} /></div>
  </div>
}

function SettingsIntro({ record, onEdit }: { record: CmsRow; onEdit: (row: CmsRow) => void }) {
  return <section className="admin-content-panel settings-intro"><div className="settings-icon"><Settings2 size={24} /></div><span className="admin-overline">BRAND CONFIGURATION</span><h2>Website details at a glance</h2><p>Keep your public contact details and brand message accurate. Changes saved here are used across the website.</p><div className="settings-summary-grid"><div><small>Phone</small><strong>{String(record.phone || 'Not set')}</strong></div><div><small>WhatsApp</small><strong>{String(record.whatsapp_number || 'Not set')}</strong></div><div><small>Email</small><strong>{String(record.email || 'Not set')}</strong></div><div><small>Location</small><strong>{String(record.address || 'Not set')}</strong></div></div><button className="button button-gold" type="button" onClick={() => onEdit(record)}><Settings2 size={16} /> Edit website details</button></section>
}

function Editor({ tab, editing, setEditing, fields: currentFields, saving, uploadingField, onUpload, onSave, onCancel }: {
  tab: Exclude<TabKey, 'dashboard'>; editing: CmsRow; setEditing: (row: CmsRow | null | ((previous: CmsRow | null) => CmsRow | null)) => void; fields: FieldSpec[]; saving: boolean; uploadingField: string | null; onUpload: (field: string, files: FileList | null, mode?: 'single' | 'multiple') => Promise<void>; onSave: (event: FormEvent<HTMLFormElement>) => Promise<void>; onCancel: () => void
}) {
  const title = editing.id ? `Edit ${titleForRow(tab, editing)}` : `Add ${tab === 'events' ? 'event' : tab === 'services' ? 'service' : tab === 'packages' ? 'package' : tab === 'service_areas' ? 'service area' : 'website details'}`
  const setValue = (key: string, value: unknown) => setEditing((previous) => previous ? { ...previous, [key]: value } : previous)
  const isEvents = tab === 'events'
  const fileControls = isEvents ? ['cover_image', 'gallery_images', 'video_urls'] : tab === 'services' ? ['image'] : tab === 'packages' ? ['image'] : []
  return <section className="admin-content-panel admin-editor"><div className="editor-heading"><div><button className="back-list-link" type="button" onClick={onCancel}><ArrowLeft size={14} /> Back to list</button><h2>{title}</h2><p>Complete the fields below. You can edit this content again later.</p></div>{isEvents && <span className={`record-status ${(editing.status || 'draft') === 'published' ? 'published' : 'draft'}`}>{String(editing.status || 'draft')}</span>}</div>
    <form onSubmit={onSave}><div className="editor-fields-grid">{currentFields.map((field) => <label key={field.key} className={`editor-field ${field.type === 'textarea' || field.key === 'about_text' || field.key === 'full_description' ? 'wide' : ''} ${field.type === 'checkbox' ? 'checkbox-field' : ''}`}>
      {field.type === 'checkbox' ? <><input type="checkbox" checked={Boolean(editing[field.key])} onChange={(event) => setValue(field.key, event.target.checked)} /><span>{field.label}</span></> : <><span className="field-label">{field.label}</span>{field.type === 'textarea' ? <textarea rows={field.rows ?? 3} required={['title', 'customer_name', 'name', 'review', 'email', 'phone', 'whatsapp_number'].includes(field.key)} placeholder={field.placeholder} value={asInput(editing[field.key], 'textarea')} onChange={(event) => setValue(field.key, event.target.value)} /> : field.type === 'select' ? <select required={field.key === 'category' || field.key === 'status'} value={asInput(editing[field.key]) || field.options?.[0] || ''} onChange={(event) => setValue(field.key, event.target.value)}>{(field.options ?? []).map((option) => <option key={option} value={option}>{option}</option>)}</select> : <input type={field.type ?? 'text'} required={['title', 'customer_name', 'name', 'review', 'video_url', 'email', 'phone', 'whatsapp_number'].includes(field.key)} placeholder={field.placeholder} value={asInput(editing[field.key])} min={field.key === 'rating' ? 1 : undefined} max={field.key === 'rating' ? 5 : undefined} onChange={(event) => setValue(field.key, field.type === 'number' ? Number(event.target.value) : event.target.value)} />}{field.helper && <small className="field-helper">{field.helper}</small>}</>}
    </label>)}</div>
    {fileControls.length > 0 && <div className="editor-upload-panel"><div className="upload-panel-title"><Upload size={17} /><div><strong>Media library</strong><p>Upload files to cloud storage. URLs are added to the matching field automatically.</p></div></div><div className="upload-controls">{fileControls.map((field) => <label className="upload-control" key={field}><span>{field === 'cover_image' ? 'Thumbnail / cover image' : field === 'gallery_images' ? 'Gallery photos (multiple)' : field === 'video_urls' ? 'Event videos (multiple)' : field === 'image' ? (tab === 'packages' ? 'Package photo' : 'Service image') : 'File'} <small>{uploadingField === field ? 'Uploading…' : 'Choose file'}</small></span><input type="file" accept={field === 'video_urls' || field === 'video_url' ? 'video/*' : 'image/*'} multiple={field === 'gallery_images' || field === 'video_urls'} disabled={uploadingField !== null} onChange={(event: ChangeEvent<HTMLInputElement>) => { void onUpload(field, event.target.files, field === 'gallery_images' || field === 'video_urls' ? 'multiple' : 'single'); event.target.value = '' }} /></label>)}</div></div>}
    <div className="editor-actions"><button className="button button-quiet" type="button" onClick={onCancel}>Cancel</button>{isEvents ? <><button className="button button-quiet" type="submit" name="saveMode" value="draft" disabled={saving || uploadingField !== null}><Save size={15} /> Save draft</button><button className="button button-gold" type="submit" name="saveMode" value="published" disabled={saving || uploadingField !== null}><Save size={15} /> {saving ? 'Saving…' : 'Publish event'}</button></> : <button className="button button-gold" type="submit" disabled={saving || uploadingField !== null}><Save size={16} /> {saving ? 'Saving…' : 'Save changes'}</button>}</div>
    </form></section>
}
