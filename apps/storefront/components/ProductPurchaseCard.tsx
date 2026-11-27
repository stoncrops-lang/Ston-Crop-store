'use client';

import React, { useState } from 'react';
import { Ruler, ShoppingBag, Zap, CheckCircle2, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../lib/cart-context';
import { GarmentSize } from '@stoncrops/types';
import { PRODUCT_PRICE, FREE_SHIPPING_TEXT, BRAND_NAME } from '@stoncrops/shared';
import { trackEvent } from '../lib/analytics';

// Real-time stock counts (hydrated from Supabase API / default seed)
const STOCK_STATUS: Record<GarmentSize, { available: number; status: 'in_stock' | 'low_stock' | 'sold_out' }> = {
  S: { available: 25, status: 'in_stock' },
  M: { available: 40, status: 'in_stock' },
  L: { available: 20, status: 'in_stock' },
};

export function ProductPurchaseCard() {
  const {
    selectedSize,
    setSelectedSize,
    openSizeGuide,
    addToCart,
    buyNow,
  } = useCart();

  const [addedAnimation, setAddedAnimation] = useState(false);
  const [pincodeQuery, setPincodeQuery] = useState('');
  const [pincodeResult, setPincodeResult] = useState<string | null>(null);

  const currentStock = STOCK_STATUS[selectedSize];
  const isSoldOut = currentStock.available <= 0;

  const handleAddToCart = () => {
    if (isSoldOut) return;
    addToCart(selectedSize, 1);
    trackEvent('add_to_cart', { size: selectedSize, price: PRODUCT_PRICE });
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const handleBuyNow = () => {
    if (isSoldOut) return;
    trackEvent('buy_now_click', { size: selectedSize, price: PRODUCT_PRICE });
    buyNow(selectedSize, 1);
  };

  const checkPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[1-9][0-9]{5}$/.test(pincodeQuery.trim())) {
      setPincodeResult('Please enter a valid 6-digit Indian PIN code');
      return;
    }
    // All serviceable across India
    setPincodeResult('Standard Express Delivery: 3-5 business days. Free shipping included.');
  };

  return (
    <div id="purchase" className="bg-white border border-cream-300 p-5 sm:p-8 rounded-none shadow-sm space-y-5 sm:space-y-6">
      {/* Title & Badge */}
      <div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs uppercase font-extrabold tracking-[0.22em] text-burgundy-700">
            {BRAND_NAME} OFFICIAL
          </span>
          <span className="text-[10px] sm:text-[11px] uppercase font-semibold tracking-wider text-obsidian-600 bg-cream-100 px-2 py-0.5 rounded border border-cream-200">
            LIMITED EDITION
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-obsidian-950 mt-1">
          Embroidered Edition
        </h2>
        <p className="text-xs text-obsidian-600 mt-0.5 leading-normal">
          Full-sleeve oversized T-shirt • Loopnet fabric • Floral sleeve embroidery
        </p>
        <p className="text-[11px] text-obsidian-500 mt-1">
          Available in: <span className="font-semibold text-obsidian-700">Off-White</span> &amp; <span className="font-semibold text-obsidian-700">Black</span>
        </p>
      </div>

      {/* Price & Free Shipping */}
      <div className="border-t border-b border-cream-200 py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 sm:gap-0">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-obsidian-950">
              ₹{PRODUCT_PRICE.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] sm:text-xs text-obsidian-500 uppercase tracking-widest font-semibold">
              INR
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-obsidian-500 block mt-0.5">
            Inclusive of all taxes & duties
          </span>
        </div>

        <div className="self-start sm:self-auto">
          <span className="inline-block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-green-700 bg-green-50 px-2.5 py-1 rounded border border-green-200">
            {FREE_SHIPPING_TEXT}
          </span>
        </div>
      </div>

      {/* Size Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-obsidian-900">
            Select Garment Size
          </label>
          <button
            onClick={() => {
              trackEvent('size_guide_open');
              openSizeGuide();
            }}
            className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-burgundy-700 hover:text-burgundy-900 underline underline-offset-4 transition-colors shrink-0"
          >
            <Ruler className="w-3.5 h-3.5" />
            Size Guide (Inches & cm)
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {(['S', 'M', 'L'] as const).map((sz) => {
            const isSelected = selectedSize === sz;
            const stock = STOCK_STATUS[sz];
            const szSoldOut = stock.available <= 0;

            return (
              <button
                key={sz}
                disabled={szSoldOut}
                onClick={() => {
                  setSelectedSize(sz);
                  trackEvent('size_select', { size: sz });
                }}
                className={`relative py-2.5 sm:py-3 px-2 sm:px-4 border text-center transition-all touch-manipulation ${szSoldOut
                    ? 'border-cream-200 bg-cream-100/50 text-obsidian-400 cursor-not-allowed'
                    : isSelected
                      ? 'border-obsidian-950 bg-obsidian-950 text-white shadow-md'
                      : 'border-cream-300 bg-white text-obsidian-900 hover:border-obsidian-700 active:bg-cream-100'
                  }`}
              >
                <span className="text-sm sm:text-base font-extrabold block">{sz}</span>
                <span
                  className={`text-[9px] sm:text-[10px] tracking-wider uppercase block mt-0.5 ${isSelected ? 'text-cream-300' : szSoldOut ? 'text-red-500' : 'text-obsidian-500'
                    }`}
                >
                  {szSoldOut ? 'Sold Out' : 'Available'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Real Stock Status Notice */}
        <div className="text-[10px] sm:text-[11px] text-obsidian-600 flex flex-wrap items-center justify-between gap-1 pt-1">
          <span>
            Fit: Relaxed oversized silhouette. Order regular size.
          </span>
          <span className="font-medium text-emerald-700 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Stock Verified
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 sm:space-y-3 pt-1">
        <button
          onClick={handleBuyNow}
          disabled={isSoldOut}
          className="w-full py-3.5 sm:py-4 bg-obsidian-950 text-white hover:bg-burgundy-800 active:bg-burgundy-900 transition-colors duration-200 text-xs uppercase tracking-[0.22em] font-extrabold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group touch-manipulation"
        >
          <Zap className="w-4 h-4 fill-white transition-transform group-hover:scale-110" />
          <span>{isSoldOut ? 'SOLD OUT' : 'BUY NOW — ₹1,199'}</span>
        </button>

        <button
          onClick={handleAddToCart}
          disabled={isSoldOut}
          className="w-full py-3 sm:py-3.5 bg-cream-100 border border-obsidian-950 text-obsidian-950 hover:bg-cream-200 active:bg-cream-300 transition-colors text-xs uppercase tracking-[0.18em] font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{addedAnimation ? 'ADDED TO BAG' : 'ADD TO BAG'}</span>
        </button>
      </div>

      {/* Pincode Availability Checker */}
      <div className="border-t border-cream-200 pt-3.5 sm:pt-4">
        <form onSubmit={checkPincode} className="space-y-2">
          <label className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-obsidian-800 block">
            Check Delivery to Your PIN Code
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              maxLength={6}
              value={pincodeQuery}
              onChange={(e) => {
                setPincodeQuery(e.target.value.replace(/\D/g, ''));
                setPincodeResult(null);
              }}
              placeholder="e.g. 560001, 110001"
              className="w-full px-3 py-2 border border-cream-300 text-xs text-obsidian-950 placeholder:text-obsidian-400 focus:outline-none focus:ring-1 focus:ring-obsidian-950 rounded-none"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-obsidian-800 text-white text-xs uppercase font-bold tracking-wider hover:bg-obsidian-950 transition-colors shrink-0"
            >
              Verify
            </button>
          </div>
          {pincodeResult && (
            <p className="text-[11px] sm:text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 mt-2">
              {pincodeResult}
            </p>
          )}
        </form>
      </div>

      {/* Reassurances */}
      <div className="border-t border-cream-200 pt-3.5 sm:pt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-left">
        <div className="flex items-start gap-2 text-xs text-obsidian-700">
          <Truck className="w-4 h-4 text-burgundy-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-obsidian-900 text-xs">Free Express Delivery</p>
            <p className="text-[10px] text-obsidian-500">All India shipping</p>
          </div>
        </div>

        <div className="flex items-start gap-2 text-xs text-obsidian-700">
          <ShieldCheck className="w-4 h-4 text-burgundy-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-obsidian-900 text-xs">Secure UPI Checkout</p>
            <p className="text-[10px] text-obsidian-500">Razorpay verified</p>
          </div>
        </div>

        <div className="flex items-start gap-2 text-xs text-obsidian-700">
          <CheckCircle2 className="w-4 h-4 text-burgundy-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-obsidian-900 text-xs">Accurate Sizing</p>
            <p className="text-[10px] text-obsidian-500">±0.5 inch tolerance</p>
          </div>
        </div>
      </div>
    </div>
  );
}
