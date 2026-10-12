import React from 'react';
import { MessageCircle, Mail, MapPin, FileCode2, ShieldCheck } from 'lucide-react';
import { MarketyLogo } from './Logo';
import { PlatformSettings, WEBSITE_CATEGORIES, WebsiteCategory } from '../types';
import { ActivePage } from './Navbar';

interface FooterProps {
  settings: PlatformSettings;
  onNavigate: (page: ActivePage, category?: WebsiteCategory | 'All') => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onNavigate }) => {
  const cleanWhatsapp = settings.whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <footer className="bg-[#07080C] border-t border-slate-800/80 text-slate-400">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Column 1: Brand & Identity */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <MarketyLogo className="w-8 h-8" />
              <span className="font-display text-lg font-bold text-white tracking-tight">
                {settings.brandName}
              </span>
            </div>
            <p className="text-sm text-slate-300 font-medium">{settings.tagline}</p>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Ready-made websites, e-commerce stores, business platforms, portfolios, and AI web
              applications engineered for founders and teams in Pakistan and worldwide.
            </p>
            <div className="pt-2 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{settings.officeLocation}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <a
                  href={`mailto:${settings.businessEmail}`}
                  className="hover:text-white transition-colors"
                >
                  {settings.businessEmail}
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Marketplace Categories */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="font-display text-sm font-semibold text-white">
              Website Categories
            </h3>
            <ul className="space-y-2 text-xs">
              {WEBSITE_CATEGORIES.slice(0, 7).map((cat) => (
                <li key={cat}>
                  <button
                    type="button"
                    onClick={() => onNavigate('marketplace', cat)}
                    className="hover:text-white transition-colors text-left"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Platform & Policies */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="font-display text-sm font-semibold text-white">
              Platform & Policies
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('how-it-works')}
                  className="hover:text-white transition-colors"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('about')}
                  className="hover:text-white transition-colors"
                >
                  About Markety Studio
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="hover:text-white transition-colors"
                >
                  Refund & Delivery Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="hover:text-white transition-colors"
                >
                  Licensing & Support Terms
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('architecture')}
                  className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <FileCode2 className="w-3.5 h-3.5" />
                  <span>Setup & Deployment Docs</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('admin-panel')}
                  className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Panel</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Direct Sales & WhatsApp Conversion */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="font-display text-sm font-semibold text-white">
              Questions or Custom Scope?
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Speak directly with our engineering team on WhatsApp or request a custom website
              specification.
            </p>
            <div className="space-y-2 pt-1">
              <a
                href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
                  'Hello Markety Studio, I am interested in purchasing or customizing a website.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp ({settings.whatsappNumber})</span>
              </a>

              <button
                type="button"
                onClick={() => onNavigate('contact')}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
              >
                <span>Request Custom Website</span>
              </button>
            </div>
            <div className="flex items-center gap-4 pt-2 text-xs text-slate-400">
              <a
                href={settings.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                LinkedIn
              </a>
              <span aria-hidden="true">·</span>
              <a
                href={settings.socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                GitHub
              </a>
              <span aria-hidden="true">·</span>
              <a
                href={settings.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                X / Twitter
              </a>
              <span aria-hidden="true">·</span>
              <a
                href={settings.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} {settings.brandName}. All rights reserved. Sample listings
            are clearly marked for demonstration.
          </div>
          <div className="font-mono">
            Exchange Reference: 1 USD = {settings.usdToPkrRate.toFixed(2)} PKR
          </div>
        </div>
      </div>
    </footer>
  );
};
