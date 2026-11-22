'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Menu, X, Instagram } from 'lucide-react';
import { useCart } from '../lib/cart-context';
import { BRAND_NAME, INSTAGRAM_URL, INSTAGRAM_HANDLE } from '@stoncrops/shared';

export function Header() {
  const { cart, openCart } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-cream-50/90 backdrop-blur-md border-b border-cream-300/60 shadow-sm py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Left: STONCROPS Wordmark */}
          <Link
            href="/"
            className="group flex items-center gap-2 focus:outline-none"
            aria-label="STONCROPS Homepage"
          >
            <span className="wordmark text-lg sm:text-xl md:text-2xl tracking-[0.28em] font-extrabold text-obsidian-950 transition-colors group-hover:text-burgundy-700">
              {BRAND_NAME}
            </span>
          </Link>

          {/* Center: Minimal Navigation */}
          <nav className="hidden md:flex items-center space-x-10 text-xs uppercase tracking-[0.2em] font-semibold text-obsidian-700">
            <a
              href="#product"
              className="hover:text-obsidian-950 transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-obsidian-950 hover:after:w-full after:transition-all"
            >
              Garment
            </a>
            <a
              href="#details"
              className="hover:text-obsidian-950 transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-obsidian-950 hover:after:w-full after:transition-all"
            >
              Construction
            </a>
            <a
              href="#reviews"
              className="hover:text-obsidian-950 transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-obsidian-950 hover:after:w-full after:transition-all"
            >
              Reviews
            </a>
            <a
              href="#about"
              className="hover:text-obsidian-950 transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-obsidian-950 hover:after:w-full after:transition-all"
            >
              Archive
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-burgundy-700 transition-colors py-1 flex items-center gap-1 text-[11px]"
              aria-label="Follow STONCROPS on Instagram"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>Instagram</span>
            </a>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center space-x-4">
            <button
              onClick={openCart}
              className="relative p-2.5 rounded-full hover:bg-cream-200/80 transition-all text-obsidian-950 focus:outline-none focus:ring-2 focus:ring-burgundy-700"
              aria-label={`Shopping bag containing ${cart?.quantity || 0} items`}
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
              {cart && cart.quantity > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-burgundy-700 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-scale-in">
                  {cart.quantity}
                </span>
              )}
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-obsidian-900 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-cream-50/98 backdrop-blur-xl border-b border-cream-300 px-6 py-6 space-y-4 animate-fade-in">
            <a
              href="#product"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm uppercase tracking-[0.2em] font-semibold text-obsidian-900 py-2 border-b border-cream-200"
            >
              Garment
            </a>
            <a
              href="#details"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm uppercase tracking-[0.2em] font-semibold text-obsidian-900 py-2 border-b border-cream-200"
            >
              Construction
            </a>
            <a
              href="#reviews"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm uppercase tracking-[0.2em] font-semibold text-obsidian-900 py-2 border-b border-cream-200"
            >
              Reviews
            </a>
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm uppercase tracking-[0.2em] font-semibold text-obsidian-900 py-2 border-b border-cream-200"
            >
              Archive
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between text-sm uppercase tracking-[0.2em] font-bold text-burgundy-700 py-2"
            >
              <span className="flex items-center gap-2">
                <Instagram className="w-4 h-4" />
                <span>Instagram</span>
              </span>
              <span className="text-xs font-semibold text-obsidian-600 lowercase">{INSTAGRAM_HANDLE}</span>
            </a>
          </div>
        )}
      </header>
    </>
  );
}
