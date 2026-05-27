'use client';

import { useState, useCallback } from 'react';
import { Share2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShareButtonProps {
  params: Record<string, string | number | boolean>;
  label?: string;
  className?: string;
}

function encodeParams(params: Record<string, string | number | boolean>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    searchParams.set(key, String(value));
  }
  return searchParams.toString();
}

export function ShareButton({
  params,
  label = 'Share',
  className,
}: ShareButtonProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    const encoded = encodeParams(params);
    const url = `${window.location.origin}${window.location.pathname}?${encoded}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that block clipboard
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [params]);

  return (
    <button
      onClick={handleShare}
      className={cn(
        'inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg',
        'border border-border hover:border-primary hover:text-primary',
        'transition-colors duration-150',
        copied && 'border-emerald-500 text-emerald-400',
        className
      )}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5" />
          Copied!
        </>
      ) : (
        <>
          <Share2 className="w-3.5 h-3.5" />
          {label}
        </>
      )}
    </button>
  );
}

/**
 * Parse URL params back into a typed object
 */
export function decodeShareParams(search: string): Record<string, string> {
  const params = new URLSearchParams(search);
  const result: Record<string, string> = {};
  for (const [key, value] of params.entries()) {
    result[key] = value;
  }
  return result;
}
