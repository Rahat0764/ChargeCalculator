import React from 'react';

export type BrandId = 'bkash' | 'nagad' | 'nagad-islamic' | 'rocket' | 'bank' | 'npsb';

const BRAND_MAP: Record<BrandId, { src: string; alt: string }> = {
  bkash: { src: '/brands/bkash.svg', alt: 'bKash' },
  nagad: { src: '/brands/nagad.svg', alt: 'Nagad' },
  'nagad-islamic': { src: '/brands/nagad-islamic.svg', alt: 'Nagad Islamic' },
  rocket: { src: '/brands/rocket.svg', alt: 'Rocket' },
  bank: { src: '/brands/bank.svg', alt: 'Bank' },
  npsb: { src: '/brands/npsb.svg', alt: 'NPSB' },
};

interface BrandBadgeProps {
  brand: BrandId;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const BrandBadge: React.FC<BrandBadgeProps> = ({ brand, size = 'md', className = '' }) => {
  const meta = BRAND_MAP[brand];
  const heightClass = size === 'sm' ? 'h-6' : size === 'lg' ? 'h-9' : 'h-7';

  return (
    <img
      src={meta.src}
      alt={meta.alt}
      loading="eager"
      decoding="async"
      className={`${heightClass} w-auto select-none rounded-md shadow-xs ${className}`}
    />
  );
};
