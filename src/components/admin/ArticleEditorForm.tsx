'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArticleItem, CategoryItem, ContentStatus, CanvasData } from '../../types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../providers/ToastProvider';
import { countWords } from '../../lib/sanitize';
import { CanvasBlockEditor } from './CanvasBlockEditor';
import { StoryCard } from '../news/StoryCard';
import { CanvasStoryView } from '../canvas/CanvasStoryView';
import {
  ArrowLeft,
  Check,
  Clock,
  Eye,
  Bookmark,
  Share2,
  Calendar,
  Send,
  Palette,
  FileText,
  Smartphone,
  Monitor,
  X,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';

interface ArticleEditorFormProps {
  initialArticle?: ArticleItem | null;
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
    label: '🌐 Crypto Web3',
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
  {
    label: '💥 Post-Mortem Glitch',
    url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=80',
    credit: 'Unsplash / Cautionary Lens',
  },
];

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const ArticleEditorForm: React.FC<ArticleEditorFormProps> = ({
  initialArticle,
  categories,
}) => {
  const router = useRouter();
  const { toast } = useToast();

  const [editorMode, setEditorMode] = useState<'standard' | 'canvas'>('canvas');
  const [title, setTitle] = useState(initialArticle?.title || '');
  const [slug, setSlug] = useState(initialArticle?.slug || '');
  const [isCustomSlug, setIsCustomSlug] = useState(Boolean(initialArticle?.slug));
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [summary, setSummary] = useState(initialArticle?.summary || '');
  const [body, setBody] = useState(initialArticle?.body || '');
  const [categoryId, setCategoryId] = useState(
    initialArticle?.categoryId || categories[0]?.id || ''
  );
  const [sourceName, setSourceName] = useState(initialArticle?.sourceName || '');
  const [sourceUrl, setSourceUrl] = useState(initialArticle?.sourceUrl || '');
  const [sourceAuthor, setSourceAuthor] = useState(initialArticle?.sourceAuthor || '');
  const [authorName, setAuthorName] = useState(initialArticle?.authorName || initialArticle?.sourceAuthor || 'Aditya Poddar');
  const [authorRole, setAuthorRole] = useState(initialArticle?.authorRole || 'Senior Venture Reporter');
  const [coverImage, setCoverImage] = useState(initialArticle?.coverImage || '');
  const [photoCredit, setPhotoCredit] = useState(initialArticle?.photoCredit || '');
  const [status, setStatus] = useState<ContentStatus>(initialArticle?.status || 'DRAFT');
  const [isFeatured, setIsFeatured] = useState(initialArticle?.isFeatured || false);
  const [isTrending, setIsTrending] = useState(initialArticle?.isTrending || false);
  const [tagsInput, setTagsInput] = useState(
    initialArticle?.tags?.map(t => t.tag.name).join(', ') || ''
  );
  const [scheduledFor, setScheduledFor] = useState(
    initialArticle?.scheduledFor ? new Date(initialArticle.scheduledFor).toISOString().slice(0, 16) : ''
  );
  const [seoTitle, setSeoTitle] = useState(initialArticle?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(initialArticle?.seoDescription || '');
  const [submitting, setSubmitting] = useState(false);

  // Autosave and unsaved changes state
  const [lastAutosaved, setLastAutosaved] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [hasRestorableDraft, setHasRestorableDraft] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [previewTab, setPreviewTab] = useState<'card' | 'canvas'>('card');
  const [coverPreviewDevice, setCoverPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  const autosaveKey = `va_autosave_article_${initialArticle?.id || 'new'}`;

  // Canvas visual blocks state
  const [canvasData, setCanvasData] = useState<CanvasData | null>(
    initialArticle?.canvasData || {
      header: {
        founderPhoto: coverImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        companyLogo: '',
        tagline: sourceName ? `SOURCE: ${sourceName.toUpperCase()}` : 'EXECUTIVE NEWS WIRE BRIEF',
        bannerBg: '#09090b',
      },
      metrics: [
        { id: 'm1', label: 'Founded', value: '2024', icon: 'calendar' },
        { id: 'm2', label: 'Valuation / Round', value: 'Series Seed', subValue: '(Verified)', icon: 'unicorn' },
        { id: 'm3', label: 'Key Metric', value: '4.5M DAU', subValue: '(Growth)', icon: 'funding' },
        { id: 'm4', label: 'Category Desk', value: categories.find(c => c.id === categoryId)?.name || 'Startups', subValue: 'Global', icon: 'building' },
      ],
      profile: {
        founderName: sourceAuthor || 'Editorial Board',
        founderRole: sourceName || 'Lead Intelligence Reporter',
        businessModelTitle: 'Core Strategy & Architecture',
        businessModelPoints: [
          'High-throughput architecture & scaling flywheel',
          'Zero-CAC distribution strategy & brand leverage',
          'Sovereign margins & capital-efficient unit economics',
        ],
      },
      calloutBoxes: [
        {
          id: 'b1',
          title: 'Funding & Milestones',
          content: 'Key rounds, lead investors, and technical milestones accomplished by the team.',
          icon: 'trending',
          variant: 'green',
        },
        {
          id: 'b2',
          title: 'Operator Playbook & Lesson',
          content: 'The non-consensus insight that unlocked product-market fit and sustained growth.',
          icon: 'star',
          variant: 'blue',
        },
        {
          id: 'b3',
          title: 'Key Takeaway',
          content: 'What this means for the broader ecosystem, competitors, and market landscape.',
          icon: 'lightbulb',
          variant: 'amber',
        },
      ],
    }
  );

  // Check for restorable draft on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(autosaveKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.title && parsed.title !== initialArticle?.title) {
          setHasRestorableDraft(true);
        }
      }
    } catch {}
  }, [autosaveKey, initialArticle?.title]);

  const restoreDraft = () => {
    try {
      const saved = localStorage.getItem(autosaveKey);
      if (saved) {
        const p = JSON.parse(saved);
        if (p.title) setTitle(p.title);
        if (p.slug) setSlug(p.slug);
        if (p.summary) setSummary(p.summary);
        if (p.body) setBody(p.body);
        if (p.categoryId) setCategoryId(p.categoryId);
        if (p.sourceName) setSourceName(p.sourceName);
        if (p.sourceUrl) setSourceUrl(p.sourceUrl);
        if (p.sourceAuthor) setSourceAuthor(p.sourceAuthor);
        if (p.coverImage) setCoverImage(p.coverImage);
        if (p.photoCredit) setPhotoCredit(p.photoCredit);
        if (p.canvasData) setCanvasData(p.canvasData);
        if (p.seoTitle) setSeoTitle(p.seoTitle);
        if (p.seoDescription) setSeoDescription(p.seoDescription);
        setHasRestorableDraft(false);
        toast('Autosaved draft restored successfully', 'success');
      }
    } catch {
      toast('Failed to restore draft', 'error');
    }
  };

  const discardDraft = () => {
    try {
      localStorage.removeItem(autosaveKey);
      setHasRestorableDraft(false);
      toast('Autosaved draft discarded', 'info');
    } catch {}
  };

  // Auto-generate slug from title
  useEffect(() => {
    if (!isCustomSlug && title) {
      setSlug(generateSlug(title));
    }
  }, [title, isCustomSlug]);

  // Live slug uniqueness check (debounced)
  useEffect(() => {
    if (!slug) {
      setSlugStatus('idle');
      return;
    }

    setSlugStatus('checking');
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(slug)}`);
        if (res.ok) {
          const data = await res.json();
          const exists = data.articles?.some(
            (a: any) => a.slug === slug && a.id !== initialArticle?.id
          );
          setSlugStatus(exists ? 'taken' : 'available');
        } else {
          setSlugStatus('available');
        }
      } catch {
        setSlugStatus('available');
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [slug, initialArticle?.id]);

  // 10-second Autosave timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (!title && !summary && !body) return;

      const draftState = {
        title,
        slug,
        summary,
        body,
        categoryId,
        sourceName,
        sourceUrl,
        sourceAuthor,
        authorName,
        authorRole,
        coverImage,
        photoCredit,
        status,
        isFeatured,
        isTrending,
        tagsInput,
        scheduledFor,
        seoTitle,
        seoDescription,
        canvasData,
        savedAt: new Date().toISOString(),
      };

      try {
        localStorage.setItem(autosaveKey, JSON.stringify(draftState));
        setLastAutosaved(new Date());
      } catch {}
    }, 10000);

    return () => clearInterval(interval);
  }, [
    autosaveKey,
    title,
    slug,
    summary,
    body,
    categoryId,
    sourceName,
    sourceUrl,
    sourceAuthor,
    authorName,
    authorRole,
    coverImage,
    photoCredit,
    status,
    isFeatured,
    isTrending,
    tagsInput,
    scheduledFor,
    seoTitle,
    seoDescription,
    canvasData,
  ]);

  const isSubmittingRef = useRef(false);

  // Mark dirty on any edit
  useEffect(() => {
    setIsDirty(true);
  }, [title, summary, body, categoryId, coverImage, canvasData]);

  // Unsaved changes navigation guard
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isSubmittingRef.current && isDirty && (title || summary)) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, title, summary]);

  const wordCount = countWords(summary);
  const isOverWordBudget = wordCount > 60;
  const progressPercent = Math.min(100, Math.round((wordCount / 60) * 100));

  const selectedCategory = categories.find(c => c.id === categoryId) || categories[0] || {
    id: 'cat-1',
    name: 'Venture & Startups',
    slug: 'venture',
    color: '#3b82f6',
  };

  const previewArticle: ArticleItem = {
    id: initialArticle?.id || 'preview-id',
    type: 'NEWS',
    title: title || 'Headline Preview Title',
    slug: slug || 'preview-slug',
    summary: summary || 'Executive 60-word concise news overview...',
    body: body || summary || 'Detailed article body reporting.',
    category: selectedCategory,
    categoryId: selectedCategory.id,
    author: {
      id: 'author-id',
      email: 'editorial@ventureatlas.in',
      name: authorName || 'Staff Reporter',
      role: 'WRITER',
      avatar: null,
      plan: 'ENTERPRISE',
      mfaEnabled: false,
    },
    authorName: authorName || 'Staff Reporter',
    authorRole: authorRole || 'Senior Reporter',
    sourceName: sourceName || null,
    sourceUrl: sourceUrl || null,
    sourceAuthor: sourceAuthor || null,
    coverImage: coverImage.trim() || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
    photoCredit: photoCredit.trim() || 'Unsplash / Enterprise Lens',
    readTimeMinutes: Math.max(1, Math.ceil(wordCount / 60)),
    wordCount,
    status,
    isFeatured,
    isTrending,
    scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : null,
    publishedAt: initialArticle?.publishedAt || new Date().toISOString(),
    viewCount: initialArticle?.viewCount || 1420,
    likeCount: initialArticle?.likeCount || 48,
    seoTitle: seoTitle || null,
    seoDescription: seoDescription || null,
    canvasData: canvasData || undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const handleSubmit = async (targetStatus: ContentStatus) => {
    if (!title.trim()) {
      toast('Please enter a headline', 'error');
      return;
    }

    if (!summary.trim()) {
      toast('Please provide a 60-word summary overview', 'error');
      return;
    }

    if (isOverWordBudget) {
      toast(`Summary exceeds 60 words (${wordCount}/60). Please condense.`, 'error');
      return;
    }

    if (targetStatus === 'PUBLISHED') {
      if (!seoTitle.trim()) {
        toast('Publishing blocked: SEO Meta Title is required before publishing.', 'error');
        return;
      }
      if (!seoDescription.trim()) {
        toast('Publishing blocked: SEO Meta Description is required before publishing.', 'error');
        return;
      }
      if (coverImage.trim() && !photoCredit.trim()) {
        toast('Publishing blocked: Cover image alt text / attribution is required before publishing.', 'error');
        return;
      }
    }

    isSubmittingRef.current = true;
    setIsDirty(false);
    setSubmitting(true);

    const tagsArray = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const payload = {
      title,
      slug: slug.trim() || generateSlug(title),
      summary,
      body: body.trim() || summary,
      categoryId,
      sourceName: sourceName.trim() || null,
      sourceUrl: sourceUrl.trim() || null,
      sourceAuthor: sourceAuthor.trim() || null,
      authorName: authorName.trim() || 'Aditya Poddar',
      authorRole: authorRole.trim() || 'Staff Reporter',
      coverImage: coverImage.trim() || null,
      photoCredit: photoCredit.trim() || null,
      status: targetStatus,
      isFeatured,
      isTrending,
      scheduledFor: targetStatus === 'SCHEDULED' && scheduledFor ? new Date(scheduledFor).toISOString() : null,
      tags: tagsArray,
      seoTitle: seoTitle.trim() || null,
      seoDescription: seoDescription.trim() || null,
      canvasData,
    };

    try {
      const url = initialArticle ? `/api/articles/${initialArticle.id}` : '/api/articles';
      const method = initialArticle ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsDirty(false);
        try {
          localStorage.removeItem(autosaveKey);
        } catch {}

        toast(
          targetStatus === 'PUBLISHED'
            ? 'Article published to live feed!'
            : 'Story saved successfully',
          'success'
        );
        router.push('/admin/articles');
        router.refresh();
      } else {
        isSubmittingRef.current = false;
        const data = await res.json();
        toast(data.error || 'Failed to save article', 'error');
      }
    } catch {
      isSubmittingRef.current = false;
      toast('Network error saving article', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const renderCoverPhotoCard = () => (
    <div className="p-5 rounded-2xl border border-border bg-surface shadow-card space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <ImageIcon size={16} className="text-brand" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary">
            Cover Photo & Editorial Media
          </span>
        </div>
        {coverImage && (
          <button
            type="button"
            onClick={() => {
              setCoverImage('');
              setPhotoCredit('');
            }}
            className="text-[11px] font-mono text-red-500 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <X size={12} /> Clear Photo
          </button>
        )}
      </div>

      {/* Recommended Dimensions Guide (Separate Desktop & Mobile Options) */}
      <div className="p-3.5 rounded-xl bg-surface-muted/70 border border-border space-y-2.5">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
          <div
            onClick={() => setCoverPreviewDevice('desktop')}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              coverPreviewDevice === 'desktop'
                ? 'border-brand/60 bg-brand/10 text-text-primary ring-1 ring-brand/30'
                : 'border-border/60 bg-surface/50 text-text-secondary hover:border-border'
            }`}
          >
            <div className="font-bold text-text-primary flex items-center justify-between">
              <span>🖥️ Desktop Hero & Header</span>
              <span className="text-brand text-[10px] font-bold">16:9 Landscape</span>
            </div>
            <div className="text-[10px] text-text-tertiary mt-1 leading-relaxed">
              • Target Resolution: <strong className="text-text-primary">1200 × 675 px</strong> (or 1600 × 900 px)<br />
              • Best for: Widescreen article headers & desktop feeds
            </div>
          </div>

          <div
            onClick={() => setCoverPreviewDevice('mobile')}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              coverPreviewDevice === 'mobile'
                ? 'border-brand/60 bg-brand/10 text-text-primary ring-1 ring-brand/30'
                : 'border-border/60 bg-surface/50 text-text-secondary hover:border-border'
            }`}
          >
            <div className="font-bold text-text-primary flex items-center justify-between">
              <span>📱 Mobile Feed & Snap Card</span>
              <span className="text-brand text-[10px] font-bold">4:5 / 9:16 Portrait</span>
            </div>
            <div className="text-[10px] text-text-tertiary mt-1 leading-relaxed">
              • Target Resolution: <strong className="text-text-primary">1080 × 1350 px</strong> (or 800 × 1000 px)<br />
              • Best for: Smartphone feeds & vertical carousels
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Left: Inputs & Presets */}
        <div className="md:col-span-7 space-y-3">
          <div>
            <label className="text-xs font-mono font-bold uppercase text-text-tertiary block mb-1">
              Cover Image URL
            </label>
            <input
              type="url"
              value={coverImage}
              onChange={e => setCoverImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full text-xs font-mono p-2.5 bg-surface-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          <div>
            <label className="text-xs font-mono font-bold uppercase text-text-tertiary block mb-1">
              Photo Credit / License Attribution
            </label>
            <input
              type="text"
              value={photoCredit}
              onChange={e => setPhotoCredit(e.target.value)}
              placeholder="Unsplash / Enterprise Lens"
              className="w-full text-xs font-mono p-2.5 bg-surface-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          {/* 1-Click Curated Presets */}
          <div className="pt-2">
            <label className="text-[10px] font-mono font-bold uppercase text-text-tertiary block mb-1.5">
              1-Click Curated Editorial Photos:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COVER_PRESETS.map(preset => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setCoverImage(preset.url);
                    setPhotoCredit(preset.credit);
                    toast(`Applied ${preset.label} photo`, 'info');
                  }}
                  className="px-2.5 py-1 rounded-lg border border-border bg-surface-muted hover:bg-border/60 text-[11px] font-mono text-text-secondary hover:text-text-primary transition-all active:scale-95 cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Real-time Live Preview Thumbnail with Viewport Frame Simulator */}
        <div className="md:col-span-5 flex flex-col justify-center">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-text-tertiary">
              <span>Preview Frame:</span>
              <span className="font-bold text-text-secondary">
                {coverPreviewDevice === 'desktop' ? '16:9 Landscape' : '4:5 Portrait'}
              </span>
            </div>

            <div
              className={`relative w-full rounded-2xl overflow-hidden bg-surface-muted border border-border flex items-center justify-center shadow-inner transition-all duration-300 ${
                coverPreviewDevice === 'desktop' ? 'h-40 sm:h-44 aspect-video' : 'h-48 sm:h-52 aspect-[4/5] max-w-[200px] mx-auto'
              }`}
            >
              {coverImage ? (
                <>
                  <img
                    src={coverImage}
                    alt="Cover Preview"
                    className="w-full h-full object-cover"
                  />
                  {photoCredit && (
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[9px] font-mono text-white/90 border border-white/10 uppercase tracking-wider pointer-events-none">
                      {photoCredit}
                    </span>
                  )}
                </>
              ) : (
                <div className="text-center p-4 space-y-1">
                  <ImageIcon size={28} className="mx-auto text-text-tertiary opacity-40" />
                  <span className="text-[10px] font-mono uppercase text-text-tertiary block">
                    No Cover Photo Selected
                  </span>
                  <span className="text-[9px] font-mono text-text-tertiary block opacity-70">
                    Select a preset above or paste an image URL
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Restorable Draft Banner */}
      {hasRestorableDraft && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-amber-600 dark:text-amber-400 shrink-0" size={20} />
            <div className="text-xs font-mono text-amber-900 dark:text-amber-200">
              <strong>Unsaved Autosave Detected:</strong> An earlier browser session left unsaved changes for this brief.
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={restoreDraft}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-mono font-bold uppercase transition-colors"
            >
              Restore Changes
            </button>
            <button
              type="button"
              onClick={discardDraft}
              className="px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-mono transition-colors"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Top Action Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 rounded-xl border border-border bg-surface text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-tertiary">
                {initialArticle ? 'EDITING BRIEF' : 'CREATING 60-WORD BRIEF'}
              </span>
              {lastAutosaved && (
                <span className="text-[10px] font-mono text-text-tertiary flex items-center gap-1">
                  <Clock size={10} /> Autosaved {lastAutosaved.toLocaleTimeString()}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black font-display uppercase tracking-tight text-text-primary">
              {initialArticle ? 'Edit Article Brief' : 'New 60-Word Executive Brief'}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
              <span>Editorial Meta</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-surface text-xs font-mono font-bold uppercase text-text-secondary hover:text-text-primary hover:border-text-tertiary transition-colors cursor-pointer"
          >
            <Eye size={14} />
            <span>Live Reader Preview</span>
          </button>

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

      {/* Mode 1: Canvas Design Studio */}
      {editorMode === 'canvas' && (
        <div className="space-y-6">
          {/* Quick Headline & Summary Bar */}
          <div className="p-5 rounded-2xl border border-border bg-surface shadow-card space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono font-bold uppercase text-text-tertiary block mb-1">
                  Article Headline
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. CRED — Jab 'Exclusive' Hi Business Model Ban Gaya"
                  className="w-full text-base font-bold font-display p-3 bg-surface-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-mono font-bold uppercase text-text-tertiary">
                    60-Word Overview Summary
                  </label>
                  <span className={`text-xs font-mono font-bold ${isOverWordBudget ? 'text-red-500' : 'text-text-secondary'}`}>
                    {wordCount}/60 words
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={summary}
                  onChange={e => setSummary(e.target.value)}
                  placeholder="Type the 60-word concise news overview..."
                  className="w-full text-xs font-body p-3 bg-surface-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand resize-none"
                />
              </div>
            </div>

            {/* Writer / Reporter Attribution */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/60">
              <div>
                <label className="text-xs font-mono font-bold uppercase text-text-tertiary block mb-1">
                  Writer / Author Name
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={e => setAuthorName(e.target.value)}
                  placeholder="e.g. Aditya Poddar"
                  className="w-full text-xs font-mono p-2.5 bg-surface-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
              <div>
                <label className="text-xs font-mono font-bold uppercase text-text-tertiary block mb-1">
                  Writer Role / Editorial Title
                </label>
                <input
                  type="text"
                  value={authorRole}
                  onChange={e => setAuthorRole(e.target.value)}
                  placeholder="e.g. Senior Venture Analyst"
                  className="w-full text-xs font-mono p-2.5 bg-surface-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
            </div>
          </div>

          {/* Dedicated Cover Photo Section for Canvas Studio */}
          {renderCoverPhotoCard()}

          {/* Full Visual Canvas Designer */}
          <CanvasBlockEditor
            value={canvasData}
            onChange={setCanvasData}
            title={title}
            summary={summary}
          />
        </div>
      )}

      {/* Mode 2: Standard Editorial Form */}
      {editorMode === 'standard' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form Content (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Headline */}
            <div className="p-5 rounded-2xl border border-border bg-surface shadow-card space-y-2">
              <div className="flex items-center justify-between text-xs font-mono font-bold uppercase text-text-tertiary">
                <span>Headline</span>
                <span>{title.length}/150</span>
              </div>
              <textarea
                rows={2}
                maxLength={150}
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Verity Silicon Closes $340M Series C to Ramp AI Inference Microchips"
                className="w-full text-base sm:text-lg font-bold font-display p-3 bg-surface-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand"
              />

              {/* Slug with Uniqueness Checker */}
              <div className="pt-2 border-t border-border/50">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-mono font-bold uppercase text-text-tertiary">
                    URL Slug
                  </label>
                  <span className="text-[10px] font-mono">
                    {slugStatus === 'checking' && <span className="text-amber-500">Checking uniqueness...</span>}
                    {slugStatus === 'available' && <span className="text-emerald-500">✓ Slug available</span>}
                    {slugStatus === 'taken' && <span className="text-red-500 font-bold">⚠️ Slug already in use</span>}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-text-tertiary shrink-0">/articles/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={e => {
                      setIsCustomSlug(true);
                      setSlug(generateSlug(e.target.value));
                    }}
                    placeholder="article-url-slug"
                    className="w-full text-xs font-mono p-2 bg-surface-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>
              </div>
            </div>

            {/* 60-Word Executive Brief */}
            <div className="p-5 rounded-2xl border border-border bg-surface shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-secondary">
                  Executive Short Summary · Hard 60-Word Budget
                </span>
                <div
                  className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                    isOverWordBudget
                      ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 animate-pulse'
                      : 'bg-brand-muted text-brand'
                  }`}
                >
                  {wordCount} / 60 words
                </div>
              </div>

              <textarea
                rows={4}
                value={summary}
                onChange={e => setSummary(e.target.value)}
                placeholder="Type the 60-word concise news summary here. Focus on what happened, companies involved, valuation, and immediate market impact..."
                className="w-full text-sm font-body leading-relaxed p-3.5 bg-surface-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand resize-none"
              />

              {/* Word Progress Bar */}
              <div className="w-full h-1.5 bg-surface-muted rounded-full overflow-hidden border border-border/50">
                <div
                  className={`h-full transition-all duration-200 ${
                    isOverWordBudget ? 'bg-red-500' : 'bg-brand'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Dedicated Cover Photo Section */}
            {renderCoverPhotoCard()}

            {/* Full Article Body (Markdown) */}
            <div className="p-5 rounded-2xl border border-border bg-surface shadow-card space-y-2">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-text-secondary">
                Detailed Article Body (Markdown & Context)
              </div>
              <textarea
                rows={8}
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="### Background Context&#10;&#10;Detailed reporting for readers who tap 'Full story'..."
                className="w-full text-sm font-mono p-3.5 bg-surface-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand font-normal"
              />
            </div>

            {/* Source & Writer Attribution */}
            <div className="p-5 rounded-2xl border border-border bg-surface shadow-card space-y-4">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-text-secondary">
                Writer & Source Attribution
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <Input
                  label="Primary Source Name"
                  value={sourceName}
                  onChange={e => setSourceName(e.target.value)}
                  placeholder="The Information / Bloomberg / Reuters"
                />
                <Input
                  label="Source URL"
                  type="url"
                  value={sourceUrl}
                  onChange={e => setSourceUrl(e.target.value)}
                  placeholder="https://theinformation.com/..."
                />
              </div>
            </div>

            {/* SEO & Meta Fields with Character Counters */}
            <div className="p-5 rounded-2xl border border-border bg-surface shadow-card space-y-4">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-text-secondary">
                Search Engine Optimization (SEO)
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-mono font-bold uppercase text-text-tertiary">
                    SEO Meta Title
                  </label>
                  <span className={`text-[10px] font-mono ${seoTitle.length > 60 ? 'text-red-500 font-bold' : 'text-text-secondary'}`}>
                    {seoTitle.length} / 60 max
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={70}
                  value={seoTitle}
                  onChange={e => setSeoTitle(e.target.value)}
                  placeholder={title || 'Custom SEO Title for Google SERP'}
                  className="w-full text-xs font-mono p-2.5 bg-surface-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-mono font-bold uppercase text-text-tertiary">
                    SEO Meta Description
                  </label>
                  <span className={`text-[10px] font-mono ${seoDescription.length > 160 ? 'text-red-500 font-bold' : 'text-text-secondary'}`}>
                    {seoDescription.length} / 160 max
                  </span>
                </div>
                <textarea
                  rows={2}
                  maxLength={180}
                  value={seoDescription}
                  onChange={e => setSeoDescription(e.target.value)}
                  placeholder={summary || 'Snippet summary shown on search engines and social share previews...'}
                  className="w-full text-xs font-mono p-2.5 bg-surface-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand resize-none"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Publishing Controls */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-5 rounded-2xl border border-border bg-surface shadow-card space-y-5">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary border-b border-border pb-2">
                Publishing Controls
              </h2>

              {/* Category Picker */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary font-mono mb-2">
                  Coverage Desk Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryId(cat.id)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        categoryId === cat.id
                          ? 'border-brand bg-brand/10 text-text-primary shadow-xs'
                          : 'border-border bg-surface-muted text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="truncate">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary font-mono mb-2">
                  Lifecycle Status
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as ContentStatus)}
                  className="w-full p-2.5 rounded-xl border border-border bg-surface-muted text-xs font-mono font-bold uppercase text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  <option value="DRAFT">DRAFT (Internal)</option>
                  <option value="IN_REVIEW">IN REVIEW (Editor Check)</option>
                  <option value="SCHEDULED">SCHEDULED (Timed Release)</option>
                  <option value="PUBLISHED">PUBLISHED (Live on Feed)</option>
                </select>
              </div>

              {/* Flags */}
              <div className="space-y-3 pt-2 border-t border-border">
                <label className="flex items-center gap-2 text-xs font-mono font-medium text-text-secondary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={e => setIsFeatured(e.target.checked)}
                    className="rounded border-border text-brand focus:ring-brand"
                  />
                  <span>Mark as Featured Headline</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-mono font-medium text-text-secondary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTrending}
                    onChange={e => setIsTrending(e.target.checked)}
                    className="rounded border-border text-brand focus:ring-brand"
                  />
                  <span>Flag as Trending / High-Priority</span>
                </label>
              </div>

              {/* Tags */}
              <div className="pt-2 border-t border-border">
                <Input
                  label="Tags (Comma-Separated)"
                  value={tagsInput}
                  onChange={e => setTagsInput(e.target.value)}
                  placeholder="AI, Series A, Semiconductors, Nvidia"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Action Footer */}
      <div className="sticky bottom-4 z-30 p-4 rounded-2xl bg-surface/95 backdrop-blur-md border border-border shadow-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-surface text-xs font-mono font-bold uppercase text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            <Eye size={14} />
            <span>Live Preview</span>
          </button>
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
            Publish Now
          </Button>
        </div>
      </div>

      {/* Live Reader Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-surface rounded-3xl border border-border flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-muted">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold uppercase text-brand flex items-center gap-1">
                  <Sparkles size={14} />
                  Live Reader Preview
                </span>
                <div className="flex items-center gap-1 bg-surface p-1 rounded-lg border border-border text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setPreviewTab('card')}
                    className={`px-2.5 py-1 rounded cursor-pointer ${previewTab === 'card' ? 'bg-brand text-white font-bold' : 'text-text-secondary'}`}
                  >
                    Feed Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab('canvas')}
                    className={`px-2.5 py-1 rounded cursor-pointer ${previewTab === 'canvas' ? 'bg-brand text-white font-bold' : 'text-text-secondary'}`}
                  >
                    Visual Canvas
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-surface p-1 rounded-lg border border-border text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`p-1.5 rounded cursor-pointer ${previewDevice === 'mobile' ? 'bg-brand text-white' : 'text-text-secondary'}`}
                    title="Mobile View"
                  >
                    <Smartphone size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`p-1.5 rounded cursor-pointer ${previewDevice === 'desktop' ? 'bg-brand text-white' : 'text-text-secondary'}`}
                    title="Desktop View"
                  >
                    <Monitor size={16} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewOpen(false)}
                  className="p-1.5 rounded-lg border border-border text-text-secondary hover:text-text-primary cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body Preview Container */}
            <div className="flex-1 overflow-y-auto p-6 flex justify-center bg-background">
              <div
                className={`transition-all duration-300 w-full ${
                  previewDevice === 'mobile' ? 'max-w-md' : 'max-w-2xl'
                }`}
              >
                {previewTab === 'card' && (
                  <StoryCard
                    article={previewArticle}
                    onBookmarkToggle={() => {}}
                  />
                )}
                {previewTab === 'canvas' && canvasData && (
                  <div className="bg-surface rounded-2xl border border-border overflow-hidden p-4">
                    <CanvasStoryView
                      story={previewArticle}
                      canvasData={canvasData}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
