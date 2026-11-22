'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { PRODUCT_PRICE, FREE_SHIPPING_TEXT } from '@stoncrops/shared';

const FALLBACK_GALLERY_IMAGES = [
  {
    id: 'front',
    url: '/images/product/front-editorial.svg',
    alt: 'STONCROPS Embroidered Edition - Front View',
    label: 'Front Silhouette',
    caption: 'Embroidered Edition oversized drop-shoulder cut in Off-White Loopnet',
  },
  {
    id: 'sleeve',
    url: '/images/product/sleeve-embroidery.svg',
    alt: 'STONCROPS - Burgundy Floral Sleeve Embroidery',
    label: 'Sleeve Embroidery',
    caption: 'Bespoke burgundy floral embroidery detail along full sleeves',
  },
  {
    id: 'back',
    url: '/images/product/back-silhouette.svg',
    alt: 'STONCROPS - Back Drape',
    label: 'Back View',
    caption: 'Boxy drop-shoulder silhouette and clean neckline finish',
  },
  {
    id: 'fabric',
    url: '/images/product/fabric-loopnet.svg',
    alt: 'STONCROPS - Loopnet Fabric Macro',
    label: 'Loopnet Knit',
    caption: 'Heavyweight Loopnet knit texture with structured drape',
  },
];

export function ProductGallery() {
  const [galleryImages, setGalleryImages] = useState(FALLBACK_GALLERY_IMAGES);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomCoords, setZoomCoords] = useState({ x: 50, y: 50 });

  // Touch swipe support for mobile
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    async function loadDynamicImages() {
      try {
        const res = await fetch('/api/images');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.images) && data.images.length > 0) {
            setGalleryImages(data.images);
          }
        }
      } catch {}
    }
    loadDynamicImages();
  }, []);

  const activeImage = galleryImages[activeIndex] || FALLBACK_GALLERY_IMAGES[0];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only apply hover zoom on desktop / pointer devices
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - left) / width) * 100;
      const y = ((e.clientY - top) / height) * 100;
      setZoomCoords({ x, y });
    }
  };

  const nextImage = () => {
    setActiveIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setActiveIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      nextImage(); // swipe left -> next
    } else if (diff < -50) {
      prevImage(); // swipe right -> previous
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Main Display Stage */}
      <div
        className="relative aspect-[4/5] max-h-[65vh] sm:max-h-none bg-cream-100 border border-cream-300 rounded-none overflow-hidden select-none group touch-pan-y shadow-sm"
        onMouseEnter={() => {
          if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
            setIsZoomed(true);
          }
        }}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeImage.id || activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full relative"
          >
            <img
              src={activeImage.url}
              alt={activeImage.alt}
              className={`w-full h-full object-cover transition-transform duration-200 ${
                isZoomed ? 'scale-150' : 'scale-100'
              }`}
              style={
                isZoomed
                  ? {
                      transformOrigin: `${zoomCoords.x}% ${zoomCoords.y}%`,
                    }
                  : undefined
              }
            />
          </motion.div>
        </AnimatePresence>

        {/* Floating Zoom Indicator (Desktop Only) */}
        <div className="hidden sm:flex absolute top-4 right-4 bg-obsidian-950/80 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white items-center gap-1.5 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="w-3 h-3" />
          {isZoomed ? 'ZOOM ACTIVE' : 'HOVER TO ZOOM'}
        </div>

        {/* Mobile Swipe Hint Badge (Matches Screenshot 2) */}
        <div className="sm:hidden absolute top-3 right-3 bg-obsidian-950/80 backdrop-blur-xs px-2.5 py-1 rounded text-[10px] uppercase font-bold text-white tracking-widest pointer-events-none shadow">
          {activeIndex + 1} / {galleryImages.length}
        </div>

        {/* Image Caption & Price Overlay Banner */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-obsidian-950/90 via-obsidian-950/60 to-transparent p-3.5 sm:p-4 text-white pointer-events-none">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-[0.2em] text-cream-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-burgundy-500" />
              {activeImage.label}
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-white tracking-wider">
              ₹{PRODUCT_PRICE.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-[11px] sm:text-xs text-cream-100 font-medium line-clamp-1 sm:line-clamp-none">
              {activeImage.caption}
            </p>
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-emerald-400 shrink-0 ml-2">
              {FREE_SHIPPING_TEXT}
            </span>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            prevImage();
          }}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 bg-white/90 hover:bg-white rounded-full text-obsidian-950 shadow-md active:scale-95 transition-all cursor-pointer"
          aria-label="Previous photograph"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            nextImage();
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 bg-white/90 hover:bg-white rounded-full text-obsidian-950 shadow-md active:scale-95 transition-all cursor-pointer"
          aria-label="Next photograph"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Thumbnail Selector Strip */}
      <div className={`grid gap-2 sm:gap-3 ${galleryImages.length <= 4 ? 'grid-cols-4' : 'grid-cols-5'}`}>
        {galleryImages.map((img, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={img.id || index}
              onClick={() => setActiveIndex(index)}
              className={`relative aspect-[4/5] bg-cream-100 border transition-all overflow-hidden cursor-pointer ${
                isActive
                  ? 'border-obsidian-950 ring-2 ring-obsidian-950 shadow-sm'
                  : 'border-cream-300 opacity-60 hover:opacity-100'
              }`}
              aria-label={`View ${img.label || 'Photograph'}`}
            >
              <img
                src={img.url}
                alt={img.alt || 'Garment'}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-0 inset-x-0 bg-obsidian-950/80 text-[8px] sm:text-[9px] uppercase tracking-wider text-white text-center py-0.5 truncate px-1">
                {img.label || `View ${index + 1}`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
