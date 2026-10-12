-- MARKETY STUDIO — POSTGRESQL / SUPABASE DATABASE SCHEMA
-- Run this migration in your PostgreSQL or Supabase SQL Editor for production deployment.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(160) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  phone VARCHAR(64),
  company VARCHAR(160),
  country VARCHAR(100) DEFAULT 'Pakistan',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(64) PRIMARY KEY,
  slug VARCHAR(160) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  category VARCHAR(100) NOT NULL,
  short_description TEXT NOT NULL,
  full_description TEXT NOT NULL,
  price_pkr INTEGER NOT NULL CHECK (price_pkr >= 0),
  price_usd INTEGER NOT NULL CHECK (price_usd >= 0),
  original_currency VARCHAR(8) NOT NULL DEFAULT 'PKR' CHECK (original_currency IN ('PKR', 'USD')),
  discount_percentage INTEGER NOT NULL DEFAULT 0,
  thumbnail_url TEXT NOT NULL,
  gallery_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  live_demo_url TEXT NOT NULL,
  technologies JSONB NOT NULL DEFAULT '[]'::jsonb,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  responsive_design VARCHAR(160) NOT NULL DEFAULT 'Mobile, Tablet, Laptop & 4K Desktop',
  source_code_included BOOLEAN NOT NULL DEFAULT TRUE,
  backend_requirements TEXT NOT NULL,
  hosting_requirements TEXT NOT NULL,
  customization_options TEXT NOT NULL,
  delivery_format TEXT NOT NULL,
  estimated_delivery_time VARCHAR(120) NOT NULL,
  packages JSONB NOT NULL DEFAULT '{}'::jsonb,
  deliverables JSONB NOT NULL DEFAULT '[]'::jsonb,
  faqs JSONB NOT NULL DEFAULT '[]'::jsonb,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_sample BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(64) PRIMARY KEY,
  order_number VARCHAR(64) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  customer_name VARCHAR(160) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(64) NOT NULL,
  customer_company VARCHAR(160),
  customer_country VARCHAR(100) NOT NULL,
  billing_notes TEXT,
  product_id VARCHAR(64) NOT NULL REFERENCES products(id),
  product_title VARCHAR(200) NOT NULL,
  package_tier VARCHAR(32) NOT NULL CHECK (package_tier IN ('starter', 'professional', 'custom')),
  package_name VARCHAR(100) NOT NULL,
  currency VARCHAR(8) NOT NULL CHECK (currency IN ('PKR', 'USD')),
  amount NUMERIC(12, 2) NOT NULL,
  payment_method VARCHAR(64) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'Pending Payment'
    CHECK (status IN ('Pending Payment', 'Payment Under Review', 'Paid', 'Processing', 'Delivered', 'Cancelled')),
  payment_reference VARCHAR(200),
  receipt_file_name VARCHAR(255),
  receipt_notes TEXT,
  receipt_submitted_at TIMESTAMPTZ,
  verified_by_admin_at TIMESTAMPTZ,
  admin_notes TEXT,
  deliverables JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(32) NOT NULL CHECK (type IN ('general', 'custom_project', 'support')),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(160) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(64),
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  budget VARCHAR(100),
  website_type VARCHAR(100),
  required_features TEXT,
  deadline VARCHAR(100),
  order_number VARCHAR(64),
  status VARCHAR(32) NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'In Progress', 'Resolved')),
  admin_reply TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id VARCHAR(64) NOT NULL,
  actor_email VARCHAR(255) NOT NULL,
  action VARCHAR(160) NOT NULL,
  target_type VARCHAR(64) NOT NULL,
  target_id VARCHAR(120) NOT NULL,
  details TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
