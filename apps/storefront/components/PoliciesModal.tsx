'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield } from 'lucide-react';

export type PolicyType = 'shipping' | 'returns' | 'privacy' | 'terms' | null;

interface PoliciesModalProps {
  policy: PolicyType;
  onClose: () => void;
}

export function PoliciesModal({ policy, onClose }: PoliciesModalProps) {
  if (!policy) return null;

  const content: Record<
    NonNullable<PolicyType>,
    { title: string; subtitle: string; body: React.ReactNode }
  > = {
    shipping: {
      title: 'Shipping & Delivery Policy',
      subtitle: 'Free Insured Express Delivery Across India',
      body: (
        <div className="space-y-4 text-xs text-obsidian-700 leading-relaxed">
          <p>
            <strong>Complimentary Shipping:</strong> STONCROPS offers 100% free standard express shipping on all orders delivered within India.
          </p>
          <p>
            <strong>Order Processing:</strong> All orders are dispatched within 24 to 48 hours of payment verification via leading courier partners (Blue Dart, Delhivery, Xpressbees).
          </p>
          <p>
            <strong>Delivery Timelines:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Metro cities (Bangalore, Mumbai, Delhi-NCR, Hyderabad, Chennai, Kolkata): 2-4 business days.</li>
            <li>Tier 2 and Tier 3 cities: 3-6 business days.</li>
          </ul>
          <p>
            <strong>Tracking:</strong> You will receive real-time SMS, WhatsApp, and email tracking links as soon as your parcel is scanned at the fulfillment hub.
          </p>
        </div>
      ),
    },
    returns: {
      title: 'Returns & Refund Policy',
      subtitle: 'Size Exchanges & Defect Guarantee',
      body: (
        <div className="space-y-4 text-xs text-obsidian-700 leading-relaxed">
          <p>
            <strong>Size Exchange:</strong> Because STONCROPS garments feature bespoke flat-laid measurements, we encourage customers to consult our Size Guide prior to ordering. If you require a different size, exchanges are accepted within <strong>7 days</strong> of delivery, provided the garment is unworn, unwashed, and with all original tags attached.
          </p>
          <p>
            <strong>Manufacturing Defects:</strong> In the rare event of a transit defect or embroidery flaw, please contact <code>orders@stoncrops.com</code> with photos within 48 hours of delivery for an immediate free replacement or full refund.
          </p>
          <p>
            <strong>Refund Processing:</strong> Approved refunds will be credited back to the original source UPI account or bank account within 5-7 business days via Razorpay.
          </p>
        </div>
      ),
    },
    privacy: {
      title: 'Privacy Policy',
      subtitle: 'Data Minimization & Customer Confidentiality',
      body: (
        <div className="space-y-4 text-xs text-obsidian-700 leading-relaxed">
          <p>
            At STONCROPS, customer privacy is paramount. We collect only the essential personal details required to deliver your order (Full Name, Phone Number, Email, and Delivery Address).
          </p>
          <p>
            <strong>Zero Sale of Personal Data:</strong> We never sell, rent, or trade customer contact details with third-party advertisers or external data brokers.
          </p>
          <p>
            <strong>Payment Security:</strong> Payment information is processed directly by RBI-authorized payment aggregator Razorpay. STONCROPS never stores your bank account, card credentials, or UPI PIN on our servers.
          </p>
        </div>
      ),
    },
    terms: {
      title: 'Terms & Conditions',
      subtitle: 'Official Customer Purchase Agreement',
      body: (
        <div className="space-y-4 text-xs text-obsidian-700 leading-relaxed">
          <p>
            <strong>1. General:</strong> By placing an order on stoncrops.com, you agree to these purchase terms. All products are subject to availability.
          </p>
          <p>
            <strong>2. Pricing & Taxes:</strong> The stated price of ₹1,199 is inclusive of GST and all statutory Indian taxes.
          </p>
          <p>
            <strong>3. Order Confirmation:</strong> An order is deemed confirmed only after Razorpay payment verification is successfully logged by our server.
          </p>
          <p>
            <strong>4. Intellectual Property:</strong> The STONCROPS wordmark, typography, garment designs, and embroidery patterns are proprietary assets of STONCROPS.
          </p>
        </div>
      ),
    },
  };

  const current = content[policy];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-obsidian-950/70 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative bg-cream-50 border border-cream-300 w-full max-w-2xl rounded-none shadow-2xl p-6 sm:p-8 z-10 max-h-[85vh] overflow-y-auto"
        >
          <div className="flex items-start justify-between border-b border-cream-200 pb-4 mb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 text-burgundy-700 text-[10px] font-bold tracking-[0.2em] uppercase mb-1">
                <Shield className="w-3.5 h-3.5" />
                STONCROPS POLICIES
              </div>
              <h3 className="text-xl font-bold text-obsidian-950">{current.title}</h3>
              <p className="text-xs text-obsidian-500 mt-0.5">{current.subtitle}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-obsidian-600 hover:text-obsidian-950 hover:bg-cream-200 rounded"
              aria-label="Close policy"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="py-2">{current.body}</div>

          <div className="mt-6 border-t border-cream-200 pt-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-obsidian-950 text-white text-xs uppercase tracking-wider font-bold hover:bg-burgundy-800 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
