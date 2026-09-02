'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function WelcomeOverlayInner() {
  const searchParams = useSearchParams();
  const showWelcome = searchParams.get('welcome') === '1';

  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (showWelcome) {
      setVisible(true);

      // Clean the query param immediately so refresh doesn't replay
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);

      // Auto-dismiss after 1.8 seconds
      const fadeTimer = setTimeout(() => {
        setFading(true);
      }, 1400);

      const hideTimer = setTimeout(() => {
        setVisible(false);
      }, 1900);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setVisible(false);
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [showWelcome]);

  if (!visible) return null;

  return (
    <div
      onClick={() => setVisible(false)}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg cursor-pointer transition-opacity duration-500 select-none ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="Welcome overlay (click or press Esc to skip)"
      role="dialog"
    >
      <div className="text-center space-y-4 max-w-sm px-6 animate-fadeIn">
        <div className="flex justify-center">
          <img
            src="/logo-dark.png"
            alt="Venture Atlas"
            className="h-14 w-auto object-contain drop-shadow-md"
          />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white uppercase">
            Welcome to Venture Atlas
          </h2>
          <p className="text-xs font-mono text-amber-400 font-medium">
            Startup & Venture Intelligence in 60 Words
          </p>
        </div>
        <p className="text-[11px] font-mono text-neutral-400 pt-2">
          Tap anywhere or press <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300">Esc</kbd> to enter
        </p>
      </div>
    </div>
  );
}

export const WelcomeOverlay: React.FC = () => {
  return (
    <Suspense fallback={null}>
      <WelcomeOverlayInner />
    </Suspense>
  );
};
