'use client';

import React, { useEffect, useState } from 'react';

export const ReadingProgressBar: React.FC = () => {
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    const updateScrollCompletion = () => {
      const currentProgress = window.scrollY;
      const scrollHeight = document.body.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        setCompletion(
          Number((currentProgress / scrollHeight).toFixed(2)) * 100
        );
      }
    };

    window.addEventListener('scroll', updateScrollCompletion, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollCompletion);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent pointer-events-none"
      role="progressbar"
      aria-valuenow={Math.round(completion)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-amber-400 transition-all duration-150 ease-out shadow-sm"
        style={{ width: `${completion}%` }}
      />
    </div>
  );
};
