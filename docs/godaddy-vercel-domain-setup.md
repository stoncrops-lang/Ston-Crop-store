# Connecting Your GoDaddy Domain to Vercel & Netlify
## STONCROPS Production Deployment & DNS Guide

This step-by-step guide explains how to connect your GoDaddy domain (`stoncrops.com`) to **Vercel** (recommended) or **Netlify** for both the Customer Storefront and the Admin Console.

---

## Architecture Overview

| Application | Monorepo Directory | Production Domain | Purpose |
|---|---|---|---|
| **Customer Storefront** | `apps/storefront` | `https://stoncrops.com` & `https://www.stoncrops.com` | Customer shopping, cart, Razorpay UPI checkout |
| **Admin Console** | `apps/admin` | `https://admin.stoncrops.com` | Order management, inventory editor, analytics |

---

## PART 1: Deploying to Vercel (Recommended)

Vercel provides native Next.js 14 optimization, global edge CDN, and automated SSL certificate generation.

### Step 1: Push your project to GitHub

1. Ensure your latest changes are pushed to your private GitHub repository:
   ```powershell
   git add .
   git commit -m "deploy: production ready"
   git push origin main
   ```

### Step 2: Create Project 1 (Customer Storefront) in Vercel

1. Log in to [vercel.com](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository (`stoncrops`).
4. In the **Project Settings**:
   - **Project Name**: `stoncrops-storefront`
   - **Framework Preset**: Next.js
   - **Root Directory**: Click *Edit* and select **`apps/storefront`**.
5. Expand **Environment Variables** and add the following keys:
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://your-project.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `your_supabase_anon_key`
   - `SUPABASE_SERVICE_ROLE_KEY`: `your_supabase_service_role_secret`
   - `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`: `product-images`
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID`: `rzp_live_...` *(or your test key `rzp_test_...`)*
   - `RAZORPAY_KEY_ID`: `rzp_live_...`
   - `RAZORPAY_KEY_SECRET`: `your_razorpay_secret`
   - `NEXT_PUBLIC_STORE_URL`: `https://stoncrops.com`
   - `NEXT_PUBLIC_ADMIN_URL`: `https://admin.stoncrops.com`
6. Click **Deploy**.

### Step 3: Create Project 2 (Admin Console) in Vercel

1. On your Vercel Dashboard, click **Add New...** -> **Project**.
2. Select the same repository (`stoncrops`).
3. In the **Project Settings**:
   - **Project Name**: `stoncrops-admin`
   - **Framework Preset**: Next.js
   - **Root Directory**: Click *Edit* and select **`apps/admin`**.
4. Expand **Environment Variables** and add:
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://your-project.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `your_supabase_anon_key`
   - `SUPABASE_SERVICE_ROLE_KEY`: `your_supabase_service_role_secret`
   - `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`: `product-images`
   - `OWNER_EMAIL`: `founder@stoncrops.com`
   - `ADMIN_PASSWORD`: `your_secure_admin_password`
   - `NEXT_PUBLIC_STORE_URL`: `https://stoncrops.com`
   - `NEXT_PUBLIC_ADMIN_URL`: `https://admin.stoncrops.com`
5. Click **Deploy**.

---

## PART 2: Configuring DNS in GoDaddy

Now connect your purchased GoDaddy domain to the two Vercel projects.

### Step 1: Open GoDaddy DNS Management

1. Log in to [godaddy.com](https://godaddy.com).
2. Go to **My Products** -> Click on your domain (`stoncrops.com` or `stonecrops.in`).
3. Click on the **DNS** or **Manage DNS** tab.

### Step 2: Add DNS Records

Edit or add the following records in GoDaddy:

| Type | Name / Host | Value / Points to | TTL | Notes |
|---|---|---|---|---|
| **A** | `@` | `76.76.21.21` | 1/2 Hour (600s) | Points apex domain to Vercel edge IP |
| **CNAME** | `www` | `cname.vercel-dns.com.` | 1/2 Hour (600s) | Routes `www.stoncrops.com` to storefront |
| **CNAME** | `admin` | `cname.vercel-dns.com.` | 1/2 Hour (600s) | Routes `admin.stoncrops.com` to admin project |

> [!IMPORTANT]
> If you see an existing `A` record with Name `@` pointing to a GoDaddy park page (e.g., `34.102.136.180`), edit it to `76.76.21.21`.

### Step 3: Link Domains in Vercel

1. In **`stoncrops-storefront`** project:
   - Go to **Settings** -> **Domains**.
   - Type `stoncrops.com` and click **Add**.
   - Vercel will recommend redirecting `www.stoncrops.com` to `stoncrops.com` (select yes).
   - Vercel will verify the GoDaddy records and show a green checkmark: **Valid Configuration**.
2. In **`stoncrops-admin`** project:
   - Go to **Settings** -> **Domains**.
   - Type `admin.stoncrops.com` and click **Add**.
   - Vercel will verify the CNAME record and show a green checkmark.

---

## PART 3: Netlify Alternative Setup

If you prefer deploying on Netlify:

1. Log in to [netlify.com](https://netlify.com) -> **Add new site** -> **Import an existing project**.
2. Choose GitHub -> Select your `stoncrops` repo.
3. For Storefront:
   - **Base directory**: `apps/storefront`
   - **Build command**: `pnpm build`
   - **Publish directory**: `apps/storefront/.next`
4. In GoDaddy DNS:
   - Type **A** -> Name `@` -> Value `75.2.60.5`
   - Type **CNAME** -> Name `admin` -> Value `your-admin-site.netlify.app.`

---

## Verification Checklist

- [ ] `https://stoncrops.com` loads the customer storefront with SSL padlock.
- [ ] `https://admin.stoncrops.com` loads the internal operations login.
- [ ] GoDaddy DNS propagation typically completes within 5–15 minutes (max 24 hours).
