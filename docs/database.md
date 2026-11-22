# STONCROPS Database Documentation

## 1. Schema Entities

1. `products`: Core product metadata, editorial copy, materials, and pricing.
2. `product_variants`: Size variations (S, M, L) mapped to unique SKUs.
3. `product_images`: Managed image gallery with sort order and primary flag.
4. `inventory`: Atomic stock counts per variant (`available_stock`, `reserved_stock`, `sold_stock`).
5. `inventory_reservations`: Concurrency-safe hold records during checkout flow with TTL expiry.
6. `orders`: Customer orders, addresses, Razorpay IDs, and fulfillment statuses.
7. `order_items`: Line items linking variant, size, quantity, and price.
8. `customers`: Directory of customers aggregated across purchase history.
9. `reviews`: Customer reviews requiring admin moderation prior to public display.
10. `admin_users`: Authenticated team members mapped to role permissions.
11. `admin_roles`: Role definitions (`super_admin`, `manager`, `support`).
12. `analytics_events`: First-party telemetry tracking user actions through the funnel.
13. `sessions`: Client heartbeat tracking for accurate live-visitor monitoring.
14. `notifications`: Asynchronous delivery log for WhatsApp and Email notifications.
15. `coupons`: Promotional discount codes.
16. `audit_logs`: Immutable trail of administrative actions.
17. `store_settings`: Dynamic store configuration (banners, hero copy, contact info).

## 2. Concurrency Safety & Anti-Overselling Strategy

High-demand drops can produce dozens of simultaneous checkout attempts within the same second. STONCROPS implements atomic row-level locking via PostgreSQL:

```sql
SELECT available_stock FROM public.inventory WHERE variant_id = p_variant_id FOR UPDATE;
```

This guarantees that:
- Available stock is decremented and reserved during the checkout initiation.
- Overselling is mathematically impossible even under intense concurrent load.
- If checkout is abandoned or times out, `release_expired_reservations()` restores the stock to `available_stock`.
- On verified payment success, `commit_order_stock()` atomically transfers reserved inventory into `sold_stock`.
