'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';

interface MarqueeTextProps {
  text: string;
  hoverText?: string;
  className?: string;
  isParentHovered?: boolean;
  prefixIcon?: React.ReactNode;
}

export default function MarqueeText({
  text,
  hoverText,
  className = '',
  isParentHovered = false,
  prefixIcon,
}: MarqueeTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLSpanElement>(null);
  const hoverMeasureRef = useRef<HTMLSpanElement>(null);
  const [overflowDistance, setOverflowDistance] = useState(0);
  const [isSelfHovered, setIsSelfHovered] = useState(false);

  const measure = useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const targetElement = hoverMeasureRef.current || contentRef.current;
      if (targetElement) {
        const contentWidth = targetElement.scrollWidth;
        const diff = contentWidth - containerWidth;
        setOverflowDistance(diff > 3 ? diff : 0);
      }
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
  }, [text, hoverText, measure]);

  const isHovered = isParentHovered || isSelfHovered;
  const isActive = isHovered && overflowDistance > 0;
  const currentText = isHovered && hoverText ? hoverText : text;

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
      title={hoverText || text}
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
          {currentText}
        </span>
        {hoverText && hoverText !== text && (
          <span
            ref={hoverMeasureRef}
            aria-hidden="true"
            className="invisible absolute top-0 left-0 whitespace-nowrap pointer-events-none select-none"
          >
            {hoverText}
          </span>
        )}
      </div>
    </div>
  );
}
