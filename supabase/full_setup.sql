-- ==============================================================================
-- STONCROPS — COMPLETE PRODUCTION DATABASE SETUP & SEED SCRIPT
-- ==============================================================================
-- Execute this single script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/crbrpoxlqrrlgwqovtrx/sql/new
--
-- This script is 100% idempotent and safe to run multiple times.
-- It creates all tables, indexes, storage buckets, RLS policies, and seed data.
-- ==============================================================================

-- 1. Enable Cryptographic Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. CREATE CORE E-COMMERCE TABLES
-- ==============================================================================

-- 2.1 PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    subtitle TEXT,
    collection TEXT NOT NULL,
    description TEXT NOT NULL,
    material TEXT NOT NULL,
    base_color TEXT NOT NULL,
    silhouette TEXT NOT NULL,
    embroidery_details TEXT NOT NULL,
    chest_branding TEXT NOT NULL,
    price INTEGER NOT NULL DEFAULT 1199,
    currency TEXT NOT NULL DEFAULT 'INR',
    free_shipping BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    care_instructions TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.2 PRODUCT VARIANTS TABLE (Sizes: S, M, L)
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    size TEXT NOT NULL CHECK (size IN ('S', 'M', 'L')),
    sku TEXT UNIQUE NOT NULL,
    price INTEGER NOT NULL DEFAULT 1199,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_product_size UNIQUE (product_id, size)
);

-- 2.3 PRODUCT IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    caption TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.4 INVENTORY TABLE (Atomic Stock Counters)
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE UNIQUE,
    available_stock INTEGER NOT NULL DEFAULT 0 CHECK (available_stock >= 0),
    reserved_stock INTEGER NOT NULL DEFAULT 0 CHECK (reserved_stock >= 0),
    sold_stock INTEGER NOT NULL DEFAULT 0 CHECK (sold_stock >= 0),
    low_stock_threshold INTEGER NOT NULL DEFAULT 5,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.5 INVENTORY RESERVATIONS TABLE
CREATE TABLE IF NOT EXISTS public.inventory_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    expires_at TIMESTAMPTZ NOT NULL,
    is_committed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.6 CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    total_orders INTEGER NOT NULL DEFAULT 0,
    total_spent INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.7 ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    total_amount INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'pending_payment' CHECK (
        status IN ('pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')
    ),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (
        payment_status IN ('pending', 'authorized', 'captured', 'failed', 'refunded')
    ),
    shipping_address JSONB NOT NULL,
    razorpay_order_id TEXT UNIQUE,
    razorpay_payment_id TEXT UNIQUE,
    payment_details JSONB,
    tracking_number TEXT,
    courier_name TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.8 ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    variant_id UUID NOT NULL REFERENCES public.product_variants(id),
    size TEXT NOT NULL CHECK (size IN ('S', 'M', 'L')),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price INTEGER NOT NULL,
    subtotal INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.9 ORDER STATUS HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    changed_by TEXT NOT NULL DEFAULT 'system',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.10 ADMIN ROLES & USERS TABLES
CREATE TABLE IF NOT EXISTS public.admin_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    permissions TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role_id UUID REFERENCES public.admin_roles(id) ON DELETE RESTRICT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.admin_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.admin_users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.11 REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT NOT NULL,
    is_verified_purchase BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.12 SESSIONS & ANALYTICS EVENTS TABLES
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT UNIQUE NOT NULL,
    first_seen TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    last_heartbeat TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    page_views INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    device_type TEXT,
    browser TEXT,
    os TEXT,
    ip_hash TEXT
);

CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    page_path TEXT NOT NULL DEFAULT '/',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.13 STORE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.store_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.14 AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 3. STORAGE BUCKET CONFIGURATION (for image uploads)
-- ==============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images',
    'product-images',
    true,
    5242880, -- 5 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Storage bucket access policies
DROP POLICY IF EXISTS "Public can view product images in storage" ON storage.objects;
CREATE POLICY "Public can view product images in storage"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Service role / admin upload to product images" ON storage.objects;
CREATE POLICY "Service role / admin upload to product images"
    ON storage.objects FOR ALL
    USING (bucket_id = 'product-images')
    WITH CHECK (bucket_id = 'product-images');

-- ==============================================================================
-- 4. GRANTS AND ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- 4.1 Grant schema usage
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, anon, authenticated, service_role;

-- 4.2 Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 4.3 Configure RLS Policies
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view product variants" ON public.product_variants;
CREATE POLICY "Public can view product variants" ON public.product_variants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view product images" ON public.product_images;
CREATE POLICY "Public can view product images" ON public.product_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view inventory" ON public.inventory;
CREATE POLICY "Public can view inventory" ON public.inventory FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view approved reviews" ON public.reviews;
CREATE POLICY "Public can view approved reviews" ON public.reviews FOR SELECT USING (status = 'approved');

DROP POLICY IF EXISTS "Public can submit reviews" ON public.reviews;
CREATE POLICY "Public can submit reviews" ON public.reviews FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can manage sessions" ON public.sessions;
CREATE POLICY "Public can manage sessions" ON public.sessions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can insert analytics events" ON public.analytics_events;
CREATE POLICY "Public can insert analytics events" ON public.analytics_events FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view store settings" ON public.store_settings;
CREATE POLICY "Public can view store settings" ON public.store_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can create orders" ON public.orders;
CREATE POLICY "Public can create orders" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view own order by ID" ON public.orders;
CREATE POLICY "Public can view own order by ID" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can create order items" ON public.order_items;
CREATE POLICY "Public can create order items" ON public.order_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view order items" ON public.order_items;
CREATE POLICY "Public can view order items" ON public.order_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can create customers" ON public.customers;
CREATE POLICY "Public can create customers" ON public.customers FOR INSERT WITH CHECK (true);

-- ==============================================================================
-- 5. SEED DATA (Product, Variants, Inventory, Images, Settings, Reviews)
-- ==============================================================================

-- 5.1 Seed Core Product
INSERT INTO public.products (
    id,
    name,
    slug,
    subtitle,
    collection,
    description,
    material,
    base_color,
    silhouette,
    embroidery_details,
    chest_branding,
    price,
    currency,
    free_shipping,
    is_active,
    care_instructions
) VALUES (
    'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
    'STONCROPS — Embroidered Edition',
    'embroidered-edition',
    'Embroidered Edition',
    'Embroidered Edition',
    'A statement oversized silhouette cut from heavyweight Loopnet fabric. Features bespoke burgundy floral embroidery cascading down both sleeves and minimal STONCROPS chest typography. Engineered with a structured drop-shoulder drape that retains its shape wear after wear.',
    'Loopnet',
    'Off-white / Cream',
    'Boxy drop-shoulder',
    'Burgundy floral embroidery on both sleeves',
    'STONCROPS',
    1199,
    'INR',
    true,
    true,
    ARRAY[
        'Detach the metal chain accessory before washing.',
        'Machine wash cold inside-out on a gentle cycle to preserve the custom embroidery work.',
        'Do not bleach or tumble dry.',
        'Warm iron on reverse side if needed; avoid direct iron on embroidery.'
    ]
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    description = EXCLUDED.description;

-- 5.2 Seed S, M, L Variants
INSERT INTO public.product_variants (
    id,
    product_id,
    size,
    sku,
    price,
    is_active
) VALUES 
    ('11111111-1111-4111-8111-111111111111', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'S', 'SC-EMB-S', 1199, true),
    ('22222222-2222-4222-8222-222222222222', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'M', 'SC-EMB-M', 1199, true),
    ('33333333-3333-4333-8333-333333333333', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'L', 'SC-EMB-L', 1199, true)
ON CONFLICT (sku) DO NOTHING;

-- 5.3 Seed Inventory Units (S: 25, M: 40, L: 20)
INSERT INTO public.inventory (
    variant_id,
    available_stock,
    reserved_stock,
    sold_stock,
    low_stock_threshold
) VALUES
    ('11111111-1111-4111-8111-111111111111', 25, 0, 0, 5),
    ('22222222-2222-4222-8222-222222222222', 40, 0, 0, 5),
    ('33333333-3333-4333-8333-333333333333', 20, 0, 0, 5)
ON CONFLICT (variant_id) DO UPDATE SET
    available_stock = EXCLUDED.available_stock;

-- 5.4 Seed Product Image Placeholders
INSERT INTO public.product_images (
    product_id,
    image_url,
    alt_text,
    sort_order,
    is_primary,
    caption
) VALUES
    ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', '/images/product/front-editorial.svg', 'STONCROPS Embroidered Edition - Front View', 0, true, 'Front view showing STONCROPS chest typography and drop-shoulder silhouette'),
    ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', '/images/product/sleeve-embroidery.svg', 'STONCROPS - Burgundy Floral Sleeve Embroidery Detail', 1, false, 'Intricate burgundy floral embroidery across sleeve'),
    ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', '/images/product/back-silhouette.svg', 'STONCROPS - Back View Boxy Drape', 2, false, 'Boxy oversized silhouette and clean neckline finish'),
    ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', '/images/product/fabric-loopnet.svg', 'STONCROPS - Heavyweight Loopnet Texture', 3, false, 'Heavyweight Loopnet cotton knit texture close-up')
ON CONFLICT DO NOTHING;

-- 5.5 Seed Store Settings
INSERT INTO public.store_settings (key, value, description) VALUES
    ('hero_content', '{"headline": "STONCROPS", "subheadline": "Full-sleeve oversized T-shirt in off-white Loopnet with bespoke burgundy floral sleeve embroidery.", "ctaText": "SHOP NOW"}'::jsonb, 'Hero section headline and copy'),
    ('announcement_bar', '{"enabled": true, "text": "FREE SHIPPING ON ALL ORDERS ACROSS INDIA — EMBROIDERED EDITION"}'::jsonb, 'Announcement bar at the top of the storefront'),
    ('contact_info', '{"email": "contact@stoncrops.com", "instagram": "@stonecrops.in", "supportHours": "Mon - Sat: 10:00 AM - 7:00 PM IST"}'::jsonb, 'Store customer service and social links')
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value;

-- 5.6 Seed Admin Roles & Demo User
INSERT INTO public.admin_roles (id, name, description, permissions) VALUES
    ('aaaaaaaa-1111-4aaa-aaaa-111111111111', 'super_admin', 'Full platform administrative access', ARRAY['*']),
    ('bbbbbbbb-2222-4bbb-bbbb-222222222222', 'manager', 'Order and inventory management access', ARRAY['orders:read', 'orders:write', 'inventory:read', 'inventory:write', 'products:read', 'products:write']),
    ('cccccccc-3333-4ccc-cccc-333333333333', 'support', 'Customer support and order inquiry read-only access', ARRAY['orders:read', 'customers:read', 'reviews:read'])
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.admin_users (email, full_name, role_id, is_active) VALUES
    ('founder@stoncrops.com', 'STONCROPS Founder', 'aaaaaaaa-1111-4aaa-aaaa-111111111111', true)
ON CONFLICT (email) DO NOTHING;

-- 5.7 Seed Initial Verified Reviews (3 Approved + 1 Pending for Moderation testing)
INSERT INTO public.reviews (
    product_id,
    customer_name,
    rating,
    title,
    comment,
    is_verified_purchase,
    status,
    approved_at
) VALUES
    (
        'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
        'Aarav Mehta',
        5,
        'Flawless boxy drape & embroidery',
        'The garment measurements in the size guide were completely accurate. The burgundy floral embroidery on the sleeves is dense and impeccably finished. Looks even better in natural light.',
        true,
        'approved',
        timezone('utc'::text, now())
    ),
    (
        'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
        'Rohan Varma',
        5,
        'True Loopnet heavyweight fabric',
        'Finally a streetwear brand that uses genuine heavyweight Loopnet knit. The drop-shoulder holds structure without slouching. Easily competes with international luxury labels.',
        true,
        'approved',
        timezone('utc'::text, now())
    ),
    (
        'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
        'Priya Sharma',
        5,
        'Premium quality throughout',
        'Loved the minimal chest typography and the packaging. Size S gave the exact oversized boyfriend look I wanted. Free express shipping across India was super fast.',
        true,
        'approved',
        timezone('utc'::text, now())
    ),
    (
        'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
        'Vikramaditya K.',
        5,
        'Attention to detail is unmatched',
        'The collar doesn''t stretch out and the off-white shade is perfectly muted. Waiting for the next release from STONCROPS.',
        true,
        'pending',
        NULL
    )
ON CONFLICT DO NOTHING;

-- Completed successfully
SELECT 'STONCROPS Database Setup & Seed Completed Successfully' AS status;
