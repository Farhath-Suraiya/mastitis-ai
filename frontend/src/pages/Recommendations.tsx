import React, { useState } from 'react';
import { Info, Filter } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export const Recommendations: React.FC = () => {
  const { t } = useLanguage();
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const recommendationCatalog = [
    {
      id: 'rec_scc',
      category: 'Milk Quality',
      title: 'Somatic Cell Count (SCC) Monitoring & Testing',
      action: 'Perform individual quarter Somatic Cell Count (SCC) or California Mastitis Test (CMT) check. Isolate milk output if SCC exceeds 400,000 cells/ml.',
      priority: 'HIGH',
      trigger: 'SCC > 250,000 cells/ml'
    },
    {
      id: 'rec_cond',
      category: 'Udder Health',
      title: 'Milk Electrical Conductivity Inspection',
      action: 'Inspect udder quarters for physical swelling, localized heat, or early milk texture variations (flakes/clots).',
      priority: 'HIGH',
      trigger: 'Conductivity > 5.5 mS/cm'
    },
    {
      id: 'rec_yield',
      category: 'Production',
      title: 'Milk Yield Production Trend Review',
      action: 'Review recent 7-day milk yield trends and check for sudden production drop or appetite loss.',
      priority: 'MEDIUM',
      trigger: 'Milk Yield < 15 L/day'
    },
    {
      id: 'rec_rumination',
      category: 'Behavior & Digestion',
      title: 'Rumination & Feeding Assessment',
      action: 'Review feeding behavior, forage quality, and monitor for early systemic discomfort or metabolic stress.',
      priority: 'MEDIUM',
      trigger: 'Rumination < 400 min/day'
    },
    {
      id: 'rec_hygiene',
      category: 'Sanitation',
      title: 'Milking & Environment Hygiene Protocols',
      action: 'Sanitize milking unit teats before and after milking, replace worn teat cups, and clean stall bedding to minimize bacterial load.',
      priority: 'MEDIUM',
      trigger: 'Hygiene Score < 6.5'
    },
    {
      id: 'rec_history',
      category: 'Surveillance',
      title: 'High-Surveillance Protocol for Previous Mastitis Cases',
      action: 'Increase observation frequency for this animal as prior mastitis cases significantly increase recurrence risk.',
      priority: 'MEDIUM',
      trigger: 'Previous Mastitis = Yes'
    },
    {
      id: 'rec_temp',
      category: 'Systemic Health',
      title: 'Thermal & Core Temperature Monitoring',
      action: 'Isolate cow in a shaded, well-ventilated area, provide clean fresh water, and track temperature twice daily.',
      priority: 'HIGH',
      trigger: 'Body Temp > 39.0 °C'
    },
    {
      id: 'rec_vet',
      category: 'Veterinary Review',
      title: 'Prioritize Professional Veterinary Assessment',
      action: 'Prioritize a physical veterinary udder examination and milk microbiology/sensitivity test before taking therapeutic action.',
      priority: 'CRITICAL',
      trigger: 'Risk Score > 60% or Multiple Triggers'
    }
  ];

  const filteredCatalog = recommendationCatalog.filter((item) => {
    if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">{t('recommendationsGuideTitle')}</h1>
        <p className="text-xs text-slate-400 mt-1">
          {t('recommendationsGuideSubtitle')}
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 p-4 shadow-lg flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-slate-300 font-medium">{t('categoryFilterLabel')}</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none"
          >
            <option value="ALL">{t('allCategoriesOption')}</option>
            <option value="Milk Quality">{t('milkQualityCat')}</option>
            <option value="Udder Health">{t('udderHealthCat')}</option>
            <option value="Production">{t('thYield')}</option>
            <option value="Behavior & Digestion">{t('thRumination')}</option>
            <option value="Sanitation">{t('sanitationCat')}</option>
            <option value="Surveillance">{t('observation')}</option>
            <option value="Systemic Health">{t('bodyTemp')}</option>
            <option value="Veterinary Review">{t('aiRecommendationsSection')}</option>
          </select>
        </div>
      </div>

      {/* Recommendations Catalog */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCatalog.map((rec) => (
          <div
            key={rec.id}
            className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-lg space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{rec.category}</span>
              <span
                className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded uppercase ${
                  rec.priority === 'CRITICAL'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : rec.priority === 'HIGH'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {rec.priority === 'HIGH' ? t('priorityHigh') : rec.priority === 'MEDIUM' ? t('priorityMedium') : rec.priority}
              </span>
            </div>

            <h3 className="text-sm font-bold text-white">{rec.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{rec.action}</p>

            <div className="pt-2 border-t border-slate-700/40 text-[11px] text-slate-400 flex items-center space-x-1">
              <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{t('triggerThresholdLabel')} <strong className="text-slate-200">{rec.trigger}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
