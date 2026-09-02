'use client';

import { useEffect } from 'react';

interface ViewTrackerProps {
  entityId: string;
  entityType?: 'ARTICLE' | 'BLOG' | 'CASE_STUDY';
  path: string;
}

export function ViewTracker({ entityId, entityType = 'ARTICLE', path }: ViewTrackerProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Send page view beacon
    fetch('/api/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        articleId: entityId,
        entityType,
        path: path || window.location.pathname,
        referrer: document.referrer || 'direct',
      }),
    }).catch(() => {});
  }, [entityId, entityType, path]);

  return null;
}
