'use client';

import React, { useState } from 'react';
import { ChevronDown, Sparkles, Box, Scissors, Truck, RefreshCw } from 'lucide-react';
import {
  PRODUCT_SPECIFICATIONS,
  WASH_CARE_INSTRUCTIONS,
  FIT_PROFILE,
  MEASUREMENT_TOLERANCE,
  FREE_SHIPPING_TEXT,
} from '@stoncrops/shared';

interface AccordionItemProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

function AccordionItem({ title, icon, children, isOpen, onToggle }: AccordionItemProps) {
  return (
    <div className="border-b border-cream-200">
      <button
        onClick={onToggle}
        className="w-full py-4 flex items-center justify-between text-left text-obsidian-950 hover:text-burgundy-700 transition-colors focus:outline-none group"
      >
        <span className="flex items-center gap-3 text-xs sm:text-sm uppercase tracking-[0.18em] font-bold">
          <span className="text-burgundy-700">{icon}</span>
          {title}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-obsidian-500 group-hover:text-burgundy-700 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="pb-5 pt-1 text-xs text-obsidian-700 leading-relaxed space-y-3 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}

export function ProductDetailsAccordion() {
  const [openSection, setOpenSection] = useState<string | null>('desc');

  const toggleSection = (id: string) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  return (
    <div id="details" className="bg-white border border-cream-300 p-6 sm:p-8 rounded-none shadow-sm">
      <div className="mb-6">
        <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-burgundy-700 block mb-1">
          TECHNICAL SPECIFICATIONS
        </span>
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-obsidian-950">
          Garment Construction & Care
        </h3>
      </div>

      <div className="divide-y divide-cream-200">
        {/* 1. Product Description */}
        <AccordionItem
          title="Product Description"
          icon={<Sparkles className="w-4 h-4" />}
          isOpen={openSection === 'desc'}
          onToggle={() => toggleSection('desc')}
        >
          <p>
            STONCROPS introduces our flagship oversized full-sleeve silhouette — the Embroidered Edition. Available in two colourways: <strong>Off-White / Cream</strong> and <strong>Jet Black</strong>. Both are cut from premium Loopnet fabric and feature bespoke floral embroidery traversing both sleeves, finished with embroidered STONCROPS chest typography.
          </p>
          <p>
            Engineered with a boxy drop-shoulder cut, the garment creates a relaxed, structured drape suitable for year-round styling.
          </p>
          <div className="grid grid-cols-2 gap-2 pt-2">
            {PRODUCT_SPECIFICATIONS.map((spec, i) => (
              <div key={i} className="bg-cream-100 p-2.5 rounded border border-cream-200">
                <span className="text-[10px] uppercase font-semibold text-obsidian-500 block">
                  {spec.label}
                </span>
                <span className="text-xs font-bold text-obsidian-900 mt-0.5 block">
                  {spec.value}
                </span>
              </div>
            ))}
          </div>
        </AccordionItem>

        {/* 2. Material & Construction */}
        <AccordionItem
          title="Material & Construction"
          icon={<Box className="w-4 h-4" />}
          isOpen={openSection === 'material'}
          onToggle={() => toggleSection('material')}
        >
          <p>
            Crafted strictly using high-grade <strong>Loopnet</strong> fabric. Loopnet provides a tactile, breathable structure with an ultra-soft interior surface and a resilient outer face that maintains a crisp boxy silhouette without creasing or collapsing.
          </p>
          <p>
            The floral motifs on each sleeve are executed with high-density burgundy embroidery thread, precision-calibrated to preserve stitch definition through laundering.
          </p>
        </AccordionItem>

        {/* 3. Fit & Sizing */}
        <AccordionItem
          title="Fit & Sizing"
          icon={<Scissors className="w-4 h-4" />}
          isOpen={openSection === 'fit'}
          onToggle={() => toggleSection('fit')}
        >
          <p>
            <strong>Silhouette:</strong> {FIT_PROFILE}
          </p>
          <p className="italic text-obsidian-500">
            {MEASUREMENT_TOLERANCE}
          </p>
          <div className="bg-cream-100 p-3 rounded border border-cream-200 mt-2">
            <span className="text-[11px] uppercase font-bold text-obsidian-900 block mb-1">
              Garment Measurements Quick Reference (Inches flat-laid):
            </span>
            <ul className="text-xs space-y-1">
              <li><strong>Small (S):</strong> Chest 21.5&quot; | Length 27.5&quot; | Shoulder 21.5&quot; | Sleeve 23.0&quot;</li>
              <li><strong>Medium (M):</strong> Chest 23.0&quot; | Length 28.0&quot; | Shoulder 22.0&quot; | Sleeve 24.0&quot;</li>
              <li><strong>Large (L):</strong> Chest 24.0&quot; | Length 29.0&quot; | Shoulder 22.5&quot; | Sleeve 24.5&quot;</li>
            </ul>
          </div>
        </AccordionItem>

        {/* 4. Shipping Information */}
        <AccordionItem
          title="Shipping & Delivery"
          icon={<Truck className="w-4 h-4" />}
          isOpen={openSection === 'shipping'}
          onToggle={() => toggleSection('shipping')}
        >
          <p>
            <strong>{FREE_SHIPPING_TEXT}:</strong> We provide complimentary insured courier shipping for every order across all Indian states and union territories.
          </p>
          <p>
            Orders are packed and dispatched within 24 to 48 hours. Estimated transit time:
          </p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Metro cities (Bangalore, Mumbai, Delhi-NCR, Hyderabad, Chennai, Kolkata): 2-4 business days.</li>
            <li>Rest of India: 3-6 business days.</li>
          </ul>
          <p className="text-obsidian-500">
            Real-time tracking notifications are sent via WhatsApp and email once dispatched.
          </p>
        </AccordionItem>

        {/* 5. Care Instructions */}
        <AccordionItem
          title="Care Instructions"
          icon={<RefreshCw className="w-4 h-4" />}
          isOpen={openSection === 'care'}
          onToggle={() => toggleSection('care')}
        >
          <p className="font-semibold text-obsidian-950">
            To preserve the bespoke sleeve embroidery and fabric drape:
          </p>
          <ul className="list-disc pl-4 space-y-1.5">
            {WASH_CARE_INSTRUCTIONS.map((instr, idx) => (
              <li key={idx} className={idx === 0 ? 'text-burgundy-800 font-medium' : ''}>
                {instr}
              </li>
            ))}
          </ul>
          <div className="bg-amber-50 border border-amber-200 p-2.5 rounded text-[11px] text-amber-900 mt-2">
            Notice: In accordance with official size chart instructions, always detach any metal accessories prior to placing the garment in a washing machine.
          </div>
        </AccordionItem>
      </div>
    </div>
  );
}
