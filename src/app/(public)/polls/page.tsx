'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Vote,
  BarChart3,
  TrendingUp,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Bell,
  Users,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useToast } from '@/components/providers/ToastProvider';

interface PollItem {
  id: string;
  category: string;
  categoryColor: string;
  question: string;
  description: string;
  totalVotes: number;
  closesIn: string;
  options: {
    id: string;
    text: string;
    percentage: number;
    votes: number;
  }[];
}

const PREVIEW_POLLS: PollItem[] = [
  {
    id: 'poll-1',
    category: 'UNICORN & IPO',
    categoryColor: '#3b82f6',
    question: 'Will Stripe IPO at or above $80B valuation in 2027?',
    description: 'Following their $65B tender offer and $1T+ annual processing volume milestone.',
    totalVotes: 1842,
    closesIn: '3 days left',
    options: [
      { id: 'p1-opt1', text: 'Yes, > $80B (Strong public market multiple)', percentage: 68, votes: 1252 },
      { id: 'p1-opt2', text: 'No, $60B - $75B (Conservative tech multiple)', percentage: 24, votes: 442 },
      { id: 'p1-opt3', text: 'Stays private / Secondary liquidity only', percentage: 8, votes: 148 },
    ],
  },
  {
    id: 'poll-2',
    category: 'AI COMPUTE & INFRA',
    categoryColor: '#10b981',
    question: 'Which AI infrastructure layer captures the highest gross margin in 2027?',
    description: 'Evaluating hardware compute, model foundational API providers, and vertical orchestration stacks.',
    totalVotes: 2419,
    closesIn: '5 days left',
    options: [
      { id: 'p2-opt1', text: 'Vertical Enterprise AI Workflows & Data Moats', percentage: 52, votes: 1258 },
      { id: 'p2-opt2', text: 'Proprietary Frontier Model Labs (OpenAI/Anthropic)', percentage: 29, votes: 701 },
      { id: 'p2-opt3', text: 'Silicon & Cloud Hyperscalers (Nvidia/AWS/GCP)', percentage: 19, votes: 460 },
    ],
  },
  {
    id: 'poll-3',
    category: 'EARLY STAGE & SEED',
    categoryColor: '#f59e0b',
    question: 'Will global Seed round valuations reset upward in Q4 2026?',
    description: 'Assessing the velocity of Series A follow-ons and dry powder deployment.',
    totalVotes: 984,
    closesIn: '6 days left',
    options: [
      { id: 'p3-opt1', text: 'Yes — High-conviction AI seed rounds lead the surge', percentage: 61, votes: 600 },
      { id: 'p3-opt2', text: 'No — Rigorous revenue milestones remain flat', percentage: 39, votes: 384 },
    ],
  },
];

export default function PollsPage() {
  const { toast } = useToast();
  const [votedPolls, setVotedPolls] = useState<Record<string, string>>({});
  const [emailInput, setEmailInput] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleVote = (pollId: string, optionId: string) => {
    if (votedPolls[pollId]) {
      toast('You already cast your preview vote for this deal poll!', 'info');
      return;
    }

    setVotedPolls(prev => ({ ...prev, [pollId]: optionId }));
    toast('Vote recorded in preview! Real-time community aggregation launching shortly.', 'success');
  };

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !emailInput.includes('@')) {
      toast('Please enter a valid work email address', 'error');
      return;
    }

    setIsSubscribed(true);
    toast('You are on the VIP early-access list for Deal Polls!', 'success');
    setEmailInput('');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-10">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={15} />
          <span>Return to Live Wire</span>
        </Link>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-muted text-brand border border-brand/20 text-xs font-mono font-bold uppercase tracking-wider animate-pulse">
          <Sparkles size={13} />
          <span>Upcoming Feature Preview</span>
        </span>
      </div>

      {/* Hero Header */}
      <div className="p-6 sm:p-10 rounded-3xl border border-border bg-gradient-to-br from-surface via-surface-muted/50 to-surface shadow-card relative overflow-hidden space-y-4">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-brand">
          <Vote size={16} />
          <span>EXECUTIVE SENTIMENT RADAR · Q4 2026</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display uppercase tracking-tight text-text-primary leading-[1.1]">
          Deal Polls & Market Sentiment
        </h1>

        <p className="text-sm sm:text-base text-text-secondary max-w-2xl font-body leading-relaxed">
          Cast real-time votes on venture valuations, IPO multiples, and breakout technology moats alongside <strong className="text-text-primary">24,000+</strong> verified founders, investors, and operators.
        </p>

        {/* Feature Pill Tags */}
        <div className="flex flex-wrap gap-2 pt-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface border border-border text-[11px] font-mono text-text-secondary">
            <Users size={12} className="text-blue-500" />
            Verified Investor Consensus
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface border border-border text-[11px] font-mono text-text-secondary">
            <BarChart3 size={12} className="text-emerald-500" />
            Live Breakdown Charts
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface border border-border text-[11px] font-mono text-text-secondary">
            <Zap size={12} className="text-amber-500" />
            Weekly Deal Forecasts
          </span>
        </div>
      </div>

      {/* Interactive Polls Preview Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-border/80 pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-brand" />
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-text-primary">
              Live Preview: Active Deal Radar
            </h2>
          </div>
          <span className="text-xs font-mono text-text-tertiary">
            Interactive Mock Demo
          </span>
        </div>

        <div className="space-y-6">
          {PREVIEW_POLLS.map(poll => {
            const hasVoted = Boolean(votedPolls[poll.id]);
            const selectedOption = votedPolls[poll.id];

            return (
              <div
                key={poll.id}
                className="p-6 rounded-2xl border border-border bg-surface shadow-card transition-all hover:border-text-tertiary space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider"
                    style={{
                      backgroundColor: `${poll.categoryColor}15`,
                      color: poll.categoryColor,
                      border: `1px solid ${poll.categoryColor}30`,
                    }}
                  >
                    {poll.category}
                  </span>
                  <span className="text-xs font-mono text-text-tertiary">
                    {poll.closesIn} · {poll.totalVotes.toLocaleString()} votes
                  </span>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-bold font-display text-text-primary">
                    {poll.question}
                  </h3>
                  <p className="text-xs sm:text-sm font-body text-text-secondary mt-1">
                    {poll.description}
                  </p>
                </div>

                {/* Poll Options */}
                <div className="space-y-2.5 pt-1">
                  {poll.options.map(option => {
                    const isSelected = selectedOption === option.id;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleVote(poll.id, option.id)}
                        className={`w-full relative overflow-hidden rounded-xl border p-3.5 text-left transition-all active:scale-[0.99] cursor-pointer ${
                          isSelected
                            ? 'border-brand bg-brand/10 shadow-xs'
                            : hasVoted
                            ? 'border-border/60 bg-surface-muted/40'
                            : 'border-border bg-surface-muted hover:bg-border/40 hover:border-text-secondary/50'
                        }`}
                      >
                        {/* Progress Bar Fill when voted */}
                        {hasVoted && (
                          <div
                            className="absolute top-0 left-0 bottom-0 bg-brand/15 transition-all duration-500 rounded-l-xl"
                            style={{ width: `${option.percentage}%` }}
                          />
                        )}

                        <div className="relative z-10 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] shrink-0 ${
                                isSelected
                                  ? 'border-brand bg-brand text-white'
                                  : 'border-text-tertiary bg-surface'
                              }`}
                            >
                              {isSelected && '✓'}
                            </span>
                            <span className="text-xs sm:text-sm font-medium text-text-primary">
                              {option.text}
                            </span>
                          </div>

                          {hasVoted && (
                            <span className="text-xs font-mono font-bold text-brand shrink-0">
                              {option.percentage}%
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Early Access Notification Callout */}
      <div className="p-6 sm:p-8 rounded-3xl border border-border bg-surface-muted/60 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mx-auto">
          <Bell size={22} />
        </div>

        <div className="space-y-1 max-w-md mx-auto">
          <h3 className="text-xl font-bold font-display uppercase tracking-tight text-text-primary">
            Get Notified When Polls Go Live
          </h3>
          <p className="text-xs text-text-secondary font-body">
            Receive instant weekly notifications for new deal polls, breakout sentiment signals, and venture consensus reports.
          </p>
        </div>

        {isSubscribed ? (
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-mono font-bold">
            <CheckCircle2 size={16} />
            <span>You are on the VIP Early Access List!</span>
          </div>
        ) : (
          <form onSubmit={handleNotifySubmit} className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto">
            <input
              type="email"
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              placeholder="Enter your work email..."
              className="w-full sm:w-auto flex-1 h-11 px-4 rounded-full bg-surface border border-border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand"
            />
            <button
              type="submit"
              className="w-full sm:w-auto h-11 px-6 rounded-full bg-text-primary text-background text-xs font-mono font-bold uppercase tracking-wider hover:opacity-90 transition-all active:scale-95 shrink-0"
            >
              Notify Me
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
