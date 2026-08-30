'use client';

import React, { useState } from 'react';
import { Image as ImageIcon, UploadCloud, Copy, Check, Plus, Trash2 } from 'lucide-react';
import { useToast } from '../../../components/providers/ToastProvider';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

const PRESET_MEDIA = [
  {
    id: 'm-1',
    title: 'AI Microchip Silicon Wafer',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    category: 'Hardware',
  },
  {
    id: 'm-2',
    title: 'Fintech Mobile Payment POS',
    url: 'https://images.unsplash.com/photo-1556742049-0a67e557224f?auto=format&fit=crop&w=1200&q=80',
    category: 'Fintech',
  },
  {
    id: 'm-3',
    title: 'Green Carbon Wind Turbines',
    url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
    category: 'Cleantech',
  },
  {
    id: 'm-4',
    title: 'Wall Street Trading Monitors',
    url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    category: 'Markets',
  },
  {
    id: 'm-5',
    title: 'Neural Matrix Data Center',
    url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80',
    category: 'AI',
  },
  {
    id: 'm-6',
    title: 'Deeptech Research Laboratory',
    url: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1200&q=80',
    category: 'Deeptech',
  },
];

export default function AdminMediaPage() {
  const { toast } = useToast();
  const [mediaList, setMediaList] = useState(PRESET_MEDIA);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast('Image URL copied to clipboard', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;
    const item = {
      id: `m-${Date.now()}`,
      title: newTitle.trim() || 'Uploaded Asset',
      url: newUrl.trim(),
      category: 'Custom',
    };
    setMediaList([item, ...mediaList]);
    setNewTitle('');
    setNewUrl('');
    toast('Media asset registered in library', 'success');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="text-xs font-mono font-bold uppercase text-text-tertiary">
            ASSET PIPELINE
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display uppercase tracking-tight text-text-primary">
            Editorial Media Library
          </h1>
          <p className="text-xs font-mono text-text-tertiary mt-0.5">
            Manage high-resolution verified cover imagery and photo credits for briefs and essays.
          </p>
        </div>
      </div>

      {/* Add New Asset Box */}
      <div className="p-6 rounded-2xl border border-border bg-surface shadow-card space-y-4">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-text-secondary">
          Register New Image Asset URL
        </h2>
        <form onSubmit={handleAddMedia} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-5">
            <Input
              label="Asset Description"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="e.g. OpenAI DevDay Stage Keynote"
            />
          </div>
          <div className="sm:col-span-5">
            <Input
              label="Direct Image URL"
              type="url"
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              required
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" variant="primary" size="md" className="w-full">
              <span>Add Asset</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Media Grid */}
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
                  {item.category}
                </span>
              </div>

              <div className="p-4 space-y-1">
                <h3 className="font-bold text-sm font-display text-text-primary line-clamp-1">
                  {item.title}
                </h3>
                <div className="text-[10px] font-mono text-text-tertiary truncate">
                  {item.url}
                </div>
              </div>
            </div>

            <div className="p-4 pt-2 border-t border-border flex items-center justify-between">
              <button
                onClick={() => handleCopy(item.url, item.id)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-surface-muted hover:bg-border text-xs font-mono font-bold uppercase text-text-primary transition-colors"
              >
                {copiedId === item.id ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                <span>{copiedId === item.id ? 'Copied' : 'Copy URL'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
