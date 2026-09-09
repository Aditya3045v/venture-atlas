'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import createGlobe from 'cobe';
import { useToast } from '../providers/ToastProvider';
import {
  Volume2,
  VolumeX,
  Radio,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Compass,
  Layers,
  Terminal,
  ExternalLink,
  ChevronRight,
  Activity,
  Zap,
} from 'lucide-react';

// ==========================================
// 1. DATA FIXTURES (REALISTIC DISPATCHES)
// ==========================================
interface DispatchBrief {
  id: string;
  desk: string;
  deskCode: string;
  badgeColor: string;
  headline: string;
  slug: string;
  source: string;
  timestamp: string;
  wordCount: number;
  readTime: string;
  body: string;
  metrics: {
    label: string;
    value: string;
    sub?: string;
  }[];
}

const FEATURED_BRIEFS: DispatchBrief[] = [
  {
    id: 'disp-01',
    desk: 'UNICORNS & GROWTH',
    deskCode: 'DESK.01',
    badgeColor: 'text-[#D9A441] border-[#D9A441]/30 bg-[#D9A441]/10',
    headline: 'Cargofolio Closes $22M Series B for Tier-2 Warehouse Robotics',
    slug: 'cargofolio-closes-22m-series-b',
    source: 'Atlas Wire // Bengaluru',
    timestamp: '14:02 IST',
    wordCount: 52,
    readTime: '0.9 MIN',
    body: 'Bengaluru logistics-AI startup Cargofolio closes a $22M Series B led by Elevation, doubling its valuation to $180M as e-commerce sellers push for same-day delivery outside metro hubs. The round funds a warehouse-robotics push into tier-2 cities, deploying automated sorting arms across 40 fulfillment centers.',
    metrics: [
      { label: 'VALUATION', value: '$180M', sub: '2.0x Step-up' },
      { label: 'ROUND SIZE', value: '$22M', sub: 'Series B' },
      { label: 'LEAD INVESTOR', value: 'Elevation', sub: 'Growth Fund' },
      { label: 'DEPLOYMENT', value: '40 Hubs', sub: 'Tier-2 Expan.' },
    ],
  },
  {
    id: 'disp-02',
    desk: 'VENTURE FINANCE',
    deskCode: 'DESK.02',
    badgeColor: 'text-[#2FA8A0] border-[#2FA8A0]/30 bg-[#2FA8A0]/10',
    headline: 'Veloce Network Secures $45M Series C for Cross-Border Treasury',
    slug: 'veloce-secures-45m-series-c',
    source: 'Atlas Wire // London',
    timestamp: '08:30 GMT',
    wordCount: 54,
    readTime: '1.0 MIN',
    body: 'London cross-border treasury network Veloce secures $45M Series C from Index Ventures at an $820M post-money cap. The platform automates multi-currency liquidity corridors for mid-market software exporters, bypassing correspondent banking rails with real-time gross settlement across 42 currency corridors with sub-4bp transaction friction.',
    metrics: [
      { label: 'POST-MONEY', value: '$820M', sub: 'Series C Cap' },
      { label: 'ROUND SIZE', value: '$45M', sub: 'Primary Equity' },
      { label: 'CORRIDORS', value: '42 FX', sub: 'Gross Settled' },
      { label: 'SPREAD', value: '< 4 bps', sub: 'vs 120bps Bank' },
    ],
  },
  {
    id: 'disp-03',
    desk: 'FAILURES & WRITEDOWNS',
    deskCode: 'DESK.03',
    badgeColor: 'text-[#C24B3F] border-[#C24B3F]/30 bg-[#C24B3F]/10',
    headline: 'Protean Dynamics Enters Administration Following $70M Burn',
    slug: 'protean-dynamics-enters-administration',
    source: 'Atlas Wire // Boston',
    timestamp: '10:15 EST',
    wordCount: 55,
    readTime: '1.1 MIN',
    body: 'Synthetic biology pioneer Protean Dynamics enters voluntary administration after a $70M burn cycle failed to yield commercial-grade enzyme yields. Board disputes over commercialization timelines stalled a critical bridge round, leaving 140 staff redundant and foundational bioreactor patents bound for an intellectual property liquidation auction.',
    metrics: [
      { label: 'CAP DEPLOYED', value: '$70M', sub: 'Total Loss' },
      { label: 'DISPOSITION', value: 'Auction', sub: 'Ch. 7 Equiv.' },
      { label: 'HEADCOUNT', value: '140 cut', sub: '100% Workforce' },
      { label: 'PEAK VALUE', value: '$340M', sub: '2023 Series B' },
    ],
  },
];

const TICKER_ITEMS = [
  { desk: 'UNICORN', text: 'Cargofolio closes $22M Series B at $180M valuation (Elevation)', change: '+100%' },
  { desk: 'FINANCE', text: 'Veloce secures $45M Series C from Index Ventures across 42 FX corridors', change: '+38%' },
  { desk: 'FAILURE', text: 'Protean Dynamics enters administration after $70M burn cycle stall', change: '-100%', down: true },
  { desk: 'CRYPTO', text: 'Monad parallel EVM mainnet testbed hits 9,840 verified TPS at 1s finality', change: '+24%' },
  { desk: 'SEED', text: 'Kavach Labs raises $4.2M seed for sovereign inference clusters in Pune', change: 'NEW' },
  { desk: 'FINANCE', text: 'Sequoia India-SEA distributions hit $1.4B over past 18 months via secondaries', change: '+14%' },
];

const GLOBAL_HUBS = [
  { city: 'BENGALURU', region: 'India / SEA', coords: [12.9716, 77.5946], volume24h: '$4.8B', activeDeals: 14, focus: 'Deeptech & Vertical AI' },
  { city: 'SAN FRANCISCO', region: 'North America', coords: [37.7749, -122.4194], volume24h: '$14.2B', activeDeals: 42, focus: 'Foundation Models & Infra' },
  { city: 'LONDON', region: 'Europe', coords: [51.5074, -0.1278], volume24h: '$6.1B', activeDeals: 19, focus: 'Cross-Border Fintech & Climate' },
  { city: 'SINGAPORE', region: 'APAC Rails', coords: [1.3521, 103.8198], volume24h: '$3.2B', activeDeals: 11, focus: 'Trade Rails & Web3' },
  { city: 'NEW YORK', region: 'North America', coords: [40.7128, -74.0060], volume24h: '$9.4B', activeDeals: 28, focus: 'B2B SaaS & Liquidity' },
];

const DESK_CHANNELS = [
  {
    num: '01',
    name: 'Unicorns & Mega-Rounds',
    focus: 'Valuation markups, sovereign wealth deployments, secondary liquidity discounts.',
    sampleStat: '$180M Avg. Cap',
    recentTitle: 'Cargofolio doubles post-money to $180M on tier-2 robotics surge',
    badge: 'UNICORN DESK',
  },
  {
    num: '02',
    name: 'Failures & Teardowns',
    focus: 'Burn rate spikes, liquidation auctions, cap table wipeouts, forensic post-mortems.',
    sampleStat: '$70M Capital Lost',
    recentTitle: 'Protean Dynamics: How $70M in bioreactor burn failed at the bridge',
    badge: 'FAILURE DESK',
  },
  {
    num: '03',
    name: 'Venture Finance & Funds',
    focus: 'Dry powder drawdowns, LP distributions, carry structures, GP hurdle benchmarks.',
    sampleStat: '42 FX Rails',
    recentTitle: 'Veloce secures $45M Series C to bypass correspondent bank latency',
    badge: 'FINANCE DESK',
  },
  {
    num: '04',
    name: 'Decentralized Rails',
    focus: 'Parallel execution virtual machines, protocol fee capture, validator economics.',
    sampleStat: '9.8k Real TPS',
    recentTitle: 'Monad testbed reaches sub-second block finality under 10k TPS load',
    badge: 'CRYPTO DESK',
  },
  {
    num: '05',
    name: 'Seed Radar & Spinouts',
    focus: 'Pre-announcement founder velocity, AI lab spinouts, technical angel syndicates.',
    sampleStat: '$4.2M Seed Avg',
    recentTitle: 'Kavach Labs emerges from stealth with sovereign inference silicon',
    badge: 'SEED DESK',
  },
];

// ==========================================
// 2. WEBGL TELEMETRY GLOBE COMPONENT
// ==========================================
function TelemetryGlobe({
  activeCoords,
  onSelectHub,
}: {
  activeCoords: [number, number];
  onSelectHub: (coords: [number, number]) => void;
}) {
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
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
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
        baseColor: [11 / 255, 14 / 255, 20 / 255], // #0B0E14 Ink
        markerColor: [217 / 255, 164 / 255, 65 / 255], // #D9A441 Brass
        glowColor: [47 / 255, 168 / 255, 160 / 255], // #2FA8A0 Signal Teal
        markers: GLOBAL_HUBS.map(h => ({
          location: h.coords as [number, number],
          size: h.coords[0] === activeCoords[0] ? 0.12 : 0.07,
        })),
        onRender: (state: Record<string, any>) => {
          if (!pointerInteracting.current && !prefersReducedMotion) {
            phi += 0.0028;
          }
          state.phi = phi + r;
          state.width = width * 2;
          state.height = width * 2;
        },
      } as any);

      setTimeout(() => {
        if (canvasRef.current) {
          canvasRef.current.style.opacity = '1';
        }
      }, 150);
    }

    return () => {
      if (globeInstance) globeInstance.destroy();
      window.removeEventListener('resize', onResize);
    };
  }, [activeCoords, r]);

  return (
    <div className="relative aspect-square w-full max-w-[420px] mx-auto select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full opacity-0 transition-opacity duration-700 cursor-grab active:cursor-grabbing"
        onPointerDown={(e) => {
          pointerInteracting.current = e.clientX - pointerInteractionMovement.current;
        }}
        onPointerUp={() => {
          pointerInteracting.current = null;
        }}
        onPointerOut={() => {
          pointerInteracting.current = null;
        }}
        onMouseMove={(e) => {
          if (pointerInteracting.current !== null) {
            const delta = e.clientX - pointerInteracting.current;
            pointerInteractionMovement.current = delta;
            setR(delta / 180);
          }
        }}
      />
      {/* Radar HUD overlay frame */}
      <div className="absolute inset-0 border border-[#2A2F3A] pointer-events-none rounded-none">
        <div className="absolute top-2 left-2 font-mono text-[9px] text-[#2FA8A0] tracking-widest uppercase">
          RADAR.ACTIVE // 24.19N
        </div>
        <div className="absolute bottom-2 right-2 font-mono text-[9px] text-[#555C6E] tracking-widest uppercase">
          LATENCY: 18MS // COBE-WEBGL
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. MAIN LANDING PAGE VIEW COMPONENT
// ==========================================
export const LandingView: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeBriefIdx, setActiveBriefIdx] = useState(0);
  const [selectedHubCoords, setSelectedHubCoords] = useState<[number, number]>([12.9716, 77.5946]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const activeBrief = FEATURED_BRIEFS[activeBriefIdx];

  // Auto-rotate briefs every 7s unless user paused by interaction
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBriefIdx((prev) => (prev + 1) % FEATURED_BRIEFS.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast('Please enter a valid work or corporate email address', 'error');
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
        try {
          localStorage.setItem('va_reader_email', normalizedEmail);
          if (data.token) {
            localStorage.setItem('va_reader_token', data.token);
            document.cookie = `va_reader=${data.token}; path=/; max-age=31536000; SameSite=Lax`;
          }
          document.cookie = `va_reader_client=1; path=/; max-age=31536000; SameSite=Lax`;
        } catch {}

        toast('Access granted: Entering Venture Atlas Wire...', 'success');
        setTimeout(() => {
          window.location.href = '/';
        }, 200);
      } else {
        toast(data.error || 'Failed to initialize reader clearance', 'error');
        setLoading(false);
      }
    } catch {
      toast('Network communication error. Please retry.', 'error');
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

  return (
    <div className="min-h-screen bg-[#0B0E14] text-[#E6E8EC] font-body selection:bg-[#D9A441] selection:text-[#0B0E14] relative">

      {/* ==========================================
          DEVICE 1: LIVE PHYSICAL TICKER TAPE (TOP)
          ========================================== */}
      <aside aria-label="Live Market Dispatches Ticker" className="w-full bg-[#07090D] border-b border-[#2A2F3A] overflow-hidden py-1.5 px-3 z-40 select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0 font-mono text-[10px] uppercase tracking-wider text-[#2FA8A0]">
            <span className="w-2 h-2 rounded-full bg-[#2FA8A0] animate-pulse" />
            <span className="font-bold">LIVE WIRE</span>
            <span className="text-[#2A2F3A]">|</span>
            <span className="text-[#8C93A3]">14:02 IST</span>
          </div>

          <div className="overflow-hidden whitespace-nowrap flex-1 mx-4 mask-fade">
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

          <div className="hidden sm:flex items-center gap-2 shrink-0 font-mono text-[10px] text-[#555C6E]">
            <span>60-WDS STRICT</span>
            <span className="text-[#2A2F3A]">|</span>
            <Link href="/admin/login" className="hover:text-[#D9A441] transition-colors">
              STAFF GATE
            </Link>
          </div>
        </div>
      </aside>

      {/* ==========================================
          MASTHEAD HEADER NAVIGATION
          ========================================== */}
      <header className="border-b border-[#2A2F3A] bg-[#0B0E14]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/landing" className="flex items-center gap-2">
              <span className="font-fraunces text-2xl font-bold tracking-tight text-[#E6E8EC]">
                Venture Atlas
              </span>
              <span className="px-1.5 py-0.5 rounded border border-[#2A2F3A] bg-[#07090D] font-mono text-[9px] font-bold text-[#D9A441] uppercase tracking-widest">
                WIRE
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 font-mono text-xs">
            <div className="hidden md:flex items-center gap-4 text-[#8C93A3]">
              <span>DESKS: <strong>5</strong></span>
              <span className="text-[#2A2F3A]">/</span>
              <span>READ CEILING: <strong>60 WDS</strong></span>
              <span className="text-[#2A2F3A]">/</span>
              <span className="text-[#2FA8A0] flex items-center gap-1">
                <Radio size={12} className="animate-pulse" />
                STREAMING
              </span>
            </div>

            <button
              onClick={focusInput}
              className="px-4 py-2 rounded bg-[#D9A441] hover:bg-[#c99534] text-[#0B0E14] font-mono font-bold text-xs uppercase tracking-wider transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#D9A441] focus:ring-offset-2 focus:ring-offset-[#0B0E14]"
            >
              Enter the feed
            </button>
          </div>
        </div>
      </header>

      {/* ==========================================
          HERO SECTION: ASYMMETRIC, LEFT-ALIGNED
          ========================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">

          {/* LEFT 7 COLS: EDITORIAL POSITIONING & INLINE GATE */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-[#2A2F3A] bg-[#07090D] font-mono text-[11px] text-[#D9A441] uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#2FA8A0] animate-pulse" />
              <span>TERMINAL DISPATCH // REAL-TIME FOUNDER INTELLIGENCE</span>
            </div>

            {/* Display Headline in Fraunces Variable Font */}
            <h1 className="font-fraunces text-4xl sm:text-5xl lg:text-[3.5rem] font-normal text-[#E6E8EC] leading-[1.06] tracking-tight">
              Institutional venture intelligence at 60-word scanning speed.
            </h1>

            {/* Tight Positioning Copy */}
            <p className="text-base sm:text-lg text-[#8C93A3] font-body max-w-2xl leading-relaxed">
              Bloomberg data rigor meets Inshorts velocity. Seed rounds, sovereign wealth deployments, burn rate spikes, and post-mortems distilled into verifiable 60-word dispatches for founders, VCs, and operators.
            </p>

            {/* Physical Proof Metric Highlights */}
            <div className="grid grid-cols-3 gap-3 py-2 max-w-xl font-mono border-y border-[#2A2F3A]">
              <div className="py-2">
                <div className="text-xs text-[#555C6E] uppercase tracking-wider">Length Constraint</div>
                <div className="text-base sm:text-lg font-bold text-[#E6E8EC] mt-0.5">Strictly 60 Words</div>
              </div>
              <div className="py-2 border-l border-[#2A2F3A] pl-3">
                <div className="text-xs text-[#555C6E] uppercase tracking-wider">Scan Velocity</div>
                <div className="text-base sm:text-lg font-bold text-[#D9A441] mt-0.5">1.2 Min Desk Pass</div>
              </div>
              <div className="py-2 border-l border-[#2A2F3A] pl-3">
                <div className="text-xs text-[#555C6E] uppercase tracking-wider">Editorial Integrity</div>
                <div className="text-base sm:text-lg font-bold text-[#2FA8A0] mt-0.5">0 Sponsored Filler</div>
              </div>
            </div>

            {/* Inline Work Email Access Gate */}
            <div className="pt-2 space-y-3">
              <div className="font-mono text-[11px] text-[#555C6E] uppercase tracking-wider">
                ACCESS CLEARANCE // ENTER CORPORATE EMAIL TO UNLOCK LIVE WIRE
              </div>

              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex flex-col sm:flex-row gap-2.5 max-w-xl">
                  <div className="relative flex-1">
                    <input
                      id="work-email-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="partner@sequoia.com or founder@startup.io"
                      required
                      aria-label="Work Email Address"
                      className="w-full px-4 py-3.5 rounded bg-[#07090D] border border-[#2A2F3A] text-sm font-mono text-[#E6E8EC] placeholder:text-[#555C6E] focus:outline-none focus:border-[#D9A441] focus:ring-1 focus:ring-[#D9A441] transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3.5 rounded bg-[#D9A441] hover:bg-[#c99534] active:scale-[0.99] text-[#0B0E14] font-mono font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[#D9A441] focus:ring-offset-2 focus:ring-offset-[#0B0E14]"
                  >
                    {loading ? 'Verifying Gate...' : 'Enter the feed'}
                  </button>
                </div>
              </form>

              <div className="flex items-center gap-2 text-[11px] font-mono text-[#555C6E]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2FA8A0]" />
                <span>Instant dispatch authorization. No marketing nurture drips. Unlocks full editorial feed.</span>
              </div>
            </div>
          </div>

          {/* RIGHT 5 COLS: LIVE 60-WORD BRIEF CARD (THE PRODUCT DEMO) */}
          <div className="lg:col-span-5">
            <div className="border border-[#2A2F3A] bg-[#07090D] p-5 sm:p-6 rounded-none relative shadow-2xl">

              {/* Perforated Top Wire Tab Bar */}
              <div className="flex items-center justify-between border-b border-[#2A2F3A] pb-3 mb-4">
                <div className="flex items-center gap-1.5">
                  {FEATURED_BRIEFS.map((b, idx) => (
                    <button
                      key={b.id}
                      onClick={() => setActiveBriefIdx(idx)}
                      className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
                        activeBriefIdx === idx
                          ? 'bg-[#E6E8EC] text-[#0B0E14]'
                          : 'bg-[#0B0E14] text-[#8C93A3] hover:text-[#E6E8EC] border border-[#2A2F3A]'
                      }`}
                    >
                      {b.deskCode}
                    </button>
                  ))}
                </div>

                <div className="font-mono text-[10px] text-[#2FA8A0] uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2FA8A0] animate-pulse" />
                  <span>DEMO DISPATCH</span>
                </div>
              </div>

              {/* Metadata strip */}
              <div className="flex items-center justify-between text-[10px] font-mono text-[#555C6E] pb-3 border-b border-dashed border-[#2A2F3A]">
                <span>{activeBrief.source}</span>
                <span>{activeBrief.timestamp}</span>
                <span className="text-[#D9A441]">{activeBrief.wordCount} WORDS</span>
                <span>{activeBrief.readTime}</span>
              </div>

              {/* Headline */}
              <div className="pt-4 space-y-3">
                <div className={`inline-block px-2 py-0.5 text-[10px] font-mono font-bold border uppercase tracking-wider ${activeBrief.badgeColor}`}>
                  {activeBrief.desk}
                </div>

                <h3 className="font-fraunces text-xl sm:text-2xl text-[#E6E8EC] leading-snug font-normal">
                  {activeBrief.headline}
                </h3>

                {/* Body: Strict 60 words */}
                <p className="text-sm font-body text-[#A6ADB8] leading-relaxed pt-1">
                  {activeBrief.body}
                </p>
              </div>

              {/* Structured Financial Metric Callout Box */}
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-[#0B0E14] border border-[#2A2F3A] font-mono">
                {activeBrief.metrics.map((m, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="text-[9px] text-[#555C6E] uppercase tracking-widest">{m.label}</div>
                    <div className="text-xs sm:text-sm font-bold text-[#E6E8EC]">{m.value}</div>
                    {m.sub && <div className="text-[9px] text-[#8C93A3] truncate">{m.sub}</div>}
                  </div>
                ))}
              </div>

              {/* Audio Dispatch Simulated Toggle */}
              <div className="mt-4 pt-3 border-t border-[#2A2F3A] flex items-center justify-between text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                  className="flex items-center gap-2 text-[#8C93A3] hover:text-[#D9A441] transition-colors"
                >
                  {isPlayingAudio ? (
                    <VolumeX size={14} className="text-[#D9A441]" />
                  ) : (
                    <Volume2 size={14} className="text-[#8C93A3]" />
                  )}
                  <span>{isPlayingAudio ? 'STOPPING AUDIO BRIEF' : 'LISTEN BRIEF (28 SEC AUDIO)'}</span>
                </button>

                <div className="flex items-center gap-1 text-[#2FA8A0]">
                  <span className="w-1 h-3 bg-[#2FA8A0] animate-pulse" />
                  <span className="w-1 h-4 bg-[#2FA8A0] animate-pulse delay-75" />
                  <span className="w-1 h-2 bg-[#2FA8A0] animate-pulse delay-150" />
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* ==========================================
          PROOF STRIP: TERMINAL STAT LINE
          ========================================== */}
      <section aria-label="Key Platform Constraints" className="border-y border-[#2A2F3A] bg-[#07090D] py-6 px-4 sm:px-6 my-4 select-none">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="border-l-2 border-[#D9A441] pl-3.5 space-y-0.5 font-mono">
            <div className="text-2xl sm:text-3xl font-bold text-[#E6E8EC]">60 WORDS</div>
            <div className="text-[11px] text-[#555C6E] uppercase tracking-wider">Strict dispatch ceiling</div>
          </div>
          <div className="border-l-2 border-[#2FA8A0] pl-3.5 space-y-0.5 font-mono">
            <div className="text-2xl sm:text-3xl font-bold text-[#E6E8EC]">1.2 MIN</div>
            <div className="text-[11px] text-[#555C6E] uppercase tracking-wider">Average desk clearance</div>
          </div>
          <div className="border-l-2 border-[#D9A441] pl-3.5 space-y-0.5 font-mono">
            <div className="text-2xl sm:text-3xl font-bold text-[#E6E8EC]">5 DESKS</div>
            <div className="text-[11px] text-[#555C6E] uppercase tracking-wider">Unicorns, Failures, Finance, Crypto, Seed</div>
          </div>
          <div className="border-l-2 border-[#C24B3F] pl-3.5 space-y-0.5 font-mono">
            <div className="text-2xl sm:text-3xl font-bold text-[#E6E8EC]">0 FLUFF</div>
            <div className="text-[11px] text-[#555C6E] uppercase tracking-wider">No sponsored PR or filler</div>
          </div>
        </div>
      </section>

      {/* ==========================================
          GLOBE SECTION: FUNDING ACTIVITY TELEMETRY
          ========================================== */}
      <section aria-label="Global Capital Flow Telemetry" className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="border border-[#2A2F3A] bg-[#07090D] p-6 sm:p-10">

          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#2A2F3A] pb-5 mb-8 gap-4">
            <div>
              <div className="font-mono text-[11px] text-[#2FA8A0] uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2FA8A0] animate-pulse" />
                <span>GLOBAL CAPITAL FLOW RADAR // 24-HOUR TELEMETRY</span>
              </div>
              <h2 className="font-fraunces text-2xl sm:text-3xl text-[#E6E8EC] font-normal mt-1">
                Real-time venture deployment across tier-1 hubs
              </h2>
            </div>

            <div className="font-mono text-xs text-[#8C93A3] flex items-center gap-3">
              <span>ACTIVE HUBS: <strong className="text-[#D9A441]">5 HUBS</strong></span>
              <span className="text-[#2A2F3A]">|</span>
              <span>24H VOLUME: <strong className="text-[#E6E8EC]">$37.7B</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

            {/* Left: Global Hubs Telemetry Feed (5 cols) */}
            <div className="lg:col-span-5 space-y-2 font-mono">
              <div className="text-[10px] text-[#555C6E] uppercase tracking-widest pb-1 border-b border-[#2A2F3A]">
                SELECT VENTURE HUB TO INSPECT CORRIDOR
              </div>

              {GLOBAL_HUBS.map((hub) => {
                const isSelected = hub.coords[0] === selectedHubCoords[0];
                return (
                  <button
                    key={hub.city}
                    onClick={() => setSelectedHubCoords(hub.coords as [number, number])}
                    className={`w-full text-left p-3 border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-[#D9A441] bg-[#0B0E14] text-[#E6E8EC]'
                        : 'border-[#2A2F3A] bg-[#07090D] text-[#8C93A3] hover:border-[#555C6E] hover:text-[#E6E8EC]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#D9A441]' : 'bg-[#555C6E]'}`} />
                        <span className="font-bold text-xs text-[#E6E8EC]">{hub.city}</span>
                        <span className="text-[10px] text-[#555C6E]">({hub.region})</span>
                      </div>
                      <div className="text-[10px] text-[#8C93A3] mt-1 pl-3.5">
                        Focus: {hub.focus}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-[#D9A441]">{hub.volume24h}</div>
                      <div className="text-[9px] text-[#555C6E]">{hub.activeDeals} Deals Active</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right: WebGL Spinning Globe (7 cols) */}
            <div className="lg:col-span-7 flex justify-center items-center relative">
              <TelemetryGlobe
                activeCoords={selectedHubCoords}
                onSelectHub={(c) => setSelectedHubCoords(c)}
              />
            </div>

          </div>
        </div>
      </section>

      {/* ==========================================
          DESK PREVIEWS: DENSE WIRE-STYLE DISPATCH GRID
          ========================================== */}
      <section aria-label="Editorial Desks and Channels" className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="border-b border-[#2A2F3A] pb-4 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="font-mono text-[11px] text-[#D9A441] uppercase tracking-wider">
              COVERAGE ARCHITECTURE // FIVE SPECIALIZED WIRES
            </div>
            <h2 className="font-fraunces text-2xl sm:text-3xl text-[#E6E8EC] font-normal mt-1">
              Engineered for founders & venture capital partners
            </h2>
          </div>
          <div className="font-mono text-xs text-[#555C6E]">
            ALL CHANNELS UPDATED EVERY 30 MINUTES
          </div>
        </div>

        {/* Dense Wire Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {DESK_CHANNELS.map((desk) => (
            <div
              key={desk.num}
              className="border border-[#2A2F3A] bg-[#07090D] p-5 flex flex-col justify-between space-y-4 relative group hover:border-[#555C6E] transition-colors"
            >
              {/* Perforated Top Edge Header */}
              <div className="border-b border-dashed border-[#2A2F3A] pb-3 flex items-center justify-between font-mono text-[10px]">
                <span className="text-[#D9A441] font-bold">{desk.badge}</span>
                <span className="text-[#555C6E]">WIRE {desk.num}</span>
              </div>

              <div className="space-y-2">
                <h3 className="font-fraunces text-lg text-[#E6E8EC] font-normal group-hover:text-[#D9A441] transition-colors">
                  {desk.name}
                </h3>
                <p className="text-xs text-[#8C93A3] font-body leading-relaxed">
                  {desk.focus}
                </p>
              </div>

              {/* Sample Dispatch Snippet */}
              <div className="p-3 bg-[#0B0E14] border border-[#2A2F3A] space-y-1.5 font-mono">
                <div className="text-[9px] text-[#555C6E] uppercase tracking-wider flex justify-between">
                  <span>RECENT DISPATCH</span>
                  <span className="text-[#2FA8A0]">{desk.sampleStat}</span>
                </div>
                <div className="text-xs text-[#E6E8EC] line-clamp-2">
                  "{desk.recentTitle}"
                </div>
              </div>

              <button
                type="button"
                onClick={focusInput}
                className="w-full py-2 border border-[#2A2F3A] hover:bg-[#E6E8EC] hover:text-[#0B0E14] font-mono text-[11px] uppercase tracking-wider text-[#8C93A3] transition-colors text-center"
              >
                Inspect Wire Feed
              </button>
            </div>
          ))}

          {/* 6th Slot: Visual Canvas Studio Highlight */}
          <div className="border border-[#2A2F3A] bg-[#0B0E14] p-5 flex flex-col justify-between space-y-4 relative">
            <div className="border-b border-dashed border-[#2A2F3A] pb-3 flex items-center justify-between font-mono text-[10px]">
              <span className="text-[#2FA8A0] font-bold">CANVAS STUDIO</span>
              <span className="text-[#555C6E]">VISUAL TEARDOWNS</span>
            </div>

            <div className="space-y-2">
              <h3 className="font-fraunces text-lg text-[#E6E8EC] font-normal">
                Infographic Breakdown Cards
              </h3>
              <p className="text-xs text-[#8C93A3] font-body leading-relaxed">
                For complex capital stacks, cap table waterfall simulations, and unit economics that cannot be compressed into 60 words alone.
              </p>
            </div>

            <div className="p-3 bg-[#07090D] border border-[#2A2F3A] space-y-2 font-mono">
              <div className="text-[9px] text-[#555C6E] uppercase tracking-wider">SAMPLE VISUAL METRIC MATRIX</div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="text-[#D9A441]">CAC Payback: 5.2 Mo</div>
                <div className="text-[#2FA8A0]">Gross Margin: 84%</div>
                <div className="text-[#E6E8EC]">Burn Multiple: 0.8x</div>
                <div className="text-[#C24B3F]">Ch. 11 Risk: Low</div>
              </div>
            </div>

            <button
              type="button"
              onClick={focusInput}
              className="w-full py-2 bg-[#2FA8A0]/10 border border-[#2FA8A0]/40 text-[#2FA8A0] hover:bg-[#2FA8A0] hover:text-[#0B0E14] font-mono text-[11px] uppercase tracking-wider transition-colors text-center"
            >
              Access Visual Canvas
            </button>
          </div>
        </div>
      </section>

      {/* ==========================================
          READER COHORT / VERIFICATION QUOTES
          ========================================== */}
      <section aria-label="Reader Verdicts" className="border-t border-[#2A2F3A] bg-[#07090D] py-14 px-4 sm:px-6 my-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="font-mono text-[11px] text-[#555C6E] uppercase tracking-widest text-center">
            DAILY VERDICT // READ BY GENERAL PARTNERS & TECHNICAL FOUNDERS
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
            <div className="p-5 border border-[#2A2F3A] bg-[#0B0E14] space-y-3">
              <p className="text-xs text-[#A6ADB8] font-body leading-relaxed">
                "Traditional tech journalism is 90% filler quotes and PR boilerplate. Venture Atlas is the first wire where I can clear 20 funding events before my first standup."
              </p>
              <div className="pt-2 border-t border-[#2A2F3A] text-[10px] text-[#555C6E] flex justify-between">
                <span className="text-[#E6E8EC] font-bold">Partner, Series A Fund</span>
                <span>Bengaluru</span>
              </div>
            </div>

            <div className="p-5 border border-[#2A2F3A] bg-[#0B0E14] space-y-3">
              <p className="text-xs text-[#A6ADB8] font-body leading-relaxed">
                "The 60-word constraint forces the writer to tell you the only numbers that matter: post-money valuation, round size, and real growth bottlenecks. Invaluable."
              </p>
              <div className="pt-2 border-t border-[#2A2F3A] text-[10px] text-[#555C6E] flex justify-between">
                <span className="text-[#E6E8EC] font-bold">Co-Founder & CTO</span>
                <span>San Francisco</span>
              </div>
            </div>

            <div className="p-5 border border-[#2A2F3A] bg-[#0B0E14] space-y-3">
              <p className="text-xs text-[#A6ADB8] font-body leading-relaxed">
                "The failure desk alone is worth checking daily. Seeing why a $70M startup burned through capital without sugarcoating provides more lessons than any puff piece."
              </p>
              <div className="pt-2 border-t border-[#2A2F3A] text-[10px] text-[#555C6E] flex justify-between">
                <span className="text-[#E6E8EC] font-bold">VP Product</span>
                <span>London</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          SECONDARY BOTTOM CONVERSION GATE
          ========================================== */}
      <section aria-label="Acquisition Clearance Gate" className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center space-y-6">
        <div className="p-8 sm:p-12 border border-[#2A2F3A] bg-[#07090D] space-y-4">
          <div className="font-mono text-xs text-[#D9A441] uppercase tracking-wider">
            WIRE CLEARANCE TERMINAL
          </div>
          <h2 className="font-fraunces text-3xl sm:text-4xl text-[#E6E8EC] font-normal leading-tight">
            Stop scrolling 3,000-word fluff pieces.
          </h2>
          <p className="text-sm text-[#8C93A3] font-body max-w-lg mx-auto">
            Get the institutional 60-word dispatches and venture intelligence read by founders, VCs, and operators across 5 global hubs.
          </p>

          <form onSubmit={handleSubscribe} className="pt-4 max-w-md mx-auto flex flex-col sm:flex-row gap-2.5">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="work-email@firm.com"
              required
              aria-label="Work Email Address"
              className="flex-1 px-4 py-3 rounded bg-[#0B0E14] border border-[#2A2F3A] text-xs font-mono text-[#E6E8EC] placeholder:text-[#555C6E] focus:outline-none focus:border-[#D9A441]"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded bg-[#D9A441] hover:bg-[#c99534] text-[#0B0E14] font-mono font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 whitespace-nowrap"
            >
              {loading ? 'Clearing...' : 'Enter the feed'}
            </button>
          </form>
        </div>
      </section>

      {/* ==========================================
          TERMINAL FOOTER
          ========================================== */}
      <footer className="border-t border-[#2A2F3A] bg-[#07090D] py-10 px-4 sm:px-6 select-none font-mono text-xs text-[#555C6E]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="font-fraunces text-base text-[#E6E8EC] font-bold">Venture Atlas</span>
              <span>//</span>
              <span className="text-[#8C93A3]">VENTUREATLAS.IN</span>
            </div>
            <div className="text-[10px]">
              ENGINEERED IN BENGALURU & SAN FRANCISCO • LATENCY: ~20MS
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-[11px]">
            <Link href="/feed.xml" className="hover:text-[#E6E8EC] transition-colors">
              RSS WIRE
            </Link>
            <Link href="/sitemap.xml" className="hover:text-[#E6E8EC] transition-colors">
              SITEMAP
            </Link>
            <Link href="/privacy" className="hover:text-[#E6E8EC] transition-colors">
              PRIVACY
            </Link>
            <Link href="/terms" className="hover:text-[#E6E8EC] transition-colors">
              TERMS
            </Link>
            <Link href="/admin/login" className="text-[#D9A441] hover:underline">
              STAFF LOGIN
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
};
