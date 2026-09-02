'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BlogItem, CategoryItem, ContentStatus } from '../../types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../providers/ToastProvider';
import { ArrowLeft, Send, Image as ImageIcon, X } from 'lucide-react';

interface BlogEditorFormProps {
  initialBlog?: BlogItem | null;
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
];

export const BlogEditorForm: React.FC<BlogEditorFormProps> = ({
  initialBlog,
  categories,
}) => {
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = useState(initialBlog?.title || '');
  const [excerpt, setExcerpt] = useState(initialBlog?.excerpt || '');
  const [body, setBody] = useState(initialBlog?.body || '');
  const [categoryId, setCategoryId] = useState(
    initialBlog?.categoryId || categories[0]?.id || ''
  );
  const [coverImage, setCoverImage] = useState(initialBlog?.coverImage || '');
  const [readTimeMinutes, setReadTimeMinutes] = useState(initialBlog?.readTimeMinutes || 4);
  const [status, setStatus] = useState<ContentStatus>(initialBlog?.status || 'DRAFT');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (targetStatus: ContentStatus) => {
    if (!title.trim() || !excerpt.trim() || !body.trim()) {
      toast('Please fill in title, excerpt, and body', 'error');
      return;
    }

    setSubmitting(true);
    const payload = {
      title,
      excerpt,
      body,
      categoryId,
      coverImage: coverImage.trim() || null,
      readTimeMinutes: Number(readTimeMinutes),
      status: targetStatus,
    };

    try {
      const url = initialBlog ? `/api/blogs/${initialBlog.id}` : '/api/blogs';
      const method = initialBlog ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast('Blog essay saved successfully', 'success');
        window.location.href = '/admin/blogs';
      } else {
        const data = await res.json();
        toast(data.error || 'Failed to save blog', 'error');
      }
    } catch {
      toast('Network error saving blog', 'error');
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
              {initialBlog ? 'EDITING ESSAY' : 'CREATE LONG-FORM ESSAY'}
            </div>
            <h1 className="text-2xl font-black font-display uppercase tracking-tight text-text-primary">
              {initialBlog ? 'Update Blog Post' : 'New Editorial Essay'}
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
            Publish Now
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="p-6 rounded-2xl border border-border bg-surface shadow-card space-y-5">
          <Input
            label="Essay Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. The Modern Founder Blueprint: Why Capital Efficiency Is Winning"
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary font-mono">
              Subtitle / Executive Excerpt
            </label>
            <textarea
              rows={3}
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              placeholder="Short description summarizing the core thesis of the essay..."
              className="w-full text-sm p-3 rounded-xl border border-border bg-surface-muted focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary font-mono mb-1.5">
                Category Desk
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

            <Input
              label="Estimated Read Time (Minutes)"
              type="number"
              min={1}
              value={readTimeMinutes}
              onChange={e => setReadTimeMinutes(Number(e.target.value))}
            />
          </div>

          {/* Rich Cover Photo Card */}
          <div className="p-4 rounded-xl border border-border bg-surface-muted/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ImageIcon size={15} className="text-brand" />
                <label className="text-xs font-mono font-bold uppercase text-text-primary">
                  Cover Photo & Header Media
                </label>
              </div>
              {coverImage && (
                <button
                  type="button"
                  onClick={() => setCoverImage('')}
                  className="text-[10px] font-mono text-red-500 hover:underline flex items-center gap-1"
                >
                  <X size={11} /> Clear Photo
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-8 space-y-2">
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
                      className="px-2 py-0.5 rounded-lg border border-border bg-surface hover:bg-border/60 text-[10px] font-mono text-text-secondary hover:text-text-primary transition-all active:scale-95"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-4">
                <div className="relative w-full h-28 rounded-xl overflow-hidden bg-surface border border-border flex items-center justify-center">
                  {coverImage ? (
                    <img
                      src={coverImage}
                      alt="Cover Preview"
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

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary font-mono">
              Full Essay Body (Markdown)
            </label>
            <textarea
              rows={12}
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="### The Core Thesis&#10;&#10;Write the complete analysis using markdown headers and bullet points..."
              className="w-full text-sm font-mono p-3.5 rounded-xl border border-border bg-surface-muted focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
