import React from 'react';

interface RiskBadgeProps {
  category: 'No Risk' | 'Low Risk' | 'Moderate Risk' | 'High Risk' | string;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ category, size = 'md' }) => {
  const normCat = category ? category.toUpperCase() : 'NO RISK';

  let bgClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  let dotClass = 'bg-emerald-400';

  if (normCat.includes('HIGH')) {
    bgClasses = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    dotClass = 'bg-rose-400 animate-pulse';
  } else if (normCat.includes('MODERATE')) {
    bgClasses = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    dotClass = 'bg-amber-400';
  } else if (normCat.includes('LOW')) {
    bgClasses = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    dotClass = 'bg-blue-400';
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 space-x-1',
    md: 'text-xs px-2.5 py-1 space-x-1.5',
    lg: 'text-sm px-3.5 py-1.5 space-x-2 font-semibold',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${bgClasses} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`}></span>
      <span>{category}</span>
    </span>
  );
};
