'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Play, Pause, X, Volume2, FastForward } from 'lucide-react';

interface AudioTrack {
  id: string;
  title: string;
  author?: string;
  text: string;
}

interface AudioPlayerContextType {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  speed: number;
  playTrack: (track: AudioTrack) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  stopTrack: () => void;
  setSpeed: (speed: number) => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType>({
  currentTrack: null,
  isPlaying: false,
  speed: 1.0,
  playTrack: () => {},
  pauseTrack: () => {},
  resumeTrack: () => {},
  stopTrack: () => {},
  setSpeed: () => {},
});

export const useAudioPlayer = () => useContext(AudioPlayerContext);

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeedState] = useState(1.0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stopTrack = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setCurrentTrack(null);
  };

  const playTrack = (track: AudioTrack) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    // Sanitize and clean markdown from text for smooth speech
    const cleanText = track.text
      .replace(/#+\s*/g, '')
      .replace(/\*\*/g, '')
      .replace(/>/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .trim();

    const fullUtteranceText = `${track.title}. ${cleanText}`;
    const utterance = new SpeechSynthesisUtterance(fullUtteranceText);
    utterance.rate = speed;

    utterance.onend = () => {
      setIsPlaying(false);
      setCurrentTrack(null);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setCurrentTrack(null);
    };

    utteranceRef.current = utterance;
    setCurrentTrack(track);
    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  const pauseTrack = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    }
  };

  const resumeTrack = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsPlaying(true);
      } else if (currentTrack) {
        playTrack(currentTrack);
      }
    }
  };

  const setSpeed = (newSpeed: number) => {
    setSpeedState(newSpeed);
    if (isPlaying && currentTrack) {
      // Restart with new speed
      playTrack(currentTrack);
    }
  };

  return (
    <AudioPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        speed,
        playTrack,
        pauseTrack,
        resumeTrack,
        stopTrack,
        setSpeed,
      }}
    >
      {children}

      {/* Persistent Floating Audio Bar */}
      {currentTrack && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-slideUp">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-neutral-900/95 text-white border border-white/20 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3">
            {/* Audio Wave Visualizer & Icon */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center shrink-0">
                <Volume2 size={18} className="text-blue-400 animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-mono uppercase text-blue-400 font-bold tracking-wider">
                  Audio Synthesis
                </div>
                <div className="text-xs font-bold font-display truncate max-w-[180px] sm:max-w-[200px]">
                  {currentTrack.title}
                </div>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Speed Cycle Button */}
              <button
                onClick={() => {
                  const nextSpeed = speed === 1.0 ? 1.25 : speed === 1.25 ? 1.5 : 1.0;
                  setSpeed(nextSpeed);
                }}
                className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-mono font-bold text-white transition-colors flex items-center gap-0.5"
                title="Playback Speed"
              >
                <FastForward size={10} />
                <span>{speed}x</span>
              </button>

              {/* Play / Pause Toggle */}
              <button
                onClick={isPlaying ? pauseTrack : resumeTrack}
                className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:bg-white/90 transition-transform active:scale-95 shadow-md"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={15} /> : <Play size={15} className="translate-x-0.5" />}
              </button>

              {/* Stop & Close */}
              <button
                onClick={stopTrack}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                title="Stop and Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </AudioPlayerContext.Provider>
  );
};
