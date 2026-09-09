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
    id: 'ai-silicon',
    category: 'AI SILICON',
    categoryColor: 'bg-purple-50 text-purple-700 border-purple-200',
    title: 'Groq Deploys 40MW LPU Inference Cluster to Rival Nvidia Blackwell Pricing',
    time: '4m ago',
    source: 'The Information',
    sourceUrl: 'https://theinformation.com',
    words: 60,
    text: 'Groq has powered up a dedicated 40-megawatt deterministic inference datacenter in Texas, delivering sustained 520 tokens/second per user session on open weights. Enterprise customers report 70% cheaper API costs compared to H100 cloud instances. With OpenAI and Anthropic scaling reasoning models, high-speed single-batch throughput has become the primary bottleneck over sheer training compute.',
    keyStats: [
      { label: 'Token Speed', value: '520 T/s' },
      { label: 'Cost Advantage', value: '-70%' },
      { label: 'Cluster Scale', value: '40 MW' },
    ],
  },
  {
    id: 'unicorns',
    category: 'UNICORNS & GROWTH',
    categoryColor: 'bg-blue-50 text-blue-700 border-blue-200',
    title: 'Mercor Closes $32M Series A at $250M Valuation Led by Benchmark',
    time: '18m ago',
    source: 'Bloomberg',
    sourceUrl: 'https://bloomberg.com',
    words: 59,
    text: 'Mercor, an automated engineer hiring platform evaluating developer code via proprietary LLM interviewers, has finalized a $32M Series A led by Benchmark partner Peter Fenton. The startup reached $10M ARR in twelve months with twenty employees. The round illustrates institutional appetite for AI-native workflow automation companies that replace legacy recruitment agencies with high-margin software platforms.',
    keyStats: [
      { label: 'Valuation', value: '$250M' },
      { label: 'ARR Milestone', value: '$10M' },
      { label: 'Lead Partner', value: 'Benchmark' },
    ],
  },
  {
    id: 'failures',
    category: 'POST-MORTEM & TEARDOWN',
    categoryColor: 'bg-rose-50 text-rose-700 border-rose-200',
    title: 'Protean Dynamics Enters Receivership After $70M Autonomous Drone Burn',
    time: '42m ago',
    source: 'Reuters',
    sourceUrl: 'https://reuters.com',
    words: 60,
    text: 'Autonomous logistics startup Protean Dynamics has initiated creditor receivership after burning through $70M in Series B venture capital without securing commercial FAA waiver renewals. Hardware manufacturing scrap rates exceeded 42%, draining cash reserves to under six weeks runway. The teardown highlights the steep capital expenditure traps facing dual-use robotics hardware companies that underprice regulatory timelines.',
    keyStats: [
      { label: 'Total Invested', value: '$70M' },
      { label: 'Scrap Rate', value: '42%' },
      { label: 'Outcome', value: 'Receivership' },
    ],
  },
  {
    id: 'seed-radar',
    category: 'SEED & STEALTH',
    categoryColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    title: 'Cognition Dynamics Raises $6.5M Pre-Seed at $40M Post from Founders Fund',
    time: '1h ago',
    source: 'TechCrunch',
    sourceUrl: 'https://techcrunch.com',
    words: 58,
    text: 'Former DeepMind researchers have secured $6.5M in pre-seed funding for Cognition Dynamics, a startup designing verifiable reasoning agents for drug discovery. Founders Fund led the syndicate alongside angels from Recursion and Isomorphic Labs. The team is deploying self-supervised reinforcement learning over structural biology datasets, targeting candidate molecule validation in weeks rather than quarters.',
    keyStats: [
      { label: 'Pre-Seed Size', value: '$6.5M' },
      { label: 'Post Valuation', value: '$40M' },
      { label: 'Lead Investor', value: 'Founders Fund' },
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
    icon: <Cpu className="w-5 h-5 text-indigo-600" />,
    title: 'AI & DeepTech Silicon',
    description: 'Datacenter compute capacity, inference tokens/sec, GPU clustering, and model weights pricing.',
    tag: '42 Stories / Wk',
  },
  {
    icon: <Flame className="w-5 h-5 text-rose-600" />,
    title: 'Unicorns & Late Stage',
    description: 'Mega-rounds above $100M, private tender offers, secondary valuations, and IPO filing trackers.',
    tag: 'Daily Telemetry',
  },
  {
    icon: <BarChart2 className="w-5 h-5 text-emerald-600" />,
    title: 'Venture Capital & LPs',
    description: 'Institutional LP fund closes, DPI distribution metrics, management fee benchmarks, and capital calls.',
    tag: 'Weekly Ledger',
  },
  {
    icon: <Shield className="w-5 h-5 text-amber-600" />,
    title: 'Failures & Teardowns',
    description: 'Forensic post-mortems of venture-backed failures, runway burn spikes, and cap-table wipes.',
    tag: 'Zero Sponsored PR',
  },
  {
    icon: <Zap className="w-5 h-5 text-sky-600" />,
    title: 'Seed & Early Radar',
    description: 'Stealth founders, pre-seed round term sheets, incubator grads, and syndicate lead tracker.',
    tag: 'First Look Wire',
  },
  {
    icon: <Globe className="w-5 h-5 text-teal-600" />,
    title: 'Cross-Border Capital Rails',
    description: 'Follow capital flows linking Silicon Valley, Bengaluru, London, Tokyo, and Singapore corridors.',
    tag: '5 Global Desks',
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
          TOP BRAND STRIP & STATUS
      ────────────────────────────────────────────────────────────── */}
      <div className="w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-md px-6 py-2.5 flex items-center justify-between text-xs font-mono text-slate-500">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-800 uppercase tracking-wider">VENTURE ATLAS WIRE</span>
          </div>
          <span className="hidden md:inline text-slate-300">|</span>
          <span className="hidden md:inline">BLOOMBERG + INSHORTS FOR TECH FOUNDERS & VCS</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden sm:inline">GLOBAL LATENCY: 24MS</span>
          <Link
            href="/feed" onClick={handleDirectEnter}
            className="flex items-center gap-1 text-slate-800 hover:text-blue-600 font-medium transition-colors"
          >
            Reader Feed <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MAIN CONTENT WRAPPER
      ────────────────────────────────────────────────────────────── */}
      <main className="flex-1 py-8 sm:py-12 px-4 sm:px-6 md:px-8 space-y-16 max-w-[1440px] mx-auto w-full">
        {/* ─────────────────────────────────────────────────────────────
            1. MAIN HERO CONTAINER & VIDEO BACKGROUND
        ────────────────────────────────────────────────────────────── */}
        <section className="relative w-full max-w-[1400px] mx-auto rounded-[48px] bg-slate-950 border border-slate-800/80 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden h-[600px] flex flex-col">
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
          <div className="z-20 flex-1 px-8 md:px-16 pt-12 md:pt-16 flex flex-col items-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-3xl"
            >
              <h1 className="font-display text-[42px] md:text-[56px] font-medium tracking-tight leading-[1.08] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
                Foundation of the<br />new digital epoch
              </h1>

              <p className="font-sans text-[14px] md:text-[15px] text-slate-200/90 mt-4 max-w-xl font-normal leading-relaxed drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]">
                Designing products, powering ecosystems, and scaling platforms that shape the future. The real-time intelligence wire for tech founders, venture capitalists, and operators.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsContactOpen(true)}
                  className="px-6 py-3 rounded-full bg-white text-slate-950 hover:bg-slate-100 text-[14px] font-medium transition-all shadow-lg hover:shadow-xl cursor-pointer flex items-center gap-2"
                >
                  <span>Contact Us</span>
                  <ArrowRight size={14} />
                </motion.button>

                <Link
                  href="/feed" onClick={handleDirectEnter}
                  className="px-6 py-3 rounded-full bg-white/20 hover:bg-white/30 text-white text-[14px] font-medium border border-white/30 shadow-md transition-all flex items-center gap-2 backdrop-blur-md"
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
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30"
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
              Ecosystem Backed & Researched Across Leading Tech Platforms
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
                <Layers size={13} /> The 60-Word Engine
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-medium tracking-tight text-[#0a1b33]">
                Bloomberg rigor. Inshorts scanning speed.
              </h2>
              <p className="text-slate-500 text-sm mt-2 max-w-xl">
                Every story is algorithmically and editorially audited to strictly 60 words. No padding, no opinion fluff, verified source provenance.
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
                Curated by algorithmic extraction and verified by tech analysts. No sponsored placement.
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
              Coverage Scope
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-medium text-[#0a1b33] tracking-tight">
              Six Specialized Intelligence Desks
            </h2>
            <p className="text-slate-500 text-sm mt-3">
              Institutional rigor applied to the exact spaces where technology, venture financing, and market power converge.
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
                <Activity size={13} /> Real-Time Dealflow
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-medium tracking-tight text-[#0a1b33]">
                Global Capital Corridors
              </h2>
              <p className="text-slate-500 text-sm mt-2">
                Live volume and deal telemetry aggregated across the five primary startup venture rails.
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
              Unlock the Full 60-Word Venture Intelligence Wire
            </h2>

            <p className="text-slate-600 text-sm md:text-base mt-4 font-normal leading-relaxed">
              Every critical funding round, AI compute milestone, failure post-mortem, and valuation shift — delivered every morning with zero sponsored fluff.
            </p>

            {captureDone ? (
              <div className="mt-8 p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center justify-center gap-2">
                <Check size={18} />
                <span>You're on the wire. We will dispatch the next morning briefing to your inbox.</span>
              </div>
            ) : (
              <form onSubmit={handleCaptureSubmit} className="mt-8 max-w-md mx-auto flex flex-col sm:flex-row gap-2.5">
                <input
                  type="email"
                  required
                  value={captureEmail}
                  onChange={e => setCaptureEmail(e.target.value)}
                  placeholder="founder@venture.com"
                  className="flex-1 px-5 py-3.5 rounded-full bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all font-sans shadow-sm"
                />
                <button
                  type="submit"
                  className="px-7 py-3.5 rounded-full bg-[#0a152d] text-white text-sm font-medium hover:bg-slate-800 transition-all shadow-md cursor-pointer whitespace-nowrap"
                >
                  Get VIP Wire
                </button>
              </form>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 font-mono">
              <span className="flex items-center gap-1">
                <Check size={13} className="text-emerald-500" /> Free Morning Wire
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Check size={13} className="text-emerald-500" /> 60-Word Strict Constraint
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Check size={13} className="text-emerald-500" /> Primary Source Links
              </span>
            </div>

            <div className="mt-8">
              <Link
                href="/feed" onClick={handleDirectEnter}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:underline transition-colors"
              >
                Or enter the live web app directly <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      </main>

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
              <span className="text-[11px] text-slate-400">The 60-word tech & venture intelligence platform</span>
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
                  <p className="text-xs text-slate-500 font-sans">Direct access to the intelligence network</p>
                </div>
              </div>

              {isSubmitted ? (
                <div className="py-10 text-center flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                    <Check size={24} />
                  </div>
                  <h4 className="text-lg font-medium text-slate-900">Message dispatched</h4>
                  <p className="text-sm text-slate-500 mt-1">Our team will reach out within 24 hours.</p>
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
                      placeholder="Tell us what you are building or looking for..."
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
                  <h3 className="text-xl font-display font-medium text-[#0a1b33]">Ecosystem Products</h3>
                  <p className="text-xs text-slate-500 font-sans">Real-time venture telemetry & intelligence suite</p>
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
                      <h4 className="font-display font-medium text-slate-900 text-sm">60-Word Dispatches</h4>
                      <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Distilled intelligence briefs across AI, Unicorns, Failures, and Seed rounds with 0 fluff.
                    </p>
                  </div>
                </Link>

                <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Terminal size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-display font-medium text-slate-900 text-sm">Global Telemetry Hub</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Live tracking across Bengaluru, SF, London, Singapore, and NYC deal flows.
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
                  <h3 className="text-xl font-display font-medium text-[#0a1b33]">Documentation & Architecture</h3>
                  <p className="text-xs text-slate-500 font-sans">Venture Atlas System Specifications</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-600 font-sans leading-relaxed">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="font-medium text-slate-900 mb-1">Architecture & Data Model</p>
                  High-speed Next.js frontend with Supabase real-time telemetry, edge-cached ISR for ultra-low latency feeds.
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="font-medium text-slate-900 mb-1">Editorial Precision</p>
                  Every story is algorithmically and editorially audited to adhere to strict 60-word constraints with original source provenance.
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
