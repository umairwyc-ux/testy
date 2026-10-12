import React, { useState } from 'react';
import {
  ArrowRight,
  Eye,
  Code2,
  Smartphone,
  ShieldCheck,
  Sliders,
  CreditCard,
  MessageSquare,
} from 'lucide-react';
import {
  WebsiteProduct,
  CurrencyCode,
  PlatformSettings,
  WEBSITE_CATEGORIES,
  WebsiteCategory,
} from '../types';
import { HeroShowcase } from '../components/HeroShowcase';
import { ProductCard } from '../components/ProductCard';
import { ActivePage } from '../components/Navbar';

interface HomePageProps {
  products: WebsiteProduct[];
  currency: CurrencyCode;
  settings: PlatformSettings;
  onNavigate: (page: ActivePage, category?: WebsiteCategory | 'All') => void;
  onViewDetails: (product: WebsiteProduct) => void;
  onBuyWebsite: (product: WebsiteProduct) => void;
  onLiveDemo: (product: WebsiteProduct) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  products,
  currency,
  settings,
  onNavigate,
  onViewDetails,
  onBuyWebsite,
  onLiveDemo,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<WebsiteCategory | 'All'>('All');

  const filteredProducts =
    selectedCategory === 'All'
      ? products.slice(0, 6)
      : products.filter((p) => p.category === selectedCategory).slice(0, 6);

  const featuredProducts = products.filter((p) => p.featured);

  return (
    <div className="space-y-24 pb-20">
      {/* SECTION 1: HERO SECTION */}
      <section className="relative pt-10 lg:pt-16 overflow-hidden">
        {/* Subtle Top Background Radial Glow */}
        <div
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[960px] h-[420px] opacity-25 blur-3xl"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(37, 99, 235, 0.45), rgba(6, 182, 212, 0.1) 60%, transparent 80%)',
          }}
          aria-hidden="true"
        />

        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy Column */}
            <div className="lg:col-span-6 space-y-6">
              <div className="text-xs font-mono text-blue-400 tracking-wide">
                {settings.brandName} · {settings.tagline}
              </div>

              <h1
                className="font-display font-bold text-white tracking-tight leading-[1.1]"
                style={{ fontSize: 'clamp(2.35rem, 4.2vw, 3.75rem)' }}
              >
                {settings.heroHeadline}
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
                {settings.heroSubheadline}
              </p>

              {/* Primary & Secondary CTAs */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('marketplace', 'All')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-lg shadow-blue-600/20 whitespace-nowrap"
                >
                  <span>Explore Websites</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (featuredProducts[0]) {
                      onLiveDemo(featuredProducts[0]);
                    } else {
                      onNavigate('marketplace', 'All');
                    }
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-200 bg-[#121622] hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-colors whitespace-nowrap"
                >
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span>View Live Demos</span>
                </button>
              </div>

              {/* Transparent Capabilities Metadata */}
              <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
                <span>PKR & USD Pricing Supported</span>
                <span aria-hidden="true">·</span>
                <span>JazzCash, Easypaisa, IBFT & International</span>
                <span aria-hidden="true">·</span>
                <span>Verified Code Delivery</span>
              </div>
            </div>

            {/* Right Interactive Layered Browser Showcase */}
            <div className="lg:col-span-6">
              <HeroShowcase
                products={featuredProducts.length > 0 ? featuredProducts : products}
                currency={currency}
                onSelectProduct={onViewDetails}
                onOpenLiveDemo={onLiveDemo}
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: FEATURED MARKETPLACE COLLECTION */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="space-y-2">
            <div className="text-xs font-mono text-blue-400">01. Website Catalogue</div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Ready-Made Websites & Web Applications
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl">
              Inspect live interactive demos, review backend and hosting requirements, and choose a
              package that matches your launch timeline.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('marketplace', 'All')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors self-start md:self-auto whitespace-nowrap"
          >
            <span>View Full Marketplace ({products.length} Listings)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Interactive Category Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              selectedCategory === 'All'
                ? 'bg-blue-600 text-white'
                : 'bg-[#11141F] text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            All Categories
          </button>
          {WEBSITE_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#11141F] text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                currency={currency}
                onViewDetails={onViewDetails}
                onBuyWebsite={onBuyWebsite}
                onLiveDemo={onLiveDemo}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 rounded-2xl bg-[#11141F] border border-slate-800 text-center space-y-3">
            <p className="text-sm text-slate-300">
              No website listings found in {selectedCategory}.
            </p>
            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg"
            >
              Show All Websites
            </button>
          </div>
        )}
      </section>

      {/* SECTION 3: TRUST & BENEFITS SECTION (Strictly factual, zero fabricated claims) */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#0E111B] border border-slate-800/90 p-8 sm:p-12 space-y-10">
          <div className="max-w-2xl space-y-2">
            <div className="text-xs font-mono text-cyan-400">
              02. Transparent Delivery & Architecture Standards
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Built for Clarity, Code Ownership, and Verified Delivery
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Every listing on Markety Studio documents its exact technology stack, responsive
              coverage, hosting prerequisites, and package deliverables before you place an order.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#121624] border border-slate-800/80 space-y-2.5">
              <Eye className="w-5 h-5 text-blue-400" />
              <h3 className="font-display text-base font-bold text-white">
                01. Live Website Previews
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Test the interactive layout, responsive breakpoints, and user flow of any website
                listing in your browser before committing to a purchase.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#121624] border border-slate-800/80 space-y-2.5">
              <Code2 className="w-5 h-5 text-cyan-400" />
              <h3 className="font-display text-base font-bold text-white">
                02. Source Code Included When Specified
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Eligible listings include complete TypeScript/React source archives, database SQL
                schemas, and `.env.example` templates with no vendor lock-in.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#121624] border border-slate-800/80 space-y-2.5">
              <Smartphone className="w-5 h-5 text-blue-400" />
              <h3 className="font-display text-base font-bold text-white">
                03. Responsive Website Designs
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Engineered for mobile phones, tablets, laptops, and large desktop monitors with
                clean typography and accessible navigation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#121624] border border-slate-800/80 space-y-2.5">
              <CreditCard className="w-5 h-5 text-cyan-400" />
              <h3 className="font-display text-base font-bold text-white">
                04. Transparent PKR & USD Pricing
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Choose Starter, Professional, or Custom packages in Pakistani Rupees (PKR) or US
                Dollars (USD) with zero hidden platform subscriptions.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#121624] border border-slate-800/80 space-y-2.5">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              <h3 className="font-display text-base font-bold text-white">
                05. Delivery After Payment Verification
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Pay via JazzCash, Easypaisa, Bank Transfer, or international billing. Once payment
                is verified by our team, secure download links unlock in your Customer Dashboard.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#121624] border border-slate-800/80 space-y-2.5">
              <Sliders className="w-5 h-5 text-cyan-400" />
              <h3 className="font-display text-base font-bold text-white">
                06. Optional Customization Services
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Need custom branding, local courier integration, or bespoke features? Select the
                Custom Package or submit a custom project specification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: CONVERSION & CUSTOM WEBSITE CALLOUT */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-[#11172B] via-[#111522] to-[#0D1420] border border-blue-500/30 p-8 sm:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-2 max-w-2xl">
            <div className="text-xs font-mono text-blue-400">
              03. Custom Engineering & Agency Retainers
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Need a Custom Web Application Built Around Your Business Logic?
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Share your target website type, required features, budget, and launch deadline. Our
              engineering team will scope a fixed-milestone proposal.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('contact')}
              className="inline-flex items-center gap-2 px-5 py-3 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors whitespace-nowrap"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Request Custom Website</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('how-it-works')}
              className="inline-flex items-center gap-2 px-5 py-3 text-xs font-semibold text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 rounded-xl transition-colors whitespace-nowrap"
            >
              <span>See How Delivery Works</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
