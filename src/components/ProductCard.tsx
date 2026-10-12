import React, { useState } from 'react';
import { ExternalLink, Eye, ShoppingBag, MonitorSmartphone } from 'lucide-react';
import { WebsiteProduct, CurrencyCode } from '../types';

interface ProductCardProps {
  product: WebsiteProduct;
  currency: CurrencyCode;
  onViewDetails: (product: WebsiteProduct) => void;
  onBuyWebsite: (product: WebsiteProduct) => void;
  onLiveDemo: (product: WebsiteProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currency,
  onViewDetails,
  onBuyWebsite,
  onLiveDemo,
}) => {
  const [imgError, setImgError] = useState(false);

  const rawPrice = currency === 'PKR' ? product.pricePKR : product.priceUSD;
  const discountedPrice =
    product.discountPercentage > 0
      ? Math.round(rawPrice * ((100 - product.discountPercentage) / 100))
      : rawPrice;

  const formattedPrice =
    currency === 'PKR'
      ? `PKR ${discountedPrice.toLocaleString()}`
      : `USD $${discountedPrice.toLocaleString()}`;

  const formattedOriginalPrice =
    currency === 'PKR'
      ? `PKR ${rawPrice.toLocaleString()}`
      : `USD $${rawPrice.toLocaleString()}`;

  return (
    <article className="group bg-[#11141F] border border-slate-800/90 hover:border-slate-700 rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 shadow-lg">
      {/* Thumbnail Preview Container (4:3) with Zero-Broken-Image Fallback */}
      <div className="relative aspect-[4/3] bg-[#0B0D14] overflow-hidden border-b border-slate-800/80">
        {!imgError ? (
          <img
            src={product.thumbnailUrl}
            alt={`${product.title} screenshot`}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#111524] to-[#0B0D14] text-center">
            <MonitorSmartphone className="w-10 h-10 text-blue-400 mb-2" />
            <span className="font-display text-sm font-semibold text-white">
              {product.title}
            </span>
            <span className="text-xs text-slate-400 mt-1">{product.category}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#090A0F]/85 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Quick Live Demo Action on Image Hover */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onLiveDemo(product)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0B0D14]/90 hover:bg-blue-600 border border-slate-700/80 rounded-lg backdrop-blur-sm transition-colors whitespace-nowrap"
          >
            <span>Live Demo</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Clean Unboxed Metadata Line (Zero-Pill Discipline) */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
            <span className="text-blue-400 font-medium">{product.category}</span>
            <span aria-hidden="true">·</span>
            <span>{product.sourceCodeIncluded ? 'Source Code Included' : 'Compiled Build'}</span>
            {product.isSample && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-amber-300/90">Sample Demo</span>
              </>
            )}
          </div>

          <h3 className="font-display text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
            <button
              type="button"
              onClick={() => onViewDetails(product)}
              className="text-left focus:outline-none focus-visible:underline"
            >
              {product.title}
            </button>
          </h3>

          <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>
        </div>

        <div className="space-y-4 pt-2 border-t border-slate-800/80">
          {/* Tech Stack & Responsive Info */}
          <div className="space-y-1 text-xs text-slate-400">
            <div className="truncate">
              <span className="text-slate-500">Stack: </span>
              <span className="text-slate-300">{product.technologies.join(' · ')}</span>
            </div>
            <div className="truncate">
              <span className="text-slate-500">Layout: </span>
              <span className="text-slate-300">Responsive (Mobile, Tablet, Desktop)</span>
            </div>
          </div>

          {/* Price Row */}
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <span className="text-[11px] text-slate-400 block">Starting Package</span>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-lg font-bold text-white tabular-nums">
                  {formattedPrice}
                </span>
                {product.discountPercentage > 0 && (
                  <span className="font-mono text-xs text-slate-500 line-through tabular-nums">
                    {formattedOriginalPrice}
                  </span>
                )}
              </div>
            </div>
            <span className="text-[11px] font-mono text-slate-400 tabular-nums">
              Base: {product.originalCurrency}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={() => onLiveDemo(product)}
              className="inline-flex items-center justify-center gap-1 px-2.5 py-2 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors whitespace-nowrap"
            >
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Live Demo</span>
            </button>

            <button
              type="button"
              onClick={() => onViewDetails(product)}
              className="inline-flex items-center justify-center gap-1 px-2.5 py-2 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors whitespace-nowrap"
            >
              <Eye className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>View Details</span>
            </button>

            <button
              type="button"
              onClick={() => onBuyWebsite(product)}
              className="inline-flex items-center justify-center gap-1 px-2.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap"
            >
              <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
              <span>Buy Website</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
