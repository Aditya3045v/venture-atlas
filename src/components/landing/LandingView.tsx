'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import createGlobe from 'cobe';
import { useToast } from '../providers/ToastProvider';
import {
  Mail,
  AtSign,
  Check,
  ArrowRight,
  ChevronLeft,
  Radio,
  Volume2,
  VolumeX,
  Sparkles,
  TrendingUp,
  Layers,
  Globe as GlobeIcon,
  Compass,
  Zap,
  ShieldCheck,
} from 'lucide-react';

// ==========================================
// 1. DATA: DESK & INTEREST SELECTION CHIPS
// ==========================================
interface InterestOption {
  id: string;
  label: string;
  desc: string;
  emoji: string;
  color: string;
}

const INTEREST_OPTIONS: InterestOption[] = [
  {
    id: 'unicorns',
    label: 'Unicorns & Growth',
    desc: '$100M+ rounds, valuations & IPOs',
    emoji: '🦄',
    color: '#D9A441',
  },
  {
    id: 'ai-deeptech',
    label: 'AI & DeepTech',
    desc: 'Inference silicon & models',
    emoji: '🤖',
    color: '#0066FF',
  },
  {
    id: 'failures',
    label: 'Failures & Teardowns',
    desc: 'Burn rate spikes & post-mortems',
    emoji: '📉',
    color: '#C24B3F',
  },
  {
    id: 'finance',
    label: 'Venture Finance',
    desc: 'LP returns, dry powder & funds',
    emoji: '💼',
    color: '#2FA8A0',
  },
  {
    id: 'crypto',
    label: 'Crypto & Fast EVMs',
    desc: 'Parallel execution & rails',
    emoji: '🌐',
    color: '#8B5CF6',
  },
  {
    id: 'seed-radar',
    label: 'Seed & Early Radar',
    desc: 'Stealth founders & pre-seed deals',
    emoji: '🌱',
    color: '#10B981',
  },
  {
    id: 'saas-metrics',
    label: 'SaaS & B2B Growth',
    desc: 'Unit economics, CAC & NRR',
    emoji: '📊',
    color: '#F59E0B',
  },
  {
    id: 'operators',
    label: 'Operator Playbooks',
    desc: 'Bootstrapped scale & execution',
    emoji: '🚀',
    color: '#EC4899',
  },
];

const TICKER_ITEMS = [
  { desk: 'UNICORN', text: 'Cargofolio closes $22M Series B at $180M valuation (Elevation)', change: '+100%' },
  { desk: 'FINANCE', text: 'Veloce secures $45M Series C from Index Ventures across 42 FX corridors', change: '+38%' },
  { desk: 'FAILURE', text: 'Protean Dynamics enters administration after $70M burn cycle stall', change: '-100%', down: true },
  { desk: 'CRYPTO', text: 'Monad parallel EVM mainnet testbed hits 9,840 verified TPS at 1s finality', change: '+24%' },
  { desk: 'SEED', text: 'Kavach Labs raises $4.2M seed for sovereign inference clusters in Pune', change: 'NEW' },
];

const GLOBAL_HUBS = [
  { city: 'BENGALURU', region: 'India / SEA', coords: [12.9716, 77.5946], volume24h: '$4.8B', activeDeals: 14 },
  { city: 'SAN FRANCISCO', region: 'North America', coords: [37.7749, -122.4194], volume24h: '$14.2B', activeDeals: 42 },
  { city: 'LONDON', region: 'Europe', coords: [51.5074, -0.1278], volume24h: '$6.1B', activeDeals: 19 },
  { city: 'SINGAPORE', region: 'APAC Rails', coords: [1.3521, 103.8198], volume24h: '$3.2B', activeDeals: 11 },
  { city: 'NEW YORK', region: 'North America', coords: [40.7128, -74.0060], volume24h: '$9.4B', activeDeals: 28 },
];

// ==========================================
// 2. WEBGL TELEMETRY GLOBE
// ==========================================
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
    <div className="relative aspect-square w-full max-w-[360px] mx-auto select-none">
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
            setR(delta / 180);
          }
        }}
      />
    </div>
  );
}

// ==========================================
// 3. MAIN LANDING VIEW WITH ONBOARDING FLOW
// ==========================================
export const LandingView: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();

  // State Management
  const [step, setStep] = useState<'email' | 'interests'>('email');
  const [email, setEmail] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'unicorns',
    'ai-deeptech',
    'finance',
    'seed-radar',
  ]);
  const [loading, setLoading] = useState(false);
  const [isZooping, setIsZooping] = useState(false);
  const [selectedHubCoords, setSelectedHubCoords] = useState<[number, number]>([12.9716, 77.5946]);

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedInterests.length === INTEREST_OPTIONS.length) {
      setSelectedInterests([]);
    } else {
      setSelectedInterests(INTEREST_OPTIONS.map(i => i.id));
    }
  };

  // Step 1: Validate Email and move to Interests
  const handleContinueToInterests = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@') || !email.includes('.')) {
      toast('Please enter a valid email address to proceed', 'error');
      return;
    }
    setStep('interests');
  };

  // Step 2: Submit and execute smooth soft blur & zoop transition
  const handleCompleteOnboarding = async () => {
    if (!email) {
      setStep('email');
      return;
    }

    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const res = await fetch('/api/reader/enter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizedEmail,
          source: 'LANDING_ONBOARDING',
          interests: selectedInterests,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        // Save local preferences
        try {
          localStorage.setItem('va_reader_email', normalizedEmail);
          localStorage.setItem('va_reader_interests', JSON.stringify(selectedInterests));
          if (data.token) {
            localStorage.setItem('va_reader_token', data.token);
            document.cookie = `va_reader=${data.token}; path=/; max-age=31536000; SameSite=Lax`;
          }
          document.cookie = `va_reader_client=1; path=/; max-age=31536000; SameSite=Lax`;
        } catch {}

        // Trigger the requested soft blur + zoop animation
        setIsZooping(true);

        setTimeout(() => {
          window.location.href = '/';
        }, 750);
      } else {
        toast(data.error || 'Failed to authenticate reader clearance', 'error');
        setLoading(false);
      }
    } catch {
      toast('Network error during clearance. Please retry.', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-[#E6E8EC] font-body selection:bg-[#0066FF] selection:text-white relative overflow-x-hidden">

      {/* ========================================================
          ZOOP & SOFT BLUR TRANSITION OVERLAY
          Triggers smoothly when user completes login
          ======================================================== */}
      {isZooping && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0B0E14]/70 backdrop-blur-2xl transition-all duration-700 ease-out animate-fadeIn">
          <div className="text-center space-y-4 transform scale-105 animate-pulse">
            <div className="w-16 h-16 rounded-full bg-[#0066FF]/20 border border-[#0066FF]/40 flex items-center justify-center text-[#0066FF] mx-auto shadow-2xl">
              <Sparkles size={28} className="animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="font-fraunces text-2xl sm:text-3xl text-white font-normal">
                Entering Venture Atlas Feed
              </h3>
              <p className="font-mono text-xs text-[#8C93A3] uppercase tracking-wider">
                Tuning 60-word briefs for {selectedInterests.length} selected desks...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Physical Ticker Strip */}
      <div className="w-full bg-[#07090D] border-b border-[#2A2F3A] overflow-hidden py-1.5 px-4 select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0 font-mono text-[10px] uppercase tracking-wider text-[#2FA8A0]">
            <span className="w-2 h-2 rounded-full bg-[#2FA8A0] animate-pulse" />
            <span className="font-bold">LIVE WIRE</span>
            <span className="text-[#2A2F3A]">|</span>
            <span className="text-[#8C93A3]">14:02 IST</span>
          </div>

          <div className="overflow-hidden whitespace-nowrap flex-1 mx-4">
            <div className="animate-ticker font-mono text-[11px] text-[#8C93A3] flex items-center gap-8">
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

          <Link href="/admin/login" className="hidden sm:block font-mono text-[10px] text-[#555C6E] hover:text-[#D9A441] transition-colors">
            STAFF GATE
          </Link>
        </div>
      </div>

      {/* ========================================================
          HERO ONBOARDING CARD CONTAINER (MATCHING IMAGE REFERENCE)
          Top half: Illustrated vibrant scene
          Bottom half: White overlapping rounded card with email & interests
          ======================================================== */}
      <div className={`w-full max-w-md mx-auto px-4 py-6 sm:py-10 transition-all duration-700 ${isZooping ? 'scale-110 blur-md opacity-40' : 'scale-100 blur-0 opacity-100'}`}>

        {/* Outer App Frame matching reference image design */}
        <div className="w-full rounded-[36px] overflow-hidden border border-[#2A2F3A] bg-[#07090D] shadow-[0_20px_60px_rgba(0,0,0,0.6)] flex flex-col">

          {/* TOP HALF: Colorful Venture Hubs & Founders Scene */}
          <div className="relative w-full h-64 sm:h-72 overflow-hidden bg-[#0A1128]">
            <img
              src="/onboarding-hero.jpg"
              alt="Venture Atlas Tech Founders and Market Activity"
              className="w-full h-full object-cover object-center"
            />
            {/* Subtle gradient vignette to blend into card */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

            {/* Top Bar Indicators (iOS battery / wifi vibe) */}
            <div className="absolute top-4 left-6 right-6 flex items-center justify-between text-white/90 text-xs font-mono select-none drop-shadow-md">
              <span className="font-bold">9:41</span>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-[10px] font-bold text-[#D9A441]">
                  60-WORD DISPATCHES
                </span>
              </div>
            </div>
          </div>

          {/* BOTTOM HALF: Crisp High-Contrast White Sheet Card */}
          <div className="bg-white text-neutral-900 -mt-8 rounded-t-[36px] p-6 sm:p-8 relative z-10 flex flex-col justify-between shadow-2xl transition-all duration-300">

            {/* ----------------------------------------------------
                STEP 1: EMAIL-ONLY LOGIN (NO PASSWORD NEEDED)
                ---------------------------------------------------- */}
            {step === 'email' && (
              <form onSubmit={handleContinueToInterests} className="space-y-5 animate-fadeIn">
                {/* Headline: "Serve, Score, Connect in your Pocket" style */}
                <div className="text-center space-y-1.5 pt-1">
                  <h1 className="text-2xl sm:text-[28px] font-black font-display tracking-tight text-neutral-900 leading-tight">
                    Speed, <span className="text-[#0066FF]">Rigor</span>, Intelligence in your Pocket
                  </h1>
                  <p className="text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed">
                    Institutional startup briefs & funding radar in 60 words. No password needed.
                  </p>
                </div>

                {/* Input Container: matching "I live in" container in image reference */}
                <div className="space-y-1.5 pt-2">
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-neutral-100/80 hover:bg-neutral-100 border border-neutral-200/80 transition-all flex items-center gap-3.5 focus-within:ring-2 focus-within:ring-[#0066FF]/30 focus-within:border-[#0066FF] focus-within:bg-white">
                    {/* Circle Icon Badge */}
                    <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 shadow-xs flex items-center justify-center shrink-0 text-[#0066FF]">
                      <AtSign size={19} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <label htmlFor="user-email-input" className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                        Reader Email
                      </label>
                      <input
                        id="user-email-input"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="founder@venture.io"
                        required
                        autoFocus
                        className="w-full bg-transparent text-sm sm:text-base font-semibold text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Black Pill Continue Button */}
                <button
                  type="submit"
                  className="w-full py-4 rounded-full bg-neutral-950 hover:bg-neutral-800 active:scale-[0.98] text-white font-bold text-sm tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight size={16} />
                </button>

                <div className="text-center pt-1">
                  <span className="text-[11px] text-neutral-400 font-mono">
                    Instant access gate • Zero spam • Unlocks live wire
                  </span>
                </div>
              </form>
            )}

            {/* ----------------------------------------------------
                STEP 2: OPTIONS OF THEIR INTERESTS
                ---------------------------------------------------- */}
            {step === 'interests' && (
              <div className="space-y-5 animate-fadeIn">
                {/* Back button & title */}
                <div className="space-y-1 text-center relative pt-1">
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="absolute left-0 top-1 p-1 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                    title="Back to email"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <h2 className="text-2xl sm:text-[26px] font-black font-display tracking-tight text-neutral-900 leading-tight">
                    Choose your <span className="text-[#0066FF]">Interests</span>
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Select the desks & sectors you track daily
                  </p>
                </div>

                {/* Selectable Interest Chips Grid */}
                <div className="grid grid-cols-2 gap-2 max-h-[260px] overflow-y-auto no-scrollbar pr-0.5 pt-1">
                  {INTEREST_OPTIONS.map((opt) => {
                    const isSelected = selectedInterests.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggleInterest(opt.id)}
                        className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-2.5 active:scale-95 ${
                          isSelected
                            ? 'border-[#0066FF] bg-[#0066FF]/5 text-neutral-900 ring-2 ring-[#0066FF]/20 shadow-xs'
                            : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100/80'
                        }`}
                      >
                        <span className="text-xl shrink-0 mt-0.5">{opt.emoji}</span>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs leading-snug flex items-center justify-between">
                            <span className="truncate">{opt.label}</span>
                            {isSelected && (
                              <Check size={13} className="text-[#0066FF] shrink-0 ml-1" />
                            )}
                          </div>
                          <div className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5">
                            {opt.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Select all & count */}
                <div className="flex items-center justify-between text-xs font-mono px-1">
                  <span className="text-neutral-500">
                    <strong className="text-[#0066FF]">{selectedInterests.length}</strong> desks selected
                  </span>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-[#0066FF] hover:underline font-bold text-[11px]"
                  >
                    {selectedInterests.length === INTEREST_OPTIONS.length ? 'Clear' : 'Select all 8'}
                  </button>
                </div>

                {/* Black Pill Enter Feed Button */}
                <button
                  type="button"
                  onClick={handleCompleteOnboarding}
                  disabled={loading}
                  className="w-full py-4 rounded-full bg-neutral-950 hover:bg-neutral-800 active:scale-[0.98] text-white font-bold text-sm tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{loading ? 'Authenticating...' : 'Enter Feed'}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ========================================================
          ADDITIONAL INTEL SECTIONS: PROOF STRIP & GLOBE
          Visible when scrolling down on landing page
          ======================================================== */}
      <section className="border-t border-[#2A2F3A] bg-[#07090D] py-8 px-4 sm:px-6 mt-6 select-none">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
          <div className="p-3 border border-[#2A2F3A] bg-[#0B0E14] space-y-1">
            <div className="text-2xl font-bold text-[#E6E8EC]">60 WORDS</div>
            <div className="text-[10px] text-[#555C6E] uppercase">Strict ceiling</div>
          </div>
          <div className="p-3 border border-[#2A2F3A] bg-[#0B0E14] space-y-1">
            <div className="text-2xl font-bold text-[#0066FF]">1.2 MIN</div>
            <div className="text-[10px] text-[#555C6E] uppercase">Average clearance</div>
          </div>
          <div className="p-3 border border-[#2A2F3A] bg-[#0B0E14] space-y-1">
            <div className="text-2xl font-bold text-[#D9A441]">5 DESKS</div>
            <div className="text-[10px] text-[#555C6E] uppercase">Continuous wire</div>
          </div>
          <div className="p-3 border border-[#2A2F3A] bg-[#0B0E14] space-y-1">
            <div className="text-2xl font-bold text-[#2FA8A0]">0 FLUFF</div>
            <div className="text-[10px] text-[#555C6E] uppercase">No sponsored PR</div>
          </div>
        </div>
      </section>

      {/* Global Telemetry Globe Section */}
      <section className="max-w-4xl mx-auto px-4 py-10">
        <div className="border border-[#2A2F3A] bg-[#07090D] p-6 sm:p-8">
          <div className="text-center space-y-1 mb-6">
            <div className="font-mono text-[10px] text-[#2FA8A0] uppercase tracking-wider flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#2FA8A0] animate-pulse" />
              <span>GLOBAL VENTURE ACTIVITY RADAR</span>
            </div>
            <h3 className="font-fraunces text-2xl text-[#E6E8EC] font-normal">
              Tracking venture capital deployment across tier-1 hubs
            </h3>
          </div>

          <TelemetryGlobe activeCoords={selectedHubCoords} />

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs">
            {GLOBAL_HUBS.map(hub => (
              <button
                key={hub.city}
                type="button"
                onClick={() => setSelectedHubCoords(hub.coords as [number, number])}
                className={`p-2.5 border text-center transition-all ${
                  hub.coords[0] === selectedHubCoords[0]
                    ? 'border-[#0066FF] bg-[#0B0E14] text-white font-bold'
                    : 'border-[#2A2F3A] text-[#8C93A3] hover:text-white'
                }`}
              >
                <div>{hub.city}</div>
                <div className="text-[10px] text-[#D9A441] mt-0.5">{hub.volume24h}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2A2F3A] bg-[#07090D] py-8 px-4 font-mono text-xs text-[#555C6E] text-center space-y-2">
        <div>VENTURE ATLAS • REAL-TIME 60-WORD STARTUP WIRE</div>
        <div className="text-[10px]">BENGALURU • SAN FRANCISCO • LONDON • SINGAPORE</div>
      </footer>

    </div>
  );
};
