'use client';

import React from 'react';
import Link from 'next/link';
import {
  IconBolt,
  IconWaveSine,
  IconFileCertificate,
  IconBuildingSkyscraper,
  IconArrowNarrowRight,
  IconCircleCheck,
  IconRadar2,
  IconBrandYcombinator,
  IconBrandStripe,
  IconBrandOpenai,
  IconBrandGithub,
  IconCpu,
} from '@tabler/icons-react';

export function IntelligenceBentoSection() {
  const partners = [
    { name: 'Y COMBINATOR', icon: IconBrandYcombinator, color: '#FF6600' },
    { name: 'SEQUOIA RADAR', icon: IconRadar2, color: '#10B981' },
    { name: 'OPENAI LABS', icon: IconBrandOpenai, color: '#10A37F' },
    { name: 'STRIPE ALUMNI', icon: IconBrandStripe, color: '#635BFF' },
    { name: 'DEEPTECH SILICON', icon: IconCpu, color: '#F59E0B' },
    { name: 'GITHUB ECOSYSTEM', icon: IconBrandGithub, color: '#94A3B8' },
  ];

  return (
    <section className="w-full max-w-6xl mx-auto space-y-12 select-none py-6">
      {/* 1. Global Readership & Partner Ticker with Real Vector Brand Marks */}
      <div className="space-y-4 text-center">
        <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-text-tertiary flex items-center justify-center gap-2">
          <IconRadar2 size={14} className="text-amber-400 animate-pulse" />
          <span>READ DAILY BY FOUNDERS, OPERATORS & GPS FROM</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 py-4 border-y border-border/60">
          {partners.map((p, idx) => {
            const IconComp = p.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-2 text-xs sm:text-sm font-display font-black tracking-tight text-text-secondary hover:text-text-primary transition-all duration-200 cursor-default group"
              >
                <span className="p-1 rounded bg-surface-muted group-hover:scale-110 transition-transform">
                  <IconComp size={16} style={{ color: p.color }} />
                </span>
                <span>{p.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Premium Bento Grid: The Venture Atlas Intelligence Advantage */}
      <div className="space-y-4">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
            <IconBolt size={14} className="text-amber-400" />
            <span>ENGINEERED FOR HIGH-DENSITY OPERATORS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black font-display uppercase tracking-tight text-text-primary">
            How Venture Atlas Works
          </h2>
          <p className="text-sm font-body text-text-secondary">
            We eliminate fluff, narrative bias, and 2,000-word filler essays to give you verified signals in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4">
          {/* Card 1: The 60-Word Hard Limit (7 Cols) */}
          <div className="md:col-span-7 p-6 sm:p-8 rounded-3xl ios-card bg-gradient-to-br from-amber-500/[0.05] via-surface-card to-surface-card dark:from-amber-500/[0.08] dark:via-[#111113] dark:to-[#111113] border border-amber-500/20 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-2xl bg-amber-400 text-black shadow-xs inline-block">
                  <IconBolt size={22} stroke={2.5} />
                </span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-400/15 text-amber-400 border border-amber-400/30">
                  STRICT BUDGET
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold font-display text-text-primary">
                Hard 60-Word Editorial Limit
              </h3>

              <p className="text-sm font-body text-text-secondary leading-relaxed">
                Every news brief is constrained to exactly 60 words. You get the round size, valuation, lead investors, and technical core without 10 paragraphs of background fluff.
              </p>
            </div>

            {/* Comparison Pill Box */}
            <div className="p-4 rounded-2xl bg-surface-muted/60 dark:bg-black/40 border border-border/60 space-y-2 mt-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-text-tertiary line-through">Traditional Media: 1,800 words (12 min read)</span>
                <span className="font-bold text-red-400">95% Fluff</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <IconCircleCheck size={14} className="text-emerald-400" />
                  <span>Venture Atlas: 60 words (20-sec briefing)</span>
                </span>
                <span className="font-bold text-emerald-400">100% Signal</span>
              </div>
            </div>
          </div>

          {/* Card 2: 20-Second Audio Synthesis (5 Cols) */}
          <div className="md:col-span-5 p-6 sm:p-8 rounded-3xl ios-card bg-gradient-to-br from-blue-500/[0.05] via-surface-card to-surface-card dark:from-blue-500/[0.08] dark:via-[#111113] dark:to-[#111113] border border-blue-500/20 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-2xl bg-blue-500 text-white shadow-xs inline-block">
                  <IconWaveSine size={22} stroke={2.5} />
                </span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  HANDS-FREE
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold font-display text-text-primary">
                Voice & Audio Briefs
              </h3>

              <p className="text-sm font-body text-text-secondary leading-relaxed">
                Listen on the go with built-in instant speech synthesis at 1.0x, 1.2x, or 1.5x speeds.
              </p>
            </div>

            {/* Audio Wave Visualizer */}
            <div className="flex items-center gap-1.5 h-10 px-4 rounded-2xl bg-surface-muted/60 dark:bg-black/40 border border-border/60 justify-center">
              <div className="w-1 h-3 bg-blue-400 rounded-full animate-pulse" />
              <div className="w-1 h-6 bg-blue-400 rounded-full animate-pulse delay-75" />
              <div className="w-1 h-8 bg-blue-400 rounded-full animate-pulse delay-150" />
              <div className="w-1 h-5 bg-blue-400 rounded-full animate-pulse delay-100" />
              <div className="w-1 h-7 bg-blue-400 rounded-full animate-pulse delay-200" />
              <div className="w-1 h-4 bg-blue-400 rounded-full animate-pulse delay-300" />
              <div className="w-1 h-6 bg-blue-400 rounded-full animate-pulse delay-150" />
              <div className="w-1 h-3 bg-blue-400 rounded-full animate-pulse" />
            </div>
          </div>

          {/* Card 3: Verified Primary Sources (5 Cols) */}
          <div className="md:col-span-5 p-6 sm:p-8 rounded-3xl ios-card bg-gradient-to-br from-purple-500/[0.05] via-surface-card to-surface-card dark:from-purple-500/[0.08] dark:via-[#111113] dark:to-[#111113] border border-purple-500/20 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-2xl bg-purple-500 text-white shadow-xs inline-block">
                  <IconFileCertificate size={22} stroke={2.5} />
                </span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-purple-500/15 text-purple-400 border border-purple-500/30">
                  PRIMARY DATA
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold font-display text-text-primary">
                Direct SEC & Wire Verification
              </h3>

              <p className="text-sm font-body text-text-secondary leading-relaxed">
                Zero anonymous rumors. Every funding round, acquisition, and balance sheet is verified against primary regulatory filings.
              </p>
            </div>

            <div className="text-xs font-mono font-bold text-purple-400 flex items-center gap-1.5">
              <span>SEC Form D · Wire Attribution · Press Releases</span>
            </div>
          </div>

          {/* Card 4: Architectural Deep Dives & Case Studies (7 Cols) */}
          <div className="md:col-span-7 p-6 sm:p-8 rounded-3xl ios-card bg-gradient-to-br from-emerald-500/[0.05] via-surface-card to-surface-card dark:from-emerald-500/[0.08] dark:via-[#111113] dark:to-[#111113] border border-emerald-500/20 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-2xl bg-emerald-500 text-white shadow-xs inline-block">
                  <IconBuildingSkyscraper size={22} stroke={2.5} />
                </span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  CASE STUDIES
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold font-display text-text-primary">
                Proprietary Teardowns & Playbooks
              </h3>

              <p className="text-sm font-body text-text-secondary leading-relaxed">
                From Stripe’s $1T financial ledger to Linear’s zero-outbound sales flywheel — learn the exact architectural and growth secrets of breakout companies.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs font-mono text-text-tertiary">
                Includes Valuation, Key Metrics, & 3-Pillar Playbooks
              </span>
              <Link
                href="/case-studies"
                className="text-xs font-mono font-bold uppercase text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Browse Teardowns</span>
                <IconArrowNarrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
