'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BlogItem, CategoryItem, ContentStatus } from '../../types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../providers/ToastProvider';
import { ArrowLeft, Send } from 'lucide-react';

interface BlogEditorFormProps {
  initialBlog?: BlogItem | null;
  categories: CategoryItem[];
}

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
        router.push('/admin/blogs');
        router.refresh();
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
        <div className="p-6 rounded-2xl border border-border bg-surface shadow-card space-y-4">
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

          <Input
            label="Cover Image URL"
            type="url"
            value={coverImage}
            onChange={e => setCoverImage(e.target.value)}
            placeholder="https://images.unsplash.com/..."
          />

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
