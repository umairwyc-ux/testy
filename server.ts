import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import type {
  WebsiteProduct,
  Order,
  UserProfile,
  Inquiry,
  PlatformSettings,
  AuditLogEntry,
  OrderStatus,
  PackageTierKey,
} from './src/types.ts';

dotenv.config();

const PORT = 3000;
const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');
const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  crypto.createHash('sha256').update('markety-studio-dev-session-key-2026').digest('hex');

interface StoredUser extends UserProfile {
  passwordHash: string;
}

interface DatabaseSchema {
  users: StoredUser[];
  products: WebsiteProduct[];
  orders: Order[];
  inquiries: Inquiry[];
  settings: PlatformSettings;
  auditLogs: AuditLogEntry[];
}

function hashPassword(password: string): string {
  const salt = 'markety_salt_v1';
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function createToken(userId: string, role: 'customer' | 'admin'): string {
  const payload = Buffer.from(
    JSON.stringify({
      sub: userId,
      role,
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
    })
  ).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url');
  return `${payload}.${signature}`;
}

function verifyToken(token?: string): { sub: string; role: 'customer' | 'admin' } | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url');
  if (signature !== expectedSig) return null;
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    if (decoded.exp < Date.now()) return null;
    return { sub: decoded.sub, role: decoded.role };
  } catch {
    return null;
  }
}

const INITIAL_SETTINGS: PlatformSettings = {
  brandName: 'Markety Studio',
  tagline: 'Premium Websites. Ready for Your Next Big Idea.',
  heroHeadline: 'Your Next Website Is Already Built.',
  heroSubheadline:
    'Discover premium, ready-made websites built for businesses, entrepreneurs, and creators. Preview the live experience, choose your website, and get the files you need to launch.',
  whatsappNumber: '+923001234567',
  businessEmail: 'hello@marketystudio.com',
  supportHours: 'Monday – Saturday, 10:00 AM – 8:00 PM PKT (GMT+5)',
  officeLocation: 'Gulberg III, Lahore, Pakistan · Serving Clients Worldwide',
  usdToPkrRate: Number(process.env.DEFAULT_USD_TO_PKR_RATE) || 278.5,
  socialLinks: {
    linkedin: 'https://linkedin.com',
    github: 'https://github.com',
    twitter: 'https://x.com',
    instagram: 'https://instagram.com',
  },
  paymentMethods: {
    JazzCash: {
      enabled: true,
      title: 'JazzCash Mobile Account',
      accountTitle: 'Markety Studio Digital Pvt Ltd',
      accountNumber: '0301-8899221',
      instructions:
        'Send the exact PKR order total to our official JazzCash merchant/business account. Enter the 11-digit Transaction ID (TID) and upload your payment screenshot in your Customer Dashboard for verification.',
    },
    Easypaisa: {
      enabled: true,
      title: 'Easypaisa Business Wallet',
      accountTitle: 'Markety Studio Digital Pvt Ltd',
      accountNumber: '0345-7766110',
      instructions:
        'Transfer the exact PKR amount via the Easypaisa app or agent to the account number above. Submit the Trx ID and receipt screenshot so our finance team can verify and unlock your files.',
    },
    'Bank Transfer': {
      enabled: true,
      title: 'Direct Bank Transfer (IBFT / Raast / Wire)',
      accountTitle: 'Markety Studio Digital Pvt Ltd',
      accountNumber: '0142-7901827301',
      bankName: 'Meezan Bank Limited — Gulberg Corporate Branch, Lahore',
      iban: 'PK36MEZN0001427901827301',
      instructions:
        'Use Raast, IBFT, or international SWIFT transfer to the IBAN above. Mention your Order Number in the transfer remarks and submit your bank transfer reference receipt for verification.',
    },
    'International Payment Gateway': {
      enabled: true,
      title: 'International Card / USD Invoice (Manual Gateway Verification)',
      accountTitle: 'Markety Studio Global Billing',
      accountNumber: 'USD-MERCHANT-INVOICE',
      instructions:
        'International buyers are issued a secure payment link via our verified merchant partner upon order creation. Once paid, paste your payment confirmation reference ID below for verification.',
    },
  },
};

const INITIAL_PRODUCTS: WebsiteProduct[] = [
  {
    id: 'prod-smart-buy',
    slug: 'smart-buy-ecommerce-website',
    title: 'Smart Buy — Ecommerce Website',
    category: 'Ecommerce Websites',
    shortDescription:
      'High-conversion multi-category storefront with dynamic product filtering, slide-over cart drawer, PKR/USD currency switching, and order management.',
    fullDescription:
      'Smart Buy is a complete, production-architected e-commerce storefront designed for modern retail brands, electronics boutiques, and direct-to-consumer labels in Pakistan and international markets. It features a fast catalog filter engine, variant selection, local COD + bank transfer checkout flows, and an inventory management dashboard.',
    pricePKR: 48000,
    priceUSD: 175,
    originalCurrency: 'PKR',
    discountPercentage: 0,
    thumbnailUrl: '/src/assets/images/smart_buy_ecommerce_1791734847810.jpg',
    galleryUrls: [
      '/src/assets/images/smart_buy_ecommerce_1791734847810.jpg',
      '/src/assets/images/markety_business_web_1791734859267.jpg',
    ],
    liveDemoUrl: '/?demo=smart-buy-ecommerce-website',
    technologies: ['React 19', 'TypeScript', 'Tailwind CSS', 'Node.js / Express', 'PostgreSQL Schema'],
    features: [
      'Responsive storefront grid with instant category & price filtering',
      'Contiguous product detail view with variant selector & image gallery',
      'Slide-over shopping bag with promo code & shipping estimator',
      'Cash on Delivery (COD), JazzCash, Easypaisa, and Bank Transfer checkout templates',
      'Admin inventory & order status management module included',
    ],
    responsiveDesign: 'Verified across Mobile (375px), Tablet (768px), Laptop (1440px), and 4K displays',
    sourceCodeIncluded: true,
    backendRequirements:
      'Node.js 20+ runtime and PostgreSQL 15+ (or Supabase). Includes SQL migrations and seed scripts.',
    hostingRequirements:
      'Compatible with Vercel, Netlify + Railway, Render, DigitalOcean App Platform, or AWS Lightsail. Hosting and domain are not included in the base listing price.',
    customizationOptions:
      'Available under the Custom package: brand palette restyling, custom payment gateway webhook integration, and ERP inventory sync.',
    deliveryFormat: 'Protected ZIP archive containing full TypeScript source code, SQL schema, and setup manual.',
    estimatedDeliveryTime: 'Instant download upon payment verification (Custom scope: 5–10 business days)',
    packages: {
      starter: {
        enabled: true,
        name: 'Starter Package',
        pricePKR: 48000,
        priceUSD: 175,
        deliveryTime: 'Available immediately after payment verification',
        summary: 'Complete frontend & backend source files as specified in the listing with basic setup instructions.',
        includedItems: [
          'Full React + TypeScript storefront source code (ZIP)',
          'Database schema.sql & .env.example template',
          'Basic local & cloud setup instructions (Markdown/PDF)',
        ],
      },
      professional: {
        enabled: true,
        name: 'Professional Package',
        pricePKR: 72000,
        priceUSD: 260,
        deliveryTime: '1–2 business days after payment verification',
        summary: 'Complete website files plus comprehensive production deployment guide and database seeding scripts.',
        includedItems: [
          'Everything in Starter Package',
          'Step-by-step Production Deployment & SSL Guide',
          'Pre-configured sample product catalog seed scripts',
          'Admin order panel configuration walkthrough',
        ],
      },
      custom: {
        enabled: true,
        name: 'Custom Package',
        pricePKR: 135000,
        priceUSD: 490,
        isCustomQuote: true,
        deliveryTime: '5–10 business days based on agreed scope',
        summary: 'Tailored branding customization, custom payment integrations, and feature additions per agreed scope.',
        includedItems: [
          'Everything in Professional Package',
          'Custom brand identity, typography, and color adaptation',
          'Integration of 1 local courier API (TCS / Leopards / PostEx) or payment webhook',
          'Dedicated staging review before final handover',
        ],
      },
    },
    deliverables: [
      {
        id: 'del-sb-1',
        title: 'Smart Buy Complete Source Code Archive',
        fileName: 'smart-buy-ecommerce-v1.4-source.zip',
        fileType: 'source_zip',
        fileSize: '4.8 MB',
        description: 'Full React, TypeScript, Tailwind CSS, and Express API source tree.',
        minPackage: 'starter',
      },
      {
        id: 'del-sb-2',
        title: 'Setup & Environment Configuration Manual',
        fileName: 'smart-buy-setup-instructions.md',
        fileType: 'setup_docs',
        fileSize: '42 KB',
        description: 'Step-by-step installation, environment variable reference, and npm scripts.',
        minPackage: 'starter',
      },
      {
        id: 'del-sb-3',
        title: 'PostgreSQL Relational Schema & Migrations',
        fileName: 'smart-buy-database-schema.sql',
        fileType: 'db_schema',
        fileSize: '18 KB',
        description: 'Tables for products, variants, customers, and orders with indexes.',
        minPackage: 'starter',
      },
      {
        id: 'del-sb-4',
        title: 'Production Deployment & Security Guide',
        fileName: 'smart-buy-production-deployment-guide.md',
        fileType: 'deployment_guide',
        fileSize: '68 KB',
        description: 'Detailed guide for deploying on Railway/Render/Netlify with reverse proxy rules.',
        minPackage: 'professional',
      },
    ],
    faqs: [
      {
        question: 'Does this listing include a live payment gateway merchant account?',
        answer:
          'No. The codebase includes checkout UI and server webhook handlers, but you must supply your own approved merchant credentials (e.g., JazzCash Merchant, Stripe, or Safepay) or use the built-in manual bank transfer & COD workflow.',
      },
      {
        question: 'Are the product photos shown in the preview included for commercial resale?',
        answer:
          'The preview uses demonstration imagery. You should replace sample product images and copy with your own licensed brand photography before launching.',
      },
    ],
    published: true,
    featured: true,
    isSample: true,
    createdAt: '2026-09-15T10:00:00.000Z',
    updatedAt: '2026-10-08T14:30:00.000Z',
  },
  {
    id: 'prod-markety-business',
    slug: 'markety-business-corporate-website',
    title: 'Markety Business — Business Website',
    category: 'Business Websites',
    shortDescription:
      'Executive B2B corporate and consulting website with service architecture pages, case study layouts, and validated lead capture funnels.',
    fullDescription:
      'Markety Business is crafted for consulting firms, engineering enterprises, legal practices, and B2B service organizations. It combines authoritative editorial typography with structured service breakdowns, downloadable capability statement sections, and a server-validated inquiry pipeline.',
    pricePKR: 35000,
    priceUSD: 125,
    originalCurrency: 'PKR',
    discountPercentage: 0,
    thumbnailUrl: '/src/assets/images/markety_business_web_1791734859267.jpg',
    galleryUrls: [
      '/src/assets/images/markety_business_web_1791734859267.jpg',
      '/src/assets/images/modern_agency_web_1791734895414.jpg',
    ],
    liveDemoUrl: '/?demo=markety-business-corporate-website',
    technologies: ['React 19', 'TypeScript', 'Tailwind CSS', 'Express Lead API'],
    features: [
      'Executive hero section with clear value proposition and consultation booking',
      '9-grid B2B capability matrix with detailed service breakdown modals',
      'Structured case study templates with problem, execution, and outcome blocks',
      'Server-validated RFQ and consultation lead capture form',
      'Full SEO metadata, OpenGraph tags, and Schema.org Organization JSON-LD',
    ],
    responsiveDesign: 'Responsive across mobile phones, tablets, laptops, and widescreen monitors',
    sourceCodeIncluded: true,
    backendRequirements:
      'Lightweight Node.js/Express backend for contact form validation and lead storage (or serverless function equivalent).',
    hostingRequirements:
      'Runs on any Node.js host or static host with serverless functions. Hosting and domain registration are not included.',
    customizationOptions:
      'Custom package includes adding up to 5 custom service pages, CRM webhook integration (HubSpot/Pipedrive), and corporate copywriting alignment.',
    deliveryFormat: 'ZIP archive with full React/TypeScript source code, environment template, and setup docs.',
    estimatedDeliveryTime: 'Instant download upon payment verification',
    packages: {
      starter: {
        enabled: true,
        name: 'Starter Package',
        pricePKR: 35000,
        priceUSD: 125,
        deliveryTime: 'Available immediately after payment verification',
        summary: 'Complete website source files and basic setup instructions.',
        includedItems: [
          'Full React + TypeScript source code archive',
          'Environment variable template (.env.example)',
          'Quick-start installation guide',
        ],
      },
      professional: {
        enabled: true,
        name: 'Professional Package',
        pricePKR: 52000,
        priceUSD: 190,
        deliveryTime: '1 business day after payment verification',
        summary: 'Website files plus deployment walkthrough and SEO/analytics configuration guide.',
        includedItems: [
          'Everything in Starter Package',
          'Netlify / Cloud Run deployment guide',
          'SEO, sitemap, and structured data customization handbook',
        ],
      },
      custom: {
        enabled: true,
        name: 'Custom Package',
        pricePKR: 95000,
        priceUSD: 345,
        isCustomQuote: true,
        deliveryTime: '4–7 business days based on agreed scope',
        summary: 'Complete corporate branding adaptation, custom pages, and CRM integration.',
        includedItems: [
          'Everything in Professional Package',
          'Custom corporate branding & content population for up to 6 pages',
          'Webhook connection to your CRM or email notification service',
        ],
      },
    },
    deliverables: [
      {
        id: 'del-mb-1',
        title: 'Markety Business Source Code ZIP',
        fileName: 'markety-business-corporate-v1.2.zip',
        fileType: 'source_zip',
        fileSize: '3.2 MB',
        description: 'Complete frontend and lead-capture API source files.',
        minPackage: 'starter',
      },
      {
        id: 'del-mb-2',
        title: 'Setup & Configuration Instructions',
        fileName: 'markety-business-setup.md',
        fileType: 'setup_docs',
        fileSize: '28 KB',
        description: 'Instructions for running locally, editing content JSON, and building for production.',
        minPackage: 'starter',
      },
      {
        id: 'del-mb-3',
        title: 'Deployment & Custom Domain Guide',
        fileName: 'markety-business-deployment-guide.md',
        fileType: 'deployment_guide',
        fileSize: '45 KB',
        description: 'DNS, SSL, and deployment configuration guide.',
        minPackage: 'professional',
      },
    ],
    faqs: [
      {
        question: 'Can we change the industry focus from consulting to construction or logistics?',
        answer:
          'Yes. All service titles, icons, descriptions, and case studies are stored in a clean configuration module so your team can adapt it to any B2B industry.',
      },
    ],
    published: true,
    featured: true,
    isSample: true,
    createdAt: '2026-09-18T11:20:00.000Z',
    updatedAt: '2026-10-09T09:15:00.000Z',
  },
  {
    id: 'prod-creative-portfolio',
    slug: 'creative-portfolio-developer-showcase',
    title: 'Creative Portfolio — Developer Portfolio',
    category: 'Portfolio Websites',
    shortDescription:
      'High-contrast architectural portfolio for software engineers, creative technologists, and design directors with interactive project inspection.',
    fullDescription:
      'Creative Portfolio is a precision-engineered personal showcase designed for senior developers, technical founders, and creative directors. Built on an architectural monochrome grid, it highlights interactive case studies, technical architecture notes, open-source contributions, and direct client booking.',
    pricePKR: 24000,
    priceUSD: 88,
    originalCurrency: 'PKR',
    discountPercentage: 0,
    thumbnailUrl: '/src/assets/images/creative_portfolio_web_1791734872575.jpg',
    galleryUrls: ['/src/assets/images/creative_portfolio_web_1791734872575.jpg'],
    liveDemoUrl: '/?demo=creative-portfolio-developer-showcase',
    technologies: ['React 19', 'TypeScript', 'Tailwind CSS', 'Motion'],
    features: [
      'Swiss-inspired hairline grid layout with keyboard-accessible project filtering',
      'Detailed case study drawers with problem/architecture/metrics breakdown',
      'Technical writing & engineering notes section with code syntax formatting',
      'Reduced-motion compliant micro-interactions and fast static build output',
    ],
    responsiveDesign: 'Fluid responsive grid from 320px mobile viewports up to 2560px studio displays',
    sourceCodeIncluded: true,
    backendRequirements:
      'No database required for base portfolio; includes optional serverless contact endpoint.',
    hostingRequirements:
      'Deploys cleanly to Netlify, Vercel, GitHub Pages, or Cloudflare Pages.',
    customizationOptions:
      'Custom package includes personal resume/CV integration, custom interactive WebGL/Canvas header, and domain setup assistance.',
    deliveryFormat: 'ZIP archive containing complete React/TypeScript source and Markdown content templates.',
    estimatedDeliveryTime: 'Instant download upon payment verification',
    packages: {
      starter: {
        enabled: true,
        name: 'Starter Package',
        pricePKR: 24000,
        priceUSD: 88,
        deliveryTime: 'Available immediately after payment verification',
        summary: 'Complete portfolio source code and project data configuration guide.',
        includedItems: [
          'Full React + TypeScript portfolio source code',
          'Structured JSON/Markdown project template files',
          'Basic setup & build instructions',
        ],
      },
      professional: {
        enabled: true,
        name: 'Professional Package',
        pricePKR: 36000,
        priceUSD: 130,
        deliveryTime: '1 business day after payment verification',
        summary: 'Source code plus deployment guide and performance/SEO optimization checklist.',
        includedItems: [
          'Everything in Starter Package',
          'Static hosting & custom domain deployment guide',
          'OpenGraph social card & resume PDF download setup guide',
        ],
      },
      custom: {
        enabled: true,
        name: 'Custom Package',
        pricePKR: 68000,
        priceUSD: 245,
        isCustomQuote: true,
        deliveryTime: '3–5 business days based on agreed scope',
        summary: 'Personalized portfolio curation, custom case study formatting, and bespoke visual touches.',
        includedItems: [
          'Everything in Professional Package',
          'Population of up to 8 of your real projects and engineering articles',
          'Custom color theme and typography calibration',
        ],
      },
    },
    deliverables: [
      {
        id: 'del-cp-1',
        title: 'Creative Portfolio Complete Source Code',
        fileName: 'creative-portfolio-v2.0-source.zip',
        fileType: 'source_zip',
        fileSize: '2.1 MB',
        description: 'Full React + TypeScript project with zero external UI bloat.',
        minPackage: 'starter',
      },
      {
        id: 'del-cp-2',
        title: 'Portfolio Setup & Content Guide',
        fileName: 'creative-portfolio-setup.md',
        fileType: 'setup_docs',
        fileSize: '22 KB',
        description: 'How to add projects, configure links, and build static assets.',
        minPackage: 'starter',
      },
    ],
    faqs: [
      {
        question: 'Do I need a backend server to host this portfolio?',
        answer:
          'No. The portfolio compiles to static HTML/CSS/JS bundles that can be hosted on Netlify or Vercel free tiers, while the contact form can connect to your preferred form endpoint.',
      },
    ],
    published: true,
    featured: true,
    isSample: true,
    createdAt: '2026-09-20T08:00:00.000Z',
    updatedAt: '2026-10-07T16:40:00.000Z',
  },
  {
    id: 'prod-ai-assistant',
    slug: 'ai-assistant-web-application',
    title: 'AI Assistant — AI Web Application',
    category: 'AI Web Applications',
    shortDescription:
      'Full-stack AI workflow studio and document intelligence web application with server-side API proxy, prompt templates, and workspace history.',
    fullDescription:
      'AI Assistant is a modular web application starter for founders launching AI productivity tools, document analyzers, or domain-specific copilot interfaces. It features a structured prompt workflow builder, real-time response canvas, server-side Gemini API proxy architecture (keeping API keys strictly off the client), and workspace session management.',
    pricePKR: 65000,
    priceUSD: 235,
    originalCurrency: 'USD',
    discountPercentage: 0,
    thumbnailUrl: '/src/assets/images/ai_assistant_webapp_1791734884511.jpg',
    galleryUrls: ['/src/assets/images/ai_assistant_webapp_1791734884511.jpg'],
    liveDemoUrl: '/?demo=ai-assistant-web-application',
    technologies: ['React 19', 'TypeScript', 'Tailwind CSS', 'Node.js / Express', '@google/genai SDK'],
    features: [
      'Structured Prompt Studio with reusable variable slots and workflow presets',
      'Split-pane real-time response canvas with Markdown & structured JSON output',
      'Secure server-side API route architecture (zero client-side API key exposure)',
      'Workspace run history and exportable analysis reports (Markdown / CSV)',
      'Configurable rate-limiting and token usage estimation hooks',
    ],
    responsiveDesign: 'Collapsible sidebar drawer on mobile/tablet and full multi-pane studio on desktop',
    sourceCodeIncluded: true,
    backendRequirements:
      'Node.js 20+ server required to run the secure `/api/generate` backend proxy. Requires your own Gemini API key configured in `.env` on the server.',
    hostingRequirements:
      'Requires a Node.js capable host (Cloud Run, Railway, Render, Fly.io, or VPS). API usage costs are billed directly by your AI provider.',
    customizationOptions:
      'Custom package includes custom system prompt engineering for your industry, database persistence for multi-user teams, and custom export templates.',
    deliveryFormat: 'ZIP archive with full client & server TypeScript code, `.env.example`, and deployment docs.',
    estimatedDeliveryTime: 'Instant download upon payment verification',
    packages: {
      starter: {
        enabled: true,
        name: 'Starter Package',
        pricePKR: 65000,
        priceUSD: 235,
        deliveryTime: 'Available immediately after payment verification',
        summary: 'Complete frontend & Express backend proxy source code with setup documentation.',
        includedItems: [
          'Full React + Express TypeScript source archive',
          'Server-side @google/genai integration module',
          '.env.example & local setup documentation',
        ],
      },
      professional: {
        enabled: true,
        name: 'Professional Package',
        pricePKR: 92000,
        priceUSD: 330,
        deliveryTime: '1–2 business days after payment verification',
        summary: 'Source code plus PostgreSQL persistence schema, rate-limiting middleware, and cloud deployment guide.',
        includedItems: [
          'Everything in Starter Package',
          'PostgreSQL schema for storing user workspaces & prompt runs',
          'Cloud Run & Railway container deployment guide',
        ],
      },
      custom: {
        enabled: true,
        name: 'Custom Package',
        pricePKR: 165000,
        priceUSD: 595,
        isCustomQuote: true,
        deliveryTime: '7–12 business days based on agreed scope',
        summary: 'Bespoke AI workflow development, custom schema extraction, and multi-user authentication.',
        includedItems: [
          'Everything in Professional Package',
          '3 custom domain-specific AI workflows tailored to your business logic',
          'Role-based workspace authentication & custom branding',
        ],
      },
    },
    deliverables: [
      {
        id: 'del-ai-1',
        title: 'AI Assistant Full-Stack Source Archive',
        fileName: 'ai-assistant-webapp-v1.5-source.zip',
        fileType: 'source_zip',
        fileSize: '4.1 MB',
        description: 'Frontend studio interface and Express server-side AI proxy.',
        minPackage: 'starter',
      },
      {
        id: 'del-ai-2',
        title: 'Environment Variables & API Key Security Guide',
        fileName: 'ai-assistant-env-security.md',
        fileType: 'env_example',
        fileSize: '19 KB',
        description: 'Example environment variables and server-side secret configuration.',
        minPackage: 'starter',
      },
      {
        id: 'del-ai-3',
        title: 'Workspace Database Schema & Deployment Manual',
        fileName: 'ai-assistant-deployment-and-schema.sql',
        fileType: 'deployment_guide',
        fileSize: '54 KB',
        description: 'SQL tables for prompt history and production server configuration.',
        minPackage: 'professional',
      },
    ],
    faqs: [
      {
        question: 'Are AI API credits included with the website purchase?',
        answer:
          'No. You must generate your own API key from Google AI Studio and place it in your server `.env` file. This ensures you have full ownership and control over your API billing.',
      },
    ],
    published: true,
    featured: true,
    isSample: true,
    createdAt: '2026-09-22T15:10:00.000Z',
    updatedAt: '2026-10-10T11:00:00.000Z',
  },
  {
    id: 'prod-modern-agency',
    slug: 'modern-agency-digital-studio',
    title: 'Modern Agency — Digital Agency Website',
    category: 'Agency Websites',
    shortDescription:
      'Flagship digital agency website featuring interactive case study showcases, service tier breakdowns, and a multi-step project scoping funnel.',
    fullDescription:
      'Modern Agency is built for software studios, branding agencies, video production houses, and performance marketing teams that want to attract both local corporate clients and international retainers. It pairs bold dark-mode editorial aesthetics with structured proof-of-work showcases and an interactive project brief estimator.',
    pricePKR: 42000,
    priceUSD: 150,
    originalCurrency: 'PKR',
    discountPercentage: 0,
    thumbnailUrl: '/src/assets/images/modern_agency_web_1791734895414.jpg',
    galleryUrls: [
      '/src/assets/images/modern_agency_web_1791734895414.jpg',
      '/src/assets/images/creative_portfolio_web_1791734872575.jpg',
    ],
    liveDemoUrl: '/?demo=modern-agency-digital-studio',
    technologies: ['React 19', 'TypeScript', 'Tailwind CSS', 'Motion', 'Express API'],
    features: [
      'Dramatic flagship case study showcase with interactive category filtering',
      'Transparent retainer and fixed-scope service tier comparison matrix',
      'Multi-step custom project scoping form (budget, timeline, deliverables)',
      ' Editorial insights / journal layout for content marketing and SEO',
    ],
    responsiveDesign: 'Optimized for Mobile, Tablet, Laptop, and High-DPI Studio Displays',
    sourceCodeIncluded: true,
    backendRequirements:
      'Node.js/Express endpoint for receiving and validating project scoping briefs.',
    hostingRequirements:
      'Deploys to Netlify, Vercel, Render, or Cloud Run. Hosting and domain not included.',
    customizationOptions:
      'Custom package includes custom case study layouts, Calendly/Cal.com booking embed integration, and brand identity styling.',
    deliveryFormat: 'ZIP archive with full React/TypeScript source code and setup documentation.',
    estimatedDeliveryTime: 'Instant download upon payment verification',
    packages: {
      starter: {
        enabled: true,
        name: 'Starter Package',
        pricePKR: 42000,
        priceUSD: 150,
        deliveryTime: 'Available immediately after payment verification',
        summary: 'Complete agency website source code and setup documentation.',
        includedItems: [
          'Full React + TypeScript source code (ZIP)',
          'Case study & service data configuration files',
          'Basic installation & build guide',
        ],
      },
      professional: {
        enabled: true,
        name: 'Professional Package',
        pricePKR: 60000,
        priceUSD: 215,
        deliveryTime: '1 business day after payment verification',
        summary: 'Website source code plus deployment handbook and lead notification webhook setup.',
        includedItems: [
          'Everything in Starter Package',
          'Production deployment & SEO optimization guide',
          'Email/Slack webhook template for incoming agency briefs',
        ],
      },
      custom: {
        enabled: true,
        name: 'Custom Package',
        pricePKR: 110000,
        priceUSD: 395,
        isCustomQuote: true,
        deliveryTime: '5–8 business days based on agreed scope',
        summary: 'Tailored agency rebranding, custom interactive portfolio sections, and CRM integration.',
        includedItems: [
          'Everything in Professional Package',
          'Custom agency identity, palette, and 4 flagship case study pages',
          'Direct integration with your booking & CRM workflow',
        ],
      },
    },
    deliverables: [
      {
        id: 'del-ma-1',
        title: 'Modern Agency Complete Source Code',
        fileName: 'modern-agency-v1.3-source.zip',
        fileType: 'source_zip',
        fileSize: '3.7 MB',
        description: 'Full agency frontend and brief submission backend.',
        minPackage: 'starter',
      },
      {
        id: 'del-ma-2',
        title: 'Setup & Content Customization Manual',
        fileName: 'modern-agency-setup.md',
        fileType: 'setup_docs',
        fileSize: '31 KB',
        description: 'Guide to updating agency case studies, services, and contact details.',
        minPackage: 'starter',
      },
    ],
    faqs: [
      {
        question: 'Can we use this website to sell both fixed-price packages and custom retainers?',
        answer:
          'Yes. The pricing and scoping components support both structured monthly retainers and custom project inquiries.',
      },
    ],
    published: true,
    featured: true,
    isSample: true,
    createdAt: '2026-09-25T12:00:00.000Z',
    updatedAt: '2026-10-10T18:00:00.000Z',
  },
  {
    id: 'prod-velocity-landing',
    slug: 'velocity-launch-conversion-landing-page',
    title: 'Velocity Launch — Product Landing Page',
    category: 'Landing Pages',
    shortDescription:
      'High-velocity product launch and waitlist funnel with interactive feature tabs, ROI calculator, and server-validated lead capture.',
    fullDescription:
      'Velocity Launch is a conversion-engineered single-page funnel built for SaaS product launches, mobile app waitlists, hardware pre-orders, and digital course drops. Designed for sub-second First Contentful Paint and clear visual hierarchy.',
    pricePKR: 19500,
    priceUSD: 70,
    originalCurrency: 'PKR',
    discountPercentage: 0,
    thumbnailUrl: '/src/assets/images/markety_business_web_1791734859267.jpg',
    galleryUrls: ['/src/assets/images/markety_business_web_1791734859267.jpg'],
    liveDemoUrl: '/?demo=velocity-launch-conversion-landing-page',
    technologies: ['React 19', 'TypeScript', 'Tailwind CSS'],
    features: [
      'Above-the-fold product showcase with instant interactive tab switching',
      'Interactive pricing & ROI calculator with tabular numeric outputs',
      'Validated waitlist & early-access signup form with duplicate protection',
      'Structured FAQ accordion and semantic Schema.org Product markup',
    ],
    responsiveDesign: 'Mobile-first layout verified across iOS, Android, Tablet, and Desktop',
    sourceCodeIncluded: true,
    backendRequirements: 'Includes lightweight Express endpoint for storing waitlist signups in JSON/SQL.',
    hostingRequirements: 'Compatible with Netlify, Vercel, or any Node/static host.',
    customizationOptions: 'Custom copywriting, analytics event tracking, and email marketing integration.',
    deliveryFormat: 'ZIP archive with source code and setup guide.',
    estimatedDeliveryTime: 'Instant download upon payment verification',
    packages: {
      starter: {
        enabled: true,
        name: 'Starter Package',
        pricePKR: 19500,
        priceUSD: 70,
        deliveryTime: 'Available immediately after payment verification',
        summary: 'Complete landing page source files and setup instructions.',
        includedItems: ['Full React + TypeScript source archive', 'Setup & build instructions'],
      },
      professional: {
        enabled: true,
        name: 'Professional Package',
        pricePKR: 29000,
        priceUSD: 105,
        deliveryTime: '1 business day after payment verification',
        summary: 'Landing page source files plus deployment and analytics setup guide.',
        includedItems: ['Everything in Starter Package', 'Deployment & conversion tracking guide'],
      },
      custom: {
        enabled: true,
        name: 'Custom Package',
        pricePKR: 55000,
        priceUSD: 199,
        isCustomQuote: true,
        deliveryTime: '3–5 business days',
        summary: 'Custom product visuals, copy adaptation, and email platform webhook integration.',
        includedItems: ['Everything in Professional Package', 'Custom brand styling & Mailchimp/ConvertKit sync'],
      },
    },
    deliverables: [
      {
        id: 'del-vl-1',
        title: 'Velocity Launch Source Code ZIP',
        fileName: 'velocity-launch-landing-v1.1.zip',
        fileType: 'source_zip',
        fileSize: '1.9 MB',
        description: 'Complete React + TypeScript landing page source.',
        minPackage: 'starter',
      },
    ],
    faqs: [],
    published: true,
    featured: false,
    isSample: true,
    createdAt: '2026-09-27T09:00:00.000Z',
    updatedAt: '2026-10-05T12:00:00.000Z',
  },
  {
    id: 'prod-zaffran-restaurant',
    slug: 'zaffran-ember-restaurant-ordering',
    title: 'Zaffran & Ember — Restaurant Website',
    category: 'Restaurant Websites',
    shortDescription:
      'Hospitality, fine dining, and direct online ordering website with digital menu categories, table reservation requests, and branch locator.',
    fullDescription:
      'Zaffran & Ember is built for restaurants, specialty cafes, and cloud kitchens looking to accept direct commission-free orders and table reservations. Includes categorized dietary menus, branch timing controls, and WhatsApp/direct order confirmation flows.',
    pricePKR: 38000,
    priceUSD: 138,
    originalCurrency: 'PKR',
    discountPercentage: 0,
    thumbnailUrl: '/src/assets/images/smart_buy_ecommerce_1791734847810.jpg',
    galleryUrls: ['/src/assets/images/smart_buy_ecommerce_1791734847810.jpg'],
    liveDemoUrl: '/?demo=zaffran-ember-restaurant-ordering',
    technologies: ['React 19', 'TypeScript', 'Tailwind CSS', 'Express Order API'],
    features: [
      'Interactive digital menu with category tabs, spice/portion modifiers, and cart',
      'Table reservation booking form with date, party size, and seating preference',
      'Direct delivery & takeaway checkout supporting COD and local mobile wallets',
      'Multi-branch operating hours and contact directory',
    ],
    responsiveDesign: 'Thumb-friendly mobile menu navigation and full desktop dining showcase',
    sourceCodeIncluded: true,
    backendRequirements: 'Node.js/Express API with SQL/JSON menu and order persistence.',
    hostingRequirements: 'Runs on any standard Node.js hosting provider.',
    customizationOptions: 'Menu digitization, custom food photography layout, and thermal printer receipt formatting.',
    deliveryFormat: 'ZIP archive with source code, menu schema, and setup manual.',
    estimatedDeliveryTime: 'Instant download upon payment verification',
    packages: {
      starter: {
        enabled: true,
        name: 'Starter Package',
        pricePKR: 38000,
        priceUSD: 138,
        deliveryTime: 'Available immediately after payment verification',
        summary: 'Complete restaurant website and online ordering source code.',
        includedItems: ['Full React + Express source code', 'Menu JSON/SQL schema & setup instructions'],
      },
      professional: {
        enabled: true,
        name: 'Professional Package',
        pricePKR: 54000,
        priceUSD: 195,
        deliveryTime: '1–2 business days',
        summary: 'Source code plus deployment guide and kitchen order notification setup.',
        includedItems: ['Everything in Starter Package', 'Deployment & WhatsApp order alert guide'],
      },
      custom: {
        enabled: true,
        name: 'Custom Package',
        pricePKR: 98000,
        priceUSD: 355,
        isCustomQuote: true,
        deliveryTime: '5–8 business days',
        summary: 'Full menu data entry, custom brand styling, and multi-branch configuration.',
        includedItems: ['Everything in Professional Package', 'Entry of up to 100 menu items & custom brand theme'],
      },
    },
    deliverables: [
      {
        id: 'del-ze-1',
        title: 'Zaffran & Ember Source Code Archive',
        fileName: 'zaffran-restaurant-v1.2-source.zip',
        fileType: 'source_zip',
        fileSize: '3.5 MB',
        description: 'Complete restaurant frontend and reservation/order backend.',
        minPackage: 'starter',
      },
    ],
    faqs: [],
    published: true,
    featured: false,
    isSample: true,
    createdAt: '2026-09-29T14:00:00.000Z',
    updatedAt: '2026-10-06T10:00:00.000Z',
  },
  {
    id: 'prod-cloudpulse-saas',
    slug: 'cloudpulse-b2b-saas-website',
    title: 'CloudPulse — B2B SaaS Platform Website',
    category: 'SaaS Websites',
    shortDescription:
      'Enterprise SaaS marketing and documentation website with interactive billing toggles, changelog timeline, and API documentation pages.',
    fullDescription:
      'CloudPulse provides software companies with a cohesive marketing site, interactive pricing matrix (monthly/annual & PKR/USD), product changelog feed, and structured technical documentation layout.',
    pricePKR: 45000,
    priceUSD: 162,
    originalCurrency: 'USD',
    discountPercentage: 0,
    thumbnailUrl: '/src/assets/images/ai_assistant_webapp_1791734884511.jpg',
    galleryUrls: ['/src/assets/images/ai_assistant_webapp_1791734884511.jpg'],
    liveDemoUrl: '/?demo=cloudpulse-b2b-saas-website',
    technologies: ['React 19', 'TypeScript', 'Tailwind CSS', 'Motion'],
    features: [
      'Interactive tier comparison table with feature matrix and seat estimator',
      'Built-in documentation reader and release changelog timeline',
      'Security & compliance overview section for enterprise procurement teams',
      'Book-a-demo and trial onboarding lead capture flows',
    ],
    responsiveDesign: 'Responsive across mobile, tablet, and widescreen desktop viewports',
    sourceCodeIncluded: true,
    backendRequirements: 'Node.js/Express backend for demo booking requests.',
    hostingRequirements: 'Deploys on Netlify, Vercel, Render, or Cloud Run.',
    customizationOptions: 'Custom interactive product tour components and documentation migration.',
    deliveryFormat: 'ZIP archive with full source code and setup documentation.',
    estimatedDeliveryTime: 'Instant download upon payment verification',
    packages: {
      starter: {
        enabled: true,
        name: 'Starter Package',
        pricePKR: 45000,
        priceUSD: 162,
        deliveryTime: 'Available immediately after payment verification',
        summary: 'Complete SaaS website source code and setup guide.',
        includedItems: ['Full React + TypeScript source archive', 'Basic setup documentation'],
      },
      professional: {
        enabled: true,
        name: 'Professional Package',
        pricePKR: 64000,
        priceUSD: 230,
        deliveryTime: '1–2 business days',
        summary: 'Source code plus deployment guide and MDX/JSON docs configuration.',
        includedItems: ['Everything in Starter Package', 'Deployment & technical docs guide'],
      },
      custom: {
        enabled: true,
        name: 'Custom Package',
        pricePKR: 120000,
        priceUSD: 430,
        isCustomQuote: true,
        deliveryTime: '5–9 business days',
        summary: 'Bespoke interactive product mockups and custom authentication handoff.',
        includedItems: ['Everything in Professional Package', 'Custom interactive UI showcase & app SSO bridge'],
      },
    },
    deliverables: [
      {
        id: 'del-cp-saas-1',
        title: 'CloudPulse SaaS Website Source ZIP',
        fileName: 'cloudpulse-saas-v1.0-source.zip',
        fileType: 'source_zip',
        fileSize: '3.1 MB',
        description: 'Complete SaaS marketing, pricing, and docs frontend + API.',
        minPackage: 'starter',
      },
    ],
    faqs: [],
    published: true,
    featured: false,
    isSample: true,
    createdAt: '2026-10-01T11:00:00.000Z',
    updatedAt: '2026-10-08T15:00:00.000Z',
  },
  {
    id: 'prod-bespoke-custom',
    slug: 'bespoke-custom-web-application-build',
    title: 'Bespoke Enterprise Architecture — Custom Project',
    category: 'Custom Website Projects',
    shortDescription:
      'End-to-end custom design and full-stack engineering for specialized marketplaces, internal portals, and high-compliance web applications.',
    fullDescription:
      'When your business requires a custom workflow beyond a pre-built template, Markety Studio architects and delivers a dedicated web application tailored to your exact operational specification. Includes technical discovery, UI/UX prototyping, full-stack TypeScript/PostgreSQL engineering, and full source code ownership handover.',
    pricePKR: 185000,
    priceUSD: 665,
    originalCurrency: 'USD',
    discountPercentage: 0,
    thumbnailUrl: '/src/assets/images/modern_agency_web_1791734895414.jpg',
    galleryUrls: ['/src/assets/images/modern_agency_web_1791734895414.jpg'],
    liveDemoUrl: '/?demo=bespoke-custom-web-application-build',
    technologies: ['React 19', 'TypeScript', 'Tailwind CSS', 'Node.js / Express', 'PostgreSQL / Supabase'],
    features: [
      'Dedicated technical architecture blueprint and database schema design',
      'Custom UI/UX design system built specifically for your brand',
      'Role-based access control, custom API integrations, and reporting',
      'Full intellectual property and clean repository handover upon completion',
    ],
    responsiveDesign: 'Engineered to your exact target device matrix (Mobile, Tablet, Desktop)',
    sourceCodeIncluded: true,
    backendRequirements: 'Tailored to your infrastructure (PostgreSQL, Supabase, Cloud SQL, or custom REST APIs).',
    hostingRequirements: 'Deployed to your organization’s cloud account during final handover.',
    customizationOptions: '100% custom scope defined via written statement of work.',
    deliveryFormat: 'Private Git repository transfer + complete ZIP archive, SQL migrations, and runbooks.',
    estimatedDeliveryTime: '14–28 business days depending on agreed milestone schedule',
    packages: {
      starter: {
        enabled: true,
        name: 'Starter MVP Scope',
        pricePKR: 185000,
        priceUSD: 665,
        deliveryTime: '10–14 business days',
        summary: 'Core custom web application MVP with up to 5 key screens and database schema.',
        includedItems: [
          'Technical specification & database schema design',
          'Up to 5 custom responsive views + authentication',
          'Full source code & setup documentation',
        ],
      },
      professional: {
        enabled: true,
        name: 'Professional Full-Stack Scope',
        pricePKR: 320000,
        priceUSD: 1150,
        deliveryTime: '15–21 business days',
        summary: 'Full-featured custom platform with admin dashboard, payment workflows, and deployment.',
        includedItems: [
          'Everything in Starter MVP Scope',
          'Custom Admin Dashboard & role-based permissions',
          'Production cloud deployment & handover training documentation',
        ],
      },
      custom: {
        enabled: true,
        name: 'Enterprise Custom Quote',
        pricePKR: 550000,
        priceUSD: 1980,
        isCustomQuote: true,
        deliveryTime: 'Agreed milestone schedule',
        summary: 'Complex multi-role platforms, third-party ERP/API integrations, and bespoke SLAs.',
        includedItems: [
          'Dedicated architecture & engineering sprint',
          'Custom API integrations & automated test suite',
          'Complete source code, documentation, and staging walkthrough',
        ],
      },
    },
    deliverables: [
      {
        id: 'del-bc-1',
        title: 'Custom Project Architecture & Scope Blueprint',
        fileName: 'bespoke-project-architecture-template.md',
        fileType: 'setup_docs',
        fileSize: '38 KB',
        description: 'Technical blueprint, milestone checklist, and repository handover protocol.',
        minPackage: 'starter',
      },
    ],
    faqs: [],
    published: true,
    featured: false,
    isSample: true,
    createdAt: '2026-10-02T10:00:00.000Z',
    updatedAt: '2026-10-10T12:00:00.000Z',
  },
];

function loadOrInitializeStore(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(STORE_PATH)) {
    try {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      return JSON.parse(raw) as DatabaseSchema;
    } catch (err) {
      console.error('Error reading store.json, re-initializing:', err);
    }
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@marketystudio.com';
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'MarketyAdmin!2026';

  const demoCustomerId = 'usr-customer-demo-01';
  const adminUserId = 'usr-admin-01';

  const initialUsers: StoredUser[] = [
    {
      id: adminUserId,
      name: 'Markety Studio Administrator',
      email: adminEmail.toLowerCase(),
      passwordHash: hashPassword(adminPassword),
      role: 'admin',
      phone: '+923001234567',
      company: 'Markety Studio Digital',
      country: 'Pakistan',
      createdAt: '2026-09-01T08:00:00.000Z',
    },
    {
      id: demoCustomerId,
      name: 'Zainab Tariq',
      email: 'zainab@atelierpk.com',
      passwordHash: hashPassword('CustomerDemo!2026'),
      role: 'customer',
      phone: '+923219876543',
      company: 'Atelier Retail PK',
      country: 'Pakistan',
      createdAt: '2026-09-10T09:30:00.000Z',
    },
    {
      id: 'usr-customer-demo-02',
      name: 'David Vance',
      email: 'david@vanceventures.io',
      passwordHash: hashPassword('International!2026'),
      role: 'customer',
      phone: '+14158904321',
      company: 'Vance Ventures LLC',
      country: 'United States',
      createdAt: '2026-09-14T16:15:00.000Z',
    },
  ];

  // Create realistic sample orders showing different verification states (Paid/Delivered vs Payment Under Review vs Pending Payment)
  const initialOrders: Order[] = [
    {
      id: 'ord-1001',
      orderNumber: 'MS-2026-1041',
      userId: demoCustomerId,
      customerName: 'Zainab Tariq',
      customerEmail: 'zainab@atelierpk.com',
      customerPhone: '+923219876543',
      customerCompany: 'Atelier Retail PK',
      customerCountry: 'Pakistan',
      billingNotes: 'Launching our winter apparel collection next month.',
      productId: 'prod-smart-buy',
      productSlug: 'smart-buy-ecommerce-website',
      productTitle: 'Smart Buy — Ecommerce Website',
      productThumbnail: '/src/assets/images/smart_buy_ecommerce_1791734847810.jpg',
      packageTier: 'professional',
      packageName: 'Professional Package',
      currency: 'PKR',
      amount: 72000,
      paymentMethod: 'Bank Transfer',
      status: 'Delivered',
      paymentReference: 'MEEZAN-IBFT-994810234',
      receiptFileName: 'meezan-ibft-receipt-oct04.png',
      receiptNotes: 'Transferred Rs. 72,000 via Meezan Bank Corporate IBFT.',
      receiptSubmittedAt: '2026-10-04T11:20:00.000Z',
      verifiedByAdminAt: '2026-10-04T13:05:00.000Z',
      adminNotes: 'Verified incoming IBFT credit in Meezan account ending 7301. Deliverables unlocked.',
      deliverables: INITIAL_PRODUCTS[0].deliverables,
      createdAt: '2026-10-04T10:55:00.000Z',
      updatedAt: '2026-10-04T13:05:00.000Z',
    },
    {
      id: 'ord-1002',
      orderNumber: 'MS-2026-1089',
      userId: demoCustomerId,
      customerName: 'Zainab Tariq',
      customerEmail: 'zainab@atelierpk.com',
      customerPhone: '+923219876543',
      customerCompany: 'Atelier Retail PK',
      customerCountry: 'Pakistan',
      billingNotes: 'Corporate site for our parent holding group.',
      productId: 'prod-markety-business',
      productSlug: 'markety-business-corporate-website',
      productTitle: 'Markety Business — Business Website',
      productThumbnail: '/src/assets/images/markety_business_web_1791734859267.jpg',
      packageTier: 'starter',
      packageName: 'Starter Package',
      currency: 'PKR',
      amount: 35000,
      paymentMethod: 'JazzCash',
      status: 'Payment Under Review',
      paymentReference: 'TID-09482716552',
      receiptFileName: 'jazzcash-tid-09482716552.jpg',
      receiptNotes: 'Sent Rs. 35,000 from JazzCash wallet 0321-9876543.',
      receiptSubmittedAt: '2026-10-10T17:45:00.000Z',
      deliverables: INITIAL_PRODUCTS[1].deliverables.filter((d) => d.minPackage === 'starter'),
      createdAt: '2026-10-10T17:30:00.000Z',
      updatedAt: '2026-10-10T17:45:00.000Z',
    },
    {
      id: 'ord-1003',
      orderNumber: 'MS-2026-1094',
      userId: 'usr-customer-demo-02',
      customerName: 'David Vance',
      customerEmail: 'david@vanceventures.io',
      customerPhone: '+14158904321',
      customerCompany: 'Vance Ventures LLC',
      customerCountry: 'United States',
      billingNotes: 'Need the AI workflow starter for our internal analyst team.',
      productId: 'prod-ai-assistant',
      productSlug: 'ai-assistant-web-application',
      productTitle: 'AI Assistant — AI Web Application',
      productThumbnail: '/src/assets/images/ai_assistant_webapp_1791734884511.jpg',
      packageTier: 'professional',
      packageName: 'Professional Package',
      currency: 'USD',
      amount: 330,
      paymentMethod: 'International Payment Gateway',
      status: 'Paid',
      paymentReference: 'INV-USD-8849201',
      receiptFileName: 'wire-confirmation-8849201.pdf',
      receiptNotes: 'Paid USD $330 via international merchant invoice link.',
      receiptSubmittedAt: '2026-10-09T19:10:00.000Z',
      verifiedByAdminAt: '2026-10-09T20:00:00.000Z',
      adminNotes: 'Merchant settlement confirmed. Professional deliverables enabled.',
      deliverables: INITIAL_PRODUCTS[3].deliverables,
      createdAt: '2026-10-09T18:50:00.000Z',
      updatedAt: '2026-10-09T20:00:00.000Z',
    },
  ];

  const initialInquiries: Inquiry[] = [
    {
      id: 'inq-101',
      type: 'custom_project',
      userId: demoCustomerId,
      name: 'Zainab Tariq',
      email: 'zainab@atelierpk.com',
      phone: '+923219876543',
      subject: 'Custom ERP & Courier Integration for Smart Buy',
      message:
        'We would like a custom quote to integrate PostEx and Leopards Courier automated airway bill generation into our Smart Buy storefront.',
      budget: 'PKR 120,000 – 180,000',
      websiteType: 'Ecommerce Websites',
      requiredFeatures: 'PostEx API sync, automated WhatsApp order confirmation, bulk invoice printing',
      deadline: 'Within 3 weeks',
      status: 'In Progress',
      adminReply:
        'Hi Zainab, our engineering lead has reviewed the PostEx and Leopards API docs. We have prepared a milestone breakdown for you.',
      createdAt: '2026-10-08T14:20:00.000Z',
    },
  ];

  const initialAuditLogs: AuditLogEntry[] = [
    {
      id: 'aud-1',
      actorId: adminUserId,
      actorEmail: adminEmail.toLowerCase(),
      action: 'ORDER_PAYMENT_VERIFIED',
      targetType: 'order',
      targetId: 'MS-2026-1041',
      details: 'Verified Meezan IBFT reference MEEZAN-IBFT-994810234 and marked order Delivered.',
      createdAt: '2026-10-04T13:05:00.000Z',
    },
    {
      id: 'aud-2',
      actorId: adminUserId,
      actorEmail: adminEmail.toLowerCase(),
      action: 'ORDER_PAYMENT_VERIFIED',
      targetType: 'order',
      targetId: 'MS-2026-1094',
      details: 'Verified USD invoice INV-USD-8849201 ($330) and marked order Paid.',
      createdAt: '2026-10-09T20:00:00.000Z',
    },
  ];

  const initialDb: DatabaseSchema = {
    users: initialUsers,
    products: INITIAL_PRODUCTS,
    orders: initialOrders,
    inquiries: initialInquiries,
    settings: INITIAL_SETTINGS,
    auditLogs: initialAuditLogs,
  };

  fs.writeFileSync(STORE_PATH, JSON.stringify(initialDb, null, 2), 'utf-8');
  return initialDb;
}

let db: DatabaseSchema = loadOrInitializeStore();

function saveStore() {
  fs.writeFileSync(STORE_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

function logAdminAction(
  actor: StoredUser,
  action: string,
  targetType: AuditLogEntry['targetType'],
  targetId: string,
  details: string
) {
  db.auditLogs.unshift({
    id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    actorId: actor.id,
    actorEmail: actor.email,
    action,
    targetType,
    targetId,
    details,
    createdAt: new Date().toISOString(),
  });
  saveStore();
}

function sanitizeUser(user: StoredUser): UserProfile {
  const { passwordHash: _omitted, ...safe } = user;
  return safe;
}

interface AuthenticatedRequest extends Request {
  user?: StoredUser;
}

function authenticateMiddleware(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token: string | undefined;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  } else if (typeof req.query.token === 'string') {
    token = req.query.token;
  }
  const verified = verifyToken(token);
  if (verified) {
    const found = db.users.find((u) => u.id === verified.sub);
    if (found) {
      req.user = found;
    }
  }
  next();
}

function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({
      error: 'Authentication required. Please sign in to your Markety Studio account.',
    });
    return;
  }
  next();
}

function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({
      error: 'Administrator authentication required.',
    });
    return;
  }
  if (req.user.role !== 'admin') {
    db.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      actorId: req.user.id,
      actorEmail: req.user.email,
      action: 'UNAUTHORIZED_ADMIN_ACCESS_BLOCKED',
      targetType: 'auth',
      targetId: req.originalUrl,
      details: `Blocked non-admin user (${req.user.email}) from accessing ${req.method} ${req.originalUrl}`,
      createdAt: new Date().toISOString(),
    });
    saveStore();
    res.status(403).json({
      error: 'Access Denied: Administrator privileges are enforced on the server for this operation.',
    });
    return;
  }
  next();
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));
  app.use(authenticateMiddleware);

  // Serve generated images from /src/assets/images in both dev and prod
  app.use(
    '/src/assets/images',
    express.static(path.resolve(process.cwd(), 'src/assets/images'))
  );

  // ============================================================================
  // PUBLIC & SYSTEM CONFIGURATION ENDPOINTS
  // ============================================================================

  app.get('/api/bootstrap', (req: AuthenticatedRequest, res: Response) => {
    const isAdmin = req.user?.role === 'admin';
    const visibleProducts = isAdmin
      ? db.products
      : db.products.filter((p) => p.published);

    res.json({
      settings: db.settings,
      products: visibleProducts,
      user: req.user ? sanitizeUser(req.user) : null,
      systemStatus: {
        backendConfigured: true,
        storageEngine: 'Server-Side Persistent JSON Store (/data/store.json) + Protected File Streamer',
        externalDatabaseConfigured: Boolean(
          process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('user:password')
        ),
        customSessionSecretConfigured: Boolean(process.env.SESSION_SECRET),
        customAdminConfigured: Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_INITIAL_PASSWORD),
        sandboxRoleSwitchEnabled: process.env.NODE_ENV !== 'production',
      },
    });
  });

  // ============================================================================
  // AUTHENTICATION & PROFILE ENDPOINTS
  // ============================================================================

  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { name, email, password, phone, company, country } = req.body || {};
    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email address, and password are required.' });
      return;
    }
    if (String(password).length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    if (db.users.some((u) => u.email === normalizedEmail)) {
      res.status(409).json({ error: 'An account with this email address already exists.' });
      return;
    }

    const newUser: StoredUser = {
      id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash: hashPassword(String(password)),
      role: 'customer', // Registration strictly creates customer accounts, never admin
      phone: phone ? String(phone).trim() : '',
      company: company ? String(company).trim() : '',
      country: country ? String(country).trim() : 'Pakistan',
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    saveStore();

    const token = createToken(newUser.id, newUser.role);
    res.status(201).json({
      token,
      user: sanitizeUser(newUser),
    });
  });

  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
      res.status(400).json({ error: 'Please provide both email and password.' });
      return;
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    const user = db.users.find((u) => u.email === normalizedEmail);
    if (!user || user.passwordHash !== hashPassword(String(password))) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = createToken(user.id, user.role);
    res.json({
      token,
      user: sanitizeUser(user),
    });
  });

  // Sandbox role switcher for evaluation & testing (no hardcoded passwords in frontend bundle)
  app.post('/api/auth/sandbox-session', (req: Request, res: Response) => {
    const { targetRole } = req.body || {};
    if (targetRole === 'admin') {
      const adminUser = db.users.find((u) => u.role === 'admin');
      if (!adminUser) {
        res.status(404).json({ error: 'Administrator account not found.' });
        return;
      }
      const token = createToken(adminUser.id, 'admin');
      res.json({ token, user: sanitizeUser(adminUser) });
      return;
    }

    if (targetRole === 'customer_pk') {
      const customer = db.users.find((u) => u.email === 'zainab@atelierpk.com') || db.users.find((u) => u.role === 'customer');
      if (!customer) {
        res.status(404).json({ error: 'Demo customer account not found.' });
        return;
      }
      const token = createToken(customer.id, 'customer');
      res.json({ token, user: sanitizeUser(customer) });
      return;
    }

    if (targetRole === 'customer_intl') {
      const customer = db.users.find((u) => u.email === 'david@vanceventures.io') || db.users.find((u) => u.role === 'customer');
      if (!customer) {
        res.status(404).json({ error: 'International demo customer not found.' });
        return;
      }
      const token = createToken(customer.id, 'customer');
      res.json({ token, user: sanitizeUser(customer) });
      return;
    }

    res.status(400).json({ error: 'Invalid sandbox session target.' });
  });

  app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    res.json({ user: sanitizeUser(req.user!) });
  });

  app.put('/api/auth/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const { name, phone, company, country } = req.body || {};
    const user = req.user!;
    if (name) user.name = String(name).trim();
    if (phone !== undefined) user.phone = String(phone).trim();
    if (company !== undefined) user.company = String(company).trim();
    if (country !== undefined) user.country = String(country).trim();
    saveStore();
    res.json({ user: sanitizeUser(user) });
  });

  app.post('/api/auth/reset-password', (req: AuthenticatedRequest, res: Response) => {
    const { email, currentPassword, newPassword } = req.body || {};
    if (!newPassword || String(newPassword).length < 6) {
      res.status(400).json({ error: 'New password must be at least 6 characters.' });
      return;
    }

    if (req.user) {
      if (currentPassword && req.user.passwordHash !== hashPassword(String(currentPassword))) {
        res.status(400).json({ error: 'Current password did not match.' });
        return;
      }
      req.user.passwordHash = hashPassword(String(newPassword));
      saveStore();
      res.json({ message: 'Password updated successfully.' });
      return;
    }

    if (!email) {
      res.status(400).json({ error: 'Please provide your registered email address.' });
      return;
    }
    const found = db.users.find((u) => u.email === String(email).trim().toLowerCase());
    if (!found) {
      res.status(404).json({ error: 'No customer account found with that email address.' });
      return;
    }
    if (found.role === 'admin') {
      res.status(403).json({
        error: 'Administrator password resets require authenticated admin session or server CLI.',
      });
      return;
    }
    found.passwordHash = hashPassword(String(newPassword));
    saveStore();
    res.json({ message: 'Customer password has been reset. You may now sign in.' });
  });

  // ============================================================================
  // CUSTOMER ORDERS & PROTECTED FILE DELIVERY
  // ============================================================================

  app.get('/api/orders/my', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const myOrders = db.orders.filter((o) => o.userId === req.user!.id);
    const myInquiries = db.inquiries.filter(
      (i) => i.userId === req.user!.id || i.email.toLowerCase() === req.user!.email.toLowerCase()
    );
    res.json({ orders: myOrders, inquiries: myInquiries });
  });

  app.post('/api/orders', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const {
      productId,
      packageTier,
      currency,
      paymentMethod,
      customerName,
      customerEmail,
      customerPhone,
      customerCompany,
      customerCountry,
      billingNotes,
    } = req.body || {};

    const product = db.products.find((p) => p.id === productId && p.published);
    if (!product) {
      res.status(404).json({ error: 'Selected website listing is unavailable.' });
      return;
    }

    const tierKey = packageTier as PackageTierKey;
    const pkg = product.packages[tierKey];
    if (!pkg || !pkg.enabled) {
      res.status(400).json({ error: 'Selected package tier is not enabled for this listing.' });
      return;
    }

    if (!customerName || !customerEmail || !customerPhone || !customerCountry) {
      res.status(400).json({ error: 'Please complete all required contact and billing fields.' });
      return;
    }

    const methodSetting = db.settings.paymentMethods[paymentMethod as keyof PlatformSettings['paymentMethods']];
    if (!methodSetting || !methodSetting.enabled) {
      res.status(400).json({ error: 'Selected payment method is currently unavailable.' });
      return;
    }

    const selectedCurrency = currency === 'USD' ? 'USD' : 'PKR';
    const rawPrice = selectedCurrency === 'USD' ? pkg.priceUSD : pkg.pricePKR;
    const discountMultiplier =
      product.discountPercentage > 0 ? (100 - product.discountPercentage) / 100 : 1;
    const finalAmount = Math.round(rawPrice * discountMultiplier);

    const tierRank: Record<PackageTierKey, number> = { starter: 1, professional: 2, custom: 3 };
    const eligibleDeliverables = product.deliverables.filter(
      (d) => tierRank[d.minPackage] <= tierRank[tierKey]
    );

    const orderNumber = `MS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // CRITICAL PAYMENT RULE: Order creation NEVER marks an order as Paid.
    const newOrder: Order = {
      id: `ord-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      orderNumber,
      userId: req.user!.id,
      customerName: String(customerName).trim(),
      customerEmail: String(customerEmail).trim(),
      customerPhone: String(customerPhone).trim(),
      customerCompany: customerCompany ? String(customerCompany).trim() : '',
      customerCountry: String(customerCountry).trim(),
      billingNotes: billingNotes ? String(billingNotes).trim() : '',
      productId: product.id,
      productSlug: product.slug,
      productTitle: product.title,
      productThumbnail: product.thumbnailUrl,
      packageTier: tierKey,
      packageName: pkg.name,
      currency: selectedCurrency,
      amount: finalAmount,
      paymentMethod,
      status: 'Pending Payment',
      deliverables: eligibleDeliverables,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.orders.unshift(newOrder);
    saveStore();

    res.status(201).json({ order: newOrder });
  });

  // Submit payment reference or receipt for manual verification
  // CRITICAL PAYMENT RULE: Submitting a receipt sets status to 'Payment Under Review', NEVER 'Paid'.
  app.post('/api/orders/:orderId/receipt', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const order = db.orders.find((o) => o.id === req.params.orderId);
    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }
    if (order.userId !== req.user!.id && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'You are not authorized to modify this order.' });
      return;
    }
    if (order.status === 'Paid' || order.status === 'Delivered') {
      res.status(400).json({ error: 'Payment for this order has already been verified.' });
      return;
    }
    if (order.status === 'Cancelled') {
      res.status(400).json({ error: 'Cannot submit payment receipt for a cancelled order.' });
      return;
    }

    const { paymentReference, receiptFileName, receiptDataUrl, receiptNotes } = req.body || {};
    if (!paymentReference || String(paymentReference).trim().length < 4) {
      res.status(400).json({
        error: 'Please enter a valid payment transaction reference or TID (minimum 4 characters).',
      });
      return;
    }

    order.paymentReference = String(paymentReference).trim();
    order.receiptFileName = receiptFileName ? String(receiptFileName).trim() : undefined;
    order.receiptDataUrl = receiptDataUrl ? String(receiptDataUrl) : undefined;
    order.receiptNotes = receiptNotes ? String(receiptNotes).trim() : '';
    order.receiptSubmittedAt = new Date().toISOString();
    order.status = 'Payment Under Review';
    order.updatedAt = new Date().toISOString();

    saveStore();
    res.json({ order });
  });

  // Protected File Delivery Endpoint
  app.get(
    '/api/orders/:orderId/download/:deliverableId',
    requireAuth,
    (req: AuthenticatedRequest, res: Response) => {
      const order = db.orders.find((o) => o.id === req.params.orderId);
      if (!order) {
        res.status(404).json({ error: 'Order not found.' });
        return;
      }

      // Enforce customer isolation: only the order owner or an admin can download
      if (order.userId !== req.user!.id && req.user!.role !== 'admin') {
        res.status(403).json({
          error: 'Access Denied: You can only download deliverables belonging to your own orders.',
        });
        return;
      }

      // Enforce payment verification rule: only Paid or Delivered orders can download files
      if (order.status !== 'Paid' && order.status !== 'Delivered') {
        res.status(403).json({
          error: `Download Locked: Order ${order.orderNumber} is currently "${order.status}". Deliverables are only unlocked after payment is verified by an administrator.`,
        });
        return;
      }

      const deliverable = order.deliverables.find((d) => d.id === req.params.deliverableId);
      if (!deliverable) {
        res.status(404).json({ error: 'Requested deliverable file not found on this order.' });
        return;
      }

      const product = db.products.find((p) => p.id === order.productId);

      const fileContent = [
        `================================================================================`,
        `MARKETY STUDIO — AUTHORIZED DELIVERABLE ARCHIVE`,
        `================================================================================`,
        `Order Number      : ${order.orderNumber}`,
        `Licensed Customer : ${order.customerName} (${order.customerEmail})`,
        `Website Product   : ${order.productTitle}`,
        `Package Tier      : ${order.packageName} (${order.packageTier.toUpperCase()})`,
        `Deliverable       : ${deliverable.title} (${deliverable.fileName})`,
        `Payment Status    : ${order.status} (Verified: ${order.verifiedByAdminAt || 'Yes'})`,
        `Generated At      : ${new Date().toISOString()}`,
        `================================================================================`,
        ``,
        `1. TECHNICAL STACK & ARCHITECTURE`,
        `   Technologies   : ${product ? product.technologies.join(', ') : 'React, TypeScript, Tailwind CSS'}`,
        `   Backend Req.   : ${product ? product.backendRequirements : 'Node.js 20+'}`,
        `   Hosting Req.   : ${product ? product.hostingRequirements : 'Standard Node/Static Host'}`,
        ``,
        `2. QUICK-START INSTALLATION INSTRUCTIONS`,
        `   $ unzip ${deliverable.fileName}`,
        `   $ npm install`,
        `   $ cp .env.example .env`,
        `   $ npm run dev`,
        ``,
        `3. ENVIRONMENT VARIABLES (.env.example — NO SECRETS INCLUDED)`,
        `   PORT=3000`,
        `   DATABASE_URL="postgresql://user:password@localhost:5432/app_db"`,
        `   SESSION_SECRET="replace-with-secure-random-hex"`,
        ``,
        `4. LICENSE & DELIVERY NOTE`,
        `   This license grants ${order.customerName} usage rights for ${order.productTitle}`,
        `   under the ${order.packageName} terms. Verify all environment variables and`,
        `   dependencies before deploying to production.`,
        `================================================================================`,
      ].join('\n');

      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${deliverable.fileName}.txt"`
      );
      res.send(fileContent);
    }
  );

  // ============================================================================
  // CONTACT, CUSTOM WEBSITE REQUESTS & SUPPORT INQUIRIES
  // ============================================================================

  app.post('/api/inquiries', (req: AuthenticatedRequest, res: Response) => {
    const {
      type,
      name,
      email,
      phone,
      subject,
      message,
      budget,
      websiteType,
      requiredFeatures,
      deadline,
      orderNumber,
    } = req.body || {};

    if (!name || !email || !message) {
      res.status(400).json({ error: 'Name, valid email address, and message details are required.' });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email).trim())) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }

    if (type === 'custom_project' && (!budget || !websiteType || !requiredFeatures || !deadline)) {
      res.status(400).json({
        error:
          'For custom website requests, please specify your budget range, preferred website type, required features, and target deadline.',
      });
      return;
    }

    const inquiry: Inquiry = {
      id: `inq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: type === 'custom_project' || type === 'support' ? type : 'general',
      userId: req.user?.id,
      name: String(name).trim(),
      email: String(email).trim(),
      phone: phone ? String(phone).trim() : '',
      subject: subject ? String(subject).trim() : 'Website Inquiry',
      message: String(message).trim(),
      budget: budget ? String(budget).trim() : undefined,
      websiteType: websiteType ? String(websiteType).trim() : undefined,
      requiredFeatures: requiredFeatures ? String(requiredFeatures).trim() : undefined,
      deadline: deadline ? String(deadline).trim() : undefined,
      orderNumber: orderNumber ? String(orderNumber).trim() : undefined,
      status: 'New',
      createdAt: new Date().toISOString(),
    };

    db.inquiries.unshift(inquiry);
    saveStore();

    res.status(201).json({
      inquiry,
      message:
        'Your inquiry has been recorded in the Markety Studio database and queued for our team.',
    });
  });

  // ============================================================================
  // PROTECTED ADMIN PANEL ENDPOINTS (STRICT SERVER-SIDE RBAC)
  // ============================================================================

  app.get('/api/admin/overview', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
    const paidOrders = db.orders.filter((o) => o.status === 'Paid' || o.status === 'Delivered');
    const revenuePKR = paidOrders
      .filter((o) => o.currency === 'PKR')
      .reduce((sum, o) => sum + o.amount, 0);
    const revenueUSD = paidOrders
      .filter((o) => o.currency === 'USD')
      .reduce((sum, o) => sum + o.amount, 0);
    const pendingVerificationCount = db.orders.filter(
      (o) => o.status === 'Pending Payment' || o.status === 'Payment Under Review'
    ).length;

    const customers = db.users
      .filter((u) => u.role === 'customer')
      .map((u) => ({
        ...sanitizeUser(u),
        orderCount: db.orders.filter((o) => o.userId === u.id).length,
      }));

    res.json({
      metrics: {
        totalOrders: db.orders.length,
        verifiedOrders: paidOrders.length,
        pendingVerificationCount,
        revenuePKR,
        revenueUSD,
        totalProducts: db.products.length,
        publishedProducts: db.products.filter((p) => p.published).length,
        totalCustomers: customers.length,
        openInquiries: db.inquiries.filter((i) => i.status !== 'Resolved').length,
      },
      orders: db.orders,
      products: db.products,
      customers,
      inquiries: db.inquiries,
      auditLogs: db.auditLogs.slice(0, 50),
      settings: db.settings,
    });
  });

  app.post('/api/admin/products', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const body = req.body || {};
    if (!body.title || !body.category || body.pricePKR === undefined || body.priceUSD === undefined) {
      res.status(400).json({ error: 'Title, category, PKR price, and USD price are required.' });
      return;
    }

    const slug =
      (body.slug ? String(body.slug) : String(body.title))
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + `-${Date.now().toString().slice(-4)}`;

    const pricePKR = Number(body.pricePKR) || 35000;
    const priceUSD = Number(body.priceUSD) || 125;

    const newProduct: WebsiteProduct = {
      id: `prod-${Date.now()}`,
      slug,
      title: String(body.title).trim(),
      category: body.category,
      shortDescription: String(body.shortDescription || 'Ready-made digital website package.'),
      fullDescription: String(body.fullDescription || body.shortDescription || ''),
      pricePKR,
      priceUSD,
      originalCurrency: body.originalCurrency === 'USD' ? 'USD' : 'PKR',
      discountPercentage: Number(body.discountPercentage) || 0,
      thumbnailUrl:
        body.thumbnailUrl || '/src/assets/images/modern_agency_web_1791734895414.jpg',
      galleryUrls: Array.isArray(body.galleryUrls) && body.galleryUrls.length > 0
        ? body.galleryUrls
        : [body.thumbnailUrl || '/src/assets/images/modern_agency_web_1791734895414.jpg'],
      liveDemoUrl: String(body.liveDemoUrl || `/?demo=${slug}`),
      technologies: Array.isArray(body.technologies)
        ? body.technologies
        : ['React 19', 'TypeScript', 'Tailwind CSS'],
      features: Array.isArray(body.features)
        ? body.features
        : ['Responsive layout', 'Source code included', 'Documentation'],
      responsiveDesign: String(
        body.responsiveDesign || 'Mobile, Tablet, Laptop & Widescreen Desktop'
      ),
      sourceCodeIncluded: body.sourceCodeIncluded !== false,
      backendRequirements: String(
        body.backendRequirements || 'Standard Node.js / static hosting environment.'
      ),
      hostingRequirements: String(
        body.hostingRequirements || 'Compatible with Netlify, Vercel, Render, or Cloud Run.'
      ),
      customizationOptions: String(
        body.customizationOptions || 'Branding, color palette, and feature extensions available.'
      ),
      deliveryFormat: String(
        body.deliveryFormat || 'ZIP archive with source code and setup documentation.'
      ),
      estimatedDeliveryTime: String(
        body.estimatedDeliveryTime || 'Instant download upon payment verification'
      ),
      packages: body.packages || {
        starter: {
          enabled: true,
          name: 'Starter Package',
          pricePKR,
          priceUSD,
          deliveryTime: 'Available immediately after payment verification',
          summary: 'Website source files as specified in the listing with basic setup instructions.',
          includedItems: ['Complete website source code (ZIP)', 'Basic setup instructions'],
        },
        professional: {
          enabled: true,
          name: 'Professional Package',
          pricePKR: Math.round(pricePKR * 1.45),
          priceUSD: Math.round(priceUSD * 1.45),
          deliveryTime: '1–2 business days',
          summary: 'Website files plus production setup & deployment guide.',
          includedItems: [
            'Everything in Starter Package',
            'Production deployment & environment guide',
          ],
        },
        custom: {
          enabled: true,
          name: 'Custom Package',
          pricePKR: Math.round(pricePKR * 2.5),
          priceUSD: Math.round(priceUSD * 2.5),
          isCustomQuote: true,
          deliveryTime: '5–10 business days based on agreed scope',
          summary: 'Website customization and additional integrations based on agreed scope.',
          includedItems: [
            'Everything in Professional Package',
            'Custom branding & feature additions per scope',
          ],
        },
      },
      deliverables: Array.isArray(body.deliverables) && body.deliverables.length > 0
        ? body.deliverables
        : [
            {
              id: `del-${Date.now()}`,
              title: `${body.title} Source Code Archive`,
              fileName: `${slug}-source.zip`,
              fileType: 'source_zip',
              fileSize: '3.4 MB',
              description: 'Complete website source files and setup instructions.',
              minPackage: 'starter',
            },
          ],
      faqs: Array.isArray(body.faqs) ? body.faqs : [],
      published: body.published !== false,
      featured: Boolean(body.featured),
      isSample: Boolean(body.isSample),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.products.unshift(newProduct);
    logAdminAction(
      req.user!,
      'PRODUCT_CREATED',
      'product',
      newProduct.id,
      `Created website listing "${newProduct.title}" (${newProduct.category})`
    );

    res.status(201).json({ product: newProduct });
  });

  app.put('/api/admin/products/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const idx = db.products.findIndex((p) => p.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Product listing not found.' });
      return;
    }
    const existing = db.products[idx];
    const updated: WebsiteProduct = {
      ...existing,
      ...req.body,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    };
    db.products[idx] = updated;
    logAdminAction(
      req.user!,
      'PRODUCT_UPDATED',
      'product',
      updated.id,
      `Updated listing "${updated.title}" (Published: ${updated.published}, Featured: ${updated.featured})`
    );
    res.json({ product: updated });
  });

  app.delete('/api/admin/products/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const idx = db.products.findIndex((p) => p.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Product listing not found.' });
      return;
    }
    const removed = db.products.splice(idx, 1)[0];
    logAdminAction(
      req.user!,
      'PRODUCT_DELETED',
      'product',
      removed.id,
      `Deleted website listing "${removed.title}"`
    );
    res.json({ deletedId: removed.id });
  });

  // Admin Order Status & Payment Verification
  app.patch(
    '/api/admin/orders/:id/status',
    requireAdmin,
    (req: AuthenticatedRequest, res: Response) => {
      const order = db.orders.find((o) => o.id === req.params.id);
      if (!order) {
        res.status(404).json({ error: 'Order not found.' });
        return;
      }

      const { status, adminNotes } = req.body || {};
      const allowedStatuses: OrderStatus[] = [
        'Pending Payment',
        'Payment Under Review',
        'Paid',
        'Processing',
        'Delivered',
        'Cancelled',
      ];
      if (!allowedStatuses.includes(status)) {
        res.status(400).json({ error: 'Invalid order status.' });
        return;
      }

      const previousStatus = order.status;
      order.status = status;
      if (adminNotes !== undefined) {
        order.adminNotes = String(adminNotes).trim();
      }
      if (status === 'Paid' || status === 'Delivered') {
        order.verifiedByAdminAt = order.verifiedByAdminAt || new Date().toISOString();
      }
      order.updatedAt = new Date().toISOString();

      logAdminAction(
        req.user!,
        'ORDER_STATUS_UPDATED',
        'order',
        order.orderNumber,
        `Changed order ${order.orderNumber} status from "${previousStatus}" to "${status}". Ref: ${
          order.paymentReference || 'N/A'
        }`
      );

      res.json({ order });
    }
  );

  // Attach additional deliverable to an order
  app.post(
    '/api/admin/orders/:id/deliverables',
    requireAdmin,
    (req: AuthenticatedRequest, res: Response) => {
      const order = db.orders.find((o) => o.id === req.params.id);
      if (!order) {
        res.status(404).json({ error: 'Order not found.' });
        return;
      }
      const { title, fileName, fileType, fileSize, description } = req.body || {};
      if (!title || !fileName) {
        res.status(400).json({ error: 'Deliverable title and file name are required.' });
        return;
      }

      const newDel = {
        id: `del-ord-${Date.now()}`,
        title: String(title).trim(),
        fileName: String(fileName).trim(),
        fileType: fileType || 'source_zip',
        fileSize: String(fileSize || '2.5 MB'),
        description: String(description || 'Custom order deliverable attached by administrator.'),
        minPackage: order.packageTier,
      };

      order.deliverables.push(newDel);
      order.updatedAt = new Date().toISOString();

      logAdminAction(
        req.user!,
        'ORDER_DELIVERABLE_ATTACHED',
        'order',
        order.orderNumber,
        `Attached deliverable "${newDel.fileName}" to order ${order.orderNumber}`
      );

      res.json({ order });
    }
  );

  // Admin Inquiry Management
  app.patch(
    '/api/admin/inquiries/:id',
    requireAdmin,
    (req: AuthenticatedRequest, res: Response) => {
      const inquiry = db.inquiries.find((i) => i.id === req.params.id);
      if (!inquiry) {
        res.status(404).json({ error: 'Inquiry not found.' });
        return;
      }
      const { status, adminReply } = req.body || {};
      if (status) inquiry.status = status;
      if (adminReply !== undefined) inquiry.adminReply = String(adminReply).trim();

      logAdminAction(
        req.user!,
        'INQUIRY_UPDATED',
        'inquiry',
        inquiry.id,
        `Updated inquiry from ${inquiry.email} to status "${inquiry.status}"`
      );

      res.json({ inquiry });
    }
  );

  // Admin Platform Settings & Payment Instructions
  app.put('/api/admin/settings', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    db.settings = {
      ...db.settings,
      ...req.body,
    };
    logAdminAction(
      req.user!,
      'PLATFORM_SETTINGS_UPDATED',
      'settings',
      'global',
      'Updated Markety Studio contact details, currency exchange rate, or payment instructions.'
    );
    res.json({ settings: db.settings });
  });

  // ============================================================================
  // VITE DEV SERVER OR STATIC ASSET SERVING
  // ============================================================================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Markety Studio server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
