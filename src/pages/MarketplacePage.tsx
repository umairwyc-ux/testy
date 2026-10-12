import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  ChevronDown,
  X,
} from 'lucide-react';
import {
  WebsiteProduct,
  CurrencyCode,
  WEBSITE_CATEGORIES,
  WebsiteCategory,
} from '../types';
import { ProductCard } from '../components/ProductCard';

interface MarketplacePageProps {
  products: WebsiteProduct[];
  currency: CurrencyCode;
  initialCategory?: WebsiteCategory | 'All';
  initialSearch?: string;
  onViewDetails: (product: WebsiteProduct) => void;
  onBuyWebsite: (product: WebsiteProduct) => void;
  onLiveDemo: (product: WebsiteProduct) => void;
}

export const MarketplacePage: React.FC<MarketplacePageProps> = ({
  products,
  currency,
  initialCategory = 'All',
  initialSearch = '',
  onViewDetails,
  onBuyWebsite,
  onLiveDemo,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<WebsiteCategory | 'All'>(
    initialCategory
  );
  const [priceRange, setPriceRange] = useState<'all' | 'under_40k' | '40k_80k' | 'over_80k'>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'newest' | 'price_asc' | 'price_desc'>(
    'featured'
  );
  const [onlyWithSourceCode, setOnlyWithSourceCode] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync if parent updates initialCategory
  React.useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  React.useEffect(() => {
    if (initialSearch !== undefined) {
      setSearchQuery(initialSearch);
    }
  }, [initialSearch]);

  const filteredAndSortedProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = products.filter((product) => {
      if (selectedCategory !== 'All' && product.category !== selectedCategory) {
        return false;
      }
      if (onlyWithSourceCode && !product.sourceCodeIncluded) {
        return false;
      }
      if (priceRange === 'under_40k' && product.pricePKR >= 40000) {
        return false;
      }
      if (priceRange === '40k_80k' && (product.pricePKR < 40000 || product.pricePKR > 80000)) {
        return false;
      }
      if (priceRange === 'over_80k' && product.pricePKR <= 80000) {
        return false;
      }
      if (q) {
        const haystack = [
          product.title,
          product.category,
          product.shortDescription,
          product.fullDescription,
          ...product.technologies,
          ...product.features,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'featured') {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'price_asc') {
        return a.pricePKR - b.pricePKR;
      }
      if (sortBy === 'price_desc') {
        return b.pricePKR - a.pricePKR;
      }
      return 0;
    });
  }, [products, searchQuery, selectedCategory, priceRange, sortBy, onlyWithSourceCode]);

  const visibleProducts = filteredAndSortedProducts.slice(0, visibleCount);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setPriceRange('all');
    setSortBy('featured');
    setOnlyWithSourceCode(false);
    setVisibleCount(6);
  };

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="space-y-3 border-b border-slate-800/80 pb-6">
        <div className="text-xs font-mono text-blue-400">
          Markety Studio · Website Marketplace
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
          Explore Ready-Made Websites & Web Applications
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl">
          Filter by industry category, technology stack, or budget. Preview the live demo or inspect
          the full package breakdown before ordering.
        </p>
      </div>

      {/* Search & Controls Toolbar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Live Search Input */}
        <div className="lg:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, React, e-commerce, SaaS, portfolio..."
            className="w-full pl-10 pr-9 py-2.5 text-sm bg-[#11141F] border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            aria-label="Search websites"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Desktop Filter Controls */}
        <div className="lg:col-span-7 flex flex-wrap items-center justify-between lg:justify-end gap-3">
          {/* Price Range Filter */}
          <div className="relative">
            <select
              value={priceRange}
              onChange={(e) =>
                setPriceRange(
                  e.target.value as 'all' | 'under_40k' | '40k_80k' | 'over_80k'
                )
              }
              aria-label="Filter by price range"
              className="appearance-none bg-[#11141F] border border-slate-800 rounded-xl pl-3.5 pr-9 py-2.5 text-xs font-medium text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Price Ranges</option>
              <option value="under_40k">
                {currency === 'PKR' ? 'Under PKR 40,000' : 'Under USD $145'}
              </option>
              <option value="40k_80k">
                {currency === 'PKR' ? 'PKR 40,000 – 80,000' : 'USD $145 – $290'}
              </option>
              <option value="over_80k">
                {currency === 'PKR' ? 'Over PKR 80,000' : 'Over USD $290'}
              </option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sort By Select */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as 'featured' | 'newest' | 'price_asc' | 'price_desc'
                )
              }
              aria-label="Sort websites by"
              className="appearance-none bg-[#11141F] border border-slate-800 rounded-xl pl-3.5 pr-9 py-2.5 text-xs font-medium text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="featured">Sort: Featured First</option>
              <option value="newest">Sort: Newest Added</option>
              <option value="price_asc">Sort: Price (Low to High)</option>
              <option value="price_desc">Sort: Price (High to Low)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Source Code Included Toggle */}
          <button
            type="button"
            onClick={() => setOnlyWithSourceCode((v) => !v)}
            className={`px-3.5 py-2.5 text-xs font-medium rounded-xl border transition-colors whitespace-nowrap ${
              onlyWithSourceCode
                ? 'bg-blue-950/70 border-blue-500 text-blue-200'
                : 'bg-[#11141F] border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Source Code Included
          </button>

          {/* Mobile Filter Drawer Trigger */}
          <button
            type="button"
            onClick={() => setMobileFiltersOpen((v) => !v)}
            className="sm:hidden inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium text-slate-200 bg-[#11141F] border border-slate-800 rounded-xl"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Categories</span>
          </button>

          {(searchQuery ||
            selectedCategory !== 'All' ||
            priceRange !== 'all' ||
            onlyWithSourceCode) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 px-3 py-2.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Bar */}
      <div
        className={`${
          mobileFiltersOpen ? 'flex' : 'hidden sm:flex'
        } flex-wrap items-center gap-1.5 pt-1`}
      >
        <button
          type="button"
          onClick={() => {
            setSelectedCategory('All');
            setVisibleCount(6);
          }}
          className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
            selectedCategory === 'All'
              ? 'bg-blue-600 text-white'
              : 'bg-[#11141F] text-slate-300 hover:text-white border border-slate-800'
          }`}
        >
          All ({products.length})
        </button>
        {WEBSITE_CATEGORIES.map((category) => {
          const count = products.filter((p) => p.category === category).length;
          return (
            <button
              key={category}
              type="button"
              onClick={() => {
                setSelectedCategory(category);
                setVisibleCount(6);
              }}
              className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#11141F] text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              {category} ({count})
            </button>
          );
        })}
      </div>

      {/* Result Count Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div>
          Showing <span className="font-mono text-white">{visibleProducts.length}</span> of{' '}
          <span className="font-mono text-white">{filteredAndSortedProducts.length}</span> matching
          websites
        </div>
        <div>
          Prices displayed in <span className="font-mono text-blue-400">{currency}</span>
        </div>
      </div>

      {/* Product Grid or Empty State */}
      {visibleProducts.length > 0 ? (
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleProducts.map((product) => (
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

          {/* Load More Pagination */}
          {visibleCount < filteredAndSortedProducts.length && (
            <div className="flex justify-center pt-4">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 6)}
                className="px-6 py-3 text-xs font-semibold text-white bg-[#121624] hover:bg-slate-800 border border-slate-700 rounded-xl transition-colors"
              >
                Load More Websites ({filteredAndSortedProducts.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="p-14 rounded-2xl bg-[#11141F] border border-slate-800 text-center space-y-4">
          <div className="font-display text-lg font-bold text-white">
            No matching website listings found
          </div>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try clearing your search query or adjusting the category and price range filters.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      )}
    </div>
  );
};
