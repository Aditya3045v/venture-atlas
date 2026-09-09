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
  Cpu,
  Flame,
  Briefcase,
  Coins,
  Sprout,
  BarChart3,
  Rocket,
} from 'lucide-react';

// =========================================================================
// 1. DATA DEFINITIONS: INTEREST OPTIONS, TICKER, HUBS & LIVE DISPATCH SAMPLES
// =========================================================================

interface InterestOption {
  id: string;
  label: string;
  desc: string;
  emoji: string;
  badgeColor: string;
}

const INTEREST_OPTIONS: InterestOption[] = [
  {
    id: 'unicorns',
    label: 'Unicorns & Growth',
    desc: '$100M+ rounds, valuations & secondary liquidity',
    emoji: '🦄',
    badgeColor: '#D9A441',
  },
  {
    id: 'ai-deeptech',
    label: 'AI & DeepTech Silicon',
    desc: 'Inference chips, foundation models & CAPEX clusters',
    emoji: '🤖',
    badgeColor: '#0066FF',
  },
  {
    id: 'failures',
    label: 'Failures & Teardowns',
    desc: 'Post-mortems, burn rate spikes & liquidation data',
    emoji: '📉',
    badgeColor: '#C24B3F',
  },
  {
    id: 'finance',
    label: 'Venture Finance & LPs',
    desc: 'Fund closings, LP returns, DPI/TVPI & dry powder',
    emoji: '💼',
    badgeColor: '#2FA8A0',
  },
  {
    id: 'crypto',
    label: 'Crypto & Fast EVMs',
    desc: 'Parallel execution, state proofs & settlement rails',
    emoji: '🌐',
    badgeColor: '#8B5CF6',
  },
  {
    id: 'seed-radar',
    label: 'Seed & Early Radar',
    desc: 'Ex-Stripe/OpenAI founders & stealth pre-seed rounds',
    emoji: '🌱',
    badgeColor: '#10B981',
  },
  {
    id: 'saas-metrics',
    label: 'SaaS & B2B Metrics',
    desc: 'Unit economics, CAC recovery, ARR multiples & NRR',
    emoji: '📊',
    badgeColor: '#F59E0B',
  },
  {
    id: 'operators',
    label: 'Operator Playbooks',
    desc: 'Capital-efficient execution, hiring freezes & pricing',
    emoji: '🚀',
    badgeColor: '#EC4899',
  },
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

interface WireSample {
  id: string;
  deskCode: string;
  deskName: string;
  title: string;
  timestamp: string;
  wordCount: number;
  badgeColor: string;
  body: string;
  metrics: { label: string; value: string; down?: boolean }[];
  takeaway: string;
}

const WIRE_SAMPLES: WireSample[] = [
  {
    id: 'unicorn',
    deskCode: 'DESK 01',
    deskName: 'UNICORN & GROWTH',
    badgeColor: '#D9A441',
    title: 'Mercor Secures $32M Series A at $250M Valuation Led by Benchmark',
    timestamp: '14m ago',
    wordCount: 58,
    body: 'San Francisco AI talent marketplace Mercor closed a $32M Series A led by Peter Fenton at Benchmark, valuing the 18-month-old company at $250M. Founded by Thiel Fellows aged 20-21, the firm surpassed $50M annualized run-rate sourcing engineers via automated multimodal vetting. Capital will fund sovereign compute clusters and proprietary evaluation pipelines across Fortune 500 contracts.',
    metrics: [
      { label: 'VALUATION', value: '$250M' },
      { label: 'ROUND', value: '$32M SER A' },
      { label: 'LEAD', value: 'BENCHMARK' },
      { label: 'RUNWAY', value: '36 MO' },
    ],
    takeaway: 'Rare single-partner conviction round with zero syndicate dilution.',
  },
  {
    id: 'ai-silicon',
    deskCode: 'DESK 02',
    deskName: 'AI & DEEPTECH',
    badgeColor: '#0066FF',
    title: 'Groq Expands LPU Footprint with 40MW Texas High-Density Cluster',
    timestamp: '32m ago',
    wordCount: 59,
    body: 'Mountain View inference pioneer Groq commissioned 40MW of high-speed Tensor Streaming Processor clusters, targeting sub-10ms token generation for algorithmic trading desks and sovereign defense intelligence. Unlike Nvidia GPUs constrained by high-bandwidth memory queues, Groq’s SRAM-native architecture eliminates interconnect latency, delivering 520 T/s per user on Llama-3. The deployment follows a $640M round led by BlackRock at a $2.8B valuation.',
    metrics: [
      { label: 'CLUSTER CAPEX', value: '$180M' },
      { label: 'THROUGHPUT', value: '520 T/S' },
      { label: 'VALUATION', value: '$2.8B' },
      { label: 'SRAM BANDWIDTH', value: '80 TB/S' },
    ],
    takeaway: 'Hardware architecture shift towards zero-latency deterministic silicon.',
  },
  {
    id: 'failure',
    deskCode: 'DESK 03',
    deskName: 'FAILURE TEARDOWN',
    badgeColor: '#C24B3F',
    title: 'Protean Dynamics Enters Receivership After $70M Burn Stall',
    timestamp: '1h ago',
    wordCount: 59,
    body: 'Autonomous warehouse robotics supplier Protean Dynamics commenced court liquidation after fully consuming a $70M Series B. Confidential board teardowns reveal fatal unit economics: custom solid-state lidar modules cost $18,400 per robot against customer lease agreements yielding just $1,200 monthly. When venture debt providers refused covenants in Q3, monthly net burn of $2.4M completely depleted cash reserves within 140 days.',
    metrics: [
      { label: 'TOTAL BURN', value: '$70M', down: true },
      { label: 'UNIT DEFICIT', value: '-$17.2K', down: true },
      { label: 'PEAK BURN', value: '$2.4M/MO', down: true },
      { label: 'RECOVERY', value: '0.08 ON $1', down: true },
    ],
    takeaway: 'Hardware margin illusions subsidized by cheap equity inevitably collapse.',
  },
  {
    id: 'finance',
    deskCode: 'DESK 04',
    deskName: 'VENTURE FINANCE',
    badgeColor: '#2FA8A0',
    title: 'Lightspeed Finalizes $7.1B Across Global Flagship & Opportunity Funds',
    timestamp: '2h ago',
    wordCount: 57,
    body: 'Lightspeed Venture Partners closed $7.1B in institutional capital across four distinct vehicles: $1.20B Early Stage, $2.26B Growth, $1.98B Opportunity, and $1.65B India/SEA corridors. The firm accelerated DPI distributions to limited partners, returning $3.8B in realized liquidity over the trailing 24 months. Approximately 45% of new dry powder is designated for sovereign infrastructure and vertical AI systems.',
    metrics: [
      { label: 'TOTAL POOL', value: '$7.1B' },
      { label: 'EARLY STAGE', value: '$1.2B' },
      { label: '24M DPI', value: '$3.8B' },
      { label: 'AI TARGET', value: '45%' },
    ],
    takeaway: 'Mega-funds consolidating LP liquidity by demonstrating realized cash returns.',
  },
  {
    id: 'seed-radar',
    deskCode: 'DESK 05',
    deskName: 'SEED RADAR',
    badgeColor: '#10B981',
    title: 'Cognition Dynamics Raises $6.5M Pre-Seed from Founders Fund',
    timestamp: '3h ago',
    wordCount: 58,
    body: 'Physical embodied AI startup Cognition Dynamics, founded by three former OpenAI robotics researchers, closed a $6.5M pre-seed round at a $40M post-money valuation cap led by Trae Stephens at Founders Fund. The team is developing zero-shot spatial trajectory models for humanoid robotic hands in precision aerospace manufacturing. Initial customer trials are scheduled with commercial airframe fabricators for Q1 2027.',
    metrics: [
      { label: 'PRE-SEED ROUND', value: '$6.5M' },
      { label: 'VALUATION CAP', value: '$40M' },
      { label: 'LEAD', value: 'FOUNDERS FUND' },
      { label: 'TEAM ORIGIN', value: 'EX-OPENAI' },
    ],
    takeaway: 'Founders Fund underwriting deep technical moat in embodied spatial AI.',
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

  // Authentication & Onboarding State
  const [step, setStep] = useState<'email' | 'interests'>('email');
  const [email, setEmail] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'unicorns',
    'ai-deeptech',
    'failures',
    'finance',
    'seed-radar',
  ]);
  const [loading, setLoading] = useState(false);
  const [isZooping, setIsZooping] = useState(false);

  // Desktop Wire Dispatch Simulator State
  const [activeWireTab, setActiveWireTab] = useState<string>('unicorn');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const activeSample = WIRE_SAMPLES.find(s => s.id === activeWireTab) || WIRE_SAMPLES[0];

  // Telemetry Globe State
  const [selectedHubCoords, setSelectedHubCoords] = useState<[number, number]>([12.9716, 77.5946]);

  // Audio simulator simulation
  const toggleAudioSimulation = () => {
    setIsPlayingAudio(!isPlayingAudio);
    if (!isPlayingAudio) {
      toast('Synthesizing 60-word dispatch audio readout...', 'info');
      setTimeout(() => {
        setIsPlayingAudio(false);
      }, 7000);
    }
  };

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
      toast('Please enter a valid work email address to proceed', 'error');
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
          source: 'LANDING_DESKTOP_COMMAND',
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
                Tuning 60-word briefs for {selectedInterests.length} selected intelligence desks...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          1. TOP GLOBAL TELEMETRY HEADER & PHYSICAL TICKER TAPE
          ======================================================== */}
      <header className="sticky top-0 z-40 bg-[#07090D]/95 backdrop-blur-md border-b border-[#1E232F] select-none">
        {/* Upper Wire Meta Row */}
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

          {/* Desktop World Clocks */}
          <div className="hidden lg:flex items-center gap-5 text-[11px] text-[#555C6E]">
            <span className="flex items-center gap-1.5 hover:text-[#8C93A3] transition-colors">
              <span className="text-white/80 font-bold">BLR</span> 14:02 IST
            </span>
            <span className="text-[#2A2F3A]">•</span>
            <span className="flex items-center gap-1.5 hover:text-[#8C93A3] transition-colors">
              <span className="text-white/80 font-bold">SFO</span> 00:32 PST
            </span>
            <span className="text-[#2A2F3A]">•</span>
            <span className="flex items-center gap-1.5 hover:text-[#8C93A3] transition-colors">
              <span className="text-white/80 font-bold">LDN</span> 08:32 GMT
            </span>
            <span className="text-[#2A2F3A]">•</span>
            <span className="flex items-center gap-1.5 hover:text-[#8C93A3] transition-colors">
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

      {/* ========================================================
          2. DESKTOP EXPANSIVE COMMAND CENTER HERO
          High-density split layout on desktop (7 cols left, 5 cols right)
          ======================================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-16">

        {/* --- DESKTOP HERO GRID (md:grid) --- */}
        <div className={`hidden md:grid md:grid-cols-12 gap-8 lg:gap-12 items-start transition-all duration-700 ${isZooping ? 'scale-105 blur-md opacity-30' : 'scale-100 blur-0 opacity-100'}`}>

          {/* LEFT COLUMN: Authority, Value Proposition & Clearance Gate (7 cols) */}
          <div className="md:col-span-7 space-y-6">

            {/* Monospace Issue Metadata */}
            <div className="flex items-center gap-2.5 font-mono text-xs">
              <span className="px-2.5 py-1 rounded bg-[#0066FF]/10 border border-[#0066FF]/30 text-[#0066FF] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Terminal size={12} />
                <span>BLOOMBERG + INSHORTS FOR TECH</span>
              </span>
              <span className="text-[#555C6E]">•</span>
              <span className="text-[#8C93A3]">INSTITUTIONAL RADAR</span>
            </div>

            {/* Editorial Serif Display Headline */}
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

            {/* DESKTOP CLEARANCE TERMINAL BOX (High-contrast Card) */}
            <div className="p-6 rounded-2xl border border-[#2A2F3A] bg-[#0B0E14] shadow-2xl space-y-5">

              {/* Step Indicator Header */}
              <div className="flex items-center justify-between border-b border-[#1E232F] pb-3 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0066FF]" />
                  <span className="text-white font-bold uppercase tracking-wider">
                    {step === 'email' ? 'STEP 1 // READER IDENTIFIER' : 'STEP 2 // SELECT SECTOR FOCUS'}
                  </span>
                </div>
                <span className="text-[11px] text-[#555C6E]">
                  {step === 'email' ? 'NO PASSWORD NEEDED' : `${selectedInterests.length} DESKS SELECTED`}
                </span>
              </div>

              {/* STEP 1: WORK EMAIL ONLY (DESKTOP) */}
              {step === 'email' && (
                <form onSubmit={handleContinueToInterests} className="space-y-4 animate-fadeIn">
                  <div className="space-y-1.5">
                    <label htmlFor="desktop-reader-email" className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#8C93A3]">
                      Enter Work Email Address
                    </label>
                    <div className="p-3.5 rounded-xl bg-[#07090D] border border-[#2A2F3A] flex items-center gap-3 focus-within:ring-2 focus-within:ring-[#0066FF]/40 focus-within:border-[#0066FF] transition-all">
                      <div className="w-9 h-9 rounded-lg bg-[#0066FF]/10 border border-[#0066FF]/30 flex items-center justify-center text-[#0066FF] shrink-0">
                        <AtSign size={18} />
                      </div>
                      <input
                        id="desktop-reader-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="gp@venturefirm.com or founder@startup.io"
                        required
                        autoFocus
                        className="flex-1 bg-transparent text-sm font-mono text-white placeholder:text-[#555C6E] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="submit"
                      className="flex-1 py-3.5 px-6 rounded-xl bg-white hover:bg-neutral-200 active:scale-[0.99] text-neutral-950 font-mono font-bold text-sm uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Continue to Sector Selection</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#555C6E] font-mono pt-1">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 size={12} className="text-[#2FA8A0]" />
                      Zero spam guarantee
                    </span>
                    <span>Instant clearance • Real-time wire</span>
                  </div>
                </form>
              )}

              {/* STEP 2: INTERESTS SELECTION (DESKTOP) */}
              {step === 'interests' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep('email')}
                      className="text-xs font-mono text-[#8C93A3] hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <ChevronLeft size={16} />
                      <span>Back to email</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-xs font-mono text-[#0066FF] hover:underline font-bold"
                    >
                      {selectedInterests.length === INTEREST_OPTIONS.length ? 'Clear all' : 'Select all 8'}
                    </button>
                  </div>

                  {/* Desk Chips Grid */}
                  <div className="grid grid-cols-2 gap-2.5 max-h-[260px] overflow-y-auto no-scrollbar pr-0.5">
                    {INTEREST_OPTIONS.map((opt) => {
                      const isSelected = selectedInterests.includes(opt.id);
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => toggleInterest(opt.id)}
                          className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 active:scale-98 ${
                            isSelected
                              ? 'border-[#0066FF] bg-[#0066FF]/10 text-white shadow-sm'
                              : 'border-[#1E232F] bg-[#07090D] text-[#8C93A3] hover:border-[#2A2F3A] hover:text-white'
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
                            <div className="text-[10px] text-[#555C6E] line-clamp-1 mt-0.5">
                              {opt.desc}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Enter Feed Action */}
                  <button
                    type="button"
                    onClick={handleCompleteOnboarding}
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-[#0066FF] hover:bg-[#0055d4] active:scale-[0.99] text-white font-mono font-bold text-sm uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>{loading ? 'Authenticating Clearance...' : 'Enter Venture Atlas Wire Feed'}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}

            </div>

            {/* Reader Cohort Social Proof */}
            <div className="pt-2 flex items-center gap-3 text-xs text-[#555C6E] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2FA8A0]" />
              <span>Read daily by 14,800+ GPs, Founders & Analysts across Sequoia, Lightspeed, Benchmark & Accel alumni.</span>
            </div>

          </div>

          {/* RIGHT COLUMN: Interactive Live Simulated Wire Terminal (5 cols) */}
          <div className="md:col-span-5 space-y-4">

            {/* Terminal Window Header */}
            <div className="rounded-2xl border border-[#2A2F3A] bg-[#0B0E14] overflow-hidden shadow-2xl flex flex-col">

              {/* Terminal Title Bar */}
              <div className="bg-[#07090D] border-b border-[#1E232F] px-4 py-3 flex items-center justify-between select-none">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C24B3F]/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D9A441]/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2FA8A0]/70" />
                  </div>
                  <span className="ml-2 font-mono text-[11px] font-bold text-[#8C93A3] uppercase tracking-wider">
                    TERMINAL PREVIEW // 60W WIRE
                  </span>
                </div>
                <div className="font-mono text-[10px] text-[#D9A441] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D9A441] animate-ping" />
                  <span>SIMULATED FEED</span>
                </div>
              </div>

              {/* Sector Tabs Bar */}
              <div className="bg-[#0B0E14] border-b border-[#1E232F] p-1.5 flex items-center gap-1 overflow-x-auto no-scrollbar font-mono text-[10px]">
                {WIRE_SAMPLES.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => setActiveWireTab(sample.id)}
                    className={`px-2.5 py-1.5 rounded-md transition-all uppercase whitespace-nowrap cursor-pointer ${
                      activeWireTab === sample.id
                        ? 'bg-white text-neutral-950 font-bold shadow-xs'
                        : 'text-[#8C93A3] hover:text-white hover:bg-[#1E232F]'
                    }`}
                  >
                    {sample.deskName.split(' ')[0]}
                  </button>
                ))}
              </div>

              {/* Active Dispatch Card */}
              <div className="p-5 sm:p-6 space-y-4 font-body">

                {/* Dispatch Header */}
                <div className="flex items-center justify-between font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-0.5 rounded font-bold text-[10px] uppercase"
                      style={{
                        backgroundColor: `${activeSample.badgeColor}20`,
                        color: activeSample.badgeColor,
                        border: `1px solid ${activeSample.badgeColor}40`,
                      }}
                    >
                      {activeSample.deskName}
                    </span>
                    <span className="text-[#555C6E]">{activeSample.timestamp}</span>
                  </div>

                  {/* Word Count & Audio Readout */}
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-[#8C93A3] bg-[#07090D] px-2 py-0.5 rounded border border-[#1E232F]">
                      <strong className="text-white">{activeSample.wordCount}</strong> / 60 WORDS
                    </span>

                    <button
                      type="button"
                      onClick={toggleAudioSimulation}
                      className="p-1 rounded bg-[#1E232F] hover:bg-[#2A2F3A] text-[#8C93A3] hover:text-white transition-colors"
                      title="Simulate 60w audio voice dispatch"
                    >
                      {isPlayingAudio ? (
                        <div className="flex items-center gap-1 px-1">
                          <span className="w-1 h-3 bg-[#0066FF] animate-pulse" />
                          <span className="w-1 h-4 bg-[#0066FF] animate-pulse delay-75" />
                          <span className="w-1 h-2 bg-[#0066FF] animate-pulse delay-150" />
                        </div>
                      ) : (
                        <Volume2 size={14} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Dispatch Headline */}
                <h3 className="font-fraunces text-xl sm:text-2xl text-white font-normal leading-snug">
                  {activeSample.title}
                </h3>

                {/* 60-Word Body Copy */}
                <p className="text-sm text-[#A6ADB8] leading-relaxed font-body">
                  {activeSample.body}
                </p>

                {/* Structured Financial Metric Chips */}
                <div className="pt-2 border-t border-[#1E232F] grid grid-cols-2 gap-2 font-mono text-xs">
                  {activeSample.metrics.map((m, idx) => (
                    <div key={idx} className="p-2 rounded bg-[#07090D] border border-[#1E232F] flex items-center justify-between">
                      <span className="text-[10px] text-[#555C6E]">{m.label}</span>
                      <span className={`font-bold ${m.down ? 'text-[#C24B3F]' : 'text-white'}`}>
                        {m.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Key Takeaway Callout */}
                <div className="p-3 rounded-lg bg-[#07090D] border-l-2 border-[#D9A441] text-xs font-mono text-[#8C93A3] flex items-start gap-2">
                  <Zap size={14} className="text-[#D9A441] shrink-0 mt-0.5" />
                  <span>{activeSample.takeaway}</span>
                </div>

              </div>

              {/* Bottom Quick Indicator */}
              <div className="bg-[#07090D] border-t border-[#1E232F] px-4 py-2.5 flex items-center justify-between font-mono text-[10px] text-[#555C6E]">
                <span>ENCRYPTED WIRE FEED</span>
                <span className="text-[#2FA8A0]">VERIFIED SOURCE: SEC / REGULATORY</span>
              </div>

            </div>

            {/* Quick Helper Tip */}
            <div className="p-3 rounded-xl border border-[#1E232F] bg-[#0B0E14] text-center font-mono text-[11px] text-[#8C93A3]">
              Switch tabs above to test our 60-word constraint across sectors.
            </div>

          </div>

        </div>

        {/* --- MOBILE HERO (md:hidden) --- */}
        {/* Retains the mobile app card requested in reference image */}
        <div className={`md:hidden w-full max-w-md mx-auto transition-all duration-700 ${isZooping ? 'scale-110 blur-md opacity-40' : 'scale-100 blur-0 opacity-100'}`}>

          <div className="w-full rounded-[36px] overflow-hidden border border-[#2A2F3A] bg-[#07090D] shadow-[0_20px_60px_rgba(0,0,0,0.6)] flex flex-col">

            {/* TOP HALF: Vibrant Illustration scene */}
            <div className="relative w-full h-64 overflow-hidden bg-[#0A1128]">
              <img
                src="/onboarding-hero.jpg"
                alt="Venture Atlas Tech Founders and Market Activity"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

              {/* Top Bar Indicators */}
              <div className="absolute top-4 left-6 right-6 flex items-center justify-between text-white/90 text-xs font-mono select-none drop-shadow-md">
                <span className="font-bold">9:41</span>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-[10px] font-bold text-[#D9A441]">
                    60-WORD DISPATCHES
                  </span>
                </div>
              </div>
            </div>

            {/* BOTTOM HALF: High-Contrast White Sheet Card */}
            <div className="bg-white text-neutral-900 -mt-8 rounded-t-[36px] p-6 relative z-10 flex flex-col justify-between shadow-2xl transition-all duration-300">

              {step === 'email' && (
                <form onSubmit={handleContinueToInterests} className="space-y-4 animate-fadeIn">
                  <div className="text-center space-y-1 pt-1">
                    <h2 className="text-2xl font-black font-display tracking-tight text-neutral-900 leading-tight">
                      Speed, <span className="text-[#0066FF]">Rigor</span>, Intelligence in your Pocket
                    </h2>
                    <p className="text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed">
                      Institutional startup briefs & funding radar in 60 words. No password needed.
                    </p>
                  </div>

                  <div className="space-y-1 pt-2">
                    <div className="p-3.5 rounded-2xl bg-neutral-100/80 hover:bg-neutral-100 border border-neutral-200/80 transition-all flex items-center gap-3.5 focus-within:ring-2 focus-within:ring-[#0066FF]/30 focus-within:border-[#0066FF] focus-within:bg-white">
                      <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 shadow-xs flex items-center justify-center shrink-0 text-[#0066FF]">
                        <AtSign size={19} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <label htmlFor="mobile-email-input" className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                          Reader Email
                        </label>
                        <input
                          id="mobile-email-input"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="founder@venture.io"
                          required
                          className="w-full bg-transparent text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

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

              {step === 'interests' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="space-y-1 text-center relative pt-1">
                    <button
                      type="button"
                      onClick={() => setStep('email')}
                      className="absolute left-0 top-1 p-1 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                      title="Back to email"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <h2 className="text-2xl font-black font-display tracking-tight text-neutral-900 leading-tight">
                      Choose your <span className="text-[#0066FF]">Interests</span>
                    </h2>
                    <p className="text-xs text-neutral-500">
                      Select the desks & sectors you track daily
                    </p>
                  </div>

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

      </main>

      {/* ========================================================
          3. BENTO GRID: 60-WORD RULE ENGINE & CAPITAL FLOW TELEMETRY
          ======================================================== */}
      <section className="border-t border-[#1E232F] bg-[#07090D] py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-16">

          {/* Section 1: The 60-Word Rule Engine: "The Death of PR Fluff" */}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto font-mono text-xs">

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

          {/* Section 2: Global Capital Flow Telemetry & 3D Globe */}
          <div className="rounded-2xl border border-[#1E232F] bg-[#0B0E14] p-6 sm:p-10 space-y-8">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <div className="font-mono text-[10px] text-[#2FA8A0] uppercase tracking-wider flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#2FA8A0] animate-pulse" />
                <span>GLOBAL CAPITAL TELEMETRY RADAR</span>
              </div>
              <h3 className="font-fraunces text-2xl sm:text-3xl text-white font-normal">
                Continuous venture deployment across primary innovation corridors
              </h3>
              <p className="text-xs sm:text-sm text-[#8C93A3] font-body">
                Select a global node to inspect 24-hour venture capital liquidity and transaction velocity.
              </p>
            </div>

            {/* Interactive Cobe WebGL Globe */}
            <TelemetryGlobe activeCoords={selectedHubCoords} />

            {/* Hub Selector Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs max-w-4xl mx-auto">
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

          {/* Section 3: The 5 Dedicated Intelligence Desks */}
          <div className="space-y-6">
            <div className="text-center space-y-1 max-w-xl mx-auto">
              <div className="font-mono text-xs text-[#D9A441] uppercase tracking-widest">
                CONTINUOUS COVERAGE INFRASTRUCTURE
              </div>
              <h3 className="font-fraunces text-2xl sm:text-3xl text-white font-normal">
                Five Specialized Desks. Zero Noise.
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 font-mono text-xs">
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

          {/* Section 4: Reader Cohort & Verification Quotes */}
          <div className="space-y-6 pt-4">
            <div className="font-mono text-center text-xs text-[#555C6E] uppercase tracking-widest">
              DAILY VERDICT // READ BY GENERAL PARTNERS & TECHNICAL OPERATORS
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
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

          {/* Section 5: Secondary Acquisition Clearance Terminal */}
          <div className="max-w-3xl mx-auto text-center space-y-6 pt-6">
            <div className="p-8 sm:p-12 rounded-2xl border border-[#2A2F3A] bg-[#0B0E14] space-y-4 shadow-2xl">
              <div className="font-mono text-xs text-[#D9A441] uppercase tracking-wider">
                IMMEDIATE WIRE CLEARANCE
              </div>
              <h2 className="font-fraunces text-3xl sm:text-4xl text-white font-normal leading-tight">
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

      {/* ========================================================
          4. TERMINAL FOOTER
          ======================================================== */}
      <footer className="border-t border-[#1E232F] bg-[#07090D] py-10 px-4 sm:px-6 font-mono text-xs text-[#555C6E] select-none">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="font-fraunces text-base text-white font-bold">Venture Atlas</span>
              <span>//</span>
              <span className="text-[#8C93A3]">VENTUREATLAS.IN</span>
            </div>
            <div className="text-[10px]">
              ENGINEERED FOR FOUNDERS & VENTURE CAPITAL • 60-WORD DISPATCH CEILING
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-[11px]">
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
  );
};
