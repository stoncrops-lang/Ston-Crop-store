-- STONCROPS Initial Database Seed
-- drop-01-embroidered-edition

-- 1. Insert Core Product
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
) ON CONFLICT (slug) DO NOTHING;

-- 2. Insert Variants (S, M, L)
INSERT INTO public.product_variants (
    id,
    product_id,
    size,
    sku,
    price,
    is_active
) VALUES 
    ('11111111-1111-4111-8111-111111111111', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'S', 'SC-D01-S', 1199, true),
    ('22222222-2222-4222-8222-222222222222', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'M', 'SC-D01-M', 1199, true),
    ('33333333-3333-4333-8333-333333333333', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'L', 'SC-D01-L', 1199, true)
ON CONFLICT (sku) DO NOTHING;

-- 3. Insert Initial Inventory (Editable by Owner in Admin)
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
ON CONFLICT (variant_id) DO NOTHING;

-- 4. Insert Product Images Placeholders (Easily replaceable via Admin UI)
INSERT INTO public.product_images (
    product_id,
    image_url,
    alt_text,
    sort_order,
    is_primary,
    caption
) VALUES
    ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', '/images/product/front-editorial.webp', 'STONCROPS Embroidered Edition - Front View', 0, true, 'Front view showing STONCROPS chest typography and drop-shoulder silhouette'),
    ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', '/images/product/sleeve-embroidery.webp', 'STONCROPS - Burgundy Floral Sleeve Embroidery Detail', 1, false, 'Intricate burgundy floral embroidery across sleeve'),
    ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', '/images/product/back-silhouette.webp', 'STONCROPS - Back View Boxy Drape', 2, false, 'Boxy oversized silhouette and neckline finish'),
    ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', '/images/product/fabric-loopnet.webp', 'STONCROPS - Heavyweight Loopnet Texture', 3, false, 'Heavyweight Loopnet cotton knit texture close-up')
ON CONFLICT DO NOTHING;

-- 5. Insert Admin Roles
INSERT INTO public.admin_roles (id, name, description, permissions) VALUES
    ('aaaaaaaa-1111-4aaa-aaaa-111111111111', 'super_admin', 'Full platform administrative access', ARRAY['*']),
    ('bbbbbbbb-2222-4bbb-bbbb-222222222222', 'manager', 'Order and inventory management access', ARRAY['orders:read', 'orders:write', 'inventory:read', 'inventory:write', 'products:read', 'products:write']),
    ('cccccccc-3333-4ccc-cccc-333333333333', 'support', 'Customer support and order inquiry read-only access', ARRAY['orders:read', 'customers:read', 'reviews:read'])
ON CONFLICT (name) DO NOTHING;

-- 6. Insert Default Store Settings
INSERT INTO public.store_settings (key, value, description) VALUES
    ('hero_content', '{"headline": "EMBROIDERED EDITION", "subheadline": "Full-sleeve oversized T-shirt in off-white Loopnet with bespoke burgundy floral sleeve embroidery.", "ctaText": "SHOP NOW"}'::jsonb, 'Hero section headline and copy'),
    ('announcement_bar', '{"enabled": true, "text": "FREE SHIPPING ON ALL ORDERS ACROSS INDIA — EMBROIDERED EDITION"}'::jsonb, 'Announcement bar at the top of the storefront'),
    ('contact_info', '{"email": "contact@stoncrops.com", "instagram": "@stonecrops.in", "supportHours": "Mon - Sat: 10:00 AM - 7:00 PM IST"}'::jsonb, 'Store customer service and social links')
ON CONFLICT (key) DO NOTHING;
