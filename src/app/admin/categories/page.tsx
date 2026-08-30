'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FolderTree, Tag as TagIcon, Check } from 'lucide-react';
import { CategoryItem } from '../../../types';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { useToast } from '../../../components/providers/ToastProvider';

const PRESET_COLORS = ['#FF6B6B', '#10B981', '#6366F1', '#F59E0B', '#8B5CF6', '#EC4899', '#3B82F6', '#14B8A6'];

export default function AdminCategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<CategoryItem | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch {
      toast('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCat(null);
    setName('');
    setSlug('');
    setDescription('');
    setColor('#3B82F6');
    setModalOpen(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    setEditingCat(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setColor(cat.color || '#3B82F6');
    setModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCat) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      toast('Name and slug are required', 'error');
      return;
    }

    setSaving(true);
    const payload = { name, slug, description, color };

    try {
      const url = editingCat ? `/api/categories/${editingCat.id}` : '/api/categories';
      const method = editingCat ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast(editingCat ? 'Category updated' : 'Category created', 'success');
        setModalOpen(false);
        fetchCategories();
      } else {
        const data = await res.json();
        toast(data.error || 'Failed to save category', 'error');
      }
    } catch {
      toast('Error saving category', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="text-xs font-mono font-bold uppercase text-text-tertiary">
            TAXONOMY & DESKS
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display uppercase tracking-tight text-text-primary">
            Categories & Desks
          </h1>
          <p className="text-xs font-mono text-text-tertiary mt-0.5">
            Organize news streams into vertical coverage desks.
          </p>
        </div>

        <Button onClick={openCreateModal} variant="primary" size="sm" leftIcon={<Plus size={14} />}>
          <span>+ New Category Desk</span>
        </Button>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map(cat => (
          <div
            key={cat.id}
            className="p-5 rounded-2xl border border-border bg-surface shadow-card flex items-start justify-between gap-4 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 bottom-0 w-2" style={{ backgroundColor: cat.color }} />
            <div className="pl-3 space-y-1.5 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <h3 className="font-bold font-display text-base text-text-primary truncate">
                  {cat.name}
                </h3>
              </div>
              <div className="text-xs font-mono text-text-tertiary">
                Slug: <span className="font-semibold text-text-secondary">/categories/{cat.slug}</span>
              </div>
              <p className="text-xs text-text-secondary line-clamp-2">
                {cat.description || 'No description provided.'}
              </p>
            </div>

            <button
              onClick={() => openEditModal(cat)}
              className="p-2 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-colors shrink-0"
            >
              <Edit2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCat ? 'Edit Category Desk' : 'Create Category Desk'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Category Name"
            value={name}
            onChange={e => handleNameChange(e.target.value)}
            placeholder="e.g. Cleantech & Energy"
            required
          />

          <Input
            label="URL Slug"
            value={slug}
            onChange={e => setSlug(e.target.value)}
            placeholder="e.g. cleantech-and-energy"
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary font-mono">
              Desk Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Short description of this coverage desk..."
              className="w-full text-xs p-3 rounded-xl border border-border bg-surface-muted focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary font-mono mb-2">
              Color Identifier
            </label>
            <div className="flex items-center gap-2">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center ${
                    color === c ? 'scale-110 ring-2 ring-brand ring-offset-2' : ''
                  }`}
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check size={12} className="text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={saving}>
              {editingCat ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
