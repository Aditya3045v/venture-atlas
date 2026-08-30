'use client';

import React, { useState, useEffect } from 'react';
import {
  IconChevronLeft,
  IconChevronRight,
  IconPlayerPlayFilled,
  IconPlayerPauseFilled,
  IconBookmark,
  IconBookmarkFilled,
  IconVolume,
  IconRadio,
} from '@tabler/icons-react';

export interface PhoneScreenItem {
  tag: string;
  tagColor?: string;
  timeAgo: string;
  title: string;
  summary: string;
  image: string;
  source: string;
  audioLength: string;
}

const SCREENS: PhoneScreenItem[] = [
  {
    tag: 'FUNDING · SERIES C',
    tagColor: '#10B981',
    timeAgo: '12m ago',
    title: 'Verity Silicon Closes $340M to Ramp AI Inference Microchips',
    summary:
      'Verity Silicon closed a $340M round led by Sequoia and Temasek. Mass fabrication of sub-15W analog compute accelerators begins late Q4 at TSMC.',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=700&q=80',
    source: 'The Information',
    audioLength: '0:22',
  },
  {
    tag: 'STARTUPS · SEED',
    tagColor: '#FF6B6B',
    timeAgo: '45m ago',
    title: 'Two Ex-Stripe Engineers Launch Unified African Payroll API',
    summary:
      'Zephyr emerged from stealth with $14M from Founders Fund & YC to unify contractor payouts across 18 African markets with instant mobile money routing.',
    image: 'https://images.unsplash.com/photo-1556742049-0a67e557224f?auto=format&fit=crop&w=700&q=80',
    source: 'TechCrunch',
    audioLength: '0:25',
  },
  {
    tag: 'CASE STUDY · SCALE',
    tagColor: '#F59E0B',
    timeAgo: '2h ago',
    title: 'Stripe: The Architecture of a $1T Distributed Financial Ledger',
    summary:
      'How an 8-line code snippet grew to process 1% of global GDP with immutable ledger entries, 99.999% uptime, and autonomous engineering pods.',
    image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=700&q=80',
    source: 'Venture Atlas Teardown',
    audioLength: '0:28',
  },
  {
    tag: 'AI & TECH · INFRA',
    tagColor: '#8B5CF6',
    timeAgo: '3h ago',
    title: '62% of Enterprise Teams Migrating to Self-Hosted Open-Weight LLMs',
    summary:
      'Survey of 400 CTOs reveals rapid transition from proprietary APIs to dedicated quantization clusters, reporting 74% inference cost savings.',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=700&q=80',
    source: 'VentureBeat',
    audioLength: '0:20',
  },
];

export function PhoneCarouselMockup() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [saved, setSaved] = useState(false);

  const activeScreen = SCREENS[currentIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isPlaying) {
        setCurrentIndex(prev => (prev + 1) % SCREENS.length);
      }
    }, 5500);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const toggleAudio = () => {
    if (!('speechSynthesis' in window)) return;
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      window.speechSynthesis.cancel();
      const text = `${activeScreen.title}. ${activeScreen.summary}. Reported by ${activeScreen.source}.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      setIsPlaying(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handlePrev = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
    setCurrentIndex(prev => (prev - 1 + SCREENS.length) % SCREENS.length);
  };

  const handleNext = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
    setCurrentIndex(prev => (prev + 1) % SCREENS.length);
  };

  return (
    <div className="relative flex flex-col items-center select-none">
      {/* Outer Titanium iPhone 16 Pro Frame */}
      <div className="relative w-[300px] sm:w-[330px] md:w-[350px] rounded-[54px] p-3.5 bg-gradient-to-b from-[#3A3A3C] via-[#1C1C1E] to-[#0D0D0E] shadow-[0_30px_90px_-20px_rgba(0,0,0,0.95)] border border-white/25 ring-1 ring-white/10">
        {/* Inner OLED Glass Screen */}
        <div className="relative w-full rounded-[44px] bg-[#09090B] overflow-hidden border border-white/10 aspect-[9/19] flex flex-col justify-between shadow-inner">
          {/* iOS Status Bar & Dynamic Island */}
          <div className="pt-3.5 px-6 pb-2 flex items-center justify-between text-white text-[11px] font-mono select-none z-20">
            <span className="font-bold tracking-tight">9:41</span>
            {/* Dynamic Island with live pulse */}
            <div className="w-24 h-4 bg-black rounded-full border border-white/15 flex items-center justify-center gap-1.5 shadow-md">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[7px] font-mono font-bold tracking-widest uppercase text-amber-300">
                VA LIVE
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3.5 h-2 border border-white/90 rounded-[2px] p-[1px] flex items-center">
                <div className="w-full h-full bg-white rounded-[1px]" />
              </div>
            </div>
          </div>

          {/* App Header Inside Screen */}
          <div className="px-4 pt-1 pb-2 flex items-center justify-between border-b border-white/10 z-10">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-amber-400 text-black flex items-center justify-center text-[10px] font-black font-display">
                VA
              </div>
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-white/90">
                VENTURE ATLAS
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[8px] font-mono font-bold uppercase bg-white/10 text-white/80 border border-white/10">
              60-SEC WIRE
            </span>
          </div>

          {/* Main Slide Content */}
          <div className="p-4 flex-1 flex flex-col justify-between space-y-3 z-10">
            {/* Tag & Timestamp */}
            <div className="flex items-center justify-between">
              <span
                className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase text-white shadow-xs"
                style={{ backgroundColor: activeScreen.tagColor || '#10B981' }}
              >
                {activeScreen.tag}
              </span>
              <span className="text-[10px] font-mono text-zinc-400">{activeScreen.timeAgo}</span>
            </div>

            {/* High-Res News Image */}
            <div className="relative w-full h-36 rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 shadow-md">
              <img
                src={activeScreen.image}
                alt={activeScreen.title}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-mono text-white/90 border border-white/10">
                {activeScreen.source}
              </div>
            </div>

            {/* Headline & 60-Word Brief */}
            <div className="space-y-1 text-left">
              <h3 className="text-[13px] sm:text-sm font-black font-display text-white leading-snug line-clamp-2">
                {activeScreen.title}
              </h3>
              <p className="text-[11px] font-body text-zinc-300 line-clamp-3 leading-relaxed font-normal">
                {activeScreen.summary}
              </p>
            </div>

            {/* Audio Wave Player Box */}
            <div className="p-3 rounded-2xl bg-white/[0.06] border border-white/15 backdrop-blur-md space-y-2">
              <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400">
                <span className="flex items-center gap-1 text-amber-300 font-bold">
                  <IconVolume size={13} />
                  <span>AUDIO BRIEF</span>
                </span>
                <span>{activeScreen.audioLength}</span>
              </div>

              {/* Progress Scrubber Bar */}
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-amber-400 rounded-full transition-all duration-300 ${
                    isPlaying ? 'w-full animate-pulse' : 'w-1/3'
                  }`}
                />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between pt-0.5">
                <button
                  onClick={toggleAudio}
                  className="px-3 py-1 rounded-full bg-amber-400 text-black hover:bg-amber-300 active:scale-95 transition-all flex items-center gap-1.5 text-[9px] font-mono font-bold shadow-sm"
                >
                  {isPlaying ? <IconPlayerPauseFilled size={11} /> : <IconPlayerPlayFilled size={11} />}
                  <span>{isPlaying ? 'PAUSE' : 'LISTEN'}</span>
                </button>

                <button
                  onClick={() => setSaved(!saved)}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    saved
                      ? 'bg-amber-400/20 border-amber-400 text-amber-400'
                      : 'border-white/15 text-zinc-400 hover:text-white'
                  }`}
                >
                  {saved ? <IconBookmarkFilled size={13} /> : <IconBookmark size={13} />}
                </button>
              </div>
            </div>
          </div>

          {/* iPhone Home Swipe Bar */}
          <div className="pb-2.5 pt-1 flex justify-center z-20">
            <div className="w-28 h-1 bg-white/40 rounded-full" />
          </div>
        </div>
      </div>

      {/* Carousel Navigation Arrows & Dot Indicators */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          onClick={handlePrev}
          aria-label="Previous screen"
          className="p-2.5 rounded-full border border-border/80 bg-surface-muted hover:bg-surface text-text-primary transition-all active:scale-90 shadow-sm"
        >
          <IconChevronLeft size={17} />
        </button>

        <div className="flex items-center gap-2">
          {SCREENS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? 'w-7 bg-amber-400 shadow-xs'
                  : 'w-2 bg-border/80 hover:bg-text-tertiary'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          aria-label="Next screen"
          className="p-2.5 rounded-full border border-border/80 bg-surface-muted hover:bg-surface text-text-primary transition-all active:scale-90 shadow-sm"
        >
          <IconChevronRight size={17} />
        </button>
      </div>
    </div>
  );
}

export default PhoneCarouselMockup;
