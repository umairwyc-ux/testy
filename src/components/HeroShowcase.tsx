import React, { useState } from 'react';
import { ExternalLink, Eye, Layers, Code2, Smartphone } from 'lucide-react';
import { WebsiteProduct, CurrencyCode } from '../types';

interface HeroShowcaseProps {
  products: WebsiteProduct[];
  currency: CurrencyCode;
  onSelectProduct: (product: WebsiteProduct) => void;
  onOpenLiveDemo: (product: WebsiteProduct) => void;
}

export const HeroShowcase: React.FC<HeroShowcaseProps> = ({
  products,
  currency,
  onSelectProduct,
  onOpenLiveDemo,
}) => {
  const showcaseItems = products.slice(0, 4);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeProduct = showcaseItems[activeIndex] || products[0];

  if (!activeProduct) return null;

  const formattedPrice =
    currency === 'PKR'
      ? `PKR ${activeProduct.pricePKR.toLocaleString()}`
      : `USD $${activeProduct.priceUSD.toLocaleString()}`;

  return (
    <div className="relative w-full">
      {/* Subtle Ambient Electric Blue & Cyan Backlight */}
      <div
        className="pointer-events-none absolute -inset-4 rounded-3xl opacity-45 blur-3xl transition-opacity duration-500"
        style={{
          background:
            'radial-gradient(circle at 65% 30%, rgba(37, 99, 235, 0.35), rgba(6, 182, 212, 0.15) 55%, transparent 80%)',
        }}
        aria-hidden="true"
      />

      {/* Primary Layered Browser Showcase Frame */}
      <div className="relative rounded-2xl bg-[#11141F] border border-slate-800/90 shadow-2xl overflow-hidden">
        {/* Browser Chrome Top Bar */}
        <div className="flex items-center justify-between gap-4 px-4 py-3 bg-[#0C0E16] border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
          </div>

          <div className="flex-1 max-w-md mx-auto px-3 py-1 rounded-md bg-[#141826] border border-slate-800/80 text-[11px] font-mono text-slate-400 truncate text-center">
            marketystudio.com/preview/{activeProduct.slug}
          </div>

          <button
            type="button"
            onClick={() => onOpenLiveDemo(activeProduct)}
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors whitespace-nowrap shrink-0"
          >
            <span>Open Demo</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Main Website Preview Viewport */}
        <div className="relative aspect-[4/3] bg-[#090A0F] overflow-hidden group">
          <img
            src={activeProduct.thumbnailUrl}
            alt={`${activeProduct.title} live interface preview`}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
          />

          {/* Measured Gradient Scrim for Legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#090A0F] via-[#090A0F]/40 to-transparent" />

          {/* Bottom Interactive Overlay Bar */}
          <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-blue-300 font-medium">
                <span>{activeProduct.category}</span>
                <span aria-hidden="true">·</span>
                <span>{activeProduct.isSample ? 'Sample / Demo Project' : 'Verified Listing'}</span>
              </div>
              <h3 className="font-display text-xl font-bold text-white">
                {activeProduct.title}
              </h3>
              <p className="text-xs text-slate-300 line-clamp-1 max-w-md">
                {activeProduct.technologies.join(' · ')}
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <span className="font-mono text-sm font-semibold text-white bg-[#0C0E16]/90 border border-slate-700/80 px-3 py-2 rounded-lg tabular-nums">
                {formattedPrice}
              </span>
              <button
                type="button"
                onClick={() => onOpenLiveDemo(activeProduct)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-100 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
              >
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>Live Demo</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectProduct(activeProduct)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap"
              >
                <span>Inspect</span>
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Layer Switcher Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-800/80 bg-[#0D1018] border-t border-slate-800/80">
          {showcaseItems.map((item, idx) => {
            const isSelected = idx === activeIndex;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`p-3 text-left transition-colors ${
                  isSelected
                    ? 'bg-blue-950/30 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                <div className="text-[11px] font-mono text-blue-400 truncate">
                  0{idx + 1}. {item.category.replace(' Websites', '')}
                </div>
                <div className="text-xs font-semibold truncate mt-0.5">
                  {item.title.split('—')[0].trim()}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Floating Architecture Callout Strip */}
      <div className="mt-3 grid grid-cols-3 gap-3 text-xs text-slate-300">
        <div className="bg-[#10131D] border border-slate-800/80 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5">
          <Code2 className="w-4 h-4 text-blue-400 shrink-0" />
          <div className="truncate">
            <div className="font-medium text-white truncate">Source Code Included</div>
            <div className="text-[11px] text-slate-400 truncate">When specified in listing</div>
          </div>
        </div>
        <div className="bg-[#10131D] border border-slate-800/80 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5">
          <Smartphone className="w-4 h-4 text-cyan-400 shrink-0" />
          <div className="truncate">
            <div className="font-medium text-white truncate">Responsive Layouts</div>
            <div className="text-[11px] text-slate-400 truncate">Mobile to 4K verified</div>
          </div>
        </div>
        <div className="bg-[#10131D] border border-slate-800/80 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5">
          <Layers className="w-4 h-4 text-blue-400 shrink-0" />
          <div className="truncate">
            <div className="font-medium text-white truncate">PKR & USD Pricing</div>
            <div className="text-[11px] text-slate-400 truncate">Transparent packages</div>
          </div>
        </div>
      </div>
    </div>
  );
};
