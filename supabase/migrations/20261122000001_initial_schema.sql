-- STONCROPS Initial Database Schema
-- Production-ready PostgreSQL schema with Row Level Security (RLS)

-- 1. Enable pgcrypto for UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. PRODUCTS
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

-- 3. PRODUCT VARIANTS (Sizes S, M, L)
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

-- 4. PRODUCT IMAGES
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

-- 5. INVENTORY
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE UNIQUE,
    available_stock INTEGER NOT NULL DEFAULT 0 CHECK (available_stock >= 0),
    reserved_stock INTEGER NOT NULL DEFAULT 0 CHECK (reserved_stock >= 0),
    sold_stock INTEGER NOT NULL DEFAULT 0 CHECK (sold_stock >= 0),
    low_stock_threshold INTEGER NOT NULL DEFAULT 5,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. INVENTORY RESERVATIONS (for concurrency safety)
CREATE TABLE IF NOT EXISTS public.inventory_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    expires_at TIMESTAMPTZ NOT NULL,
    is_committed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. CUSTOMERS
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

-- 8. ORDERS
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
    razorpay_payment_id TEXT,
    notes TEXT,
    order_token TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES public.product_variants(id),
    product_name TEXT NOT NULL,
    size TEXT NOT NULL CHECK (size IN ('S', 'M', 'L')),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price INTEGER NOT NULL,
    total_price INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. PAYMENT TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    razorpay_order_id TEXT NOT NULL,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    amount INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'created',
    payment_method TEXT,
    error_code TEXT,
    error_description TEXT,
    raw_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. REVIEWS
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT NOT NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    is_verified_purchase BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 12. ADMIN ROLES
CREATE TABLE IF NOT EXISTS public.admin_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL CHECK (name IN ('super_admin', 'manager', 'support')),
    description TEXT NOT NULL,
    permissions TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 13. ADMIN USERS
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role_id UUID NOT NULL REFERENCES public.admin_roles(id),
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 14. ANALYTICS EVENTS
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    page_path TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 15. SESSIONS (With Heartbeat for Accurate Live Visitors)
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_token TEXT UNIQUE NOT NULL,
    ip_hash TEXT,
    user_agent TEXT,
    last_heartbeat TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 16. NOTIFICATIONS LOG
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('whatsapp', 'email')),
    recipient TEXT NOT NULL,
    payload JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    attempts INTEGER NOT NULL DEFAULT 0,
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 17. COUPONS
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value INTEGER NOT NULL CHECK (discount_value > 0),
    min_order_amount INTEGER NOT NULL DEFAULT 0,
    max_uses INTEGER,
    current_uses INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 18. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 19. STORE SETTINGS
CREATE TABLE IF NOT EXISTS public.store_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_variant_id ON public.inventory(variant_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON public.orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id_status ON public.reviews(product_id, status);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_last_heartbeat ON public.sessions(last_heartbeat);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current auth user is an active admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE auth_user_id = auth.uid()
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Products: Public can read active products. Admins have full access.
CREATE POLICY "Public can view active products"
    ON public.products FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admins have full access to products"
    ON public.products FOR ALL
    USING (public.is_admin());

-- 2. Product Variants: Public can read active variants. Admins have full access.
CREATE POLICY "Public can view active variants"
    ON public.product_variants FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admins have full access to variants"
    ON public.product_variants FOR ALL
    USING (public.is_admin());

-- 3. Product Images: Public can view images. Admins have full access.
CREATE POLICY "Public can view product images"
    ON public.product_images FOR SELECT
    USING (true);

CREATE POLICY "Admins have full access to product images"
    ON public.product_images FOR ALL
    USING (public.is_admin());

-- 4. Inventory: Public can only check availability (read). Modifications strictly restricted to admin or service role functions.
CREATE POLICY "Public can view inventory availability"
    ON public.inventory FOR SELECT
    USING (true);

CREATE POLICY "Admins have full access to inventory"
    ON public.inventory FOR ALL
    USING (public.is_admin());

-- 5. Reviews: Public can view only approved reviews. Public can insert new review (defaulting to pending). Admins have full access.
CREATE POLICY "Public can view approved reviews"
    ON public.reviews FOR SELECT
    USING (status = 'approved');

CREATE POLICY "Public can submit reviews"
    ON public.reviews FOR INSERT
    WITH CHECK (status = 'pending');

CREATE POLICY "Admins have full access to reviews"
    ON public.reviews FOR ALL
    USING (public.is_admin());

-- 6. Store Settings: Public can read store settings. Admins have full access.
CREATE POLICY "Public can view store settings"
    ON public.store_settings FOR SELECT
    USING (true);

CREATE POLICY "Admins have full access to store settings"
    ON public.store_settings FOR ALL
    USING (public.is_admin());

-- 7. Analytics & Sessions: Public can insert events and maintain heartbeat. Admins can view.
CREATE POLICY "Public can log analytics"
    ON public.analytics_events FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can view analytics"
    ON public.analytics_events FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Public can create and update sessions"
    ON public.sessions FOR ALL
    USING (true);

-- 8. Orders & Customers & Payments & Audit: Strictly protected. Public has zero direct read access; accessed via server-side service role with order token verification.
CREATE POLICY "Admins have full access to orders"
    ON public.orders FOR ALL
    USING (public.is_admin());

CREATE POLICY "Admins have full access to order items"
    ON public.order_items FOR ALL
    USING (public.is_admin());

CREATE POLICY "Admins have full access to customers"
    ON public.customers FOR ALL
    USING (public.is_admin());

CREATE POLICY "Admins have full access to payment transactions"
    ON public.payment_transactions FOR ALL
    USING (public.is_admin());

CREATE POLICY "Admins have full access to audit logs"
    ON public.audit_logs FOR ALL
    USING (public.is_admin());

CREATE POLICY "Admins have full access to notifications"
    ON public.notifications FOR ALL
    USING (public.is_admin());

-- ==========================================
-- CONCURRENCY-SAFE ATOMIC FUNCTIONS
-- ==========================================

-- Atomic Stock Reservation Function
CREATE OR REPLACE FUNCTION public.reserve_stock(
    p_variant_id UUID,
    p_quantity INTEGER,
    p_session_id TEXT,
    p_hold_seconds INTEGER DEFAULT 600
)
RETURNS JSONB AS $$
DECLARE
    v_available INTEGER;
    v_reservation_id UUID;
BEGIN
    -- Acquire exclusive row lock on the inventory row
    SELECT available_stock INTO v_available
    FROM public.inventory
    WHERE variant_id = p_variant_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Variant inventory not found');
    END IF;

    IF v_available < p_quantity THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient stock available');
    END IF;

    -- Deduct from available and add to reserved
    UPDATE public.inventory
    SET available_stock = available_stock - p_quantity,
        reserved_stock = reserved_stock + p_quantity,
        updated_at = now()
    WHERE variant_id = p_variant_id;

    -- Record reservation
    INSERT INTO public.inventory_reservations (
        variant_id,
        session_id,
        quantity,
        expires_at
    ) VALUES (
        p_variant_id,
        p_session_id,
        p_quantity,
        now() + (p_hold_seconds || ' seconds')::INTERVAL
    ) RETURNING id INTO v_reservation_id;

    RETURN jsonb_build_object(
        'success', true,
        'reservation_id', v_reservation_id,
        'expires_at', now() + (p_hold_seconds || ' seconds')::INTERVAL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Complete Order & Commit Inventory (called after Razorpay signature verification)
CREATE OR REPLACE FUNCTION public.commit_order_stock(
    p_order_id UUID,
    p_razorpay_payment_id TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_item RECORD;
BEGIN
    -- Lock order row
    UPDATE public.orders
    SET status = 'paid',
        payment_status = 'captured',
        razorpay_payment_id = p_razorpay_payment_id,
        updated_at = now()
    WHERE id = p_order_id;

    -- Move reserved stock to sold stock for each order item
    FOR v_item IN
        SELECT variant_id, quantity
        FROM public.order_items
        WHERE order_id = p_order_id
    LOOP
        UPDATE public.inventory
        SET reserved_stock = GREATEST(0, reserved_stock - v_item.quantity),
            sold_stock = sold_stock + v_item.quantity,
            updated_at = now()
        WHERE variant_id = v_item.variant_id;
    END LOOP;

    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup expired stock reservations
CREATE OR REPLACE FUNCTION public.release_expired_reservations()
RETURNS INTEGER AS $$
DECLARE
    v_expired RECORD;
    v_released_count INTEGER := 0;
BEGIN
    FOR v_expired IN
        SELECT id, variant_id, quantity
        FROM public.inventory_reservations
        WHERE expires_at < now()
        AND is_committed = false
        FOR UPDATE
    LOOP
        -- Return reserved stock to available stock
        UPDATE public.inventory
        SET available_stock = available_stock + v_expired.quantity,
            reserved_stock = GREATEST(0, reserved_stock - v_expired.quantity),
            updated_at = now()
        WHERE variant_id = v_expired.variant_id;

        -- Remove reservation
        DELETE FROM public.inventory_reservations WHERE id = v_expired.id;
        v_released_count := v_released_count + 1;
    END LOOP;

    RETURN v_released_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
