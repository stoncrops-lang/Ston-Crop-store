export type GarmentSize = 'S' | 'M' | 'L';

export interface SizeMeasurement {
  size: GarmentSize;
  chestInches: number;
  chestCm: number;
  lengthInches: number;
  lengthCm: number;
  shoulderInches: number;
  shoulderCm: number;
  sleeveInches: number;
  sleeveCm: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  subtitle: string;
  collection: string;
  description: string;
  material: string;
  baseColor: string;
  silhouette: string;
  embroideryDetails: string;
  chestBranding: string;
  price: number;
  currency: string;
  freeShipping: boolean;
  isActive: boolean;
  careInstructions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  size: GarmentSize;
  sku: string;
  price: number;
  isActive: boolean;
  inventory?: Inventory;
}

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  altText: string;
  sortOrder: number;
  isPrimary: boolean;
  caption?: string;
  createdAt: string;
}

export interface Inventory {
  id: string;
  variantId: string;
  size: GarmentSize;
  availableStock: number;
  reservedStock: number;
  soldStock: number;
  lowStockThreshold: number;
  updatedAt: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  houseBuilding: string;
  streetAddress: string;
  areaLocality: string;
  city: string;
  state: string;
  pincode: string;
}

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus =
  | 'pending'
  | 'authorized'
  | 'captured'
  | 'failed'
  | 'refunded';

export interface OrderItem {
  id: string;
  orderId: string;
  variantId: string;
  productName: string;
  size: GarmentSize;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingAddress: ShippingAddress;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
}

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface Review {
  id: string;
  customerName: string;
  rating: number; // 1 to 5
  title?: string;
  comment: string;
  orderId?: string;
  isVerifiedPurchase: boolean;
  status: ReviewStatus;
  createdAt: string;
  approvedAt?: string;
}

export interface AdminRole {
  id: string;
  name: 'super_admin' | 'manager' | 'support';
  description: string;
  permissions: string[];
}

export interface AdminUser {
  id: string;
  authUserId: string;
  email: string;
  fullName: string;
  roleId: string;
  role?: AdminRole;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export type AnalyticsEventType =
  | 'page_view'
  | 'product_view'
  | 'size_select'
  | 'size_guide_open'
  | 'add_to_cart'
  | 'buy_now_click'
  | 'checkout_start'
  | 'payment_attempt'
  | 'payment_success'
  | 'payment_failed';

export interface AnalyticsEvent {
  id: string;
  sessionId: string;
  eventType: AnalyticsEventType;
  pagePath: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface SessionHeartbeat {
  sessionId: string;
  ipHash?: string;
  userAgent?: string;
  lastHeartbeat: string;
  isActive: boolean;
}

export type NotificationType = 'whatsapp' | 'email';
export type NotificationStatus = 'pending' | 'sent' | 'failed';

export interface NotificationLog {
  id: string;
  orderId: string;
  type: NotificationType;
  recipient: string;
  payload: Record<string, unknown>;
  status: NotificationStatus;
  attempts: number;
  errorMessage?: string;
  sentAt?: string;
  createdAt: string;
}

export interface StoreSettings {
  id: string;
  heroHeadline: string;
  heroSubheadline: string;
  announcementBarText: string;
  announcementBarActive: boolean;
  contactEmail: string;
  contactPhone: string;
  instagramHandle: string;
  freeShippingThreshold: number;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  subtitle: string;
  size: GarmentSize;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface CheckoutFormData {
  fullName: string;
  phone: string;
  email: string;
  houseBuilding: string;
  streetAddress: string;
  areaLocality: string;
  city: string;
  state: string;
  pincode: string;
}

export interface RazorpayCreateOrderRequest {
  size: GarmentSize;
  quantity: number;
  shippingAddress: CheckoutFormData;
}

export interface RazorpayCreateOrderResponse {
  success: boolean;
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface RazorpayVerifyPaymentRequest {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}
