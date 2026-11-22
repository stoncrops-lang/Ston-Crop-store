'use client';

import React, { useEffect } from 'react';
import { Header } from '../components/Header';
import { ProductGallery } from '../components/ProductGallery';
import { ProductPurchaseCard } from '../components/ProductPurchaseCard';
import { ProductDetailsAccordion } from '../components/ProductDetailsAccordion';
import { CustomerReviews } from '../components/CustomerReviews';
import { BrandStory } from '../components/BrandStory';
import { Footer } from '../components/Footer';
import { startHeartbeat, trackEvent } from '../lib/analytics';
import { Sparkles, Instagram } from 'lucide-react';
import { FREE_SHIPPING_TEXT, INSTAGRAM_URL, INSTAGRAM_HANDLE } from '@stoncrops/shared';

export default function StorefrontPage() {
  useEffect(() => {
    // Start session heartbeat for live visitor monitoring
    const cleanupHeartbeat = startHeartbeat();
    trackEvent('page_view', { page: '/' });

    return () => {
      cleanupHeartbeat();
    };
  }, []);

  return (
    <main className="min-h-screen bg-cream-50 flex flex-col pb-20 md:pb-0 overflow-x-hidden">
      {/* Top Announcement Bar */}
      <div className="bg-obsidian-950 text-white text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-semibold py-2 px-3 sm:px-4 text-center flex items-center justify-center gap-2 border-b border-zinc-800">
        <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-burgundy-500 shrink-0" />
        <span className="truncate">{FREE_SHIPPING_TEXT} • EMBROIDERED EDITION</span>
        <span className="hidden sm:inline text-zinc-500">•</span>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1 text-burgundy-400 hover:text-white transition-colors"
        >
          <Instagram className="w-3 h-3" />
          <span>{INSTAGRAM_HANDLE}</span>
        </a>
      </div>

      <Header />

      {/* Main Product Showcase & Purchase Section (First View on Mobile & Desktop) */}
      <section id="product" className="pt-20 sm:pt-24 md:pt-28 pb-10 sm:pb-16 md:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          
          {/* Left Column: Interactive Product Gallery */}
          <div className="lg:col-span-7 lg:sticky lg:top-24">
            <ProductGallery />
          </div>

          {/* Right Column: Purchase Card & Garment Construction Accordion */}
          <div className="lg:col-span-5 space-y-6 sm:space-y-8">
            <ProductPurchaseCard />
            <ProductDetailsAccordion />
          </div>

        </div>
      </section>

      <CustomerReviews />
      <BrandStory />
      <Footer />
    </main>
  );
}
