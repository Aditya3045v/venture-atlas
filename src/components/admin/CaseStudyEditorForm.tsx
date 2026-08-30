'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CaseStudyItem, CategoryItem, ContentStatus } from '../../types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../providers/ToastProvider';
import { ArrowLeft, Send } from 'lucide-react';

interface CaseStudyEditorFormProps {
  initialCaseStudy?: CaseStudyItem | null;
  categories: CategoryItem[];
}

export const CaseStudyEditorForm: React.FC<CaseStudyEditorFormProps> = ({
  initialCaseStudy,
  categories,
}) => {
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = useState(initialCaseStudy?.title || '');
  const [company, setCompany] = useState(initialCaseStudy?.company || '');
  const [valuation, setValuation] = useState(initialCaseStudy?.valuation || '');
  const [stage, setStage] = useState(initialCaseStudy?.stage || '');
  const [keyMetric, setKeyMetric] = useState(initialCaseStudy?.keyMetric || '');
  const [summary, setSummary] = useState(initialCaseStudy?.summary || '');
  const [challenge, setChallenge] = useState(initialCaseStudy?.challenge || '');
  const [strategy, setStrategy] = useState(initialCaseStudy?.strategy || '');
  const [outcome, setOutcome] = useState(initialCaseStudy?.outcome || '');
  const [body, setBody] = useState(initialCaseStudy?.body || '');
  const [categoryId, setCategoryId] = useState(
    initialCaseStudy?.categoryId || categories[0]?.id || ''
  );
  const [coverImage, setCoverImage] = useState(initialCaseStudy?.coverImage || '');
  const [readTimeMinutes, setReadTimeMinutes] = useState(initialCaseStudy?.readTimeMinutes || 8);
  const [status, setStatus] = useState<ContentStatus>(initialCaseStudy?.status || 'PUBLISHED');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (targetStatus: ContentStatus) => {
    if (!title.trim() || !company.trim() || !summary.trim() || !body.trim()) {
      toast('Please fill in title, company, summary, and body', 'error');
      return;
    }

    setSubmitting(true);
    const payload = {
      title,
      company,
      valuation,
      stage,
      keyMetric,
      summary,
      challenge,
      strategy,
      outcome,
      body,
      categoryId,
      coverImage: coverImage.trim() || null,
      readTimeMinutes: Number(readTimeMinutes),
      status: targetStatus,
    };

    try {
      const url = initialCaseStudy
        ? `/api/case-studies/${initialCaseStudy.id}`
        : '/api/case-studies';
      const method = initialCaseStudy ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast('Case study saved successfully', 'success');
        router.push('/admin/case-studies');
        router.refresh();
      } else {
        const data = await res.json();
        toast(data.error || 'Failed to save case study', 'error');
      }
    } catch {
      toast('Network error saving case study', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 rounded-xl border border-border bg-surface text-text-secondary hover:text-text-primary"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="text-xs font-mono font-bold uppercase text-text-tertiary">
              {initialCaseStudy ? 'EDITING CASE STUDY' : 'CREATE STARTUP CASE STUDY'}
            </div>
            <h1 className="text-2xl font-black font-display uppercase tracking-tight text-text-primary">
              {initialCaseStudy ? 'Update Case Study' : 'New Company Teardown'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSubmit('DRAFT')}
            isLoading={submitting}
          >
            Save Draft
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => handleSubmit('PUBLISHED')}
            isLoading={submitting}
          >
            Publish Teardown
          </Button>
        </div>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl ios-card space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Company Name"
            value={company}
            onChange={e => setCompany(e.target.value)}
            placeholder="e.g. Stripe / Figma / Ramp"
            required
          />
          <Input
            label="Current Valuation"
            value={valuation}
            onChange={e => setValuation(e.target.value)}
            placeholder="e.g. $65 Billion"
          />
        </div>

        <Input
          label="Case Study Headline"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g. Stripe: The Architecture of a $1 Trillion Payment Processing Rails"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Company Stage"
            value={stage}
            onChange={e => setStage(e.target.value)}
            placeholder="e.g. Pre-IPO / Series B"
          />
          <Input
            label="Key Scale Metric"
            value={keyMetric}
            onChange={e => setKeyMetric(e.target.value)}
            placeholder="e.g. $1T Annual TPV"
          />
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary font-mono mb-1.5">
              Category Desk
            </label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full h-10 px-3 text-xs font-mono font-bold rounded-xl border border-border bg-surface-muted text-text-primary focus:outline-none focus:ring-2 focus:ring-text-primary"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary font-mono">
            Executive Summary / Core Thesis
          </label>
          <textarea
            rows={3}
            value={summary}
            onChange={e => setSummary(e.target.value)}
            placeholder="Brief overview explaining what makes this company's execution extraordinary..."
            className="w-full text-sm p-3 rounded-xl border border-border bg-surface-muted focus:outline-none focus:ring-2 focus:ring-text-primary"
          />
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-bold uppercase text-red-400">
              1. The Challenge
            </label>
            <textarea
              rows={3}
              value={challenge}
              onChange={e => setChallenge(e.target.value)}
              placeholder="What initial market bottleneck were they solving?"
              className="w-full text-xs p-3 rounded-xl border border-border bg-surface-muted focus:outline-none focus:ring-2 focus:ring-text-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-bold uppercase text-blue-400">
              2. The Playbook
            </label>
            <textarea
              rows={3}
              value={strategy}
              onChange={e => setStrategy(e.target.value)}
              placeholder="What strategic or architectural leap did they execute?"
              className="w-full text-xs p-3 rounded-xl border border-border bg-surface-muted focus:outline-none focus:ring-2 focus:ring-text-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-bold uppercase text-emerald-400">
              3. The Outcome
            </label>
            <textarea
              rows={3}
              value={outcome}
              onChange={e => setOutcome(e.target.value)}
              placeholder="Key financial and customer numbers achieved?"
              className="w-full text-xs p-3 rounded-xl border border-border bg-surface-muted focus:outline-none focus:ring-2 focus:ring-text-primary"
            />
          </div>
        </div>

        <Input
          label="Cover Image URL"
          type="url"
          value={coverImage}
          onChange={e => setCoverImage(e.target.value)}
          placeholder="https://images.unsplash.com/..."
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary font-mono">
            Full Deep Dive Body (Markdown)
          </label>
          <textarea
            rows={14}
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="### 1. The Core Architecture&#10;&#10;Detailed breakdown..."
            className="w-full text-sm font-mono p-3.5 rounded-xl border border-border bg-surface-muted focus:outline-none focus:ring-2 focus:ring-text-primary"
          />
        </div>
      </div>
    </div>
  );
};
