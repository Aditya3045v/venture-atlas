'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '../providers/ToastProvider';
import PhoneMockupBasic from '@/components/ui/phone-mockups-1';
import ClientFeedback from '@/components/ui/testimonial';
import { GradientBackground } from '@/components/ui/favorites';
import {
  IconArrowNarrowRight,
  IconCircleCheckFilled,
} from '@tabler/icons-react';

export const LandingView: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@') || !email.includes('.')) {
      toast('Please enter a valid work email address', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('va_unlocked_user', email);
        document.cookie = `va_unlocked_user=${encodeURIComponent(email)}; path=/; max-age=31536000`;
        document.cookie = `va_session_user=${encodeURIComponent(email)}; path=/; max-age=31536000`;
        setSubscribed(true);
        toast('Access granted! Unlocking the intelligence wire...', 'success');
        setTimeout(() => {
          router.push('/');
        }, 800);
      } else {
        toast(data.error || 'Failed to submit', 'error');
      }
    } catch {
      toast('Network error. Please try again.', 'error');
    } finally {
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
    <div className="w-full text-text-primary flex flex-col justify-between overflow-x-hidden select-none -mt-4 sm:-mt-6">
      {/* Main Hero Section with Grainy Radiant Gradient Background Shifted Directly Below Global Header */}
      <div className="relative w-full overflow-hidden rounded-3xl pt-10 sm:pt-14 pb-14">
        {/* Live CSS 21st.dev Gradient Background with Film Grain */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-90 dark:opacity-35 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_90%)]">
          <GradientBackground className="w-full h-full" />
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 flex flex-col items-center text-center space-y-10 sm:space-y-12">
          {/* H1 Headline & Subtitle (Maximized Contrast & Legibility) */}
          <div className="space-y-5 max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-display tracking-tight text-neutral-950 dark:text-white leading-[0.95] uppercase drop-shadow-xs">
              Read what’s <br className="hidden sm:inline" />
              <span className="text-neutral-950 dark:text-white">breaking.</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-neutral-800 dark:text-neutral-200 font-body max-w-2xl mx-auto leading-relaxed font-medium drop-shadow-xs">
              Catch up on seed rounds, AI breakthroughs, and market shifts with 60-word executive news briefs.
            </p>
          </div>

          {/* Email Capture Input (Stored in Supabase as users to unlock news) */}
          <div className="w-full max-w-md mx-auto">
            {subscribed ? (
              <div className="p-4 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-bold flex items-center justify-center gap-2 animate-fadeIn backdrop-blur-md shadow-md">
                <IconCircleCheckFilled size={18} />
                <span>Access unlocked. Entering the live news wire...</span>
              </div>
            ) : (
              <form
                onSubmit={handleSubscribe}
                className="flex items-center p-1.5 rounded-full bg-white/95 dark:bg-[#141416]/95 border border-neutral-300/80 dark:border-white/15 shadow-2xl focus-within:border-[#0066FF] dark:focus-within:border-amber-400 transition-all backdrop-blur-xl"
              >
                <input
                  id="work-email-input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your work email to read..."
                  required
                  className="flex-1 bg-transparent px-4 py-2.5 text-xs sm:text-sm font-body text-neutral-900 dark:text-white placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus:outline-none font-medium"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 sm:px-6 py-2.5 rounded-full bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-bold font-mono tracking-wider transition-all duration-200 active:scale-95 shadow-md shrink-0 flex items-center gap-1.5"
                >
                  {loading ? 'Unlocking...' : 'Read the news'}
                  <IconArrowNarrowRight size={16} />
                </button>
              </form>
            )}

            <div className="text-[11px] font-mono text-neutral-700 dark:text-neutral-300 mt-2.5 font-medium">
              Enter your email to unlock all news briefs & proprietary teardowns
            </div>
          </div>

          {/* Centerpiece Showcase: Flanking Startup Circles + Central iPhone Carousel (With Generous Spacing) */}
          <div className="relative w-full max-w-6xl mx-auto pt-8 sm:pt-12 pb-6 flex items-center justify-center">
            {/* Avatar 1 (Far Left: Startup Founder Pitching on Stage) */}
            <div className="hidden xl:block absolute left-0 top-1/2 -translate-y-1/2 z-10">
              <div className="group relative w-36 h-36 rounded-full overflow-hidden border-2 border-white/80 dark:border-white/20 shadow-2xl transition-all duration-500 hover:scale-105 backdrop-blur-sm ring-2 ring-black/5 dark:ring-white/10">
                <img
                  src="https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=400&q=80"
                  alt="Founder Pitching on Stage"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
                  <span className="text-[10px] font-mono font-bold text-amber-300 uppercase">
                    Founder Pitches
                  </span>
                </div>
              </div>
            </div>

            {/* Avatar 2 (Mid Left: Tech Builder Studio / Operator) */}
            <div className="hidden lg:block absolute left-44 xl:left-48 top-1/2 -translate-y-1/2 z-10">
              <div className="group relative w-40 h-40 xl:w-44 xl:h-44 rounded-full overflow-hidden border-2 border-white/80 dark:border-white/20 shadow-2xl transition-all duration-500 hover:scale-105 backdrop-blur-sm ring-2 ring-black/5 dark:ring-white/10">
                <img
                  src="https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=400&q=80"
                  alt="Tech Operator in Studio"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
                  <span className="text-[10px] font-mono font-bold text-amber-300 uppercase">
                    Tech Operators
                  </span>
                </div>
              </div>
            </div>

            {/* Central Interactive Phone Carousel Mockup with Generous Margin */}
            <div className="relative z-20 mx-auto px-4 sm:px-8">
              <PhoneMockupBasic />
            </div>

            {/* Avatar 3 (Mid Right: Deeptech Hardware / Cleanroom Engineer) */}
            <div className="hidden lg:block absolute right-44 xl:right-48 top-1/2 -translate-y-1/2 z-10">
              <div className="group relative w-40 h-40 xl:w-44 xl:h-44 rounded-full overflow-hidden border-2 border-white/80 dark:border-white/20 shadow-2xl transition-all duration-500 hover:scale-105 backdrop-blur-sm ring-2 ring-black/5 dark:ring-white/10">
                <img
                  src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400&q=80"
                  alt="Deeptech Silicon Lab"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
                  <span className="text-[10px] font-mono font-bold text-amber-300 uppercase">
                    AI & Deeptech
                  </span>
                </div>
              </div>
            </div>

            {/* Avatar 4 (Far Right: Venture Capital Partner Summit) */}
            <div className="hidden xl:block absolute right-0 top-1/2 -translate-y-1/2 z-10">
              <div className="group relative w-36 h-36 rounded-full overflow-hidden border-2 border-white/80 dark:border-white/20 shadow-2xl transition-all duration-500 hover:scale-105 backdrop-blur-sm ring-2 ring-black/5 dark:ring-white/10">
                <img
                  src="https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=400&q=80"
                  alt="VC Keynote Summit"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
                  <span className="text-[10px] font-mono font-bold text-amber-300 uppercase">
                    Venture Capital
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3-Line Punchy Statement (Max Contrast) */}
          <div className="pt-8 sm:pt-12 max-w-4xl mx-auto space-y-2 text-center select-none">
            <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-display uppercase tracking-tight text-neutral-950 dark:text-white leading-tight drop-shadow-xs">
              Strictly 60 words.
            </p>
            <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-display uppercase tracking-tight text-neutral-950 dark:text-white leading-tight drop-shadow-xs">
              Verified primary sources.
            </p>
            <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-display uppercase tracking-tight text-[#0066FF] dark:text-[#38BDF8] leading-tight drop-shadow-xs">
              Always signal.
            </p>
          </div>
        </div>
      </div>

      {/* How Venture Atlas Works / Client Feedback Bento Card Grid */}
      <div className="w-full max-w-6xl mx-auto pt-6">
        <ClientFeedback />
      </div>

      {/* Bottom Call to Action */}
      <div className="pt-6 pb-12 text-center">
        <button
          onClick={focusInput}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-neutral-950 text-white dark:bg-amber-400 dark:text-black font-mono font-bold text-xs sm:text-sm uppercase tracking-wider hover:opacity-90 transition-all active:scale-95 shadow-xl cursor-pointer"
        >
          <span>Enter Email to Read Full Wire</span>
          <IconArrowNarrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
