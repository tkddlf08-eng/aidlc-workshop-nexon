import { useState } from 'react';

interface ImageProps {
  src: string | null;
  alt: string;
  className?: string;
  fallback?: string;
}

const DEFAULT_PLACEHOLDER = '/images/placeholder-menu.svg';

export function Image({ src, alt, className = '', fallback }: ImageProps) {
  const [hasError, setHasError] = useState(false);
  const imgSrc = hasError || !src ? (fallback || DEFAULT_PLACEHOLDER) : src;

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={`object-cover ${className}`}
      loading="lazy"
      onError={() => {
        if (!hasError) setHasError(true);
      }}
      data-testid="image"
    />
  );
}
