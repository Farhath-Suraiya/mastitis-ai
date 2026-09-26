import React, { useState } from 'react';
import { Cpu, RefreshCw, Zap, Check, ShieldAlert, Bell, MessageSquare, Sliders, ArrowRight } from 'lucide-react';
import { Animal, SensorSimulateRequest, PredictionResponse } from '../types';
import { simulateSensorData } from '../services/api';
import { RiskBadge } from './RiskBadge';
import { useLanguage } from '../i18n/LanguageContext';

interface SensorSimulationModalProps {
  animal: Animal;
  onForecastUpdated?: (newAssessment: PredictionResponse, updatedAnimal: Animal) => void;
}

export const SensorSimulationModal: React.FC<SensorSimulationModalProps> = ({
  animal,
  onForecastUpdated,
}) => {
  const { t, translateRiskCategory } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [forecastResult, setForecastResult] = useState<{
    assessment: PredictionResponse;
    simulatedSms: any;
    alertCreated: boolean;
  } | null>(null);

  // Baseline values (previous readings)
  const baseline = {
    body_temperature_c: animal.body_temperature_c ?? 38.5,
    udder_surface_temperature_c: animal.udder_surface_temperature_c ?? 35.5,
    milk_temperature_c: animal.milk_temperature_c ?? 35.0,
    milk_conductivity_ms_cm: animal.milk_conductivity_ms_cm ?? 5.2,
    milk_yield_l_day: animal.milk_yield_l_day ?? 18.0,
    activity_percent: animal.activity_percent ?? 82.0,
    rumination_min_day: animal.rumination_min_day ?? 480.0,
    water_intake_l_day: animal.water_intake_l_day ?? 70.0,
    feeding_behavior_score: animal.feeding_behavior_score ?? 8.0,
    ambient_temperature_c: animal.ambient_temperature_c ?? 26.0,
    relative_humidity_percent: animal.relative_humidity_percent ?? 65.0,
    scc_cells_ml: animal.scc_cells_ml ?? 120000,
  };

  // Simulated IoT readings
  const [simulated, setSimulated] = useState<Record<string, number>>({ ...baseline });

  // Realistic variation generators based on existing animal baseline
  const handleGenerateVariation = (mode: 'healthy_variation' | 'mastitis_warning' | 'reset') => {
    setForecastResult(null);

    if (mode === 'reset') {
      setSimulated({ ...baseline });
      return;
    }

    if (mode === 'healthy_variation') {
      setSimulated({
        body_temperature_c: parseFloat((baseline.body_temperature_c + (Math.random() * 0.4 - 0.2)).toFixed(1)),
        udder_surface_temperature_c: parseFloat((baseline.udder_surface_temperature_c + (Math.random() * 0.4 - 0.2)).toFixed(1)),
        milk_temperature_c: parseFloat((baseline.milk_temperature_c + (Math.random() * 0.4 - 0.2)).toFixed(1)),
        milk_conductivity_ms_cm: parseFloat(Math.max(4.2, Math.min(5.4, baseline.milk_conductivity_ms_cm + (Math.random() * 0.2 - 0.1))).toFixed(2)),
        milk_yield_l_day: parseFloat(Math.max(15.0, (baseline.milk_yield_l_day + (Math.random() * 2.0 - 1.0))).toFixed(1)),
        activity_percent: parseFloat(Math.max(75.0, Math.min(95.0, baseline.activity_percent + (Math.random() * 6.0 - 3.0))).toFixed(1)),
        rumination_min_day: Math.round(Math.max(420, baseline.rumination_min_day + (Math.random() * 30 - 15))),
        water_intake_l_day: parseFloat((baseline.water_intake_l_day + (Math.random() * 4.0 - 2.0)).toFixed(1)),
        feeding_behavior_score: parseFloat(Math.max(7.0, Math.min(9.5, baseline.feeding_behavior_score + (Math.random() * 0.6 - 0.3))).toFixed(1)),
        ambient_temperature_c: parseFloat((baseline.ambient_temperature_c + (Math.random() * 2.0 - 1.0)).toFixed(1)),
        relative_humidity_percent: parseFloat(Math.max(45.0, Math.min(75.0, baseline.relative_humidity_percent + (Math.random() * 4.0 - 2.0))).toFixed(1)),
        scc_cells_ml: Math.round(Math.max(60000, Math.min(180000, baseline.scc_cells_ml + (Math.random() * 20000 - 10000)))),
      });
    } else if (mode === 'mastitis_warning') {
      const yieldDrop = Math.max(4.0, baseline.milk_yield_l_day * (0.35 + Math.random() * 0.15));
      setSimulated({
        body_temperature_c: parseFloat((39.2 + Math.random() * 0.6).toFixed(1)),
        udder_surface_temperature_c: parseFloat((37.0 + Math.random() * 0.8).toFixed(1)),
        milk_temperature_c: parseFloat((36.5 + Math.random() * 0.5).toFixed(1)),
        milk_conductivity_ms_cm: parseFloat((6.2 + Math.random() * 0.9).toFixed(2)),
        milk_yield_l_day: parseFloat(Math.max(3.5, baseline.milk_yield_l_day - yieldDrop).toFixed(1)),
        activity_percent: parseFloat(Math.max(45.0, baseline.activity_percent - (15.0 + Math.random() * 10.0)).toFixed(1)),
        rumination_min_day: Math.round(Math.max(220, baseline.rumination_min_day - (100 + Math.random() * 60))),
        water_intake_l_day: parseFloat(Math.max(40.0, baseline.water_intake_l_day - 12.0).toFixed(1)),
        feeding_behavior_score: parseFloat(Math.max(3.5, baseline.feeding_behavior_score - 2.5).toFixed(1)),
        ambient_temperature_c: parseFloat(baseline.ambient_temperature_c.toFixed(1)),
        relative_humidity_percent: parseFloat(baseline.relative_humidity_percent.toFixed(1)),
        scc_cells_ml: Math.round(480000 + Math.random() * 350000),
      });
    }
  };

  const handleUpdateParameter = (param: string, value: number) => {
    setSimulated((prev) => ({
      ...prev,
      [param]: value,
    }));
  };

  const handleRunForecast = async () => {
    setLoading(true);
    try {
      const payload: SensorSimulateRequest = {
        animal_id: animal.animal_id,
        body_temperature_c: simulated.body_temperature_c,
        udder_surface_temperature_c: simulated.udder_surface_temperature_c,
        milk_conductivity_ms_cm: simulated.milk_conductivity_ms_cm,
        milk_temperature_c: simulated.milk_temperature_c,
        milk_yield_l_day: simulated.milk_yield_l_day,
        activity_percent: simulated.activity_percent,
        rumination_min_day: simulated.rumination_min_day,
        scc_cells_ml: simulated.scc_cells_ml,
        water_intake_l_day: simulated.water_intake_l_day,
        feeding_behavior_score: simulated.feeding_behavior_score,
        ambient_temperature_c: simulated.ambient_temperature_c,
        relative_humidity_percent: simulated.relative_humidity_percent,
      };

      const response = await simulateSensorData(payload);

      setForecastResult({
        assessment: response.ai_assessment,
        simulatedSms: response.simulated_sms,
        alertCreated: response.alert_created,
      });

      if (onForecastUpdated) {
        const updatedAnim: Animal = {
          ...animal,
          ...payload,
          risk_score: response.ai_assessment.risk_score,
          risk_category: response.ai_assessment.risk_category,
          ai_assessment: response.ai_assessment,
        };
        onForecastUpdated(response.ai_assessment, updatedAnim);
      }
    } catch (err: any) {
      console.error('Error running forecast simulation:', err);
    } finally {
      setLoading(false);
    }
  };

  const parametersList = [
    { key: 'body_temperature_c', label: t('bodyTemp'), unit: '°C', step: 0.1 },
    { key: 'udder_surface_temperature_c', label: t('udderTemp'), unit: '°C', step: 0.1 },
    { key: 'milk_temperature_c', label: t('milkTemp'), unit: '°C', step: 0.1 },
    { key: 'milk_conductivity_ms_cm', label: t('milkConductivity'), unit: 'mS/cm', step: 0.05 },
    { key: 'milk_yield_l_day', label: t('milkYield'), unit: 'L/day', step: 0.5 },
    { key: 'scc_cells_ml', label: t('scc'), unit: 'cells/ml', step: 10000 },
    { key: 'activity_percent', label: t('activityLevel'), unit: '%', step: 1.0 },
    { key: 'rumination_min_day', label: t('ruminationTime'), unit: 'min/day', step: 10 },
    { key: 'water_intake_l_day', label: t('waterIntake'), unit: 'L/day', step: 1.0 },
    { key: 'feeding_behavior_score', label: t('feedingScore'), unit: '/10', step: 0.5 },
    { key: 'ambient_temperature_c', label: t('ambientTemp'), unit: '°C', step: 0.5 },
    { key: 'relative_humidity_percent', label: t('humidity'), unit: '%', step: 1.0 },
  ];

  return (
    <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 p-5 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-700/50 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{t('simulatorTitle')}</h3>
            <span className="text-xs text-blue-300 font-bold">{t('softwareSimulation')}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleGenerateVariation('healthy_variation')}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition font-medium"
          >
            {t('healthyScenario')}
          </button>
          <button
            onClick={() => handleGenerateVariation('mastitis_warning')}
            className="text-xs px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition font-bold"
          >
            {t('highRiskScenario')}
          </button>
          <button
            onClick={() => handleGenerateVariation('reset')}
            className="text-xs px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition"
          >
            {t('resetBaseline')}
          </button>
        </div>
      </div>

      {/* Notice */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-700/40 p-2.5 text-xs text-slate-300 flex items-center justify-between">
        <span className="text-slate-400">
          Comparing <strong>Previous Reading</strong> vs <strong>New Simulated Reading</strong> (11 channels + SCC)
        </span>
        <span className="text-[10px] text-amber-300 font-semibold uppercase">No Physical Hardware</span>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
        {parametersList.map((param) => {
          const prevVal = baseline[param.key as keyof typeof baseline];
          const newVal = simulated[param.key] ?? prevVal;
          const diff = newVal - prevVal;
          const hasChanged = Math.abs(diff) > 0.001;

          return (
            <div
              key={param.key}
              className={`p-2.5 rounded-xl border transition ${
                hasChanged
                  ? 'bg-slate-900/90 border-blue-500/40 shadow-sm'
                  : 'bg-slate-900/40 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-slate-200">{param.label}</span>
                {hasChanged && (
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {diff > 0 ? `+${param.key === 'scc_cells_ml' ? Math.round(diff).toLocaleString() : diff.toFixed(1)}` : `${param.key === 'scc_cells_ml' ? Math.round(diff).toLocaleString() : diff.toFixed(1)}`}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Previous:</span>
                  <span className="font-mono text-slate-400">
                    {param.key === 'scc_cells_ml' ? prevVal.toLocaleString() : prevVal} {param.unit}
                  </span>
                </div>

                <div className="bg-slate-950/80 p-1.5 rounded border border-slate-700/60">
                  <span className="text-[10px] text-blue-400 block">Simulated:</span>
                  <input
                    type="number"
                    step={param.step}
                    value={newVal}
                    onChange={(e) => handleUpdateParameter(param.key, Number(e.target.value))}
                    className="w-full bg-transparent text-white font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Button: Run AI Forecast */}
      <div className="flex flex-col sm:flex-row items-center justify-between pt-2 gap-3">
        <div className="text-xs text-slate-400">
          Target: <span className="font-mono text-white font-semibold">{animal.animal_id}</span> ({animal.breed})
        </div>

        <button
          onClick={handleRunForecast}
          disabled={loading}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition disabled:opacity-50"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Zap className="w-4 h-4" />
          )}
          <span>Run AI Forecast on Simulated Data</span>
        </button>
      </div>

      {/* Result Panel */}
      {forecastResult && (
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/70 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-white flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulated AI Forecast Output (7–14 Days)</span>
            </span>
            <RiskBadge category={forecastResult.assessment.risk_category} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Updated Risk Score</span>
              <span className="text-xl font-black text-rose-400">{forecastResult.assessment.risk_score}%</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Risk Category</span>
              <span className="text-sm font-bold text-white">{forecastResult.assessment.risk_category}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-slate-400 text-[10px] block">Forecast Window</span>
              <span className="text-xs font-bold text-emerald-400 font-mono">7–14 days</span>
            </div>
          </div>

          {/* High risk alert & simulated SMS notification */}
          {forecastResult.assessment.risk_score > 60 && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs space-y-2">
              <div className="flex items-center space-x-2 text-rose-300 font-bold">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>HIGH RISK: System Alert & Simulated SMS Generated</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                <div className="flex items-center space-x-1.5 bg-slate-950/60 p-2 rounded border border-slate-800">
                  <Bell className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Alert added to active herd notifications</span>
                </div>
                <div className="flex items-center space-x-1.5 bg-slate-950/60 p-2 rounded border border-slate-800">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Simulated SMS dispatched (SENT_SIMULATED)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
