'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CaseStudyItem, CategoryItem, ContentStatus, CanvasData } from '../../types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../providers/ToastProvider';
import { CanvasBlockEditor } from './CanvasBlockEditor';
import { ArrowLeft, Send, Palette, FileText, Image as ImageIcon, X, Sparkles } from 'lucide-react';

interface CaseStudyEditorFormProps {
  initialCaseStudy?: CaseStudyItem | null;
  categories: CategoryItem[];
}

const COVER_PRESETS = [
  {
    label: '🦄 Unicorn Scale',
    url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
    credit: 'Unsplash / Enterprise Lens',
  },
  {
    label: '📈 Capital Markets',
    url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    credit: 'Unsplash / Capital Markets',
  },
  {
    label: '⚡ AI & Compute',
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    credit: 'Unsplash / Compute Lab',
  },
  {
    label: '🌐 Crypto Protocol',
    url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80',
    credit: 'Unsplash / Web3 Protocol',
  },
  {
    label: '👤 Founder Leadership',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
    credit: 'Unsplash / Founder Archive',
  },
  {
    label: '🏢 Modern Enterprise',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    credit: 'Unsplash / Architecture',
  },
];

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
  const [valuation, setValuation] = useState(initialCaseStudy?.valuation || '$6.4B');
  const [stage, setStage] = useState(initialCaseStudy?.stage || 'Series F');
  const [keyMetric, setKeyMetric] = useState(
    initialCaseStudy?.keyMetric || '$800M+ Raised'
  );
  const [summary, setSummary] = useState(
    initialCaseStudy?.summary ||
      'CRED ne India ke top credit card holders ko ek platform par lakar high-trust consumer network banaya.'
  );
  const [challenge, setChallenge] = useState(
    initialCaseStudy?.challenge ||
      'High-trust user base build karna aur unhe daily active rakhna.'
  );
  const [strategy, setStrategy] = useState(
    initialCaseStudy?.strategy ||
      'CRED Coins, reward drops, IPL campaigns aur exclusivity factor.'
  );
  const [outcome, setOutcome] = useState(
    initialCaseStudy?.outcome ||
      '6.4B valuation, millions of premium users, lending & merchant monetization.'
  );
  const [authorName, setAuthorName] = useState(initialCaseStudy?.authorName || 'Aditya Poddar');
  const [authorRole, setAuthorRole] = useState(initialCaseStudy?.authorRole || 'Senior Venture Analyst');
  const [body, setBody] = useState(initialCaseStudy?.body || '');
  const [categoryId, setCategoryId] = useState(
    initialCaseStudy?.categoryId || categories[0]?.id || ''
  );
  const [coverImage, setCoverImage] = useState(
    initialCaseStudy?.coverImage ||
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80'
  );
  const [photoCredit, setPhotoCredit] = useState(initialCaseStudy?.photoCredit || '');
  const [seoTitle, setSeoTitle] = useState(initialCaseStudy?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(initialCaseStudy?.seoDescription || '');
  const [coverPreviewDevice, setCoverPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
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
          title: 'Core Secret',
          content: strategy || 'High-trust, creditworthy individuals ka network monetize karna — unhe exclusive rewards aur premium financial products offer karke.',
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

    if (targetStatus === 'PUBLISHED') {
      if (coverImage.trim() && !photoCredit.trim()) {
        toast('Publishing blocked: Cover image alt text / attribution is required before publishing.', 'error');
        return;
      }
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
      photoCredit: photoCredit.trim() || null,
      readTimeMinutes: Number(readTimeMinutes),
      status: targetStatus,
      seoTitle: seoTitle.trim() || null,
      seoDescription: seoDescription.trim() || null,
      canvasData,
    };

    try {
      const url = initialCaseStudy ? `/api/case-studies/${initialCaseStudy.id}` : '/api/case-studies';
      const method = initialCaseStudy ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast('Case study teardown saved successfully', 'success');
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

  const renderCoverPhotoCard = () => (
    <div className="p-4 rounded-xl border border-border bg-surface-muted/50 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ImageIcon size={15} className="text-brand" />
          <label className="text-xs font-mono font-bold uppercase text-text-primary">
            Cover Photo & Teardown Media
          </label>
        </div>
        {coverImage && (
          <button
            type="button"
            onClick={() => setCoverImage('')}
            className="text-[10px] font-mono text-red-500 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <X size={11} /> Clear Photo
          </button>
        )}
      </div>

      {/* Recommended Dimensions Guide */}
      <div className="p-3 rounded-xl bg-surface-muted/70 border border-border space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-[11px] font-mono font-bold uppercase text-text-primary flex items-center gap-1.5">
            <Sparkles size={13} className="text-amber-500" />
            Recommended Image Upload Specifications
          </span>
          <div className="flex items-center gap-1 bg-surface p-0.5 rounded-lg border border-border text-[10px] font-mono font-bold">
            <button
              type="button"
              onClick={() => setCoverPreviewDevice('desktop')}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                coverPreviewDevice === 'desktop'
                  ? 'bg-brand text-white shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              🖥️ Desktop (16:9)
            </button>
            <button
              type="button"
              onClick={() => setCoverPreviewDevice('mobile')}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                coverPreviewDevice === 'mobile'
                  ? 'bg-brand text-white shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              📱 Mobile (4:5)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono">
          <div
            onClick={() => setCoverPreviewDevice('desktop')}
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              coverPreviewDevice === 'desktop'
                ? 'border-brand/60 bg-brand/10 text-text-primary ring-1 ring-brand/30'
                : 'border-border/60 bg-surface/50 text-text-secondary'
            }`}
          >
            <span className="font-bold block text-text-primary">🖥️ Desktop Hero: 1200 × 675 px (16:9)</span>
            <span className="text-text-tertiary">Landscape teardown banner for desktop monitors</span>
          </div>
          <div
            onClick={() => setCoverPreviewDevice('mobile')}
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              coverPreviewDevice === 'mobile'
                ? 'border-brand/60 bg-brand/10 text-text-primary ring-1 ring-brand/30'
                : 'border-border/60 bg-surface/50 text-text-secondary'
            }`}
          >
            <span className="font-bold block text-text-primary">📱 Mobile Feed: 1080 × 1350 px (4:5)</span>
            <span className="text-text-tertiary">Portrait card for mobile feeds & carousels</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-7 space-y-2">
          <input
            type="url"
            value={coverImage}
            onChange={e => setCoverImage(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="w-full text-xs font-mono p-2.5 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand"
          />

          <div className="flex flex-wrap gap-1.5 pt-1">
            {COVER_PRESETS.map(preset => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setCoverImage(preset.url);
                  toast(`Applied ${preset.label} photo`, 'info');
                }}
                className="px-2 py-0.5 rounded-lg border border-border bg-surface hover:bg-border/60 text-[10px] font-mono text-text-secondary hover:text-text-primary transition-all active:scale-95 cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="pt-2">
            <label className="block text-[10px] font-mono font-bold uppercase text-text-secondary mb-1">
              Image Alt Text / Photo Credit (Required for Publishing)
            </label>
            <input
              type="text"
              value={photoCredit}
              onChange={e => setPhotoCredit(e.target.value)}
              placeholder="e.g. Photo by Corporate Lens / Unsplash"
              className="w-full text-xs font-mono p-2.5 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
        </div>

        <div className="md:col-span-5 flex flex-col justify-center">
          <div
            className={`relative w-full rounded-xl overflow-hidden bg-surface border border-border flex items-center justify-center transition-all duration-300 ${
              coverPreviewDevice === 'desktop' ? 'h-32 sm:h-36 aspect-video' : 'h-40 sm:h-44 aspect-[4/5] max-w-[160px] mx-auto'
            }`}
          >
            {coverImage ? (
              <img
                src={coverImage}
                alt={photoCredit || 'Cover Preview'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-2 text-text-tertiary">
                <ImageIcon size={20} className="mx-auto opacity-40 mb-1" />
                <span className="text-[9px] font-mono uppercase block">No Image</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
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
              {initialCaseStudy ? 'EDITING TEARDOWN' : 'CREATE BLUEPRINT TEARDOWN'}
            </div>
            <h1 className="text-2xl font-black font-display uppercase tracking-tight text-text-primary">
              {initialCaseStudy ? 'Edit Case Study' : 'New Visual Case Study'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-surface-muted p-1 rounded-xl border border-border">
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
            Publish Now
          </Button>
        </div>
      </div>

      {/* Mode 1: Canvas Visual Designer */}
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

          {/* Dedicated Cover Photo Section */}
          {renderCoverPhotoCard()}

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

          {/* Dedicated Cover Photo Section */}
          {renderCoverPhotoCard()}
        </div>
      )}

      {/* Bottom Action Footer */}
      <div className="sticky bottom-4 z-30 p-4 rounded-2xl bg-surface/95 backdrop-blur-md border border-border shadow-xl flex items-center justify-end gap-3">
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
          Publish Now
        </Button>
      </div>
    </div>
  );
};
