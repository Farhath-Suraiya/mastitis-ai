import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-6 flex items-start space-x-3 text-xs text-amber-200 shadow-sm">
      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
      <div className="space-y-1">
        <span className="font-semibold text-amber-300 block text-sm">
          Decision-Support & Early Warning Software Prototype
        </span>
        <p className="leading-relaxed opacity-90">
          This system is an <strong>early-warning AI forecasting prototype</strong> trained on synthetic dairy herd data (`bovine_mastitis_synthetic_10000.csv`). It provides predictive risk scores for the <strong>7–14 day forecast window</strong> to assist farm management. It does <strong>NOT</strong> constitute a clinical veterinary diagnosis or prescribe automatic antibiotic treatments.
        </p>
      </div>
    </div>
  );
};
