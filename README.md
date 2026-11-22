# STONCROPS — Premium Single-Product Fashion E-Commerce Platform

A production-ready e-commerce platform built for **STONCROPS** — engineered for high-traffic drop releases, atomic stock reservation, server-verified UPI checkout, and administrative operations.

---

## 1. Brand Identity & Product Architecture

- **Brand Wordmark:** `STONCROPS` (Always uppercase, contemporary sans-serif typography with generous letter-spacing).
- **Core Product:** `STONCROPS — Drop 01: Embroidered Edition`
- **Garment Profile:** Full-sleeve oversized T-shirt in heavyweight Loopnet fabric.
- **Silhouette:** Boxy drop-shoulder relaxed streetwear drape.
- **Base Colour:** Off-white / Cream (`#FAF8F5`).
- **Signature Embroidery:** Bespoke burgundy floral embroidery (`#722F37`) cascading down both sleeves.
- **Chest Branding:** Minimalist `STONCROPS` typography.
- **Pricing:** ₹1,199 (All Taxes Included).
- **Shipping:** 100% Free Express Delivery across India.

### Official Garment Size Matrix (Flat-Laid Measurements)

All measurements are flat-laid garment measurements with a tolerance of ±0.5 inches:

| Size | Chest (Width) | Length (Height) | Shoulder | Sleeve Length |
| :---: | :---: | :---: | :---: | :---: |
| **S** | 21.5" (55 cm) | 27.5" (70 cm) | 21.5" (55 cm) | 23.0" (58.5 cm) |
| **M** | 23.0" (58.5 cm) | 28.0" (71 cm) | 22.0" (56 cm) | 24.0" (61 cm) |
| **L** | 24.0" (61 cm) | 29.0" (73.5 cm) | 22.5" (57 cm) | 24.5" (62 cm) |

*Care Instructions:* Always detach the metal chain accessory before washing. Machine wash cold inside-out on gentle cycle.

---

## 2. System Architecture

STONCROPS is structured as a pnpm monorepo separating customer-facing shopping traffic from back-office management workflows while sharing unified validation and data models:

```
stoncrops/
├── apps/
│   ├── storefront/             # Customer Store (https://stoncrops.com)
│   │   ├── app/                # Next.js App Router (Cart, Checkout, APIs)
│   │   ├── components/         # Hero, Gallery, PurchaseCard, SizeModal, Reviews
│   │   ├── lib/                # Cart Context, First-Party Telemetry & Heartbeat
│   │   └── public/             # High-res SVG Editorial Product Visuals
│   │
│   └── admin/                  # Administrative Console (https://admin.stoncrops.com)
│       ├── app/                # PWA Dashboard, Login, Management Views
│       ├── lib/                # Admin Auth Context & Role Verification
│       └── public/             # PWA Manifest & Icons
│
├── packages/
│   ├── shared/                 # Zod Schemas, Supabase Clients, Razorpay, WhatsApp, Email
│   └── types/                  # TypeScript Data Models (Order, Inventory, Review, Customer)
│
├── supabase/
│   ├── migrations/             # Production PostgreSQL DDL, RLS Policies & Atomic RPCs
│   └── seed.sql                # Seed Data (Drop 01, S/M/L variants, default settings)
│
├── docs/                       # Technical Documentation
│   ├── architecture.md         # System Topology & Concurrency Design
│   ├── database.md             # Entity Relationships & Row-Level Security
│   ├── security.md             # Threat Model, CSP, Rate Limiting & Signatures
│   ├── deployment.md           # Vercel & Cloudflare Setup
│   └── environment-setup.md    # Developer Local Machine Setup
│
├── .env.example                # Canonical Template for Environment Variables
└── package.json                # Monorepo Workspace Configuration
```

---

## 3. Key Technical Capabilities

### A. Frictionless Checkout Experience
- **Zero forced account creation:** Direct checkout designed for social media acquisition.
- **Address Validation:** Strict validation for 10-digit Indian mobile numbers and 6-digit PIN codes.
- **Server-Side Razorpay Payment Integration:** Timing-safe HMAC-SHA256 signature verification (`crypto.timingSafeEqual`). Never relies on client-side success callbacks.
- **Atomic Stock Reservation:** PostgreSQL `SELECT ... FOR UPDATE` prevents overselling during high-concurrency drop releases.

### B. Admin Management Console (PWA Ready)
- **Real-Time Telemetry:** Computes true live visitor count via 30-second session heartbeats with automatic expiry.
- **Inventory Matrix:** Independent real-time stock allocation for S, M, and L.
- **Order Fulfillment:** Live order dashboard, status updates, internal notes, and one-click CSV export.
- **Product & Image Manager:** Supabase Storage integration with file format and size validation.
- **Customer Review Moderation:** Anti-spam honeypot traps and manual approval queue.

### C. Resilient Asynchronous Notifications
- **WhatsApp Cloud API:** Instant owner alert with customer name, phone, size, quantity, and total amount.
- **Transactional Email:** Responsive HTML customer order confirmations and founder notifications via Resend API.
- **Non-blocking Guarantee:** Notification errors are logged in `public.notifications` with retry capability; they never interrupt or fail a paid order.

---

## 4. Getting Started

### Prerequisites
- Node.js >= 18.18.0
- pnpm >= 8.0.0

### Installation
```bash
# Clone and install dependencies
git clone <repo-url> stoncrops
cd stoncrops
pnpm install

# Build shared packages
pnpm build:types
pnpm build:shared
```

### Environment Configuration
Copy `.env.example` into both application folders:
```bash
cp .env.example apps/storefront/.env.local
cp .env.example apps/admin/.env.local
```

### Running Locally
```bash
# Start Customer Storefront (http://localhost:3000)
pnpm dev:store

# Start Admin Dashboard (http://localhost:3001)
pnpm dev:admin
```

---

## 5. Security & Verification

- **Row Level Security (RLS):** Enabled across all 17 database tables. Anonymous clients cannot access customer or payment records.
- **Idempotent Webhooks:** Razorpay webhooks reject duplicate transactions.
- **HTTP Security Headers:** Strict Content Security Policy, HSTS, X-Frame-Options, and X-Content-Type-Options active on all routes.
