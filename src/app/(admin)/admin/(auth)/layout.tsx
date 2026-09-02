import React from 'react';

export default function AdminAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      {children}
    </div>
  );
}
