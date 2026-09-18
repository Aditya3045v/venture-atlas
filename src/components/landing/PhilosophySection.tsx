'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export function PhilosophySection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once: true,
    margin: '-80px',
  });

  return (
    <section id="philosophy" className="bg-black py-20 sm:py-28 md:py-36 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto" ref={ref}>
        {/* Main Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-white tracking-tight mb-12 sm:mb-16 md:mb-20 font-sans"
        >
          Intelligence{' '}
          <span className="font-serif italic text-white/40 lowercase px-1 md:px-2">x</span>{' '}
          Context
        </motion.h2>

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 items-center">
          {/* Left — Minimal Editorial Telemetry Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-3xl overflow-hidden aspect-[4/3] relative border border-white/10 shadow-2xl bg-neutral-950 group"
          >
            <img
              src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80"
              alt="Venture Atlas Telemetry and Market Signals"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter brightness-85 contrast-110"
              loading="lazy"
            />
            {/* Dark gradient vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

            {/* In-Image Telemetry Chip */}
            <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6">
              <div className="liquid-glass rounded-2xl p-4 backdrop-blur-md flex items-center justify-between gap-3 text-xs font-mono">
                <div>
                  <div className="text-[10px] uppercase text-white/50 font-bold tracking-wider">
                    MARKET INTELLIGENCE ENGINE
                  </div>
                  <div className="text-white font-medium text-xs sm:text-sm">
                    Verified Deal & Cap Table Signals
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider shrink-0">
                  Live Wire
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right — Text Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col justify-center space-y-6 sm:space-y-8"
          >
            {/* Block 1 */}
            <div className="space-y-2">
              <div className="text-white/40 text-xs tracking-widest uppercase font-mono font-medium">
                Signal over narrative noise
              </div>
              <h3 className="text-white text-lg sm:text-xl font-medium tracking-tight">
                Filtered for institutional precision
              </h3>
              <p className="text-white/70 text-sm sm:text-base leading-relaxed font-sans">
                In an ecosystem saturated with PR re-writes and speculative fluff, Venture Atlas isolates verifiable data — real capitalization, verified round participants, and audited milestones with zero narrative spin.
              </p>
            </div>

            {/* Separator Divider */}
            <div className="w-full h-px bg-white/10" />

            {/* Block 2 */}
            <div className="space-y-2">
              <div className="text-white/40 text-xs tracking-widest uppercase font-mono font-medium">
                Context behind every round
              </div>
              <h3 className="text-white text-lg sm:text-xl font-medium tracking-tight">
                Understand why it matters
              </h3>
              <p className="text-white/70 text-sm sm:text-base leading-relaxed font-sans">
                A funding headline is just the starting point. We connect syndicate chemistry, competitive battlegrounds, unit economics, and market timing so you grasp the strategic reality behind the raise.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default PhilosophySection;
