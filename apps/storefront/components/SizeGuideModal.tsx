'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Ruler, Info } from 'lucide-react';
import { useCart } from '../lib/cart-context';
import {
  OFFICIAL_MEASUREMENTS,
  HOW_TO_MEASURE_GUIDE,
  FIT_PROFILE,
  MEASUREMENT_TOLERANCE,
  WASH_CARE_INSTRUCTIONS,
} from '@stoncrops/shared';

export function SizeGuideModal() {
  const { isSizeGuideOpen, closeSizeGuide, selectedSize, setSelectedSize } = useCart();
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');

  if (!isSizeGuideOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeSizeGuide}
          className="fixed inset-0 bg-obsidian-950/75 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative bg-cream-50 border border-cream-300 w-full max-w-3xl rounded-none shadow-2xl p-4 sm:p-8 z-10 max-h-[92vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-cream-200 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-burgundy-700 text-[10px] font-bold tracking-[0.2em] uppercase mb-1">
                <Ruler className="w-3.5 h-3.5" />
                OFFICIAL GARMENT SPECIFICATION
              </div>
              <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-obsidian-950">
                STONCROPS Fit & Sizing Guide
              </h2>
              <p className="text-[11px] sm:text-xs text-obsidian-600 mt-0.5">
                All measurements are garment measurements taken flat-laid.
              </p>
            </div>

            <button
              onClick={closeSizeGuide}
              className="p-1.5 sm:p-2 text-obsidian-600 hover:text-obsidian-950 hover:bg-cream-200 transition-colors rounded"
              aria-label="Close size guide"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Unit Toggle */}
          <div className="flex items-center justify-between mt-4 sm:mt-6 mb-3">
            <span className="text-[11px] sm:text-xs uppercase tracking-wider font-semibold text-obsidian-800">
              Garment Measurements ({unit.toUpperCase()})
            </span>

            <div className="inline-flex rounded border border-cream-300 p-0.5 bg-cream-100">
              <button
                onClick={() => setUnit('inches')}
                className={`px-2.5 sm:px-3 py-1 text-[11px] font-semibold uppercase tracking-wider rounded transition-all ${
                  unit === 'inches'
                    ? 'bg-obsidian-950 text-white shadow-sm'
                    : 'text-obsidian-600 hover:text-obsidian-950'
                }`}
              >
                Inches
              </button>
              <button
                onClick={() => setUnit('cm')}
                className={`px-2.5 sm:px-3 py-1 text-[11px] font-semibold uppercase tracking-wider rounded transition-all ${
                  unit === 'cm'
                    ? 'bg-obsidian-950 text-white shadow-sm'
                    : 'text-obsidian-600 hover:text-obsidian-950'
                }`}
              >
                Centimeters
              </button>
            </div>
          </div>

          {/* 1. Desktop / Tablet Table View */}
          <div className="hidden sm:block overflow-x-auto border border-cream-300 rounded bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-cream-100 text-[11px] uppercase tracking-wider text-obsidian-700 font-bold border-b border-cream-200">
                <tr>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Chest (Width)</th>
                  <th className="py-3 px-4">Length (Height)</th>
                  <th className="py-3 px-4">Shoulder</th>
                  <th className="py-3 px-4">Sleeve Length</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200 text-obsidian-900">
                {(['S', 'M', 'L'] as const).map((sz) => {
                  const m = OFFICIAL_MEASUREMENTS[sz];
                  const isCurrent = selectedSize === sz;
                  return (
                    <tr
                      key={sz}
                      className={`transition-colors ${
                        isCurrent ? 'bg-burgundy-50/50 font-medium' : 'hover:bg-cream-50'
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold text-obsidian-950">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-xs ${
                            isCurrent
                              ? 'bg-burgundy-700 text-white'
                              : 'bg-cream-200 text-obsidian-800'
                          }`}
                        >
                          {sz}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {unit === 'inches' ? `${m.chestInches}"` : `${m.chestCm} cm`}
                      </td>
                      <td className="py-3.5 px-4">
                        {unit === 'inches' ? `${m.lengthInches}"` : `${m.lengthCm} cm`}
                      </td>
                      <td className="py-3.5 px-4">
                        {unit === 'inches' ? `${m.shoulderInches}"` : `${m.shoulderCm} cm`}
                      </td>
                      <td className="py-3.5 px-4">
                        {unit === 'inches' ? `${m.sleeveInches}"` : `${m.sleeveCm} cm`}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedSize(sz);
                            closeSizeGuide();
                          }}
                          className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded transition-colors ${
                            isCurrent
                              ? 'text-burgundy-700 font-extrabold cursor-default'
                              : 'text-obsidian-600 hover:text-obsidian-950 hover:bg-cream-200'
                          }`}
                        >
                          {isCurrent ? 'Selected' : 'Select'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 2. Mobile-Optimized Card Stack (Zero Horizontal Scroll Needed) */}
          <div className="sm:hidden space-y-2.5">
            {(['S', 'M', 'L'] as const).map((sz) => {
              const m = OFFICIAL_MEASUREMENTS[sz];
              const isCurrent = selectedSize === sz;

              return (
                <div
                  key={sz}
                  className={`p-3.5 border rounded transition-all ${
                    isCurrent
                      ? 'border-burgundy-700 bg-burgundy-50/40 ring-1 ring-burgundy-700/20'
                      : 'border-cream-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-cream-200">
                    <span
                      className={`px-3 py-0.5 rounded text-xs font-black ${
                        isCurrent
                          ? 'bg-burgundy-700 text-white'
                          : 'bg-obsidian-900 text-white'
                      }`}
                    >
                      SIZE {sz}
                    </span>

                    <button
                      onClick={() => {
                        setSelectedSize(sz);
                        closeSizeGuide();
                      }}
                      className={`text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded ${
                        isCurrent
                          ? 'text-burgundy-700 bg-white border border-burgundy-300'
                          : 'text-obsidian-900 bg-cream-200 active:bg-cream-300'
                      }`}
                    >
                      {isCurrent ? 'Current Selection' : 'Select Size'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2.5 text-xs">
                    <div>
                      <span className="text-[10px] text-obsidian-500 uppercase block">Chest (Width)</span>
                      <span className="font-bold text-obsidian-950">
                        {unit === 'inches' ? `${m.chestInches} inches` : `${m.chestCm} cm`}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-obsidian-500 uppercase block">Length (Height)</span>
                      <span className="font-bold text-obsidian-950">
                        {unit === 'inches' ? `${m.lengthInches} inches` : `${m.lengthCm} cm`}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-obsidian-500 uppercase block">Shoulder Width</span>
                      <span className="font-bold text-obsidian-950">
                        {unit === 'inches' ? `${m.shoulderInches} inches` : `${m.shoulderCm} cm`}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-obsidian-500 uppercase block">Sleeve Length</span>
                      <span className="font-bold text-obsidian-950">
                        {unit === 'inches' ? `${m.sleeveInches} inches` : `${m.sleeveCm} cm`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Fit Profile Alert */}
          <div className="mt-4 space-y-2.5">
            <div className="bg-cream-100 border border-cream-200 p-3 sm:p-3.5 rounded text-xs text-obsidian-700 flex gap-2.5 items-start">
              <Info className="w-4 h-4 text-burgundy-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-obsidian-900 mb-0.5">Fit Recommendation:</p>
                <p className="text-[11px] sm:text-xs leading-relaxed">{FIT_PROFILE}</p>
                <p className="text-[10px] sm:text-[11px] text-obsidian-500 mt-1 italic">{MEASUREMENT_TOLERANCE}</p>
              </div>
            </div>
          </div>

          {/* How to Measure Grid */}
          <div className="mt-5 border-t border-cream-200 pt-4">
            <h3 className="text-xs uppercase tracking-wider font-bold text-obsidian-900 mb-2.5">
              How to Measure (Flat-Laid Method)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs">
              {HOW_TO_MEASURE_GUIDE.map((guide, idx) => (
                <div key={idx} className="p-2.5 sm:p-3 bg-white border border-cream-200 rounded">
                  <span className="font-bold text-burgundy-700 block mb-0.5 text-xs">
                    {guide.part}
                  </span>
                  <p className="text-obsidian-600 leading-relaxed text-[11px] sm:text-xs">
                    {guide.instruction}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Care Instructions Note */}
          <div className="mt-4 border-t border-cream-200 pt-3.5 bg-burgundy-50/40 p-3 sm:p-4 border border-burgundy-100 rounded">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-burgundy-800 block mb-1">
              Wash & Garment Care Instructions
            </span>
            <ul className="text-[11px] sm:text-xs text-obsidian-700 space-y-1 list-disc pl-4">
              {WASH_CARE_INSTRUCTIONS.map((care, i) => (
                <li key={i}>{care}</li>
              ))}
            </ul>
          </div>

          {/* Footer CTA */}
          <div className="mt-5 flex justify-end">
            <button
              onClick={closeSizeGuide}
              className="w-full sm:w-auto px-6 py-2.5 bg-obsidian-950 text-white text-xs uppercase tracking-[0.2em] font-bold hover:bg-burgundy-800 transition-colors"
            >
              Done & Return to Garment
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
