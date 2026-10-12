import React, { useState } from 'react';
import {
  ArrowLeft,
  ExternalLink,
  Check,
  Server,
  Globe,
  Sliders,
  Package,
  Clock,
  MessageSquare,
  ShoppingBag,
  FileArchive,
  HelpCircle,
} from 'lucide-react';
import {
  WebsiteProduct,
  CurrencyCode,
  PackageTierKey,
} from '../types';
import { ProductCard } from '../components/ProductCard';

interface ProductDetailPageProps {
  product: WebsiteProduct;
  allProducts: WebsiteProduct[];
  currency: CurrencyCode;
  onBack: () => void;
  onProceedToCheckout: (product: WebsiteProduct, tier: PackageTierKey) => void;
  onLiveDemo: (product: WebsiteProduct) => void;
  onViewDetails: (product: WebsiteProduct) => void;
  onAskQuestion: (productTitle: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  allProducts,
  currency,
  onBack,
  onProceedToCheckout,
  onLiveDemo,
  onViewDetails,
  onAskQuestion,
}) => {
  const availableTiers = (['starter', 'professional', 'custom'] as PackageTierKey[]).filter(
    (t) => product.packages[t]?.enabled
  );

  const [selectedTier, setSelectedTier] = useState<PackageTierKey>(
    availableTiers[0] || 'starter'
  );
  const [activeImage, setActiveImage] = useState(product.thumbnailUrl);

  React.useEffect(() => {
    setActiveImage(product.thumbnailUrl);
    const enabled = (['starter', 'professional', 'custom'] as PackageTierKey[]).filter(
      (t) => product.packages[t]?.enabled
    );
    setSelectedTier(enabled[0] || 'starter');
  }, [product]);

  const currentPkg = product.packages[selectedTier] || product.packages.starter;
  const rawPkgPrice = currency === 'PKR' ? currentPkg.pricePKR : currentPkg.priceUSD;
  const finalPkgPrice =
    product.discountPercentage > 0
      ? Math.round(rawPkgPrice * ((100 - product.discountPercentage) / 100))
      : rawPkgPrice;

  const formattedPkgPrice =
    currency === 'PKR'
      ? `PKR ${finalPkgPrice.toLocaleString()}`
      : `USD $${finalPkgPrice.toLocaleString()}`;

  const gallery =
    product.galleryUrls && product.galleryUrls.length > 0
      ? product.galleryUrls
      : [product.thumbnailUrl];

  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && p.published)
    .slice(0, 3);

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Top Breadcrumb Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Website Marketplace</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{product.category}</span>
          <span aria-hidden="true">·</span>
          <span>{product.sourceCodeIncluded ? 'Source Code Included' : 'Compiled Delivery'}</span>
          {product.isSample && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-amber-300">Sample / Demo Listing</span>
            </>
          )}
        </div>
      </div>

      {/* Main Split Grid: Left Gallery & Technical Specs | Right Contiguous Purchase Module */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column (7 cols): Preview Gallery & Full Technical Specifications */}
        <div className="lg:col-span-7 space-y-10">
          {/* Preview Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-[4/3] rounded-2xl bg-[#11141F] border border-slate-800 overflow-hidden shadow-2xl">
              <img
                src={activeImage}
                alt={product.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute bottom-4 right-4 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => onLiveDemo(product)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg transition-colors"
                >
                  <span>Launch Interactive Live Demo</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Gallery Thumbnails + Actual Demo URL */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
              {gallery.length > 1 && (
                <div className="flex items-center gap-2">
                  {gallery.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImage(imgUrl)}
                      className={`w-20 aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${
                        activeImage === imgUrl
                          ? 'border-blue-500 opacity-100'
                          : 'border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`${product.title} preview ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              <div className="text-xs font-mono text-slate-400">
                Live Demo Route:{' '}
                <button
                  type="button"
                  onClick={() => onLiveDemo(product)}
                  className="text-blue-400 hover:underline"
                >
                  {product.liveDemoUrl}
                </button>
              </div>
            </div>
          </div>

          {/* Full Overview & Description */}
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold text-white">
              Project Overview & Architecture
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {product.fullDescription}
            </p>
            {product.isSample && (
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200/90 leading-relaxed">
                <strong>Sample Demonstration Notice:</strong> This listing uses editable sample
                pricing and demonstration preview assets. Hosting, domain registration, and external
                third-party API subscriptions are not included unless explicitly specified in an
                agreed custom scope.
              </div>
            )}
          </div>

          {/* Included Features */}
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold text-white">
              Included Website Features
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {product.features.map((feature, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-[#11141F] border border-slate-800/90 flex items-start gap-3"
                >
                  <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Requirements Matrix */}
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold text-white">
              Technical Specifications & Deployment Requirements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-[#11141F] border border-slate-800/90 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
                  <Server className="w-4 h-4" />
                  <span>Backend & Database Requirements</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {product.backendRequirements}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#11141F] border border-slate-800/90 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
                  <Globe className="w-4 h-4" />
                  <span>Hosting & Deployment Requirements</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {product.hostingRequirements}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#11141F] border border-slate-800/90 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
                  <Sliders className="w-4 h-4" />
                  <span>Customization Options</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {product.customizationOptions}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#11141F] border border-slate-800/90 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
                  <Clock className="w-4 h-4" />
                  <span>Delivery Format & Estimated Time</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {product.deliveryFormat} · {product.estimatedDeliveryTime}
                </p>
              </div>
            </div>
          </div>

          {/* Deliverables Manifest */}
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold text-white">
              Attached Deliverables (Unlocked After Payment Verification)
            </h2>
            <div className="space-y-2.5">
              {product.deliverables.map((del) => (
                <div
                  key={del.id}
                  className="p-4 rounded-xl bg-[#11141F] border border-slate-800 flex items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <FileArchive className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-white">{del.title}</div>
                      <div className="text-[11px] text-slate-400">{del.description}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 font-mono text-[11px] text-slate-400">
                    <div>{del.fileName}</div>
                    <div>
                      {del.fileSize} · Min: {del.minPackage.toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Product-Specific FAQs */}
          {product.faqs && product.faqs.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-400" />
                <span>Frequently Asked Questions</span>
              </h2>
              <div className="space-y-3">
                {product.faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-[#11141F] border border-slate-800 space-y-1.5"
                  >
                    <h3 className="text-sm font-semibold text-white">{faq.question}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Sticky Contiguous Purchase & Package Configuration Module */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
          <div className="p-6 sm:p-7 rounded-3xl bg-[#11141F] border border-slate-800/90 shadow-2xl space-y-6">
            <div className="space-y-2 border-b border-slate-800 pb-5">
              <div className="text-xs font-mono text-blue-400">
                {product.category} · Base Currency: {product.originalCurrency}
              </div>
              <h1 className="font-display text-2xl font-bold text-white">
                {product.title}
              </h1>
              <div className="text-xs text-slate-400">
                Technologies: <span className="text-slate-200">{product.technologies.join(' · ')}</span>
              </div>
              <div className="text-xs text-slate-400">
                Responsive Coverage: <span className="text-slate-200">{product.responsiveDesign}</span>
              </div>
            </div>

            {/* Configurable Package Tier Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                Select Package Tier
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['starter', 'professional', 'custom'] as PackageTierKey[]).map((tierKey) => {
                  const pkg = product.packages[tierKey];
                  if (!pkg || !pkg.enabled) return null;
                  const active = selectedTier === tierKey;
                  const pVal = currency === 'PKR' ? pkg.pricePKR : pkg.priceUSD;

                  return (
                    <button
                      key={tierKey}
                      type="button"
                      onClick={() => setSelectedTier(tierKey)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        active
                          ? 'bg-blue-950/50 border-blue-500 text-white'
                          : 'bg-[#0C0F18] border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-xs font-bold capitalize">{tierKey}</div>
                      <div className="font-mono text-xs font-semibold text-blue-400 mt-1 tabular-nums">
                        {currency === 'PKR'
                          ? `Rs ${(pVal / 1000).toFixed(0)}k`
                          : `$${pVal}`}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Package Details */}
            <div className="p-4 rounded-2xl bg-[#0C0E17] border border-slate-800/80 space-y-3">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-display text-sm font-bold text-white">
                  {currentPkg.name}
                </span>
                <span className="font-mono text-xl font-bold text-white tabular-nums">
                  {formattedPkgPrice}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{currentPkg.summary}</p>
              <div className="text-[11px] font-mono text-cyan-400">
                Estimated Delivery: {currentPkg.deliveryTime}
              </div>

              <ul className="space-y-2 pt-2 border-t border-slate-800/80">
                {currentPkg.includedItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Primary Checkout & Live Demo CTAs */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => onProceedToCheckout(product, selectedTier)}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-600/20 transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  Buy Website ({currentPkg.name} · {formattedPkgPrice})
                </span>
              </button>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => onLiveDemo(product)}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Open Live Demo</span>
                </button>

                <button
                  type="button"
                  onClick={() => onAskQuestion(product.title)}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                  <span>Ask a Question</span>
                </button>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800 pt-4">
              <Package className="w-3.5 h-3.5 text-blue-400 inline mr-1" />
              Orders are created with a unique reference number. Download links unlock in your
              Customer Dashboard once payment is verified by an administrator.
            </div>
          </div>
        </div>
      </div>

      {/* Related Websites */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-10 border-t border-slate-800/80">
          <h2 className="font-display text-2xl font-bold text-white">
            Related Website Listings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard
                key={rel.id}
                product={rel}
                currency={currency}
                onViewDetails={onViewDetails}
                onBuyWebsite={(p) => onProceedToCheckout(p, 'starter')}
                onLiveDemo={onLiveDemo}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
