import React from 'react';

interface IconProps {
  className?: string;
}

export const CashOutIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect x="2.5" y="5" width="19" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="12" cy="11" r="2.75" stroke="currentColor" strokeWidth="1.8" />
    <path d="M12 17V21.5M9.2 19L12 21.5L14.8 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const SendMoneyIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M20.5 4.5L10.5 14.5M20.5 4.5L14 20.5L10.5 14.5M20.5 4.5L3.5 10.5L10.5 14.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const AtmIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect x="3" y="3.5" width="18" height="17" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
    <path d="M6.5 8H17.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <rect x="7" y="11" width="10" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="12" cy="14.25" r="1.4" fill="currentColor" />
  </svg>
);

export const BankTransferIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M3 9.5L12 4L21 9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 10V17.5M9.5 10V17.5M14.5 10V17.5M19 10V17.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M3 20H21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const NpsbIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M4 8H19.5M16 4.5L19.5 8L16 11.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20 16H4.5M8 12.5L4.5 16L8 19.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CalculatorIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect x="4" y="2.5" width="16" height="19" rx="3" stroke="currentColor" strokeWidth="1.8" />
    <rect x="7.5" y="6" width="9" height="3.5" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="8.5" cy="13.5" r="1" fill="currentColor" />
    <circle cx="12" cy="13.5" r="1" fill="currentColor" />
    <circle cx="15.5" cy="13.5" r="1" fill="currentColor" />
    <circle cx="8.5" cy="17.2" r="1" fill="currentColor" />
    <circle cx="12" cy="17.2" r="1" fill="currentColor" />
    <rect x="14.5" y="16.2" width="2" height="2" rx="0.5" fill="currentColor" />
  </svg>
);

export const WalletIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M4 7.5C4 6.12 5.12 5 6.5 5H18C19.1 5 20 5.9 20 7V17.5C20 18.6 19.1 19.5 18 19.5H6.5C5.12 19.5 4 18.38 4 17V7.5Z"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path d="M15 12.25H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="15.5" cy="12.25" r="1.2" fill="currentColor" />
  </svg>
);

export const TransactionFeeIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
    <path d="M9 15L15 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="9.25" cy="9.25" r="1.25" fill="currentColor" />
    <circle cx="14.75" cy="14.75" r="1.25" fill="currentColor" />
  </svg>
);

export const SettingsIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M4 7H9M13 7H20M4 17H11M15 17H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="11" cy="7" r="2.2" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="13" cy="17" r="2.2" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);
