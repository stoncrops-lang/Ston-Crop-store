'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useCart } from '../lib/cart-context';
import { FREE_SHIPPING_TEXT } from '@stoncrops/shared';

export function CartDrawer() {
  const {
    cart,
    isCartOpen,
    closeCart,
    openCheckout,
    updateQuantity,
    removeFromCart,
  } = useCart();

  if (!isCartOpen) return null;

  const subtotal = (cart?.price || 0) * (cart?.quantity || 0);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeCart}
          className="absolute inset-0 bg-obsidian-950/70 backdrop-blur-xs transition-opacity"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex w-full justify-end">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="w-full sm:w-screen sm:max-w-md bg-cream-50 border-l border-cream-300 shadow-2xl flex flex-col justify-between h-full"
          >
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-cream-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-widest text-obsidian-950">
                  Your Shopping Bag
                </h3>
                <span className="text-[11px] sm:text-xs text-obsidian-500 font-medium">
                  {cart ? `${cart.quantity} Item in bag` : '0 Items'}
                </span>
              </div>
              <button
                onClick={closeCart}
                className="p-1.5 sm:p-2 text-obsidian-600 hover:text-obsidian-950 hover:bg-cream-200 transition-colors rounded"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Notification */}
            <div className="bg-emerald-50 border-b border-emerald-100 px-4 sm:px-6 py-2 sm:py-2.5 flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="truncate">{FREE_SHIPPING_TEXT} (Applied)</span>
            </div>

            {/* Cart Body */}
            <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
              {!cart ? (
                <div className="py-16 sm:py-20 text-center space-y-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-cream-200 rounded-full flex items-center justify-center mx-auto text-obsidian-400">
                    <Trash2 className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-obsidian-900">Your bag is currently empty</h4>
                  <p className="text-xs text-obsidian-500 max-w-xs mx-auto">
                    Select your preferred size and add the Embroidered Edition to your bag to proceed.
                  </p>
                  <button
                    onClick={closeCart}
                    className="mt-2 px-5 py-2.5 bg-obsidian-950 text-white text-xs uppercase tracking-wider font-bold hover:bg-burgundy-800 transition-colors"
                  >
                    Explore Garment
                  </button>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-white border border-cream-300 p-3 sm:p-4 rounded-none flex gap-3 sm:gap-4 relative">
                    <img
                      src={cart.imageUrl}
                      alt={cart.name}
                      className="w-16 h-20 sm:w-20 sm:h-24 object-cover bg-cream-100 border border-cream-200 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-obsidian-950 truncate">
                        {cart.name}
                      </h4>
                      <p className="text-[11px] text-obsidian-500">{cart.subtitle}</p>

                      <div className="mt-2 flex items-center gap-2.5">
                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-obsidian-800 bg-cream-100 px-2 py-0.5 rounded border border-cream-200">
                          Size: {cart.size}
                        </span>
                        <span className="text-xs font-extrabold text-obsidian-950">
                          ₹{cart.price.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* Quantity Selector */}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="inline-flex items-center border border-cream-300 bg-cream-50">
                          <button
                            onClick={() => updateQuantity(cart.quantity - 1)}
                            className="p-1 text-obsidian-600 hover:text-obsidian-950 hover:bg-cream-200 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-obsidian-900">
                            {cart.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(cart.quantity + 1)}
                            className="p-1 text-obsidian-600 hover:text-obsidian-950 hover:bg-cream-200 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={removeFromCart}
                          className="text-[10px] sm:text-[11px] text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Cart Footer / Checkout Trigger */}
            {cart && (
              <div className="p-4 sm:p-6 bg-white border-t border-cream-300 space-y-3 sm:space-y-4">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-obsidian-600">
                    <span>Garment Subtotal:</span>
                    <span className="font-semibold text-obsidian-950">
                      ₹{subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-obsidian-600">
                    <span>Shipping Fee:</span>
                    <span className="font-bold text-emerald-700 uppercase">FREE</span>
                  </div>
                  <div className="border-t border-cream-200 pt-2 flex justify-between text-sm font-bold text-obsidian-950">
                    <span>Total Amount Payable:</span>
                    <span className="text-base font-extrabold">
                      ₹{subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    closeCart();
                    openCheckout();
                  }}
                  className="w-full py-3.5 sm:py-4 bg-obsidian-950 text-white hover:bg-burgundy-800 active:bg-burgundy-900 transition-colors text-xs uppercase tracking-[0.22em] font-extrabold flex items-center justify-center gap-2 shadow-lg touch-manipulation"
                >
                  <span>PROCEED TO CHECKOUT</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-obsidian-500 uppercase tracking-wider font-semibold text-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-burgundy-700 shrink-0" />
                  Instant UPI & Netbanking Verification
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
