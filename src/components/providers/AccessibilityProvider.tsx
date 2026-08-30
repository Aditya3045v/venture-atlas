'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type FontSizeOption = 'sm' | 'base' | 'lg' | 'xl';
export type TTSSpeedOption = 0.8 | 1.0 | 1.2 | 1.5;

interface AccessibilityContextType {
  fontSize: FontSizeOption;
  setFontSize: (size: FontSizeOption) => void;
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  reduceMotion: boolean;
  setReduceMotion: (enabled: boolean) => void;
  dyslexicFont: boolean;
  setDyslexicFont: (enabled: boolean) => void;
  ttsSpeed: TTSSpeedOption;
  setTtsSpeed: (speed: TTSSpeedOption) => void;
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  resetAll: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontSize, setFontSizeState] = useState<FontSizeOption>('base');
  const [highContrast, setHighContrastState] = useState<boolean>(false);
  const [reduceMotion, setReduceMotionState] = useState<boolean>(false);
  const [dyslexicFont, setDyslexicFontState] = useState<boolean>(false);
  const [ttsSpeed, setTtsSpeedState] = useState<TTSSpeedOption>(1.0);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const savedFontSize = (localStorage.getItem('va_font_size') as FontSizeOption) || 'base';
    const savedHighContrast = localStorage.getItem('va_high_contrast') === 'true';
    const savedReduceMotion = localStorage.getItem('va_reduce_motion') === 'true';
    const savedDyslexicFont = localStorage.getItem('va_dyslexic_font') === 'true';
    const savedTtsSpeed = Number(localStorage.getItem('va_tts_speed')) || 1.0;

    setFontSizeState(savedFontSize);
    setHighContrastState(savedHighContrast);
    setReduceMotionState(savedReduceMotion);
    setDyslexicFontState(savedDyslexicFont);
    setTtsSpeedState(savedTtsSpeed as TTSSpeedOption);

    applyStyles(savedFontSize, savedHighContrast, savedReduceMotion, savedDyslexicFont);
  }, []);

  const applyStyles = (
    size: FontSizeOption,
    contrast: boolean,
    motion: boolean,
    dyslexic: boolean
  ) => {
    const root = document.documentElement;

    // Font Size
    root.classList.remove('font-size-sm', 'font-size-base', 'font-size-lg', 'font-size-xl');
    root.classList.add(`font-size-${size}`);

    // High Contrast
    if (contrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Reduce Motion
    if (motion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Dyslexic Font
    if (dyslexic) {
      root.classList.add('dyslexic-mode');
    } else {
      root.classList.remove('dyslexic-mode');
    }
  };

  const setFontSize = (size: FontSizeOption) => {
    setFontSizeState(size);
    localStorage.setItem('va_font_size', size);
    applyStyles(size, highContrast, reduceMotion, dyslexicFont);
  };

  const setHighContrast = (enabled: boolean) => {
    setHighContrastState(enabled);
    localStorage.setItem('va_high_contrast', String(enabled));
    applyStyles(fontSize, enabled, reduceMotion, dyslexicFont);
  };

  const setReduceMotion = (enabled: boolean) => {
    setReduceMotionState(enabled);
    localStorage.setItem('va_reduce_motion', String(enabled));
    applyStyles(fontSize, highContrast, enabled, dyslexicFont);
  };

  const setDyslexicFont = (enabled: boolean) => {
    setDyslexicFontState(enabled);
    localStorage.setItem('va_dyslexic_font', String(enabled));
    applyStyles(fontSize, highContrast, reduceMotion, enabled);
  };

  const setTtsSpeed = (speed: TTSSpeedOption) => {
    setTtsSpeedState(speed);
    localStorage.setItem('va_tts_speed', String(speed));
  };

  const resetAll = () => {
    setFontSize('base');
    setHighContrast(false);
    setReduceMotion(false);
    setDyslexicFont(false);
    setTtsSpeed(1.0);
  };

  return (
    <AccessibilityContext.Provider
      value={{
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
        modalOpen,
        setModalOpen,
        resetAll,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
