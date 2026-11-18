import React, { useEffect, useRef, useState } from 'react';
import { formatBdtFromPoisha } from '../engine/money';
import { Language } from '../i18n/translations';

interface AnimatedAmountProps {
  poisha: number;
  locale: Language;
  showDecimals?: boolean;
  includeSymbol?: boolean;
  className?: string;
}

export const AnimatedAmount: React.FC<AnimatedAmountProps> = ({
  poisha,
  locale,
  showDecimals = true,
  includeSymbol = true,
  className = '',
}) => {
  const [displayPoisha, setDisplayPoisha] = useState(poisha);
  const prevRef = useRef(poisha);

  useEffect(() => {
    const startVal = prevRef.current;
    const endVal = poisha;
    prevRef.current = endVal;

    if (startVal === endVal) {
      setDisplayPoisha(endVal);
      return;
    }

    // Respect reduced motion or tiny immediate jumps
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setDisplayPoisha(endVal);
      return;
    }

    const duration = 180;
    const startTime = performance.now();
    let rafId = 0;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayPoisha(Math.round(startVal + (endVal - startVal) * eased));
      if (t < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [poisha]);

  return (
    <span className={`tabular-nums-fintech ${className}`}>
      {formatBdtFromPoisha(displayPoisha, { locale, showDecimals, includeSymbol })}
    </span>
  );
};
