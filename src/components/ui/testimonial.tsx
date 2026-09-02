'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { type Variants } from 'framer-motion';
import { TimelineContent } from '@/components/ui/timeline-animation';

export function ClientFeedback() {
  const testimonialRef = useRef<HTMLDivElement>(null);

  const revealVariants: Variants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        delay: i * 0.15,
        duration: 0.5,
        ease: 'easeOut',
      },
    }),
    hidden: {
      filter: 'blur(10px)',
      y: -20,
      opacity: 0,
    },
  };

  return (
    <section
      className="relative w-full mx-auto rounded-3xl py-4 select-none"
      ref={testimonialRef}
    >
      {/* Section Header */}
      <article className="max-w-screen-md mx-auto text-center space-y-2 px-4">
        <TimelineContent
          as="h2"
          className="text-3xl sm:text-4xl md:text-5xl font-black font-display uppercase tracking-tight text-text-primary"
          animationNum={0}
          customVariants={revealVariants}
          timelineRef={testimonialRef}
        >
          Trusted by Startups & the World’s Leading Funds
        </TimelineContent>
        <TimelineContent
          as="p"
          className="mx-auto text-sm sm:text-base text-text-secondary font-body max-w-xl leading-relaxed font-normal"
          animationNum={1}
          customVariants={revealVariants}
          timelineRef={testimonialRef}
        >
          How founders, general partners, and tech operators rely on Venture Atlas 60-word intelligence wire every morning.
        </TimelineContent>
      </article>

      {/* 3-Column Bento Grid Layout (Matching Exact Reference) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 w-full py-4 px-2 sm:px-4">
        {/* Column 1 (Left) */}
        <div className="flex flex-col space-y-3.5 h-full">
          {/* Top Tall Light Card with Architectural Grid */}
          <TimelineContent
            animationNum={0}
            customVariants={revealVariants}
            timelineRef={testimonialRef}
            className="flex-1 flex flex-col justify-between relative bg-white dark:bg-[#18181B] text-neutral-900 dark:text-neutral-100 overflow-hidden rounded-2xl border border-neutral-200 dark:border-white/10 p-6 shadow-sm group hover:shadow-md transition-shadow min-h-[260px]"
          >
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000010_1px,transparent_1px),linear-gradient(to_bottom,#00000010_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none" />

            <article className="mt-auto space-y-5 relative z-10">
              <p className="text-sm sm:text-base font-body leading-relaxed text-neutral-800 dark:text-neutral-200">
                "Venture Atlas has been a complete game-changer for our executive team. Exactly 60 words, zero fluff, and verified SEC filings before markets open."
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-white/5">
                <div>
                  <h3 className="font-bold font-display text-sm sm:text-base text-neutral-950 dark:text-white">
                    Guillermo Rauch
                  </h3>
                  <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400">CEO of Enigma</p>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop"
                  alt="Guillermo Rauch"
                  className="w-12 h-12 rounded-xl object-cover border border-neutral-200 dark:border-white/10 shadow-xs"
                />
              </div>
            </article>
          </TimelineContent>

          {/* Bottom Vibrant Electric Blue Card */}
          <TimelineContent
            animationNum={1}
            customVariants={revealVariants}
            timelineRef={testimonialRef}
            className="flex flex-col justify-between relative bg-[#0066FF] text-white overflow-hidden rounded-2xl border border-blue-400/40 p-6 shadow-md"
          >
            <article className="mt-auto space-y-4">
              <p className="text-xs sm:text-sm font-body leading-relaxed text-white/95 font-medium">
                "The 20-second audio briefs have saved me 45 minutes every morning. The signal-to-noise ratio is unbeatable."
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-white/20">
                <div>
                  <h3 className="font-bold font-display text-sm sm:text-base text-white">Rika Shinoda</h3>
                  <p className="text-xs font-mono text-white/80">CEO of Kintsugi</p>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1512485694743-9c9538b4e6e0?q=80&w=200&auto=format&fit=crop"
                  alt="Rika Shinoda"
                  className="w-12 h-12 rounded-xl object-cover border border-white/20 shadow-xs"
                />
              </div>
            </article>
          </TimelineContent>
        </div>

        {/* Column 2 (Middle - 3 Stacked Dark Cards) */}
        <div className="flex flex-col space-y-3.5 h-full">
          {/* Card 1 */}
          <TimelineContent
            animationNum={2}
            customVariants={revealVariants}
            timelineRef={testimonialRef}
            className="flex flex-col justify-between relative bg-[#111113] text-white overflow-hidden rounded-2xl border border-white/10 p-5 shadow-sm"
          >
            <article className="space-y-3">
              <p className="text-xs sm:text-sm font-body leading-relaxed text-zinc-300">
                "Their architectural case studies on Stripe and Linear gave us the exact playbook we used to scale our developer platform."
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div>
                  <h3 className="font-bold font-display text-sm text-white">Reacher</h3>
                  <p className="text-xs font-mono text-zinc-400">CEO of OdeaoLabs</p>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1566753323558-f4e0952af115?q=80&w=200&auto=format&fit=crop"
                  alt="Reacher"
                  className="w-11 h-11 rounded-xl object-cover border border-white/15 shadow-xs"
                />
              </div>
            </article>
          </TimelineContent>

          {/* Card 2 */}
          <TimelineContent
            animationNum={3}
            customVariants={revealVariants}
            timelineRef={testimonialRef}
            className="flex flex-col justify-between relative bg-[#111113] text-white overflow-hidden rounded-2xl border border-white/10 p-5 shadow-sm"
          >
            <article className="space-y-3">
              <p className="text-xs sm:text-sm font-body leading-relaxed text-zinc-300">
                "As an active seed investor, Venture Atlas is the only publication I read before taking founder pitch calls."
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div>
                  <h3 className="font-bold font-display text-sm text-white">Johnathan Vance</h3>
                  <p className="text-xs font-mono text-zinc-400">Partner at Labsbo VC</p>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1615109398623-88346a601842?q=80&w=200&auto=format&fit=crop"
                  alt="John"
                  className="w-11 h-11 rounded-xl object-cover border border-white/15 shadow-xs"
                />
              </div>
            </article>
          </TimelineContent>

          {/* Card 3 */}
          <TimelineContent
            animationNum={4}
            customVariants={revealVariants}
            timelineRef={testimonialRef}
            className="flex flex-col justify-between relative bg-[#111113] text-white overflow-hidden rounded-2xl border border-white/10 p-5 shadow-sm"
          >
            <article className="space-y-3">
              <p className="text-xs sm:text-sm font-body leading-relaxed text-zinc-300">
                "Real-time cap table teardowns and accurate valuation metrics without paywall friction. Exceptional craft."
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div>
                  <h3 className="font-bold font-display text-sm text-white">Steven Sunny</h3>
                  <p className="text-xs font-mono text-zinc-400">CEO of Boxefi</p>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"
                  alt="Steven Sunny"
                  className="w-11 h-11 rounded-xl object-cover border border-white/15 shadow-xs"
                />
              </div>
            </article>
          </TimelineContent>
        </div>

        {/* Column 3 (Right) */}
        <div className="flex flex-col space-y-3.5 h-full">
          {/* Top Vibrant Electric Blue Card */}
          <TimelineContent
            animationNum={5}
            customVariants={revealVariants}
            timelineRef={testimonialRef}
            className="flex flex-col justify-between relative bg-[#0066FF] text-white overflow-hidden rounded-2xl border border-blue-400/40 p-6 shadow-md"
          >
            <article className="mt-auto space-y-4">
              <p className="text-xs sm:text-sm font-body leading-relaxed text-white/95 font-medium">
                "Venture Atlas has been a key intelligence partner in our growth and Series B fundraising journey."
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-white/20">
                <div>
                  <h3 className="font-bold font-display text-sm sm:text-base text-white">Marc K.</h3>
                  <p className="text-xs font-mono text-white/80">Founder at OdeaoLabs</p>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1563237023-b1e970526dcb?q=80&w=200&auto=format&fit=crop"
                  alt="Marc K."
                  className="w-12 h-12 rounded-xl object-cover border border-white/20 shadow-xs"
                />
              </div>
            </article>
          </TimelineContent>

          {/* Bottom Tall Light Card with Architectural Grid */}
          <TimelineContent
            animationNum={6}
            customVariants={revealVariants}
            timelineRef={testimonialRef}
            className="flex-1 flex flex-col justify-between relative bg-white dark:bg-[#18181B] text-neutral-900 dark:text-neutral-100 overflow-hidden rounded-2xl border border-neutral-200 dark:border-white/10 p-6 shadow-sm group hover:shadow-md transition-shadow min-h-[260px]"
          >
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000010_1px,transparent_1px),linear-gradient(to_bottom,#00000010_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none" />

            <article className="mt-auto space-y-5 relative z-10">
              <p className="text-sm sm:text-base font-body leading-relaxed text-neutral-800 dark:text-neutral-200">
                "Their investigative reporting on deeptech microchip accelerators and distributed ledgers is far ahead of mainstream business news."
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-white/5">
                <div>
                  <h3 className="font-bold font-display text-sm sm:text-base text-neutral-950 dark:text-white">
                    Paul Brauch
                  </h3>
                  <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400">CTO of Spectrum</p>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1590086782957-93c06ef21604?q=80&w=200&auto=format&fit=crop"
                  alt="Paul Brauch"
                  className="w-12 h-12 rounded-xl object-cover border border-neutral-200 dark:border-white/10 shadow-xs"
                />
              </div>
            </article>
          </TimelineContent>
        </div>
      </div>
    </section>
  );
}

export default ClientFeedback;
