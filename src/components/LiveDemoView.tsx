import React, { useState } from 'react';
import {
  ArrowLeft,
  Monitor,
  Tablet,
  Smartphone,
  ShoppingBag,
  CheckCircle2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { WebsiteProduct, CurrencyCode } from '../types';

interface LiveDemoViewProps {
  product: WebsiteProduct;
  currency: CurrencyCode;
  onCloseDemo: () => void;
  onBuyFromDemo: (product: WebsiteProduct) => void;
  onInspectDetails: (product: WebsiteProduct) => void;
}

export const LiveDemoView: React.FC<LiveDemoViewProps> = ({
  product,
  currency,
  onCloseDemo,
  onBuyFromDemo,
  onInspectDetails,
}) => {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'home' | 'features' | 'interactive'>('home');
  const [demoCartCount, setDemoCartCount] = useState(1);
  const [demoPromptResult, setDemoPromptResult] = useState(
    'Ready to run interactive demonstration workflow.'
  );

  const priceDisplay =
    currency === 'PKR'
      ? `PKR ${product.pricePKR.toLocaleString()}`
      : `USD $${product.priceUSD.toLocaleString()}`;

  const viewportWidthClass =
    viewport === 'desktop'
      ? 'w-full max-w-[1360px]'
      : viewport === 'tablet'
      ? 'w-[768px] max-w-full'
      : 'w-[390px] max-w-full';

  return (
    <div className="min-h-screen bg-[#07080D] text-white flex flex-col">
      {/* Top Preview Studio Bar */}
      <div className="sticky top-0 z-50 bg-[#0D1018] border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCloseDemo}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Markety Studio</span>
          </button>

          <div className="hidden sm:block">
            <div className="text-xs font-semibold text-white">{product.title}</div>
            <div className="text-[11px] text-slate-400">
              Interactive Live Demo Preview · {product.isSample ? 'Sample Demonstration Build' : 'Production Build'}
            </div>
          </div>
        </div>

        {/* Viewport Switcher */}
        <div className="flex items-center gap-1 bg-[#141824] border border-slate-800 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setViewport('desktop')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md transition-colors ${
              viewport === 'desktop' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setViewport('tablet')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md transition-colors ${
              viewport === 'tablet' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Tablet</span>
          </button>
          <button
            type="button"
            onClick={() => setViewport('mobile')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md transition-colors ${
              viewport === 'mobile' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Mobile</span>
          </button>
        </div>

        {/* Purchase Action */}
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-sm font-bold text-white tabular-nums">
            {priceDisplay}
          </span>
          <button
            type="button"
            onClick={() => onInspectDetails(product)}
            className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg whitespace-nowrap"
          >
            Specifications
          </button>
          <button
            type="button"
            onClick={() => onBuyFromDemo(product)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg whitespace-nowrap"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Buy This Website</span>
          </button>
        </div>
      </div>

      {/* Interactive Simulated Website Frame */}
      <div className="flex-1 p-4 sm:p-6 flex justify-center bg-[#06070B] overflow-x-auto">
        <div
          className={`${viewportWidthClass} bg-[#0E111B] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300`}
        >
          {/* Simulated Website Internal Header */}
          <div className="px-6 py-4 bg-[#121624] border-b border-slate-800 flex items-center justify-between gap-4">
            <div className="font-display font-bold text-base text-white">
              {product.title.split('—')[0].trim()}
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-300">
              <button
                type="button"
                onClick={() => setActiveTab('home')}
                className={activeTab === 'home' ? 'text-blue-400 font-semibold' : 'hover:text-white'}
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('features')}
                className={activeTab === 'features' ? 'text-blue-400 font-semibold' : 'hover:text-white'}
              >
                Included Capabilities
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('interactive')}
                className={activeTab === 'interactive' ? 'text-blue-400 font-semibold' : 'hover:text-white'}
              >
                Interactive Module
              </button>
            </div>
            <div className="text-xs font-mono text-cyan-400">
              {product.category === 'Ecommerce Websites' ? `Bag (${demoCartCount})` : 'Live Preview'}
            </div>
          </div>

          {/* Simulated Website Content */}
          <div className="p-6 sm:p-10 space-y-8 flex-1">
            {activeTab === 'home' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-4">
                  <div className="text-xs font-mono text-blue-400">
                    {product.category} · {product.technologies.slice(0, 3).join(' · ')}
                  </div>
                  <h1 className="font-display text-2xl sm:text-4xl font-bold text-white leading-tight">
                    {product.title}
                  </h1>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                    {product.fullDescription}
                  </p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('interactive')}
                      className="px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg"
                    >
                      Try Interactive Demo Flow
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('features')}
                      className="px-4 py-2.5 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg"
                    >
                      Inspect Architecture
                    </button>
                  </div>
                </div>
                <div className="lg:col-span-6">
                  <img
                    src={product.thumbnailUrl}
                    alt={product.title}
                    referrerPolicy="no-referrer"
                    className="w-full rounded-xl border border-slate-800 shadow-xl"
                  />
                </div>
              </div>
            )}

            {activeTab === 'features' && (
              <div className="space-y-6">
                <h2 className="font-display text-xl font-bold text-white">
                  Engineered Capabilities & Technical Specifications
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-[#131826] border border-slate-800 flex items-start gap-3"
                    >
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-200">{feat}</span>
                    </div>
                  ))}
                </div>
                <div className="p-5 rounded-xl bg-[#131826] border border-slate-800 space-y-2 text-xs text-slate-300">
                  <div>
                    <strong className="text-white">Backend Requirements:</strong>{' '}
                    {product.backendRequirements}
                  </div>
                  <div>
                    <strong className="text-white">Hosting Requirements:</strong>{' '}
                    {product.hostingRequirements}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'interactive' && (
              <div className="p-6 rounded-xl bg-[#131826] border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-bold text-white">
                    Live Interactive Component Sandbox
                  </h3>
                  <span className="text-xs font-mono text-slate-400">
                    State persists in preview
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Test the interactive state controls built into {product.title}:
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDemoCartCount((c) => c + 1);
                      setDemoPromptResult(
                        `Action triggered at ${new Date().toLocaleTimeString()}: Added item / executed workflow step (#${
                          demoCartCount + 1
                        }).`
                      );
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Trigger Primary Workflow Action</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDemoCartCount(0);
                      setDemoPromptResult('Sandbox state reset to initial baseline.');
                    }}
                    className="px-3 py-2 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-700 rounded-lg hover:text-white"
                  >
                    Reset State
                  </button>
                </div>
                <div className="p-3.5 rounded-lg bg-[#0B0D14] border border-slate-800 font-mono text-xs text-cyan-300">
                  {demoPromptResult}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
