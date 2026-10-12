import React, { useState, useEffect, useCallback } from 'react';
import { MessageCircle, Search, X, ArrowRight } from 'lucide-react';
import {
  WebsiteProduct,
  CurrencyCode,
  PlatformSettings,
  UserProfile,
  WebsiteCategory,
  PackageTierKey,
} from './types';
import { Navbar, ActivePage } from './components/Navbar';
import { Footer } from './components/Footer';
import { LiveDemoView } from './components/LiveDemoView';
import { HomePage } from './pages/HomePage';
import { MarketplacePage } from './pages/MarketplacePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ContactAndPolicies } from './pages/ContactAndPolicies';

const FALLBACK_SETTINGS: PlatformSettings = {
  brandName: 'Markety Studio',
  tagline: 'Premium Websites. Ready for Your Next Big Idea.',
  heroHeadline: 'Your Next Website Is Already Built.',
  heroSubheadline:
    'Discover premium, ready-made websites built for businesses, entrepreneurs, and creators. Preview the live experience, choose your website, and get the files you need to launch.',
  whatsappNumber: '+923001234567',
  businessEmail: 'hello@marketystudio.com',
  supportHours: 'Monday – Saturday, 10:00 AM – 8:00 PM PKT (GMT+5)',
  officeLocation: 'Gulberg III, Lahore, Pakistan · Serving Clients Worldwide',
  usdToPkrRate: 278.5,
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
        'Send the exact PKR order total to our official JazzCash business account and submit your 11-digit TID for verification.',
    },
    Easypaisa: {
      enabled: true,
      title: 'Easypaisa Business Wallet',
      accountTitle: 'Markety Studio Digital Pvt Ltd',
      accountNumber: '0345-7766110',
      instructions:
        'Transfer the exact PKR amount via Easypaisa and upload your transaction reference for verification.',
    },
    'Bank Transfer': {
      enabled: true,
      title: 'Direct Bank Transfer (IBFT / Raast)',
      accountTitle: 'Markety Studio Digital Pvt Ltd',
      accountNumber: '0142-7901827301',
      bankName: 'Meezan Bank Limited — Gulberg Corporate Branch, Lahore',
      iban: 'PK36MEZN0001427901827301',
      instructions:
        'Transfer via IBFT or Raast to the IBAN above and submit your reference ID for verification.',
    },
    'International Payment Gateway': {
      enabled: true,
      title: 'International Card / USD Invoice',
      accountTitle: 'Markety Studio Global Billing',
      accountNumber: 'USD-MERCHANT-INVOICE',
      instructions:
        'Pay via the issued international invoice link and enter your confirmation reference for verification.',
    },
  },
};

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [selectedCategory, setSelectedCategory] = useState<WebsiteCategory | 'All'>('All');
  const [marketplaceSearch, setMarketplaceSearch] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('PKR');

  const [products, setProducts] = useState<WebsiteProduct[]>([]);
  const [settings, setSettings] = useState<PlatformSettings>(FALLBACK_SETTINGS);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(() =>
    localStorage.getItem('markety_auth_token')
  );
  const [loadingBootstrap, setLoadingBootstrap] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState<WebsiteProduct | null>(null);
  const [checkoutTier, setCheckoutTier] = useState<PackageTierKey>('starter');
  const [liveDemoProduct, setLiveDemoProduct] = useState<WebsiteProduct | null>(null);
  const [prefilledInquirySubject, setPrefilledInquirySubject] = useState('');
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [quickSearchInput, setQuickSearchInput] = useState('');

  const fetchBootstrap = useCallback(async (tokenOverride?: string | null) => {
    const tokenToUse = tokenOverride !== undefined ? tokenOverride : authToken;
    try {
      const res = await fetch('/api/bootstrap', {
        headers: tokenToUse ? { Authorization: `Bearer ${tokenToUse}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        if (data.products) setProducts(data.products);
        if (data.settings) setSettings(data.settings);
        setUser(data.user || null);

        // Check if URL has ?demo=<slug> for direct new-tab live demo links
        const params = new URLSearchParams(window.location.search);
        const demoSlug = params.get('demo');
        if (demoSlug && data.products) {
          const foundDemo = (data.products as WebsiteProduct[]).find(
            (p) => p.slug === demoSlug
          );
          if (foundDemo) {
            setLiveDemoProduct(foundDemo);
          }
        }
      }
    } catch (err) {
      console.error('Bootstrap error:', err);
    } finally {
      setLoadingBootstrap(false);
    }
  }, [authToken]);

  useEffect(() => {
    fetchBootstrap();
  }, [fetchBootstrap]);

  // Dynamic SEO Title, Meta Description & Canonical URL per page
  useEffect(() => {
    let pageTitle = `${settings.brandName} — Premium Website Marketplace`;
    let pageDesc =
      'Discover and purchase ready-made websites, ecommerce stores, business platforms, portfolios, and AI web applications for teams in Pakistan and worldwide.';

    if (liveDemoProduct) {
      pageTitle = `Live Demo: ${liveDemoProduct.title} | ${settings.brandName}`;
      pageDesc = liveDemoProduct.shortDescription;
    } else if (activePage === 'marketplace') {
      pageTitle =
        selectedCategory === 'All'
          ? `Explore Ready-Made Websites | ${settings.brandName}`
          : `${selectedCategory} | ${settings.brandName}`;
    } else if (activePage === 'detail' && selectedProduct) {
      pageTitle = `${selectedProduct.title} — ${selectedProduct.category} | ${settings.brandName}`;
      pageDesc = selectedProduct.shortDescription;
    } else if (activePage === 'checkout' && selectedProduct) {
      pageTitle = `Secure Checkout: ${selectedProduct.title} | ${settings.brandName}`;
    } else if (activePage === 'customer-dashboard' || activePage === 'auth') {
      pageTitle = `Customer Account & Orders | ${settings.brandName}`;
    } else if (activePage === 'admin-panel') {
      pageTitle = `Admin Panel | ${settings.brandName}`;
    } else if (activePage === 'how-it-works') {
      pageTitle = `How It Works — Verified Website Delivery | ${settings.brandName}`;
    } else if (activePage === 'about') {
      pageTitle = `About & Licensing Policies | ${settings.brandName}`;
    } else if (activePage === 'contact') {
      pageTitle = `Contact & Custom Website Requests | ${settings.brandName}`;
    }

    document.title = pageTitle;
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) descMeta.setAttribute('content', pageDesc);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.origin + window.location.pathname;
  }, [activePage, selectedCategory, selectedProduct, liveDemoProduct, settings.brandName]);

  const handleNavigate = (page: ActivePage, category?: WebsiteCategory | 'All') => {
    if (category) {
      setSelectedCategory(category);
    }
    setLiveDemoProduct(null);
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewDetails = (product: WebsiteProduct) => {
    setSelectedProduct(product);
    setLiveDemoProduct(null);
    setActivePage('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBuyWebsite = (product: WebsiteProduct, tier: PackageTierKey = 'starter') => {
    setSelectedProduct(product);
    setCheckoutTier(tier);
    setLiveDemoProduct(null);
    setActivePage('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLiveDemo = (product: WebsiteProduct) => {
    // If the listing has an external http/https URL, open in a new tab as required
    if (
      product.liveDemoUrl &&
      (product.liveDemoUrl.startsWith('http://') || product.liveDemoUrl.startsWith('https://'))
    ) {
      window.open(product.liveDemoUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    setLiveDemoProduct(product);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (token: string, loggedInUser: UserProfile) => {
    localStorage.setItem('markety_auth_token', token);
    setAuthToken(token);
    setUser(loggedInUser);
    fetchBootstrap(token);
  };

  const handleLogout = () => {
    localStorage.removeItem('markety_auth_token');
    setAuthToken(null);
    setUser(null);
    fetchBootstrap(null);
  };

  const handleQuickRoleSwitch = async (
    target: 'customer_pk' | 'customer_intl' | 'admin' | 'logout'
  ) => {
    if (target === 'logout') {
      handleLogout();
      return;
    }
    try {
      const res = await fetch('/api/auth/sandbox-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRole: target }),
      });
      if (res.ok) {
        const data = await res.json();
        handleLoginSuccess(data.token, data.user);
        if (target === 'customer_intl') setCurrency('USD');
        if (target === 'customer_pk') setCurrency('PKR');
      }
    } catch (err) {
      console.error('Role switch error:', err);
    }
  };

  // If currently inspecting a Live Demo
  if (liveDemoProduct) {
    return (
      <LiveDemoView
        product={liveDemoProduct}
        currency={currency}
        onCloseDemo={() => {
          setLiveDemoProduct(null);
          if (window.location.search.includes('demo=')) {
            window.history.replaceState({}, '', window.location.pathname);
          }
        }}
        onBuyFromDemo={(p) => handleBuyWebsite(p, 'starter')}
        onInspectDetails={(p) => handleViewDetails(p)}
      />
    );
  }

  const cleanWhatsapp = settings.whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <div className="min-h-screen bg-[#090A0F] text-[#F8FAFC] flex flex-col">
      <Navbar
        activePage={activePage}
        onNavigate={handleNavigate}
        onOpenSearch={() => setSearchModalOpen(true)}
        currency={currency}
        onCurrencyChange={setCurrency}
        user={user}
        onQuickRoleSwitch={handleQuickRoleSwitch}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {loadingBootstrap ? (
          <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
            <div className="h-10 w-72 bg-slate-900 rounded-xl animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="aspect-[4/3] rounded-2xl bg-[#11141F] border border-slate-800 animate-pulse"
                />
              ))}
            </div>
          </div>
        ) : (
          <>
            {activePage === 'home' && (
              <HomePage
                products={products}
                currency={currency}
                settings={settings}
                onNavigate={handleNavigate}
                onViewDetails={handleViewDetails}
                onBuyWebsite={(p) => handleBuyWebsite(p, 'starter')}
                onLiveDemo={handleOpenLiveDemo}
              />
            )}

            {activePage === 'marketplace' && (
              <MarketplacePage
                products={products}
                currency={currency}
                initialCategory={selectedCategory}
                initialSearch={marketplaceSearch}
                onViewDetails={handleViewDetails}
                onBuyWebsite={(p) => handleBuyWebsite(p, 'starter')}
                onLiveDemo={handleOpenLiveDemo}
              />
            )}

            {activePage === 'detail' && selectedProduct && (
              <ProductDetailPage
                product={
                  products.find((p) => p.id === selectedProduct.id) || selectedProduct
                }
                allProducts={products}
                currency={currency}
                onBack={() => handleNavigate('marketplace')}
                onProceedToCheckout={(prod, tier) => handleBuyWebsite(prod, tier)}
                onLiveDemo={handleOpenLiveDemo}
                onViewDetails={handleViewDetails}
                onAskQuestion={(title) => {
                  setPrefilledInquirySubject(title);
                  handleNavigate('contact');
                }}
              />
            )}

            {activePage === 'checkout' && selectedProduct && (
              <CheckoutPage
                product={
                  products.find((p) => p.id === selectedProduct.id) || selectedProduct
                }
                initialTier={checkoutTier}
                currency={currency}
                settings={settings}
                user={user}
                authToken={authToken}
                onBackToProduct={() => setActivePage('detail')}
                onRequireAuth={() => setActivePage('auth')}
                onOrderCreated={() => fetchBootstrap()}
                onGoToCustomerDashboard={() => setActivePage('customer-dashboard')}
              />
            )}

            {(activePage === 'customer-dashboard' || activePage === 'auth') && (
              <CustomerDashboard
                user={user}
                authToken={authToken}
                settings={settings}
                onLoginSuccess={handleLoginSuccess}
                onLogout={handleLogout}
                onQuickRoleSwitch={handleQuickRoleSwitch}
                onBrowseMarketplace={() => handleNavigate('marketplace', 'All')}
              />
            )}

            {activePage === 'admin-panel' && (
              <AdminDashboard
                user={user}
                authToken={authToken}
                onLoginSuccess={handleLoginSuccess}
                onQuickRoleSwitch={handleQuickRoleSwitch}
                onRefreshBootstrap={() => fetchBootstrap()}
              />
            )}

            {(activePage === 'how-it-works' ||
              activePage === 'about' ||
              activePage === 'contact' ||
              activePage === 'architecture') && (
              <ContactAndPolicies
                mode={activePage}
                settings={settings}
                user={user}
                authToken={authToken}
                prefilledSubject={prefilledInquirySubject}
                onNavigate={handleNavigate}
              />
            )}
          </>
        )}
      </main>

      <Footer settings={settings} onNavigate={handleNavigate} />

      {/* Global Search Command Modal */}
      {searchModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-20 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Search websites"
        >
          <div className="w-full max-w-xl bg-[#11141F] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setMarketplaceSearch(quickSearchInput);
                setSelectedCategory('All');
                setSearchModalOpen(false);
                setActivePage('marketplace');
              }}
              className="flex items-center px-4 py-3.5 border-b border-slate-800 gap-3"
            >
              <Search className="w-4 h-4 text-blue-400 shrink-0" />
              <input
                type="search"
                autoFocus
                value={quickSearchInput}
                onChange={(e) => setQuickSearchInput(e.target.value)}
                placeholder="Search websites by title, category, or stack (React, Ecommerce, AI)..."
                className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSearchModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </form>

            <div className="p-3 max-h-80 overflow-y-auto space-y-1">
              {products
                .filter((p) => {
                  const q = quickSearchInput.trim().toLowerCase();
                  if (!q) return true;
                  return (
                    p.title.toLowerCase().includes(q) ||
                    p.category.toLowerCase().includes(q) ||
                    p.shortDescription.toLowerCase().includes(q)
                  );
                })
                .slice(0, 5)
                .map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSearchModalOpen(false);
                      handleViewDetails(p);
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-slate-800/70 flex items-center justify-between gap-3 text-left transition-colors"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{p.title}</div>
                      <div className="text-[11px] text-slate-400">{p.category}</div>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono text-blue-400">
                      <span>
                        {currency === 'PKR'
                          ? `PKR ${p.pricePKR.toLocaleString()}`
                          : `USD $${p.priceUSD}`}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating WhatsApp Direct Conversion Button */}
      <a
        href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
          'Hello Markety Studio, I would like to inquire about purchasing or customizing a website.'
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xl transition-transform hover:scale-105"
        aria-label="Contact Markety Studio on WhatsApp"
      >
        <MessageCircle className="w-4 h-4" />
        <span className="hidden sm:inline">WhatsApp Sales</span>
      </a>
    </div>
  );
}

