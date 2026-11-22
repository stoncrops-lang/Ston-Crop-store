# STONCROPS Deployment Guide

## 1. Hosting Architecture

- **Storefront App (`stoncrops.com`)**: Deployed to Vercel (Root directory: `apps/storefront`).
- **Admin App (`admin.stoncrops.com`)**: Deployed to Vercel (Root directory: `apps/admin`).
- **Backend & Database**: Managed PostgreSQL via Supabase.
- **DNS & CDN**: Cloudflare with DDoS protection and DNS proxying.

## 2. Vercel Configuration

### Storefront Project Settings
- Framework: Next.js
- Root Directory: `apps/storefront`
- Build Command: `pnpm build`
- Install Command: `pnpm install`
- Domains: `stoncrops.com`, `www.stoncrops.com`

### Admin Dashboard Project Settings
- Framework: Next.js
- Root Directory: `apps/admin`
- Build Command: `pnpm build`
- Install Command: `pnpm install`
- Domains: `admin.stoncrops.com`

## 3. Database Migration Deployment

```bash
# Push migrations to production Supabase instance
npx supabase db push

# Run seed script if initial data is needed
psql -h <SUPABASE_HOST> -U postgres -d postgres -f supabase/seed.sql
```

## 4. Post-Deployment Checklist

- [ ] Verify SSL certificate active on both domains.
- [ ] Confirm Razorpay Webhook URL registered: `https://stoncrops.com/api/webhooks/razorpay`.
- [ ] Test end-to-end UPI payment in Razorpay test mode.
- [ ] Confirm admin login functions with MFA.
- [ ] Upload real product photography via Admin image manager.
- [ ] Verify WhatsApp and Email alerts deliver on test orders.
