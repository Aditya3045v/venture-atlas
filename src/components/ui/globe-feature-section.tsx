'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Radio } from 'lucide-react';
import createGlobe, { COBEOptions } from 'cobe';
import { cn } from '@/lib/utils';

const GLOBE_CONFIG = {
  width: 800,
  height: 800,
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 1,
  diffuse: 0.4,
  mapSamples: 16000,
  mapBrightness: 1.2,
  baseColor: [0.12, 0.12, 0.14],
  markerColor: [250 / 255, 204 / 255, 21 / 255], // Radiant Cyber Yellow #FACC15
  glowColor: [0.18, 0.18, 0.22],
  markers: [
    { location: [37.7749, -122.4194], size: 0.1 }, // San Francisco
    { location: [40.7128, -74.006], size: 0.09 }, // New York
    { location: [51.5074, -0.1278], size: 0.08 }, // London
    { location: [52.52, 13.405], size: 0.06 }, // Berlin
    { location: [32.0853, 34.7818], size: 0.07 }, // Tel Aviv
    { location: [12.9716, 77.5946], size: 0.09 }, // Bangalore
    { location: [1.3521, 103.8198], size: 0.08 }, // Singapore
    { location: [35.6762, 139.6503], size: 0.07 }, // Tokyo
    { location: [-1.2921, 36.8219], size: 0.06 }, // Nairobi
    { location: [-23.5505, -46.6333], size: 0.07 }, // Sao Paulo
  ],
};

export function Globe({
  className,
  config = GLOBE_CONFIG,
}: {
  className?: string;
  config?: Record<string, any>;
}) {
  let phi = 0;
  let width = 0;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const [r, setR] = useState(0);

  const updatePointerInteraction = (value: number | null) => {
    pointerInteracting.current = value;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value !== null ? 'grabbing' : 'grab';
    }
  };

  const updateMovement = (clientX: number) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current;
      pointerInteractionMovement.current = delta;
      setR(delta / 200);
    }
  };

  const onRender = useCallback(
    (state: Record<string, any>) => {
      if (!pointerInteracting.current) phi += 0.0035;
      state.phi = phi + r;
      state.width = width * 2;
      state.height = width * 2;
    },
    [r]
  );

  const onResize = () => {
    if (canvasRef.current) {
      width = canvasRef.current.offsetWidth;
    }
  };

  useEffect(() => {
    window.addEventListener('resize', onResize);
    onResize();

    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      ...config,
      width: width * 2,
      height: width * 2,
      onRender,
    } as any);

    setTimeout(() => {
      if (canvasRef.current) {
        canvasRef.current.style.opacity = '1';
      }
    });

    return () => {
      globe.destroy();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div
      className={cn(
        'relative mx-auto aspect-[1/1] w-full max-w-[480px] h-[300px] sm:h-[360px] md:h-[400px]',
        className
      )}
    >
      <canvas
        className={cn(
          'w-full h-full opacity-0 transition-opacity duration-700 [contain:layout_paint_size]'
        )}
        ref={canvasRef}
        onPointerDown={e =>
          updatePointerInteraction(
            e.clientX - pointerInteractionMovement.current
          )
        }
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={e => updateMovement(e.clientX)}
        onTouchMove={e =>
          e.touches[0] && updateMovement(e.touches[0].clientX)
        }
      />
    </div>
  );
}

export default function GlobeFeatureSection() {
  return (
    <section className="relative w-full mx-auto overflow-hidden rounded-3xl ios-card bg-surface-muted/60 dark:bg-[#0D0D0F] border border-border/80 shadow-2xl px-6 py-10 md:px-12 md:py-14 my-10 select-none">
      <div className="flex flex-col-reverse items-center justify-between gap-8 md:flex-row relative z-10">
        <div className="max-w-xl text-left space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Radio size={13} className="animate-pulse" />
            <span>GLOBAL VENTURE RADAR</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-display text-text-primary leading-tight uppercase tracking-tight">
            Sovereign Market Intelligence
          </h2>

          <p className="text-sm md:text-base text-text-secondary font-body leading-relaxed max-w-lg font-normal">
            Real-time reporting across Silicon Valley, London, Singapore, Bangalore, and global startup ecosystems. Verified primary filings, venture rounds, and 60-word briefs delivered continuously.
          </p>

          <div className="pt-2">
            <Link href="/">
              <Button className="inline-flex items-center gap-2 rounded-full bg-text-primary text-background dark:bg-amber-400 dark:text-black px-6 py-2.5 text-xs font-mono font-bold uppercase tracking-wider transition-all hover:opacity-90 active:scale-95 shadow-md">
                <span>Explore Live Wire</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative w-full max-w-sm md:max-w-md flex items-center justify-center">
          <Globe />
        </div>
      </div>
    </section>
  );
}
