'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, XCircle, Trash2, Shield, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/providers/ToastProvider';

interface CommentRecord {
  id: string;
  article_id: string;
  user_name: string;
  user_email: string;
  body: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
}

export default function AdminCommentsPage() {
  const { toast } = useToast();
  const [comments, setComments] = useState<CommentRecord[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/comments?status=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      } else {
        toast('Failed to load comments', 'error');
      }
    } catch {
      toast('Network error loading comments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [filter]);

  const handleUpdateStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch(`/api/admin/comments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast(`Comment ${status.toLowerCase()}`, 'success');
        setComments(prev => prev.map(c => c.id === id ? { ...c, status } : c));
      } else {
        toast('Failed to update comment status', 'error');
      }
    } catch {
      toast('Network error updating comment', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this comment?')) return;
    try {
      const res = await fetch(`/api/admin/comments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast('Comment deleted', 'success');
        setComments(prev => prev.filter(c => c.id !== id));
      } else {
        toast('Failed to delete comment', 'error');
      }
    } catch {
      toast('Network error deleting comment', 'error');
    }
  };

  return (
    <div className="space-y-6 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-black font-display tracking-tight uppercase text-text-primary">
            Comment Moderation Desk
          </h1>
          <p className="text-xs font-mono text-text-tertiary">
            Review, approve, reject and manage reader comments across all published articles.
          </p>
        </div>
        <button
          onClick={fetchComments}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-mono hover:bg-surface-muted transition-colors"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-colors ${
              filter === tab
                ? 'bg-amber-400 text-black'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-muted'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Comments List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-text-tertiary">
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div className="p-12 text-center text-xs font-mono text-text-tertiary bg-surface rounded-2xl border border-border">
            No {filter !== 'ALL' ? filter.toLowerCase() : ''} comments found.
          </div>
        ) : (
          comments.map(c => (
            <div
              key={c.id}
              className="p-4 rounded-2xl border border-border bg-surface space-y-3"
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-text-primary">{c.user_name}</span>
                  <span className="text-text-tertiary">({c.user_email})</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    c.status === 'APPROVED'
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : c.status === 'REJECTED'
                      ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                      : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  }`}
                >
                  {c.status}
                </span>
              </div>

              <p className="text-xs font-body text-text-secondary whitespace-pre-wrap">
                {c.body}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs font-mono">
                <span className="text-text-tertiary">
                  {new Date(c.created_at).toLocaleString()}
                </span>
                <div className="flex items-center gap-2">
                  {c.status !== 'APPROVED' && (
                    <button
                      onClick={() => handleUpdateStatus(c.id, 'APPROVED')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors"
                    >
                      <CheckCircle size={13} />
                      <span>Approve</span>
                    </button>
                  )}
                  {c.status !== 'REJECTED' && (
                    <button
                      onClick={() => handleUpdateStatus(c.id, 'REJECTED')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors"
                    >
                      <XCircle size={13} />
                      <span>Reject</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
