'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { GarmentSize, CartItem, CheckoutFormData } from '@stoncrops/types';
import { PRODUCT_NAME, PRODUCT_PRICE } from '@stoncrops/shared';

interface CartContextType {
  cart: CartItem | null;
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  isSizeGuideOpen: boolean;
  selectedSize: GarmentSize;
  setSelectedSize: (size: GarmentSize) => void;
  openCart: () => void;
  closeCart: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  openSizeGuide: () => void;
  closeSizeGuide: () => void;
  addToCart: (size: GarmentSize, quantity?: number) => void;
  buyNow: (size: GarmentSize, quantity?: number) => void;
  updateQuantity: (quantity: number) => void;
  removeFromCart: () => void;
  clearCart: () => void;
  checkoutData: CheckoutFormData | null;
  setCheckoutData: (data: CheckoutFormData) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<GarmentSize>('M');
  const [checkoutData, setCheckoutData] = useState<CheckoutFormData | null>(null);

  // Restore cart and saved address from localStorage safely on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('stoncrops_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
      const savedCheckout = localStorage.getItem('stoncrops_checkout_pref');
      if (savedCheckout) {
        setCheckoutData(JSON.parse(savedCheckout));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const saveCart = (newCart: CartItem | null) => {
    setCart(newCart);
    try {
      if (newCart) {
        localStorage.setItem('stoncrops_cart', JSON.stringify(newCart));
      } else {
        localStorage.removeItem('stoncrops_cart');
      }
    } catch {
      // Ignore storage errors
    }
  };

  const addToCart = (size: GarmentSize, quantity: number = 1) => {
    const item: CartItem = {
      productId: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
      variantId:
        size === 'S'
          ? '11111111-1111-4111-8111-111111111111'
          : size === 'M'
          ? '22222222-2222-4222-8222-222222222222'
          : '33333333-3333-4333-8333-333333333333',
      name: PRODUCT_NAME,
      subtitle: 'Embroidered Edition',
      size,
      price: PRODUCT_PRICE,
      quantity,
      imageUrl: '/images/product/front-editorial.svg',
    };
    saveCart(item);
    setIsCartOpen(true);
  };

  const buyNow = (size: GarmentSize, quantity: number = 1) => {
    const item: CartItem = {
      productId: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
      variantId:
        size === 'S'
          ? '11111111-1111-4111-8111-111111111111'
          : size === 'M'
          ? '22222222-2222-4222-8222-222222222222'
          : '33333333-3333-4333-8333-333333333333',
      name: PRODUCT_NAME,
      subtitle: 'Embroidered Edition',
      size,
      price: PRODUCT_PRICE,
      quantity,
      imageUrl: '/images/product/front-editorial.svg',
    };
    saveCart(item);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const updateQuantity = (quantity: number) => {
    if (!cart) return;
    if (quantity <= 0) {
      removeFromCart();
      return;
    }
    const updated = { ...cart, quantity: Math.min(5, quantity) };
    saveCart(updated);
  };

  const removeFromCart = () => {
    saveCart(null);
  };

  const clearCart = () => {
    saveCart(null);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        isCheckoutOpen,
        isSizeGuideOpen,
        selectedSize,
        setSelectedSize,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        openCheckout: () => setIsCheckoutOpen(true),
        closeCheckout: () => setIsCheckoutOpen(false),
        openSizeGuide: () => setIsSizeGuideOpen(true),
        closeSizeGuide: () => setIsSizeGuideOpen(false),
        addToCart,
        buyNow,
        updateQuantity,
        removeFromCart,
        clearCart,
        checkoutData,
        setCheckoutData: (data) => {
          setCheckoutData(data);
          try {
            localStorage.setItem('stoncrops_checkout_pref', JSON.stringify(data));
          } catch {}
        },
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
