'use client';

import React, { useState } from 'react';
import { NavigationItem } from '@/types';
import {
  Compass,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit2,
  Check,
  X,
  RotateCcw,
  ExternalLink,
  Eye,
  EyeOff,
  Home,
  Save,
} from 'lucide-react';
import Link from 'next/link';

interface AdminNavigationClientProps {
  initialItems: NavigationItem[];
}

export const AdminNavigationClient: React.FC<AdminNavigationClientProps> = ({ initialItems }) => {
  const [items, setItems] = useState<NavigationItem[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editHref, setEditHref] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newHref, setNewHref] = useState('');
  const [newIsActive, setNewIsActive] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === items.length - 1)
    ) {
      return;
    }

    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    // Re-assign orderNum
    const updatedWithOrder = newItems.map((item, idx) => ({
      ...item,
      orderNum: idx,
    }));

    setItems(updatedWithOrder);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/navigation', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: updatedWithOrder.map(i => ({ id: i.id, orderNum: i.orderNum, isActive: i.isActive })),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update navigation order');
      }
      showFeedback('Navigation order updated successfully');
    } catch (err: any) {
      showFeedback(err.message || 'Error updating order', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (item: NavigationItem) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/navigation/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !item.isActive }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      setItems(prev =>
        prev.map(i => (i.id === item.id ? { ...i, isActive: !i.isActive } : i))
      );
      showFeedback(`"${item.label}" visibility toggled`);
    } catch (err: any) {
      showFeedback(err.message || 'Error toggling item', 'error');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item: NavigationItem) => {
    setEditingId(item.id);
    setEditLabel(item.label);
    setEditHref(item.href);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditLabel('');
    setEditHref('');
  };

  const saveEdit = async (id: string) => {
    if (!editLabel.trim() || !editHref.trim()) {
      showFeedback('Label and URL cannot be empty', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/navigation/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: editLabel.trim(),
          href: editHref.trim(),
        }),
      });

      if (!res.ok) throw new Error('Failed to save link changes');

      setItems(prev =>
        prev.map(i =>
          i.id === id ? { ...i, label: editLabel.trim(), href: editHref.trim() } : i
        )
      );
      setEditingId(null);
      showFeedback('Navigation link updated successfully');
    } catch (err: any) {
      showFeedback(err.message || 'Error saving link', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item: NavigationItem) => {
    if (!confirm(`Are you sure you want to delete the navigation link "${item.label}"?`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/navigation/${item.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete item');

      setItems(prev => prev.filter(i => i.id !== item.id));
      showFeedback(`"${item.label}" deleted from navigation`);
    } catch (err: any) {
      showFeedback(err.message || 'Error deleting item', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim() || !newHref.trim()) {
      showFeedback('Label and path are required', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/navigation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: newLabel.trim(),
          href: newHref.trim(),
          orderNum: items.length,
          isActive: newIsActive,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to add navigation link');
      }

      setItems(prev => [
        ...prev,
        {
          id: data.item.id,
          label: data.item.label,
          href: data.item.href,
          orderNum: data.item.order_num ?? prev.length,
          isActive: data.item.is_active ?? true,
        },
      ]);

      setNewLabel('');
      setNewHref('');
      setShowAddModal(false);
      showFeedback('New navigation link added successfully');
    } catch (err: any) {
      showFeedback(err.message || 'Error adding link', 'error');
    } finally {
      setLoading(false);
    }
  };

  const activePublicItems = items.filter(i => i.isActive);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="text-xs font-mono font-bold uppercase text-text-tertiary flex items-center gap-1.5">
            <Compass size={14} className="text-brand" />
            <span>HEADER & NAVIGATION MANAGEMENT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display uppercase tracking-tight text-text-primary mt-1">
            Navigation Panel Editor
          </h1>
          <p className="text-xs font-mono text-text-tertiary mt-1">
            Configure public header links, reorder desk tabs, and manage custom destination routes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-full bg-text-primary text-background font-mono font-bold text-xs uppercase flex items-center gap-2 hover:opacity-90 transition-opacity active:scale-95 shadow-xs"
          >
            <Plus size={14} />
            <span>Add Nav Link</span>
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {message && (
        <div
          className={`p-3 rounded-xl text-xs font-mono font-bold uppercase flex items-center justify-between animate-fadeIn ${
            message.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
              : 'bg-red-500/10 text-red-500 border border-red-500/20'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="opacity-70 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Live Header Preview */}
      <div className="rounded-2xl border border-border bg-surface p-5 space-y-3 shadow-card">
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-text-tertiary flex items-center gap-2">
            <Eye size={14} className="text-text-primary" />
            <span>Live Header Navigation Preview (Active Links)</span>
          </div>
          <span className="text-[10px] font-mono text-text-tertiary">
            {activePublicItems.length} active links visible to readers
          </span>
        </div>

        <div className="p-3.5 bg-surface-muted/60 dark:bg-black/40 rounded-xl border border-border/60 overflow-x-auto no-scrollbar flex items-center gap-1.5">
          {activePublicItems.map((link, idx) => (
            <div
              key={link.id}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                idx === 0
                  ? 'bg-amber-400 text-black font-black shadow-xs'
                  : 'bg-surface border border-border text-text-secondary'
              }`}
            >
              {link.href === '/' && <Home size={12} />}
              <span>{link.label}</span>
              <span className="text-[9px] opacity-60 font-mono">({link.href})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Nav Links Manager Table / List */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-card">
        <div className="p-4 border-b border-border bg-surface-muted/30 flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary">
            Ordered Navigation List ({items.length} total)
          </span>
          <span className="text-[11px] font-mono text-text-tertiary">
            Use arrows to reorder • First link appears at the start
          </span>
        </div>

        <div className="divide-y divide-border">
          {items.map((item, index) => {
            const isEditing = editingId === item.id;
            const isFirst = index === 0;
            const isLast = index === items.length - 1;

            return (
              <div
                key={item.id}
                className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                  !item.isActive ? 'opacity-60 bg-surface-muted/20' : 'hover:bg-surface-muted/40'
                }`}
              >
                {/* Left: Position & Details */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Position Badge */}
                  <span className="w-7 h-7 rounded-lg bg-surface-muted border border-border flex items-center justify-center font-mono font-bold text-xs text-text-primary shrink-0">
                    {index + 1}
                  </span>

                  {isEditing ? (
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={editLabel}
                        onChange={e => setEditLabel(e.target.value)}
                        placeholder="Link Label (e.g. Home)"
                        className="px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-medium text-text-primary focus:outline-none focus:border-brand"
                      />
                      <input
                        type="text"
                        value={editHref}
                        onChange={e => setEditHref(e.target.value)}
                        placeholder="Path / URL (e.g. /)"
                        className="px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-mono text-text-primary focus:outline-none focus:border-brand"
                      />
                    </div>
                  ) : (
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {item.href === '/' && <Home size={14} className="text-amber-400 shrink-0" />}
                        <span className="font-bold font-display text-sm text-text-primary truncate">
                          {item.label}
                        </span>
                        {isFirst && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-amber-400/10 text-amber-500 border border-amber-400/30">
                            First Tab
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-mono text-text-tertiary flex items-center gap-1.5 mt-0.5 truncate">
                        <span>{item.href}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => saveEdit(item.id)}
                        disabled={loading}
                        className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors"
                        title="Save Changes"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={cancelEdit}
                        disabled={loading}
                        className="p-2 rounded-lg bg-surface-muted text-text-tertiary hover:text-text-primary transition-colors"
                        title="Cancel"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Reorder Up */}
                      <button
                        onClick={() => handleMove(index, 'up')}
                        disabled={isFirst || loading}
                        className={`p-1.5 rounded-lg border border-border transition-all ${
                          isFirst
                            ? 'opacity-30 cursor-not-allowed text-text-tertiary'
                            : 'hover:bg-surface-muted text-text-secondary active:scale-95'
                        }`}
                        title="Move Up"
                      >
                        <ArrowUp size={14} />
                      </button>

                      {/* Reorder Down */}
                      <button
                        onClick={() => handleMove(index, 'down')}
                        disabled={isLast || loading}
                        className={`p-1.5 rounded-lg border border-border transition-all ${
                          isLast
                            ? 'opacity-30 cursor-not-allowed text-text-tertiary'
                            : 'hover:bg-surface-muted text-text-secondary active:scale-95'
                        }`}
                        title="Move Down"
                      >
                        <ArrowDown size={14} />
                      </button>

                      {/* Toggle Visibility */}
                      <button
                        onClick={() => handleToggleActive(item)}
                        disabled={loading}
                        className={`p-1.5 rounded-lg border transition-all ${
                          item.isActive
                            ? 'border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10'
                            : 'border-border text-text-tertiary hover:bg-surface-muted'
                        }`}
                        title={item.isActive ? 'Hide from public header' : 'Show on public header'}
                      >
                        {item.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => startEdit(item)}
                        disabled={loading}
                        className="p-1.5 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-all active:scale-95"
                        title="Edit Label / Path"
                      >
                        <Edit2 size={14} />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(item)}
                        disabled={loading}
                        className="p-1.5 rounded-lg border border-red-500/20 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 transition-all active:scale-95"
                        title="Delete Link"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Nav Link Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold font-display uppercase tracking-tight text-text-primary flex items-center gap-2">
                <Plus size={16} className="text-brand" />
                <span>Add Navigation Link</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-text-tertiary hover:text-text-primary p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase font-bold text-text-tertiary mb-1.5">
                  Link Label
                </label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={e => setNewLabel(e.target.value)}
                  placeholder="e.g. AI & Robotics, Podcasts, etc."
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-surface-muted text-sm text-text-primary focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase font-bold text-text-tertiary mb-1.5">
                  Path / Destination URL
                </label>
                <input
                  type="text"
                  value={newHref}
                  onChange={e => setNewHref(e.target.value)}
                  placeholder="e.g. /categories/ai or https://..."
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-surface-muted text-sm font-mono text-text-primary focus:outline-none focus:border-brand"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="newIsActive"
                  checked={newIsActive}
                  onChange={e => setNewIsActive(e.target.checked)}
                  className="rounded border-border text-brand focus:ring-brand"
                />
                <label htmlFor="newIsActive" className="text-xs font-mono text-text-secondary cursor-pointer">
                  Visible immediately on public header
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-full border border-border text-text-secondary hover:text-text-primary text-xs font-mono uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-full bg-text-primary text-background font-mono font-bold text-xs uppercase hover:opacity-90 transition-opacity active:scale-95"
                >
                  {loading ? 'Adding...' : 'Add to Navigation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
