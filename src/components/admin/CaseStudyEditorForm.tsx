'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CaseStudyItem, CategoryItem, ContentStatus, CanvasData } from '../../types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../providers/ToastProvider';
import { CanvasBlockEditor } from './CanvasBlockEditor';
import { ArrowLeft, Send, Palette, FileText } from 'lucide-react';

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

  const [editorMode, setEditorMode] = useState<'canvas' | 'standard'>('canvas');
  const [title, setTitle] = useState(
    initialCaseStudy?.title || 'CRED — Jab "Exclusive" Hi Business Model Ban Gaya'
  );
  const [company, setCompany] = useState(initialCaseStudy?.company || 'CRED');
  const [valuation, setValuation] = useState(initialCaseStudy?.valuation || '~ $6.4 Billion (Approx)');
  const [stage, setStage] = useState(initialCaseStudy?.stage || 'Scale / Unicorn');
  const [keyMetric, setKeyMetric] = useState(initialCaseStudy?.keyMetric || '$800+ Million');
  const [summary, setSummary] = useState(
    initialCaseStudy?.summary ||
      'Kunal Shah ne 2018 mein CRED launch kiya. Ye app sirf un logon ke liye hai jinka credit score achha hota hai. Users credit card bill pay karte hain, rewards/coins milte hain, jo brands discounts mein use hote hain.'
  );
  const [challenge, setChallenge] = useState(
    initialCaseStudy?.challenge ||
      'Har business sabke liye nahi hota. Kabhi-kabhi exclusivity hi sabse badi strength ban jaati hai. Growth aur monetization dono balance hona zaroori hai.'
  );
  const [strategy, setStrategy] = useState(
    initialCaseStudy?.strategy ||
      'Seed Round (2018) → Series A → Series B → Series C → Series D → Series E → Series F+\nLead Investors: Sequoia Capital, Tiger Global, SoftBank, Coatue, Falcon Edge, Steadview Capital, GIC, RTP Global & others'
  );
  const [outcome, setOutcome] = useState(
    initialCaseStudy?.outcome ||
      'CRED ne sirf ek app nahi, ek movement create kiya hai — Status, Trust aur Exclusivity.'
  );
  const [body, setBody] = useState(initialCaseStudy?.body || summary);
  const [authorName, setAuthorName] = useState(initialCaseStudy?.authorName || 'Aditya Poddar');
  const [authorRole, setAuthorRole] = useState(initialCaseStudy?.authorRole || 'Senior Venture Analyst');
  const [categoryId, setCategoryId] = useState(
    initialCaseStudy?.categoryId || categories[0]?.id || ''
  );
  const [coverImage, setCoverImage] = useState(
    initialCaseStudy?.coverImage ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'
  );
  const [readTimeMinutes, setReadTimeMinutes] = useState(initialCaseStudy?.readTimeMinutes || 4);
  const [status, setStatus] = useState<ContentStatus>(initialCaseStudy?.status || 'PUBLISHED');
  const [submitting, setSubmitting] = useState(false);

  // Canvas visual blocks state
  const [canvasData, setCanvasData] = useState<CanvasData | null>(
    initialCaseStudy?.canvasData || {
      header: {
        founderPhoto: coverImage,
        companyLogo: '',
        tagline: 'PAY BILLS. EARN REWARDS. BUILD TRUST.',
        bannerBg: '#09090b',
      },
      metrics: [
        { id: 'm1', label: 'Founded', value: '2018', icon: 'calendar' },
        { id: 'm2', label: 'Valuation', value: valuation || '~ $6.4 Billion', subValue: '(Approx)', icon: 'unicorn' },
        { id: 'm3', label: 'Total Funding', value: keyMetric || '$800+ Million', subValue: '(Approx)', icon: 'funding' },
        { id: 'm4', label: 'Headquarters', value: 'Bengaluru', subValue: 'India', icon: 'building' },
      ],
      profile: {
        founderName: 'Kunal Shah',
        founderRole: 'Founder & CEO, CRED',
        businessModelTitle: 'Business Model',
        businessModelPoints: [
          'Lending (Credit line, loans, EMI)',
          'Brand Partnerships',
          'Financial Products (CRED Pay, Store, Credit Score Check etc.)',
        ],
      },
      calloutBoxes: [
        {
          id: 'b1',
          title: 'Funding Journey',
          content: strategy || 'Seed Round (2018) → Series A → Series B → Series C → Series D → Series E → Series F+\nLead Investors: Sequoia Capital, Tiger Global, SoftBank, Coatue, Falcon Edge, Steadview Capital, GIC, RTP Global & others',
          icon: 'trending',
          variant: 'green',
        },
        {
          id: 'b2',
          title: 'Business Lesson',
          content: challenge || 'Har business sabke liye nahi hota. Kabhi-kabhi exclusivity hi sabse badi strength ban jaati hai. Growth aur monetization dono balance hona zaroori hai.',
          icon: 'star',
          variant: 'blue',
        },
        {
          id: 'b3',
          title: 'Final Thought',
          content: outcome || 'CRED ne sirf ek app nahi, ek movement create kiya hai — Status, Trust aur Exclusivity.',
          icon: 'lightbulb',
          variant: 'amber',
        },
      ],
    }
  );

  const handleSubmit = async (targetStatus: ContentStatus) => {
    if (!title.trim() || !company.trim() || !summary.trim()) {
      toast('Please fill in title, company, and summary', 'error');
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
      authorName: authorName.trim() || 'Aditya Poddar',
      authorRole: authorRole.trim() || 'Senior Venture Analyst',
      body: body.trim() || summary,
      categoryId,
      coverImage: coverImage.trim() || null,
      readTimeMinutes: Number(readTimeMinutes),
      status: targetStatus,
      canvasData,
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
        window.location.href = '/admin/case-studies';
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
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
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

        {/* Studio Switcher & Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-surface-muted p-1 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setEditorMode('canvas')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-colors ${
                editorMode === 'canvas' ? 'bg-brand text-white shadow-xs' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Palette size={14} />
              <span>Canvas Visual Studio</span>
            </button>
            <button
              type="button"
              onClick={() => setEditorMode('standard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-colors ${
                editorMode === 'standard' ? 'bg-text-primary text-background shadow-xs' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <FileText size={14} />
              <span>Structured Meta</span>
            </button>
          </div>

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

      {/* Mode 1: Visual Canvas Studio */}
      {editorMode === 'canvas' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl border border-border bg-surface shadow-card space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Company Name"
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="e.g. CRED / Stripe"
                required
              />
              <div className="sm:col-span-2">
                <Input
                  label="Headline Title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. CRED — Jab 'Exclusive' Hi Business Model Ban Gaya"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono font-bold uppercase text-text-tertiary block mb-1">
                Overview Story Narrative
              </label>
              <textarea
                rows={2}
                value={summary}
                onChange={e => setSummary(e.target.value)}
                placeholder="Kunal Shah ne 2018 mein CRED launch kiya..."
                className="w-full text-xs font-body p-3 bg-surface-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand resize-none"
              />
            </div>

            {/* Writer Attribution */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/60">
              <Input
                label="Writer / Author Name"
                value={authorName}
                onChange={e => setAuthorName(e.target.value)}
                placeholder="e.g. Aditya Poddar"
              />
              <Input
                label="Writer Editorial Title"
                value={authorRole}
                onChange={e => setAuthorRole(e.target.value)}
                placeholder="e.g. Senior Venture Analyst"
              />
            </div>
          </div>

          {/* Visual Canvas Block Editor */}
          <CanvasBlockEditor
            value={canvasData}
            onChange={setCanvasData}
            title={title}
            summary={summary}
          />
        </div>
      )}

      {/* Mode 2: Standard Structured Meta */}
      {editorMode === 'standard' && (
        <div className="p-6 sm:p-8 rounded-3xl ios-card space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Company Name"
              value={company}
              onChange={e => setCompany(e.target.value)}
              placeholder="e.g. CRED / Stripe"
              required
            />
            <Input
              label="Current Valuation"
              value={valuation}
              onChange={e => setValuation(e.target.value)}
              placeholder="e.g. ~ $6.4 Billion (Approx)"
            />
          </div>

          <Input
            label="Case Study Headline"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. CRED — Jab 'Exclusive' Hi Business Model Ban Gaya"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Company Stage"
              value={stage}
              onChange={e => setStage(e.target.value)}
              placeholder="e.g. Unicorn / Growth"
            />
            <Input
              label="Total Funding / Key Metric"
              value={keyMetric}
              onChange={e => setKeyMetric(e.target.value)}
              placeholder="e.g. $800+ Million"
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
              Executive Summary / Narrative
            </label>
            <textarea
              rows={3}
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="Brief overview explaining what makes this company's execution extraordinary..."
              className="w-full text-sm p-3 rounded-xl border border-border bg-surface-muted focus:outline-none focus:ring-2 focus:ring-text-primary"
            />
          </div>

          <Input
            label="Cover Image URL"
            type="url"
            value={coverImage}
            onChange={e => setCoverImage(e.target.value)}
            placeholder="https://images.unsplash.com/..."
          />
        </div>
      )}
    </div>
  );
};
