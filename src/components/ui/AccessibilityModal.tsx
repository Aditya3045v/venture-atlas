'use client';

import React from 'react';
import { useAccessibility, FontSizeOption, TTSSpeedOption } from '../providers/AccessibilityProvider';
import { Modal } from './Modal';
import { Switch } from './Switch';
import { Button } from './Button';
import {
  Sliders,
  Type,
  Eye,
  Volume2,
  RotateCcw,
  Check,
  Zap,
} from 'lucide-react';

export const AccessibilityModal: React.FC = () => {
  const {
    modalOpen,
    setModalOpen,
    fontSize,
    setFontSize,
    highContrast,
    setHighContrast,
    reduceMotion,
    setReduceMotion,
    dyslexicFont,
    setDyslexicFont,
    ttsSpeed,
    setTtsSpeed,
    resetAll,
  } = useAccessibility();

  const fontOptions: { label: string; value: FontSizeOption }[] = [
    { label: 'Small', value: 'sm' },
    { label: 'Default', value: 'base' },
    { label: 'Large', value: 'lg' },
    { label: 'XL', value: 'xl' },
  ];

  const ttsOptions: TTSSpeedOption[] = [0.8, 1.0, 1.2, 1.5];

  return (
    <Modal
      isOpen={modalOpen}
      onClose={() => setModalOpen(false)}
      title="Accessibility & Reader Preferences"
      size="md"
    >
      <div className="space-y-6 select-none">
        {/* 1. Font Size Control */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-text-primary">
            <Type size={15} className="text-amber-400" />
            <span>Reading Font Size</span>
          </div>
          <div className="grid grid-cols-4 gap-2 bg-surface-muted/60 p-1.5 rounded-2xl border border-border/60">
            {fontOptions.map(opt => {
              const active = fontSize === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setFontSize(opt.value)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold font-mono transition-all active:scale-95 flex items-center justify-center gap-1 ${
                    active
                      ? 'bg-amber-400 text-black shadow-sm font-black'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                  }`}
                >
                  {active && <Check size={12} />}
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Dyslexia-Friendly & Spacing */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl border border-border/70 bg-surface-muted/40">
          <div className="space-y-0.5">
            <div className="text-xs font-bold font-mono text-text-primary uppercase flex items-center gap-1.5">
              <Type size={14} className="text-blue-400" />
              <span>Dyslexia-Friendly Typography</span>
            </div>
            <p className="text-[11px] font-body text-text-tertiary">
              Increases letter tracking, word spacing, and line height for effortless scanning.
            </p>
          </div>
          <Switch checked={dyslexicFont} onChange={setDyslexicFont} />
        </div>

        {/* 3. High Contrast Mode */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl border border-border/70 bg-surface-muted/40">
          <div className="space-y-0.5">
            <div className="text-xs font-bold font-mono text-text-primary uppercase flex items-center gap-1.5">
              <Eye size={14} className="text-emerald-400" />
              <span>Maximum High Contrast (WCAG AAA)</span>
            </div>
            <p className="text-[11px] font-body text-text-tertiary">
              Enhances text sharpness and borders for optimal readability.
            </p>
          </div>
          <Switch checked={highContrast} onChange={setHighContrast} />
        </div>

        {/* 4. Reduce Motion */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl border border-border/70 bg-surface-muted/40">
          <div className="space-y-0.5">
            <div className="text-xs font-bold font-mono text-text-primary uppercase flex items-center gap-1.5">
              <Zap size={14} className="text-purple-400" />
              <span>Reduce Micro-Animations</span>
            </div>
            <p className="text-[11px] font-body text-text-tertiary">
              Disables card hover scaling, pulses, and transition springs.
            </p>
          </div>
          <Switch checked={reduceMotion} onChange={setReduceMotion} />
        </div>

        {/* 5. TTS Audio Playback Speed */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-text-primary">
            <Volume2 size={15} className="text-amber-400" />
            <span>Audio Briefing Speed</span>
          </div>
          <div className="grid grid-cols-4 gap-2 bg-surface-muted/60 p-1.5 rounded-2xl border border-border/60">
            {ttsOptions.map(speed => {
              const active = ttsSpeed === speed;
              return (
                <button
                  key={speed}
                  onClick={() => setTtsSpeed(speed)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold font-mono transition-all active:scale-95 flex items-center justify-center gap-1 ${
                    active
                      ? 'bg-amber-400 text-black shadow-sm font-black'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                  }`}
                >
                  {active && <Check size={12} />}
                  <span>{speed}x</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Reset & Done Actions */}
        <div className="pt-3 border-t border-border/60 flex items-center justify-between">
          <button
            onClick={resetAll}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-text-tertiary hover:text-text-primary transition-colors"
          >
            <RotateCcw size={13} />
            <span>Reset Defaults</span>
          </button>

          <Button
            size="sm"
            variant="primary"
            onClick={() => setModalOpen(false)}
          >
            Apply & Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
