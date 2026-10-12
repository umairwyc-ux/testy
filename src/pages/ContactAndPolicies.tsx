import React, { useState } from 'react';
import {
  MessageCircle,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  ShieldCheck,
  FileCode2,
  Server,
  Terminal,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import {
  PlatformSettings,
  WEBSITE_CATEGORIES,
  UserProfile,
  WebsiteCategory,
} from '../types';
import { ActivePage } from '../components/Navbar';

interface ContactAndPoliciesProps {
  mode: 'how-it-works' | 'about' | 'contact' | 'architecture';
  settings: PlatformSettings;
  user: UserProfile | null;
  authToken: string | null;
  prefilledSubject?: string;
  onNavigate: (page: ActivePage, category?: WebsiteCategory | 'All') => void;
}

export const ContactAndPolicies: React.FC<ContactAndPoliciesProps> = ({
  mode,
  settings,
  user,
  authToken,
  prefilledSubject = '',
  onNavigate,
}) => {
  const [formType, setFormType] = useState<'general' | 'custom_project'>(
    prefilledSubject ? 'general' : 'custom_project'
  );
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [subject, setSubject] = useState(prefilledSubject);
  const [message, setMessage] = useState('');
  const [budget, setBudget] = useState('PKR 85,000 – 150,000 (USD $300 – $550)');
  const [websiteType, setWebsiteType] = useState<string>(WEBSITE_CATEGORIES[0]);
  const [requiredFeatures, setRequiredFeatures] = useState('');
  const [deadline, setDeadline] = useState('2 – 3 Weeks');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (prefilledSubject) {
      setSubject(`Question about: ${prefilledSubject}`);
      setFormType('general');
    }
  }, [prefilledSubject]);

  const cleanWhatsapp = settings.whatsappNumber.replace(/[^0-9]/g, '');

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          type: formType,
          name,
          email,
          phone,
          subject:
            formType === 'custom_project'
              ? `Custom Project Request: ${websiteType}`
              : subject || 'Website Marketplace Inquiry',
          message,
          budget: formType === 'custom_project' ? budget : undefined,
          websiteType: formType === 'custom_project' ? websiteType : undefined,
          requiredFeatures: formType === 'custom_project' ? requiredFeatures : undefined,
          deadline: formType === 'custom_project' ? deadline : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Submission failed.');
      }
      setSuccessMsg(data.message);
      setMessage('');
      setRequiredFeatures('');
    } catch (err: any) {
      setError(err.message || 'Could not submit inquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  if (mode === 'how-it-works') {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        <div className="space-y-3 border-b border-slate-800 pb-6">
          <div className="text-xs font-mono text-blue-400">
            Markety Studio · Purchase & Delivery Workflow
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
            How Markety Studio Works
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            From live interactive inspection to verified payment and protected code delivery, here
            is the exact workflow for purchasing or customizing a website.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Preview & Select Website',
              desc: 'Explore ready-made e-commerce stores, business platforms, portfolios, and AI apps. Test the interactive Live Demo and review the technical requirements.',
            },
            {
              step: '02',
              title: 'Choose Package Tier',
              desc: 'Select Starter (source files + setup manual), Professional (includes deployment guide), or Custom (tailored branding and feature integrations).',
            },
            {
              step: '03',
              title: 'Complete Order & Payment Proof',
              desc: 'Pay in PKR or USD via JazzCash, Easypaisa, Bank Transfer (IBFT/Raast), or international invoice. Submit your transaction ID or receipt screenshot.',
            },
            {
              step: '04',
              title: 'Admin Verification & File Unlock',
              desc: 'Once our team verifies your payment, your order status updates to Paid / Delivered and protected download links unlock in your Customer Dashboard.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="p-6 rounded-2xl bg-[#11141F] border border-slate-800 space-y-3"
            >
              <div className="font-mono text-sm font-bold text-blue-400">
                Step {item.step}
              </div>
              <h2 className="font-display text-lg font-bold text-white">{item.title}</h2>
              <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Platform FAQs */}
        <div className="space-y-6">
          <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <span>Frequently Asked Questions</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                q: 'Why does my order show "Pending Payment" or "Payment Under Review" after checkout?',
                a: 'For security, selecting a payment method or uploading a receipt screenshot never automatically marks an order as Paid. Our finance team verifies the incoming transaction in JazzCash, Easypaisa, or our corporate bank account before unlocking your downloadable archives.',
              },
              {
                q: 'Are domain registration and web hosting included in the website price?',
                a: 'No. You receive the website source code and setup/deployment documentation as specified in the listing so you retain 100% ownership on your own hosting account (Netlify, Vercel, Cloud Run, Render, or VPS).',
              },
              {
                q: 'Can I pay in Pakistani Rupees (PKR) or US Dollars (USD)?',
                a: 'Yes. Toggle between PKR and USD in the top navigation bar. Local buyers can use JazzCash, Easypaisa, or IBFT/Raast, while international buyers can pay in USD.',
              },
              {
                q: 'What if I need custom features or local courier integrations added?',
                a: 'You can either select the Custom Package on any listing or submit a Custom Website Request specifying your budget, timeline, and required integrations.',
              },
            ].map((faq, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-[#11141F] border border-slate-800 space-y-2"
              >
                <h3 className="font-display text-sm font-bold text-white">{faq.q}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'about') {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
        <div className="space-y-3 border-b border-slate-800 pb-6">
          <div className="text-xs font-mono text-blue-400">
            About {settings.brandName} · Digital Agency & Website Marketplace
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
            {settings.tagline}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
            Markety Studio bridges the gap between slow, expensive custom agency retainers and
            fragile generic templates. We engineer production-grade website foundations that
            businesses in Pakistan and international markets can preview, purchase, and deploy with
            full code transparency.
          </p>
        </div>

        {/* Policies Section: Refund, Delivery, Licensing & Support */}
        <div className="space-y-6">
          <h2 className="font-display text-2xl font-bold text-white">
            Official Platform Policies (Delivery, Licensing, Refunds & Support)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-[#11141F] border border-slate-800 space-y-2">
              <div className="text-xs font-mono text-blue-400">01. Delivery Policy</div>
              <h3 className="font-display text-base font-bold text-white">
                Verified Payment & Protected File Delivery
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Standard Starter and Professional deliverables are unlocked in your Customer
                Dashboard immediately once payment is verified by an administrator. Custom package
                builds follow the milestone schedule agreed in your project statement of work.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#11141F] border border-slate-800 space-y-2">
              <div className="text-xs font-mono text-cyan-400">02. Licensing Policy</div>
              <h3 className="font-display text-base font-bold text-white">
                Single-Business Commercial Usage License
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Each purchase grants the buyer a perpetual commercial license to modify and deploy
                the website for one business or client project. Redistribution or resale of the raw
                source archives on competing template marketplaces is prohibited.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#11141F] border border-slate-800 space-y-2">
              <div className="text-xs font-mono text-blue-400">03. Refund Policy</div>
              <h3 className="font-display text-base font-bold text-white">
                Pre-Download Cancellation & Defect Resolution
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Orders may be cancelled for a 100% refund at any time prior to source code download.
                Because source code archives are non-revocable digital assets, post-download refunds
                apply only if a documented technical defect cannot be resolved by our engineering
                team within 5 business days.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#11141F] border border-slate-800 space-y-2">
              <div className="text-xs font-mono text-cyan-400">04. Support & Third-Party Scope</div>
              <h3 className="font-display text-base font-bold text-white">
                Honest Scope & Setup Assistance
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Every listing includes setup instructions for the specified stack. Ongoing server
                hosting, domain renewals, third-party API usage fees, and unscheduled custom feature
                development are not included unless contracted under a Custom Package.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'architecture') {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="space-y-2 border-b border-slate-800 pb-6">
          <div className="text-xs font-mono text-cyan-400">
            Technical Architecture · Setup, Security & Deployment Reference
          </div>
          <h1 className="font-display text-3xl font-bold text-white">
            Architecture, Database & Deployment Guide
          </h1>
          <p className="text-sm text-slate-300 max-w-3xl">
            Complete reference for developers and system administrators deploying Markety Studio in
            production. Also saved in the repository under <code className="text-blue-300">/ARCHITECTURE_AND_DEPLOYMENT.md</code> and <code className="text-blue-300">/db/schema.sql</code>.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-[#11141F] border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-blue-400">
              <Server className="w-4 h-4" />
              <span>1. Full-Stack Runtime & Configuration Status</span>
            </div>
            <h2 className="font-display text-lg font-bold text-white">
              Implemented vs External Production Credentials
            </h2>
            <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <li>
                <strong className="text-emerald-400">Fully Operational Locally:</strong> Express
                backend (`server.ts`), persistent JSON database (`/data/store.json`), scrypt
                password hashing, HMAC-SHA256 session tokens, server-enforced Admin RBAC, audit
                logging, manual payment verification workflow, and protected deliverable streaming.
              </li>
              <li>
                <strong className="text-amber-300">External Production Setup Checklist:</strong>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-400">
                  <li>Set strong `SESSION_SECRET`, `ADMIN_EMAIL`, and `ADMIN_INITIAL_PASSWORD` in `.env`.</li>
                  <li>Run `/db/schema.sql` if migrating from `/data/store.json` to external PostgreSQL / Supabase.</li>
                  <li>Connect S3 / Supabase private storage bucket for multi-gigabyte ZIP archives.</li>
                  <li>Configure SMTP / Resend API key for automated email alerts.</li>
                </ul>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-[#11141F] border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <Terminal className="w-4 h-4" />
              <span>2. Netlify & Backend Deployment Note</span>
            </div>
            <h2 className="font-display text-lg font-bold text-white">
              Frontend Hosting vs Secure Backend Services
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Netlify static hosting can serve the compiled Vite frontend (`npm run build` → `dist/`),
              <strong> but private file delivery, secure admin operations, authentication, and database persistence require a running backend (`server.ts`) and private storage.</strong>
            </p>
            <pre className="p-3.5 rounded-xl bg-[#090B11] border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
{`# Install & Run Full-Stack Server
npm install
cp .env.example .env
npm run build
npm run start`}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  // Default: Contact & Custom Website Request Page
  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="space-y-3 border-b border-slate-800 pb-6">
        <div className="text-xs font-mono text-blue-400">
          Markety Studio · Direct Sales & Custom Engineering
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
          Contact Us or Request a Custom Website
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl">
          Have a question about a marketplace listing or need a bespoke web application built to
          your exact specification? Reach us via WhatsApp, email, or the validated brief form below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Contact Channels Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-[#11141F] border border-slate-800 space-y-5">
            <h2 className="font-display text-lg font-bold text-white">
              Direct Communication Channels
            </h2>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#0C0F18] border border-slate-800 space-y-2">
                <div className="text-slate-400">Official WhatsApp Sales Desk</div>
                <div className="font-mono text-sm font-bold text-white">
                  {settings.whatsappNumber}
                </div>
                <a
                  href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
                    'Hello Markety Studio, I have a question regarding your websites.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>

              <div className="p-4 rounded-2xl bg-[#0C0F18] border border-slate-800 space-y-1">
                <div className="text-slate-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Business Email</span>
                </div>
                <a
                  href={`mailto:${settings.businessEmail}`}
                  className="font-mono text-sm font-bold text-blue-400 hover:underline block"
                >
                  {settings.businessEmail}
                </a>
              </div>

              <div className="p-4 rounded-2xl bg-[#0C0F18] border border-slate-800 space-y-1">
                <div className="text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>Operating Hours</span>
                </div>
                <div className="text-white font-medium">{settings.supportHours}</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0C0F18] border border-slate-800 space-y-1">
                <div className="text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Studio Location</span>
                </div>
                <div className="text-white font-medium">{settings.officeLocation}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Validated Contact / Custom Request Form (7 cols) */}
        <form
          onSubmit={handleSubmitInquiry}
          className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-[#11141F] border border-slate-800 space-y-6"
        >
          {/* Form Type Selector */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#0C0F18] border border-slate-800 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFormType('custom_project')}
              className={`py-2.5 rounded-lg transition-colors ${
                formType === 'custom_project'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Custom Website Request
            </button>
            <button
              type="button"
              onClick={() => setFormType('general')}
              className={`py-2.5 rounded-lg transition-colors ${
                formType === 'general'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              General Sales Inquiry
            </button>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-200">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-300 mb-1">Your Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="w-full px-3.5 py-2.5 text-xs bg-[#0C0F18] border border-slate-800 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-3.5 py-2.5 text-xs bg-[#0C0F18] border border-slate-800 rounded-xl text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-300 mb-1">Phone / WhatsApp</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+92 300 1234567"
                className="w-full px-3.5 py-2.5 text-xs bg-[#0C0F18] border border-slate-800 rounded-xl text-white"
              />
            </div>

            {formType === 'general' ? (
              <div>
                <label className="block text-xs text-slate-300 mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Question about a listing or license"
                  className="w-full px-3.5 py-2.5 text-xs bg-[#0C0F18] border border-slate-800 rounded-xl text-white"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Preferred Website Type *
                </label>
                <select
                  value={websiteType}
                  onChange={(e) => setWebsiteType(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#0C0F18] border border-slate-800 rounded-xl text-white"
                >
                  {WEBSITE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {formType === 'custom_project' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Estimated Budget *</label>
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#0C0F18] border border-slate-800 rounded-xl text-white"
                  >
                    <option value="PKR 45,000 – 85,000 (USD $160 – $300)">
                      PKR 45,000 – 85,000 (USD $160 – $300)
                    </option>
                    <option value="PKR 85,000 – 150,000 (USD $300 – $550)">
                      PKR 85,000 – 150,000 (USD $300 – $550)
                    </option>
                    <option value="PKR 150,000 – 350,000 (USD $550 – $1,250)">
                      PKR 150,000 – 350,000 (USD $550 – $1,250)
                    </option>
                    <option value="PKR 350,000+ (USD $1,250+ Enterprise)">
                      PKR 350,000+ (USD $1,250+ Enterprise)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Target Deadline *</label>
                  <input
                    type="text"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    placeholder="e.g., Within 3 weeks"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#0C0F18] border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Required Features & Integrations *
                </label>
                <input
                  type="text"
                  required
                  value={requiredFeatures}
                  onChange={(e) => setRequiredFeatures(e.target.value)}
                  placeholder="e.g., Multi-vendor checkout, JazzCash/Stripe, courier API, custom dashboard"
                  className="w-full px-3.5 py-2.5 text-xs bg-[#0C0F18] border border-slate-800 rounded-xl text-white"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs text-slate-300 mb-1">
              Project Overview / Message Details *
            </label>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your business goals, target audience, or questions..."
              className="w-full px-3.5 py-2.5 text-xs bg-[#0C0F18] border border-slate-800 rounded-xl text-white"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl transition-colors"
          >
            <span>
              {submitting
                ? 'Saving Inquiry to Database...'
                : formType === 'custom_project'
                ? 'Submit Custom Website Specification'
                : 'Send Message to Markety Studio'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
