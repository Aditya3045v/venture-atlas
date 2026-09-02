/**
 * Simple HTML sanitizer and markdown formatter for safe text rendering
 */

export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function formatSimpleMarkdown(text: string): string {
  if (!text) return '';
  
  // Escape unsafe HTML first
  let html = escapeHtml(text);

  // Headers: #### Header, ### Header, ## Header, # Header
  html = html.replace(/^#### (.*$)/gim, '<h4 class="text-base font-bold font-display text-text-primary mt-4 mb-1.5">$1</h4>');
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold font-display text-text-primary mt-5 mb-2">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold font-display text-text-primary mt-6 mb-2.5">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold font-display text-text-primary mt-7 mb-3">$1</h1>');

  // Bold **text**
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-text-primary">$1</strong>');

  // Italic *text* or _text_
  html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
  html = html.replace(/_(.*?)_/g, '<em class="italic">$1</em>');

  // Blockquotes: > Quote
  html = html.replace(/^>\s*(.*$)/gim, '<blockquote class="border-l-3 border-blue-500 pl-3.5 my-3 italic text-text-secondary text-sm">$1</blockquote>');

  // Bullet points
  html = html.replace(/^\s*-\s+(.*$)/gim, '<li class="ml-4 list-disc text-text-secondary my-1">$1</li>');
  html = html.replace(/^\s*\*\s+(.*$)/gim, '<li class="ml-4 list-disc text-text-secondary my-1">$1</li>');

  // Numbered lists: 1. Item
  html = html.replace(/^\s*(\d+)\.\s+(.*$)/gim, '<li class="ml-4 list-decimal text-text-secondary my-1"><strong class="text-text-primary">$1.</strong> $2</li>');

  // Paragraphs
  html = html
    .split(/\n\n+/)
    .map(p => {
      p = p.trim();
      if (!p) return '';
      if (p.startsWith('<h') || p.startsWith('<li') || p.startsWith('<blockquote')) return p;
      return `<p class="mb-3.5 leading-relaxed text-text-secondary">${p.replace(/\n/g, '<br/>')}</p>`;
    })
    .filter(Boolean)
    .join('');

  return html;
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/&/g, '-and-')      // Replace & with 'and'
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
}

export function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}
