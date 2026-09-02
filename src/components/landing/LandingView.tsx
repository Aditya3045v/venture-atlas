'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useToast } from '../providers/ToastProvider';
import { useTheme } from '../providers/ThemeProvider';
import { GradientBackground } from '@/components/ui/favorites';

const PhoneMockupBasic = dynamic(() => import('@/components/ui/phone-mockups-1'), { ssr: false });
const ClientFeedback = dynamic(() => import('@/components/ui/testimonial'), { ssr: false });
import {
  IconArrowNarrowRight,
  IconCircleCheckFilled,
  IconBolt,
  IconFlame,
  IconVolume,
  IconShieldCheck,
  IconTrendingUp,
  IconSparkles,
  IconCheck,
  IconClock,
  IconPlayerPlay,
  IconPlayerPause,
  IconBuildingSkyscraper,
  IconUserCheck,
} from '@tabler/icons-react';

export const LandingView: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { setTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  // Interactive Live Demo Reader State
  const [activeDemoTab, setActiveDemoTab] = useState<'hardware' | 'crypto' | 'teardown'>('hardware');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    // Ensure light mode by default on the landing page
    const saved = localStorage.getItem('va_dark_theme');
    if (!saved || saved === 'false') {
      setTheme(false);
    }
  }, [setTheme]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast('Please enter a valid work email address', 'error');
      return;
    }

    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const res = await fetch('/api/reader/enter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, source: 'LANDING_PAGE' }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSubscribed(true);
        try {
          localStorage.setItem('va_reader_email', normalizedEmail);
        } catch {}
        toast('Access granted! Entering intelligence wire...', 'success');
        setTimeout(() => {
          window.location.href = '/';
        }, 250);
      } else {
        toast(data.error || 'Failed to initialize reader access', 'error');
        setLoading(false);
      }
    } catch {
      toast('Network error. Please try again.', 'error');
      setLoading(false);
    }
  };

  const focusInput = () => {
    const input = document.getElementById('work-email-input');
    if (input) {
      input.focus();
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Demo briefs data for interactive showcase
  const demoBriefs = {
    hardware: {
      badge: 'AI HARDWARE · 52 WORDS',
      title: 'Verity Silicon Closes $340M Series C for Analog AI Compute',
      content:
        'Verity Silicon closed a $340 million round led by Sequoia and Temasek at a $4.1B valuation. The funding will accelerate mass fabrication of low-power analog in-memory compute chips that eliminate GPU memory transfer bottlenecks, enabling real-time edge LLMs on sub-15W battery devices.',
      source: 'The Information',
      valuation: '$4.1B Post-Money',
      time: '45m ago',
    },
    crypto: {
      badge: 'CRYPTO & WEB3 · 54 WORDS',
      title: 'Monad Raises $225M Led by Paradigm for 10,000 TPS Parallel EVM',
      content:
        'Monad completed a $225 million financing round led by Paradigm with participation from Electric Capital and Greenoaks. The team engineered a pipelined, parallelized Ethereum Virtual Machine architecture achieving 10,000 transactions per second with 1-second finality while preserving 100% bytecode compatibility with standard Ethereum smart contracts.',
      source: 'Fortune Crypto',
      valuation: '$3.0B Valuation',
      time: '2h ago',
    },
    teardown: {
      badge: 'CASE STUDY · 58 WORDS',
      title: 'CRED — Exclusivity as a Scalable Distribution Moat',
      content:
        'Kunal Shah engineered CRED into a $6.4B fintech by restricting access exclusively to consumers with credit scores above 750. By capturing the top 1% creditworthy base, CRED monetizes high-margin peer-to-peer lending and institutional credit lines with zero customer default risk.',
      source: 'Venture Atlas Teardowns',
      valuation: '$6.4B Valuation',
      time: 'Today',
    },
  };

  const currentBrief = demoBriefs[activeDemoTab];

  const toggleDemoAudio = () => {
    if (!('speechSynthesis' in window)) {
      toast('Audio synthesis not supported on this browser', 'info');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`${currentBrief.title}. ${currentBrief.content}`);
      utterance.rate = 1.05;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Curated Founder Cards for the Founder Showcase Gallery
  const featuredFounders = [
    {
      name: 'Kunal Shah',
      role: 'Founder & CEO, CRED',
      company: 'CRED',
      valuation: '$6.4 Billion',
      category: 'Fintech & Lending',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      headline: 'Jab "Exclusive" Hi Business Model Ban Gaya',
      summary:
        'Kunal Shah launched CRED in 2018 with a counter-intuitive premise: target solely the top 1% creditworthy users in India with credit scores above 750. Rewarding prompt credit card payments created a captive audience for high-margin lending products.',
      tag: 'Unicorn',
    },
    {
      name: 'Patrick Collison',
      role: 'Co-founder & CEO, Stripe',
      company: 'Stripe',
      valuation: '$65 Billion',
      category: 'Financial Infrastructure',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
      headline: 'The Architecture of a $1 Trillion Payment Rail',
      summary:
        'In 2010, accepting credit cards required weeks of paper underwriting. Patrick engineered 8 lines of code into a sovereign financial rail handling 1% of global GDP with five-nines uptime and zero database locks.',
      tag: 'Global Scale',
    },
    {
      name: 'Karri Saarinen',
      role: 'Co-founder & CEO, Linear',
      company: 'Linear',
      valuation: '$400 Million',
      category: 'Developer Tooling',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
      headline: 'Building a $400M Cult Software Brand with 0 Sales Reps',
      summary:
        'Defeating Jira through 60fps local-first SQLite clients and extreme product craft. Linear scaled past $35M ARR with fewer than 25 employees by refusing outbound SDR cold emails and focusing exclusively on sub-50ms speed.',
      tag: 'Capital Efficient',
    },
    {
      name: 'Eric Glyman',
      role: 'Co-founder & CEO, Ramp',
      company: 'Ramp',
      valuation: '$7.6 Billion',
      category: 'Corporate Finance',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
      headline: 'How Velocity of Execution Beat Legacy Cards in 36 Months',
      summary:
        'Aligning incentives with CFOs by promising that Ramp will actively decrease corporate spend through automated software detection and AI receipt matching, monetizing on interchange while saving clients millions.',
      tag: 'Hypergrowth',
    },
    {
      name: 'Melanie Perkins',
      role: 'Co-founder & CEO, Canva',
      company: 'Canva',
      valuation: '$26 Billion',
      category: 'Design & Workspace',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
      headline: 'From 100+ VC Rejections to a $26B Visual Democratizer',
      summary:
        'Melanie Perkins started from a school yearbook design tool in Perth, surviving over 100 investor rejections before scaling Canva to 185M+ monthly active users and $2.3B in annual revenue.',
      tag: 'Global Ecosystem',
    },
    {
      name: 'Amjad Masad',
      role: 'Founder & CEO, Replit',
      company: 'Replit',
      valuation: '$3.0 Billion',
      category: 'AI Software Creation',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
      headline: 'The Browser-Based IDE Powering 25M Next-Gen Developers',
      summary:
        'Moving entire developer environments into browser WebAssembly containers. Replit has turned 25M creators into full-stack software engineers using autonomous AI coding agents.',
      tag: 'AI Rails',
    },
  ];

  return (
    <div className="w-full text-text-primary flex flex-col justify-between overflow-x-hidden select-none -mt-3 sm:-mt-5 space-y-8 sm:space-y-12">
      
      {/* BREAKING NEWS MARQUEE WIRE TICKER */}
      <div className="w-full bg-[#09090b] text-white border-y border-white/10 py-2 px-4 overflow-hidden shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-400 text-black font-mono font-black text-[10px] uppercase tracking-wider shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
            <span>WIRE TICKER</span>
          </div>

          <div className="overflow-x-auto no-scrollbar flex items-center gap-5 text-xs font-mono whitespace-nowrap text-neutral-300">
            <span className="flex items-center gap-1.5">
              <strong className="text-white">MONAD</strong>
              <span className="text-emerald-400">+$225M (Paradigm)</span>
            </span>
            <span className="text-neutral-600">·</span>
            <span className="flex items-center gap-1.5">
              <strong className="text-white">VERITY SILICON</strong>
              <span className="text-emerald-400">+$340M (Sequoia)</span>
            </span>
            <span className="text-neutral-600">·</span>
            <span className="flex items-center gap-1.5">
              <strong className="text-white">CRED</strong>
              <span className="text-amber-400">$6.4B Valuation Moat</span>
            </span>
            <span className="text-neutral-600">·</span>
            <span className="flex items-center gap-1.5">
              <strong className="text-white">FIGURE AI</strong>
              <span className="text-emerald-400">+$675M (Bezos/Nvidia)</span>
            </span>
            <span className="text-neutral-600">·</span>
            <span className="flex items-center gap-1.5">
              <strong className="text-white">STRIPE</strong>
              <span className="text-sky-400">$1T Annual TPV</span>
            </span>
            <span className="text-neutral-600">·</span>
            <span className="flex items-center gap-1.5">
              <strong className="text-white">RAMP</strong>
              <span className="text-emerald-400">$300M+ ARR Record</span>
            </span>
          </div>
        </div>
      </div>

      {/* 1. HERO SECTION WITH VIBRANT RADIANT GLOW */}
      <div className="relative w-full overflow-hidden rounded-3xl pt-4 sm:pt-6 pb-6 sm:pb-8">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-90 dark:opacity-35 [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_90%)]">
          <GradientBackground className="w-full h-full" />
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 flex flex-col items-center text-center space-y-4 sm:space-y-6">
          
          {/* Live Top Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/90 dark:bg-black/70 border border-neutral-300 dark:border-neutral-700 shadow-sm backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
              EXECUTIVE INTELLIGENCE WIRE · 60-WORD BRIEFS
            </span>
          </div>

          {/* H1 Headline & Subtitle */}
          <div className="space-y-2.5 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-display tracking-tight text-neutral-950 dark:text-white leading-[0.95] uppercase drop-shadow-xs">
              Read what’s <br className="hidden sm:inline" />
              <span className="text-[#0066FF] dark:text-amber-400">breaking.</span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-neutral-800 dark:text-neutral-200 font-body max-w-2xl mx-auto leading-relaxed font-medium">
              Catch up on seed rounds, AI compute clusters, and market moats in 60 words. No fluff, no PR filler.
            </p>
          </div>

          {/* Email Capture Input */}
          <div className="w-full max-w-md mx-auto">
            {subscribed ? (
              <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-bold flex items-center justify-center gap-2 animate-fadeIn backdrop-blur-md shadow-sm">
                <IconCircleCheckFilled size={18} className="text-emerald-600" />
                <span>Access granted! Opening news feed...</span>
              </div>
            ) : (
              <form
                onSubmit={handleSubscribe}
                className="flex items-center p-1.5 rounded-full bg-white/95 dark:bg-[#141416]/95 border border-neutral-300/90 dark:border-white/20 shadow-xl focus-within:border-[#0066FF] dark:focus-within:border-amber-400 transition-all backdrop-blur-xl"
              >
                <input
                  id="work-email-input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your work email..."
                  required
                  className="flex-1 bg-transparent px-4 py-2 text-xs sm:text-sm font-body text-neutral-900 dark:text-white placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus:outline-none font-medium"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 sm:px-6 py-2 rounded-full bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-bold font-mono tracking-wider transition-all duration-200 active:scale-95 shadow-md shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  {loading ? 'Unlocking...' : 'Read the news'}
                  <IconArrowNarrowRight size={15} />
                </button>
              </form>
            )}

            <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 mt-2 text-center">
              I agree to receive the Venture Atlas brief. Unsubscribe anytime. View our{' '}
              <Link href="/privacy" className="text-amber-500 hover:underline">
                Privacy Policy
              </Link>
              .
            </p>

            <div className="flex items-center justify-center gap-3 text-[11px] font-mono text-neutral-600 dark:text-neutral-400 mt-2 font-medium">
              <span className="flex items-center gap-1">
                <IconCheck size={13} className="text-emerald-500" /> Instant Access
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <IconCheck size={13} className="text-emerald-500" /> 100% Free
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <IconCheck size={13} className="text-emerald-500" /> 24,000+ Readers
              </span>
            </div>
          </div>

          {/* Centerpiece iPhone Showcase */}
          <div className="relative w-full max-w-6xl mx-auto pt-2 sm:pt-4 pb-0 flex items-center justify-center">
            {/* Flanking Avatar 1 */}
            <div className="hidden xl:block absolute left-0 top-1/2 -translate-y-1/2 z-10">
              <div className="group relative w-32 h-32 rounded-full overflow-hidden border-2 border-white/80 dark:border-white/20 shadow-xl transition-all duration-500 hover:scale-105 backdrop-blur-sm ring-2 ring-black/5 dark:ring-white/10">
                <img
                  src="https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=400&q=80"
                  alt="Founder Pitching"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-center pb-2.5">
                  <span className="text-[9px] font-mono font-bold text-amber-300 uppercase">
                    Founder Pitches
                  </span>
                </div>
              </div>
            </div>

            {/* Flanking Avatar 2 */}
            <div className="hidden lg:block absolute left-40 xl:left-44 top-1/2 -translate-y-1/2 z-10">
              <div className="group relative w-36 h-36 rounded-full overflow-hidden border-2 border-white/80 dark:border-white/20 shadow-xl transition-all duration-500 hover:scale-105 backdrop-blur-sm ring-2 ring-black/5 dark:ring-white/10">
                <img
                  src="https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=400&q=80"
                  alt="Tech Operator"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-center pb-2.5">
                  <span className="text-[9px] font-mono font-bold text-amber-300 uppercase">
                    Tech Operators
                  </span>
                </div>
              </div>
            </div>

            {/* Central Interactive Phone Mockup */}
            <div className="relative z-20 mx-auto px-4 sm:px-6">
              <PhoneMockupBasic />
            </div>

            {/* Flanking Avatar 3 */}
            <div className="hidden lg:block absolute right-40 xl:right-44 top-1/2 -translate-y-1/2 z-10">
              <div className="group relative w-36 h-36 rounded-full overflow-hidden border-2 border-white/80 dark:border-white/20 shadow-xl transition-all duration-500 hover:scale-105 backdrop-blur-sm ring-2 ring-black/5 dark:ring-white/10">
                <img
                  src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400&q=80"
                  alt="AI Silicon Lab"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-center pb-2.5">
                  <span className="text-[9px] font-mono font-bold text-amber-300 uppercase">
                    AI & Deeptech
                  </span>
                </div>
              </div>
            </div>

            {/* Flanking Avatar 4 */}
            <div className="hidden xl:block absolute right-0 top-1/2 -translate-y-1/2 z-10">
              <div className="group relative w-32 h-32 rounded-full overflow-hidden border-2 border-white/80 dark:border-white/20 shadow-xl transition-all duration-500 hover:scale-105 backdrop-blur-sm ring-2 ring-black/5 dark:ring-white/10">
                <img
                  src="https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=400&q=80"
                  alt="Venture Capital"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-center pb-2.5">
                  <span className="text-[9px] font-mono font-bold text-amber-300 uppercase">
                    Venture Capital
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. EDITORIAL SPOTLIGHT: MEET THE BREAKOUT FOUNDERS */}
      <div className="w-full max-w-6xl mx-auto px-4 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-amber-600 dark:text-amber-400">
              <IconUserCheck size={15} />
              <span>Founder Spotlight & Moat Teardowns</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display uppercase tracking-tight text-neutral-950 dark:text-white">
              The Operators Shaping Tech
            </h2>
            <p className="text-xs sm:text-sm font-body text-neutral-600 dark:text-neutral-400 max-w-xl">
              Every week, our editorial team breaks down the non-consensus insights, seed funding journeys, and moats of breakout founders.
            </p>
          </div>

          <button
            onClick={focusInput}
            className="inline-flex items-center gap-1 text-xs font-mono font-bold uppercase text-[#0066FF] dark:text-amber-400 hover:underline cursor-pointer"
          >
            <span>Unlock all 50+ teardowns →</span>
          </button>
        </div>

        {/* 3-Column Founder Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {featuredFounders.map((f, idx) => (
            <div
              key={idx}
              className="group rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-[#121316] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              {/* Founder Header Bar */}
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-3.5">
                  {/* Founder Photo Avatar */}
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-neutral-200 dark:border-neutral-700 shrink-0 shadow-sm">
                    <img
                      src={f.image}
                      alt={f.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="text-sm sm:text-base font-black font-display text-neutral-950 dark:text-white truncate">
                        {f.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 shrink-0">
                        {f.tag}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-neutral-500 truncate">
                      {f.role}
                    </div>
                    <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {f.valuation}
                    </div>
                  </div>
                </div>

                {/* Deal Headline */}
                <h4 className="text-xs sm:text-sm font-black font-display text-neutral-900 dark:text-neutral-100 leading-snug">
                  {f.headline}
                </h4>

                {/* 60-Word Teardown Summary */}
                <p className="text-xs font-body text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {f.summary}
                </p>
              </div>

              {/* Bottom Card Footer */}
              <div className="px-5 py-2.5 bg-neutral-50 dark:bg-neutral-900/60 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-[11px] font-mono">
                <span className="text-neutral-500">{f.category}</span>
                <button
                  onClick={focusInput}
                  className="text-neutral-900 dark:text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Read 60w Teardown</span>
                  <IconArrowNarrowRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. INTERACTIVE LIVE 60-WORD READER DEMO */}
      <div className="w-full max-w-5xl mx-auto px-4 space-y-4">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-[#0066FF] dark:text-amber-400">
            <IconBolt size={15} />
            <span>Interactive Live Reader Demo</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-display uppercase tracking-tight text-neutral-950 dark:text-white">
            Experience 60-Word Executive Reporting
          </h2>
          <p className="text-xs sm:text-sm font-body text-neutral-600 dark:text-neutral-400 max-w-lg mx-auto">
            Toggle between live intelligence desks below to see how our editors format market-moving events.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center justify-center gap-2 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 max-w-md mx-auto">
          <button
            onClick={() => {
              setActiveDemoTab('hardware');
              setIsPlayingAudio(false);
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
              activeDemoTab === 'hardware'
                ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-sm'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            AI Hardware
          </button>
          <button
            onClick={() => {
              setActiveDemoTab('crypto');
              setIsPlayingAudio(false);
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
              activeDemoTab === 'crypto'
                ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-sm'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Crypto & Web3
          </button>
          <button
            onClick={() => {
              setActiveDemoTab('teardown');
              setIsPlayingAudio(false);
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
              activeDemoTab === 'teardown'
                ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-sm'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Moat Teardown
          </button>
        </div>

        {/* Live Interactive Card */}
        <div className="p-5 sm:p-7 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121316] shadow-xl space-y-3 max-w-2xl mx-auto transition-all">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {currentBrief.badge}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleDemoAudio}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-400 text-black hover:bg-amber-300 transition-colors shadow-xs"
              >
                {isPlayingAudio ? <IconPlayerPause size={13} /> : <IconPlayerPlay size={13} />}
                <span>{isPlayingAudio ? 'Pause Audio' : 'Listen with AI (1.05x)'}</span>
              </button>
            </div>
          </div>

          <h3 className="text-lg sm:text-xl font-black font-display text-neutral-950 dark:text-white leading-tight">
            {currentBrief.title}
          </h3>

          <p className="text-xs sm:text-sm font-body text-neutral-700 dark:text-neutral-300 leading-relaxed font-normal">
            {currentBrief.content}
          </p>

          <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-[11px] font-mono text-neutral-500">
            <span>Verified Citation: <strong className="text-neutral-900 dark:text-white">{currentBrief.source}</strong></span>
            <span>{currentBrief.time}</span>
          </div>
        </div>
      </div>

      {/* 4. COVERAGE DESKS GRID (ALL VERTICALS) */}
      <div className="w-full max-w-6xl mx-auto px-4 space-y-4">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-blue-600 dark:text-blue-400">
            <IconBuildingSkyscraper size={15} />
            <span>Full-Spectrum Coverage</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-display uppercase tracking-tight text-neutral-950 dark:text-white">
            6 Specialized News Desks
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121316] shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
              <span className="text-[10px] font-mono font-bold uppercase text-neutral-500">Live Wire</span>
            </div>
            <h3 className="text-base font-black font-display uppercase text-neutral-950 dark:text-white">
              Startups & Founders
            </h3>
            <p className="text-xs font-body text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Early-stage launches, pivot breakdowns, zero-CAC growth loops, and founder origin stories.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121316] shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
              <span className="text-[10px] font-mono font-bold uppercase text-neutral-500">Live Wire</span>
            </div>
            <h3 className="text-base font-black font-display uppercase text-neutral-950 dark:text-white">
              Funding & Seed Rounds
            </h3>
            <p className="text-xs font-body text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Lead investors, valuations, dilution multiples, and cap table mechanics from Pre-Seed to Series F.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121316] shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="w-2.5 h-2.5 rounded-full bg-[#06B6D4]" />
              <span className="text-[10px] font-mono font-bold uppercase text-neutral-500">Live Wire</span>
            </div>
            <h3 className="text-base font-black font-display uppercase text-neutral-950 dark:text-white">
              Crypto & Web3
            </h3>
            <p className="text-xs font-body text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Parallelized EVM throughput, Layer-2 fee metrics, decentralized compute, and protocol treasuries.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121316] shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />
              <span className="text-[10px] font-mono font-bold uppercase text-neutral-500">Live Wire</span>
            </div>
            <h3 className="text-base font-black font-display uppercase text-neutral-950 dark:text-white">
              Venture Capital & LPs
            </h3>
            <p className="text-xs font-body text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Fund sizes, DPI returns, term sheet liquidation preferences, and secondary market discounts.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121316] shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
              <span className="text-[10px] font-mono font-bold uppercase text-neutral-500">Live Wire</span>
            </div>
            <h3 className="text-base font-black font-display uppercase text-neutral-950 dark:text-white">
              AI & Hardware Compute
            </h3>
            <p className="text-xs font-body text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Inference accelerator chips, sovereign datacenter power contracts, and frontier model benchmarks.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121316] shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EC4899]" />
              <span className="text-[10px] font-mono font-bold uppercase text-neutral-500">Live Wire</span>
            </div>
            <h3 className="text-base font-black font-display uppercase text-neutral-950 dark:text-white">
              FinTech & Global Rails
            </h3>
            <p className="text-xs font-body text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Cross-border payroll settlement, interchange economics, corporate treasury software, and neo-banks.
            </p>
          </div>
        </div>
      </div>

      {/* 6. COMPARISON MATRIX (VENTURE ATLAS VS TRADITIONAL MEDIA) */}
      <div className="w-full max-w-4xl mx-auto px-4 space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black font-display uppercase tracking-tight text-neutral-950 dark:text-white">
            The Signal vs. Noise Comparison
          </h2>
          <p className="text-xs font-mono text-neutral-500 uppercase">
            How Venture Atlas replaces 10 bloated newsletters
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-white dark:bg-[#121316] shadow-lg">
          <div className="grid grid-cols-3 bg-neutral-100 dark:bg-neutral-900/80 p-3.5 border-b border-neutral-200 dark:border-neutral-800 text-xs font-mono font-bold uppercase text-neutral-700 dark:text-neutral-300">
            <div>Feature</div>
            <div className="text-center text-[#0066FF] dark:text-amber-400 font-black">Venture Atlas</div>
            <div className="text-center text-neutral-500">Legacy Tech Media</div>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60 text-xs sm:text-sm font-medium">
            <div className="grid grid-cols-3 p-3.5 items-center">
              <div className="font-bold text-neutral-900 dark:text-white">Story Length</div>
              <div className="text-center font-bold text-emerald-600 dark:text-emerald-400">Strictly 60 words</div>
              <div className="text-center text-neutral-500">1,500 – 3,000 words</div>
            </div>

            <div className="grid grid-cols-3 p-3.5 items-center">
              <div className="font-bold text-neutral-900 dark:text-white">Time To Read Daily</div>
              <div className="text-center font-bold text-emerald-600 dark:text-emerald-400">3 Minutes</div>
              <div className="text-center text-neutral-500">45+ Minutes</div>
            </div>

            <div className="grid grid-cols-3 p-3.5 items-center">
              <div className="font-bold text-neutral-900 dark:text-white">Audio Narration</div>
              <div className="text-center font-bold text-emerald-600 dark:text-emerald-400">Instant AI Neural Voice</div>
              <div className="text-center text-neutral-500">None / 1hr Podcasts</div>
            </div>

            <div className="grid grid-cols-3 p-3.5 items-center">
              <div className="font-bold text-neutral-900 dark:text-white">Visual Canvas Teardowns</div>
              <div className="text-center font-bold text-emerald-600 dark:text-emerald-400">Included on Every Deal</div>
              <div className="text-center text-neutral-500">Walls of Unstructured Text</div>
            </div>

            <div className="grid grid-cols-3 p-3.5 items-center">
              <div className="font-bold text-neutral-900 dark:text-white">Ads & Sponsorships</div>
              <div className="text-center font-bold text-emerald-600 dark:text-emerald-400">Zero Ads</div>
              <div className="text-center text-neutral-500">Popups, Trackers & Banners</div>
            </div>
          </div>
        </div>
      </div>

      {/* 7. TESTIMONIALS & CLIENT FEEDBACK */}
      <div className="w-full max-w-6xl mx-auto px-4">
        <ClientFeedback />
      </div>

      {/* 8. FINAL HIGH-IMPACT CALL TO ACTION */}
      <div className="w-full max-w-4xl mx-auto px-4 text-center py-4 space-y-4">
        <div className="p-6 sm:p-10 rounded-2xl bg-gradient-to-b from-neutral-950 to-neutral-900 text-white shadow-xl space-y-4 border border-white/10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-display uppercase tracking-tight">
            Stop scrolling bloated feeds.
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 font-body max-w-lg mx-auto leading-relaxed">
            Get the high-signal 60-word briefs and startup execution breakdowns trusted by 24,000+ founders and investors.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={focusInput}
              className="w-full sm:w-auto px-7 py-3 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold text-xs sm:text-sm uppercase tracking-wider transition-all active:scale-95 shadow-lg cursor-pointer"
            >
              Enter Work Email to Read Now
            </button>
            <Link
              href="/"
              className="w-full sm:w-auto px-7 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono font-bold text-xs sm:text-sm uppercase tracking-wider transition-all border border-white/15"
            >
              View Live Stream
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
};
