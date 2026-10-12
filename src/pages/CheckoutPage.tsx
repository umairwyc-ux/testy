import React, { useState } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Upload,
  AlertCircle,
  Lock,
  ArrowRight,
} from 'lucide-react';
import {
  WebsiteProduct,
  PackageTierKey,
  CurrencyCode,
  PlatformSettings,
  PaymentMethodType,
  UserProfile,
  Order,
} from '../types';

interface CheckoutPageProps {
  product: WebsiteProduct;
  initialTier: PackageTierKey;
  currency: CurrencyCode;
  settings: PlatformSettings;
  user: UserProfile | null;
  authToken: string | null;
  onBackToProduct: () => void;
  onRequireAuth: () => void;
  onOrderCreated: (order: Order) => void;
  onGoToCustomerDashboard: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  product,
  initialTier,
  currency,
  settings,
  user,
  authToken,
  onBackToProduct,
  onRequireAuth,
  onOrderCreated,
  onGoToCustomerDashboard,
}) => {
  const enabledTiers = (['starter', 'professional', 'custom'] as PackageTierKey[]).filter(
    (t) => product.packages[t]?.enabled
  );

  const [selectedTier, setSelectedTier] = useState<PackageTierKey>(
    product.packages[initialTier]?.enabled ? initialTier : enabledTiers[0] || 'starter'
  );

  const enabledPaymentMethods = (
    ['JazzCash', 'Easypaisa', 'Bank Transfer', 'International Payment Gateway'] as PaymentMethodType[]
  ).filter((m) => settings.paymentMethods[m]?.enabled);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>(
    enabledPaymentMethods[0] || 'Bank Transfer'
  );

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerCompany, setCustomerCompany] = useState(user?.company || '');
  const [customerCountry, setCustomerCountry] = useState(user?.country || 'Pakistan');
  const [billingNotes, setBillingNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [copiedAccount, setCopiedAccount] = useState(false);

  // Post-order receipt submission state
  const [paymentReference, setPaymentReference] = useState('');
  const [receiptFileName, setReceiptFileName] = useState('');
  const [receiptDataUrl, setReceiptDataUrl] = useState('');
  const [receiptNotes, setReceiptNotes] = useState('');
  const [submittingReceipt, setSubmittingReceipt] = useState(false);
  const [receiptSubmittedSuccess, setReceiptSubmittedSuccess] = useState(false);

  React.useEffect(() => {
    if (user) {
      setCustomerName((prev) => prev || user.name);
      setCustomerEmail((prev) => prev || user.email);
      setCustomerPhone((prev) => prev || user.phone || '');
      setCustomerCompany((prev) => prev || user.company || '');
      setCustomerCountry((prev) => prev || user.country || 'Pakistan');
    }
  }, [user]);

  const currentPkg = product.packages[selectedTier] || product.packages.starter;
  const rawPrice = currency === 'PKR' ? currentPkg.pricePKR : currentPkg.priceUSD;
  const finalAmount =
    product.discountPercentage > 0
      ? Math.round(rawPrice * ((100 - product.discountPercentage) / 100))
      : rawPrice;

  const formattedTotal =
    currency === 'PKR'
      ? `PKR ${finalAmount.toLocaleString()}`
      : `USD $${finalAmount.toLocaleString()}`;

  const activeMethodConfig = settings.paymentMethods[paymentMethod];

  const handleCopyAccount = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleReceiptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReceiptFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setReceiptDataUrl(reader.result.slice(0, 150000));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !authToken) {
      onRequireAuth();
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          productId: product.id,
          packageTier: selectedTier,
          currency,
          paymentMethod,
          customerName,
          customerEmail,
          customerPhone,
          customerCompany,
          customerCountry,
          billingNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not create order.');
      }
      setCreatedOrder(data.order);
      onOrderCreated(data.order);
    } catch (err: any) {
      setError(err.message || 'Order creation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdOrder || !authToken) return;
    setError(null);
    setSubmittingReceipt(true);
    try {
      const res = await fetch(`/api/orders/${createdOrder.id}/receipt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          paymentReference,
          receiptFileName,
          receiptDataUrl,
          receiptNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit payment receipt.');
      }
      setCreatedOrder(data.order);
      onOrderCreated(data.order);
      setReceiptSubmittedSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error submitting payment reference.');
    } finally {
      setSubmittingReceipt(false);
    }
  };

  if (createdOrder) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="p-8 rounded-3xl bg-[#11141F] border border-slate-800 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div className="space-y-1">
              <div className="text-xs font-mono text-blue-400">
                Order Created · Reference #{createdOrder.orderNumber}
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
                Order #{createdOrder.orderNumber} — {createdOrder.status}
              </h1>
              <p className="text-xs text-slate-300">
                Deliverables remain locked until payment is verified by an administrator.
              </p>
            </div>

            <div className="px-4 py-2 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs font-mono text-amber-300">
              Status: {createdOrder.status}
            </div>
          </div>

          {/* Official Payment Instructions */}
          <div className="p-6 rounded-2xl bg-[#0C0F18] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-white">
                Official Payment Instructions — {activeMethodConfig.title}
              </h2>
              <span className="font-mono text-base font-bold text-blue-400 tabular-nums">
                Amount Due: {createdOrder.currency} {createdOrder.amount.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#121624] border border-slate-800/80">
                <div className="text-slate-400">Account Title</div>
                <div className="font-semibold text-white mt-0.5">
                  {activeMethodConfig.accountTitle}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#121624] border border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="text-slate-400">Account / Merchant Number</div>
                  <div className="font-mono font-semibold text-white mt-0.5">
                    {activeMethodConfig.accountNumber}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyAccount(activeMethodConfig.accountNumber)}
                  className="p-2 text-slate-300 hover:text-white bg-slate-800 rounded-lg"
                  title="Copy account number"
                >
                  {copiedAccount ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {activeMethodConfig.bankName && (
                <div className="p-3.5 rounded-xl bg-[#121624] border border-slate-800/80">
                  <div className="text-slate-400">Bank & Branch</div>
                  <div className="font-semibold text-white mt-0.5">
                    {activeMethodConfig.bankName}
                  </div>
                </div>
              )}

              {activeMethodConfig.iban && (
                <div className="p-3.5 rounded-xl bg-[#121624] border border-slate-800/80">
                  <div className="text-slate-400">IBAN</div>
                  <div className="font-mono font-semibold text-white mt-0.5">
                    {activeMethodConfig.iban}
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {activeMethodConfig.instructions}
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Payment Reference & Receipt Form */}
          {!receiptSubmittedSuccess ? (
            <form onSubmit={handleSubmitReceipt} className="space-y-4 pt-2">
              <h3 className="font-display text-base font-bold text-white">
                Submit Payment Transaction Reference / Receipt for Verification
              </h3>
              <p className="text-xs text-slate-400">
                Submitting a payment reference sets your order status to{' '}
                <strong className="text-slate-200">Payment Under Review</strong>. An administrator
                will verify the transaction before unlocking your download links.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Transaction Reference / TID *
                  </label>
                  <input
                    type="text"
                    required
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="e.g., TID-8492019482 or IBFT Reference"
                    className="w-full px-3.5 py-2.5 text-xs font-mono bg-[#0C0F18] border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Upload Payment Receipt Screenshot (Optional)
                  </label>
                  <label className="flex items-center justify-center gap-2 w-full px-3.5 py-2.5 text-xs bg-[#0C0F18] border border-dashed border-slate-700 hover:border-blue-500 rounded-xl text-slate-300 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-blue-400" />
                    <span className="truncate">
                      {receiptFileName || 'Choose screenshot or PDF receipt...'}
                    </span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleReceiptFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Sender Account / Verification Notes
                </label>
                <input
                  type="text"
                  value={receiptNotes}
                  onChange={(e) => setReceiptNotes(e.target.value)}
                  placeholder="e.g., Sent from Meezan account ending in 4412 at 2:15 PM"
                  className="w-full px-3.5 py-2.5 text-xs bg-[#0C0F18] border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <button
                  type="button"
                  onClick={onGoToCustomerDashboard}
                  className="text-xs font-medium text-slate-400 hover:text-white"
                >
                  I will submit my receipt later in the Customer Dashboard
                </button>

                <button
                  type="submit"
                  disabled={submittingReceipt}
                  className="inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl transition-colors"
                >
                  <span>
                    {submittingReceipt ? 'Submitting Proof...' : 'Submit Payment Reference for Review'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6 rounded-2xl bg-blue-950/30 border border-blue-500/40 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-sm font-bold text-white">
                    Payment Proof Submitted — Status: Payment Under Review
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Reference <span className="font-mono text-white">{createdOrder.paymentReference}</span>{' '}
                    has been attached to Order <span className="font-mono text-white">{createdOrder.orderNumber}</span>.
                    Once our administrator verifies the funds, your order status will update to{' '}
                    <strong>Paid / Delivered</strong> and your website files will unlock in your
                    Customer Dashboard.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onGoToCustomerDashboard}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl"
              >
                <span>Open Customer Dashboard & Track Order</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <button
        type="button"
        onClick={onBackToProduct}
        className="inline-flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to {product.title}</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Form Column (7 cols) */}
        <form onSubmit={handleCreateOrder} className="lg:col-span-7 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#11141F] border border-slate-800 space-y-6">
            <div className="space-y-1 border-b border-slate-800 pb-4">
              <div className="text-xs font-mono text-blue-400">Step 1 of 2 · Order Configuration</div>
              <h1 className="font-display text-2xl font-bold text-white">
                Configure Package & Billing Details
              </h1>
            </div>

            {!user && (
              <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-blue-400" />
                    <span>Customer Account Required for File Delivery</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Sign in or register a customer account so your order and download links are
                    securely isolated to your profile.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onRequireAuth}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg whitespace-nowrap shrink-0"
                >
                  Sign In / Register
                </button>
              </div>
            )}

            {/* Package Selection */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                1. Choose Website Package
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {enabledTiers.map((tierKey) => {
                  const pkg = product.packages[tierKey];
                  const active = selectedTier === tierKey;
                  const pVal = currency === 'PKR' ? pkg.pricePKR : pkg.priceUSD;

                  return (
                    <button
                      key={tierKey}
                      type="button"
                      onClick={() => setSelectedTier(tierKey)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        active
                          ? 'bg-blue-950/50 border-blue-500 text-white'
                          : 'bg-[#0C0F18] border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold">{pkg.name}</div>
                      <div className="font-mono text-sm font-bold text-blue-400 mt-1 tabular-nums">
                        {currency === 'PKR'
                          ? `PKR ${pVal.toLocaleString()}`
                          : `USD $${pVal.toLocaleString()}`}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                        {pkg.summary}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contact & Billing Information */}
            <div className="space-y-4 pt-2">
              <div className="text-xs font-semibold text-slate-300">
                2. Customer Contact & Licensing Information
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g., Zainab Tariq"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#0C0F18] border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#0C0F18] border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#0C0F18] border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Country *</label>
                  <input
                    type="text"
                    required
                    value={customerCountry}
                    onChange={(e) => setCustomerCountry(e.target.value)}
                    placeholder="Pakistan / United States / UAE / UK"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#0C0F18] border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Company / Brand Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={customerCompany}
                    onChange={(e) => setCustomerCompany(e.target.value)}
                    placeholder="Your business or agency name"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#0C0F18] border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Order / Customization Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={billingNotes}
                    onChange={(e) => setBillingNotes(e.target.value)}
                    placeholder="Any specific domain or setup notes"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#0C0F18] border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-semibold text-slate-300">
                3. Select Payment Method
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {enabledPaymentMethods.map((method) => {
                  const cfg = settings.paymentMethods[method];
                  const active = paymentMethod === method;
                  return (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        active
                          ? 'bg-blue-950/50 border-blue-500 text-white'
                          : 'bg-[#0C0F18] border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold">{method}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                        {cfg.title}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="p-4 rounded-xl bg-[#0C0F18] border border-slate-800/80 text-xs text-slate-300 space-y-1">
                <div className="font-semibold text-white">{activeMethodConfig.title}</div>
                <p className="text-slate-400 leading-relaxed">
                  {activeMethodConfig.instructions}
                </p>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-6 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl shadow-lg transition-colors"
            >
              {submitting
                ? 'Creating Order...'
                : user
                ? `Create Order & Get Payment Instructions (${formattedTotal})`
                : 'Sign In to Complete Order'}
            </button>
          </div>
        </form>

        {/* Right Order Summary Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-[#11141F] border border-slate-800 space-y-5">
            <h2 className="font-display text-lg font-bold text-white border-b border-slate-800 pb-3">
              Order Summary
            </h2>

            <div className="flex items-start gap-4">
              <img
                src={product.thumbnailUrl}
                alt={product.title}
                referrerPolicy="no-referrer"
                className="w-24 aspect-[4/3] rounded-xl object-cover border border-slate-800 shrink-0"
              />
              <div className="space-y-1">
                <div className="text-xs text-blue-400 font-medium">{product.category}</div>
                <div className="font-display text-sm font-bold text-white">{product.title}</div>
                <div className="text-xs text-slate-400">{currentPkg.name}</div>
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-800 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Selected Package</span>
                <span className="font-medium text-white">{currentPkg.name}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Payment Method</span>
                <span className="font-medium text-white">{paymentMethod}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Initial Order Status</span>
                <span className="font-mono text-amber-300">Pending Payment</span>
              </div>
              <div className="flex justify-between items-baseline pt-3 border-t border-slate-800 text-sm font-bold text-white">
                <span>Total Amount</span>
                <span className="font-mono text-lg text-blue-400 tabular-nums">
                  {formattedTotal}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0C0F18] border border-slate-800/80 space-y-2 text-[11px] text-slate-400 leading-relaxed">
              <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Verified Payment Protection</span>
              </div>
              <p>
                Submitting this checkout generates a unique Order Number with status{' '}
                <strong>Pending Payment</strong>. After transferring funds via your selected method,
                submit your transaction reference or receipt screenshot. Once verified by our
                administrator, your website files unlock for download.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
