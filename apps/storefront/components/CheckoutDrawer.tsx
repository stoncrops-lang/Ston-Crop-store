'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useCart } from '../lib/cart-context';
import { CheckoutFormData } from '@stoncrops/types';
import { shippingAddressSchema } from '@stoncrops/shared';
import confetti from 'canvas-confetti';

interface ConfirmedOrder {
  orderNumber: string;
  size: string;
  quantity: number;
  totalAmount: number;
  customerName: string;
  shippingAddress: CheckoutFormData;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay?: any;
  }
}

export function CheckoutDrawer() {
  const {
    cart,
    isCheckoutOpen,
    closeCheckout,
    openCart,
    clearCart,
    checkoutData,
    setCheckoutData,
  } = useCart();

  const [formData, setFormData] = useState<CheckoutFormData>(
    checkoutData || {
      fullName: '',
      phone: '',
      email: '',
      houseBuilding: '',
      streetAddress: '',
      areaLocality: '',
      city: '',
      state: '',
      pincode: '',
    }
  );

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrder | null>(null);

  if (!isCheckoutOpen) return null;

  const totalAmount = (cart?.price || 1199) * (cart?.quantity || 1);

  const handleInputChange = (field: keyof CheckoutFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!cart) {
      setErrorMessage('Your cart is empty. Please select a size first.');
      return;
    }

    // Validate using Zod schema
    const validation = shippingAddressSchema.safeParse(formData);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[String(err.path[0])] = err.message;
        }
      });
      setFormErrors(errors);
      return;
    }

    // Persist address preferences
    setCheckoutData(formData);

    try {
      setLoading(true);

      // 1. Create order on server
      const createRes = await fetch('/api/checkout/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          size: cart.size,
          quantity: cart.quantity,
          shippingAddress: formData,
        }),
      });

      const orderData = await createRes.json();
      if (!createRes.ok || !orderData.success) {
        throw new Error(orderData.error || 'Failed to initialize payment order');
      }

      // Check if server operates in Sandbox / Mock verification mode (e.g. before live Razorpay API keys are configured by owner)
      if (orderData.isTestModeMock) {
        // Automatically verify mock test order on server
        const verifyRes = await fetch('/api/checkout/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderData.orderId,
            razorpayOrderId: orderData.razorpayOrderId,
            razorpayPaymentId: `pay_mock_${Date.now()}`,
            razorpaySignature: 'mock_verified_signature',
          }),
        });

        const verifyData = await verifyRes.json();
        if (verifyData.success) {
          triggerSuccess(verifyData.orderNumber || orderData.orderNumber);
        } else {
          throw new Error(verifyData.error || 'Payment verification failed');
        }
        return;
      }

      // 2. Load official Razorpay Checkout SDK
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Failed to load secure Razorpay gateway. Please check your network connection.');
      }

      // 3. Open Razorpay UPI Modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'STONCROPS',
        description: `Embroidered Edition (Size ${cart.size})`,
        image: '/images/product/front-editorial.svg',
        order_id: orderData.razorpayOrderId,
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#722F37', // Signature burgundy theme
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            // 4. Server-Side Signature Verification (Never trust browser alone)
            const verifyRes = await fetch('/api/checkout/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: orderData.orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              triggerSuccess(verifyData.orderNumber || orderData.orderNumber);
            } else {
              throw new Error(verifyData.error || 'Payment verification failed on server');
            }
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            setErrorMessage(`Verification Error: ${msg}`);
            setLoading(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp: { error: { description: string } }) => {
        setErrorMessage(resp.error?.description || 'Payment was unsuccessful. Please retry with UPI.');
        setLoading(false);
      });
      rzp.open();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setErrorMessage(message);
      setLoading(false);
    }
  };

  const triggerSuccess = (orderNumber: string) => {
    if (!cart) return;
    setConfirmedOrder({
      orderNumber,
      size: cart.size,
      quantity: cart.quantity,
      totalAmount,
      customerName: formData.fullName,
      shippingAddress: { ...formData },
    });
    clearCart();
    setLoading(false);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#722F37', '#FAF8F5', '#161619'],
      });
    } catch { }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (!loading && !confirmedOrder) closeCheckout();
          }}
          className="absolute inset-0 bg-obsidian-950/70 backdrop-blur-xs"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex w-full justify-end">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="w-full sm:w-screen sm:max-w-xl bg-cream-50 border-l border-cream-300 shadow-2xl flex flex-col justify-between overflow-y-auto h-full"
          >
            {/* Confirmed Order State */}
            {confirmedOrder ? (
              <div className="p-8 sm:p-12 flex-1 flex flex-col justify-between">
                <div className="space-y-6 text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-700">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-burgundy-700 block mb-1">
                      ORDER OFFICIALLY CONFIRMED
                    </span>
                    <h3 className="text-2xl font-extrabold text-obsidian-950">
                      Thank You, {confirmedOrder.customerName}
                    </h3>
                    <p className="text-xs text-obsidian-600 mt-1">
                      Your order #{confirmedOrder.orderNumber} is confirmed and reserved in our archive.
                    </p>
                  </div>

                  {/* Summary Card */}
                  <div className="bg-white border border-cream-300 p-6 text-left space-y-4 rounded-none text-xs">
                    <div className="flex justify-between border-b border-cream-200 pb-3">
                      <div>
                        <span className="font-bold text-obsidian-950 block">
                          STONCROPS — Embroidered Edition
                        </span>
                        <span className="text-obsidian-500">
                          Size: <strong>{confirmedOrder.size}</strong> &nbsp;•&nbsp; Quantity: {confirmedOrder.quantity}
                        </span>
                      </div>
                      <span className="font-extrabold text-obsidian-950">
                        ₹{confirmedOrder.totalAmount.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div>
                      <span className="font-bold text-obsidian-800 uppercase text-[10px] tracking-wider block mb-1">
                        Delivery Destination
                      </span>
                      <p className="text-obsidian-600 leading-relaxed">
                        {confirmedOrder.shippingAddress.houseBuilding}, {confirmedOrder.shippingAddress.streetAddress}
                        <br />
                        {confirmedOrder.shippingAddress.areaLocality}
                        <br />
                        {confirmedOrder.shippingAddress.city}, {confirmedOrder.shippingAddress.state} — {confirmedOrder.shippingAddress.pincode}
                        <br />
                        Phone: {confirmedOrder.shippingAddress.phone}
                      </p>
                    </div>

                    <div className="border-t border-cream-200 pt-3 flex items-center justify-between font-bold">
                      <span className="text-obsidian-700">Payment Status:</span>
                      <span className="text-emerald-700 uppercase">Paid (Verified via Razorpay)</span>
                    </div>
                  </div>

                  <div className="bg-cream-100 border border-cream-200 p-4 text-xs text-obsidian-600 text-left">
                    <p className="font-semibold text-obsidian-900 mb-1">What Happens Next?</p>
                    <p>
                      Our dispatch hub is preparing your piece. You will receive real-time WhatsApp & email tracking updates as soon as the courier scans your package.
                    </p>
                  </div>
                </div>

                <div className="pt-8">
                  <button
                    onClick={() => {
                      setConfirmedOrder(null);
                      closeCheckout();
                    }}
                    className="w-full py-4 bg-obsidian-950 text-white text-xs uppercase tracking-[0.25em] font-extrabold hover:bg-burgundy-800 transition-colors"
                  >
                    RETURN TO STOREFRONT
                  </button>
                </div>
              </div>
            ) : (
              /* Checkout Form */
              <div className="flex-1 flex flex-col justify-between">
                {/* Header */}
                <div className="p-4 sm:p-6 border-b border-cream-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        closeCheckout();
                        openCart();
                      }}
                      className="p-1.5 text-obsidian-600 hover:text-obsidian-950 rounded active:bg-cream-200"
                      aria-label="Back to bag"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-widest text-obsidian-950">
                        Express Checkout
                      </h3>
                      <span className="text-[11px] sm:text-xs text-obsidian-500 font-medium">
                        Direct Purchase • No Account Required
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={closeCheckout}
                    className="p-1.5 sm:p-2 text-obsidian-600 hover:text-obsidian-950 hover:bg-cream-200 rounded"
                    aria-label="Close checkout"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form Body */}
                <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-5 sm:space-y-6">
                  {errorMessage && (
                    <div className="bg-red-50 border border-red-200 p-3 text-red-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Order Line Item Preview */}
                  {cart && (
                    <div className="bg-white border border-cream-200 p-3.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={cart.imageUrl}
                          alt={cart.name}
                          className="w-12 h-14 object-cover bg-cream-100 border border-cream-200"
                        />
                        <div>
                          <p className="font-bold text-obsidian-950">{cart.name}</p>
                          <p className="text-obsidian-500">
                            Size: <strong className="text-burgundy-700">{cart.size}</strong> &nbsp;•&nbsp; Qty: {cart.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-extrabold text-obsidian-950">
                        ₹{totalAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}

                  <form id="checkout-form" onSubmit={handleProceedToPayment} className="space-y-4 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-obsidian-700 block mb-3 border-b border-cream-200 pb-1">
                        1. Contact Information
                      </span>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[11px] font-bold uppercase text-obsidian-800 mb-1">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.fullName}
                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                            placeholder="e.g. Rahul Verma"
                            className={`w-full p-2.5 border text-xs focus:outline-none focus:ring-1 focus:ring-obsidian-950 ${formErrors.fullName ? 'border-red-500 bg-red-50/20' : 'border-cream-300'
                              }`}
                          />
                          {formErrors.fullName && (
                            <p className="text-red-500 text-[10px] mt-1">{formErrors.fullName}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold uppercase text-obsidian-800 mb-1">
                              Mobile Number (For WhatsApp Updates) *
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-2.5 text-obsidian-400 font-medium">
                                +91
                              </span>
                              <input
                                type="tel"
                                required
                                maxLength={10}
                                value={formData.phone}
                                onChange={(e) =>
                                  handleInputChange(
                                    'phone',
                                    e.target.value.replace(/\D/g, '')
                                  )
                                }
                                placeholder="9876543210"
                                className={`w-full pl-11 pr-2.5 py-2.5 border text-xs focus:outline-none focus:ring-1 focus:ring-obsidian-950 ${formErrors.phone ? 'border-red-500 bg-red-50/20' : 'border-cream-300'
                                  }`}
                              />
                            </div>
                            {formErrors.phone && (
                              <p className="text-red-500 text-[10px] mt-1">{formErrors.phone}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold uppercase text-obsidian-800 mb-1">
                              Email Address (For Receipt) *
                            </label>
                            <input
                              type="email"
                              required
                              value={formData.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              placeholder="name@example.com"
                              className={`w-full p-2.5 border text-xs focus:outline-none focus:ring-1 focus:ring-obsidian-950 ${formErrors.email ? 'border-red-500 bg-red-50/20' : 'border-cream-300'
                                }`}
                            />
                            {formErrors.email && (
                              <p className="text-red-500 text-[10px] mt-1">{formErrors.email}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3">
                      <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-obsidian-700 block mb-3 border-b border-cream-200 pb-1">
                        2. Delivery Address (India Only)
                      </span>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[11px] font-bold uppercase text-obsidian-800 mb-1">
                            Flat / House No. / Building Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.houseBuilding}
                            onChange={(e) => handleInputChange('houseBuilding', e.target.value)}
                            placeholder="e.g. Flat 402, Lotus Residency"
                            className={`w-full p-2.5 border text-xs focus:outline-none focus:ring-1 focus:ring-obsidian-950 ${formErrors.houseBuilding ? 'border-red-500 bg-red-50/20' : 'border-cream-300'
                              }`}
                          />
                          {formErrors.houseBuilding && (
                            <p className="text-red-500 text-[10px] mt-1">{formErrors.houseBuilding}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase text-obsidian-800 mb-1">
                            Street Address / Road Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.streetAddress}
                            onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                            placeholder="e.g. 12th Main Road, 4th Cross"
                            className={`w-full p-2.5 border text-xs focus:outline-none focus:ring-1 focus:ring-obsidian-950 ${formErrors.streetAddress ? 'border-red-500 bg-red-50/20' : 'border-cream-300'
                              }`}
                          />
                          {formErrors.streetAddress && (
                            <p className="text-red-500 text-[10px] mt-1">{formErrors.streetAddress}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase text-obsidian-800 mb-1">
                            Area / Locality / Landmark *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.areaLocality}
                            onChange={(e) => handleInputChange('areaLocality', e.target.value)}
                            placeholder="e.g. Indiranagar, near Metro Station"
                            className={`w-full p-2.5 border text-xs focus:outline-none focus:ring-1 focus:ring-obsidian-950 ${formErrors.areaLocality ? 'border-red-500 bg-red-50/20' : 'border-cream-300'
                              }`}
                          />
                          {formErrors.areaLocality && (
                            <p className="text-red-500 text-[10px] mt-1">{formErrors.areaLocality}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold uppercase text-obsidian-800 mb-1">
                              City *
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.city}
                              onChange={(e) => handleInputChange('city', e.target.value)}
                              placeholder="e.g. Bangalore"
                              className={`w-full p-2.5 border text-xs focus:outline-none focus:ring-1 focus:ring-obsidian-950 ${formErrors.city ? 'border-red-500 bg-red-50/20' : 'border-cream-300'
                                }`}
                            />
                            {formErrors.city && (
                              <p className="text-red-500 text-[10px] mt-1">{formErrors.city}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold uppercase text-obsidian-800 mb-1">
                              State *
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.state}
                              onChange={(e) => handleInputChange('state', e.target.value)}
                              placeholder="e.g. Karnataka"
                              className={`w-full p-2.5 border text-xs focus:outline-none focus:ring-1 focus:ring-obsidian-950 ${formErrors.state ? 'border-red-500 bg-red-50/20' : 'border-cream-300'
                                }`}
                            />
                            {formErrors.state && (
                              <p className="text-red-500 text-[10px] mt-1">{formErrors.state}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold uppercase text-obsidian-800 mb-1">
                              PIN Code *
                            </label>
                            <input
                              type="text"
                              required
                              maxLength={6}
                              value={formData.pincode}
                              onChange={(e) =>
                                handleInputChange(
                                  'pincode',
                                  e.target.value.replace(/\D/g, '')
                                )
                              }
                              placeholder="560038"
                              className={`w-full p-2.5 border text-xs focus:outline-none focus:ring-1 focus:ring-obsidian-950 ${formErrors.pincode ? 'border-red-500 bg-red-50/20' : 'border-cream-300'
                                }`}
                            />
                            {formErrors.pincode && (
                              <p className="text-red-500 text-[10px] mt-1">{formErrors.pincode}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>

                {/* Footer Payment Trigger */}
                <div className="p-6 bg-white border-t border-cream-300 space-y-4">
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-obsidian-600">
                      <span>Product Amount:</span>
                      <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-obsidian-600">
                      <span>Shipping Across India:</span>
                      <span className="font-bold text-emerald-700 uppercase">FREE</span>
                    </div>
                    <div className="border-t border-cream-200 pt-2 flex justify-between text-base font-extrabold text-obsidian-950">
                      <span>Total Amount:</span>
                      <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    form="checkout-form"
                    disabled={loading}
                    className="w-full py-4 bg-obsidian-950 text-white hover:bg-burgundy-800 transition-colors text-xs uppercase tracking-[0.25em] font-extrabold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>INITIALIZING SECURE CHECKOUT...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>PAY ₹{totalAmount.toLocaleString('en-IN')} VIA UPI</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 text-[10px] text-obsidian-500 uppercase tracking-wider font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-burgundy-700" />
                    Razorpay 256-Bit SSL Encrypted • Zero COD Fee
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
