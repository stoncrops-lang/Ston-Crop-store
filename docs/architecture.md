# STONCROPS System Architecture

## 1. High-Level Overview

STONCROPS is engineered as a high-performance, single-product e-commerce platform for high-traffic drop releases. The architecture separates customer shopping traffic from back-office administrative workflows while maintaining unified data consistency through Supabase and PostgreSQL.

```
                           +------------------------+
                           |    Cloudflare DNS &    |
                           |     WAF / Bot Guard    |
                           +-----------+------------+
                                       |
                   +-------------------+-------------------+
                   |                                       |
                   v                                       v
        +----------------------+                +----------------------+
        |   Customer Store     |                |   Admin Dashboard    |
        |   (stoncrops.com)    |                | (admin.stoncrops.com)|
        |  Next.js App Router  |                |  Next.js App Router  |
        +----------+-----------+                +----------+-----------+
                   |                                       |
                   |  (Public APIs / RLS)                  |  (Auth + MFA + RLS)
                   +-------------------+-------------------+
                                       |
                                       v
                        +------------------------------+
                        |     Supabase Backend         |
                        |  - PostgreSQL with RLS       |
                        |  - Atomic Stock Functions    |
                        |  - Supabase Storage (Images) |
                        |  - Supabase Auth (Admin)     |
                        +--------------+---------------+
                                       |
                   +-------------------+-------------------+
                   |                                       |
                   v                                       v
        +----------------------+                +----------------------+
        |   Razorpay Gateway   |                | Notifications Queue  |
        | - Order Creation     |                | - WhatsApp Cloud API |
        | - UPI Verification   |                | - Resend Email API   |
        | - Webhook Handling   |                | - Async & Resilient  |
        +----------------------+                +----------------------+
```

## 2. Monorepo Structure

- **apps/storefront**: Single-page conversion-focused storefront with instant cart drawer, size modal, and Razorpay checkout.
- **apps/admin**: Separate secured PWA management dashboard with live metrics, inventory matrix, order fulfillment, review moderation, and image manager.
- **packages/shared**: Shared business logic, database client, Zod schemas, Razorpay signing, and notification dispatchers.
- **packages/types**: Common TypeScript definitions and data models.
- **supabase/**: PostgreSQL schema migrations, RLS policies, atomic functions, and database seeds.

## 3. Order & Payment State Flow

```
1. Customer Selects Size (S, M, or L)
2. Atomic Stock Pre-check / Session Hold (reserve_stock RPC)
3. POST /api/checkout/create-razorpay-order
   --> Creates Razorpay Order on server
   --> Records pending order in database
4. Customer Completes UPI Payment in Razorpay Modal
5. POST /api/checkout/verify-payment
   --> Timing-safe HMAC-SHA256 signature verification
   --> PostgreSQL atomic commit_order_stock RPC (moves reserved -> sold)
   --> Returns Order Confirmation to customer
6. Asynchronous Notification Worker
   --> Sends WhatsApp alert to store owner
   --> Dispatches branded HTML confirmation email to customer
```
