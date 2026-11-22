'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '../lib/cart-context';
import { PRODUCT_PRICE } from '@stoncrops/shared';
import { Zap } from 'lucide-react';

export function MobileStickyPurchaseBar() {
  const { selectedSize, buyNow, openSizeGuide } = useCart();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Visible after scrolling 400px down
      setVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-cream-300 p-3 px-4 flex items-center justify-between gap-3 shadow-lg animate-fade-in">
      <div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-base font-black text-obsidian-950">
            ₹{PRODUCT_PRICE.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-emerald-700 uppercase font-bold">
            Free Shipping
          </span>
        </div>
        <button
          onClick={openSizeGuide}
          className="text-[10px] text-burgundy-700 font-semibold underline underline-offset-2 block"
        >
          Size: {selectedSize} (View Chart)
        </button>
      </div>

      <button
        onClick={() => buyNow(selectedSize, 1)}
        className="px-6 py-3 bg-obsidian-950 text-white text-xs uppercase tracking-[0.2em] font-extrabold flex items-center gap-1.5 shadow-md active:bg-burgundy-800 transition-colors"
      >
        <Zap className="w-3.5 h-3.5 fill-white" />
        <span>BUY NOW</span>
      </button>
    </div>
  );
}
