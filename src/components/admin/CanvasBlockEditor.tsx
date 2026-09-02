'use client';

import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Eye,
  Edit3,
  Palette,
  Layout,
  HelpCircle,
  TrendingUp,
  Star,
  Lightbulb,
  AlertCircle,
  Award,
  Target,
  Rocket,
  Briefcase,
  Zap,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { CanvasData, CanvasMetric, CanvasCalloutBox } from '@/types';
import { CanvasStoryView } from '@/components/canvas/CanvasStoryView';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface CanvasBlockEditorProps {
  value: CanvasData | null | undefined;
  onChange: (data: CanvasData) => void;
  title?: string;
  summary?: string;
}

const BOX_VARIANTS = [
  { id: 'green', name: 'Emerald (Journey)', bg: '#ecfdf5', border: '#a7f3d0' },
  { id: 'blue', name: 'Sky Blue (Lesson)', bg: '#f0f9ff', border: '#bae6fd' },
  { id: 'amber', name: 'Amber (Thought)', bg: '#fffbeb', border: '#fde68a' },
  { id: 'rose', name: 'Rose (Alert)', bg: '#fff1f2', border: '#fecdd3' },
  { id: 'purple', name: 'Purple (Moat)', bg: '#faf5ff', border: '#e9d5ff' },
  { id: 'slate', name: 'Slate (Specs)', bg: '#f8fafc', border: '#e2e8f0' },
];

const ICONS_LIST = [
  { id: 'trending', label: 'Trending / Growth' },
  { id: 'star', label: 'Star / Lesson' },
  { id: 'lightbulb', label: 'Lightbulb / Idea' },
  { id: 'alert', label: 'Alert / Risk' },
  { id: 'award', label: 'Award / Win' },
  { id: 'target', label: 'Target / Goal' },
  { id: 'rocket', label: 'Rocket / Launch' },
  { id: 'briefcase', label: 'Briefcase / Ops' },
  { id: 'zap', label: 'Zap / Tech' },
  { id: 'shield', label: 'Shield / Moat' },
  { id: 'check', label: 'Check / Done' },
];

const METRIC_ICONS = [
  { id: 'calendar', label: 'Calendar (Year)' },
  { id: 'unicorn', label: 'Unicorn (Valuation)' },
  { id: 'funding', label: 'Cash / Funding' },
  { id: 'building', label: 'Building (HQ)' },
  { id: 'users', label: 'Users (Team/MAU)' },
  { id: 'trending', label: 'Growth %' },
  { id: 'dollar', label: 'Dollar $' },
  { id: 'award', label: 'Rank / Award' },
];

export const CanvasBlockEditor: React.FC<CanvasBlockEditorProps> = ({
  value,
  onChange,
  title = '',
  summary = '',
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'split'>('split');

  // Local canvas data state
  const canvas: CanvasData = value || {
    header: {
      founderPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      companyLogo: '',
      tagline: 'PAY BILLS. EARN REWARDS. BUILD TRUST.',
      bannerBg: '#09090b',
    },
    metrics: [
      { id: 'm1', label: 'Founded', value: '2018', icon: 'calendar' },
      { id: 'm2', label: 'Valuation', value: '~ $6.4 Billion', subValue: '(Approx)', icon: 'unicorn' },
      { id: 'm3', label: 'Total Funding', value: '$800+ Million', subValue: '(Approx)', icon: 'funding' },
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
        content:
          'Seed Round (2018) → Series A → Series B → Series C → Series D → Series E → Series F+\nLead Investors: Sequoia Capital, Tiger Global, SoftBank, Coatue, Falcon Edge, Steadview Capital, GIC, RTP Global & others',
        icon: 'trending',
        variant: 'green',
      },
      {
        id: 'b2',
        title: 'Business Lesson',
        content:
          'Har business sabke liye nahi hota. Kabhi-kabhi exclusivity hi sabse badi strength ban jaati hai. Growth aur monetization dono balance hona zaroori hai.',
        icon: 'star',
        variant: 'blue',
      },
      {
        id: 'b3',
        title: 'Final Thought',
        content:
          'CRED ne sirf ek app nahi, ek movement create kiya hai — Status, Trust aur Exclusivity.',
        icon: 'lightbulb',
        variant: 'amber',
      },
    ],
  };

  const updateCanvas = (updates: Partial<CanvasData>) => {
    const updated = { ...canvas, ...updates };
    onChange(updated);
  };

  // Header update
  const updateHeader = (field: string, val: string) => {
    updateCanvas({
      header: {
        ...canvas.header,
        [field]: val,
      },
    });
  };

  // Metrics CRUD
  const addMetric = () => {
    const newMetric: CanvasMetric = {
      id: `m-${Date.now()}`,
      label: 'Metric Label',
      value: '100M+',
      subValue: '',
      icon: 'trending',
    };
    updateCanvas({ metrics: [...(canvas.metrics || []), newMetric] });
  };

  const updateMetric = (id: string, field: string, val: any) => {
    const next = (canvas.metrics || []).map(m => (m.id === id ? { ...m, [field]: val } : m));
    updateCanvas({ metrics: next });
  };

  const deleteMetric = (id: string) => {
    updateCanvas({ metrics: (canvas.metrics || []).filter(m => m.id !== id) });
  };

  // Profile CRUD
  const updateProfile = (field: string, val: any) => {
    updateCanvas({
      profile: {
        ...canvas.profile,
        [field]: val,
      },
    });
  };

  const updateBusinessPoint = (index: number, val: string) => {
    const pts = [...(canvas.profile?.businessModelPoints || [])];
    pts[index] = val;
    updateProfile('businessModelPoints', pts);
  };

  const addBusinessPoint = () => {
    const pts = [...(canvas.profile?.businessModelPoints || []), 'New business stream point'];
    updateProfile('businessModelPoints', pts);
  };

  const removeBusinessPoint = (index: number) => {
    const pts = (canvas.profile?.businessModelPoints || []).filter((_, i) => i !== index);
    updateProfile('businessModelPoints', pts);
  };

  // Callout Boxes CRUD
  const addBox = (variant: 'green' | 'blue' | 'amber' | 'rose' | 'purple' | 'slate' = 'green') => {
    const newBox: CanvasCalloutBox = {
      id: `box-${Date.now()}`,
      title: 'New Canvas Section',
      content: 'Write the executive takeaway, funding breakdown, or architecture highlights here...',
      icon: 'star',
      variant,
    };
    updateCanvas({ calloutBoxes: [...(canvas.calloutBoxes || []), newBox] });
  };

  const updateBox = (id: string, field: string, val: any) => {
    const next = (canvas.calloutBoxes || []).map(b => (b.id === id ? { ...b, [field]: val } : b));
    updateCanvas({ calloutBoxes: next });
  };

  const deleteBox = (id: string) => {
    updateCanvas({ calloutBoxes: (canvas.calloutBoxes || []).filter(b => b.id !== id) });
  };

  const moveBox = (index: number, direction: 'up' | 'down') => {
    const boxes = [...(canvas.calloutBoxes || [])];
    if (direction === 'up' && index > 0) {
      const temp = boxes[index];
      boxes[index] = boxes[index - 1];
      boxes[index - 1] = temp;
    } else if (direction === 'down' && index < boxes.length - 1) {
      const temp = boxes[index];
      boxes[index] = boxes[index + 1];
      boxes[index + 1] = temp;
    }
    updateCanvas({ calloutBoxes: boxes });
  };

  return (
    <div className="space-y-6">
      {/* Editor Controls & Layout Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-border bg-surface shadow-xs">
        <div className="flex items-center gap-2">
          <Palette className="text-brand" size={18} />
          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary">
              Canvas Design Block Builder
            </div>
            <div className="text-[11px] font-mono text-text-tertiary">
              Format founder cards, 4-stat badges, business models, and color-tinted callout boxes.
            </div>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1 bg-surface-muted p-1 rounded-xl border border-border">
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-colors ${
              activeTab === 'editor' ? 'bg-text-primary text-background' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Form Only
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('split')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-colors ${
              activeTab === 'split' ? 'bg-text-primary text-background' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Live Split
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-colors ${
              activeTab === 'preview' ? 'bg-text-primary text-background' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Full Preview
          </button>
        </div>
      </div>

      {/* Grid Layout: Editor on Left, Live Canvas Story on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Visual Builder Tools */}
        {(activeTab === 'editor' || activeTab === 'split') && (
          <div className={`${activeTab === 'split' ? 'lg:col-span-6' : 'lg:col-span-12'} space-y-6`}>
            
            {/* Section 1: Header & Brand Media */}
            <div className="p-5 sm:p-6 rounded-2xl border border-border bg-surface shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
                  <Layout size={15} className="text-brand" />
                  <span>1. Header Hero Banner</span>
                </h3>
              </div>

              <div className="space-y-3">
                <Input
                  label="Founder / Cover Photo URL"
                  value={canvas.header?.founderPhoto || ''}
                  onChange={e => updateHeader('founderPhoto', e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                />

                <Input
                  label="Company Logo URL (Transparent PNG)"
                  value={canvas.header?.companyLogo || ''}
                  onChange={e => updateHeader('companyLogo', e.target.value)}
                  placeholder="https://.../logo.png"
                />

                <Input
                  label="Header Tagline"
                  value={canvas.header?.tagline || ''}
                  onChange={e => updateHeader('tagline', e.target.value)}
                  placeholder="PAY BILLS. EARN REWARDS. BUILD TRUST."
                />
              </div>
            </div>

            {/* Section 2: Metric Badges (4 Cards) */}
            <div className="p-5 sm:p-6 rounded-2xl border border-border bg-surface shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
                  <TrendingUp size={15} className="text-emerald-500" />
                  <span>2. Metric Stat Badges (Row of Cards)</span>
                </h3>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMetric}
                  leftIcon={<Plus size={13} />}
                >
                  <span>+ Add Metric</span>
                </Button>
              </div>

              <div className="space-y-3">
                {canvas.metrics?.map(metric => (
                  <div
                    key={metric.id}
                    className="p-3.5 rounded-xl border border-border bg-surface-muted space-y-2 relative"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      <div className="sm:col-span-4">
                        <label className="text-[10px] font-mono font-bold text-text-tertiary uppercase">Label</label>
                        <input
                          type="text"
                          value={metric.label}
                          onChange={e => updateMetric(metric.id, 'label', e.target.value)}
                          placeholder="e.g. Founded / Valuation"
                          className="w-full text-xs p-2 rounded-lg border border-border bg-surface text-text-primary"
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <label className="text-[10px] font-mono font-bold text-text-tertiary uppercase">Value</label>
                        <input
                          type="text"
                          value={metric.value}
                          onChange={e => updateMetric(metric.id, 'value', e.target.value)}
                          placeholder="e.g. 2018 / $6.4B"
                          className="w-full text-xs p-2 rounded-lg border border-border bg-surface text-text-primary font-bold"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="text-[10px] font-mono font-bold text-text-tertiary uppercase">Icon</label>
                        <select
                          value={metric.icon}
                          onChange={e => updateMetric(metric.id, 'icon', e.target.value)}
                          className="w-full text-xs p-2 rounded-lg border border-border bg-surface text-text-primary"
                        >
                          {METRIC_ICONS.map(i => (
                            <option key={i.id} value={i.id}>
                              {i.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-1 flex justify-end pt-4 sm:pt-0">
                        <button
                          type="button"
                          onClick={() => deleteMetric(metric.id)}
                          className="p-1.5 rounded-lg text-text-tertiary hover:text-red-600 transition-colors"
                          title="Delete metric"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <div className="w-full">
                      <input
                        type="text"
                        value={metric.subValue || ''}
                        onChange={e => updateMetric(metric.id, 'subValue', e.target.value)}
                        placeholder="Subtext (e.g. (Approx) / India)"
                        className="w-full text-[11px] px-2 py-1 rounded-md border border-border/80 bg-surface text-text-secondary"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Founder & Business Model Profiler */}
            <div className="p-5 sm:p-6 rounded-2xl border border-border bg-surface shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
                  <Briefcase size={15} className="text-amber-500" />
                  <span>3. Founder Profile & Business Model</span>
                </h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Founder Name"
                    value={canvas.profile?.founderName || ''}
                    onChange={e => updateProfile('founderName', e.target.value)}
                    placeholder="e.g. Kunal Shah"
                  />
                  <Input
                    label="Founder Title / Role"
                    value={canvas.profile?.founderRole || ''}
                    onChange={e => updateProfile('founderRole', e.target.value)}
                    placeholder="e.g. Founder & CEO, CRED"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono font-bold uppercase text-text-secondary">
                      Business Model Bullet Points
                    </label>
                    <button
                      type="button"
                      onClick={addBusinessPoint}
                      className="text-xs font-mono font-bold uppercase text-brand hover:underline"
                    >
                      + Add Point
                    </button>
                  </div>

                  <div className="space-y-2">
                    {canvas.profile?.businessModelPoints?.map((pt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-amber-500 font-bold text-sm">•</span>
                        <input
                          type="text"
                          value={pt}
                          onChange={e => updateBusinessPoint(idx, e.target.value)}
                          className="flex-1 text-xs p-2 rounded-lg border border-border bg-surface text-text-primary"
                        />
                        <button
                          type="button"
                          onClick={() => removeBusinessPoint(idx)}
                          className="text-text-tertiary hover:text-red-500 p-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Dynamic Modular Canvas Callout Boxes (Number, Colors, Icons, Content) */}
            <div className="p-5 sm:p-6 rounded-2xl border border-border bg-surface shadow-card space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
                    <Palette size={15} className="text-purple-500" />
                    <span>4. Dynamic Canvas Callout Boxes</span>
                  </h3>
                  <div className="text-[11px] font-mono text-text-tertiary">
                    Add unlimited custom boxes with distinct color themes, icons, and structured content.
                  </div>
                </div>

                {/* Quick Add Buttons by Color */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => addBox('green')}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100"
                  >
                    + Green
                  </button>
                  <button
                    type="button"
                    onClick={() => addBox('blue')}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase bg-blue-50 text-blue-800 border border-blue-300 hover:bg-blue-100"
                  >
                    + Blue
                  </button>
                  <button
                    type="button"
                    onClick={() => addBox('amber')}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100"
                  >
                    + Amber
                  </button>
                  <button
                    type="button"
                    onClick={() => addBox('rose')}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100"
                  >
                    + Rose
                  </button>
                  <button
                    type="button"
                    onClick={() => addBox('purple')}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase bg-purple-50 text-purple-800 border border-purple-300 hover:bg-purple-100"
                  >
                    + Purple
                  </button>
                </div>
              </div>

              {/* List of Canvas Boxes */}
              <div className="space-y-4">
                {canvas.calloutBoxes?.map((box, index) => (
                  <div
                    key={box.id}
                    className="p-4 sm:p-5 rounded-2xl border border-border bg-surface-muted space-y-3 relative group"
                  >
                    {/* Header: Title, Icon, Variant, Reorder, Delete */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="w-5 h-5 rounded-full bg-surface border border-border flex items-center justify-center text-[10px] font-mono font-bold text-text-tertiary">
                          {index + 1}
                        </span>
                        <input
                          type="text"
                          value={box.title}
                          onChange={e => updateBox(box.id, 'title', e.target.value)}
                          placeholder="Box Title (e.g. Funding Journey / Business Lesson)"
                          className="flex-1 text-xs sm:text-sm font-bold font-display p-2 rounded-lg border border-border bg-surface text-text-primary"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Icon Picker */}
                        <select
                          value={box.icon}
                          onChange={e => updateBox(box.id, 'icon', e.target.value)}
                          className="text-xs p-1.5 rounded-lg border border-border bg-surface text-text-primary"
                        >
                          {ICONS_LIST.map(i => (
                            <option key={i.id} value={i.id}>
                              {i.label}
                            </option>
                          ))}
                        </select>

                        {/* Color Variant */}
                        <select
                          value={box.variant}
                          onChange={e => updateBox(box.id, 'variant', e.target.value)}
                          className="text-xs p-1.5 rounded-lg border border-border bg-surface text-text-primary font-bold"
                        >
                          {BOX_VARIANTS.map(v => (
                            <option key={v.id} value={v.id}>
                              {v.name}
                            </option>
                          ))}
                        </select>

                        {/* Move Up/Down */}
                        <button
                          type="button"
                          onClick={() => moveBox(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-text-tertiary hover:text-text-primary disabled:opacity-30"
                          title="Move up"
                        >
                          <MoveUp size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveBox(index, 'down')}
                          disabled={index === (canvas.calloutBoxes?.length || 0) - 1}
                          className="p-1 text-text-tertiary hover:text-text-primary disabled:opacity-30"
                          title="Move down"
                        >
                          <MoveDown size={14} />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => deleteBox(box.id)}
                          className="p-1 text-text-tertiary hover:text-red-600"
                          title="Delete box"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Content Textarea */}
                    <div>
                      <textarea
                        rows={3}
                        value={box.content}
                        onChange={e => updateBox(box.id, 'content', e.target.value)}
                        placeholder="Write the insights, rounds, strategy points, or takeaways..."
                        className="w-full text-xs font-body p-3 rounded-xl border border-border bg-surface text-text-primary leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Right Column: Live Rendered Canvas Story Card Preview */}
        {(activeTab === 'preview' || activeTab === 'split') && (
          <div className={`${activeTab === 'split' ? 'lg:col-span-6 sticky top-20' : 'lg:col-span-12'}`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono font-bold uppercase text-text-tertiary px-1">
                <span className="flex items-center gap-1.5">
                  <Eye size={14} className="text-emerald-500" />
                  <span>Real-Time WYSIWYG Canvas Preview</span>
                </span>
                <span className="text-[10px]">Matches User Detailed View</span>
              </div>

              <div className="rounded-3xl border border-border/80 shadow-2xl overflow-hidden max-h-[85vh] overflow-y-auto no-scrollbar">
                <CanvasStoryView
                  canvasData={canvas}
                  story={{
                    id: 'preview-story',
                    title: title || 'CRED — Jab "Exclusive" Hi Business Model Ban Gaya',
                    slug: 'preview-slug',
                    summary:
                      summary ||
                      'Kunal Shah ne 2018 mein CRED launch kiya. Ye app sirf un logon ke liye hai jinka credit score achha hota hai. Users credit card bill pay karte hain, rewards/coins milte hain, jo brands discounts mein use hote hain.',
                    body: '',
                    readTimeMinutes: 3,
                    wordCount: 60,
                    status: 'PUBLISHED',
                    isFeatured: true,
                    isTrending: true,
                    viewCount: 0,
                    categoryId: 'preview-cat',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    type: 'CASE_STUDY',
                  }}
                />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
