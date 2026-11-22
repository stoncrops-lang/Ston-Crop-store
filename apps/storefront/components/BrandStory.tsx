'use client';

import React from 'react';
import { BRAND_NAME, INSTAGRAM_URL, INSTAGRAM_HANDLE } from '@stoncrops/shared';
import { Instagram } from 'lucide-react';

export function BrandStory() {
  return (
    <section id="about" className="py-20 md:py-28 bg-obsidian-950 text-white relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-burgundy-900/20 blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
        <span className="text-[11px] uppercase font-bold tracking-[0.3em] text-burgundy-500 block">
          THE ARCHIVE PHILOSOPHY
        </span>

        <h2 className="wordmark text-2xl sm:text-3xl md:text-4xl tracking-[0.3em] font-extrabold text-white">
          {BRAND_NAME}
        </h2>

        <p className="text-sm sm:text-base text-zinc-400 font-light leading-relaxed max-w-2xl mx-auto">
          Born from a desire for structured silhouettes and uncompromising textile presence, STONCROPS creates modern fashion at the intersection of streetwear and deliberate craftsmanship.
        </p>

        <p className="text-xs sm:text-sm text-zinc-500 font-light leading-relaxed max-w-2xl mx-auto">
          The Embroidered Edition embodies our core thesis: heavyweight Loopnet fabric, architectural drop-shoulder geometry, and bespoke sleeve embroidery that commands attention without excess noise.
        </p>

        {/* Instagram Bridge */}
        <div className="pt-2">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-burgundy-950/60 border border-burgundy-800/60 hover:border-burgundy-600 text-xs uppercase tracking-[0.2em] font-semibold text-burgundy-300 hover:text-white transition-all shadow-sm"
          >
            <Instagram className="w-4 h-4 text-burgundy-500" />
            <span>Follow our journey on Instagram:</span>
            <span className="text-white font-bold">{INSTAGRAM_HANDLE}</span>
          </a>
        </div>

        <div className="pt-6 flex items-center justify-center gap-8 text-[11px] uppercase tracking-[0.25em] text-zinc-400 font-semibold">
          <span>PRECISION CUT</span>
          <span className="text-burgundy-600">•</span>
          <span>HEAVYWEIGHT LOOPNET</span>
          <span className="text-burgundy-600">•</span>
          <span>LIMITED ARCHIVE</span>
        </div>
      </div>
    </section>
  );
}
