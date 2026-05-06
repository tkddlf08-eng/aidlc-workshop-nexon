import { useState } from 'react';

interface ImageProps {
  src: string | null;
  alt: string;
  className?: string;
  fallback?: string;
}

const DEFAULT_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2UyZThmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTRhM2I4IiBmb250LXNpemU9IjE0Ij7snbTrr7jsp4Ag7JeG7J2MPC90ZXh0Pjwvc3ZnPg==';

export function Image({ src, alt, className = '', fallback }: ImageProps) {
  const [hasError, setHasError] = useState(false);
  const imgSrc = hasError || !src ? (fallback || DEFAULT_PLACEHOLDER) : src;

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={`object-cover ${className}`}
      loading="lazy"
      onError={() => setHasError(true)}
      data-testid="image"
    />
  );
}
