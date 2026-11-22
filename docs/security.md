# STONCROPS Application Security Architecture

## 1. Threat Model & Defence-in-Depth

STONCROPS is designed anticipating high exposure from viral social campaigns, bots, and malicious scraping.

### 1.1 Row Level Security (RLS)
- Every single table in the database has RLS enabled.
- Unauthenticated public clients can only read active products, approved reviews, and public store settings.
- Direct access to `customers`, `orders`, `payment_transactions`, and `audit_logs` is blocked for all anonymous requests.
- Administrative operations require verified membership in `public.admin_users`.

### 1.2 Payment Integrity
- Never trust frontend callbacks: Payment success status is NEVER updated from the browser.
- Razorpay HMAC-SHA256 signature verification executes on the server using `crypto.timingSafeEqual` to avoid timing side-channel attacks.
- Razorpay Webhooks are validated with `RAZORPAY_WEBHOOK_SECRET` and checked for idempotency to reject replay attacks.
- Amount and currency are double-checked against the database price record before capturing funds.

### 1.3 Authentication & Administration
- Separate admin application hosted on an independent subdomain (`admin.stoncrops.com`).
- Public registration is completely disabled.
- Password recovery and MFA support through Supabase Auth.
- All admin mutations create immutable records in `public.audit_logs`.

### 1.4 Input Sanitization & Abuse Prevention
- Strict Zod schema validation on all incoming HTTP payloads.
- Indian mobile number and PIN code format verification.
- Honeypot fields on review submissions to trap spam bots.
- Content Security Policy (CSP), HSTS, X-Frame-Options, and X-Content-Type-Options headers.

### 1.5 Media Upload Safety
- Supabase storage policies strictly enforce MIME type (`image/jpeg`, `image/png`, `image/webp`) and maximum file size (5MB).
