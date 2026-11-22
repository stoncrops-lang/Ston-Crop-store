'use client';

import React, { useState } from 'react';
import { BRAND_NAME, INSTAGRAM_URL, INSTAGRAM_HANDLE, PRODUCT_PRICE } from '@stoncrops/shared';
import { PoliciesModal, PolicyType } from './PoliciesModal';
import { Instagram } from 'lucide-react';

export function Footer() {
  const [activePolicy, setActivePolicy] = useState<PolicyType>(null);

  return (
    <>
      <footer className="bg-obsidian-950 text-white border-t border-zinc-900 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-zinc-800">
            
            {/* Left: Brand Identity */}
            <div className="md:col-span-5 space-y-4">
              <span className="wordmark text-2xl font-extrabold tracking-[0.28em] text-white block">
                {BRAND_NAME}
              </span>
              <p className="text-xs text-zinc-400 font-normal leading-relaxed max-w-sm">
                Single-product luxury streetwear brand. Engineered with heavyweight Loopnet textiles, architectural drop-shoulder silhouettes, and bespoke floral embroidery.
              </p>
              <div className="text-[11px] uppercase tracking-wider text-burgundy-500 font-semibold pt-1">
                Embroidered Edition • ₹{PRODUCT_PRICE.toLocaleString('en-IN')}
              </div>
            </div>

            {/* Center: Legal & Policies */}
            <div className="md:col-span-4 space-y-3">
              <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-zinc-300">
                Customer Care & Policies
              </h4>
              <ul className="text-xs space-y-2 text-zinc-400">
                <li>
                  <button
                    onClick={() => setActivePolicy('shipping')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Shipping & Delivery Policy (Free India Delivery)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActivePolicy('returns')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Returns & Size Exchange Policy (7 Days)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActivePolicy('privacy')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Privacy Policy & Data Security
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActivePolicy('terms')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Terms & Conditions of Purchase
                  </button>
                </li>
              </ul>
            </div>

            {/* Right: Contact & Support */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-zinc-300">
                Direct Contact
              </h4>
              <p className="text-xs text-zinc-400">
                Email inquiries & support:
                <a
                  href="mailto:contact@stoncrops.com"
                  className="block text-zinc-200 hover:text-burgundy-400 font-medium mt-0.5 transition-colors"
                >
                  contact@stoncrops.com
                </a>
              </p>
              <p className="text-xs text-zinc-400 pt-1">
                Official Instagram:
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-zinc-200 hover:text-burgundy-400 font-medium mt-0.5 transition-colors"
                >
                  <Instagram className="w-3.5 h-3.5 text-burgundy-500" />
                  <span>{INSTAGRAM_HANDLE}</span>
                </a>
              </p>
              <div className="pt-2 text-[10px] text-zinc-500">
                Fulfillment Hub: Bangalore, Karnataka, India
              </div>
            </div>

          </div>

          {/* Bottom Disclaimer */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 gap-4">
            <p>
              &copy; {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
            </p>
            <p className="tracking-wider uppercase text-[10px]">
              Secure Payments Powered by Razorpay UPI • Built with Next.js & Supabase
            </p>
          </div>
        </div>
      </footer>

      {/* Policy Modal */}
      <PoliciesModal
        policy={activePolicy}
        onClose={() => setActivePolicy(null)}
      />
    </>
  );
}
