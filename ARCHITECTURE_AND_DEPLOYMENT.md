# Markety Studio — Architecture, Setup & Deployment Guide

## 1. Project Folder Structure

```text
/
├── .env.example                 # Environment variable template (never commit real secrets)
├── db/
│   └── schema.sql               # PostgreSQL / Supabase relational schema & constraints
├── data/
│   └── store.json               # Server-side persistent JSON database (auto-initialized)
├── public/
│   ├── robots.txt               # Search engine crawler policy
│   └── sitemap.xml              # XML sitemap for primary marketplace routes
├── server.ts                    # Express API server, RBAC middleware, & deliverable streaming
├── src/
│   ├── assets/images/           # High-resolution website preview assets
│   ├── components/
│   │   ├── Navbar.tsx           # Sticky top bar with Brand, Nav, Currency switcher, & Auth
│   │   ├── HeroShowcase.tsx     # Animated layered website preview showcase
│   │   ├── ProductCard.tsx      # Marketplace listing card with live demo & package info
│   │   ├── LiveDemoModal.tsx    # Interactive live demo sandbox for sample listings
│   │   └── Footer.tsx           # Policy links, WhatsApp CTA, & architecture docs trigger
│   ├── pages/
│   │   ├── HomePage.tsx         # Hero, Trust/Benefits, Featured Marketplace, & Process
│   │   ├── MarketplacePage.tsx  # Full filterable, searchable, sortable website catalogue
│   │   ├── ProductDetailPage.tsx# Dynamic detail view, package selector, tech specs, FAQs
│   │   ├── CheckoutPage.tsx     # Secure order creation & manual/gateway payment instructions
│   │   ├── CustomerDashboard.tsx# Customer orders, receipt submission, & protected downloads
│   │   ├── AdminDashboard.tsx   # Role-protected admin panel, receipt review, & CRUD
│   │   └── ContactAndPolicies.tsx # Contact form, Custom Project form, FAQs, & Legal policies
│   ├── types.ts                 # Shared TypeScript interfaces
│   ├── App.tsx                  # Application router, state synchronization, & SEO manager
│   └── index.css                # Tailwind v4 configuration & typography rules
└── package.json
```

## 2. Installation & Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and configure your secrets:
   ```bash
   cp .env.example .env
   ```
3. Start the full-stack server (Express API + Vite frontend on port 3000):
   ```bash
   npm run dev
   ```

## 3. Admin Account Setup (Production Security)

- **Never hardcode admin passwords in client-side code.**
- Set `ADMIN_EMAIL` and `ADMIN_INITIAL_PASSWORD` in your server environment variables (`.env`), along with a strong 64-character `SESSION_SECRET`.
- On initial boot, `server.ts` hashes the configured password using Node's native `crypto.scryptSync` with a random salt and provisions the administrator account on the backend.
- Every `/api/admin/*` endpoint verifies the signed session token and enforces `user.role === 'admin'` on the server before executing any operation.

## 4. Netlify & Backend Deployment Instructions

> **Important Deployment Note:** Netlify static hosting can serve the compiled React frontend (`dist/`), **but private file delivery, secure admin operations, authentication, and database functionality require a running backend server (`server.ts`) and private storage.**

### Option A: Unified Full-Stack Hosting (Recommended — Cloud Run / Railway / Render / Fly.io)
1. Build the frontend assets: `npm run build`
2. Run the Node server: `npm run start` (`tsx server.ts`)
3. Attach a persistent volume for `/data` or connect `DATABASE_URL` to Supabase/PostgreSQL using `db/schema.sql`.

### Option B: Netlify Frontend + External Node/Supabase Backend
1. Set Build Command: `npm run build` and Publish Directory: `dist`.
2. Deploy `server.ts` to a Node service or Netlify Functions and proxy `/api/*` in `netlify.toml`:
   ```toml
   [[redirects]]
     from = "/api/*"
     to = "https://your-backend-api.example.com/api/:splat"
     status = 200
     force = true

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

## 5. Checklist of Remaining Manual Production Requirements

- [ ] Replace `SESSION_SECRET`, `ADMIN_EMAIL`, and `ADMIN_INITIAL_PASSWORD` in production environment variables.
- [ ] Replace sample/demo listings (`isSample: true`) with your production website archives or connect an S3/Supabase private storage bucket for large multi-gigabyte ZIP deliverables.
- [ ] Enter your verified corporate JazzCash, Easypaisa, and IBAN bank account details in **Admin Panel → Settings & Payments**.
- [ ] Connect an approved international merchant account (Stripe / Lemonsqueezy / 2Checkout webhook) before enabling automated card checkout.
- [ ] Configure an SMTP provider (Resend / Postmark / SendGrid) if automated transactional email notifications are desired alongside dashboard notifications.
