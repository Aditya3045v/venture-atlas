'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import createGlobe from 'cobe';
import { useToast } from '../providers/ToastProvider';
import {
  AtSign,
  Check,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Volume2,
  VolumeX,
  Radio,
  TrendingUp,
  Layers,
  Globe as GlobeIcon,
  ShieldAlert,
  Zap,
  CheckCircle2,
  Terminal,
  Activity,
  Bookmark,
  Plus,
  Compass,
  Trophy,
  Award,
  User,
  Eye,
  EyeOff,
  Search,
  ExternalLink,
} from 'lucide-react';

// =========================================================================
// 1. DATA DEFINITIONS
// =========================================================================

interface FocusOption {
  id: string;
  label: string;
  sub: string;
  icon: string;
}

const FOCUS_OPTIONS: FocusOption[] = [
  { id: 'all', label: 'Global Venture & AI Silicon', sub: 'Unicorns, Seed & Failures', icon: '🌐' },
  { id: 'unicorns', label: 'Unicorns & Late Stage', sub: '$100M+ rounds, IPOs & secondaries', icon: '🦄' },
  { id: 'ai', label: 'AI & DeepTech Silicon', sub: 'Inference chips, models & clusters', icon: '🤖' },
  { id: 'failures', label: 'Failures & Teardowns', sub: 'Post-mortems & burn rate spikes', icon: '📉' },
  { id: 'finance', label: 'Venture Finance & LPs', sub: 'Fund closings & DPI distributions', icon: '💼' },
  { id: 'seed', label: 'Seed & Early Radar', sub: 'Stealth founders & pre-seed term sheets', icon: '🌱' },
];

const TICKER_ITEMS = [
  { desk: 'UNICORN', text: 'Mercor closes $32M Series A at $250M valuation led by Benchmark', change: '+680%' },
  { desk: 'AI SILICON', text: 'Groq deploys 40MW LPU inference cluster; 520 T/s verified benchmark', change: 'HOT' },
  { desk: 'FAILURE', text: 'Protean Dynamics enters receivership after $70M autonomous burn stall', change: '-100%', down: true },
  { desk: 'FINANCE', text: 'Lightspeed finalizes $7.1B global fund vehicle across US and India', change: 'NEW' },
  { desk: 'SEED', text: 'Cognition Dynamics raises $6.5M pre-seed at $40M cap from Founders Fund', change: '+320%' },
  { desk: 'CRYPTO', text: 'Monad parallel EVM devnet logs 10,240 TPS sustained at 1s finality', change: '+44%' },
  { desk: 'GROWTH', text: 'Databricks authorizes $400M secondary share tender at $62B valuation', change: '+48%' },
];

const GLOBAL_HUBS = [
  { city: 'BENGALURU', region: 'India / SEA', coords: [12.9716, 77.5946], volume24h: '$4.8B', timeZone: 'IST', deals: 14 },
  { city: 'SAN FRANCISCO', region: 'North America', coords: [37.7749, -122.4194], volume24h: '$14.2B', timeZone: 'PST', deals: 42 },
  { city: 'LONDON', region: 'Europe', coords: [51.5074, -0.1278], volume24h: '$6.1B', timeZone: 'GMT', deals: 19 },
  { city: 'SINGAPORE', region: 'APAC Rails', coords: [1.3521, 103.8198], volume24h: '$3.2B', timeZone: 'SGT', deals: 11 },
  { city: 'NEW YORK', region: 'North America', coords: [40.7128, -74.0060], volume24h: '$9.4B', timeZone: 'EST', deals: 28 },
];

interface LiveArticlePreview {
  id: string;
  badge: string;
  badgeColor: string;
  badgeBg: string;
  title: string;
  date: string;
  hub: string;
  coverImage: string;
  avatar: string;
  leadPartner: string;
  valuation: string;
  round: string;
  metricLabel: string;
  metricValue: string;
  words: number;
}

const FEED_PREVIEWS: LiveArticlePreview[] = [
  {
    id: 'stripe',
    badge: 'UNICORN',
    badgeColor: '#D9A441',
    badgeBg: '#D9A44120',
    title: 'Stripe Closes $6.5B Round at $65B Valuation, Eyes 2027 IPO',
    date: '09/02/2026',
    hub: 'San Francisco',
    coverImage: '/onboarding-hero.jpg',
    avatar: '🦄',
    leadPartner: 'Peter Fenton • Benchmark',
    valuation: '$65B',
    round: 'SER I',
    metricLabel: 'RUNWAY',
    metricValue: '48 MO',
    words: 58,
  },
  {
    id: 'stability',
    badge: 'FAILURE',
    badgeColor: '#C24B3F',
    badgeBg: '#C24B3F20',
    title: "Stability AI's Near-Death: Governance Crisis & Talent Flight",
    date: '08/24/2026',
    hub: 'London',
    coverImage: '/onboarding-hero.jpg',
    avatar: '📉',
    leadPartner: 'Teardown Desk • Atlas',
    valuation: '$75M BURN',
    round: 'COLLAPSE',
    metricLabel: 'DEFICIT',
    metricValue: '-$18M',
    words: 59,
  },
  {
    id: 'groq',
    badge: 'AI SILICON',
    badgeColor: '#0066FF',
    badgeBg: '#0066FF20',
    title: 'Groq Expands LPU Footprint with 40MW Texas High-Density Cluster',
    date: '09/01/2026',
    hub: 'Mountain View',
    coverImage: '/onboarding-hero.jpg',
    avatar: '🤖',
    leadPartner: 'Trae Stephens • Founders Fund',
    valuation: '$2.8B',
    round: 'SER D',
    metricLabel: 'SPEED',
    metricValue: '520 T/S',
    words: 59,
  },
];

// =========================================================================
// 2. WEBGL TELEMETRY GLOBE COMPONENT
// =========================================================================

function TelemetryGlobe({ activeCoords }: { activeCoords: [number, number] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const [r, setR] = useState(0);

  useEffect(() => {
    let phi = 0;
    let width = 0;
    let globeInstance: any = null;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const onResize = () => {
      if (canvasRef.current) width = canvasRef.current.offsetWidth;
    };
    window.addEventListener('resize', onResize);
    onResize();

    if (canvasRef.current) {
      globeInstance = createGlobe(canvasRef.current, {
        devicePixelRatio: 2,
        width: width * 2,
        height: width * 2,
        phi: 0,
        theta: 0.28,
        dark: 1,
        diffuse: 0.35,
        mapSamples: 16000,
        mapBrightness: 1.15,
        baseColor: [11 / 255, 14 / 255, 20 / 255],
        markerColor: [217 / 255, 164 / 255, 65 / 255],
        glowColor: [47 / 255, 168 / 255, 160 / 255],
        markers: GLOBAL_HUBS.map(h => ({
          location: h.coords as [number, number],
          size: h.coords[0] === activeCoords[0] ? 0.12 : 0.07,
        })),
        onRender: (state: Record<string, any>) => {
          if (!pointerInteracting.current && !prefersReducedMotion) phi += 0.0028;
          state.phi = phi + r;
          state.width = width * 2;
          state.height = width * 2;
        },
      } as any);

      setTimeout(() => {
        if (canvasRef.current) canvasRef.current.style.opacity = '1';
      }, 150);
    }

    return () => {
      if (globeInstance) globeInstance.destroy();
      window.removeEventListener('resize', onResize);
    };
  }, [activeCoords, r]);

  return (
    <div className="relative aspect-square w-full max-w-[340px] mx-auto select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full opacity-0 transition-opacity duration-700 cursor-grab active:cursor-grabbing"
        onPointerDown={(e) => { pointerInteracting.current = e.clientX - pointerInteractionMovement.current; }}
        onPointerUp={() => { pointerInteracting.current = null; }}
        onPointerOut={() => { pointerInteracting.current = null; }}
        onMouseMove={(e) => {
          if (pointerInteracting.current !== null) {
            const delta = e.clientX - pointerInteracting.current;
            pointerInteractionMovement.current = delta;
            setR(delta / 200);
          }
        }}
      />
    </div>
  );
}

// =========================================================================
// 3. MAIN COMPONENT: LANDING VIEW
// =========================================================================

export const LandingView: React.FC = () => {
  const { toast } = useToast();

  // Mobile 3-Step Flow State (1: Welcome, 2: Login, 3: Discover Feed)
  const [mobileStep, setMobileStep] = useState<1 | 2 | 3>(1);

  // Desktop Screen Showcase Preview Tab (1: Welcome, 2: Login, 3: Discover Feed)
  const [desktopShowcaseStep, setDesktopShowcaseStep] = useState<1 | 2 | 3>(3);

  // Reader Authentication State
  const [email, setEmail] = useState('');
  const [selectedFocus, setSelectedFocus] = useState<string>('all');
  const [showFocusDropdown, setShowFocusDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isZooping, setIsZooping] = useState(false);

  // Telemetry Globe Coordinates
  const [selectedHubCoords, setSelectedHubCoords] = useState<[number, number]>([12.9716, 77.5946]);

  const currentFocus = FOCUS_OPTIONS.find(f => f.id === selectedFocus) || FOCUS_OPTIONS[0];

  // Advance from Step 1 to Step 2
  const handleStep1Continue = (e: React.FormEvent) => {
    e.preventDefault();
    setMobileStep(2);
  };

  // Complete Onboarding / Login with Soft Blur & Zoop Transition
  const handleCompleteLogin = async (userEmailToSubmit?: string) => {
    const finalEmail = (userEmailToSubmit || email).trim().toLowerCase();

    if (!finalEmail || !finalEmail.includes('@') || !finalEmail.includes('.')) {
      toast('Please enter a valid work email address', 'error');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/reader/enter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: finalEmail,
          source: 'LANDING_MOBILE_3STEP',
          interests: [selectedFocus],
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        // Save local preferences
        try {
          localStorage.setItem('va_reader_email', finalEmail);
          localStorage.setItem('va_reader_focus', selectedFocus);
          if (data.token) {
            localStorage.setItem('va_reader_token', data.token);
            document.cookie = `va_reader=${data.token}; path=/; max-age=31536000; SameSite=Lax`;
          }
          document.cookie = `va_reader_client=1; path=/; max-age=31536000; SameSite=Lax`;
        } catch {}

        // Move to Step 3 (Feed preview) or execute transition
        if (mobileStep === 2) {
          setMobileStep(3);
          setLoading(false);
          toast('Reader clearance verified. Unlocking live feed...', 'success');
        } else {
          // Direct Zoop animation transition
          setIsZooping(true);
          setTimeout(() => {
            window.location.href = '/';
          }, 750);
        }
      } else {
        toast(data.error || 'Failed to authenticate reader clearance', 'error');
        setLoading(false);
      }
    } catch {
      toast('Network error during clearance. Please retry.', 'error');
      setLoading(false);
    }
  };

  // Final Action from Step 3: Enter Full Live Feed
  const handleEnterFullFeed = () => {
    setIsZooping(true);
    setTimeout(() => {
      window.location.href = '/';
    }, 750);
  };

  return (
    <div className="min-h-screen bg-[#07090D] text-[#E6E8EC] font-body selection:bg-[#0066FF] selection:text-white relative overflow-x-hidden">

      {/* ========================================================
          FULLSCREEN SOFT BLUR & ZOOP TRANSITION OVERLAY
          ======================================================== */}
      {isZooping && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#07090D]/80 backdrop-blur-2xl transition-all duration-700 ease-out animate-fadeIn">
          <div className="text-center space-y-4 transform scale-110 animate-pulse">
            <div className="w-16 h-16 rounded-2xl bg-[#0066FF]/20 border border-[#0066FF]/50 flex items-center justify-center text-[#0066FF] mx-auto shadow-[0_0_50px_rgba(0,102,255,0.4)]">
              <Sparkles size={30} className="animate-spin" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-fraunces text-3xl sm:text-4xl text-white font-normal">
                Entering Venture Atlas Feed
              </h3>
              <p className="font-mono text-xs text-[#8C93A3] uppercase tracking-widest">
                Tuning 60-word briefs for {currentFocus.label}...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          DESKTOP WIRE HEADER & PHYSICAL DEAL TICKER
          (Visible on Desktop, sleek minimalist on Mobile)
          ======================================================== */}
      <header className="sticky top-0 z-40 bg-[#07090D]/95 backdrop-blur-md border-b border-[#1E232F] select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-[#E6E8EC]">
              <span className="w-2 h-2 rounded-full bg-[#2FA8A0] animate-pulse" />
              <span className="font-fraunces text-base font-bold tracking-tight text-white">
                Venture Atlas
              </span>
              <span className="text-[#555C6E]">//</span>
              <span className="text-[10px] text-[#8C93A3] uppercase tracking-wider hidden sm:inline">
                FINANCIAL INTELLIGENCE WIRE
              </span>
            </div>
            <span className="px-2 py-0.5 rounded border border-[#2A2F3A] bg-[#0B0E14] text-[10px] text-[#D9A441] font-bold">
              ISSUE #1,402
            </span>
          </div>

          {/* World Clocks (Desktop) */}
          <div className="hidden lg:flex items-center gap-5 text-[11px] text-[#555C6E]">
            <span className="hover:text-[#8C93A3] transition-colors">
              <span className="text-white/80 font-bold">BLR</span> 14:02 IST
            </span>
            <span className="text-[#2A2F3A]">•</span>
            <span className="hover:text-[#8C93A3] transition-colors">
              <span className="text-white/80 font-bold">SFO</span> 00:32 PST
            </span>
            <span className="text-[#2A2F3A]">•</span>
            <span className="hover:text-[#8C93A3] transition-colors">
              <span className="text-white/80 font-bold">LDN</span> 08:32 GMT
            </span>
            <span className="text-[#2A2F3A]">•</span>
            <span className="hover:text-[#8C93A3] transition-colors">
              <span className="text-white/80 font-bold">SIN</span> 16:32 SGT
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1 text-[10px] text-[#2FA8A0] bg-[#2FA8A0]/10 px-2 py-0.5 rounded border border-[#2FA8A0]/20">
              <Activity size={10} />
              <span>LATENCY: 18MS</span>
            </div>
            <Link
              href="/admin/login"
              className="px-2.5 py-1 rounded border border-[#2A2F3A] hover:border-[#D9A441] text-[10px] text-[#8C93A3] hover:text-[#D9A441] transition-all font-mono uppercase"
            >
              Staff Terminal
            </Link>
          </div>
        </div>

        {/* Live Deal Ticker Tape */}
        <div className="border-t border-[#1E232F] bg-[#0B0E14] py-1.5 overflow-hidden flex items-center">
          <div className="px-3 shrink-0 flex items-center gap-1.5 font-mono text-[10px] font-bold text-[#D9A441] border-r border-[#1E232F] bg-[#0B0E14] z-10">
            <Radio size={11} className="text-[#D9A441] animate-pulse" />
            <span>WIRE DEALS</span>
          </div>
          <div className="overflow-hidden whitespace-nowrap flex-1">
            <div className="animate-ticker font-mono text-[11px] text-[#8C93A3] flex items-center gap-8 pl-4">
              {TICKER_ITEMS.concat(TICKER_ITEMS).map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 shrink-0">
                  <span className="text-[#555C6E] font-bold">[{item.desk}]</span>
                  <span className="text-[#E6E8EC]">{item.text}</span>
                  <span className={`font-bold ${item.down ? 'text-[#C24B3F]' : 'text-[#D9A441]'}`}>
                    {item.change}
                  </span>
                  <span className="text-[#2A2F3A] mx-2">•</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================================
          MOBILE VIEW (`md:hidden`):
          THE EXACT 3-STEP FLOW MATCHING USER REFERENCE IMAGE (media_1788973318708.png)
          Step 1: Welcome / Splash (Illustration + Capsule Selector + Continue)
          Step 2: Login (Illustration + Email Capsule + Login black button + Socials)
          Step 3: Discover the Padelisto -> Discover Venture Atlas (Live Matches + Cards + Bottom Nav)
          ========================================================================= */}
      <div className="md:hidden min-h-[calc(100vh-80px)] flex flex-col justify-between bg-white text-neutral-900">

        {/* STEP 1: WELCOME SCREEN (Matching Left Screen in Reference) */}
        {mobileStep === 1 && (
          <div className="flex-1 flex flex-col justify-between animate-fadeIn bg-[#07090D]">

            {/* Top Half: Illustrated Scene with iOS Status Bar */}
            <div className="relative w-full h-80 overflow-hidden bg-[#0A1128]">
              <img
                src="/onboarding-hero.jpg"
                alt="Venture Atlas Tech Founders and Market Activity"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

              {/* iOS 9:41 Status Bar */}
              <div className="absolute top-4 left-6 right-6 flex items-center justify-between text-white text-xs font-mono select-none drop-shadow-md">
                <span className="font-bold">9:41</span>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-[10px] font-bold text-[#D9A441]">
                    60-WORD DISPATCHES
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Half: Pure White Rounded Sheet Card */}
            <div className="bg-white -mt-10 rounded-t-[36px] p-6 sm:p-8 relative z-10 flex-1 flex flex-col justify-between shadow-2xl space-y-6">

              <div className="space-y-4 pt-2">
                {/* Title styled like "Serve, Score, Connect in your Pocket" */}
                <div className="text-center space-y-1.5">
                  <h1 className="text-[28px] font-black font-display tracking-tight text-neutral-900 leading-tight">
                    Speed, <span className="text-[#0066FF]">Rigor</span>, Intelligence in your Pocket
                  </h1>
                  <p className="text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed">
                    60-word institutional briefs & venture telemetry on your mobile.
                  </p>
                </div>

                {/* Capsule Selector: styled like "I live in: United States" pill */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowFocusDropdown(!showFocusDropdown)}
                    className="w-full p-4 rounded-2xl bg-[#F5F6F8] hover:bg-neutral-100 border border-neutral-200/80 transition-all flex items-center justify-between text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 shadow-xs flex items-center justify-center text-xl shrink-0">
                        {currentFocus.icon}
                      </div>
                      <div>
                        <span className="block text-[11px] text-neutral-400 font-medium">
                          Primary sector:
                        </span>
                        <span className="block text-sm font-bold text-neutral-900 leading-snug">
                          {currentFocus.label}
                        </span>
                      </div>
                    </div>
                    <ChevronDown size={18} className={`text-neutral-400 transition-transform ${showFocusDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {showFocusDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-neutral-200 shadow-2xl p-2 z-30 space-y-1 animate-fadeIn">
                      {FOCUS_OPTIONS.map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => {
                            setSelectedFocus(f.id);
                            setShowFocusDropdown(false);
                          }}
                          className={`w-full p-2.5 rounded-xl flex items-center gap-3 text-left transition-colors ${
                            selectedFocus === f.id ? 'bg-[#0066FF]/10 text-[#0066FF]' : 'hover:bg-neutral-100 text-neutral-800'
                          }`}
                        >
                          <span className="text-lg">{f.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold leading-none">{f.label}</div>
                            <div className="text-[10px] text-neutral-400 truncate mt-0.5">{f.sub}</div>
                          </div>
                          {selectedFocus === f.id && <Check size={14} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action & Step Indicator */}
              <div className="space-y-4 pt-2">
                {/* Black Pill Continue Button */}
                <button
                  type="button"
                  onClick={handleStep1Continue}
                  className="w-full py-4 rounded-full bg-black hover:bg-neutral-800 active:scale-[0.98] text-white font-bold text-sm tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight size={16} />
                </button>

                {/* Step Dots: [●] [○] [○] */}
                <div className="flex items-center justify-center gap-2 pt-1 select-none">
                  <span className="w-6 h-1.5 rounded-full bg-black" />
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                </div>
              </div>

            </div>

          </div>
        )}

        {/* STEP 2: LOGIN SCREEN (Matching Middle Screen in Reference) */}
        {mobileStep === 2 && (
          <div className="flex-1 flex flex-col justify-between animate-fadeIn bg-[#07090D]">

            {/* Top Illustration Header */}
            <div className="relative w-full h-56 overflow-hidden bg-[#0A1128]">
              <img
                src="/onboarding-hero.jpg"
                alt="Venture Atlas Tech Founders and Market Activity"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

              <div className="absolute top-4 left-6 right-6 flex items-center justify-between text-white text-xs font-mono select-none drop-shadow-md">
                <button
                  type="button"
                  onClick={() => setMobileStep(1)}
                  className="p-1 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="font-bold">9:41</span>
                <span className="w-6" />
              </div>
            </div>

            {/* Bottom White Card (Expanded up) */}
            <div className="bg-white -mt-10 rounded-t-[36px] p-6 sm:p-8 relative z-10 flex-1 flex flex-col justify-between shadow-2xl space-y-5">

              <div className="space-y-4 pt-1">
                {/* Title & Subtitle */}
                <div className="text-center space-y-1">
                  <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
                    Login
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Welcome! Please login to your reader account
                  </p>
                </div>

                {/* Input 1: Email Capsule */}
                <div className="space-y-1">
                  <div className="p-3.5 rounded-2xl bg-[#F5F6F8] border border-neutral-200/80 flex items-center gap-3 focus-within:ring-2 focus-within:ring-neutral-900/10 focus-within:bg-white transition-all">
                    <div className="w-8 h-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-neutral-700 shrink-0">
                      <AtSign size={16} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="founder@venture.io"
                      required
                      autoFocus
                      className="flex-1 bg-transparent text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Input 2: Fast Sector Token / Instant Clearance */}
                <div className="space-y-1">
                  <div className="p-3.5 rounded-2xl bg-[#F5F6F8] border border-neutral-200/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-emerald-600 shrink-0">
                        <CheckCircle2 size={16} />
                      </div>
                      <div className="truncate">
                        <span className="block text-xs font-semibold text-neutral-800">
                          Passwordless Clearance
                        </span>
                        <span className="block text-[10px] text-neutral-400">
                          Instant token • Zero passwords
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-[#0066FF] font-bold uppercase shrink-0">
                      ACTIVE
                    </span>
                  </div>
                </div>

                {/* Action Row: Sign up / Skip on left, Login Black Pill on right */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setMobileStep(3)}
                    className="text-xs font-semibold text-neutral-400 hover:text-neutral-900 transition-colors"
                  >
                    Preview feed
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCompleteLogin()}
                    disabled={loading}
                    className="py-3 px-8 rounded-full bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? 'Clearing...' : 'Login'}
                  </button>
                </div>

                {/* "Or" Divider */}
                <div className="flex items-center gap-3 my-3">
                  <div className="flex-1 h-px bg-neutral-200" />
                  <span className="text-xs text-neutral-400 font-medium">Or</span>
                  <div className="flex-1 h-px bg-neutral-200" />
                </div>

                {/* Social Login Circles (Matching Reference) */}
                <div className="flex items-center justify-center gap-4 pt-1">
                  {/* Facebook */}
                  <button
                    type="button"
                    onClick={() => handleCompleteLogin('reader.fb@ventureatlas.in')}
                    className="w-11 h-11 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-bold text-base shadow-sm hover:scale-105 active:scale-95 transition-transform"
                    title="1-Tap Access"
                  >
                    f
                  </button>
                  {/* Apple */}
                  <button
                    type="button"
                    onClick={() => handleCompleteLogin('reader.apple@ventureatlas.in')}
                    className="w-11 h-11 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm shadow-sm hover:scale-105 active:scale-95 transition-transform"
                    title="Sign in with Apple"
                  >
                    
                  </button>
                  {/* Google */}
                  <button
                    type="button"
                    onClick={() => handleCompleteLogin('reader.google@ventureatlas.in')}
                    className="w-11 h-11 rounded-full bg-white border border-neutral-200 text-neutral-800 flex items-center justify-center font-bold text-sm shadow-sm hover:scale-105 active:scale-95 transition-transform"
                    title="Sign in with Google"
                  >
                    G
                  </button>
                </div>

              </div>

              {/* Step Dots: [○] [●] [○] */}
              <div className="flex items-center justify-center gap-2 pt-2 select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                <span className="w-6 h-1.5 rounded-full bg-black" />
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
              </div>

            </div>

          </div>
        )}

        {/* STEP 3: DISCOVER FEED SCREEN (Matching Right Screen in Reference: "Discover the Padelisto") */}
        {mobileStep === 3 && (
          <div className="flex-1 flex flex-col justify-between animate-fadeIn bg-[#F8F9FA] pb-6">

            {/* iOS Status Bar */}
            <div className="px-6 pt-3 pb-1 flex items-center justify-between text-neutral-900 text-xs font-mono select-none">
              <span className="font-bold">9:41</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#0066FF] bg-[#0066FF]/10 px-2 py-0.5 rounded-full">
                  LIVE WIRE
                </span>
              </div>
            </div>

            {/* Top Title: "Discover the Padelisto" -> "Discover Venture Atlas" */}
            <div className="px-6 pt-2 pb-3 flex items-center justify-between">
              <h2 className="text-2xl font-black font-display tracking-tight text-neutral-900">
                Discover Venture Atlas
              </h2>
              <button
                type="button"
                onClick={handleEnterFullFeed}
                className="text-xs font-bold text-[#0066FF] hover:underline"
              >
                View All
              </button>
            </div>

            {/* Feed Scroll Content */}
            <div className="flex-1 overflow-y-auto px-4 space-y-4">

              {/* Section 1: "Live matches" -> "Breaking Live Deals" */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-2">
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    Breaking Live Deals
                  </span>
                  <button type="button" onClick={handleEnterFullFeed} className="text-[11px] font-semibold text-[#0066FF]">
                    View All
                  </button>
                </div>

                {/* Horizontal Live Deal Card (matching reference format) */}
                <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold">
                        Deal 1 • Late Stage
                      </span>
                      <span className="text-neutral-400 text-[11px]">28 Jan 2026</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => toast('Saved to private portfolio radar', 'success')}
                      className="px-2.5 py-1 rounded-full bg-[#0066FF]/10 text-[#0066FF] font-bold text-[10px] flex items-center gap-1 hover:bg-[#0066FF]/20 transition-colors"
                    >
                      <Bookmark size={10} />
                      <span>Bookmark</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-sm font-bold">
                        🦄
                      </div>
                      <div>
                        <div className="text-xs font-bold text-neutral-900">Mercor AI</div>
                        <div className="text-[10px] text-neutral-400">$250M Valuation</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-[#0066FF]">$32M Round</div>
                      <div className="text-[10px] text-neutral-400">Peter Fenton • Benchmark</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: "Institutional Dispatches" Feed Cards */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-2">
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    Institutional Dispatches
                  </span>
                  <button type="button" onClick={handleEnterFullFeed} className="text-[11px] font-semibold text-[#0066FF]">
                    View All
                  </button>
                </div>

                {/* Card 1 (Unicorn) */}
                <div className="p-4 rounded-3xl bg-white border border-neutral-200/80 shadow-sm space-y-3">
                  <div className="relative rounded-2xl overflow-hidden h-32 bg-neutral-900">
                    <img
                      src="/onboarding-hero.jpg"
                      alt="Stripe 6.5B round"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[#D9A441] text-[10px] font-mono font-bold border border-white/20">
                      🦄 UNICORN DESK
                    </span>
                    <button
                      type="button"
                      onClick={() => toast('Saved to bookmarks', 'success')}
                      className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 backdrop-blur-md text-white hover:text-[#0066FF]"
                    >
                      <Bookmark size={14} />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-neutral-900 leading-snug">
                      Stripe Closes $6.5B Round at $65B Valuation, Eyes 2027 IPO
                    </h3>
                    <p className="text-[10px] text-neutral-400 font-mono">
                      09/02/2026 • San Francisco & Global rails
                    </p>
                  </div>

                  {/* 4 Stats Grid matching reference image */}
                  <div className="grid grid-cols-4 gap-1.5 text-center font-mono">
                    <div className="p-1.5 rounded-xl bg-neutral-50 border border-neutral-100">
                      <div className="text-[8px] text-neutral-400 uppercase">Valuation</div>
                      <div className="text-xs font-bold text-neutral-900">$65B</div>
                    </div>
                    <div className="p-1.5 rounded-xl bg-neutral-50 border border-neutral-100">
                      <div className="text-[8px] text-neutral-400 uppercase">Round</div>
                      <div className="text-xs font-bold text-[#0066FF]">SER I</div>
                    </div>
                    <div className="p-1.5 rounded-xl bg-neutral-50 border border-neutral-100">
                      <div className="text-[8px] text-neutral-400 uppercase">Lead</div>
                      <div className="text-xs font-bold text-neutral-900">Sequoia</div>
                    </div>
                    <div className="p-1.5 rounded-xl bg-neutral-50 border border-neutral-100">
                      <div className="text-[8px] text-neutral-400 uppercase">Words</div>
                      <div className="text-xs font-bold text-neutral-900">58/60</div>
                    </div>
                  </div>
                </div>

                {/* Card 2 (Failure) */}
                <div className="p-4 rounded-3xl bg-white border border-neutral-200/80 shadow-sm space-y-3">
                  <div className="relative rounded-2xl overflow-hidden h-32 bg-neutral-900">
                    <img
                      src="/onboarding-hero.jpg"
                      alt="Stability AI Teardown"
                      className="w-full h-full object-cover filter saturate-50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[#C24B3F] text-[10px] font-mono font-bold border border-white/20">
                      📉 FAILURE TEARDOWN
                    </span>
                    <button
                      type="button"
                      onClick={() => toast('Saved to bookmarks', 'success')}
                      className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 backdrop-blur-md text-white hover:text-[#0066FF]"
                    >
                      <Bookmark size={14} />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-neutral-900 leading-snug">
                      Stability AI's Near-Death: Governance Crisis & Talent Exodus
                    </h3>
                    <p className="text-[10px] text-neutral-400 font-mono">
                      08/24/2026 • London & Silicon Valley
                    </p>
                  </div>

                  {/* 4 Stats Grid */}
                  <div className="grid grid-cols-4 gap-1.5 text-center font-mono">
                    <div className="p-1.5 rounded-xl bg-neutral-50 border border-neutral-100">
                      <div className="text-[8px] text-neutral-400 uppercase">Total Burn</div>
                      <div className="text-xs font-bold text-[#C24B3F]">$75M</div>
                    </div>
                    <div className="p-1.5 rounded-xl bg-neutral-50 border border-neutral-100">
                      <div className="text-[8px] text-neutral-400 uppercase">Deficit</div>
                      <div className="text-xs font-bold text-[#C24B3F]">-$18M</div>
                    </div>
                    <div className="p-1.5 rounded-xl bg-neutral-50 border border-neutral-100">
                      <div className="text-[8px] text-neutral-400 uppercase">Recovery</div>
                      <div className="text-xs font-bold text-neutral-900">0.08/$1</div>
                    </div>
                    <div className="p-1.5 rounded-xl bg-neutral-50 border border-neutral-100">
                      <div className="text-[8px] text-neutral-400 uppercase">Words</div>
                      <div className="text-xs font-bold text-neutral-900">59/60</div>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom Floating Pill Action Button & Bottom Bar */}
            <div className="pt-3 px-4 space-y-3">
              {/* Primary Black Pill "Enter Full Live Feed" */}
              <button
                type="button"
                onClick={handleEnterFullFeed}
                className="w-full py-4 rounded-full bg-black hover:bg-neutral-800 text-white font-bold text-sm tracking-wide shadow-xl active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Enter Full Live Feed</span>
                <ArrowRight size={16} />
              </button>

              {/* Step Dots: [○] [○] [●] */}
              <div className="flex items-center justify-center gap-2 select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                <span className="w-6 h-1.5 rounded-full bg-black" />
              </div>

              {/* Bottom Navigation Bar (Matching Screen 3 in Reference) */}
              <div className="border-t border-neutral-200/80 pt-2 flex items-center justify-around text-[10px] text-neutral-400 font-medium select-none">
                <button type="button" className="flex flex-col items-center gap-1 text-[#0066FF] font-bold">
                  <Compass size={18} />
                  <span>Discover</span>
                </button>
                <button type="button" onClick={handleEnterFullFeed} className="flex flex-col items-center gap-1 hover:text-neutral-900">
                  <Layers size={18} />
                  <span>Desks</span>
                </button>
                <button type="button" onClick={handleEnterFullFeed} className="flex flex-col items-center gap-1 hover:text-neutral-900">
                  <Award size={18} />
                  <span>Radar</span>
                </button>
                <button type="button" onClick={handleEnterFullFeed} className="flex flex-col items-center gap-1 hover:text-neutral-900">
                  <User size={18} />
                  <span>Profile</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* =========================================================================
          DESKTOP VIEW (`hidden md:block`):
          ELEVATED, HIGH-DENSITY BLOOMBERG TERMINAL + INSHORTS COMMAND CENTER
          ========================================================================= */}
      <div className="hidden md:block">

        {/* Master Hero Command Center */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-16">

          <div className={`grid grid-cols-12 gap-8 lg:gap-12 items-start transition-all duration-700 ${isZooping ? 'scale-105 blur-md opacity-30' : 'scale-100 blur-0 opacity-100'}`}>

            {/* LEFT COLUMN: Editorial Power, Authority & Clearance Gate (7 cols) */}
            <div className="col-span-7 space-y-6">

              {/* Monospace Badge */}
              <div className="flex items-center gap-2.5 font-mono text-xs">
                <span className="px-2.5 py-1 rounded bg-[#0066FF]/10 border border-[#0066FF]/30 text-[#0066FF] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal size={12} />
                  <span>BLOOMBERG + INSHORTS FOR TECH FOUNDERS</span>
                </span>
                <span className="text-[#555C6E]">•</span>
                <span className="text-[#8C93A3]">INSTITUTIONAL RADAR</span>
              </div>

              {/* Grand Serif Editorial Headline */}
              <div className="space-y-3">
                <h1 className="font-fraunces text-4xl lg:text-5xl xl:text-6xl text-white font-normal tracking-tight leading-[1.1]">
                  Speed. <span className="italic text-[#D9A441]">Rigor.</span> Intelligence in your Pocket.
                </h1>
                <p className="text-base lg:text-lg text-[#8C93A3] font-body leading-relaxed max-w-xl">
                  Institutional startup briefs, raw cap-table multiples, and unvarnished failure post-mortems. Cleared in <span className="text-white font-semibold underline decoration-[#D9A441]/50 underline-offset-4">under 90 seconds a day</span>.
                </p>
              </div>

              {/* Monospace Proof Strip */}
              <div className="grid grid-cols-4 gap-2 font-mono text-center select-none pt-1">
                <div className="p-2.5 rounded-lg border border-[#1E232F] bg-[#0B0E14] space-y-0.5">
                  <div className="text-sm lg:text-base font-bold text-white">60 WORDS</div>
                  <div className="text-[9px] text-[#555C6E] uppercase">Hard Ceiling</div>
                </div>
                <div className="p-2.5 rounded-lg border border-[#1E232F] bg-[#0B0E14] space-y-0.5">
                  <div className="text-sm lg:text-base font-bold text-[#0066FF]">90 SEC</div>
                  <div className="text-[9px] text-[#555C6E] uppercase">Daily Clearance</div>
                </div>
                <div className="p-2.5 rounded-lg border border-[#1E232F] bg-[#0B0E14] space-y-0.5">
                  <div className="text-sm lg:text-base font-bold text-[#D9A441]">5 DESKS</div>
                  <div className="text-[9px] text-[#555C6E] uppercase">Continuous Wire</div>
                </div>
                <div className="p-2.5 rounded-lg border border-[#1E232F] bg-[#0B0E14] space-y-0.5">
                  <div className="text-sm lg:text-base font-bold text-[#2FA8A0]">0 FLUFF</div>
                  <div className="text-[9px] text-[#555C6E] uppercase">No Sponsored PR</div>
                </div>
              </div>

              {/* Desktop Clearance Terminal */}
              <div className="p-6 rounded-2xl border border-[#2A2F3A] bg-[#0B0E14] shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#1E232F] pb-3 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#0066FF]" />
                    <span className="text-white font-bold uppercase tracking-wider">
                      READER CLEARANCE TERMINAL
                    </span>
                  </div>
                  <span className="text-[11px] text-[#555C6E]">
                    NO PASSWORD NEEDED • INSTANT ACCESS
                  </span>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleCompleteLogin();
                  }}
                  className="space-y-3"
                >
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <div className="flex-1 p-3 rounded-xl bg-[#07090D] border border-[#2A2F3A] flex items-center gap-3 focus-within:ring-2 focus-within:ring-[#0066FF]/40 focus-within:border-[#0066FF] transition-all">
                      <div className="w-8 h-8 rounded-lg bg-[#0066FF]/10 border border-[#0066FF]/30 flex items-center justify-center text-[#0066FF] shrink-0">
                        <AtSign size={16} />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="gp@venturefirm.com or founder@startup.io"
                        required
                        className="flex-1 bg-transparent text-sm font-mono text-white placeholder:text-[#555C6E] focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="py-3 px-6 rounded-xl bg-white hover:bg-neutral-200 active:scale-[0.99] text-neutral-950 font-mono font-bold text-sm uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap disabled:opacity-50"
                    >
                      <span>{loading ? 'Clearing...' : 'Access Wire Feed'}</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>

                  {/* Sector Quick Tags */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
                    <span className="text-[#555C6E]">Tracking Focus:</span>
                    {FOCUS_OPTIONS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setSelectedFocus(f.id)}
                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                          selectedFocus === f.id
                            ? 'bg-[#0066FF] text-white font-bold'
                            : 'bg-[#07090D] text-[#8C93A3] border border-[#1E232F] hover:text-white'
                        }`}
                      >
                        {f.icon} {f.label.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </form>

                <div className="flex items-center justify-between text-[11px] text-[#555C6E] font-mono pt-1">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-[#2FA8A0]" />
                    Encrypted reader session
                  </span>
                  <span>Instant clearance • Real-time wire</span>
                </div>
              </div>

              {/* Reader Cohort Social Proof */}
              <div className="pt-2 flex items-center gap-3 text-xs text-[#555C6E] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2FA8A0]" />
                <span>Read daily by 14,800+ GPs, Founders & Analysts across Sequoia, Lightspeed, Benchmark & Accel alumni.</span>
              </div>

            </div>

            {/* RIGHT COLUMN: Interactive 3-Screen Mobile Showcase (5 cols) */}
            <div className="col-span-5 space-y-4">

              {/* Container Frame */}
              <div className="rounded-2xl border border-[#2A2F3A] bg-[#0B0E14] overflow-hidden shadow-2xl flex flex-col">

                {/* Window Title Bar */}
                <div className="bg-[#07090D] border-b border-[#1E232F] px-4 py-3 flex items-center justify-between select-none">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#C24B3F]/70" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#D9A441]/70" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#2FA8A0]/70" />
                    </div>
                    <span className="ml-2 font-mono text-[11px] font-bold text-[#8C93A3] uppercase tracking-wider">
                      MOBILE WIRE EXPERIENCE
                    </span>
                  </div>

                  <div className="flex items-center gap-1 font-mono text-[10px]">
                    <span className="text-[#D9A441]">3-STEP FLOW</span>
                  </div>
                </div>

                {/* 3 Steps Tabs Selector */}
                <div className="bg-[#0B0E14] border-b border-[#1E232F] p-1.5 flex items-center gap-1 font-mono text-[10px]">
                  <button
                    type="button"
                    onClick={() => setDesktopShowcaseStep(1)}
                    className={`flex-1 py-1.5 rounded-md transition-all uppercase text-center cursor-pointer ${
                      desktopShowcaseStep === 1
                        ? 'bg-white text-neutral-950 font-bold shadow-xs'
                        : 'text-[#8C93A3] hover:text-white hover:bg-[#1E232F]'
                    }`}
                  >
                    1. Welcome Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setDesktopShowcaseStep(2)}
                    className={`flex-1 py-1.5 rounded-md transition-all uppercase text-center cursor-pointer ${
                      desktopShowcaseStep === 2
                        ? 'bg-white text-neutral-950 font-bold shadow-xs'
                        : 'text-[#8C93A3] hover:text-white hover:bg-[#1E232F]'
                    }`}
                  >
                    2. Instant Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setDesktopShowcaseStep(3)}
                    className={`flex-1 py-1.5 rounded-md transition-all uppercase text-center cursor-pointer ${
                      desktopShowcaseStep === 3
                        ? 'bg-white text-neutral-950 font-bold shadow-xs'
                        : 'text-[#8C93A3] hover:text-white hover:bg-[#1E232F]'
                    }`}
                  >
                    3. Discover Feed
                  </button>
                </div>

                {/* Live Preview Container (Simulating Phone Display) */}
                <div className="p-4 bg-[#07090D] flex justify-center">

                  {/* Simulated Mobile Mockup */}
                  <div className="w-full max-w-[320px] rounded-[32px] overflow-hidden border border-neutral-700 shadow-2xl bg-white text-neutral-900 font-body">

                    {/* Step 1 Showcase */}
                    {desktopShowcaseStep === 1 && (
                      <div className="h-[460px] flex flex-col justify-between bg-[#07090D] animate-fadeIn">
                        <div className="relative h-48 overflow-hidden">
                          <img src="/onboarding-hero.jpg" alt="Hero" className="w-full h-full object-cover" />
                          <div className="absolute top-3 left-4 right-4 flex justify-between text-white text-[10px] font-mono">
                            <span>9:41</span>
                            <span className="text-[#D9A441] font-bold">60 WORDS</span>
                          </div>
                        </div>
                        <div className="bg-white -mt-8 rounded-t-[28px] p-5 flex-1 flex flex-col justify-between space-y-3">
                          <div className="space-y-1 text-center">
                            <h4 className="text-base font-black font-display text-neutral-900 leading-tight">
                              Speed, <span className="text-[#0066FF]">Rigor</span>, Intelligence
                            </h4>
                            <p className="text-[10px] text-neutral-500">
                              Institutional briefs on your mobile.
                            </p>
                          </div>
                          <div className="p-2.5 rounded-xl bg-[#F5F6F8] flex items-center gap-2 border border-neutral-200">
                            <span className="text-base">🌐</span>
                            <div className="text-[10px] truncate">
                              <span className="block text-neutral-400">Focus:</span>
                              <strong className="text-neutral-900">Global Venture & AI</strong>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setDesktopShowcaseStep(2)}
                            className="w-full py-2.5 rounded-full bg-black text-white font-bold text-xs"
                          >
                            Continue →
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 2 Showcase */}
                    {desktopShowcaseStep === 2 && (
                      <div className="h-[460px] flex flex-col justify-between bg-[#07090D] animate-fadeIn">
                        <div className="relative h-36 overflow-hidden">
                          <img src="/onboarding-hero.jpg" alt="Hero" className="w-full h-full object-cover object-top" />
                          <div className="absolute top-3 left-4 right-4 flex justify-between text-white text-[10px] font-mono">
                            <span>9:41</span>
                            <span className="text-white font-bold">LOGIN</span>
                          </div>
                        </div>
                        <div className="bg-white -mt-8 rounded-t-[28px] p-5 flex-1 flex flex-col justify-between space-y-3">
                          <div className="space-y-0.5 text-center">
                            <h4 className="text-base font-bold text-neutral-900">Login</h4>
                            <p className="text-[10px] text-neutral-500">Welcome! Please login</p>
                          </div>
                          <div className="space-y-2">
                            <div className="p-2 rounded-xl bg-[#F5F6F8] border border-neutral-200 flex items-center gap-2 text-xs">
                              <AtSign size={14} className="text-neutral-500" />
                              <span className="text-neutral-700 font-mono text-[11px]">gp@venturefirm.com</span>
                            </div>
                            <div className="p-2 rounded-xl bg-[#F5F6F8] border border-neutral-200 flex items-center justify-between text-xs">
                              <span className="text-[10px] text-neutral-600">Passwordless Clearance</span>
                              <CheckCircle2 size={12} className="text-emerald-600" />
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-neutral-400">Skip</span>
                            <button
                              type="button"
                              onClick={() => setDesktopShowcaseStep(3)}
                              className="py-1.5 px-4 rounded-full bg-black text-white font-bold text-[10px]"
                            >
                              Login
                            </button>
                          </div>
                          <div className="flex justify-center gap-2 pt-1">
                            <span className="w-7 h-7 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-xs font-bold">f</span>
                            <span className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold"></span>
                            <span className="w-7 h-7 rounded-full bg-white border border-neutral-200 text-neutral-800 flex items-center justify-center text-xs font-bold">G</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 3 Showcase: Discover Feed */}
                    {desktopShowcaseStep === 3 && (
                      <div className="h-[460px] flex flex-col justify-between bg-[#F8F9FA] p-3 animate-fadeIn space-y-2 overflow-hidden">
                        <div className="flex justify-between items-center px-1">
                          <h4 className="text-xs font-black text-neutral-900">Discover Venture Atlas</h4>
                          <span className="text-[9px] text-[#0066FF] font-bold">View All</span>
                        </div>

                        {/* Mini Breaking Deal Card */}
                        <div className="p-2.5 rounded-xl bg-white border border-neutral-200 space-y-1">
                          <div className="flex justify-between text-[9px]">
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">UNICORN</span>
                            <span className="text-neutral-400">14m ago</span>
                          </div>
                          <div className="text-[10px] font-bold text-neutral-900 leading-tight">
                            Mercor closes $32M Series A at $250M
                          </div>
                        </div>

                        {/* Mini Dispatch Card */}
                        <div className="p-2.5 rounded-2xl bg-white border border-neutral-200 space-y-1.5">
                          <div className="h-16 rounded-lg overflow-hidden relative">
                            <img src="/onboarding-hero.jpg" alt="Cover" className="w-full h-full object-cover" />
                            <span className="absolute bottom-1 left-1.5 px-1.5 py-0.5 rounded bg-black/60 text-[#D9A441] text-[8px] font-bold">
                              STRIPE $65B
                            </span>
                          </div>
                          <div className="text-[10px] font-bold text-neutral-900 leading-snug">
                            Stripe Closes $6.5B Round at $65B Valuation
                          </div>
                          <div className="grid grid-cols-4 gap-1 text-center font-mono text-[8px]">
                            <div className="p-1 rounded bg-neutral-50 font-bold">$65B</div>
                            <div className="p-1 rounded bg-neutral-50 font-bold text-[#0066FF]">SER I</div>
                            <div className="p-1 rounded bg-neutral-50 font-bold">Sequoia</div>
                            <div className="p-1 rounded bg-neutral-50 font-bold">58W</div>
                          </div>
                        </div>

                        {/* Enter Full Feed Button */}
                        <button
                          type="button"
                          onClick={handleEnterFullFeed}
                          className="w-full py-2 rounded-full bg-black text-white font-bold text-[10px] hover:bg-neutral-800 transition-colors"
                        >
                          Enter Live Feed →
                        </button>
                      </div>
                    )}

                  </div>

                </div>

                <div className="bg-[#07090D] border-t border-[#1E232F] px-4 py-2 flex items-center justify-between font-mono text-[10px] text-[#555C6E]">
                  <span>INTERACTIVE MOBILE PROTOTYPE</span>
                  <span className="text-[#2FA8A0]">LIVE ON SMARTPHONES</span>
                </div>

              </div>

            </div>

          </div>

        </main>

        {/* ========================================================
            DESKTOP BENTO GRID: 60-WORD ENGINE & CAPITAL TELEMETRY
            ======================================================== */}
        <section className="border-t border-[#1E232F] bg-[#07090D] py-16 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto space-y-16">

            {/* The 60-Word Rule Engine: "The Death of PR Fluff" */}
            <div className="space-y-6">
              <div className="text-center space-y-2 max-w-2xl mx-auto">
                <div className="font-mono text-xs text-[#D9A441] uppercase tracking-widest">
                  THE 60-WORD CONSTRAINT ENGINE
                </div>
                <h2 className="font-fraunces text-3xl sm:text-4xl text-white font-normal">
                  Why 90% of tech journalism is unreadable fluff.
                </h2>
                <p className="text-sm text-[#8C93A3] font-body">
                  We ban embargoed PR quotes, speculative corporate spin, and repetitive background summaries. Only raw valuation numbers, round structures, and genuine bottlenecks.
                </p>
              </div>

              {/* Side-by-Side Comparison Container */}
              <div className="grid grid-cols-2 gap-6 max-w-5xl mx-auto font-mono text-xs">

                {/* Left: Traditional Tech News */}
                <div className="p-6 rounded-2xl border border-[#2A2F3A] bg-[#0B0E14] space-y-4 opacity-70">
                  <div className="flex items-center justify-between text-[#C24B3F] pb-2 border-b border-[#1E232F]">
                    <span className="font-bold uppercase">TRADITIONAL TECH JOURNALISM</span>
                    <span className="px-2 py-0.5 rounded bg-[#C24B3F]/10 border border-[#C24B3F]/30 text-[10px]">
                      2,800 WORDS // 12 MIN READ
                    </span>
                  </div>
                  <div className="space-y-2.5 text-[#555C6E] leading-relaxed select-none">
                    <p className="blur-[1px]">
                      "In an era where digital transformation continues to accelerate across global enterprise ecosystems, visionary leaders are increasingly turning to next-generation paradigms to unlock previously unimaginable efficiencies..."
                    </p>
                    <p className="blur-[1.5px]">
                      "'We are thrilled to embark on this monumental journey with our esteemed partners,' remarked the CEO in a prepared statement that took three PR agencies 4 weeks to draft without saying anything..."
                    </p>
                    <p className="blur-[2px]">
                      "The funding round, whose exact terms, post-money valuation, and liquidation preferences remain undisclosed to readers, will be used to aggressively hire across sales and marketing..."
                    </p>
                  </div>
                  <div className="pt-2 text-[10px] text-[#C24B3F] font-bold">
                    RESULT: 12 minutes wasted. Zero actionable venture numbers.
                  </div>
                </div>

                {/* Right: Venture Atlas Signal Wire */}
                <div className="p-6 rounded-2xl border-2 border-[#0066FF] bg-[#0B0E14] space-y-4 shadow-[0_0_40px_rgba(0,102,255,0.15)] relative">
                  <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-[#0066FF] text-white text-[10px] font-bold tracking-wider uppercase">
                    VENTURE ATLAS STANDARD
                  </div>
                  <div className="flex items-center justify-between text-[#0066FF] pb-2 border-b border-[#1E232F]">
                    <span className="font-bold uppercase">INSTITUTIONAL SIGNAL BRIEF</span>
                    <span className="px-2 py-0.5 rounded bg-[#0066FF]/10 border border-[#0066FF]/30 text-[10px] text-white">
                      60 WORDS // 20 SECONDS
                    </span>
                  </div>
                  <div className="space-y-3 font-body text-sm text-[#E6E8EC] leading-relaxed">
                    <p>
                      <strong className="text-white font-semibold">Mercor closed $32M Series A at $250M valuation</strong> led by Benchmark’s Peter Fenton. Run-rate crossed $50M from automated engineer placement. Syndicate took 12.8% equity; zero venture debt. Capital funds sovereign compute clusters for multimodal technical vetting.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#1E232F] grid grid-cols-3 gap-2 font-mono text-[11px]">
                    <div className="p-2 rounded bg-[#07090D] border border-[#1E232F] text-center">
                      <span className="text-[#555C6E] block text-[9px]">VALUATION</span>
                      <strong className="text-[#D9A441]">$250M</strong>
                    </div>
                    <div className="p-2 rounded bg-[#07090D] border border-[#1E232F] text-center">
                      <span className="text-[#555C6E] block text-[9px]">DILUTION</span>
                      <strong className="text-white">12.8%</strong>
                    </div>
                    <div className="p-2 rounded bg-[#07090D] border border-[#1E232F] text-center">
                      <span className="text-[#555C6E] block text-[9px]">EFFICIENCY</span>
                      <strong className="text-[#2FA8A0]">36x</strong>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Global Capital Flow Telemetry & 3D Globe */}
            <div className="rounded-2xl border border-[#1E232F] bg-[#0B0E14] p-10 space-y-8">
              <div className="text-center space-y-2 max-w-2xl mx-auto">
                <div className="font-mono text-[10px] text-[#2FA8A0] uppercase tracking-wider flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#2FA8A0] animate-pulse" />
                  <span>GLOBAL CAPITAL TELEMETRY RADAR</span>
                </div>
                <h3 className="font-fraunces text-3xl text-white font-normal">
                  Continuous venture deployment across primary innovation corridors
                </h3>
                <p className="text-sm text-[#8C93A3] font-body">
                  Select a global node to inspect 24-hour venture capital liquidity and transaction velocity.
                </p>
              </div>

              <TelemetryGlobe activeCoords={selectedHubCoords} />

              <div className="grid grid-cols-5 gap-3 font-mono text-xs max-w-4xl mx-auto">
                {GLOBAL_HUBS.map(hub => {
                  const isActive = hub.coords[0] === selectedHubCoords[0];
                  return (
                    <button
                      key={hub.city}
                      type="button"
                      onClick={() => setSelectedHubCoords(hub.coords as [number, number])}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        isActive
                          ? 'border-[#0066FF] bg-[#0066FF]/10 text-white font-bold shadow-md'
                          : 'border-[#1E232F] bg-[#07090D] text-[#8C93A3] hover:border-[#2A2F3A] hover:text-white'
                      }`}
                    >
                      <div className="font-bold text-white text-xs">{hub.city}</div>
                      <div className="text-[10px] text-[#D9A441] mt-1">{hub.volume24h} 24h</div>
                      <div className="text-[9px] text-[#555C6E] mt-0.5">{hub.deals} Active Deals</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* The 5 Dedicated Intelligence Desks */}
            <div className="space-y-6">
              <div className="text-center space-y-1 max-w-xl mx-auto">
                <div className="font-mono text-xs text-[#D9A441] uppercase tracking-widest">
                  CONTINUOUS COVERAGE INFRASTRUCTURE
                </div>
                <h3 className="font-fraunces text-3xl text-white font-normal">
                  Five Specialized Desks. Zero Noise.
                </h3>
              </div>

              <div className="grid grid-cols-5 gap-4 font-mono text-xs">
                <div className="p-4 rounded-xl border border-[#1E232F] bg-[#0B0E14] space-y-2">
                  <div className="text-[#D9A441] font-bold text-sm flex items-center gap-1.5">
                    <span>🦄</span>
                    <span>UNICORNS</span>
                  </div>
                  <p className="text-[#8C93A3] text-[11px] font-body leading-relaxed">
                    Valuations exceeding $1B, secondary tender offers, pre-IPO filings, and cap table reorganizations.
                  </p>
                  <div className="pt-2 text-[10px] text-[#555C6E] border-t border-[#1E232F]">
                    AVG CLEARANCE: 1.1 MIN
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-[#1E232F] bg-[#0B0E14] space-y-2">
                  <div className="text-[#0066FF] font-bold text-sm flex items-center gap-1.5">
                    <span>🤖</span>
                    <span>AI SILICON</span>
                  </div>
                  <p className="text-[#8C93A3] text-[11px] font-body leading-relaxed">
                    Inference economics, cluster energy footprint, sovereign model weights, and custom chip benchmarks.
                  </p>
                  <div className="pt-2 text-[10px] text-[#555C6E] border-t border-[#1E232F]">
                    AVG CLEARANCE: 1.3 MIN
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-[#1E232F] bg-[#0B0E14] space-y-2">
                  <div className="text-[#C24B3F] font-bold text-sm flex items-center gap-1.5">
                    <span>📉</span>
                    <span>FAILURES</span>
                  </div>
                  <p className="text-[#8C93A3] text-[11px] font-body leading-relaxed">
                    Unspared post-mortems of startups burning $50M+, covenant defaults, and liquidation auction prices.
                  </p>
                  <div className="pt-2 text-[10px] text-[#555C6E] border-t border-[#1E232F]">
                    AVG CLEARANCE: 1.4 MIN
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-[#1E232F] bg-[#0B0E14] space-y-2">
                  <div className="text-[#2FA8A0] font-bold text-sm flex items-center gap-1.5">
                    <span>💼</span>
                    <span>FINANCE & LPS</span>
                  </div>
                  <p className="text-[#8C93A3] text-[11px] font-body leading-relaxed">
                    Fund vintages, LP liquidity demands, DPI realities, capital call defaults, and GP carried interest shifts.
                  </p>
                  <div className="pt-2 text-[10px] text-[#555C6E] border-t border-[#1E232F]">
                    AVG CLEARANCE: 0.9 MIN
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-[#1E232F] bg-[#0B0E14] space-y-2">
                  <div className="text-[#10B981] font-bold text-sm flex items-center gap-1.5">
                    <span>🌱</span>
                    <span>SEED RADAR</span>
                  </div>
                  <p className="text-[#8C93A3] text-[11px] font-body leading-relaxed">
                    Stealth departures from tier-1 labs, pre-seed term sheet multiples, and angel syndicate cap tables.
                  </p>
                  <div className="pt-2 text-[10px] text-[#555C6E] border-t border-[#1E232F]">
                    AVG CLEARANCE: 1.0 MIN
                  </div>
                </div>
              </div>
            </div>

            {/* Reader Cohort & Verification Quotes */}
            <div className="space-y-6 pt-4">
              <div className="font-mono text-center text-xs text-[#555C6E] uppercase tracking-widest">
                DAILY VERDICT // READ BY GENERAL PARTNERS & TECHNICAL OPERATORS
              </div>

              <div className="grid grid-cols-3 gap-6 font-mono">
                <div className="p-6 rounded-xl border border-[#1E232F] bg-[#0B0E14] space-y-3">
                  <p className="text-xs text-[#A6ADB8] font-body leading-relaxed">
                    "Traditional tech journalism is 90% PR boilerplate. Venture Atlas is the first wire where I can clear 20 funding events before my first 9 AM partner meeting."
                  </p>
                  <div className="pt-3 border-t border-[#1E232F] text-[11px] text-[#555C6E] flex justify-between">
                    <span className="text-white font-bold">Partner, Series A Fund</span>
                    <span>Bengaluru</span>
                  </div>
                </div>

                <div className="p-6 rounded-xl border border-[#1E232F] bg-[#0B0E14] space-y-3">
                  <p className="text-xs text-[#A6ADB8] font-body leading-relaxed">
                    "The 60-word constraint forces the analyst to report only what matters: post-money valuation, dilution, and real technical bottlenecks. Invaluable."
                  </p>
                  <div className="pt-3 border-t border-[#1E232F] text-[11px] text-[#555C6E] flex justify-between">
                    <span className="text-white font-bold">Co-Founder & CTO</span>
                    <span>San Francisco</span>
                  </div>
                </div>

                <div className="p-6 rounded-xl border border-[#1E232F] bg-[#0B0E14] space-y-3">
                  <p className="text-xs text-[#A6ADB8] font-body leading-relaxed">
                    "The failure teardowns alone are worth reading every morning. Seeing why a $70M startup burned through capital without sugarcoating saves months of trial."
                  </p>
                  <div className="pt-3 border-t border-[#1E232F] text-[11px] text-[#555C6E] flex justify-between">
                    <span className="text-white font-bold">VP Product</span>
                    <span>London</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Clearance Terminal */}
            <div className="max-w-3xl mx-auto text-center space-y-6 pt-6">
              <div className="p-12 rounded-2xl border border-[#2A2F3A] bg-[#0B0E14] space-y-4 shadow-2xl">
                <div className="font-mono text-xs text-[#D9A441] uppercase tracking-wider">
                  IMMEDIATE WIRE CLEARANCE
                </div>
                <h2 className="font-fraunces text-4xl text-white font-normal leading-tight">
                  Stop scrolling 3,000-word fluff pieces.
                </h2>
                <p className="text-sm text-[#8C93A3] font-body max-w-lg mx-auto">
                  Get the institutional 60-word dispatches and venture telemetry read by founders, VCs, and operators across 5 global hubs.
                </p>

                <div className="pt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-8 py-3.5 rounded-full bg-white hover:bg-neutral-200 text-neutral-950 font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer"
                  >
                    Enter Your Email at the Top Terminal
                  </button>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Desktop Footer */}
        <footer className="border-t border-[#1E232F] bg-[#07090D] py-10 px-4 sm:px-6 font-mono text-xs text-[#555C6E] select-none">
          <div className="max-w-7xl mx-auto flex flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-left">
              <div className="flex items-center gap-2">
                <span className="font-fraunces text-base text-white font-bold">Venture Atlas</span>
                <span>//</span>
                <span className="text-[#8C93A3]">VENTUREATLAS.IN</span>
              </div>
              <div className="text-[10px]">
                ENGINEERED FOR FOUNDERS & VENTURE CAPITAL • 60-WORD DISPATCH CEILING
              </div>
            </div>

            <div className="flex items-center gap-6 text-[11px]">
              <Link href="/feed.xml" className="hover:text-white transition-colors">
                RSS WIRE
              </Link>
              <Link href="/sitemap.xml" className="hover:text-white transition-colors">
                SITEMAP
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors">
                PRIVACY
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                TERMS
              </Link>
              <Link href="/admin/login" className="text-[#D9A441] hover:underline">
                STAFF TERMINAL
              </Link>
            </div>
          </div>
        </footer>

      </div>

    </div>
  );
};
