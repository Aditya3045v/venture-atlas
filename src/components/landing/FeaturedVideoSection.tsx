'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';

export function FeaturedVideoSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once: true,
    margin: '-80px',
  });

  return (
    <section className="bg-black pt-6 sm:pt-8 md:pt-12 pb-16 sm:pb-24 md:pb-32 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-3xl overflow-hidden aspect-[16/9] md:aspect-[21/9] relative group shadow-2xl border border-white/10 bg-neutral-950"
        >
          {/* Background Editorial Image (Minimal, Non-Flashy) */}
          <img
            src="/onboarding-hero.jpg"
            alt="Venture Atlas Editorial Wire Desk"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02] filter brightness-90 contrast-105"
            loading="lazy"
          />

          {/* Gradient Overlay for high legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20 pointer-events-none" />

          {/* Section Overlay Content */}
          <div className="absolute inset-0 p-6 sm:p-10 md:p-14 flex flex-col justify-between z-10">
            {/* Top Pill */}
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass text-white/70 text-[11px] font-mono tracking-wider uppercase backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>EDITORIAL WIRE DESK</span>
              </div>
              <span className="text-white/40 font-mono text-xs hidden sm:inline">
                Primary Attribution · Verified Intelligence
              </span>
            </div>

            {/* Bottom Content Bar */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="liquid-glass rounded-2xl p-6 sm:p-7 max-w-xl backdrop-blur-md space-y-2.5">
                <div className="text-white/50 text-xs tracking-widest uppercase font-mono font-medium">
                  The Bloomberg + Inshorts Standard
                </div>
                <h3 className="text-white text-lg sm:text-xl md:text-2xl font-medium tracking-tight font-sans">
                  The signal behind venture moves, synthesized for operators.
                </h3>
                <p className="text-white/70 text-xs sm:text-sm leading-relaxed font-sans">
                  Venture Atlas brings the signals behind the headlines into one place — the breakout companies being built, institutional capital moving, and founders shaping entire industries.
                </p>
              </div>

              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="self-start md:self-end flex-shrink-0"
              >
                <Link
                  href="/feed"
                  className="liquid-glass rounded-full px-7 sm:px-8 py-3 sm:py-3.5 text-white text-xs sm:text-sm font-medium hover:bg-white/15 transition-colors cursor-pointer whitespace-nowrap inline-flex items-center justify-center shadow-lg gap-2"
                >
                  <span>Explore Live Wire</span>
                  <span>→</span>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default FeaturedVideoSection;
