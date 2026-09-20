import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  RefreshCw,
  Activity,
  Droplet,
  Thermometer,
  ShieldAlert,
  CheckCircle,
  Wind,
  Home,
  Info,
  Calendar,
  MessageSquare,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { Animal, PredictionResponse, SMSNotification } from '../types';
import { getAnimalDetail, sendSmsForAnimal, getSmsSettings, getSmsHistory } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';
import { RiskGauge } from '../components/RiskGauge';
import { FeatureImportanceChart } from '../components/FeatureImportanceChart';
import { SensorSimulationModal } from '../components/SensorSimulationModal';

export const AnimalDetails: React.FC = () => {
  const { animal_id } = useParams<{ animal_id: string }>();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [assessment, setAssessment] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [smsSending, setSmsSending] = useState(false);
  const [smsStatus, setSmsStatus] = useState<{ type: 'success' | 'error' | null; msg: string }>({ type: null, msg: '' });
  const [lastSms, setLastSms] = useState<SMSNotification | null>(null);

  const fetchDetail = async () => {
    if (!animal_id) return;
    setLoading(true);
    try {
      const [data, smsHist] = await Promise.all([
        getAnimalDetail(animal_id),
        getSmsHistory(100),
      ]);
      setAnimal(data);
      if (data.ai_assessment) {
        setAssessment(data.ai_assessment);
      }
      // Find latest SMS for this animal
      const latest = smsHist.find(
        (s) => s.animal_id === animal_id && s.status === 'SENT_SIMULATED' && s.animal_id !== 'TEST'
      );
      setLastSms(latest || null);
    } catch (err) {
      console.error('Error fetching animal detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [animal_id]);

  const handleForecastUpdated = (newAssessment: PredictionResponse, updatedAnimal: Animal) => {
    setAssessment(newAssessment);
    setAnimal(updatedAnimal);
  };

  const handleSendSms = async () => {
    if (!animal_id) return;
    setSmsSending(true);
    setSmsStatus({ type: null, msg: '' });
    try {
      const cfg = await getSmsSettings();
      const recipient = cfg.farmer_phone || cfg.vet_phone || '';
      if (!recipient) {
        setSmsStatus({ type: 'error', msg: 'No phone numbers configured. Go to Settings → SMS Notifications.' });
        return;
      }
      const res = await sendSmsForAnimal(animal_id, recipient);
      setSmsStatus({
        type: 'success',
        msg: `Simulated SMS sent to ${res.recipient}. Logged to history. (Demo Mode — no real SMS transmitted)`,
      });
      // Refresh SMS state
      const smsHist = await getSmsHistory(100);
      const latest = smsHist.find(
        (s) => s.animal_id === animal_id && s.status === 'SENT_SIMULATED' && s.animal_id !== 'TEST'
      );
      setLastSms(latest || null);
    } catch (err: any) {
      setSmsStatus({
        type: 'error',
        msg: err.response?.data?.detail || 'Error sending SMS alert.',
      });
    } finally {
      setSmsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
        <span className="text-sm font-medium text-slate-400">Loading Animal Profile & AI Assessment...</span>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="p-8 text-center bg-slate-800/60 rounded-2xl border border-slate-700 space-y-4">
        <h2 className="text-lg font-bold text-white">Animal Not Found</h2>
        <p className="text-xs text-slate-400">The animal ID "{animal_id}" does not exist in records.</p>
        <Link to="/animals" className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold">
          Return to Animal List
        </Link>
      </div>
    );
  }

  const riskScore = assessment?.risk_score || animal.risk_score || 0;
  const riskCategory = assessment?.risk_category || animal.risk_category || 'No Risk';
  const isHighRisk = riskCategory === 'High Risk';

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Link
            to="/animals"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-black text-white font-mono">{animal.animal_id}</h1>
              <RiskBadge category={riskCategory} size="md" />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Farm: <strong className="text-slate-200">{animal.farm_id}</strong> | Breed: <strong className="text-slate-200">{animal.breed}</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchDetail}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Data</span>
          </button>

          {/* SMS Alert Button — shown only for High Risk animals */}
          {isHighRisk && (
            <button
              onClick={handleSendSms}
              disabled={smsSending}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold transition disabled:opacity-50"
            >
              {smsSending ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <MessageSquare className="w-3.5 h-3.5" />
              )}
              <span>{smsSending ? 'Sending SMS…' : 'Send SMS Alert'}</span>
            </button>
          )}
        </div>
      </div>

      {/* SMS Status Feedback */}
      {smsStatus.type && (
        <div className={`text-xs px-4 py-2.5 rounded-xl border flex items-start space-x-2 ${
          smsStatus.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          <MessageSquare className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>{smsStatus.msg}</span>
        </div>
      )}

      {/* Main Grid: Left Column AI Assessment + Right Column Telemetry & Environment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: AI Risk Gauge, Forecast Status, SMS Status */}
        <div className="space-y-6">
          <RiskGauge
            score={riskScore}
            category={riskCategory}
            forecastWindow="7–14 days"
          />

          {/* Forecast & Prediction Status Card */}
          <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 p-5 shadow-lg space-y-3 text-xs">
            <h3 className="font-semibold text-white border-b border-slate-700/50 pb-2 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>Forecast Details</span>
            </h3>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/40">
                <span className="text-slate-400">AI Risk Score</span>
                <span className="font-extrabold text-white text-sm">{Math.round(riskScore)} <span className="text-slate-500 font-normal text-xs">/ 100</span></span>
              </div>

              <div className="flex items-center justify-between bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/40">
                <span className="text-slate-400">Risk Category</span>
                <RiskBadge category={riskCategory} size="sm" />
              </div>

              <div className="flex items-center justify-between bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/40">
                <span className="text-slate-400">Forecast Window</span>
                <span className="font-bold text-indigo-300">7–14 days</span>
              </div>

              <div className="flex items-center justify-between bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/40">
                <span className="text-slate-400">Prediction Status</span>
                <span className="flex items-center space-x-1 text-emerald-300 font-semibold">
                  <Clock className="w-3 h-3" />
                  <span>AI Early-Warning Forecast</span>
                </span>
              </div>

              <div className="bg-amber-500/8 border border-amber-500/20 rounded-lg p-2.5 text-[10px] text-amber-200/90 italic leading-relaxed">
                <AlertTriangle className="w-3 h-3 inline-block mr-1 text-amber-400 -mt-0.5" />
                Prototype forecast based on synthetic data. Not a clinical diagnosis. Consult a veterinary professional for clinical decisions.
              </div>
            </div>
          </div>

          {/* SMS Alert Status Card */}
          <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 p-5 shadow-lg space-y-3 text-xs">
            <h3 className="font-semibold text-white border-b border-slate-700/50 pb-2 flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>SMS Alert Status</span>
            </h3>

            {lastSms ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-emerald-300">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span className="font-semibold">SMS Alert Dispatched</span>
                </div>
                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/40 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Recipient</span>
                    <span className="font-mono text-slate-200">{lastSms.recipient}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status</span>
                    <span className="text-emerald-300 font-semibold">{lastSms.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mode</span>
                    <span className="text-slate-300">{lastSms.mode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sent At</span>
                    <span className="text-slate-300">{lastSms.sent_at ? new Date(lastSms.sent_at).toLocaleString() : '—'}</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 italic">
                  Demo Mode — no real SMS was transmitted. Message logged for audit.
                </p>
              </div>
            ) : (
              <div className="text-slate-500 text-center py-3 space-y-1">
                <p className="font-medium">No SMS alerts sent for this animal</p>
                <p className="text-[10px] italic">
                  {isHighRisk
                    ? 'Configure phone numbers in Settings to enable auto-dispatch.'
                    : 'SMS alerts are dispatched only for High Risk predictions.'}
                </p>
              </div>
            )}
          </div>

          {/* Key Animal Identity Card */}
          <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 p-5 shadow-lg space-y-3 text-xs">
            <h3 className="font-semibold text-white border-b border-slate-700/50 pb-2">Animal Profile</h3>
            <div className="grid grid-cols-2 gap-2 text-slate-300">
              <div>
                <span className="text-slate-500 block">Age</span>
                <span className="font-semibold">{animal.age_years} years</span>
              </div>
              <div>
                <span className="text-slate-500 block">Lactation Number</span>
                <span className="font-semibold">Lactation {animal.lactation_number}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Days in Milk (DIM)</span>
                <span className="font-semibold">{animal.days_in_milk} days</span>
              </div>
              <div>
                <span className="text-slate-500 block">Previous Mastitis</span>
                <span className={`font-semibold ${animal.previous_mastitis ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {animal.previous_mastitis ? 'Yes (History)' : 'Clean'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Vaccination</span>
                <span className="font-semibold">{animal.vaccination_status}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Sensor Status</span>
                <span className="font-semibold text-emerald-400">{animal.sensor_status}</span>
              </div>
            </div>
            {animal.treatment_history && (
              <div className="pt-2 border-t border-slate-700/40">
                <span className="text-slate-500 block mb-0.5">Treatment History</span>
                <span className="text-slate-300 font-mono text-[11px] bg-slate-900/60 p-2 rounded-lg block">
                  {animal.treatment_history}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Measurements & Farm Environment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Measurements Grid */}
          <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 p-5 shadow-lg space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Current Milk & Physiological Telemetry</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/40">
                <span className="text-slate-400 block mb-1">Milk Yield</span>
                <span className="text-lg font-bold text-white">{animal.milk_yield_l_day} L/day</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/40">
                <span className="text-slate-400 block mb-1">SCC (cells/ml)</span>
                <span className="text-lg font-bold text-emerald-400">
                  {animal.scc_cells_ml ? animal.scc_cells_ml.toLocaleString() : 'N/A'}
                </span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/40">
                <span className="text-slate-400 block mb-1">Conductivity</span>
                <span className="text-lg font-bold text-teal-300">
                  {animal.milk_conductivity_ms_cm ? `${animal.milk_conductivity_ms_cm} mS/cm` : 'N/A'}
                </span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/40">
                <span className="text-slate-400 block mb-1">Milk Temp</span>
                <span className="text-lg font-bold text-slate-200">{animal.milk_temperature_c} °C</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/40">
                <span className="text-slate-400 block mb-1">Body Temp</span>
                <span className="text-lg font-bold text-slate-200">
                  {animal.body_temperature_c ? `${animal.body_temperature_c} °C` : 'N/A'}
                </span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/40">
                <span className="text-slate-400 block mb-1">Udder Temp</span>
                <span className="text-lg font-bold text-slate-200">
                  {animal.udder_surface_temperature_c ? `${animal.udder_surface_temperature_c} °C` : 'N/A'}
                </span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/40">
                <span className="text-slate-400 block mb-1">Rumination</span>
                <span className="text-lg font-bold text-slate-200">
                  {animal.rumination_min_day ? `${animal.rumination_min_day} min` : 'N/A'}
                </span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/40">
                <span className="text-slate-400 block mb-1">Activity</span>
                <span className="text-lg font-bold text-slate-200">
                  {animal.activity_percent ? `${animal.activity_percent}%` : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Farm Management & Environment Grid */}
          <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 p-5 shadow-lg space-y-3 text-xs">
            <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
              <Home className="w-4 h-4 text-blue-400" />
              <span>Farm Management & Environmental Conditions</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-700/30">
                <span className="text-slate-400 block">Overall Hygiene</span>
                <span className="font-bold text-slate-200">{animal.hygiene_score}/10</span>
              </div>
              <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-700/30">
                <span className="text-slate-400 block">Milking Hygiene</span>
                <span className="font-bold text-slate-200">{animal.milking_hygiene_score}/10</span>
              </div>
              <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-700/30">
                <span className="text-slate-400 block">Milking Schedule</span>
                <span className="font-bold text-slate-200">{animal.milking_schedule}</span>
              </div>
              <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-700/30">
                <span className="text-slate-400 block">Ambient Temp</span>
                <span className="font-bold text-slate-200">{animal.ambient_temperature_c} °C</span>
              </div>
            </div>
          </div>

          {/* Explainable AI: Main Risk Factors */}
          <FeatureImportanceChart riskFactors={assessment?.risk_factors || []} />

          {/* Decision-Support Preventive Recommendations */}
          {assessment?.recommendations && assessment.recommendations.length > 0 && (
            <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 p-5 shadow-lg space-y-4">
              <div>
                <h3 className="text-base font-semibold text-white">Preventive Decision-Support Recommendations</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  These are AI-generated suggestions for the 7–14 day forecast window. They do <strong>not</strong> constitute veterinary prescriptions.
                </p>
              </div>
              <div className="space-y-3 text-xs">
                {assessment.recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/50 flex items-start space-x-3"
                  >
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase shrink-0 mt-0.5 ${
                        rec.priority === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : rec.priority === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {rec.priority}
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-xs">{rec.title}</h4>
                      <p className="text-slate-300 mt-0.5 leading-relaxed">{rec.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Live Sensor Simulation Section */}
          <SensorSimulationModal animal={animal} onForecastUpdated={handleForecastUpdated} />

          {/* Bottom Disclaimer */}
          <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl p-3.5 text-xs text-amber-200/90 flex items-start space-x-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-amber-300">Important Disclaimer</p>
              <p className="leading-relaxed opacity-90">
                This is a <strong>prototype early-warning forecast</strong> trained on synthetic data. Risk scores indicate potential mastitis
                risk within the <strong>7–14 day forecasting window</strong> based on current observations — they do not guarantee that mastitis
                will or will not occur. This system does not constitute a clinical veterinary diagnosis and does not prescribe medication.
                Always consult a qualified veterinary professional for clinical decisions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
