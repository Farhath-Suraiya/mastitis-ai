import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export const DisclaimerBanner: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-6 flex items-start space-x-3 text-xs text-amber-200 shadow-sm">
      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
      <div className="space-y-1">
        <span className="font-semibold text-amber-300 block text-sm">
          {t('syntheticDataNotice')}
        </span>
        <p className="leading-relaxed opacity-90">
          {t('simulatedPlatformDesc')}
        </p>
      </div>
    </div>
  );
};
