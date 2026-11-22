'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth-context';
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  Package,
  Image as ImageIcon,
  Star,
  Users,
  Settings,
  LogOut,
  RefreshCw,
  Search,
  Download,
  CheckCircle,
  XCircle,
  Upload,
  Trash2,
  TrendingUp,
  AlertTriangle,
  Eye,
  Loader2,
  Plus,
  Crown,
  Copy,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  Monitor,
  Tablet,
  Radio,
  Activity,
  Sparkles,
  ArrowUpRight,
  BarChart3,
  Check,
} from 'lucide-react';
import { BRAND_NAME, INSTAGRAM_URL } from '@stoncrops/shared';

type AdminTab =
  | 'overview'
  | 'orders'
  | 'inventory'
  | 'product'
  | 'images'
  | 'reviews'
  | 'customers'
  | 'settings';

export default function AdminDashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Metrics State
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [metrics, setMetrics] = useState<any>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  // Orders State
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [orders, setOrders] = useState<any[]>([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any | null>(null);

  // Inventory State
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [inventory, setInventory] = useState<any[]>([]);
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [editStockVal, setEditStockVal] = useState<number>(0);

  // Reviews State
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);
  const [newReviewForm, setNewReviewForm] = useState({
    customerName: '',
    rating: 5,
    title: '',
    comment: '',
    isVerifiedPurchase: true,
    status: 'approved' as 'approved' | 'pending',
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewToast, setReviewToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Customers State
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [customers, setCustomers] = useState<any[]>([]);

  // Images State
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [images, setImages] = useState<any[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageCaption, setImageCaption] = useState('');
  const [imageIsPrimary, setImageIsPrimary] = useState(false);
  const [imageSortOrder, setImageSortOrder] = useState(0);
  const [imageToast, setImageToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedUrlId, setCopiedUrlId] = useState<string | null>(null);

  // Store Settings State
  const [announcementText, setAnnouncementText] = useState(
    'FREE SHIPPING ON ALL ORDERS ACROSS INDIA — EMBROIDERED EDITION'
  );
  const [heroHeadline, setHeroHeadline] = useState('STONCROPS');
  const [contactEmail, setContactEmail] = useState('contact@stoncrops.com');
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  const loadAllData = async () => {
    fetchMetrics();
    fetchOrders();
    fetchInventory();
    fetchReviews();
    fetchCustomers();
    fetchImages();
  };

  const fetchMetrics = async () => {
    try {
      setLoadingMetrics(true);
      const res = await fetch('/api/admin/metrics');
      const data = await res.json();
      if (data.success) {
        setMetrics(data.metrics);
      }
    } catch {
    } finally {
      setLoadingMetrics(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const url =
        orderStatusFilter === 'all'
          ? `/api/admin/orders?search=${encodeURIComponent(orderSearchQuery)}`
          : `/api/admin/orders?status=${orderStatusFilter}&search=${encodeURIComponent(
              orderSearchQuery
            )}`;
      const res = await fetch(url);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {}
  };

  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/admin/inventory');
      const data = await res.json();
      setInventory(data.inventory || []);
    } catch {}
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/admin/reviews');
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch {}
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/admin/customers');
      const data = await res.json();
      setCustomers(data.customers || []);
    } catch {}
  };

  const fetchImages = async () => {
    try {
      const res = await fetch('/api/admin/images');
      const data = await res.json();
      setImages(data.images || []);
    } catch {}
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status }),
      });
      if (res.ok) {
        fetchOrders();
        fetchMetrics();
        if (selectedOrderDetails?.id === orderId) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setSelectedOrderDetails((prev: any) => ({ ...prev, status }));
        }
      }
    } catch {}
  };

  const saveInventoryStock = async (variantId: string) => {
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId, availableStock: editStockVal }),
      });
      if (res.ok) {
        setEditingVariantId(null);
        fetchInventory();
        fetchMetrics();
      }
    } catch {}
  };

  // Review Actions
  const moderateReview = async (reviewId: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, status }),
      });
      if (res.ok) {
        setReviewToast({
          type: 'success',
          message: status === 'approved' ? 'Review approved & published to store!' : 'Review rejected & hidden.',
        });
        setTimeout(() => setReviewToast(null), 3000);
        fetchReviews();
      }
    } catch {}
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to permanently delete this customer review?')) return;
    try {
      const res = await fetch(`/api/admin/reviews?id=${reviewId}`, { method: 'DELETE' });
      if (res.ok) {
        setReviewToast({ type: 'success', message: 'Review deleted.' });
        setTimeout(() => setReviewToast(null), 3000);
        fetchReviews();
      }
    } catch {}
  };

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewForm.customerName.trim() || !newReviewForm.comment.trim()) {
      alert('Customer name and feedback are required');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReviewForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to publish review');
      }

      setShowAddReviewModal(false);
      setNewReviewForm({
        customerName: '',
        rating: 5,
        title: '',
        comment: '',
        isVerifiedPurchase: true,
        status: 'approved',
      });
      setReviewToast({ type: 'success', message: 'Customer testimonial added successfully!' });
      setTimeout(() => setReviewToast(null), 3000);
      fetchReviews();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmittingReview(false);
    }
  };

  const seedSampleReviews = async () => {
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed_defaults' }),
      });
      if (res.ok) {
        setReviewToast({ type: 'success', message: 'Sample verified reviews seeded!' });
        setTimeout(() => setReviewToast(null), 3000);
        fetchReviews();
      }
    } catch {}
  };

  // Image Gallery Handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setImageToast({ type: 'error', message: 'Only JPEG, PNG, and WebP images are allowed.' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageToast({ type: 'error', message: 'Photograph exceeds 5MB size limit.' });
      return;
    }

    setSelectedImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    setImageCaption('');
    setImageIsPrimary(images.length === 0);
    setImageSortOrder(images.length);
    setImageToast(null);
  };

  const cancelImageSelection = () => {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setSelectedImageFile(null);
    setImagePreviewUrl(null);
    setImageCaption('');
    setImageToast(null);
  };

  const submitImageUpload = async () => {
    if (!selectedImageFile) return;

    try {
      setUploadingImage(true);
      setImageToast(null);

      const fd = new FormData();
      fd.append('file', selectedImageFile);
      fd.append('caption', imageCaption.trim() || 'STONCROPS Garment Photograph');
      fd.append('altText', imageCaption.trim() || 'STONCROPS Garment Photograph');
      fd.append('isPrimary', imageIsPrimary ? 'true' : 'false');
      fd.append('sortOrder', String(imageSortOrder));

      const res = await fetch('/api/admin/images', {
        method: 'POST',
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save photograph');
      }

      setImageToast({ type: 'success', message: 'Photograph saved successfully!' });
      cancelImageSelection();
      fetchImages();
      setTimeout(() => setImageToast(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setImageToast({ type: 'error', message: msg });
    } finally {
      setUploadingImage(false);
    }
  };

  const setAsPrimaryImage = async (imageId: string) => {
    try {
      const res = await fetch('/api/admin/images', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId, isPrimary: true }),
      });
      if (res.ok) {
        setImageToast({ type: 'success', message: 'Set as primary hero photograph!' });
        setTimeout(() => setImageToast(null), 2500);
        fetchImages();
      }
    } catch {}
  };

  const deleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to remove this photograph?')) return;
    try {
      const res = await fetch(`/api/admin/images?id=${imageId}`, { method: 'DELETE' });
      if (res.ok) {
        setImageToast({ type: 'success', message: 'Photograph removed.' });
        setTimeout(() => setImageToast(null), 2500);
        fetchImages();
      }
    } catch {}
  };

  const seedDefaultImages = async () => {
    try {
      setUploadingImage(true);
      const res = await fetch('/api/admin/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed_defaults' }),
      });
      if (res.ok) {
        setImageToast({ type: 'success', message: 'Default campaign placeholders seeded!' });
        setTimeout(() => setImageToast(null), 2500);
        fetchImages();
      }
    } catch {
    } finally {
      setUploadingImage(false);
    }
  };

  const copyImageUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrlId(id);
    setTimeout(() => setCopiedUrlId(null), 2000);
  };

  const saveStoreSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'announcement_bar',
          value: { text: announcementText, enabled: true },
        }),
      });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2000);
    } catch {}
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-obsidian-950 flex items-center justify-center text-zinc-400 text-xs">
        <Loader2 className="w-5 h-5 animate-spin mr-2 text-burgundy-500" />
        Authenticating management session...
      </div>
    );
  }

  // Filter reviews
  const filteredReviews = reviews.filter((r) => {
    if (reviewFilter === 'all') return true;
    return r.status === reviewFilter;
  });

  const pendingReviewsCount = reviews.filter((r) => r.status === 'pending').length;
  const approvedReviewsCount = reviews.filter((r) => r.status === 'approved').length;
  const rejectedReviewsCount = reviews.filter((r) => r.status === 'rejected').length;

  return (
    <div className="min-h-screen bg-obsidian-950 text-zinc-200 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-obsidian-900 border-b border-zinc-800 px-3 sm:px-8 py-3 sm:py-3.5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2.5 sm:gap-4">
          <span className="wordmark text-base sm:text-xl font-extrabold tracking-[0.22em] sm:tracking-[0.25em] text-white">
            {BRAND_NAME}
          </span>
          <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-burgundy-400 bg-burgundy-950/80 px-2 py-0.5 rounded border border-burgundy-900">
            ADMIN
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 text-xs">
          <button
            onClick={loadAllData}
            className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors"
            title="Refresh database records"
          >
            <RefreshCw className={`w-4 h-4 ${loadingMetrics ? 'animate-spin text-burgundy-400' : ''}`} />
          </button>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 px-2.5 py-1 rounded transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Storefront
          </a>

          <div className="hidden sm:block text-right border-l border-zinc-800 pl-4">
            <span className="font-bold text-white block text-xs">{user?.fullName || 'STONCROPS Founder'}</span>
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider">
              {user?.role?.replace('_', ' ') || 'SUPER ADMIN'}
            </span>
          </div>

          <button
            onClick={logout}
            className="text-zinc-400 hover:text-white flex items-center gap-1.5 px-2.5 py-1.5 rounded hover:bg-zinc-800 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-xs">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-obsidian-900 border-r border-zinc-800 flex flex-col shrink-0">
          <div className="p-2 sm:p-4 border-b border-zinc-800/60 hidden md:block">
            <div className="bg-obsidian-950 border border-zinc-800/80 p-2.5 rounded text-[11px] flex items-center justify-between">
              <span className="text-zinc-400 uppercase tracking-wider font-semibold text-[10px]">Brand Instance</span>
              <span className="text-white font-mono font-bold">STONCROPS</span>
            </div>
          </div>

          <nav className="p-2 sm:p-4 flex md:flex-col overflow-x-auto md:overflow-x-visible gap-1 md:gap-1.5">
            {[
              { id: 'overview', label: 'Overview & Telemetry', icon: <LayoutDashboard className="w-4 h-4" /> },
              { id: 'orders', label: 'Orders', icon: <ShoppingBag className="w-4 h-4" /> },
              { id: 'inventory', label: 'Inventory (S/M/L)', icon: <Layers className="w-4 h-4" /> },
              { id: 'product', label: 'Product Specs', icon: <Package className="w-4 h-4" /> },
              { id: 'images', label: 'Image Gallery', icon: <ImageIcon className="w-4 h-4" /> },
              {
                id: 'reviews',
                label: 'Reviews',
                icon: <Star className="w-4 h-4" />,
                badge: pendingReviewsCount > 0 ? `${pendingReviewsCount}` : undefined,
              },
              { id: 'customers', label: 'Customers', icon: <Users className="w-4 h-4" /> },
              { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as AdminTab)}
                  className={`flex items-center justify-between px-3 py-2 sm:py-2.5 rounded text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-zinc-800 text-white font-bold border-l-2 border-burgundy-500 pl-2.5 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {tab.icon}
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge && (
                    <span className="ml-2 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-500 text-obsidian-950">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer Link */}
          <div className="hidden md:block mt-auto p-4 border-t border-zinc-800 text-[11px] text-zinc-500 space-y-1">
            <div className="flex items-center justify-between">
              <span>Instagram</span>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-burgundy-400 hover:underline flex items-center gap-0.5"
              >
                @stonecrops.in <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
            <div className="text-[10px] text-zinc-600">Drop 01 // Embroidered Edition</div>
          </div>
        </aside>

        {/* Content Viewport */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto">
          {/* TAB 1: OVERVIEW & ADVANCED TELEMETRY */}
          {activeTab === 'overview' && (
            <div className="space-y-6 sm:space-y-8 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold uppercase tracking-widest text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-burgundy-400" />
                    Performance Telemetry & Analytics
                  </h2>
                  <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
                    Real-time metrics, storefront conversion funnel, and telemetry computed directly from Supabase.
                  </p>
                </div>

                <div className="self-start sm:self-auto flex items-center gap-2 bg-emerald-950/70 border border-emerald-800 px-3 py-1.5 rounded text-emerald-400 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>{metrics?.liveVisitors || 0} Live Shoppers Right Now</span>
                </div>
              </div>

              {/* Metric Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-obsidian-900 border border-zinc-800 p-4 sm:p-5 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block truncate">
                    Gross Revenue
                  </span>
                  <div className="text-xl sm:text-3xl font-black text-white">
                    ₹{(metrics?.totalRevenue || 0).toLocaleString('en-IN')}
                  </div>
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold truncate">
                    <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                    {metrics?.successfulPayments || 0} Paid Orders (AOV: ₹{(metrics?.averageOrderValue || 0).toLocaleString('en-IN')})
                  </span>
                </div>

                <div className="bg-obsidian-900 border border-zinc-800 p-4 sm:p-5 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block truncate">
                    Total Orders
                  </span>
                  <div className="text-xl sm:text-3xl font-black text-white">
                    {metrics?.totalOrders || 0}
                  </div>
                  <span className="text-[11px] text-zinc-400 block truncate">
                    {metrics?.pendingOrders || 0} Pending · {metrics?.processingOrders || 0} Processing
                  </span>
                </div>

                <div className="bg-obsidian-900 border border-zinc-800 p-4 sm:p-5 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block truncate">
                    Conversion Rate
                  </span>
                  <div className="text-xl sm:text-3xl font-black text-white">
                    {metrics?.conversionRate || 0}%
                  </div>
                  <span className="text-[11px] text-zinc-400 block truncate">
                    {metrics?.totalVisitors || 0} Storefront Shoppers
                  </span>
                </div>

                <div className="bg-obsidian-900 border border-zinc-800 p-4 sm:p-5 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block truncate">
                    Cart Velocity
                  </span>
                  <div className="text-xl sm:text-3xl font-black text-white">
                    {metrics?.addToCartCount || 0}
                  </div>
                  <span className="text-[11px] text-zinc-400 block truncate">
                    {metrics?.checkoutStartsCount || 0} Checkouts · Dropoff: {metrics?.abandonmentRate || 0}%
                  </span>
                </div>
              </div>

              {/* Conversion Funnel Breakdown */}
              <div className="bg-obsidian-900 border border-zinc-800 p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-burgundy-400" />
                      E-Commerce Conversion Funnel
                    </h3>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Customer drop-off analysis from initial storefront visit to completed UPI payment.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded">
                    {metrics?.conversionRate || 0}% Overall Conversion
                  </span>
                </div>

                <div className="space-y-3 pt-2">
                  {[
                    {
                      step: '1. Storefront Visits / Impressions',
                      count: metrics?.funnel?.visitors || metrics?.totalVisitors || 0,
                      percentage: (metrics?.funnel?.visitors || metrics?.totalVisitors || 0) > 0 ? 100 : 0,
                      color: 'bg-zinc-600',
                    },
                    {
                      step: '2. Size Selected & Explored',
                      count: metrics?.funnel?.sizeExplored || 0,
                      percentage:
                        (metrics?.funnel?.visitors || 0) > 0
                          ? Math.min(
                              100,
                              Math.round(
                                ((metrics?.funnel?.sizeExplored || 0) / metrics!.funnel!.visitors) * 100
                              )
                            )
                          : 0,
                      color: 'bg-zinc-400',
                    },
                    {
                      step: '3. Added to Bag (Cart)',
                      count: metrics?.funnel?.cartAdded || metrics?.addToCartCount || 0,
                      percentage:
                        (metrics?.funnel?.visitors || 0) > 0
                          ? Math.min(
                              100,
                              Math.round(
                                ((metrics?.funnel?.cartAdded || metrics?.addToCartCount || 0) /
                                  metrics!.funnel!.visitors) *
                                  100
                              )
                            )
                          : 0,
                      color: 'bg-amber-500',
                    },
                    {
                      step: '4. Checkout Initiated',
                      count: metrics?.funnel?.checkoutStarted || metrics?.checkoutStartsCount || 0,
                      percentage:
                        (metrics?.funnel?.visitors || 0) > 0
                          ? Math.min(
                              100,
                              Math.round(
                                ((metrics?.funnel?.checkoutStarted || metrics?.checkoutStartsCount || 0) /
                                  metrics!.funnel!.visitors) *
                                  100
                              )
                            )
                          : 0,
                      color: 'bg-burgundy-600',
                    },
                    {
                      step: '5. Paid Order Completed',
                      count: metrics?.funnel?.paidOrders || metrics?.successfulPayments || 0,
                      percentage:
                        (metrics?.funnel?.visitors || 0) > 0
                          ? Math.min(
                              100,
                              Math.round(
                                ((metrics?.funnel?.paidOrders || metrics?.successfulPayments || 0) /
                                  metrics!.funnel!.visitors) *
                                  100
                              )
                            )
                          : 0,
                      color: 'bg-emerald-500',
                    },
                  ].map((stage, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-zinc-300">{stage.step}</span>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-white font-bold">{stage.count} actions</span>
                          <span className="text-zinc-500 text-[11px]">({stage.percentage}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-obsidian-950 h-2.5 rounded-full overflow-hidden border border-zinc-800">
                        <div
                          className={`h-full ${stage.color} rounded-full transition-all duration-500`}
                          style={{ width: `${stage.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Middle Grid: Devices, Traffic Sources, Inventory Health */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Device Breakdown */}
                <div className="bg-obsidian-900 border border-zinc-800 p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-zinc-400" />
                      Device Distribution
                    </h3>
                    <span className="text-[10px] text-zinc-500">Live Sessions</span>
                  </div>
                  <div className="space-y-2.5 pt-1">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-zinc-300 flex items-center gap-1"><Smartphone className="w-3 h-3" /> Mobile</span>
                        <span className="font-mono font-bold text-white">{metrics?.devices?.mobile || 0}%</span>
                      </div>
                      <div className="w-full bg-obsidian-950 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-burgundy-500 h-full rounded-full transition-all" style={{ width: `${metrics?.devices?.mobile || 0}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-zinc-300 flex items-center gap-1"><Monitor className="w-3 h-3" /> Desktop</span>
                        <span className="font-mono font-bold text-white">{metrics?.devices?.desktop || 0}%</span>
                      </div>
                      <div className="w-full bg-obsidian-950 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-zinc-400 h-full rounded-full transition-all" style={{ width: `${metrics?.devices?.desktop || 0}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-zinc-300 flex items-center gap-1"><Tablet className="w-3 h-3" /> Tablet</span>
                        <span className="font-mono font-bold text-white">{metrics?.devices?.tablet || 0}%</span>
                      </div>
                      <div className="w-full bg-obsidian-950 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-zinc-600 h-full rounded-full transition-all" style={{ width: `${metrics?.devices?.tablet || 0}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Traffic Sources */}
                <div className="bg-obsidian-900 border border-zinc-800 p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-zinc-400" />
                      Acquisition Channels
                    </h3>
                    <span className="text-[10px] text-zinc-500">Referrals</span>
                  </div>
                  <div className="space-y-2.5 pt-1">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-zinc-300">Instagram (@stonecrops.in)</span>
                        <span className="font-mono font-bold text-burgundy-400">{metrics?.sources?.instagram || 0}%</span>
                      </div>
                      <div className="w-full bg-obsidian-950 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-burgundy-500 h-full rounded-full transition-all" style={{ width: `${metrics?.sources?.instagram || 0}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-zinc-300">Direct Navigation</span>
                        <span className="font-mono font-bold text-white">{metrics?.sources?.direct || 0}%</span>
                      </div>
                      <div className="w-full bg-obsidian-950 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-zinc-400 h-full rounded-full transition-all" style={{ width: `${metrics?.sources?.direct || 0}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-zinc-300">WhatsApp Shares</span>
                        <span className="font-mono font-bold text-emerald-400">{metrics?.sources?.whatsapp || 0}%</span>
                      </div>
                      <div className="w-full bg-obsidian-950 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${metrics?.sources?.whatsapp || 0}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Inventory Health */}
                <div className="bg-obsidian-900 border border-zinc-800 p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-zinc-400" />
                      Inventory Health
                    </h3>
                    <button
                      onClick={() => setActiveTab('inventory')}
                      className="text-[10px] text-burgundy-400 hover:underline"
                    >
                      Manage
                    </button>
                  </div>
                  <div className="space-y-2 pt-1 text-xs">
                    <div className="flex items-center justify-between p-2 bg-obsidian-950 border border-zinc-850 rounded">
                      <span className="font-bold text-white">Size S</span>
                      <span className="font-mono text-emerald-400 font-bold">{metrics?.stock?.S ?? 0} Units In Stock</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-obsidian-950 border border-zinc-850 rounded">
                      <span className="font-bold text-white">Size M</span>
                      <span className="font-mono text-emerald-400 font-bold">{metrics?.stock?.M ?? 0} Units In Stock</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-obsidian-950 border border-zinc-850 rounded">
                      <span className="font-bold text-white">Size L</span>
                      <span className="font-mono text-emerald-400 font-bold">{metrics?.stock?.L ?? 0} Units In Stock</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 7-Day Performance Bar Chart */}
              <div className="bg-obsidian-900 border border-zinc-800 p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
                    Daily Revenue Performance (Last 7 Days)
                  </h3>
                  <span className="text-[10px] sm:text-[11px] text-zinc-400">Values in INR</span>
                </div>

                <div className="grid grid-cols-7 gap-1 sm:gap-4 items-end h-36 sm:h-44 pt-4 sm:pt-6 pb-2 border-b border-zinc-800">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(metrics?.dailySales || []).map((day: any, i: number) => {
                    const maxRev = Math.max(
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      ...(metrics?.dailySales || []).map((d: any) => d.revenue),
                      1000
                    );
                    const heightPercent = Math.max(10, Math.round((day.revenue / maxRev) * 100));

                    return (
                      <div key={i} className="flex flex-col items-center gap-1.5 sm:gap-2 h-full justify-end">
                        <span className="text-[9px] sm:text-[10px] font-bold text-zinc-300">
                          {day.revenue > 0 ? `₹${day.revenue}` : '0'}
                        </span>
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full max-w-[42px] rounded-t transition-all ${
                            day.revenue > 0
                              ? 'bg-burgundy-700 hover:bg-burgundy-600'
                              : 'bg-zinc-800'
                          }`}
                        />
                        <span className="text-[8px] sm:text-[10px] uppercase font-semibold text-zinc-500 truncate w-full text-center">
                          {day.date}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Real-time Telemetry Event Stream */}
              <div className="bg-obsidian-900 border border-zinc-800 p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Live Telemetry Event Stream
                  </h3>
                  <span className="text-[10px] text-zinc-500">Auto-buffered</span>
                </div>

                {(!metrics?.recentEvents || metrics.recentEvents.length === 0) ? (
                  <div className="p-6 text-center text-xs text-zinc-500 bg-obsidian-950 border border-zinc-850">
                    No recent events logged yet. Events trigger as shoppers browse the storefront.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-obsidian-950 text-zinc-400 uppercase tracking-wider text-[10px] font-bold border-b border-zinc-800">
                        <tr>
                          <th className="py-2.5 px-3">Event Type</th>
                          <th className="py-2.5 px-3">Path</th>
                          <th className="py-2.5 px-3">Time</th>
                          <th className="py-2.5 px-3">Metadata</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {metrics.recentEvents.map((evt: any) => (
                          <tr key={evt.id} className="hover:bg-zinc-850/40">
                            <td className="py-2.5 px-3 font-mono font-bold text-white">
                              <span className="px-2 py-0.5 rounded bg-zinc-800 text-[11px]">
                                {evt.eventType}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-zinc-400 font-mono text-[11px]">{evt.pagePath}</td>
                            <td className="py-2.5 px-3 text-zinc-500 text-[11px]">
                              {new Date(evt.createdAt).toLocaleTimeString('en-IN')}
                            </td>
                            <td className="py-2.5 px-3 text-zinc-400 text-[11px] font-mono truncate max-w-xs">
                              {JSON.stringify(evt.metadata || {})}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4 sm:space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold uppercase tracking-widest text-white">
                    Order Management
                  </h2>
                  <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
                    Fulfill, track, and manage customer shipments.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href="/api/admin/orders?export=csv"
                    className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export CSV
                  </a>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={(e) => {
                      setOrderSearchQuery(e.target.value);
                      fetchOrders();
                    }}
                    placeholder="Search by Order ID (SC-XXXXXX) or Customer Name..."
                    className="w-full bg-obsidian-900 border border-zinc-800 pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <select
                  value={orderStatusFilter}
                  onChange={(e) => {
                    setOrderStatusFilter(e.target.value);
                    fetchOrders();
                  }}
                  className="bg-obsidian-900 border border-zinc-800 px-3 py-2 text-xs text-zinc-200 focus:outline-none"
                >
                  <option value="all">All Orders</option>
                  <option value="paid">Paid & Ready</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Mobile View: Responsive Order Cards */}
              <div className="sm:hidden space-y-3">
                {orders.length === 0 ? (
                  <div className="p-8 bg-obsidian-900 border border-zinc-800 text-center text-xs text-zinc-500">
                    No orders recorded yet.
                  </div>
                ) : (
                  orders.map((o) => (
                    <div
                      key={o.id}
                      onClick={() => setSelectedOrderDetails(o)}
                      className="bg-obsidian-900 border border-zinc-800 p-4 space-y-2 cursor-pointer hover:border-zinc-700 active:bg-zinc-850"
                    >
                      <div className="flex justify-between items-baseline">
                        <span className="font-mono font-bold text-white text-xs">{o.order_number}</span>
                        <span className="font-black text-white text-xs">
                          ₹{o.total_amount?.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        {o.customers?.full_name || o.shipping_address?.full_name || 'Guest'}
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            o.status === 'paid'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                              : o.status === 'shipped'
                              ? 'bg-blue-950 text-blue-400 border border-blue-900'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {o.status}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          {new Date(o.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop View: Full Table */}
              <div className="hidden sm:block overflow-x-auto border border-zinc-800 bg-obsidian-900">
                <table className="w-full text-left text-xs">
                  <thead className="bg-obsidian-850 text-zinc-400 uppercase tracking-wider text-[10px] font-bold border-b border-zinc-800">
                    <tr>
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Payment</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-zinc-500">
                          No orders matched your filter.
                        </td>
                      </tr>
                    ) : (
                      orders.map((o) => (
                        <tr key={o.id} className="hover:bg-zinc-850/50 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-white">{o.order_number}</td>
                          <td className="py-3 px-4">
                            <span className="block font-semibold text-zinc-200">
                              {o.customers?.full_name || o.shipping_address?.full_name || 'Customer'}
                            </span>
                            <span className="text-[10px] text-zinc-400">
                              {o.customers?.phone || o.shipping_address?.phone || '-'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-white">
                            ₹{o.total_amount?.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={o.status}
                              onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                              className="bg-obsidian-950 border border-zinc-800 px-2 py-1 text-[11px] rounded text-zinc-200 focus:outline-none"
                            >
                              <option value="pending_payment">Pending Payment</option>
                              <option value="paid">Paid</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                o.payment_status === 'captured'
                                  ? 'bg-emerald-950 text-emerald-400'
                                  : 'bg-amber-950 text-amber-400'
                              }`}
                            >
                              {o.payment_status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-zinc-400 text-[11px]">
                            {new Date(o.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => setSelectedOrderDetails(o)}
                              className="text-zinc-400 hover:text-white flex items-center gap-1 text-[11px] uppercase font-bold"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: INVENTORY */}
          {activeTab === 'inventory' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-zinc-800 pb-4">
                <h2 className="text-lg sm:text-xl font-extrabold uppercase tracking-widest text-white">
                  Size-Specific Inventory Management
                </h2>
                <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
                  Manage live stock independently for S, M, and L. Stock changes reflect immediately on the storefront.
                </p>
              </div>

              {inventory.length === 0 ? (
                <div className="bg-obsidian-900 border border-zinc-800 p-8 text-center space-y-2">
                  <p className="text-zinc-400 text-xs">No inventory records found in the database.</p>
                  <p className="text-zinc-500 text-[11px]">
                    Run <code className="text-burgundy-400 font-mono">full_setup.sql</code> in your Supabase SQL editor to create the initial stock for Sizes S, M, and L.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  {inventory.map((item) => {
                  const size = item.product_variants?.size || 'M';
                  const sku = item.product_variants?.sku || 'SC-EMB';
                  const isEditing = editingVariantId === item.variant_id;

                  return (
                    <div
                      key={item.id}
                      className="bg-obsidian-900 border border-zinc-800 p-4 sm:p-6 space-y-4 relative"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded bg-obsidian-950 border border-zinc-800 flex items-center justify-center font-bold text-white text-sm">
                            {size}
                          </span>
                          <div>
                            <span className="font-extrabold text-white text-sm block">Size {size}</span>
                            <span className="text-[10px] text-zinc-400 font-mono">{sku}</span>
                          </div>
                        </div>

                        {item.available_stock <= 5 && (
                          <span className="px-2 py-0.5 bg-red-950 text-red-400 text-[10px] font-bold uppercase rounded border border-red-900 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Low Stock
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center bg-obsidian-950 p-3 border border-zinc-850">
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-zinc-400 block">Available</span>
                          <span className="text-lg font-black text-white">{item.available_stock}</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-zinc-400 block">Reserved</span>
                          <span className="text-lg font-black text-amber-400">{item.reserved_stock || 0}</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-zinc-400 block">Sold</span>
                          <span className="text-lg font-black text-emerald-400">{item.sold_stock || 0}</span>
                        </div>
                      </div>

                      {isEditing ? (
                        <div className="space-y-2 pt-2">
                          <label className="text-[10px] uppercase font-bold text-zinc-400 block">
                            Set Available Stock Units:
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              min="0"
                              value={editStockVal}
                              onChange={(e) => setEditStockVal(parseInt(e.target.value) || 0)}
                              className="w-full bg-obsidian-950 border border-zinc-700 px-3 py-1.5 text-xs text-white focus:outline-none"
                            />
                            <button
                              onClick={() => saveInventoryStock(item.variant_id)}
                              className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold uppercase rounded cursor-pointer"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingVariantId(null)}
                              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold uppercase rounded cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingVariantId(item.variant_id);
                            setEditStockVal(item.available_stock);
                          }}
                          className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Update Stock Level
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            </div>
          )}

          {/* TAB 4: PRODUCT SPECS */}
          {activeTab === 'product' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-zinc-800 pb-4">
                <h2 className="text-lg sm:text-xl font-extrabold uppercase tracking-widest text-white">
                  Active Garment Specifications
                </h2>
                <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
                  Core garment blueprint and catalog metadata.
                </p>
              </div>

              <div className="bg-obsidian-900 border border-zinc-800 p-4 sm:p-6 space-y-6 max-w-3xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">Garment Name</span>
                    <span className="text-white font-bold text-sm">STONCROPS — Embroidered Edition</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">Selling Price</span>
                    <span className="text-white font-bold text-sm">₹1,199 (Free Express Shipping Across India)</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">Fabric & Material</span>
                    <span className="text-white">Loopnet Heavyweight Cotton Knit</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">Base Colour</span>
                    <span className="text-white">Off-white / Cream</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">Silhouette</span>
                    <span className="text-white">Boxy Drop-Shoulder Oversized Cut</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">Embroidery Details</span>
                    <span className="text-white">Burgundy floral embroidery cascading along both sleeves</span>
                  </div>
                </div>

                <div className="border-t border-zinc-800 pt-4">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                    Garment Measurements (Inches Flat)
                  </span>
                  <div className="grid grid-cols-3 gap-3 text-xs bg-obsidian-950 p-3 border border-zinc-850">
                    <div>
                      <span className="font-bold text-white block">Size S:</span>
                      <p className="text-zinc-400">Chest: 21.5&quot; · Length: 27.5&quot; · Shoulder: 21.5&quot; · Sleeve: 23&quot;</p>
                    </div>
                    <div>
                      <span className="font-bold text-white block">Size M:</span>
                      <p className="text-zinc-400">Chest: 23.0&quot; · Length: 28.0&quot; · Shoulder: 22.0&quot; · Sleeve: 24&quot;</p>
                    </div>
                    <div>
                      <span className="font-bold text-white block">Size L:</span>
                      <p className="text-zinc-400">Chest: 24.0&quot; · Length: 29.0&quot; · Shoulder: 22.5&quot; · Sleeve: 24.5&quot;</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PROFESSIONAL IMAGE GALLERY MANAGEMENT */}
          {activeTab === 'images' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold uppercase tracking-widest text-white flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-burgundy-400" />
                    Campaign Photography & Media Assets
                  </h2>
                  <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
                    Upload official campaign photography. Images reflect dynamically across the storefront and zoom viewer.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {images.length === 0 && (
                    <button
                      onClick={seedDefaultImages}
                      disabled={uploadingImage}
                      className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold uppercase tracking-wider rounded transition-colors cursor-pointer"
                    >
                      Seed Default Placeholders
                    </button>
                  )}
                  <label className="px-4 py-2 bg-white hover:bg-cream-100 text-obsidian-950 text-xs font-bold uppercase tracking-wider rounded cursor-pointer flex items-center gap-1.5 shadow-sm transition-all">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Photograph</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileSelect}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Toast Feedback */}
              {imageToast && (
                <div
                  className={`p-3 text-xs font-semibold rounded border flex items-center gap-2 ${
                    imageToast.type === 'success'
                      ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                      : 'bg-red-950/80 border-red-800 text-red-300'
                  }`}
                >
                  {imageToast.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span>{imageToast.message}</span>
                </div>
              )}

              {/* Selected Image Upload Preview Drawer / Box */}
              {selectedImageFile && imagePreviewUrl && (
                <div className="bg-obsidian-900 border-2 border-dashed border-burgundy-500/80 p-4 sm:p-6 rounded space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-burgundy-400" />
                      Photograph Upload Staging
                    </span>
                    <button
                      onClick={cancelImageSelection}
                      className="text-zinc-400 hover:text-white text-xs"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
                    <div className="w-32 h-40 sm:w-40 sm:h-52 bg-obsidian-950 border border-zinc-800 rounded overflow-hidden shrink-0">
                      <img src={imagePreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 space-y-3 w-full text-xs">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                          Photograph Caption / Angle Label
                        </label>
                        <input
                          type="text"
                          value={imageCaption}
                          onChange={(e) => setImageCaption(e.target.value)}
                          placeholder="e.g. Front Editorial Drape, Sleeve Floral Embroidery Detail, Back Silhouette"
                          className="w-full bg-obsidian-950 border border-zinc-700 p-2 text-xs text-white focus:outline-none focus:border-burgundy-500"
                        />
                      </div>

                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                          <input
                            type="checkbox"
                            checked={imageIsPrimary}
                            onChange={(e) => setImageIsPrimary(e.target.checked)}
                            className="rounded bg-obsidian-950 border-zinc-700 text-burgundy-600 focus:ring-0"
                          />
                          <span className="font-semibold text-xs">Set as Primary Hero Photograph</span>
                        </label>
                      </div>

                      <div className="pt-2 flex items-center gap-3">
                        <button
                          onClick={submitImageUpload}
                          disabled={uploadingImage}
                          className="px-5 py-2.5 bg-burgundy-800 hover:bg-burgundy-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded flex items-center gap-1.5 cursor-pointer"
                        >
                          {uploadingImage ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Saving Photograph...
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5" />
                              Save to Garment Catalog
                            </>
                          )}
                        </button>
                        <button
                          onClick={cancelImageSelection}
                          disabled={uploadingImage}
                          className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold uppercase rounded cursor-pointer"
                        >
                          Discard
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Gallery Grid */}
              {images.length === 0 && !selectedImageFile ? (
                <div className="bg-obsidian-900 border border-zinc-800 p-12 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-zinc-800 mx-auto flex items-center justify-center text-zinc-400">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">No Photography Uploaded</h3>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
                      Upload your official product photographs or seed temporary campaign placeholders.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={seedDefaultImages}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase tracking-wider rounded"
                    >
                      Seed 4 Default Editorial Placeholders
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {images.map((img) => (
                    <div
                      key={img.id}
                      className={`bg-obsidian-900 border p-3 rounded space-y-3 relative group transition-all ${
                        img.is_primary ? 'border-amber-500/80 shadow-md ring-1 ring-amber-500/30' : 'border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="aspect-[4/5] bg-obsidian-950 rounded overflow-hidden relative">
                        <img
                          src={img.image_url}
                          alt={img.alt_text || 'Garment'}
                          className="w-full h-full object-cover"
                        />
                        {img.is_primary && (
                          <div className="absolute top-2 left-2 bg-amber-500 text-obsidian-950 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            Primary Hero
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs font-bold text-white truncate">
                          {img.caption || img.alt_text || 'Garment Photograph'}
                        </p>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                          Slide #{img.sort_order ?? 0}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-t border-zinc-800/80 pt-2 text-xs">
                        {!img.is_primary ? (
                          <button
                            onClick={() => setAsPrimaryImage(img.id)}
                            className="text-amber-400 hover:text-amber-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Crown className="w-3 h-3" />
                            Set as Hero
                          </button>
                        ) : (
                          <span className="text-amber-400 text-[10px] font-bold">Hero Active</span>
                        )}

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => copyImageUrl(img.id, img.image_url)}
                            className="text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-800"
                            title="Copy Image URL"
                          >
                            {copiedUrlId === img.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => deleteImage(img.id)}
                            className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-950/50"
                            title="Delete Photograph"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: CUSTOMER REVIEW MODERATION */}
          {activeTab === 'reviews' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold uppercase tracking-widest text-white flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-400" />
                    Customer Review Moderation
                  </h2>
                  <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
                    Approve authentic customer testimonials. Only approved reviews appear on stoncrops.com.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {reviews.length === 0 && (
                    <button
                      onClick={seedSampleReviews}
                      className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold uppercase rounded cursor-pointer"
                    >
                      Seed Verified Reviews
                    </button>
                  )}
                  <button
                    onClick={() => setShowAddReviewModal(true)}
                    className="px-4 py-2 bg-white hover:bg-cream-100 text-obsidian-950 text-xs font-bold uppercase tracking-wider rounded cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Testimonial
                  </button>
                </div>
              </div>

              {/* Toast Feedback */}
              {reviewToast && (
                <div
                  className={`p-3 text-xs font-semibold rounded border flex items-center gap-2 ${
                    reviewToast.type === 'success'
                      ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                      : 'bg-red-950/80 border-red-800 text-red-300'
                  }`}
                >
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{reviewToast.message}</span>
                </div>
              )}

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                {[
                  { id: 'all', label: 'All Reviews', count: reviews.length },
                  { id: 'pending', label: 'Pending Moderation', count: pendingReviewsCount, color: 'text-amber-400' },
                  { id: 'approved', label: 'Approved & Live', count: approvedReviewsCount, color: 'text-emerald-400' },
                  { id: 'rejected', label: 'Rejected / Hidden', count: rejectedReviewsCount, color: 'text-zinc-400' },
                ].map((filterTab) => (
                  <button
                    key={filterTab.id}
                    onClick={() => setReviewFilter(filterTab.id as any)}
                    className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      reviewFilter === filterTab.id
                        ? 'bg-zinc-800 text-white'
                        : 'bg-obsidian-900 border border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>{filterTab.label}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${filterTab.color || 'text-zinc-300'}`}>
                      {filterTab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Reviews List */}
              <div className="space-y-3 sm:space-y-4">
                {filteredReviews.length === 0 ? (
                  <div className="bg-obsidian-900 border border-zinc-800 p-10 text-center space-y-2">
                    <p className="text-zinc-400 text-xs">No reviews found under the selected filter.</p>
                    {reviews.length === 0 && (
                      <button
                        onClick={seedSampleReviews}
                        className="text-xs text-burgundy-400 font-bold uppercase hover:underline"
                      >
                        Click here to seed sample verified reviews
                      </button>
                    )}
                  </div>
                ) : (
                  filteredReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="bg-obsidian-900 border border-zinc-800 p-4 sm:p-5 rounded flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-bold text-white text-xs">{rev.customer_name}</span>
                          <span className="text-amber-400 text-xs font-bold">
                            {'★'.repeat(rev.rating)}
                            {'☆'.repeat(5 - rev.rating)}
                          </span>

                          {rev.is_verified_purchase && (
                            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-emerald-950/80 text-emerald-400 border border-emerald-900 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" />
                              Verified Buyer
                            </span>
                          )}

                          <span
                            className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                              rev.status === 'approved'
                                ? 'bg-emerald-950 text-emerald-400'
                                : rev.status === 'rejected'
                                ? 'bg-red-950 text-red-400'
                                : 'bg-amber-950 text-amber-400'
                            }`}
                          >
                            {rev.status === 'approved'
                              ? 'LIVE ON STORE'
                              : rev.status === 'rejected'
                              ? 'REJECTED'
                              : 'PENDING APPROVAL'}
                          </span>
                        </div>

                        {rev.title && <p className="font-bold text-zinc-200 text-xs">{rev.title}</p>}
                        <p className="text-zinc-400 text-xs leading-relaxed">&ldquo;{rev.comment}&rdquo;</p>
                        <span className="text-[10px] text-zinc-500 block">
                          Submitted on {new Date(rev.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end md:self-auto pt-2 md:pt-0">
                        {rev.status !== 'approved' && (
                          <button
                            onClick={() => moderateReview(rev.id, 'approved')}
                            className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded text-xs font-bold uppercase flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Approve & Publish
                          </button>
                        )}
                        {rev.status !== 'rejected' && (
                          <button
                            onClick={() => moderateReview(rev.id, 'rejected')}
                            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs font-bold uppercase flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        )}
                        <button
                          onClick={() => deleteReview(rev.id)}
                          className="p-1.5 text-red-400 hover:bg-red-950/50 rounded cursor-pointer transition-colors"
                          title="Delete permanently"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Manual Testimonial Modal */}
              {showAddReviewModal && (
                <div className="fixed inset-0 bg-obsidian-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-obsidian-900 border border-zinc-800 p-6 rounded max-w-md w-full space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-white">Add Verified Customer Testimonial</h3>
                      <button
                        onClick={() => setShowAddReviewModal(false)}
                        className="text-zinc-400 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleCreateReview} className="space-y-3 text-xs">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Customer Name</label>
                        <input
                          type="text"
                          required
                          value={newReviewForm.customerName}
                          onChange={(e) => setNewReviewForm({ ...newReviewForm, customerName: e.target.value })}
                          placeholder="e.g. Rahul Sharma"
                          className="w-full bg-obsidian-950 border border-zinc-700 p-2 text-white focus:outline-none focus:border-zinc-500"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Rating (1 to 5 Stars)</label>
                        <select
                          value={newReviewForm.rating}
                          onChange={(e) => setNewReviewForm({ ...newReviewForm, rating: parseInt(e.target.value) })}
                          className="w-full bg-obsidian-950 border border-zinc-700 p-2 text-white focus:outline-none"
                        >
                          <option value={5}>★★★★★ (5 Stars - Exceptional)</option>
                          <option value={4}>★★★★☆ (4 Stars - Great)</option>
                          <option value={3}>★★★☆☆ (3 Stars - Average)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Review Headline</label>
                        <input
                          type="text"
                          value={newReviewForm.title}
                          onChange={(e) => setNewReviewForm({ ...newReviewForm, title: e.target.value })}
                          placeholder="e.g. Unbelievable Loopnet knit quality"
                          className="w-full bg-obsidian-950 border border-zinc-700 p-2 text-white focus:outline-none focus:border-zinc-500"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Customer Review Body</label>
                        <textarea
                          required
                          rows={3}
                          value={newReviewForm.comment}
                          onChange={(e) => setNewReviewForm({ ...newReviewForm, comment: e.target.value })}
                          placeholder="Detailed feedback regarding sizing, fit, embroidery, or fabric..."
                          className="w-full bg-obsidian-950 border border-zinc-700 p-2 text-white focus:outline-none focus:border-zinc-500"
                        />
                      </div>

                      <div className="flex items-center gap-4 pt-1">
                        <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                          <input
                            type="checkbox"
                            checked={newReviewForm.isVerifiedPurchase}
                            onChange={(e) => setNewReviewForm({ ...newReviewForm, isVerifiedPurchase: e.target.checked })}
                            className="rounded bg-obsidian-950 border-zinc-700"
                          />
                          <span>Mark as Verified Buyer</span>
                        </label>
                      </div>

                      <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                        <button
                          type="button"
                          onClick={() => setShowAddReviewModal(false)}
                          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded font-bold uppercase"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submittingReview}
                          className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 disabled:opacity-50 text-white rounded font-bold uppercase"
                        >
                          {submittingReview ? 'Publishing...' : 'Publish Testimonial'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: CUSTOMERS */}
          {activeTab === 'customers' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-zinc-800 pb-4">
                <h2 className="text-lg sm:text-xl font-extrabold uppercase tracking-widest text-white">
                  Customer Directory
                </h2>
                <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
                  Registered customer contact information and order history.
                </p>
              </div>

              {/* Mobile customer cards */}
              <div className="sm:hidden space-y-3">
                {customers.length === 0 ? (
                  <div className="p-8 bg-obsidian-900 border border-zinc-800 text-center text-xs text-zinc-500">
                    No customer profiles recorded yet.
                  </div>
                ) : (
                  customers.map((c) => (
                    <div key={c.id} className="bg-obsidian-900 border border-zinc-800 p-4 space-y-2">
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-white text-xs">{c.full_name}</span>
                        <span className="text-[10px] text-zinc-400">
                          {c.total_orders || 1} Orders
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 font-mono">{c.phone}</p>
                      <p className="text-[11px] text-zinc-400">{c.email}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop customer table */}
              <div className="hidden sm:block overflow-x-auto border border-zinc-800 bg-obsidian-900">
                <table className="w-full text-left text-xs">
                  <thead className="bg-obsidian-850 text-zinc-400 uppercase tracking-wider text-[10px] font-bold border-b border-zinc-800">
                    <tr>
                      <th className="py-3 px-4">Full Name</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Total Orders</th>
                      <th className="py-3 px-4">Total Spent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {customers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-zinc-500">
                          No registered customer profiles found.
                        </td>
                      </tr>
                    ) : (
                      customers.map((c) => (
                        <tr key={c.id} className="hover:bg-zinc-850/50">
                          <td className="py-3 px-4 font-bold text-white">{c.full_name}</td>
                          <td className="py-3 px-4 text-zinc-300 font-mono">{c.phone}</td>
                          <td className="py-3 px-4 text-zinc-400">{c.email}</td>
                          <td className="py-3 px-4 font-mono font-bold text-white">{c.total_orders || 1}</td>
                          <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                            ₹{(c.total_spent || 1199).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fade-in max-w-2xl">
              <div className="border-b border-zinc-800 pb-4">
                <h2 className="text-lg sm:text-xl font-extrabold uppercase tracking-widest text-white">
                  Storefront Configuration
                </h2>
                <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
                  Update customer announcements, hero copy, and contact channels.
                </p>
              </div>

              <form onSubmit={saveStoreSettings} className="space-y-4 text-xs">
                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                    Announcement Banner Text
                  </label>
                  <input
                    type="text"
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    className="w-full bg-obsidian-900 border border-zinc-800 p-2.5 text-white focus:outline-none focus:border-zinc-600"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                    Hero Section Headline
                  </label>
                  <input
                    type="text"
                    value={heroHeadline}
                    onChange={(e) => setHeroHeadline(e.target.value)}
                    className="w-full bg-obsidian-900 border border-zinc-800 p-2.5 text-white focus:outline-none focus:border-zinc-600"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                    Customer Support Email
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full bg-obsidian-900 border border-zinc-800 p-2.5 text-white focus:outline-none focus:border-zinc-600"
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-zinc-100 hover:bg-white text-obsidian-950 font-bold uppercase tracking-wider rounded transition-colors cursor-pointer"
                  >
                    Save Changes
                  </button>
                  {settingsSaved && (
                    <span className="text-emerald-400 flex items-center gap-1 font-bold">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Settings Updated
                    </span>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* ORDER DETAILS MODAL (Pop-up when clicking an order) */}
          {selectedOrderDetails && (
            <div className="fixed inset-0 bg-obsidian-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
              <div className="bg-obsidian-900 border border-zinc-800 p-5 sm:p-6 rounded max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <span className="font-mono font-bold text-white text-sm block">
                      {selectedOrderDetails.order_number}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      Placed on {new Date(selectedOrderDetails.created_at).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedOrderDetails(null)}
                    className="text-zinc-400 hover:text-white p-1"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                      Customer & Shipping Details
                    </span>
                    <div className="bg-obsidian-950 p-3 border border-zinc-850 space-y-1">
                      <p className="font-bold text-white">
                        {selectedOrderDetails.customers?.full_name ||
                          selectedOrderDetails.shipping_address?.full_name}
                      </p>
                      <p className="text-zinc-300 font-mono">
                        {selectedOrderDetails.customers?.phone ||
                          selectedOrderDetails.shipping_address?.phone}
                      </p>
                      <p className="text-zinc-400">
                        {selectedOrderDetails.customers?.email ||
                          selectedOrderDetails.shipping_address?.email}
                      </p>
                      <p className="text-zinc-300 pt-1">
                        {selectedOrderDetails.shipping_address?.address_line1},{' '}
                        {selectedOrderDetails.shipping_address?.city},{' '}
                        {selectedOrderDetails.shipping_address?.state} —{' '}
                        {selectedOrderDetails.shipping_address?.postal_code}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                      Order Items
                    </span>
                    <div className="bg-obsidian-950 p-3 border border-zinc-850 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white block">STONCROPS — Embroidered Edition</span>
                        <span className="text-[10px] text-zinc-400">Size: S / M / L</span>
                      </div>
                      <span className="font-mono font-bold text-white">
                        ₹{selectedOrderDetails.total_amount?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                      Fulfillment Status
                    </span>
                    <select
                      value={selectedOrderDetails.status}
                      onChange={(e) => updateOrderStatus(selectedOrderDetails.id, e.target.value)}
                      className="w-full bg-obsidian-950 border border-zinc-700 p-2 text-white text-xs focus:outline-none"
                    >
                      <option value="pending_payment">Pending Payment</option>
                      <option value="paid">Paid & Ready to Dispatch</option>
                      <option value="processing">Processing in Warehouse</option>
                      <option value="shipped">Handed Over to Courier (Shipped)</option>
                      <option value="delivered">Delivered to Customer</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800 flex justify-end">
                  <button
                    onClick={() => setSelectedOrderDetails(null)}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold uppercase rounded"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
