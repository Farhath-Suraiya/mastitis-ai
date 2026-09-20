import React, { useEffect, useState } from 'react';
import {
  Cpu,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Clock,
  ArrowRight,
  MessageSquare,
  Bell,
  Activity,
  Droplet,
  Info,
  Thermometer,
  Sliders,
  Database,
  Search,
} from 'lucide-react';
import { Animal, SensorSimulateRequest, PredictionResponse, SMSNotification } from '../types';
import { getAnimals, getAnimalDetail, simulateSensorData } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';

export const SensorSimulator: React.FC = () => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>('');
  const [currentAnimal, setCurrentAnimal] = useState<Animal | null>(null);
  const [loadingAnimals, setLoadingAnimals] = useState(true);
  const [runningForecast, setRunningForecast] = useState(false);

  // Baseline values (previous readings)
  const [baseline, setBaseline] = useState<Record<string, number>>({});

  // Simulated IoT readings (new values)
  const [simulated, setSimulated] = useState<Record<string, number>>({});

  // Prediction result after running forecast
  const [forecastResult, setForecastResult] = useState<{
    assessment: PredictionResponse;
    simulatedSms: any;
    alertCreated: boolean;
    notice: string;
  } | null>(null);

  // Load animal list on mount
  useEffect(() => {
    const fetchAnimalList = async () => {
      setLoadingAnimals(true);
      try {
        const res = await getAnimals({ limit: 50 });
        setAnimals(res.animals);
        if (res.animals.length > 0) {
          const first = res.animals[0];
          setSelectedAnimalId(first.animal_id);
        }
      } catch (err) {
        console.error('Error fetching animals:', err);
      } finally {
        setLoadingAnimals(false);
      }
    };
    fetchAnimalList();
  }, []);

  // When selected animal changes, fetch full details and set baseline
  useEffect(() => {
    if (!selectedAnimalId) return;

    const loadAnimalData = async () => {
      try {
        const anim = await getAnimalDetail(selectedAnimalId);
        setCurrentAnimal(anim);
        setForecastResult(null);

        const baseValues: Record<string, number> = {
          body_temperature_c: anim.body_temperature_c ?? 38.5,
          udder_surface_temperature_c: anim.udder_surface_temperature_c ?? 35.5,
          milk_temperature_c: anim.milk_temperature_c ?? 35.0,
          milk_conductivity_ms_cm: anim.milk_conductivity_ms_cm ?? 5.2,
          milk_yield_l_day: anim.milk_yield_l_day ?? 18.0,
          activity_percent: anim.activity_percent ?? 82.0,
          rumination_min_day: anim.rumination_min_day ?? 480.0,
          water_intake_l_day: anim.water_intake_l_day ?? 70.0,
          feeding_behavior_score: anim.feeding_behavior_score ?? 8.0,
          ambient_temperature_c: anim.ambient_temperature_c ?? 26.0,
          relative_humidity_percent: anim.relative_humidity_percent ?? 65.0,
          scc_cells_ml: anim.scc_cells_ml ?? 120000,
        };

        setBaseline(baseValues);
        // Initially, simulated equals baseline
        setSimulated(baseValues);
      } catch (err) {
        console.error('Error loading animal details:', err);
      }
    };

    loadAnimalData();
  }, [selectedAnimalId]);

  // Realistic variation generators based on the animal's existing baseline
  const handleGenerateVariation = (mode: 'healthy_variation' | 'mastitis_warning' | 'heat_stress' | 'reset') => {
    if (!currentAnimal) return;
    setForecastResult(null);

    if (mode === 'reset') {
      setSimulated({ ...baseline });
      return;
    }

    if (mode === 'healthy_variation') {
      // Small, realistic normal physiological fluctuations around baseline
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
      // Clinically plausible pre-clinical mastitis onset:
      // + elevated udder and body thermal readings
      // + significant drop in milk yield (-25% to -40%)
      // + sharp jump in conductivity (+0.8 to +1.6 mS/cm)
      // + depressed rumination & feeding behavior
      // + elevated SCC (400k - 850k cells/ml)
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
    } else if (mode === 'heat_stress') {
      // Thermal environmental challenge
      setSimulated({
        ...baseline,
        ambient_temperature_c: parseFloat((34.5 + Math.random() * 2.5).toFixed(1)),
        relative_humidity_percent: parseFloat((78.0 + Math.random() * 8.0).toFixed(1)),
        body_temperature_c: parseFloat((39.0 + Math.random() * 0.4).toFixed(1)),
        water_intake_l_day: parseFloat((baseline.water_intake_l_day + 22.0).toFixed(1)),
        rumination_min_day: Math.round(Math.max(340, baseline.rumination_min_day - 40)),
      });
    }
  };

  const handleUpdateParameter = (param: string, value: number) => {
    setSimulated((prev) => ({
      ...prev,
      [param]: value,
    }));
  };

  // Run AI forecast step
  const handleRunForecast = async () => {
    if (!currentAnimal) return;
    setRunningForecast(true);
    try {
      const payload: SensorSimulateRequest = {
        animal_id: currentAnimal.animal_id,
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

      const res = await simulateSensorData(payload);

      setForecastResult({
        assessment: res.ai_assessment,
        simulatedSms: res.simulated_sms,
        alertCreated: res.alert_created,
        notice: res.simulated_data_notice || 'Simulated IoT Data — Software simulation',
      });
    } catch (err) {
      console.error('Error simulating sensor forecast:', err);
    } finally {
      setRunningForecast(false);
    }
  };

  // Parameter config table
  const parametersList = [
    {
      key: 'body_temperature_c',
      label: 'Body Temperature',
      unit: '°C',
      step: 0.1,
      min: 37.0,
      max: 41.5,
      normal: '38.0 – 39.0 °C',
      description: 'Systemic core temperature sensor'
    },
    {
      key: 'udder_surface_temperature_c',
      label: 'Udder Surface Temperature',
      unit: '°C',
      step: 0.1,
      min: 33.0,
      max: 39.5,
      normal: '34.5 – 36.2 °C',
      description: 'Localized thermal surface telemetry'
    },
    {
      key: 'milk_conductivity_ms_cm',
      label: 'Milk Electrical Conductivity',
      unit: 'mS/cm',
      step: 0.05,
      min: 4.0,
      max: 8.5,
      normal: '4.5 – 5.4 mS/cm',
      description: 'Inline automated milking parlor sensor'
    },
    {
      key: 'milk_temperature_c',
      label: 'Milk Temperature',
      unit: '°C',
      step: 0.1,
      min: 33.0,
      max: 39.0,
      normal: '34.5 – 35.8 °C',
      description: 'Teat-cup inline thermistor reading'
    },
    {
      key: 'milk_yield_l_day',
      label: 'Daily Milk Yield',
      unit: 'L/day',
      step: 0.5,
      min: 2.0,
      max: 35.0,
      normal: '> 16.0 L/day',
      description: 'Parlor flowmeter daily yield'
    },
    {
      key: 'scc_cells_ml',
      label: 'Somatic Cell Count (SCC)',
      unit: 'cells/ml',
      step: 10000,
      min: 30000,
      max: 1200000,
      normal: '< 200,000 cells/ml',
      description: 'Optical automated milk quality sensor'
    },
    {
      key: 'activity_percent',
      label: 'Cow Activity Level',
      unit: '%',
      step: 1.0,
      min: 30.0,
      max: 100.0,
      normal: '70 – 95%',
      description: 'Ear-tag or collar accelerometer'
    },
    {
      key: 'rumination_min_day',
      label: 'Daily Rumination Time',
      unit: 'min/day',
      step: 10,
      min: 150,
      max: 650,
      normal: '420 – 550 min/day',
      description: 'Acoustic rumination collar sensor'
    },
    {
      key: 'water_intake_l_day',
      label: 'Daily Water Intake',
      unit: 'L/day',
      step: 1.0,
      min: 20.0,
      max: 120.0,
      normal: '60 – 90 L/day',
      description: 'Smart trough flowmeter sensor'
    },
    {
      key: 'feeding_behavior_score',
      label: 'Feeding Behavior Score',
      unit: '/10',
      step: 0.5,
      min: 1.0,
      max: 10.0,
      normal: '7.5 – 9.5 / 10',
      description: 'Bunk visit frequency & duration metric'
    },
    {
      key: 'ambient_temperature_c',
      label: 'Ambient Barn Temperature',
      unit: '°C',
      step: 0.5,
      min: 10.0,
      max: 42.0,
      normal: '18 – 28 °C',
      description: 'Barn micro-climate environment sensor'
    },
    {
      key: 'relative_humidity_percent',
      label: 'Barn Relative Humidity',
      unit: '%',
      step: 1.0,
      min: 25.0,
      max: 95.0,
      normal: '50 – 70%',
      description: 'Hygrometer ambient humidity sensor'
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Top Banner: Prominent Simulation Disclaimer */}
      <div className="bg-gradient-to-r from-blue-900/40 via-slate-800/80 to-slate-800/80 border border-blue-500/30 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base font-bold text-white">IoT Sensor Simulator</h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Simulated IoT Data
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              <strong>SOFTWARE SIMULATION:</strong> No physical hardware or real-world IoT sensors are required. All telemetry feeds are mathematical variations applied to synthetic animal records to model early pre-clinical mastitis dynamics (7–14 day forecast window).
            </p>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 bg-slate-900/80 border border-slate-700 px-3 py-1.5 rounded-xl shrink-0 self-end sm:self-center font-mono">
          Engine: Deterministic Delta Simulation
        </div>
      </div>

      {/* Workflow Step Indicator */}
      <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 p-3 shadow-md">
        <div className="flex items-center justify-between text-xs text-slate-300 font-medium overflow-x-auto gap-2 py-1">
          <div className="flex items-center space-x-1.5 shrink-0 text-blue-400 font-bold">
            <span className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-[10px]">1</span>
            <span>Select Animal</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <div className="flex items-center space-x-1.5 shrink-0 text-indigo-400 font-bold">
            <span className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-[10px]">2</span>
            <span>Generate Sensor Reading</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <div className="flex items-center space-x-1.5 shrink-0 text-amber-400 font-bold">
            <span className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-[10px]">3</span>
            <span>Compare Values</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <div className="flex items-center space-x-1.5 shrink-0 text-emerald-400 font-bold">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[10px]">4</span>
            <span>Run AI Forecast</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <div className="flex items-center space-x-1.5 shrink-0 text-rose-400 font-bold">
            <span className="w-5 h-5 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-[10px]">5</span>
            <span>Alert & SMS</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Controls (Step 1 & 2) & Right Comparison (Step 3 & 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Animal Selection & Presets */}
        <div className="space-y-4">
          {/* Step 1: Animal Selection */}
          <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Search className="w-4 h-4 text-blue-400" />
                <span>Step 1: Select Animal</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">50 available</span>
            </div>

            <select
              value={selectedAnimalId}
              onChange={(e) => setSelectedAnimalId(e.target.value)}
              disabled={loadingAnimals}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
            >
              {animals.map((a) => (
                <option key={a.animal_id} value={a.animal_id}>
                  {a.animal_id} — {a.breed} ({a.farm_id}) | Risk: {a.risk_score ? `${a.risk_score}%` : 'Pending'}
                </option>
              ))}
            </select>

            {currentAnimal && (
              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-700/50 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Current Baseline Risk:</span>
                  <RiskBadge category={currentAnimal.risk_category || 'No Risk'} />
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span className="text-slate-400">Baseline Score:</span>
                  <span className="font-bold text-white">{currentAnimal.risk_score || 0}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Parity / Lactation:</span>
                  <span className="font-semibold text-slate-200">Lactation {currentAnimal.lactation_number}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Previous Mastitis:</span>
                  <span className="font-semibold text-slate-200">
                    {currentAnimal.previous_mastitis === 1 ? 'Yes (History)' : 'None'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Generate Reading Presets */}
          <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 p-5 shadow-lg space-y-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>Step 2: Generate Sensor Reading</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Applies realistic physiological variations around this animal's existing baseline.
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleGenerateVariation('healthy_variation')}
                className="w-full text-left p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700/60 transition group flex items-start justify-between"
              >
                <div>
                  <h4 className="font-bold text-emerald-400 text-xs flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Preset: Normal Baseline Fluctuation</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Minor healthy diurnal variations. Keeps metrics within safe operational bounds.
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleGenerateVariation('mastitis_warning')}
                className="w-full text-left p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-rose-500/30 transition group flex items-start justify-between"
              >
                <div>
                  <h4 className="font-bold text-rose-400 text-xs flex items-center space-x-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Preset: Elevated Mastitis Early Warning</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Elevated SCC, conductivity surge, milk yield drop, and reduced rumination.
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleGenerateVariation('heat_stress')}
                className="w-full text-left p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-amber-500/30 transition group flex items-start justify-between"
              >
                <div>
                  <h4 className="font-bold text-amber-400 text-xs flex items-center space-x-1.5">
                    <Thermometer className="w-3.5 h-3.5" />
                    <span>Preset: Thermal Stress Shift</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Elevated ambient temperature & humidity with increased water intake.
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleGenerateVariation('reset')}
                className="w-full text-center py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 font-semibold transition"
              >
                Reset to Animal Baseline
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Comparison Table (Previous vs New Simulated) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 p-5 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-700/50 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Step 3: Compare Previous vs Simulated Reading</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Parameter comparison across all 11 telemetry channels plus Somatic Cell Count
                </p>
              </div>

              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 self-start sm:self-center">
                Simulated IoT Data Stream
              </span>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-700/50">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-700">
                  <tr>
                    <th className="p-2.5">Parameter</th>
                    <th className="p-2.5">Previous Reading</th>
                    <th className="p-2.5">New Simulated Reading</th>
                    <th className="p-2.5">Change Delta</th>
                    <th className="p-2.5">Reference Baseline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {parametersList.map((param) => {
                    const prevVal = baseline[param.key] ?? 0;
                    const newVal = simulated[param.key] ?? prevVal;
                    const diff = newVal - prevVal;
                    const hasChanged = Math.abs(diff) > 0.001;

                    let diffColor = 'text-slate-400';
                    let diffBadge = 'bg-slate-800 text-slate-400 border-slate-700';

                    if (hasChanged) {
                      if (
                        param.key === 'scc_cells_ml' ||
                        param.key === 'milk_conductivity_ms_cm' ||
                        param.key === 'body_temperature_c' ||
                        param.key === 'udder_surface_temperature_c'
                      ) {
                        diffColor = diff > 0 ? 'text-rose-400' : 'text-emerald-400';
                        diffBadge = diff > 0 ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
                      } else if (param.key === 'milk_yield_l_day' || param.key === 'rumination_min_day') {
                        diffColor = diff < 0 ? 'text-rose-400' : 'text-emerald-400';
                        diffBadge = diff < 0 ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
                      } else {
                        diffBadge = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
                      }
                    }

                    return (
                      <tr key={param.key} className={hasChanged ? 'bg-slate-850/60' : 'hover:bg-slate-800/40'}>
                        <td className="p-2.5 font-medium text-slate-200">
                          <div>{param.label}</div>
                          <span className="text-[10px] text-slate-400">{param.description}</span>
                        </td>

                        <td className="p-2.5 font-mono text-slate-400">
                          {param.key === 'scc_cells_ml' ? prevVal.toLocaleString() : prevVal} {param.unit}
                        </td>

                        <td className="p-2.5">
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              step={param.step}
                              value={newVal}
                              onChange={(e) => handleUpdateParameter(param.key, Number(e.target.value))}
                              className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                            />
                            <span className="text-[11px] text-slate-400">{param.unit}</span>
                          </div>
                        </td>

                        <td className="p-2.5">
                          {hasChanged ? (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${diffBadge}`}>
                              {diff > 0 ? `+${param.key === 'scc_cells_ml' ? Math.round(diff).toLocaleString() : diff.toFixed(1)}` : `${param.key === 'scc_cells_ml' ? Math.round(diff).toLocaleString() : diff.toFixed(1)}`} {param.unit}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">No change</span>
                          )}
                        </td>

                        <td className="p-2.5 text-[11px] text-slate-400">
                          {param.normal}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Step 4 Action Button: Run AI Forecast */}
            <div className="pt-3 border-t border-slate-700/50 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                <span>Selected animal: </span>
                <strong className="text-white font-mono">{selectedAnimalId}</strong>
              </div>

              <button
                onClick={handleRunForecast}
                disabled={runningForecast}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition disabled:opacity-50"
              >
                {runningForecast ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                <span>Run AI Early Forecast</span>
              </button>
            </div>
          </div>

          {/* Step 4 & 5: Forecast Results Panel */}
          {forecastResult && (
            <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 p-5 shadow-lg space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-700/50 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Step 4 & 5: Updated AI Early-Warning Forecast</span>
                  </h3>
                  <p className="text-xs text-slate-400">{forecastResult.notice}</p>
                </div>
                <div className="text-xs font-bold px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                  Forecast Window: <span className="text-emerald-400">7–14 days</span>
                </div>
              </div>

              {/* Score Shift Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-700/50">
                  <span className="text-xs text-slate-400 block">Baseline Risk Score</span>
                  <span className="text-2xl font-black text-slate-300 block mt-1">{baseline.risk_score || currentAnimal?.risk_score || 0}%</span>
                  <span className="text-[10px] text-slate-400">Prior to simulation</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-700/50">
                  <span className="text-xs text-slate-400 block">New Simulated Risk Score</span>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span
                      className={`text-2xl font-black ${
                        forecastResult.assessment.risk_score > 60
                          ? 'text-rose-400'
                          : forecastResult.assessment.risk_score > 40
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {forecastResult.assessment.risk_score}%
                    </span>
                    <RiskBadge category={forecastResult.assessment.risk_category} />
                  </div>
                  <span className="text-[10px] text-slate-400">Computed via ML model</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-700/50">
                  <span className="text-xs text-slate-400 block">Risk Score Shift</span>
                  <span
                    className={`text-2xl font-black block mt-1 ${
                      forecastResult.assessment.risk_score - (currentAnimal?.risk_score || 0) > 0
                        ? 'text-rose-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {forecastResult.assessment.risk_score - (currentAnimal?.risk_score || 0) > 0 ? '+' : ''}
                    {(forecastResult.assessment.risk_score - (currentAnimal?.risk_score || 0)).toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-slate-400">7–14 day forecast window</span>
                </div>
              </div>

              {/* Model Derived Risk Factors for Simulated State */}
              {forecastResult.assessment.risk_factors && forecastResult.assessment.risk_factors.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-700/50">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Model-Derived Risk Factors (From Simulated Readings)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {forecastResult.assessment.risk_factors.map((rf, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start justify-between">
                        <div>
                          <span className="font-semibold text-white block">{rf.name}</span>
                          <span className="text-slate-400 text-[11px]">{rf.value}</span>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              rf.impact === 'High'
                                ? 'bg-rose-500/20 text-rose-300'
                                : rf.impact === 'Medium'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-blue-500/20 text-blue-300'
                            }`}
                          >
                            {rf.impact}
                          </span>
                          {rf.contribution_pct && (
                            <span className="text-[10px] text-blue-300 block font-mono">
                              +{rf.contribution_pct}%
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 6: High Risk Alert & Simulated SMS Notification Notification */}
              {forecastResult.assessment.risk_score > 60 && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-3">
                  <div className="flex items-center space-x-2 text-rose-300 font-bold text-xs">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span>HIGH RISK DETECTED: Automated Alert & Simulated SMS Triggered</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Alert Card */}
                    <div className="p-3 rounded-lg bg-slate-900/80 border border-rose-500/20 space-y-1">
                      <div className="flex items-center space-x-1.5 text-purple-300 font-semibold">
                        <Bell className="w-3.5 h-3.5" />
                        <span>System Alert Created</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug">
                        Early-warning alert logged for <strong>{selectedAnimalId}</strong> ({forecastResult.assessment.risk_score}% risk). Added to farm manager inspection queue.
                      </p>
                    </div>

                    {/* Simulated SMS Card */}
                    <div className="p-3 rounded-lg bg-slate-900/80 border border-emerald-500/20 space-y-1">
                      <div className="flex items-center space-x-1.5 text-emerald-300 font-semibold">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Simulated SMS Notification Dispatched</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug">
                        Status: <span className="text-emerald-400 font-mono font-bold">SENT_SIMULATED</span> to <span className="font-mono text-slate-200">+1-555-HERD-VET</span>
                      </p>
                      {forecastResult.simulatedSms?.message && (
                        <p className="text-[10px] font-mono text-slate-400 bg-slate-950/60 p-1.5 rounded mt-1 border border-slate-800">
                          {forecastResult.simulatedSms.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
