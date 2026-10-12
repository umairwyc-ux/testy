import React, { useState, useEffect } from 'react';
import {
  Search,
  User,
  ShieldCheck,
  Menu,
  X,
  ChevronDown,
  ArrowUpRight,
} from 'lucide-react';
import { MarketyLogo } from './Logo';
import { CurrencyCode, UserProfile, WEBSITE_CATEGORIES, WebsiteCategory } from '../types';

export type ActivePage =
  | 'home'
  | 'marketplace'
  | 'detail'
  | 'checkout'
  | 'how-it-works'
  | 'about'
  | 'contact'
  | 'customer-dashboard'
  | 'admin-panel'
  | 'auth'
  | 'architecture';

interface NavbarProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage, category?: WebsiteCategory | 'All') => void;
  onOpenSearch: () => void;
  currency: CurrencyCode;
  onCurrencyChange: (c: CurrencyCode) => void;
  user: UserProfile | null;
  onQuickRoleSwitch: (target: 'customer_pk' | 'customer_intl' | 'admin' | 'logout') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  onNavigate,
  onOpenSearch,
  currency,
  onCurrencyChange,
  user,
  onQuickRoleSwitch,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (page: ActivePage, category?: WebsiteCategory | 'All') => {
    onNavigate(page, category);
    setMobileMenuOpen(false);
    setCategoriesDropdownOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-200 ${
        scrolled
          ? 'bg-[#090A0F]/90 backdrop-blur-md border-b border-slate-800/80'
          : 'bg-[#090A0F] border-b border-slate-900'
      }`}
    >
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg whitespace-nowrap shrink-0"
        >
          <MarketyLogo className="w-8 h-8 transition-transform duration-200 group-hover:scale-105" />
          <span className="font-display text-lg font-bold tracking-tight text-white">
            Markety Studio
          </span>
        </button>

        {/* Zone 2: Primary Navigation Links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300"
        >
          <button
            type="button"
            onClick={() => handleNavClick('home')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 ${
              activePage === 'home'
                ? 'text-white border-b-2 border-blue-500'
                : 'hover:text-white'
            }`}
          >
            Home
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('marketplace', 'All')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 ${
              activePage === 'marketplace'
                ? 'text-white border-b-2 border-blue-500'
                : 'hover:text-white'
            }`}
          >
            Explore Websites
          </button>

          {/* Categories Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setCategoriesDropdownOpen(true)}
            onMouseLeave={() => setCategoriesDropdownOpen(false)}
          >
            <button
              type="button"
              onClick={() => setCategoriesDropdownOpen((v) => !v)}
              className="flex items-center gap-1 py-1 hover:text-white transition-colors whitespace-nowrap shrink-0"
              aria-expanded={categoriesDropdownOpen}
            >
              <span>Categories</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {categoriesDropdownOpen && (
              <div className="absolute left-0 top-full pt-2 w-64 z-50">
                <div className="bg-[#11131C] border border-slate-800 rounded-xl shadow-2xl p-2 grid grid-cols-1 gap-0.5">
                  <button
                    type="button"
                    onClick={() => handleNavClick('marketplace', 'All')}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-blue-400 hover:bg-slate-800/60 rounded-lg transition-colors"
                  >
                    All Website Categories
                  </button>
                  {WEBSITE_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleNavClick('marketplace', cat)}
                      className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleNavClick('how-it-works')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 ${
              activePage === 'how-it-works'
                ? 'text-white border-b-2 border-blue-500'
                : 'hover:text-white'
            }`}
          >
            How It Works
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('about')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 ${
              activePage === 'about'
                ? 'text-white border-b-2 border-blue-500'
                : 'hover:text-white'
            }`}
          >
            About
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('contact')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 ${
              activePage === 'contact'
                ? 'text-white border-b-2 border-blue-500'
                : 'hover:text-white'
            }`}
          >
            Contact
          </button>
        </nav>

        {/* Zone 3: Search, Currency, Account, Admin Panel & Primary CTA */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Currency Switcher (PKR / USD) */}
          <div
            className="hidden sm:flex items-center bg-[#121520] border border-slate-800 rounded-lg p-0.5 text-xs font-mono"
            role="group"
            aria-label="Currency selector"
          >
            <button
              type="button"
              onClick={() => onCurrencyChange('PKR')}
              className={`px-2 py-1 rounded-md transition-colors whitespace-nowrap ${
                currency === 'PKR'
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              PKR
            </button>
            <button
              type="button"
              onClick={() => onCurrencyChange('USD')}
              className={`px-2 py-1 rounded-md transition-colors whitespace-nowrap ${
                currency === 'USD'
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              USD
            </button>
          </div>

          {/* Search Icon */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Search websites"
            title="Search websites"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Customer Account Icon */}
          <button
            type="button"
            onClick={() =>
              handleNavClick(user ? 'customer-dashboard' : 'auth')
            }
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
              activePage === 'customer-dashboard' || activePage === 'auth'
                ? 'bg-slate-800 text-white border-slate-700'
                : 'text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
            }`}
            aria-label="Customer Account"
          >
            <User className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden xl:inline">
              {user ? user.name.split(' ')[0] : 'Account'}
            </span>
          </button>

          {/* Clearly Labelled Admin Panel Entry */}
          <button
            type="button"
            onClick={() => handleNavClick('admin-panel')}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
              activePage === 'admin-panel'
                ? 'bg-blue-950/80 text-blue-200 border-blue-500/50'
                : 'text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Admin Panel</span>
          </button>

          {/* Prominent Explore Websites CTA */}
          <button
            type="button"
            onClick={() => handleNavClick('marketplace', 'All')}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <span>Explore Websites</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          {/* Mobile Hamburger Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg border border-slate-800"
            aria-label="Toggle Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0D1017] border-b border-slate-800 px-4 pt-3 pb-6 space-y-4">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
            <span className="text-xs text-slate-400">Display Currency</span>
            <div className="flex items-center bg-[#141824] border border-slate-800 rounded-lg p-0.5 text-xs font-mono">
              <button
                type="button"
                onClick={() => onCurrencyChange('PKR')}
                className={`px-3 py-1 rounded-md ${
                  currency === 'PKR' ? 'bg-blue-600 text-white' : 'text-slate-400'
                }`}
              >
                PKR (Rs)
              </button>
              <button
                type="button"
                onClick={() => onCurrencyChange('USD')}
                className={`px-3 py-1 rounded-md ${
                  currency === 'USD' ? 'bg-blue-600 text-white' : 'text-slate-400'
                }`}
              >
                USD ($)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleNavClick('home')}
              className="text-left px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800/60 rounded-lg"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('marketplace', 'All')}
              className="text-left px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800/60 rounded-lg"
            >
              Explore Websites
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('how-it-works')}
              className="text-left px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800/60 rounded-lg"
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('about')}
              className="text-left px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800/60 rounded-lg"
            >
              About
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('contact')}
              className="text-left px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800/60 rounded-lg"
            >
              Contact & Custom Quote
            </button>
            <button
              type="button"
              onClick={() => handleNavClick(user ? 'customer-dashboard' : 'auth')}
              className="text-left px-3 py-2 text-sm font-medium text-blue-400 hover:bg-slate-800/60 rounded-lg"
            >
              {user ? `Account (${user.name.split(' ')[0]})` : 'Customer Sign In'}
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('admin-panel')}
              className="text-left px-3 py-2 text-sm font-medium text-cyan-400 hover:bg-slate-800/60 rounded-lg"
            >
              Admin Panel
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800/80">
            <p className="text-xs text-slate-400 mb-2">Browse by Category</p>
            <div className="flex flex-wrap gap-1.5">
              {WEBSITE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleNavClick('marketplace', cat)}
                  className="px-2.5 py-1 text-xs text-slate-300 bg-slate-900 border border-slate-800 rounded-md hover:text-white"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Role Testing Switcher on Mobile */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400">Test Session:</span>
            <button
              type="button"
              onClick={() => onQuickRoleSwitch('customer_pk')}
              className="px-2 py-1 bg-slate-800 text-slate-200 rounded"
            >
              Customer (PKR)
            </button>
            <button
              type="button"
              onClick={() => onQuickRoleSwitch('admin')}
              className="px-2 py-1 bg-slate-800 text-cyan-300 rounded"
            >
              Admin Role
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
