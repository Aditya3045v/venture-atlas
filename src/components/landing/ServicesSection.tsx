'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

interface CoverCardProps {
  imageUrl: string;
  tag: string;
  title: string;
  description: string;
  delay?: number;
}

function CoverCard({ imageUrl, tag, title, description, delay = 0 }: CoverCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className="liquid-glass rounded-3xl overflow-hidden group flex flex-col justify-between border border-white/10 shadow-2xl transition-all duration-500 hover:border-white/20"
    >
      <Link href="/feed" className="flex flex-col h-full">
        {/* Minimal Image Header Area */}
        <div className="relative aspect-video overflow-hidden bg-neutral-950">
          <img
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 filter brightness-80 contrast-105"
            src={imageUrl}
            alt={title}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-7 md:p-8 flex flex-col justify-between flex-1">
          {/* Top row: Tag + Arrow icon */}
          <div className="flex items-center justify-between gap-4">
            <span className="uppercase tracking-widest text-white/40 text-xs font-mono font-medium">
              {tag}
            </span>
            <div className="liquid-glass rounded-full p-2 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300">
              <ArrowUpRight size={16} />
            </div>
          </div>

          {/* Title & Description */}
          <div className="mt-4 space-y-2">
            <h3 className="text-xl sm:text-2xl md:text-3xl text-white font-medium tracking-tight font-sans">
              {title}
            </h3>
            <p className="text-white/70 text-xs sm:text-sm md:text-base leading-relaxed font-sans">
              {description}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function ServicesSection() {
  const headerRef = useRef<HTMLDivElement>(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: '-80px' });

  return (
    <section
      id="cover"
      className="bg-black py-20 sm:py-28 md:py-36 px-6 overflow-hidden relative bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.02)_0%,_transparent_60%)]"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-between mb-10 sm:mb-12 md:mb-16 border-b border-white/10 pb-5 sm:pb-6"
        >
          <div className="space-y-1">
            <div className="text-xs font-mono uppercase tracking-widest text-white/40 font-medium">
              Editorial Coverage Desks
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl text-white tracking-tight font-sans">
              What we cover
            </h2>
          </div>
          <span className="text-white/40 text-xs sm:text-sm hidden md:block font-mono tracking-wider">
            Across the venture ecosystem
          </span>
        </motion.div>

        {/* Two-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Card 1 — Startups & Founders */}
          <CoverCard
            imageUrl="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80"
            tag="Desk / Startups"
            title="Companies & Founders"
            description="Breakout ventures from Pre-Seed to Pre-IPO. Founder architectures, business model blueprints, and strategic moats across AI, Enterprise SaaS, FinTech, and DeepTech."
            delay={0}
          />

          {/* Card 2 — Funding & Capital */}
          <CoverCard
            imageUrl="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80"
            tag="Desk / Capital"
            title="Funding & Markets"
            description="Institutional venture rounds, syndicate participation, valuations, and macro shifts. Every deal verified with lead partners and primary source documentation."
            delay={0.15}
          />
        </div>
      </div>
    </section>
  );
}

export default ServicesSection;
