import React, { useState, useEffect } from 'react';
import {
  Package,
  Download,
  Lock,
  Upload,
  User,
  LifeBuoy,
  LogOut,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileArchive,
  KeyRound,
} from 'lucide-react';
import { UserProfile, Order, Inquiry, PlatformSettings } from '../types';

interface CustomerDashboardProps {
  user: UserProfile | null;
  authToken: string | null;
  settings: PlatformSettings;
  onLoginSuccess: (token: string, user: UserProfile) => void;
  onLogout: () => void;
  onQuickRoleSwitch: (target: 'customer_pk' | 'customer_intl' | 'admin' | 'logout') => void;
  onBrowseMarketplace: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  user,
  authToken,
  settings,
  onLoginSuccess,
  onLogout,
  onQuickRoleSwitch,
  onBrowseMarketplace,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [country, setCountry] = useState('Pakistan');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<'orders' | 'downloads' | 'support' | 'profile'>(
    'orders'
  );
  const [orders, setOrders] = useState<Order[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Receipt upload modal state
  const [activeReceiptOrderId, setActiveReceiptOrderId] = useState<string | null>(null);
  const [paymentReference, setPaymentReference] = useState('');
  const [receiptFileName, setReceiptFileName] = useState('');
  const [receiptDataUrl, setReceiptDataUrl] = useState('');
  const [receiptNotes, setReceiptNotes] = useState('');
  const [receiptStatusMsg, setReceiptStatusMsg] = useState<string | null>(null);

  // Support request state
  const [supportOrderNumber, setSupportOrderNumber] = useState('');
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportFeedback, setSupportFeedback] = useState<string | null>(null);

  // Profile update state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileCompany, setProfileCompany] = useState(user?.company || '');
  const [profileCountry, setProfileCountry] = useState(user?.country || 'Pakistan');
  const [newPassword, setNewPassword] = useState('');
  const [profileFeedback, setProfileFeedback] = useState<string | null>(null);

  const fetchCustomerData = async () => {
    if (!authToken) return;
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/orders/my', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setInquiries(data.inquiries || []);
      }
    } catch (err) {
      console.error('Failed to fetch customer orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (user && authToken) {
      setProfileName(user.name);
      setProfilePhone(user.phone || '');
      setProfileCompany(user.company || '');
      setProfileCountry(user.country || 'Pakistan');
      fetchCustomerData();
    }
  }, [user, authToken]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthMessage(null);
    setAuthLoading(true);

    try {
      if (authMode === 'reset') {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, newPassword: password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Password reset failed.');
        setAuthMessage(data.message);
        setAuthMode('login');
        return;
      }

      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload =
        authMode === 'login'
          ? { email, password }
          : { name, email, password, phone, company, country };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed.');
      onLoginSuccess(data.token, data.user);
    } catch (err: any) {
      setAuthError(err.message || 'Authentication error.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleReceiptSubmit = async (e: React.FormEvent, orderId: string) => {
    e.preventDefault();
    if (!authToken) return;
    setReceiptStatusMsg(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/receipt`, {
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
      if (!res.ok) throw new Error(data.error || 'Could not submit payment proof.');
      setReceiptStatusMsg('Payment proof submitted. Status is now Payment Under Review.');
      setActiveReceiptOrderId(null);
      setPaymentReference('');
      setReceiptFileName('');
      setReceiptNotes('');
      fetchCustomerData();
    } catch (err: any) {
      setReceiptStatusMsg(err.message);
    }
  };

  const handleDownloadDeliverable = async (orderId: string, deliverableId: string, fileName: string) => {
    if (!authToken) return;
    try {
      const res = await fetch(`/api/orders/${orderId}/download/${deliverableId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Download unauthorized or locked.');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setReceiptStatusMsg(err.message);
    }
  };

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSupportFeedback(null);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          type: 'support',
          name: user.name,
          email: user.email,
          phone: user.phone,
          orderNumber: supportOrderNumber,
          subject: supportSubject || 'Customer Order Support Request',
          message: supportMessage,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit support request.');
      setSupportFeedback('Support ticket submitted. Our team will respond in your dashboard.');
      setSupportOrderNumber('');
      setSupportSubject('');
      setSupportMessage('');
      fetchCustomerData();
    } catch (err: any) {
      setSupportFeedback(err.message);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken) return;
    setProfileFeedback(null);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: profileName,
          phone: profilePhone,
          company: profileCompany,
          country: profileCountry,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile.');
      onLoginSuccess(authToken, data.user);

      if (newPassword.trim()) {
        const pwRes = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ newPassword }),
        });
        const pwData = await pwRes.json();
        if (!pwRes.ok) throw new Error(pwData.error);
        setNewPassword('');
      }

      setProfileFeedback('Profile and security settings updated.');
    } catch (err: any) {
      setProfileFeedback(err.message);
    }
  };

  // Unauthenticated View: Sign In / Register / Password Reset + Instant Demo Account Switcher
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-14 space-y-6">
        <div className="p-8 rounded-3xl bg-[#11141F] border border-slate-800 shadow-2xl space-y-6">
          <div className="space-y-1 text-center">
            <div className="text-xs font-mono text-blue-400">Markety Studio · Customer Portal</div>
            <h1 className="font-display text-2xl font-bold text-white">
              {authMode === 'login'
                ? 'Sign In to Your Account'
                : authMode === 'register'
                ? 'Create Customer Account'
                : 'Reset Customer Password'}
            </h1>
            <p className="text-xs text-slate-400">
              Access your purchased websites, payment verification status, and protected downloads.
            </p>
          </div>

          {/* Segmented Auth Mode Switcher */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-[#0C0F18] border border-slate-800 rounded-xl text-xs font-medium">
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={`py-2 rounded-lg transition-colors ${
                authMode === 'login' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('register')}
              className={`py-2 rounded-lg transition-colors ${
                authMode === 'register'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Register
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('reset')}
              className={`py-2 rounded-lg transition-colors ${
                authMode === 'reset' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Reset Password
            </button>
          </div>

          {authError && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-200">
              {authError}
            </div>
          )}

          {authMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-200">
              {authMessage}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === 'register' && (
              <div>
                <label className="block text-xs text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-3.5 py-2.5 text-xs bg-[#0C0F18] border border-slate-800 rounded-xl text-white"
                />
              </div>
            )}

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

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                {authMode === 'reset' ? 'New Password (min 6 chars) *' : 'Password *'}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-xs bg-[#0C0F18] border border-slate-800 rounded-xl text-white"
              />
            </div>

            {authMode === 'register' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Phone / WhatsApp</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 300 0000000"
                    className="w-full px-3 py-2 text-xs bg-[#0C0F18] border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Pakistan"
                    className="w-full px-3 py-2 text-xs bg-[#0C0F18] border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors"
            >
              {authLoading
                ? 'Processing...'
                : authMode === 'login'
                ? 'Sign In'
                : authMode === 'register'
                ? 'Create Customer Account'
                : 'Reset Password'}
            </button>
          </form>

          {/* Evaluation Quick Demo Session Switcher */}
          <div className="pt-4 border-t border-slate-800 space-y-2.5">
            <div className="text-[11px] font-mono text-slate-400 text-center">
              Instant Evaluation Demo Sessions (Verify Customer Isolation)
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onQuickRoleSwitch('customer_pk')}
                className="p-2.5 text-xs font-medium text-slate-200 bg-[#0C0F18] hover:bg-slate-800 border border-slate-800 rounded-xl text-center"
              >
                Zainab (PK Customer)
              </button>
              <button
                type="button"
                onClick={() => onQuickRoleSwitch('customer_intl')}
                className="p-2.5 text-xs font-medium text-slate-200 bg-[#0C0F18] hover:bg-slate-800 border border-slate-800 rounded-xl text-center"
              >
                David (USD Customer)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const eligibleOrdersForDownload = orders.filter(
    (o) => o.status === 'Paid' || o.status === 'Delivered'
  );

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="text-xs font-mono text-blue-400">
            Customer Account · {user.email} · Country: {user.country}
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Welcome, {user.name}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() =>
              onQuickRoleSwitch(
                user.email === 'zainab@atelierpk.com' ? 'customer_intl' : 'customer_pk'
              )
            }
            className="px-3 py-2 text-xs font-medium text-slate-300 bg-[#11141F] hover:bg-slate-800 border border-slate-800 rounded-xl"
          >
            Switch Demo Customer (Test Isolation)
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-red-300 bg-red-950/30 hover:bg-red-950/50 border border-red-500/30 rounded-xl"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {receiptStatusMsg && (
        <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/40 text-xs text-blue-200 flex items-center justify-between">
          <span>{receiptStatusMsg}</span>
          <button
            type="button"
            onClick={() => setReceiptStatusMsg(null)}
            className="text-slate-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-colors ${
            activeTab === 'orders'
              ? 'bg-blue-600 text-white'
              : 'bg-[#11141F] text-slate-300 hover:text-white border border-slate-800'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Order History & Status ({orders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('downloads')}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-colors ${
            activeTab === 'downloads'
              ? 'bg-blue-600 text-white'
              : 'bg-[#11141F] text-slate-300 hover:text-white border border-slate-800'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Purchased Website Files ({eligibleOrdersForDownload.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('support')}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-colors ${
            activeTab === 'support'
              ? 'bg-blue-600 text-white'
              : 'bg-[#11141F] text-slate-300 hover:text-white border border-slate-800'
          }`}
        >
          <LifeBuoy className="w-3.5 h-3.5" />
          <span>Support Tickets ({inquiries.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-colors ${
            activeTab === 'profile'
              ? 'bg-blue-600 text-white'
              : 'bg-[#11141F] text-slate-300 hover:text-white border border-slate-800'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Profile & Password</span>
        </button>
      </div>

      {/* TAB 1: ORDERS & PAYMENT RECEIPT SUBMISSION */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {loadingOrders ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading your orders...</div>
          ) : orders.length === 0 ? (
            <div className="p-12 rounded-2xl bg-[#11141F] border border-slate-800 text-center space-y-4">
              <div className="font-display text-lg font-bold text-white">No orders placed yet</div>
              <p className="text-xs text-slate-400">
                Explore the website marketplace to preview live demos and place your first order.
              </p>
              <button
                type="button"
                onClick={onBrowseMarketplace}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 rounded-xl"
              >
                Explore Websites
              </button>
            </div>
          ) : (
            orders.map((order) => {
              const isUnlocked = order.status === 'Paid' || order.status === 'Delivered';
              const canSubmitReceipt =
                order.status === 'Pending Payment' || order.status === 'Payment Under Review';

              return (
                <div
                  key={order.id}
                  className="p-6 rounded-2xl bg-[#11141F] border border-slate-800 space-y-5"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
                        <span className="text-white font-semibold">{order.orderNumber}</span>
                        <span aria-hidden="true">·</span>
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                        <span aria-hidden="true">·</span>
                        <span>Method: {order.paymentMethod}</span>
                      </div>
                      <h3 className="font-display text-lg font-bold text-white">
                        {order.productTitle} — {order.packageName}
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-base font-bold text-white tabular-nums">
                        {order.currency} {order.amount.toLocaleString()}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-medium border ${
                          isUnlocked
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                            : order.status === 'Payment Under Review'
                            ? 'bg-blue-950/40 border-blue-500/40 text-blue-300'
                            : order.status === 'Cancelled'
                            ? 'bg-red-950/40 border-red-500/40 text-red-300'
                            : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Payment Verification Details & Receipt Submission */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-6 space-y-2 text-xs">
                      <div className="font-semibold text-slate-200">
                        Payment & Verification Details
                      </div>
                      <div className="text-slate-400">
                        Submitted Reference:{' '}
                        <span className="font-mono text-white">
                          {order.paymentReference || 'Not submitted yet'}
                        </span>
                      </div>
                      {order.receiptFileName && (
                        <div className="text-slate-400">
                          Receipt File:{' '}
                          <span className="font-mono text-slate-200">{order.receiptFileName}</span>
                        </div>
                      )}
                      {order.adminNotes && (
                        <div className="p-3 rounded-xl bg-[#0C0F18] border border-slate-800 text-slate-300">
                          <strong className="text-blue-400">Admin Note:</strong> {order.adminNotes}
                        </div>
                      )}

                      {canSubmitReceipt && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveReceiptOrderId(
                                activeReceiptOrderId === order.id ? null : order.id
                              );
                              setPaymentReference(order.paymentReference || '');
                              setReceiptNotes(order.receiptNotes || '');
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>
                              {order.paymentReference
                                ? 'Update Payment Reference / Receipt'
                                : 'Submit Payment Reference / Receipt'}
                            </span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Deliverables Section inside Order Card */}
                    <div className="lg:col-span-6 space-y-2.5">
                      <div className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                        <span>Order Deliverables ({order.deliverables.length} files)</span>
                        {isUnlocked ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Verified & Unlocked
                          </span>
                        ) : (
                          <span className="text-amber-300 flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5" /> Locked Pending Payment Verification
                          </span>
                        )}
                      </div>

                      <div className="space-y-2">
                        {order.deliverables.map((del) => (
                          <div
                            key={del.id}
                            className="p-3 rounded-xl bg-[#0C0F18] border border-slate-800 flex items-center justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <div className="text-xs font-medium text-white truncate">
                                {del.title}
                              </div>
                              <div className="text-[11px] font-mono text-slate-400 truncate">
                                {del.fileName} ({del.fileSize})
                              </div>
                            </div>

                            {isUnlocked ? (
                              <button
                                type="button"
                                onClick={() =>
                                  handleDownloadDeliverable(order.id, del.id, del.fileName)
                                }
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shrink-0"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download</span>
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono text-slate-500 bg-slate-900 border border-slate-800 rounded-lg shrink-0">
                                <Lock className="w-3 h-3" />
                                <span>Locked</span>
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Inline Receipt Upload Drawer */}
                  {activeReceiptOrderId === order.id && (
                    <form
                      onSubmit={(e) => handleReceiptSubmit(e, order.id)}
                      className="p-5 rounded-2xl bg-[#0C0F18] border border-blue-500/40 space-y-4 mt-4"
                    >
                      <div className="text-xs font-bold text-white">
                        Submit Payment Proof for Order {order.orderNumber} ({order.paymentMethod})
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {
                          settings.paymentMethods[
                            order.paymentMethod as keyof PlatformSettings['paymentMethods']
                          ]?.instructions
                        }
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-slate-300 mb-1">
                            Transaction ID (TID) / Reference *
                          </label>
                          <input
                            type="text"
                            required
                            value={paymentReference}
                            onChange={(e) => setPaymentReference(e.target.value)}
                            placeholder="Enter official transaction reference"
                            className="w-full px-3 py-2 text-xs font-mono bg-[#11141F] border border-slate-800 rounded-lg text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-300 mb-1">
                            Receipt Screenshot / PDF
                          </label>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setReceiptFileName(file.name);
                                const reader = new FileReader();
                                reader.onload = () => {
                                  if (typeof reader.result === 'string') {
                                    setReceiptDataUrl(reader.result.slice(0, 150000));
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="w-full text-xs text-slate-300"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">
                          Additional Payment Notes
                        </label>
                        <input
                          type="text"
                          value={receiptNotes}
                          onChange={(e) => setReceiptNotes(e.target.value)}
                          placeholder="Sender mobile wallet or bank account details"
                          className="w-full px-3 py-2 text-xs bg-[#11141F] border border-slate-800 rounded-lg text-white"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="submit"
                          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg"
                        >
                          Submit for Admin Verification
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveReceiptOrderId(null)}
                          className="px-3 py-2 text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: PURCHASED WEBSITE FILES & DELIVERY HISTORY */}
      {activeTab === 'downloads' && (
        <div className="space-y-6">
          {eligibleOrdersForDownload.length === 0 ? (
            <div className="p-12 rounded-2xl bg-[#11141F] border border-slate-800 text-center space-y-3">
              <Lock className="w-8 h-8 text-amber-400 mx-auto" />
              <div className="font-display text-lg font-bold text-white">
                No Verified Downloads Available Yet
              </div>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Deliverables unlock automatically in this section once your order payment has been
                verified and marked Paid or Delivered by an administrator.
              </p>
            </div>
          ) : (
            eligibleOrdersForDownload.map((order) => (
              <div
                key={order.id}
                className="p-6 rounded-2xl bg-[#11141F] border border-slate-800 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <div className="text-xs font-mono text-emerald-400">
                      Order {order.orderNumber} · Verified {order.status}
                    </div>
                    <h3 className="font-display text-lg font-bold text-white">
                      {order.productTitle} ({order.packageName})
                    </h3>
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    Verified At:{' '}
                    {order.verifiedByAdminAt
                      ? new Date(order.verifiedByAdminAt).toLocaleString()
                      : 'Verified'}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {order.deliverables.map((del) => (
                    <div
                      key={del.id}
                      className="p-4 rounded-xl bg-[#0C0F18] border border-slate-800 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <FileArchive className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-white truncate">
                            {del.title}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {del.description}
                          </div>
                          <div className="text-[11px] font-mono text-cyan-400 mt-0.5">
                            {del.fileName} · {del.fileSize}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleDownloadDeliverable(order.id, del.id, del.fileName)
                        }
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: CUSTOMER SUPPORT REQUESTS */}
      {activeTab === 'support' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form
            onSubmit={handleSupportSubmit}
            className="lg:col-span-5 p-6 rounded-2xl bg-[#11141F] border border-slate-800 space-y-4"
          >
            <h2 className="font-display text-lg font-bold text-white">
              Open a Support Ticket
            </h2>
            {supportFeedback && (
              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/40 text-xs text-blue-200">
                {supportFeedback}
              </div>
            )}
            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Related Order Number (Optional)
              </label>
              <select
                value={supportOrderNumber}
                onChange={(e) => setSupportOrderNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#0C0F18] border border-slate-800 rounded-xl text-white"
              >
                <option value="">General Account / Technical Support</option>
                {orders.map((o) => (
                  <option key={o.id} value={o.orderNumber}>
                    {o.orderNumber} — {o.productTitle}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">Subject *</label>
              <input
                type="text"
                required
                value={supportSubject}
                onChange={(e) => setSupportSubject(e.target.value)}
                placeholder="e.g., Question regarding database migration setup"
                className="w-full px-3.5 py-2.5 text-xs bg-[#0C0F18] border border-slate-800 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">Message *</label>
              <textarea
                rows={4}
                required
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                placeholder="Describe how our team can help..."
                className="w-full px-3.5 py-2.5 text-xs bg-[#0C0F18] border border-slate-800 rounded-xl text-white"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl"
            >
              Submit Support Request
            </button>
          </form>

          <div className="lg:col-span-7 space-y-4">
            <h2 className="font-display text-lg font-bold text-white">
              Your Inquiries & Support History
            </h2>
            {inquiries.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#11141F] border border-slate-800 text-xs text-slate-400">
                You have not submitted any support tickets or custom project inquiries yet.
              </div>
            ) : (
              inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="p-5 rounded-2xl bg-[#11141F] border border-slate-800 space-y-2.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-blue-400">
                      {inq.type.toUpperCase()} {inq.orderNumber ? `· Order ${inq.orderNumber}` : ''}
                    </span>
                    <span className="font-mono text-slate-400">{inq.status}</span>
                  </div>
                  <div className="text-sm font-bold text-white">{inq.subject}</div>
                  <p className="text-xs text-slate-300 leading-relaxed">{inq.message}</p>
                  {inq.adminReply && (
                    <div className="p-3.5 rounded-xl bg-[#0C0F18] border border-slate-800 text-xs text-slate-200">
                      <strong className="text-cyan-400">Markety Studio Response:</strong>{' '}
                      {inq.adminReply}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: PROFILE MANAGEMENT & PASSWORD RESET */}
      {activeTab === 'profile' && (
        <form
          onSubmit={handleProfileSave}
          className="max-w-xl p-6 sm:p-8 rounded-2xl bg-[#11141F] border border-slate-800 space-y-5"
        >
          <h2 className="font-display text-lg font-bold text-white">
            Profile Management & Security
          </h2>
          {profileFeedback && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-200">
              {profileFeedback}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#0C0F18] border border-slate-800 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">Phone / WhatsApp</label>
              <input
                type="tel"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#0C0F18] border border-slate-800 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">Company</label>
              <input
                type="text"
                value={profileCompany}
                onChange={(e) => setProfileCompany(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#0C0F18] border border-slate-800 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">Country</label>
              <input
                type="text"
                value={profileCountry}
                onChange={(e) => setProfileCountry(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#0C0F18] border border-slate-800 rounded-xl text-white"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <label className="block text-xs text-slate-300 mb-1 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-blue-400" />
              <span>Change Password (leave blank to keep current)</span>
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (minimum 6 characters)"
              className="w-full px-3.5 py-2.5 text-xs bg-[#0C0F18] border border-slate-800 rounded-xl text-white"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl"
          >
            Save Profile & Security Changes
          </button>
        </form>
      )}
    </div>
  );
};
