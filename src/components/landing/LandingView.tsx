'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Globe, ArrowRight, Linkedin, Loader2, Check } from 'lucide-react';
import { AboutSection } from './AboutSection';
import { FeaturedVideoSection } from './FeaturedVideoSection';
import { PhilosophySection } from './PhilosophySection';
import { ServicesSection } from './ServicesSection';

export function LandingView() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; success: boolean } | null>(null);

  // Video playback ref & state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;

    const playVideo = () => {
      video.play().catch(() => {
        // Autoplay policy fallback: unlock on first interaction
        const unlock = () => {
          video.play().catch(() => {});
          window.removeEventListener('click', unlock);
          window.removeEventListener('touchstart', unlock);
        };
        window.addEventListener('click', unlock, { once: true });
        window.addEventListener('touchstart', unlock, { once: true });
      });
    };

    if (video.readyState >= 2) {
      setVideoLoaded(true);
      playVideo();
    } else {
      const handleLoadedData = () => {
        setVideoLoaded(true);
        playVideo();
      };
      video.addEventListener('loadeddata', handleLoadedData, { once: true });
      return () => video.removeEventListener('loadeddata', handleLoadedData);
    }
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || submitting) return;
    setSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), source: 'HERO_LANDING' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Mark user as having submitted email — unlocks feed access
        localStorage.setItem('va_reader_verified', 'true');
        localStorage.setItem('va_reader_active', 'true');
        localStorage.setItem('va_email_unlocked', 'true');
        setIsSuccess(true);
        setStatusMessage({
          text: '✓ Captured. Full intelligence access granted.',
          success: true,
        });
        setEmail('');
        setTimeout(() => setIsSuccess(false), 4000);
      } else {
        setStatusMessage({
          text: data.error || 'Please enter a valid email address.',
          success: false,
        });
      }
    } catch {
      setStatusMessage({
        text: 'Network issue. Please try again.',
        success: false,
      });
    } finally {
      setSubmitting(false);
      setTimeout(() => setStatusMessage(null), 6000);
    }
  };


  return (
    <div className="bg-black text-white min-h-screen selection:bg-white selection:text-black overflow-x-hidden font-sans">
      {/* SECTION 1 — HERO */}
      <div className="h-screen min-h-[660px] max-h-[1050px] overflow-hidden relative flex flex-col justify-between">
        {/* Absolute full-screen background video with poster fallback */}
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover object-bottom pointer-events-none transition-opacity duration-700 ${
            videoLoaded ? 'opacity-90' : 'opacity-80'
          }`}
          autoPlay
          loop
          muted
          playsInline
          poster="/hero-poster.jpg"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_074625_a81f018a-956b-43fb-9aee-4d1508e30e6a.mp4"
            type="video/mp4"
          />
        </video>

        {/* Cinematic dark subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/85 pointer-events-none" />

        {/* NAVBAR */}
        <header className="relative z-20 px-6 pt-5 sm:pt-6 pb-2">
          <nav className="liquid-glass max-w-5xl mx-auto px-5 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between rounded-full shadow-lg">
            {/* Left Side: Brand Logo + Nav Links */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center group py-0.5" title="Venture Atlas">
                <img
                  src="/logo-dark.png"
                  alt="Venture Atlas"
                  className="h-8 sm:h-9 md:h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </Link>

              {/* Desktop Navigation Links */}
              <div className="hidden md:flex items-center gap-7 lg:gap-8 ml-8">
                <a
                  href="#about"
                  className="text-white/80 hover:text-white text-sm font-medium transition-colors"
                >
                  Discover
                </a>
                <a
                  href="#cover"
                  className="text-white/80 hover:text-white text-sm font-medium transition-colors"
                >
                  Startups
                </a>
                <a
                  href="#cover"
                  className="text-white/80 hover:text-white text-sm font-medium transition-colors"
                >
                  Funding
                </a>
                <a
                  href="#philosophy"
                  className="text-white/80 hover:text-white text-sm font-medium transition-colors"
                >
                  Markets
                </a>
              </div>
            </div>

            {/* Right Side: Sign In + Explore Primary Button */}
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/admin/login"
                className="text-white text-xs sm:text-sm font-medium hover:text-white/80 transition-colors px-2 py-1"
              >
                Sign In
              </Link>

              <Link
                href="/"
                className="liquid-glass rounded-full px-5 sm:px-6 py-2 text-white text-xs sm:text-sm font-medium hover:bg-white/10 transition-colors cursor-pointer inline-flex items-center justify-center"
              >
                Explore
              </Link>
            </div>
          </nav>
        </header>

        {/* HERO CONTENT: Vertically centered with optical balance (no negative translate collision) */}
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-4 text-center max-w-4xl mx-auto w-full my-auto">
          {/* Main Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white tracking-tight font-serif font-normal select-none leading-[0.98]">
            <span className="block">The world of</span>
            <span className="block font-serif italic font-normal tracking-tight mt-1">ventures</span>
          </h1>

          {/* Email Input */}
          <form onSubmit={handleEmailSubmit} className="max-w-lg w-full mt-6 sm:mt-7 mb-3">
            <div className="liquid-glass rounded-full pl-5 sm:pl-6 pr-2 py-1.5 sm:py-2 flex items-center gap-3 w-full shadow-2xl transition-all duration-300 focus-within:ring-1 focus-within:ring-white/30">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={submitting}
                className="w-full bg-transparent text-white placeholder:text-white/40 text-xs sm:text-sm md:text-base focus:outline-none font-sans"
                required
              />
              <button
                type="submit"
                disabled={submitting}
                aria-label="Submit email"
                className={`rounded-full p-2.5 sm:p-3 text-black transition-all active:scale-95 flex-shrink-0 cursor-pointer shadow-md ${
                  isSuccess ? 'bg-emerald-400 text-black' : 'bg-white hover:bg-white/90'
                }`}
              >
                {submitting ? (
                  <Loader2 size={18} className="animate-spin text-black" />
                ) : isSuccess ? (
                  <Check size={18} className="text-black" />
                ) : (
                  <ArrowRight size={18} className="sm:w-5 sm:h-5" />
                )}
              </button>
            </div>
            {statusMessage && (
              <p
                className={`text-xs mt-2.5 font-mono tracking-wide ${
                  statusMessage.success ? 'text-emerald-300' : 'text-rose-400'
                }`}
              >
                {statusMessage.text}
              </p>
            )}
          </form>

          {/* Hero Subtitle */}
          <p className="text-white/75 text-xs sm:text-sm leading-relaxed px-4 max-w-md mx-auto font-sans mb-5">
            Discover the startups, funding, founders, and business moves shaping what comes next.
          </p>

          {/* Secondary CTA */}
          <Link
            href="/"
            className="liquid-glass rounded-full px-7 sm:px-8 py-2.5 sm:py-3 text-white text-xs sm:text-sm font-medium hover:bg-white/10 transition-all cursor-pointer inline-flex items-center justify-center shadow-lg"
          >
            Explore Venture Atlas
          </Link>
        </main>

        {/* SOCIAL / PLATFORM ICONS */}
        <div className="relative z-10 flex justify-center gap-3.5 sm:gap-4 pb-6 sm:pb-8 pt-2">
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Venture Atlas on LinkedIn"
            className="liquid-glass rounded-full p-3 sm:p-3.5 text-white/80 hover:text-white hover:bg-white/10 transition-all shadow-md"
          >
            <Linkedin size={18} className="sm:w-5 sm:h-5" />
          </a>
          <a
            href="https://x.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Venture Atlas on X"
            className="liquid-glass rounded-full p-3 sm:p-3.5 text-white/80 hover:text-white hover:bg-white/10 transition-all shadow-md flex items-center justify-center"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="sm:w-5 sm:h-5">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
          <a
            href="#about"
            aria-label="Venture Atlas Global Directory"
            className="liquid-glass rounded-full p-3 sm:p-3.5 text-white/80 hover:text-white hover:bg-white/10 transition-all shadow-md"
          >
            <Globe size={18} className="sm:w-5 sm:h-5" />
          </a>
        </div>
      </div>

      {/* SECTION 2 — ABOUT VENTURE ATLAS */}
      <AboutSection />

      {/* SECTION 3 — FEATURED VIDEO / THE ATLAS */}
      <FeaturedVideoSection />

      {/* SECTION 4 — INTELLIGENCE × CONTEXT */}
      <PhilosophySection />

      {/* SECTION 5 — WHAT WE COVER */}
      <ServicesSection />

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-black py-12 sm:py-16 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <Link href="/" className="flex items-center group" title="Venture Atlas">
              <img
                src="/logo-dark.png"
                alt="Venture Atlas"
                className="h-7 sm:h-8 w-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity"
              />
            </Link>
            <span className="hidden sm:inline text-white/20">·</span>
            <span className="text-white/40 text-xs font-mono">
              Intelligence for the modern venture ecosystem
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-6 text-xs text-white/50 font-sans">
            <Link href="/" className="hover:text-white transition-colors">
              Live Feed
            </Link>
            <a href="#about" className="hover:text-white transition-colors">
              About
            </a>
            <a href="#cover" className="hover:text-white transition-colors">
              Startups
            </a>
            <a href="#philosophy" className="hover:text-white transition-colors">
              Signals
            </a>
            <Link href="/admin/login" className="hover:text-white transition-colors">
              Editorial Login
            </Link>
            <span className="text-white/20 hidden sm:inline">|</span>
            <span>© {new Date().getFullYear()} Venture Atlas</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingView;