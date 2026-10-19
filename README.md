# Vibe Decor Event Planning Website

A responsive React, TypeScript and Vite website for Vibe Decor Event Planning, Badulla, Sri Lanka. The site includes service pages/sections, an event portfolio, engagement packages based on the supplied brochure, WhatsApp enquiries, and a content management dashboard.

## Run the project

Install Node.js 20 or later. Open a terminal in the project directory and run:

```bash
npm install
npm run dev
```

Vite prints the website address in the terminal. The complete portfolio is available at `/portfolio`. Individual events use `/events/:slug`.

Create a production build with:

```bash
npm run build
```

## Main source files

- `src/App.tsx` — page composition, data loading, and route handling
- `src/components/Navbar.tsx` — brand logo, navigation, and mobile menu
- `src/components/About.tsx` — About section and photo positioning
- `src/components/Services.tsx` — service cards
- `src/components/Packages.tsx` — Basic, Plus, and Premier engagement packages and WhatsApp enquiries
- `src/components/Portfolio.tsx` and `src/components/EventGallery.tsx` — portfolio, category filters, image modal
- `src/components/ServiceAreas.tsx` — Uva service areas with Sri Lanka map artwork
- `src/components/Contact.tsx` — phone, email, address, social links, and contact actions
- `src/components/FloatingWhatsApp.tsx` — icon-only floating WhatsApp action
- `src/pages/AdminPage.tsx` — event, service, package, service-area, and contact/settings management
- `src/data/siteData.ts` — website defaults and engagement package details
- `src/lib/cms.ts` — Supabase data access, uploads, and owner sign-in
- `src/index.css` — visual design and responsive layouts
- `supabase/setup.sql` — database tables, access policies, media bucket, and package seed data

## Engagement packages

The package section contains the three prices and inclusions from the supplied PDF: Basic — Rs. 24,500; Plus — Rs. 46,500; Premier — Rs. 66,500. Optional add-ons and the transport-cost note are shown on each card. The admin dashboard can update package names, prices, inclusions, add-ons, ordering, photos, and visibility.

## Secure content management setup

The dashboard route is `/vibe/deco/log/adminportal/admin`. It does not display a public owner-login link. Access is checked by Supabase Authentication and the `public.admin_users` allowlist; hiding the route is not treated as authentication.

1. Copy `.env.example` to `.env.local`.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to your project URL and public anon/publishable key. Do not use a service-role key in frontend code.
3. Run `supabase/setup.sql` in the Supabase SQL Editor. It creates the package table and seeds the three brochure packages along with the rest of the website schema.
4. In Supabase Authentication, create and confirm the owner user `sidath@vibedecor.lk`. The login form accepts the username `Sidath` and maps it to that auth account. Set the password you chose for this owner account in Supabase itself; the password is not stored in the website source.
5. Copy the owner user's UUID from Supabase Authentication and run the allowlist SQL statement at the end of `supabase/setup.sql` after replacing the placeholder UUID.
6. Disable public sign-ups in Supabase Auth, and keep the database RLS policies enabled.
7. Restart the dev server after updating `.env.local`.

The dashboard supports event drafts and publishing, event photo uploads, services, engagement packages, service areas, and contact/site settings. Uploaded media is saved to the configured Supabase Storage bucket.

## Business details to confirm before launch

The project currently contains these business details; verify them with the owner before publishing: phone/WhatsApp `078 180 0001` / `94781800001`, email `mishakaw@gmail.com`, address `No:06, Badulusirigama, Badulla 90000, Sri Lanka`, and Facebook `https://www.facebook.com/VibeDecorEventPlanning`.

## Notes

This ZIP contains source files and public assets, not `node_modules` or private Supabase credentials. The public website can render its configured default content without Supabase, but shared admin changes, secure sign-in, and cloud uploads require a real Supabase project with the setup above.
