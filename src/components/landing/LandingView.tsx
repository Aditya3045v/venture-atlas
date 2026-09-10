'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  X,
  Sparkles,
  Mail,
  ExternalLink,
  Check,
  ArrowRight,
  BookOpen,
  Layers,
  Terminal,
  Zap,
  TrendingUp,
  Globe,
  Clock,
  Shield,
  Activity,
  Bookmark,
  Flame,
  BarChart2,
  Cpu,
  Users,
  Loader2,
} from 'lucide-react';

interface BrandLogo {
  name: string;
  src: string;
  gradient: string;
}

const BRAND_LOGOS: BrandLogo[] = [
  {
    name: 'Procure',
    src: 'https://svgl.app/library/procure.svg',
    gradient: 'linear-gradient(135deg, #1e40af, #3b82f6, #60a5fa)',
  },
  {
    name: 'Shopify',
    src: 'https://svgl.app/library/shopify.svg',
    gradient: 'linear-gradient(135deg, #ca8a04, #eab308, #84cc16)',
  },
  {
    name: 'Blender',
    src: 'https://svgl.app/library/blender.svg',
    gradient: 'linear-gradient(135deg, #0284c7, #38bdf8, #f97316)',
  },
  {
    name: 'Figma',
    src: 'https://svgl.app/library/figma.svg',
    gradient: 'linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)',
  },
  {
    name: 'Spotify',
    src: 'https://svgl.app/library/spotify.svg',
    gradient: 'linear-gradient(135deg, #db2777, #ec4899, #ef4444)',
  },
  {
    name: 'Lottielab',
    src: 'https://svgl.app/library/lottielab.svg',
    gradient: 'linear-gradient(135deg, #eab308, #facc15, #22c55e)',
  },
  {
    name: 'Google Cloud',
    src: 'https://svgl.app/library/google-cloud.svg',
    gradient: 'linear-gradient(135deg, #38bdf8, #60a5fa, #818cf8)',
  },
  {
    name: 'Bing',
    src: 'https://svgl.app/library/bing.svg',
    gradient: 'linear-gradient(135deg, #06b6d4, #0891b2, #14b8a6)',
  },
];

// Sample 60-word interactive live intelligence briefs
const SAMPLE_BRIEFS = [
  {
    id: 'startup-funding',
    category: 'STARTUP FUNDING',
    categoryColor: 'bg-blue-50 text-blue-700 border-blue-200',
    title: 'Zepto Raises $350M Series F, Valuation Hits $5B as Quick Commerce War Intensifies',
    time: '6m ago',
    source: 'Bloomberg',
    sourceUrl: 'https://bloomberg.com',
    words: 60,
    text: "Mumbai-based quick commerce startup Zepto has closed a $350M Series F led by General Catalyst, pushing its valuation to $5 billion. The round comes amid a brutal three-way battle with Blinkit and Swiggy Instamart for India's $45B grocery delivery market. Zepto plans to expand to 100 dark stores across Tier-2 cities within 18 months, targeting profitability by Q4 2025.",
    keyStats: [
      { label: 'Valuation', value: '$5B' },
      { label: 'Round Size', value: '$350M' },
      { label: 'Dark Stores', value: '+100' },
    ],
  },
  {
    id: 'crypto-markets',
    category: 'CRYPTO & WEB3',
    categoryColor: 'bg-purple-50 text-purple-700 border-purple-200',
    title: 'Bitcoin ETFs See $2.1B Net Inflows in Single Week as Institutional Demand Spikes',
    time: '22m ago',
    source: 'CoinDesk',
    sourceUrl: 'https://coindesk.com',
    words: 59,
    text: "US spot Bitcoin ETFs recorded $2.1B in net inflows over five trading days, the largest weekly figure since January launch. BlackRock's IBIT alone absorbed $1.3B, pushing its total AUM past $22B. Analysts attribute the surge to pension fund rebalancing ahead of Q3 close and growing conviction among family offices that BTC is a permanent treasury asset.",
    keyStats: [
      { label: 'Weekly Inflow', value: '$2.1B' },
      { label: 'IBIT AUM', value: '$22B+' },
      { label: 'Top Buyer', value: 'BlackRock' },
    ],
  },
  {
    id: 'investment-news',
    category: 'INVESTMENT NEWS',
    categoryColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    title: 'Sequoia India Closes $2.85B Fund VIII, Largest India-Dedicated VC Pool Ever Raised',
    time: '38m ago',
    source: 'Economic Times',
    sourceUrl: 'https://economictimes.com',
    words: 60,
    text: "Sequoia Capital India has completed a final close on its eighth fund at $2.85B, surpassing its $2.2B target and setting the record for the largest India-focused venture fund. LPs include sovereign wealth funds from Singapore, Abu Dhabi, and Norway alongside US university endowments. The fund will back early and growth-stage startups across SaaS, fintech, consumer internet, and climate tech.",
    keyStats: [
      { label: 'Fund Size', value: '$2.85B' },
      { label: 'Target Beat', value: '+$650M' },
      { label: 'Stage Focus', value: 'Early + Growth' },
    ],
  },
  {
    id: 'unicorn-failure',
    category: 'FAILURE TEARDOWN',
    categoryColor: 'bg-rose-50 text-rose-700 border-rose-200',
    title: "GoMechanic Collapses After $62M Raised — Founders Admit Fake Revenue Reporting",
    time: '1h ago',
    source: 'Inc42',
    sourceUrl: 'https://inc42.com',
    words: 58,
    text: "GoMechanic, once valued at $100M and backed by Sequoia and Tiger Global, has admitted to systemic financial fraud after inflating revenue numbers by 2.5x across three fiscal years. Founders filed police complaints against each other as the company began liquidation proceedings. The collapse marks one of India's most public VC-backed startup failures with over $62M in total investor capital destroyed.",
    keyStats: [
      { label: 'Capital Lost', value: '$62M' },
      { label: 'Revenue Faked', value: '2.5x' },
      { label: 'Outcome', value: 'Liquidation' },
    ],
  },
];

const GLOBAL_HUBS = [
  { city: 'SAN FRANCISCO', region: 'North America', volume24h: '$14.2B', deals: 42, pace: '+18%' },
  { city: 'BENGALURU', region: 'India / SEA', volume24h: '$4.8B', deals: 14, pace: '+34%' },
  { city: 'LONDON', region: 'Europe', volume24h: '$6.1B', deals: 19, pace: '+8%' },
  { city: 'SINGAPORE', region: 'APAC Rails', volume24h: '$3.2B', deals: 11, pace: '+22%' },
  { city: 'NEW YORK', region: 'North America', volume24h: '$9.4B', deals: 28, pace: '+12%' },
];

const SPECIALIZED_DESKS = [
  {
    icon: <Zap className="w-5 h-5 text-blue-600" />,
    title: 'Startup Funding Rounds',
    description: 'Every seed, Series A through IPO — funding rounds, cap table changes, valuations, and runway signals across global startup ecosystems.',
    tag: 'Daily Coverage',
  },
  {
    icon: <BarChart2 className="w-5 h-5 text-purple-600" />,
    title: 'Crypto & Web3 Markets',
    description: 'Bitcoin, Ethereum, altcoins, DeFi protocols, ETF flows, on-chain data, and regulatory developments that move crypto markets.',
    tag: 'Live Signals',
  },
  {
    icon: <TrendingUp className="w-5 h-5 text-emerald-600" />,
    title: 'Investment & VC News',
    description: 'Fund closes, LP commitments, partner moves, portfolio company updates, and institutional capital allocation shifts.',
    tag: 'Weekly Ledger',
  },
  {
    icon: <Flame className="w-5 h-5 text-rose-600" />,
    title: 'Startup Failures & Teardowns',
    description: 'Honest forensic post-mortems of VC-backed failures, burn spikes, cap-table wipes, and founder fallouts. Zero spin.',
    tag: 'Zero Sponsored PR',
  },
  {
    icon: <Globe className="w-5 h-5 text-teal-600" />,
    title: 'Global Deal Flow Tracker',
    description: 'Track capital corridors from Silicon Valley to Bengaluru, London, Singapore, and Dubai — where the money moves next.',
    tag: '5 Global Desks',
  },
  {
    icon: <Cpu className="w-5 h-5 text-indigo-600" />,
    title: 'Unicorn & Growth Stage',
    description: 'Late-stage rounds above $50M, IPO filings, secondary valuations, tender offers, and pre-IPO lock-up watch.',
    tag: 'Unicorn Watch',
  },
];

export function LandingView() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Active brief tab in interactive reader demo
  const [activeBriefIndex, setActiveBriefIndex] = useState(0);
  const activeBrief = SAMPLE_BRIEFS[activeBriefIndex];

  // Hero email collection state
  const [heroEmail, setHeroEmail] = useState('');
  const [heroSubmitting, setHeroSubmitting] = useState(false);
  const [heroSuccess, setHeroSuccess] = useState(false);

  // Quick access email capture form state
  const [captureEmail, setCaptureEmail] = useState('');
  const [captureDone, setCaptureDone] = useState(false);

  // Video Ref & Autoplay Guarantee (fixes React muted autoplay DOM property issue)
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;

    const playVideo = () => {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.log('Video autoplay deferred by browser:', err);
        });
      }
    };

    if (video.readyState >= 2) {
      playVideo();
    } else {
      video.addEventListener('loadeddata', playVideo, { once: true });
      video.addEventListener('canplay', playVideo, { once: true });
    }
  }, []);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail) return;
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setContactEmail('');
      setContactMessage('');
      setIsContactOpen(false);
    }, 2000);
  };

  const handleDirectEnter = () => {
    try {
      document.cookie = 'va_reader=1; path=/; max-age=31536000';
      document.cookie = 'va_reader_client=1; path=/; max-age=31536000';
      localStorage.setItem('va_reader_active', 'true');
    } catch {}
  };

  const handleHeroEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroEmail || heroSubmitting) return;
    setHeroSubmitting(true);
    handleDirectEnter();
    try {
      await fetch('/api/reader/enter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: heroEmail.trim().toLowerCase(),
          source: 'HERO_EMAIL_BOX',
        }),
      });
      setHeroSuccess(true);
    } catch (err) {
      console.warn('Hero email enter error:', err);
    } finally {
      setTimeout(() => {
        window.location.href = '/';
      }, 300);
    }
  };

  const handleCaptureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captureEmail) return;
    setCaptureDone(true);
    handleDirectEnter();
    try {
      await fetch('/api/reader/enter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: captureEmail.trim().toLowerCase(),
          source: 'LANDING_PAGE_HERO',
        }),
      });
    } catch (err) {
      console.warn('Reader enter fetch error:', err);
    }
    setTimeout(() => {
      window.location.href = '/';
    }, 500);
  };

  return (
    <div className="min-h-screen w-full bg-[#f9fafb] text-slate-900 flex flex-col select-none font-sans">
      {/* ─────────────────────────────────────────────────────────────
          MAIN CONTENT WRAPPER (Tightened top spacing on mobile)
      ────────────────────────────────────────────────────────────── */}
      <div className="flex-1 pt-1 sm:pt-4 pb-8 sm:pb-12 px-2 sm:px-6 md:px-8 space-y-10 sm:space-y-16 max-w-[1440px] mx-auto w-full">
        {/* ─────────────────────────────────────────────────────────────
            1. MAIN HERO CONTAINER & VIDEO BACKGROUND (Pronounced Curved Radius)
        ────────────────────────────────────────────────────────────── */}
        <section className="relative w-full max-w-[1400px] mx-auto rounded-[44px] sm:rounded-[60px] md:rounded-[76px] lg:rounded-[88px] bg-slate-950 border border-slate-800/80 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden min-h-[500px] sm:min-h-[540px] md:h-[600px] flex flex-col">
          {/* Absolutely positioned underlying video layer - NO overlays */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              poster="/hero-poster.jpg"
              className="w-full h-full object-cover scale-105 transition-transform duration-1000"
            >
              {/* Local high-speed source (no CORS/network failure) */}
              <source src="/hero-video.mp4" type="video/mp4" />
              {/* CloudFront remote source */}
              <source
                src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260613_180732_a54afbf6-b30d-470e-861f-669871f09f67.mp4"
                type="video/mp4"
              />
            </video>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              HERO CONTENT LAYOUT
          ────────────────────────────────────────────────────────────── */}
          <div className="z-20 flex-1 px-5 sm:px-10 md:px-16 pt-6 sm:pt-10 md:pt-16 flex flex-col items-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-3xl"
            >
              <h1 className="font-display text-[32px] sm:text-[44px] md:text-[56px] font-medium tracking-tight leading-[1.12] md:leading-[1.08] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
                Startup, Crypto &<br />Investment News — in 60 Words
              </h1>

              <p className="font-sans text-[14px] md:text-[15px] text-slate-200/90 mt-3 sm:mt-4 max-w-xl font-normal leading-relaxed drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]">
                Venture Atlas delivers funding rounds, crypto market moves, and VC deal flow — distilled to 60 words. No fluff. No ads. Just the signal that matters to founders, investors, and operators.
              </p>

              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-xl">
                <form
                  onSubmit={handleHeroEmailSubmit}
                  className="flex items-center gap-1.5 p-1.5 rounded-full bg-white/95 backdrop-blur-xl border border-white/60 shadow-xl w-full sm:w-auto flex-1 transition-all focus-within:ring-2 focus-within:ring-white/80"
                >
                  <div className="pl-3.5 pr-1 text-slate-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    required
                    value={heroEmail}
                    onChange={e => setHeroEmail(e.target.value)}
                    placeholder="Enter your work email..."
                    disabled={heroSubmitting || heroSuccess}
                    className="flex-1 bg-transparent py-2 text-[14px] text-slate-900 placeholder:text-slate-400 font-sans focus:outline-none min-w-[160px]"
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={heroSubmitting || heroSuccess}
                    className="px-5 py-2.5 rounded-full bg-slate-950 text-white hover:bg-slate-800 text-[13px] font-medium transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-75"
                  >
                    {heroSubmitting ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Joining...</span>
                      </>
                    ) : heroSuccess ? (
                      <>
                        <Check size={13} className="text-emerald-400" />
                        <span>Entering...</span>
                      </>
                    ) : (
                      <>
                        <span>Get Access</span>
                        <ArrowRight size={13} />
                      </>
                    )}
                  </motion.button>
                </form>

                <Link
                  href="/feed"
                  onClick={handleDirectEnter}
                  className="px-5 py-3 rounded-full bg-white/20 hover:bg-white/30 text-white text-[13px] font-medium border border-white/30 shadow-md transition-all flex items-center justify-center gap-1.5 backdrop-blur-md shrink-0"
                >
                  <span>Enter Reader Feed</span>
                  <ChevronRight size={14} className="text-white/70" />
                </Link>
              </div>
            </motion.div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              FLOATING BOTTOM NAVIGATION BAR
          ────────────────────────────────────────────────────────────── */}
          <motion.nav
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-4 sm:bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-30 w-auto max-w-[95%]"
          >
            <div className="flex items-center bg-white/90 backdrop-blur-2xl px-1.5 py-1.5 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-slate-200/40">
              {/* Sparkle Logo Mark */}
              <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm select-none">
                ✦
              </div>

              {/* Center Navigation Links */}
              <div className="hidden sm:flex items-center gap-1 mx-2">
                <button
                  onClick={() => setIsProductsOpen(true)}
                  className="text-slate-600 hover:text-slate-900 text-[13px] font-medium px-4 py-2 rounded-full hover:bg-slate-100/80 transition-colors cursor-pointer"
                >
                  Products
                </button>
                <button
                  onClick={() => setIsDocsOpen(true)}
                  className="text-slate-600 hover:text-slate-900 text-[13px] font-medium px-4 py-2 rounded-full hover:bg-slate-100/80 transition-colors cursor-pointer"
                >
                  Docs
                </button>
                <Link
                  href="/feed" onClick={handleDirectEnter}
                  className="text-slate-600 hover:text-slate-900 text-[13px] font-medium px-4 py-2 rounded-full hover:bg-slate-100/80 transition-colors"
                >
                  Feed
                </Link>
              </div>

              {/* "Get in touch" Action Button (Marquee Card structure + animated hover gradient) */}
              <button
                onClick={() => setIsContactOpen(true)}
                className="group relative flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-slate-200/60 shadow-sm text-slate-800 text-[13px] font-medium hover:border-slate-300 transition-all overflow-hidden cursor-pointer"
              >
                <div
                  className="absolute inset-0 opacity-0 scale-150 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500 ease-out pointer-events-none"
                  style={{
                    background: 'linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6)',
                  }}
                />
                <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
                  Get in touch
                </span>
                <ChevronRight
                  size={14}
                  className="relative z-10 transition-all duration-300 group-hover:text-white group-hover:translate-x-0.5"
                />
              </button>
            </div>
          </motion.nav>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            2. SEAMLESS MARQUEE LOGO SCROLLER
        ────────────────────────────────────────────────────────────── */}
        <section className="mt-10 w-full max-w-[1400px] mx-auto overflow-hidden">
          <div className="text-center mb-6">
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-medium">
              Trusted & Cited by Founders, VCs, and Operators Across the Globe
            </span>
          </div>

          <div
            className="w-full overflow-hidden"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
            }}
          >
            <div className="flex w-max animate-marquee">
              {/* First Sequence of 8 Logos */}
              <div className="flex items-center gap-5 pr-5 shrink-0">
                {BRAND_LOGOS.map((logo, index) => (
                  <div
                    key={`logo-seq1-${index}`}
                    className="group relative h-24 w-40 shrink-0 flex items-center justify-center rounded-full bg-white border border-slate-200/60 shadow-sm hover:border-slate-300 transition-all overflow-hidden cursor-pointer"
                  >
                    {/* Card Hover Background: Vibrant Linear Gradient */}
                    <div
                      className="absolute inset-0 opacity-0 scale-150 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500 ease-out pointer-events-none"
                      style={{ background: logo.gradient }}
                    />
                    {/* Logo Icon */}
                    <img
                      src={logo.src}
                      alt={logo.name}
                      loading="lazy"
                      className="w-8 h-8 object-contain relative z-10 transition-all duration-300 group-hover:brightness-0 group-hover:invert"
                    />
                  </div>
                ))}
              </div>

              {/* Second Identical Sequence of 8 Logos for Seamless 100% Looping */}
              <div className="flex items-center gap-5 pr-5 shrink-0" aria-hidden="true">
                {BRAND_LOGOS.map((logo, index) => (
                  <div
                    key={`logo-seq2-${index}`}
                    className="group relative h-24 w-40 shrink-0 flex items-center justify-center rounded-full bg-white border border-slate-200/60 shadow-sm hover:border-slate-300 transition-all overflow-hidden cursor-pointer"
                  >
                    {/* Card Hover Background: Vibrant Linear Gradient */}
                    <div
                      className="absolute inset-0 opacity-0 scale-150 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500 ease-out pointer-events-none"
                      style={{ background: logo.gradient }}
                    />
                    {/* Logo Icon */}
                    <img
                      src={logo.src}
                      alt={logo.name}
                      loading="lazy"
                      className="w-8 h-8 object-contain relative z-10 transition-all duration-300 group-hover:brightness-0 group-hover:invert"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            3. INTERACTIVE 60-WORD DISPATCH SIMULATOR
        ────────────────────────────────────────────────────────────── */}
        <section className="w-full max-w-[1400px] mx-auto bg-white rounded-[40px] border border-slate-200/70 p-8 md:p-14 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.03)]">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono font-medium uppercase mb-3">
                <Layers size={13} /> The 60-Word Format
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-medium tracking-tight text-[#0a1b33]">
                Real news. Real fast. Real sources.
              </h2>
              <p className="text-slate-500 text-sm mt-2 max-w-xl">
                Every story — startup funding, crypto move, or VC fund close — is compressed to exactly 60 words. Primary source linked. Zero opinion. Zero filler. Read in under 20 seconds.
              </p>
            </div>

            {/* Category selection tabs */}
            <div className="flex flex-wrap gap-2">
              {SAMPLE_BRIEFS.map((b, idx) => (
                <button
                  key={b.id}
                  onClick={() => setActiveBriefIndex(idx)}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    activeBriefIndex === idx
                      ? 'bg-[#0a152d] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {b.category}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Card Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left: 60-Word Card */}
            <div className="lg:col-span-8 bg-slate-50/70 rounded-3xl p-6 md:p-8 border border-slate-200/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold border ${activeBrief.categoryColor}`}>
                      {activeBrief.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">·</span>
                    <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                      <Clock size={12} /> {activeBrief.time}
                    </span>
                  </div>

                  <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {activeBrief.words} WORDS
                  </span>
                </div>

                <h3 className="font-display text-xl md:text-2xl font-medium text-[#0a1b33] leading-snug mb-4">
                  {activeBrief.title}
                </h3>

                <p className="text-slate-700 text-base leading-relaxed font-normal">
                  {activeBrief.text}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-500">
                  <span>Source Verification:</span>
                  <a
                    href={activeBrief.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-slate-800 hover:text-blue-600 flex items-center gap-1 transition-colors"
                  >
                    {activeBrief.source} <ExternalLink size={11} />
                  </a>
                </div>

                <Link
                  href="/feed" onClick={handleDirectEnter}
                  className="px-4 py-2 rounded-full bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-medium transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  Read Full Dispatch in Feed <ArrowRight size={12} />
                </Link>
              </div>
            </div>

            {/* Right: Key Institutional Metrics */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-6">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-slate-400 block mb-4">
                  Telemetry Analysis
                </span>
                <div className="space-y-4">
                  {activeBrief.keyStats.map((stat, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-xs text-slate-500 font-medium block">{stat.label}</span>
                      <span className="text-2xl font-display font-medium text-[#0a1b33] mt-1 block">
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900 leading-relaxed">
                <span className="font-semibold block mb-1">Venture Atlas Standard</span>
                Every story is sourced, fact-checked, and written to exactly 60 words. No sponsored posts. No opinion. Just what happened.
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            4. SPECIALIZED INTELLIGENCE DESKS (BENTO GRID)
        ────────────────────────────────────────────────────────────── */}
        <section className="w-full max-w-[1400px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold block mb-2">
              What We Cover
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-medium text-[#0a1b33] tracking-tight">
              Startups. Crypto. Investments.<br />All in one feed.
            </h2>
            <p className="text-slate-500 text-sm mt-3">
              From seed rounds to Bitcoin ETF flows — we track the money, the deals, and the collapses so you don't have to read 20 different sources.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SPECIALIZED_DESKS.map((desk, idx) => (
              <div
                key={idx}
                className="group relative bg-white rounded-3xl p-8 border border-slate-200/70 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                      {desk.icon}
                    </div>
                    <span className="text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {desk.tag}
                    </span>
                  </div>

                  <h3 className="font-display text-lg font-medium text-[#0a1b33] mb-2">
                    {desk.title}
                  </h3>

                  <p className="text-slate-500 text-xs leading-relaxed font-normal">
                    {desk.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                  <span>Explore desk</span>
                  <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            5. GLOBAL TELEMETRY HUBS RADAR
        ────────────────────────────────────────────────────────────── */}
        <section className="w-full max-w-[1400px] mx-auto bg-white rounded-[40px] border border-slate-200/70 p-8 md:p-14 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono font-medium uppercase mb-3">
                <Activity size={13} /> Live Deal Tracker
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-medium tracking-tight text-[#0a1b33]">
                Where the money is moving right now
              </h2>
              <p className="text-slate-500 text-sm mt-2">
                Real-time startup funding and investment volumes across the world's five biggest deal-flow hubs — updated every 24 hours.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-50 px-4 py-2 rounded-full border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>LIVE 24H SYNCHRONIZED FEED</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {GLOBAL_HUBS.map((hub, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/70 hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono text-slate-400">{hub.region}</span>
                  <span className="text-xs font-mono font-bold text-emerald-600">{hub.pace}</span>
                </div>
                <h4 className="font-display text-base font-semibold text-[#0a1b33]">{hub.city}</h4>
                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">24H VOLUME</span>
                    <span className="font-display font-medium text-slate-900 text-sm">{hub.volume24h}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-mono">DEALS</span>
                    <span className="font-display font-medium text-slate-900 text-sm">{hub.deals}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            6. EXECUTIVE ACCESS & NEWSLETTER CAPTURE TERMINAL
        ────────────────────────────────────────────────────────────── */}
        <section className="w-full max-w-[1400px] mx-auto bg-gradient-to-b from-white to-slate-50/80 rounded-[40px] border border-slate-200/80 p-8 md:p-16 text-center shadow-sm">
          <div className="max-w-2xl mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg mx-auto mb-6 shadow-md">
              ✦
            </div>

            <h2 className="font-display text-3xl md:text-5xl font-medium tracking-tight text-[#0a1b33] leading-tight">
              Get startup, crypto & investment<br />news — free, every morning
            </h2>

            <p className="text-slate-600 text-sm md:text-base mt-4 font-normal leading-relaxed">
              Join thousands of founders and investors who start their day with Venture Atlas. One email. 60-word stories. The funding rounds, crypto moves, and VC news that actually matter.
            </p>

            {captureDone ? (
              <div className="mt-8 p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center justify-center gap-2">
                <Check size={18} />
                <span>You're in. Expect your first brief in the morning.</span>
              </div>
            ) : (
              <form onSubmit={handleCaptureSubmit} className="mt-8 max-w-md mx-auto flex flex-col sm:flex-row gap-2.5">
                <input
                  type="email"
                  required
                  value={captureEmail}
                  onChange={e => setCaptureEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 px-5 py-3.5 rounded-full bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all font-sans shadow-sm"
                />
                <button
                  type="submit"
                  className="px-7 py-3.5 rounded-full bg-[#0a152d] text-white text-sm font-medium hover:bg-slate-800 transition-all shadow-md cursor-pointer whitespace-nowrap"
                >
                  Send Me the News
                </button>
              </form>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 font-mono">
              <span className="flex items-center gap-1">
                <Check size={13} className="text-emerald-500" /> Free Forever
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Check size={13} className="text-emerald-500" /> No Ads, No Spam
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Check size={13} className="text-emerald-500" /> Unsubscribe Anytime
              </span>
            </div>

            <div className="mt-8">
              <Link
                href="/feed" onClick={handleDirectEnter}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:underline transition-colors"
              >
                <span>Or browse the live feed without signing up <ArrowRight size={14} /></span>
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          7. EDITORIAL FOOTER
      ────────────────────────────────────────────────────────────── */}
      <footer className="w-full border-t border-slate-200/80 bg-white py-12 px-6 md:px-12 mt-16 text-xs text-slate-500 select-none">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              ✦
            </div>
            <div>
              <span className="font-display font-medium text-slate-900 text-sm block">Venture Atlas</span>
              <span className="text-[11px] text-slate-400">Startup, crypto & investment news — 60 words at a time</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-slate-600 font-medium">
            <Link href="/feed" onClick={handleDirectEnter} className="hover:text-slate-900 transition-colors">Feed</Link>
            <button onClick={() => setIsProductsOpen(true)} className="hover:text-slate-900 transition-colors cursor-pointer">Products</button>
            <button onClick={() => setIsDocsOpen(true)} className="hover:text-slate-900 transition-colors cursor-pointer">Docs</button>
            <button onClick={() => setIsContactOpen(true)} className="hover:text-slate-900 transition-colors cursor-pointer">Contact</button>
            <Link href="/about" className="hover:text-slate-900 transition-colors">About</Link>
            <Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-900 transition-colors">Terms</Link>
          </div>

          <div className="font-mono text-slate-400 text-[11px]">
            © {new Date().getFullYear()} Venture Atlas Intelligence Inc. All rights reserved.
          </div>
        </div>
      </footer>

      {/* ─────────────────────────────────────────────────────────────
          8. INTERACTIVE MODALS (Contact Us, Products, Docs)
      ────────────────────────────────────────────────────────────── */}
      {/* Contact Modal */}
      <AnimatePresence>
        {isContactOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl overflow-hidden"
            >
              <button
                onClick={() => setIsContactOpen(false)}
                className="absolute top-6 right-6 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-base font-bold">
                  ✦
                </div>
                <div>
                  <h3 className="text-xl font-display font-medium text-[#0a1b33]">Get in touch</h3>
                  <p className="text-xs text-slate-500 font-sans">Partnerships, editorial tips, press & feedback</p>
                </div>
              </div>

              {isSubmitted ? (
                <div className="py-10 text-center flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                    <Check size={24} />
                  </div>
                  <h4 className="text-lg font-medium text-slate-900">Message received</h4>
                  <p className="text-sm text-slate-500 mt-1">We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4 mt-6">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5 font-sans">
                      Work Email
                    </label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={e => setContactEmail(e.target.value)}
                      placeholder="founder@venture.com"
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5 font-sans">
                      Note or Inquiry (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={contactMessage}
                      onChange={e => setContactMessage(e.target.value)}
                      placeholder="Tell us about a story tip, partnership idea, or feedback..."
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all resize-none font-sans"
                    />
                  </div>
                  <div className="pt-2 flex items-center justify-between gap-3">
                    <Link
                      href="/feed" onClick={handleDirectEnter}
                      className="text-xs text-slate-500 hover:text-slate-900 font-medium transition-colors flex items-center gap-1"
                    >
                      Enter Feed Directly <ArrowRight size={12} />
                    </Link>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-full bg-[#0a152d] text-white text-sm font-medium hover:bg-slate-800 transition-all shadow-sm cursor-pointer"
                    >
                      Send Message
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Products Modal */}
      <AnimatePresence>
        {isProductsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-xl bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl"
            >
              <button
                onClick={() => setIsProductsOpen(false)}
                className="absolute top-6 right-6 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-base font-bold">
                  ✦
                </div>
                <div>
                  <h3 className="text-xl font-display font-medium text-[#0a1b33]">What Venture Atlas Covers</h3>
                  <p className="text-xs text-slate-500 font-sans">Startup funding · Crypto markets · Investment & VC news</p>
                </div>
              </div>

              <div className="grid gap-3">
                <Link
                  href="/feed"
                  onClick={() => {
                    handleDirectEnter();
                    setIsProductsOpen(false);
                  }}
                  className="p-4 rounded-2xl border border-slate-200/80 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50 transition-all group flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Layers size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-display font-medium text-slate-900 text-sm">Startup & Investment News Feed</h4>
                      <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Funding rounds, VC fund closes, unicorn valuations, startup failures — in 60 words each. Curated daily.
                    </p>
                  </div>
                </Link>

                <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Terminal size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-display font-medium text-slate-900 text-sm">Crypto & Web3 News</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Bitcoin, ETF flows, DeFi protocol updates, on-chain data, and regulatory news that moves markets.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                <Link
                  href="/feed" onClick={handleDirectEnter}
                  className="px-6 py-2.5 rounded-full bg-[#0a152d] text-white text-sm font-medium hover:bg-slate-800 transition-all shadow-sm flex items-center gap-2"
                >
                  Open Reader Feed <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Docs Modal */}
      <AnimatePresence>
        {isDocsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl"
            >
              <button
                onClick={() => setIsDocsOpen(false)}
                className="absolute top-6 right-6 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-base font-bold">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-display font-medium text-[#0a1b33]">About Venture Atlas</h3>
                  <p className="text-xs text-slate-500 font-sans">What we are, what we cover, and how we work</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-600 font-sans leading-relaxed">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="font-medium text-slate-900 mb-1">What is Venture Atlas?</p>
                  Venture Atlas is a news platform covering startup funding, crypto markets, and investment news — condensed to exactly 60 words per story. Built for founders, investors, and operators who need to stay informed without wading through noise.
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="font-medium text-slate-900 mb-1">How We Work</p>
                  Every story is sourced from primary publications, verified by our editorial team, and compressed to exactly 60 words. No sponsored content. No opinion pieces. Just facts, figures, and the source link.
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                <Link
                  href="/about"
                  className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
                >
                  Read full about page <ExternalLink size={12} />
                </Link>
                <button
                  onClick={() => setIsDocsOpen(false)}
                  className="px-5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
