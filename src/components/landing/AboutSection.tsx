'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export function AboutSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once: true,
    margin: '-80px',
  });

  return (
    <section
      ref={ref}
      id="about"
      className="bg-black pt-24 sm:pt-32 md:pt-40 pb-12 sm:pb-16 md:pb-20 px-6 overflow-hidden relative bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.035)_0%,_transparent_70%)]"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-white/40 text-xs sm:text-sm tracking-widest uppercase mb-6 sm:mb-8 font-mono font-medium"
        >
          About Venture Atlas
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-[1.12] tracking-tight font-sans max-w-5xl mb-12 sm:mb-16"
        >
          We follow the ideas that{' '}
          <span className="font-serif italic text-white/60">move</span>
          <br className="hidden md:inline" />{' '}
          markets, companies, and the people building what comes next.
        </motion.h2>

        {/* 3-Pillar Minimal Core Value Strip */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 pt-8 border-t border-white/10"
        >
          <div className="space-y-2.5">
            <div className="text-white/40 text-xs font-mono font-medium tracking-wider">
              01 / HIGH-DENSITY STANDARD
            </div>
            <h3 className="text-white text-base sm:text-lg font-medium tracking-tight">
              High-Density Intelligence
            </h3>
            <p className="text-white/60 text-xs sm:text-sm leading-relaxed">
              No fluff essays or speculative filler. Every briefing delivers the core company milestone, verified numbers, and strategic implications with zero noise.
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="text-white/40 text-xs font-mono font-medium tracking-wider">
              02 / PRIMARY ATTRIBUTION
            </div>
            <h3 className="text-white text-base sm:text-lg font-medium tracking-tight">
              Zero Speculative Noise
            </h3>
            <p className="text-white/60 text-xs sm:text-sm leading-relaxed">
              Directly cross-referenced against regulatory filings, official term sheets, and primary source wires with verifiable links.
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="text-white/40 text-xs font-mono font-medium tracking-wider">
              03 / FOUNDER BLUEPRINTS
            </div>
            <h3 className="text-white text-base sm:text-lg font-medium tracking-tight">
              Moats & Unit Economics
            </h3>
            <p className="text-white/60 text-xs sm:text-sm leading-relaxed">
              In-depth company teardowns covering go-to-market mechanics, pricing architectures, and operational playbooks.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default AboutSection;
