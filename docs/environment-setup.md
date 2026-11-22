# STONCROPS Environment Setup Guide

## Prerequisites

- Node.js >= 18.18.0 (Node 20+ recommended)
- pnpm >= 8.0.0
- Supabase CLI (optional for local DB emulation)
- Git

## Step 1: Install Dependencies

```bash
pnpm install
```

## Step 2: Configure Environment Variables

Copy `.env.example` to `.env.local` inside each application directory:

```bash
cp .env.example apps/storefront/.env.local
cp .env.example apps/admin/.env.local
```

Fill in your actual keys for:
- Supabase (URL, Anon Key, Service Role Key)
- Razorpay (Key ID, Key Secret, Webhook Secret)
- WhatsApp Cloud API (Token, Phone ID, Owner Phone)
- Resend (API Key, Owner Email)

## Step 3: Run Local Development Servers

To run the customer storefront (port 3000):
```bash
pnpm dev:store
```

To run the admin dashboard (port 3001):
```bash
pnpm dev:admin
```
