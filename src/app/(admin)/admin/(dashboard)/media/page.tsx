'use client';

import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Copy, Check, Plus, Trash2, Sparkles, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/providers/ToastProvider';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface MediaItem {
  id: string;
  title: string;
  url: string;
  category?: string;
  created_at?: string;
  uploader?: { name?: string; email?: string };
}

const PRESET_MEDIA = [
  {
    title: 'AI Microchip Silicon Wafer',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    category: 'Hardware',
  },
  {
    title: 'Fintech Mobile Payment POS',
    url: 'https://images.unsplash.com/photo-1556742049-0a67e557224f?auto=format&fit=crop&w=1200&q=80',
    category: 'Fintech',
  },
  {
    title: 'Green Carbon Wind Turbines',
    url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
    category: 'Cleantech',
  },
  {
    title: 'Wall Street Trading Monitors',
    url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    category: 'Markets',
  },
  {
    title: 'Neural Matrix Data Center',
    url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80',
    category: 'AI',
  },
  {
    title: 'Deeptech Research Laboratory',
    url: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1200&q=80',
    category: 'Deeptech',
  },
];

export default function AdminMediaPage() {
  const { toast } = useToast();
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/media');
      if (res.ok) {
        const data = await res.json();
        setMediaList(data.assets || []);
      } else {
        toast('Failed to load media assets', 'error');
      }
    } catch {
      toast('Network error loading media library', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast('Image URL copied to clipboard', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim() || !newTitle.trim()) {
      toast('Title and image URL are required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          url: newUrl.trim(),
          category: newCategory,
        }),
      });

      const data = await res.json();
      if (res.ok && data.asset) {
        toast('Media asset registered in database', 'success');
        setMediaList([data.asset, ...mediaList]);
        setNewTitle('');
        setNewUrl('');
      } else {
        toast(data.error || 'Failed to register media asset', 'error');
      }
    } catch {
      toast('Network error saving media asset', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterPreset = async (preset: { title: string; url: string; category: string }) => {
    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preset),
      });
      const data = await res.json();
      if (res.ok && data.asset) {
        toast(`Added "${preset.title}" to library`, 'success');
        setMediaList(prev => [data.asset, ...prev]);
      } else {
        toast(data.error || 'Failed to add preset', 'error');
      }
    } catch {
      toast('Network error adding preset', 'error');
    }
  };

  const handleDeleteMedia = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to remove "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/media/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast('Media asset removed', 'info');
        setMediaList(prev => prev.filter(m => m.id !== id));
      } else {
        toast('Failed to delete media asset', 'error');
      }
    } catch {
      toast('Network error deleting media', 'error');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="text-xs font-mono font-bold uppercase text-text-tertiary">
            PERSISTENT ASSET PIPELINE
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display uppercase tracking-tight text-text-primary">
            Editorial Media Library
          </h1>
          <p className="text-xs font-mono text-text-tertiary mt-0.5">
            Manage verified cover imagery and editorial photo credits backed by Supabase storage.
          </p>
        </div>

        <button
          onClick={fetchMedia}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-surface text-xs font-mono font-bold hover:bg-surface-muted transition-colors self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Library</span>
        </button>
      </div>

      {/* Add New Asset Box */}
      <div className="p-6 rounded-2xl border border-border bg-surface shadow-card space-y-4">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
          <Plus size={15} className="text-brand" />
          Register New Image Asset
        </h2>
        <form onSubmit={handleAddMedia} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-4">
            <Input
              label="Asset Description *"
              value={newTitle}
              onChange={(e: any) => setNewTitle(e.target.value)}
              placeholder="e.g. OpenAI DevDay Stage Keynote"
              required
            />
          </div>
          <div className="sm:col-span-5">
            <Input
              label="Direct Image URL *"
              type="url"
              value={newUrl}
              onChange={(e: any) => setNewUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary font-mono mb-2">
              Category
            </label>
            <select
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-border bg-surface text-xs font-mono font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="General">General</option>
              <option value="Hardware">Hardware</option>
              <option value="Fintech">Fintech</option>
              <option value="Cleantech">Cleantech</option>
              <option value="Markets">Markets</option>
              <option value="AI">AI & Compute</option>
              <option value="Deeptech">Deeptech</option>
            </select>
          </div>
          <div className="sm:col-span-1">
            <Button type="submit" variant="primary" size="md" className="w-full" isLoading={submitting}>
              <span>Add</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Quick Preset Tray */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-tertiary flex items-center gap-1.5">
          <Sparkles size={14} className="text-amber-500" />
          Quick Curated Presets
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {PRESET_MEDIA.map((preset, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-border bg-surface overflow-hidden p-2 space-y-2 group hover:border-brand/40 transition-all"
            >
              <div className="h-20 bg-surface-muted rounded-lg overflow-hidden relative">
                <img
                  src={preset.url}
                  alt={preset.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase bg-black/80 text-white">
                  {preset.category}
                </span>
              </div>
              <div className="space-y-1">
                <div className="text-[11px] font-bold font-display text-text-primary truncate">
                  {preset.title}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleCopy(preset.url, `preset-${idx}`)}
                    className="flex-1 py-1 rounded bg-surface-muted hover:bg-border text-[9px] font-mono font-bold uppercase text-text-secondary transition-colors text-center cursor-pointer"
                  >
                    {copiedId === `preset-${idx}` ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRegisterPreset(preset)}
                    className="p-1 rounded bg-brand/10 hover:bg-brand/20 text-brand text-[9px] font-mono font-bold uppercase transition-colors cursor-pointer"
                    title="Add to permanent library"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary">
            Saved Media Library ({mediaList.length} assets)
          </h3>
        </div>

        {loading ? (
          <div className="p-16 text-center text-xs font-mono text-text-tertiary">
            Loading media assets from database...
          </div>
        ) : mediaList.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-border rounded-2xl space-y-2">
            <ImageIcon size={32} className="mx-auto text-text-tertiary" />
            <div className="text-sm font-bold text-text-primary font-display">No media assets saved yet</div>
            <p className="text-xs font-mono text-text-tertiary">
              Add custom image URLs or register presets above to populate your team library.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {mediaList.map(item => (
              <div
                key={item.id}
                className="rounded-2xl border border-border bg-surface overflow-hidden shadow-card hover:shadow-card-hover transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="h-44 bg-surface-muted overflow-hidden relative">
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-black/75 text-white backdrop-blur-xs">
                      {item.category || 'General'}
                    </span>
                  </div>

                  <div className="p-4 space-y-1">
                    <h4 className="font-bold text-sm font-display text-text-primary line-clamp-1">
                      {item.title}
                    </h4>
                    <div className="text-[10px] font-mono text-text-tertiary truncate">
                      {item.url}
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-2 border-t border-border flex items-center justify-between">
                  <button
                    onClick={() => handleCopy(item.url, item.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface-muted hover:bg-border text-xs font-mono font-bold uppercase text-text-primary transition-colors cursor-pointer"
                  >
                    {copiedId === item.id ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    <span>{copiedId === item.id ? 'Copied' : 'Copy URL'}</span>
                  </button>

                  <button
                    onClick={() => handleDeleteMedia(item.id, item.title)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Delete Media Asset"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
