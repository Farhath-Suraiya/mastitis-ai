import React, { useEffect, useState, useRef } from 'react';
import {
  Cpu,
  Play,
  Square,
  RefreshCw,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Droplets,
  Clock,
  Thermometer,
  Gauge,
  Wheat,
  Wind,
} from 'lucide-react';
import { Animal, SensorSimulateRequest, PredictionResponse } from '../types';
import { getAnimals, getAnimalDetail, simulateSensorData } from '../services/api';
import { useLanguage } from '../i18n/LanguageContext';

interface VitalsState {
  body_temperature_c: number;
  udder_surface_temperature_c: number;
  milk_conductivity_ms_cm: number;
  milk_temperature_c: number;
  milk_yield_l_day: number;
  scc_cells_ml: number;
  activity_percent: number;
  rumination_min_day: number;
  water_intake_l_day: number;
  feeding_behavior_score: number;
  ambient_temperature_c: number;
  relative_humidity_percent: number;
}

const DEFAULT_INITIAL_VITALS: VitalsState = {
  body_temperature_c: 38.4,
  udder_surface_temperature_c: 35.0,
  milk_conductivity_ms_cm: 4.9,
  milk_temperature_c: 34.8,
  milk_yield_l_day: 22.0,
  scc_cells_ml: 95000,
  activity_percent: 88.0,
  rumination_min_day: 490.0,
  water_intake_l_day: 78.0,
  feeding_behavior_score: 8.5,
  ambient_temperature_c: 24.0,
  relative_humidity_percent: 62.0,
};

export const SensorSimulator: React.FC = () => {
  const { t, translateRiskCategory } = useLanguage();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>('');
  const [currentAnimal, setCurrentAnimal] = useState<Animal | null>(null);
  const [loadingAnimals, setLoadingAnimals] = useState(true);

  // Simulation running state
  const [isSimulating, setIsSimulating] = useState(false);
  const [vitals, setVitals] = useState<VitalsState>(DEFAULT_INITIAL_VITALS);
  const [loadingForecast, setLoadingForecast] = useState(false);

  // Result from backend prediction pipeline after Stop Simulation
  const [forecastResult, setForecastResult] = useState<{
    animal_id: string;
    risk_score: number;
    risk_category: string;
    forecast: string;
    alertCreated: boolean;
  } | null>(null);

  const initialVitalsRef = useRef<VitalsState>(DEFAULT_INITIAL_VITALS);
  const vitalsRef = useRef<VitalsState>(DEFAULT_INITIAL_VITALS);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const tickCountRef = useRef<number>(0);

  // Load up to 500 animals on mount
  useEffect(() => {
    const fetchAnimalList = async () => {
      setLoadingAnimals(true);
      try {
        const res = await getAnimals({ limit: 500 });
        setAnimals(res.animals);
        if (res.animals.length > 0) {
          // Default to COW-486 if present, else first animal
          const target = res.animals.find((a) => a.animal_id === 'COW-486') || res.animals[0];
          setSelectedAnimalId(target.animal_id);
        }
      } catch (err) {
        console.error('Error fetching animals:', err);
      } finally {
        setLoadingAnimals(false);
      }
    };
    fetchAnimalList();
  }, []);

  // Filtered animals based on search query
  const filteredAnimals = animals.filter((a) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return a.animal_id.toLowerCase().includes(q) || (a.breed && a.breed.toLowerCase().includes(q));
  });

  // When selected cow changes, fetch profile & set initial vitals
  useEffect(() => {
    if (!selectedAnimalId) return;

    // Stop active simulation if cow changes
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsSimulating(false);
    setForecastResult(null);

    const loadAnimalData = async () => {
      try {
        const anim = await getAnimalDetail(selectedAnimalId);
        setCurrentAnimal(anim);

        // Reference / initial vitals from cow's profile or reference standard
        const initial: VitalsState = {
          body_temperature_c: anim.body_temperature_c ?? 38.4,
          udder_surface_temperature_c: anim.udder_surface_temperature_c ?? 35.0,
          milk_conductivity_ms_cm: anim.milk_conductivity_ms_cm ?? 4.9,
          milk_temperature_c: anim.milk_temperature_c ?? 34.8,
          milk_yield_l_day: anim.milk_yield_l_day ?? 22.0,
          scc_cells_ml: anim.scc_cells_ml ?? 95000,
          activity_percent: anim.activity_percent ?? 88.0,
          rumination_min_day: anim.rumination_min_day ?? 490.0,
          water_intake_l_day: anim.water_intake_l_day ?? 78.0,
          feeding_behavior_score: anim.feeding_behavior_score ?? 8.5,
          ambient_temperature_c: anim.ambient_temperature_c ?? 24.0,
          relative_humidity_percent: anim.relative_humidity_percent ?? 62.0,
        };

        initialVitalsRef.current = initial;
        vitalsRef.current = initial;
        setVitals(initial);
      } catch (err) {
        console.error('Error loading animal details:', err);
      }
    };

    loadAnimalData();
  }, [selectedAnimalId]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // START SIMULATION: Continuously fluctuate vitals around cow's own baseline
  const handleStartSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setForecastResult(null);
    tickCountRef.current = 0;

    intervalRef.current = setInterval(() => {
      tickCountRef.current += 1;
      const base = initialVitalsRef.current;

      const jitter = (range: number) => (Math.random() * 2 - 1) * range;

      const next: VitalsState = {
        body_temperature_c: parseFloat(
          Math.max(37.0, Math.min(41.5, base.body_temperature_c + jitter(0.12))).toFixed(2)
        ),
        udder_surface_temperature_c: parseFloat(
          Math.max(33.0, Math.min(39.5, base.udder_surface_temperature_c + jitter(0.12))).toFixed(2)
        ),
        milk_conductivity_ms_cm: parseFloat(
          Math.max(3.5, Math.min(9.5, base.milk_conductivity_ms_cm + jitter(0.08))).toFixed(2)
        ),
        milk_temperature_c: parseFloat(
          Math.max(33.0, Math.min(39.0, base.milk_temperature_c + jitter(0.1))).toFixed(2)
        ),
        milk_yield_l_day: parseFloat(
          Math.max(2.0, Math.min(45.0, base.milk_yield_l_day + jitter(0.2))).toFixed(1)
        ),
        scc_cells_ml: Math.max(
          40000,
          Math.min(1200000, Math.round(base.scc_cells_ml + jitter(Math.max(2000, base.scc_cells_ml * 0.025))))
        ),
        activity_percent: parseFloat(
          Math.max(20, Math.min(100, base.activity_percent + jitter(1.2))).toFixed(1)
        ),
        rumination_min_day: Math.max(
          120,
          Math.min(700, Math.round(base.rumination_min_day + jitter(5)))
        ),
        water_intake_l_day: parseFloat(
          Math.max(20, Math.min(150, base.water_intake_l_day + jitter(1.0))).toFixed(1)
        ),
        feeding_behavior_score: parseFloat(
          Math.max(1.0, Math.min(10.0, base.feeding_behavior_score + jitter(0.1))).toFixed(1)
        ),
        ambient_temperature_c: parseFloat((base.ambient_temperature_c + jitter(0.2)).toFixed(1)),
        relative_humidity_percent: parseFloat(
          Math.max(30, Math.min(95, base.relative_humidity_percent + jitter(0.5))).toFixed(1)
        ),
      };

      vitalsRef.current = next;
      setVitals(next);
    }, 600);
  };

  // STOP SIMULATION: Stop generation, take final values, send to ML backend
  const handleStopSimulation = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsSimulating(false);
    if (!currentAnimal) return;

    setLoadingForecast(true);
    try {
      const finalVitals = vitalsRef.current;
      const payload: SensorSimulateRequest = {
        animal_id: currentAnimal.animal_id,
        body_temperature_c: finalVitals.body_temperature_c,
        udder_surface_temperature_c: finalVitals.udder_surface_temperature_c,
        milk_conductivity_ms_cm: finalVitals.milk_conductivity_ms_cm,
        milk_temperature_c: finalVitals.milk_temperature_c,
        milk_yield_l_day: finalVitals.milk_yield_l_day,
        activity_percent: finalVitals.activity_percent,
        rumination_min_day: finalVitals.rumination_min_day,
        scc_cells_ml: finalVitals.scc_cells_ml,
        water_intake_l_day: finalVitals.water_intake_l_day,
        feeding_behavior_score: finalVitals.feeding_behavior_score,
        ambient_temperature_c: finalVitals.ambient_temperature_c,
        relative_humidity_percent: finalVitals.relative_humidity_percent,
      };

      const res = await simulateSensorData(payload);
      setForecastResult({
        animal_id: currentAnimal.animal_id,
        risk_score: res.ai_assessment.risk_score,
        risk_category: res.ai_assessment.risk_category,
        forecast: res.ai_assessment.forecast || 'Potential mastitis risk within 7–14 days',
        alertCreated: res.alert_created,
      });
    } catch (err) {
      console.error('Error running forecast on simulated vitals:', err);
    } finally {
      setLoadingForecast(false);
    }
  };

  const vitalParameters = [
    {
      id: 1,
      name: t('bodyTemp'),
      value: `${vitals.body_temperature_c.toFixed(1)} °C`,
      icon: Flame,
      color: vitals.body_temperature_c >= 39.5 ? 'text-rose-400' : 'text-blue-400',
    },
    {
      id: 2,
      name: t('udderTemp'),
      value: `${vitals.udder_surface_temperature_c.toFixed(1)} °C`,
      icon: Thermometer,
      color: vitals.udder_surface_temperature_c >= 37.0 ? 'text-rose-400' : 'text-indigo-400',
    },
    {
      id: 3,
      name: t('milkConductivity'),
      value: `${vitals.milk_conductivity_ms_cm.toFixed(2)} mS/cm`,
      icon: Activity,
      color: vitals.milk_conductivity_ms_cm >= 6.0 ? 'text-rose-400' : 'text-emerald-400',
    },
    {
      id: 4,
      name: t('milkTemp'),
      value: `${vitals.milk_temperature_c.toFixed(1)} °C`,
      icon: Thermometer,
      color: vitals.milk_temperature_c >= 36.5 ? 'text-rose-400' : 'text-cyan-400',
    },
    {
      id: 5,
      name: t('milkYield'),
      value: `${vitals.milk_yield_l_day.toFixed(1)} L/day`,
      icon: Droplets,
      color: vitals.milk_yield_l_day < 12.0 ? 'text-rose-400' : 'text-blue-400',
    },
    {
      id: 6,
      name: t('scc'),
      value: `${vitals.scc_cells_ml.toLocaleString()} cells/ml`,
      icon: Gauge,
      color: vitals.scc_cells_ml > 400000 ? 'text-rose-400' : 'text-teal-400',
    },
    {
      id: 7,
      name: t('activityLevel'),
      value: `${vitals.activity_percent.toFixed(1)} %`,
      icon: Activity,
      color: vitals.activity_percent < 55.0 ? 'text-rose-400' : 'text-green-400',
    },
    {
      id: 8,
      name: t('ruminationTime'),
      value: `${vitals.rumination_min_day} min/day`,
      icon: Clock,
      color: vitals.rumination_min_day < 300 ? 'text-rose-400' : 'text-violet-400',
    },
    {
      id: 9,
      name: t('waterIntake'),
      value: `${vitals.water_intake_l_day.toFixed(1)} L/day`,
      icon: Droplets,
      color: vitals.water_intake_l_day < 35 ? 'text-rose-400' : 'text-sky-400',
    },
    {
      id: 10,
      name: t('feedingScore'),
      value: `${vitals.feeding_behavior_score.toFixed(1)} / 10`,
      icon: Wheat,
      color: vitals.feeding_behavior_score < 5.0 ? 'text-rose-400' : 'text-lime-400',
    },
    {
      id: 11,
      name: t('ambientTemp'),
      value: `${vitals.ambient_temperature_c.toFixed(1)} °C`,
      icon: Thermometer,
      color: vitals.ambient_temperature_c > 32 ? 'text-rose-400' : 'text-orange-400',
    },
    {
      id: 12,
      name: t('humidity'),
      value: `${vitals.relative_humidity_percent.toFixed(1)} %`,
      icon: Wind,
      color: vitals.relative_humidity_percent > 80 ? 'text-rose-400' : 'text-slate-300',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Header with Search & Selector */}
      <div className="bg-gradient-to-r from-blue-900/40 via-slate-800/80 to-slate-800/80 border border-blue-500/30 rounded-2xl p-4 shadow-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base font-bold text-white">{t('simulatorTitle')}</h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {t('softwareSimulation')}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {t('simulatorSubtitle')}
            </p>
          </div>
        </div>

        {/* Search and Cow Selector */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
          {/* Cow Search Option */}
          <div className="flex flex-col gap-1.5 min-w-[170px]">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {t('searchCow')}
            </label>
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isSimulating}
              className="bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500 disabled:opacity-50 placeholder-slate-500"
            />
          </div>

          {/* Cow Dropdown Selector */}
          <div className="flex flex-col gap-1.5 min-w-[220px]">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {t('selectAnimal')} ({filteredAnimals.length})
            </label>
            <select
              value={selectedAnimalId}
              onChange={(e) => {
                if (!isSimulating) setSelectedAnimalId(e.target.value);
              }}
              disabled={loadingAnimals || isSimulating}
              className="bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500 disabled:opacity-50"
            >
              {filteredAnimals.map((a) => (
                <option key={a.animal_id} value={a.animal_id}>
                  {a.animal_id} — {a.breed}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. SIMULATION CONTROLS */}
      <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 p-5 shadow-lg flex flex-wrap items-center gap-4">
        {isSimulating ? (
          <button
            onClick={handleStopSimulation}
            disabled={loadingForecast}
            className="inline-flex items-center space-x-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-sm shadow-lg shadow-rose-500/25 transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Square className="w-4 h-4 fill-white" />
            <span>{t('stopSimulation')}</span>
          </button>
        ) : (
          <button
            onClick={handleStartSimulation}
            disabled={loadingAnimals || loadingForecast}
            className="inline-flex items-center space-x-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{t('startSimulation')}</span>
          </button>
        )}

        {isSimulating && (
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            <span>{t('simulationRunningNotice')}</span>
          </div>
        )}

        {loadingForecast && (
          <div className="flex items-center space-x-2 text-xs text-blue-400 font-semibold">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>{t('runningMlNotice')}</span>
          </div>
        )}

        <div className="ml-auto text-xs text-slate-400 font-mono">
          {t('selectedCow')}: <span className="text-white font-bold">{selectedAnimalId || 'None'}</span>
        </div>
      </div>

      {/* 3. SIMULATED COW VITALS (12 Parameters) */}
      <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-700/50 pb-3">
          <h2 className="text-sm font-bold text-slate-200 tracking-wider uppercase flex items-center space-x-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>{t('simulatedVitalsHeader')}</span>
          </h2>
          <span className="text-[11px] text-slate-400">
            {isSimulating ? t('telemetryStreamNotice') : t('currentTelemetryNotice')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {vitalParameters.map((param) => {
            const Icon = param.icon;
            return (
              <div
                key={param.id}
                className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 flex items-center justify-between shadow-sm transition hover:border-slate-600"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/50 shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-300 font-medium block">
                      {param.name}
                    </span>
                    <span className="text-[10px] text-slate-400 block">{t('parameterNum')} #{param.id}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-base font-bold font-mono tracking-tight ${param.color}`}>
                    {param.value}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. AI FORECAST RESULT (Appears after STOP) */}
      {forecastResult && (
        <div className="bg-slate-800/90 rounded-2xl border border-slate-700/60 p-6 shadow-xl space-y-5">
          <div className="border-b border-slate-700/50 pb-3">
            <h3 className="text-sm font-bold text-slate-300 tracking-wider uppercase">
              {t('aiForecastHeader')}
            </h3>
            <div className="text-xs text-slate-400 mt-1">
              {t('cowLabel')}: <span className="text-white font-mono font-bold text-sm">{forecastResult.animal_id}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Risk Level */}
            <div className="bg-slate-900/90 border border-slate-700/70 rounded-xl p-5 space-y-1.5">
              <span className="text-xs text-slate-400 font-medium block">{t('riskLevel')}</span>
              <div className="flex items-center space-x-2 pt-0.5">
                <span className="text-xl">
                  {forecastResult.risk_category === 'High Risk'
                    ? '🔴'
                    : forecastResult.risk_category === 'Moderate Risk'
                    ? '🟠'
                    : forecastResult.risk_category === 'Low Risk'
                    ? '🟡'
                    : '🟢'}
                </span>
                <span
                  className={`text-lg font-black tracking-wide uppercase ${
                    forecastResult.risk_category === 'High Risk'
                      ? 'text-rose-400'
                      : forecastResult.risk_category === 'Moderate Risk'
                      ? 'text-amber-400'
                      : forecastResult.risk_category === 'Low Risk'
                      ? 'text-yellow-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {translateRiskCategory(forecastResult.risk_category).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Risk Score */}
            <div className="bg-slate-900/90 border border-slate-700/70 rounded-xl p-5 space-y-1.5">
              <span className="text-xs text-slate-400 font-medium block">{t('riskScore')}</span>
              <div className="text-3xl font-black font-mono text-white pt-0.5">
                {forecastResult.risk_score}%
              </div>
            </div>

            {/* Forecast Window */}
            <div className="bg-slate-900/90 border border-slate-700/70 rounded-xl p-5 space-y-1.5">
              <span className="text-xs text-slate-400 font-medium block">{t('forecastWindowLabel')}</span>
              <div className="text-sm font-semibold text-slate-200 pt-1 leading-snug">
                {forecastResult.forecast || 'Potential mastitis risk within 7–14 days'}
              </div>
            </div>
          </div>

          {/* Alert Notification if High Risk */}
          {forecastResult.alertCreated && (
            <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-start sm:items-center space-x-3 text-xs text-rose-300">
              <span className="text-lg shrink-0">🔴</span>
              <div className="leading-relaxed">
                <strong>{t('highRiskAlertCreatedTitle')}:</strong> {t('cowLabel')}{' '}
                <strong className="text-white font-mono">{forecastResult.animal_id}</strong> {t('highRiskAlertCreatedDesc')}
              </div>
            </div>
          )}

          {/* Non-high-risk feedback */}
          {!forecastResult.alertCreated && (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50 flex items-start sm:items-center space-x-3 text-xs text-slate-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                {t('predictionSavedDesc')}{' '}
                <strong>{translateRiskCategory(forecastResult.risk_category)}</strong> {t('cowLabel')}{' '}
                <strong className="font-mono">{forecastResult.animal_id}</strong>.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <div className="text-[11px] text-slate-500 text-center leading-relaxed px-4">
        {t('simulatorDisclaimer')}
      </div>
    </div>
  );
};
