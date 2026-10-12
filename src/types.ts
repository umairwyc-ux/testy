export type CurrencyCode = 'PKR' | 'USD';

export type WebsiteCategory =
  | 'Ecommerce Websites'
  | 'Business Websites'
  | 'Portfolio Websites'
  | 'Landing Pages'
  | 'AI Web Applications'
  | 'Agency Websites'
  | 'Restaurant Websites'
  | 'SaaS Websites'
  | 'Custom Website Projects';

export const WEBSITE_CATEGORIES: WebsiteCategory[] = [
  'Ecommerce Websites',
  'Business Websites',
  'Portfolio Websites',
  'Landing Pages',
  'AI Web Applications',
  'Agency Websites',
  'Restaurant Websites',
  'SaaS Websites',
  'Custom Website Projects',
];

export type PackageTierKey = 'starter' | 'professional' | 'custom';

export interface PackageConfig {
  enabled: boolean;
  name: string;
  pricePKR: number;
  priceUSD: number;
  isCustomQuote?: boolean;
  deliveryTime: string;
  summary: string;
  includedItems: string[];
}

export interface ProductDeliverable {
  id: string;
  title: string;
  fileName: string;
  fileType: 'source_zip' | 'setup_docs' | 'deployment_guide' | 'db_schema' | 'env_example';
  fileSize: string;
  description: string;
  minPackage: PackageTierKey;
}

export interface ProductFAQ {
  question: string;
  answer: string;
}

export interface WebsiteProduct {
  id: string;
  slug: string;
  title: string;
  category: WebsiteCategory;
  shortDescription: string;
  fullDescription: string;
  pricePKR: number;
  priceUSD: number;
  originalCurrency: CurrencyCode;
  discountPercentage: number;
  thumbnailUrl: string;
  galleryUrls: string[];
  liveDemoUrl: string;
  technologies: string[];
  features: string[];
  responsiveDesign: string;
  sourceCodeIncluded: boolean;
  backendRequirements: string;
  hostingRequirements: string;
  customizationOptions: string;
  deliveryFormat: string;
  estimatedDeliveryTime: string;
  packages: {
    starter: PackageConfig;
    professional: PackageConfig;
    custom: PackageConfig;
  };
  deliverables: ProductDeliverable[];
  faqs: ProductFAQ[];
  published: boolean;
  featured: boolean;
  isSample: boolean;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | 'Pending Payment'
  | 'Payment Under Review'
  | 'Paid'
  | 'Processing'
  | 'Delivered'
  | 'Cancelled';

export type PaymentMethodType =
  | 'JazzCash'
  | 'Easypaisa'
  | 'Bank Transfer'
  | 'International Payment Gateway';

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCompany?: string;
  customerCountry: string;
  billingNotes?: string;
  productId: string;
  productSlug: string;
  productTitle: string;
  productThumbnail: string;
  packageTier: PackageTierKey;
  packageName: string;
  currency: CurrencyCode;
  amount: number;
  paymentMethod: PaymentMethodType;
  status: OrderStatus;
  paymentReference?: string;
  receiptFileName?: string;
  receiptDataUrl?: string;
  receiptNotes?: string;
  receiptSubmittedAt?: string;
  verifiedByAdminAt?: string;
  adminNotes?: string;
  deliverables: ProductDeliverable[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  phone?: string;
  company?: string;
  country: string;
  createdAt: string;
}

export interface Inquiry {
  id: string;
  type: 'general' | 'custom_project' | 'support';
  userId?: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  budget?: string;
  websiteType?: string;
  requiredFeatures?: string;
  deadline?: string;
  orderNumber?: string;
  status: 'New' | 'In Progress' | 'Resolved';
  adminReply?: string;
  createdAt: string;
}

export interface PaymentMethodSetting {
  enabled: boolean;
  title: string;
  accountTitle: string;
  accountNumber: string;
  bankName?: string;
  iban?: string;
  instructions: string;
}

export interface PlatformSettings {
  brandName: string;
  tagline: string;
  heroHeadline: string;
  heroSubheadline: string;
  whatsappNumber: string;
  businessEmail: string;
  supportHours: string;
  officeLocation: string;
  usdToPkrRate: number;
  socialLinks: {
    linkedin: string;
    github: string;
    twitter: string;
    instagram: string;
  };
  paymentMethods: {
    JazzCash: PaymentMethodSetting;
    Easypaisa: PaymentMethodSetting;
    'Bank Transfer': PaymentMethodSetting;
    'International Payment Gateway': PaymentMethodSetting;
  };
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorEmail: string;
  action: string;
  targetType: 'product' | 'order' | 'settings' | 'inquiry' | 'auth';
  targetId: string;
  details: string;
  createdAt: string;
}
