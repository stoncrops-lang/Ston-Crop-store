import { z } from 'zod';

// Indian 10-digit mobile number starting with 6, 7, 8, or 9
export const indianPhoneRegex = /^[6-9]\d{9}$/;

// Indian 6-digit postal code (PIN code)
export const indianPincodeRegex = /^[1-9][0-9]{5}$/;

export const sizeEnumSchema = z.enum(['S', 'M', 'L']);

export const shippingAddressSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be under 100 characters')
    .regex(/^[a-zA-Z\s.'-]+$/, 'Name contains invalid characters'),
  phone: z
    .string()
    .trim()
    .transform((val) => val.replace(/[\s\-+]/g, '').replace(/^91/, ''))
    .refine((val) => indianPhoneRegex.test(val), {
      message: 'Please enter a valid 10-digit Indian mobile number',
    }),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address')
    .max(150, 'Email address is too long'),
  houseBuilding: z
    .string()
    .trim()
    .min(1, 'Flat / House / Building name is required')
    .max(120, 'House / Building details too long'),
  streetAddress: z
    .string()
    .trim()
    .min(3, 'Street address is required')
    .max(150, 'Street address is too long'),
  areaLocality: z
    .string()
    .trim()
    .min(2, 'Area / Locality / Landmark is required')
    .max(120, 'Area details too long'),
  city: z
    .string()
    .trim()
    .min(2, 'City is required')
    .max(80, 'City name is too long'),
  state: z
    .string()
    .trim()
    .min(2, 'State is required')
    .max(80, 'State name is too long'),
  pincode: z
    .string()
    .trim()
    .refine((val) => indianPincodeRegex.test(val), {
      message: 'Please enter a valid 6-digit Indian PIN code',
    }),
});

export const createOrderSchema = z.object({
  size: sizeEnumSchema,
  quantity: z.number().int().min(1).max(5, 'Maximum 5 pieces per order'),
  shippingAddress: shippingAddressSchema,
  sessionId: z.string().optional(),
});

export const verifyPaymentSchema = z.object({
  orderId: z.string().uuid('Invalid order ID'),
  razorpayOrderId: z.string().min(1, 'Razorpay order ID required'),
  razorpayPaymentId: z.string().min(1, 'Razorpay payment ID required'),
  razorpaySignature: z.string().min(1, 'Razorpay signature required'),
});

export const reviewSubmissionSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(60, 'Name must be under 60 characters'),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(100).optional(),
  comment: z
    .string()
    .trim()
    .min(10, 'Review must be at least 10 characters')
    .max(1000, 'Review cannot exceed 1000 characters'),
  orderNumber: z.string().trim().optional(),
  // Honeypot field for bot protection
  website_url: z.string().max(0, 'Spam detected').optional(),
});

export const updateInventorySchema = z.object({
  variantId: z.string().uuid(),
  availableStock: z.number().int().min(0, 'Stock cannot be negative'),
  lowStockThreshold: z.number().int().min(0).optional(),
});

export const updateOrderStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum([
    'pending_payment',
    'paid',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded',
  ]),
  notes: z.string().max(500).optional(),
});
