'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';

interface MarqueeTextProps {
  text: string;
  className?: string;
  isParentHovered?: boolean;
  prefixIcon?: React.ReactNode;
}

export default function MarqueeText({
  text,
  className = '',
  isParentHovered = false,
  prefixIcon,
}: MarqueeTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLSpanElement>(null);
  const [overflowDistance, setOverflowDistance] = useState(0);
  const [isSelfHovered, setIsSelfHovered] = useState(false);

  const measure = useCallback(() => {
    if (containerRef.current && contentRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const contentWidth = contentRef.current.scrollWidth;
      const diff = contentWidth - containerWidth;
      setOverflowDistance(diff > 3 ? diff : 0);
    }
  }, []);

  useEffect(() => {
    measure();
    const handleResize = () => measure();
    window.addEventListener('resize', handleResize);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      observer = new ResizeObserver(() => measure());
      observer.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      observer?.disconnect();
    };
  }, [text, measure]);

  const isActive = (isParentHovered || isSelfHovered) && overflowDistance > 0;

  // Calm, steady reading duration: minimum 4.5s, scalable for longer text
  const duration = Math.max(4.5, Math.min(8.5, 3.5 + overflowDistance * 0.05));

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => {
        measure();
        setIsSelfHovered(true);
      }}
      onMouseLeave={() => setIsSelfHovered(false)}
      onTouchStart={() => {
        measure();
        setIsSelfHovered(true);
      }}
      onTouchEnd={() => {
        setTimeout(() => setIsSelfHovered(false), Math.round(duration * 1000));
      }}
      className={`overflow-hidden whitespace-nowrap relative max-w-full flex items-center ${className}`}
      title={text}
    >
      {prefixIcon && <span className="shrink-0 mr-1">{prefixIcon}</span>}
      <div className="overflow-hidden w-full relative">
        <span
          ref={contentRef}
          className="inline-block whitespace-nowrap will-change-transform select-none"
          style={
            {
              '--marquee-dist': `${overflowDistance + 4}px`,
              animation: isActive
                ? `marquee-glide ${duration}s ease-in-out infinite`
                : 'none',
              transform: isActive ? undefined : 'translateX(0px)',
              transition: !isActive ? 'transform 0.4s ease-out' : undefined,
            } as React.CSSProperties
          }
        >
          {text}
        </span>
      </div>
    </div>
  );
}
