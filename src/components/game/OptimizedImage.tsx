interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  maxWidth?: number;
  maxHeight?: number;
}

export function OptimizedImage({ 
  src, 
  alt, 
  className = '',
  maxWidth = 180,
  maxHeight = 220
}: OptimizedImageProps) {
  return (
    <img 
      src={src} 
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      style={{
        maxWidth: `${maxWidth}px`,
        maxHeight: `${maxHeight}px`,
        objectFit: 'contain',
        width: 'auto',
        height: 'auto',
      }}
    />
  );
}
