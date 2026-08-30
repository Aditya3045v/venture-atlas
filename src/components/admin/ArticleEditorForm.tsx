'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArticleItem, CategoryItem, ContentStatus } from '../../types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../providers/ToastProvider';
import { countWords } from '../../lib/sanitize';
import {
  ArrowLeft,
  Check,
  Clock,
  Eye,
  Bookmark,
  Share2,
  Calendar,
  Send,
} from 'lucide-react';

interface ArticleEditorFormProps {
  initialArticle?: ArticleItem | null;
  categories: CategoryItem[];
}

export const ArticleEditorForm: React.FC<ArticleEditorFormProps> = ({
  initialArticle,
  categories,
}) => {
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = useState(initialArticle?.title || '');
  const [summary, setSummary] = useState(initialArticle?.summary || '');
  const [body, setBody] = useState(initialArticle?.body || '');
  const [categoryId, setCategoryId] = useState(
    initialArticle?.categoryId || categories[0]?.id || ''
  );
  const [sourceName, setSourceName] = useState(initialArticle?.sourceName || '');
  const [sourceUrl, setSourceUrl] = useState(initialArticle?.sourceUrl || '');
  const [sourceAuthor, setSourceAuthor] = useState(initialArticle?.sourceAuthor || '');
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

  const wordCount = countWords(summary);
  const isOverWordBudget = wordCount > 60;
  const progressPercent = Math.min(100, Math.round((wordCount / 60) * 100));

  const selectedCategory = categories.find(c => c.id === categoryId) || categories[0];

  const handleSubmit = async (targetStatus: ContentStatus) => {
    if (!title.trim()) {
      toast('Please enter a headline', 'error');
      return;
    }
    if (!summary.trim()) {
      toast('Please enter the 60-word summary', 'error');
      return;
    }
    if (wordCount > 60) {
      toast(`Word budget exceeded: ${wordCount}/60 words. Please trim ${wordCount - 60} words.`, 'error');
      return;
    }

    setSubmitting(true);

    const tagsArray = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const payload = {
      title,
      summary,
      body: body.trim() || summary,
      categoryId,
      sourceName: sourceName.trim() || null,
      sourceUrl: sourceUrl.trim() || null,
      sourceAuthor: sourceAuthor.trim() || null,
      coverImage: coverImage.trim() || null,
      photoCredit: photoCredit.trim() || null,
      status: targetStatus,
      isFeatured,
      isTrending,
      scheduledFor: targetStatus === 'SCHEDULED' && scheduledFor ? new Date(scheduledFor).toISOString() : null,
      tags: tagsArray,
      seoTitle: seoTitle.trim() || null,
      seoDescription: seoDescription.trim() || null,
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
        toast(
          targetStatus === 'PUBLISHED'
            ? 'Article published to live feed!'
            : 'Story saved successfully',
          'success'
        );
        router.push('/admin/articles');
        router.refresh();
      } else {
        const data = await res.json();
        toast(data.error || 'Failed to save article', 'error');
      }
    } catch {
      toast('Network error saving article', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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
              {initialArticle ? 'EDITING STORY BRIEF' : 'CREATE STORY BRIEF'}
            </div>
            <h1 className="text-2xl font-black font-display uppercase tracking-tight text-text-primary">
              {initialArticle ? 'Update Article' : 'New 60-Word Brief'}
            </h1>
          </div>
        </div>

        {/* Quick Action Top Buttons */}
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

      {/* 2-Column Responsive Layout */}
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
          </div>

          {/* 60-Word Executive Brief (With hard counter & progress bar) */}
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
                  isOverWordBudget ? 'bg-status-danger' : 'bg-brand'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

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

          {/* Source Attribution */}
          <div className="p-5 rounded-2xl border border-border bg-surface shadow-card space-y-4">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-text-secondary">
              Source Attribution & Wire Verification
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Source Name"
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

          {/* Cover Image */}
          <div className="p-5 rounded-2xl border border-border bg-surface shadow-card space-y-4">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-text-secondary">
              Media Asset & Photo
            </div>
            <Input
              label="Cover Image URL"
              type="url"
              value={coverImage}
              onChange={e => setCoverImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
            />
            <Input
              label="Photo Credit"
              value={photoCredit}
              onChange={e => setPhotoCredit(e.target.value)}
              placeholder="REUTERS / PORT OF ROTTERDAM"
            />
          </div>
        </div>

        {/* Right Column: Publishing Controls & Live Card Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Publishing Controls Panel */}
          <div className="p-5 rounded-2xl border border-border bg-surface shadow-card space-y-5">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary border-b border-border pb-2">
              Publishing Controls
            </h2>

            {/* Category Picker */}
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-text-secondary mb-2">
                Editorial Category Desk
              </label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full h-10 px-3 text-xs font-mono font-bold rounded-xl border border-border bg-surface-muted text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <Input
              label="Tags (Comma separated)"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder="AI, Series C, Sequoia, Chips"
            />

            {/* Status Selector */}
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-text-secondary mb-2">
                Editorial Lifecycle Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED'] as ContentStatus[]).map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatus(st)}
                    className={`py-2 px-3 rounded-lg text-xs font-mono font-bold uppercase border transition-colors ${
                      status === st
                        ? 'bg-brand text-white border-brand shadow-sm'
                        : 'bg-surface border-border text-text-secondary hover:bg-surface-muted'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Flags */}
            <div className="pt-2 border-t border-border space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-text-primary">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={e => setIsFeatured(e.target.checked)}
                  className="rounded border-border text-brand focus:ring-brand"
                />
                <span>Pin as Featured Lead Story</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-text-primary">
                <input
                  type="checkbox"
                  checked={isTrending}
                  onChange={e => setIsTrending(e.target.checked)}
                  className="rounded border-border text-brand focus:ring-brand"
                />
                <span>Mark as Trending Story</span>
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="pt-4 border-t border-border flex flex-col gap-2">
              <Button
                type="button"
                variant="primary"
                className="w-full"
                onClick={() => handleSubmit('PUBLISHED')}
                isLoading={submitting}
              >
                <Send size={14} />
                <span>Publish Immediately</span>
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => handleSubmit('IN_REVIEW')}
                isLoading={submitting}
              >
                Submit for Editorial Review
              </Button>
            </div>
          </div>

          {/* Live Real-time Card Preview */}
          <div className="p-5 rounded-2xl border border-border bg-surface shadow-card space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-text-tertiary">
              <Eye size={14} />
              <span>Real-Time Public Card Preview</span>
            </div>

            {/* Card Mockup */}
            <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-card">
              {coverImage ? (
                <div className="h-44 bg-surface-muted overflow-hidden relative">
                  <img src={coverImage} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute top-2.5 right-2.5">
                    <span
                      className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase text-white shadow-sm"
                      style={{ backgroundColor: selectedCategory?.color || '#2563EB' }}
                    >
                      {selectedCategory?.name}
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  className="h-32 flex items-center justify-center font-mono font-bold text-xs uppercase text-white"
                  style={{ backgroundColor: selectedCategory?.color || '#2563EB' }}
                >
                  {selectedCategory?.name || 'Category'}
                </div>
              )}

              <div className="p-4 space-y-2.5">
                <div className="text-[10px] font-mono text-text-tertiary">
                  {sourceName || 'Source'} · Just Now
                </div>
                <h3 className="font-bold font-display text-base text-text-primary leading-snug line-clamp-2">
                  {title || 'Headline will appear here in bold high-contrast display font...'}
                </h3>
                <p className="text-xs font-body text-text-secondary leading-relaxed line-clamp-3">
                  {summary || 'The 60-word concise news brief summary will render here live as you type...'}
                </p>
                <div className="pt-2 border-t border-border flex items-center justify-between text-[10px] font-mono text-text-tertiary">
                  <span>{wordCount} words</span>
                  <span className="text-brand font-bold">Full story →</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
