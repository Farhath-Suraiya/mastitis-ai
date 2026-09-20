import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, Info, Clock, Calendar } from 'lucide-react';

interface RiskGaugeProps {
  score: number;
  category: string;
  forecastWindow?: string;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  score,
  category,
  forecastWindow = '7–14 days',
}) => {
  const normCat = category ? category.toUpperCase() : 'NO RISK';

  let colorStroke = '#10B981'; // Green
  let Icon = CheckCircle;
  let textGrad = 'from-emerald-400 to-teal-200';
  let bannerBg = 'bg-emerald-950/40 border-emerald-500/20 text-emerald-300';
  let timelineColor = 'bg-emerald-500';
  let timelineDot = 'border-emerald-400';
  let labelColor = 'text-emerald-400';

  if (normCat.includes('HIGH')) {
    colorStroke = '#EF4444';
    Icon = ShieldAlert;
    textGrad = 'from-rose-400 to-red-200';
    bannerBg = 'bg-rose-950/40 border-rose-500/30 text-rose-300';
    timelineColor = 'bg-rose-500';
    timelineDot = 'border-rose-400';
    labelColor = 'text-rose-400';
  } else if (normCat.includes('MODERATE')) {
    colorStroke = '#F59E0B';
    Icon = AlertTriangle;
    textGrad = 'from-amber-400 to-yellow-200';
    bannerBg = 'bg-amber-950/40 border-amber-500/30 text-amber-300';
    timelineColor = 'bg-amber-500';
    timelineDot = 'border-amber-400';
    labelColor = 'text-amber-400';
  } else if (normCat.includes('LOW')) {
    colorStroke = '#3B82F6';
    Icon = Info;
    textGrad = 'from-blue-400 to-indigo-200';
    bannerBg = 'bg-blue-950/40 border-blue-500/30 text-blue-300';
    timelineColor = 'bg-blue-500';
    timelineDot = 'border-blue-400';
    labelColor = 'text-blue-400';
  }

  // Radial SVG math
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-800/80 rounded-2xl border border-slate-700/60 shadow-xl relative overflow-hidden">
      {/* Prediction Status Label */}
      <div className="flex items-center space-x-1.5 mb-3">
        <Clock className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
          AI Early-Warning Forecast
        </span>
      </div>

      {/* Radial Gauge */}
      <div className="relative w-40 h-40 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            className="stroke-slate-700/60"
            strokeWidth="10"
            fill="transparent"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke={colorStroke}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className={`text-3xl font-extrabold bg-gradient-to-r ${textGrad} bg-clip-text text-transparent`}>
            {Math.round(score)}
          </span>
          <span className="text-[11px] text-slate-500 font-bold">/&nbsp;100</span>
          <span className={`text-[10px] font-bold tracking-widest uppercase mt-1 ${labelColor}`}>
            {category}
          </span>
        </div>
      </div>

      {/* Forecast Window Banner */}
      <div className={`mt-4 w-full p-3 rounded-xl border text-xs flex items-start space-x-2.5 ${bannerBg}`}>
        <Icon className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold block">Forecast Window:</span>
          <span className="opacity-90">Potential mastitis risk within {forecastWindow}</span>
        </div>
      </div>

      {/* Visual Forecast Timeline */}
      <div className="mt-4 w-full px-2">
        <div className="relative flex items-center justify-between">
          {/* Connecting line */}
          <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-0.5 bg-slate-700 z-0" />
          <div
            className={`absolute left-4 top-1/2 -translate-y-1/2 h-0.5 z-[1] transition-all duration-1000 ${timelineColor}`}
            style={{ width: `${Math.min(score, 95)}%` }}
          />

          {/* Today */}
          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-3.5 h-3.5 rounded-full bg-slate-800 border-2 ${timelineDot} shadow-md`} />
            <span className="text-[10px] text-slate-300 font-bold mt-1.5">Today</span>
            <span className="text-[9px] text-slate-500">Observation</span>
          </div>

          {/* 7 days */}
          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full bg-slate-800 border-2 ${
              score > 40 ? timelineDot : 'border-slate-600'
            } shadow-md`} />
            <span className="text-[10px] text-slate-400 font-semibold mt-1.5">7 days</span>
          </div>

          {/* 14 days */}
          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full bg-slate-800 border-2 ${
              score > 60 ? timelineDot : 'border-slate-600'
            } shadow-md`} />
            <span className="text-[10px] text-slate-400 font-semibold mt-1.5">14 days</span>
          </div>
        </div>

        {/* Timeline Legend */}
        <div className="mt-2 text-center">
          <span className="text-[10px] text-slate-500 italic">
            {normCat.includes('HIGH')
              ? 'Elevated risk — potential mastitis event within this window'
              : normCat.includes('MODERATE')
              ? 'Moderate indicators — monitor closely during forecast period'
              : normCat.includes('LOW')
              ? 'Low-level indicators — routine monitoring advised'
              : 'No significant risk indicators detected for this period'}
          </span>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-3 w-full text-center">
        <p className="text-[10px] text-slate-500 leading-relaxed italic">
          Prototype forecast based on synthetic data. Not a clinical diagnosis.
        </p>
      </div>
    </div>
  );
};
