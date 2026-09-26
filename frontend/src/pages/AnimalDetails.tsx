import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  RefreshCw,
  Activity,
  CheckCircle,
  Home,
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
import { useLanguage } from '../i18n/LanguageContext';

export const AnimalDetails: React.FC = () => {
  const { t } = useLanguage();
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
        <span className="text-sm font-medium text-slate-400">{t('loadingData')}</span>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="p-8 text-center bg-slate-800/60 rounded-2xl border border-slate-700 space-y-4">
        <h2 className="text-lg font-bold text-white">{t('animalNotFound')}</h2>
        <p className="text-xs text-slate-400">{animal_id}</p>
        <Link to="/animals" className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold">
          {t('returnToList')}
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
              {t('farmFilter')}: <strong className="text-slate-200">{animal.farm_id}</strong> | {t('breedFilter')}: <strong className="text-slate-200">{animal.breed}</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchDetail}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t('refreshDataBtn')}</span>
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
              <span>{smsSending ? t('loadingData') : t('sendAlertSmsBtn')}</span>
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
              <span>{t('forecastDetailsTitle')}</span>
            </h3>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/40">
                <span className="text-slate-400">{t('riskScore')}</span>
                <span className="font-extrabold text-white text-sm">{Math.round(riskScore)} <span className="text-slate-500 font-normal text-xs">/ 100</span></span>
              </div>

              <div className="flex items-center justify-between bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/40">
                <span className="text-slate-400">{t('riskLevel')}</span>
                <RiskBadge category={riskCategory} size="sm" />
              </div>

              <div className="flex items-center justify-between bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/40">
                <span className="text-slate-400">{t('forecastWindowLabel')}</span>
                <span className="font-bold text-indigo-300">7–14 days</span>
              </div>

              <div className="flex items-center justify-between bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/40">
                <span className="text-slate-400">{t('predictionStatusLabel')}</span>
                <span className="flex items-center space-x-1 text-emerald-300 font-semibold">
                  <Clock className="w-3 h-3" />
                  <span>{t('earlyWarningForecast')}</span>
                </span>
              </div>

              <div className="bg-amber-500/8 border border-amber-500/20 rounded-lg p-2.5 text-[10px] text-amber-200/90 italic leading-relaxed">
                <AlertTriangle className="w-3 h-3 inline-block mr-1 text-amber-400 -mt-0.5" />
                {t('gaugeDisclaimer')}
              </div>
            </div>
          </div>

          {/* SMS Alert Status Card */}
          <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 p-5 shadow-lg space-y-3 text-xs">
            <h3 className="font-semibold text-white border-b border-slate-700/50 pb-2 flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>{t('smsAlertStatusTitle')}</span>
            </h3>

            {lastSms ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-emerald-300">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span className="font-semibold">{t('smsAlertDispatched')}</span>
                </div>
                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/40 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{t('recipientLabel')}</span>
                    <span className="font-mono text-slate-200">{lastSms.recipient}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{t('statusLabel')}</span>
                    <span className="text-emerald-300 font-semibold">{lastSms.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{t('modeLabel')}</span>
                    <span className="text-slate-300">{lastSms.mode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{t('sentAtLabel')}</span>
                    <span className="text-slate-300">{lastSms.sent_at ? new Date(lastSms.sent_at).toLocaleString() : '—'}</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 italic">
                  {t('demoModeDisclaimerTitle')}
                </p>
              </div>
            ) : (
              <div className="text-slate-500 text-center py-3 space-y-1">
                <p className="font-medium">{t('noSmsSentMsg')}</p>
                <p className="text-[10px] italic">
                  {t('smsConfigHint')}
                </p>
              </div>
            )}
          </div>

          {/* Key Animal Identity Card */}
          <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 p-5 shadow-lg space-y-3 text-xs">
            <h3 className="font-semibold text-white border-b border-slate-700/50 pb-2">{t('animalProfileCardTitle')}</h3>
            <div className="grid grid-cols-2 gap-2 text-slate-300">
              <div>
                <span className="text-slate-500 block">{t('thAge')}</span>
                <span className="font-semibold">{animal.age_years} yrs</span>
              </div>
              <div>
                <span className="text-slate-500 block">{t('thLactation')}</span>
                <span className="font-semibold">L{animal.lactation_number}</span>
              </div>
              <div>
                <span className="text-slate-500 block">{t('dimLabel')}</span>
                <span className="font-semibold">{animal.days_in_milk} d</span>
              </div>
              <div>
                <span className="text-slate-500 block">{t('pastMastitisFilter')}</span>
                <span className={`font-semibold ${animal.previous_mastitis ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {animal.previous_mastitis ? t('pastMastitisYes') : t('pastMastitisNo')}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">{t('vaccinationLabel')}</span>
                <span className="font-semibold">{animal.vaccination_status}</span>
              </div>
              <div>
                <span className="text-slate-500 block">{t('sensorStatusLabel')}</span>
                <span className="font-semibold text-emerald-400">{animal.sensor_status}</span>
              </div>
            </div>
            {animal.treatment_history && (
              <div className="pt-2 border-t border-slate-700/40">
                <span className="text-slate-500 block mb-0.5">{t('treatmentHistoryLabel')}</span>
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
              <span>{t('currentTelemetryHeader')}</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/40">
                <span className="text-slate-400 block mb-1">{t('milkYield')}</span>
                <span className="text-lg font-bold text-white">{animal.milk_yield_l_day} L</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/40">
                <span className="text-slate-400 block mb-1">{t('scc')}</span>
                <span className="text-lg font-bold text-emerald-400">
                  {animal.scc_cells_ml ? animal.scc_cells_ml.toLocaleString() : 'N/A'}
                </span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/40">
                <span className="text-slate-400 block mb-1">{t('milkConductivity')}</span>
                <span className="text-lg font-bold text-teal-300">
                  {animal.milk_conductivity_ms_cm ? `${animal.milk_conductivity_ms_cm} mS/cm` : 'N/A'}
                </span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/40">
                <span className="text-slate-400 block mb-1">{t('milkTemp')}</span>
                <span className="text-lg font-bold text-slate-200">{animal.milk_temperature_c} °C</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/40">
                <span className="text-slate-400 block mb-1">{t('bodyTemp')}</span>
                <span className="text-lg font-bold text-slate-200">
                  {animal.body_temperature_c ? `${animal.body_temperature_c} °C` : 'N/A'}
                </span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/40">
                <span className="text-slate-400 block mb-1">{t('udderTemp')}</span>
                <span className="text-lg font-bold text-slate-200">
                  {animal.udder_surface_temperature_c ? `${animal.udder_surface_temperature_c} °C` : 'N/A'}
                </span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/40">
                <span className="text-slate-400 block mb-1">{t('ruminationTime')}</span>
                <span className="text-lg font-bold text-slate-200">
                  {animal.rumination_min_day ? `${animal.rumination_min_day} min` : 'N/A'}
                </span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/40">
                <span className="text-slate-400 block mb-1">{t('activityLevel')}</span>
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
              <span>{t('farmManagementHeader')}</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-700/30">
                <span className="text-slate-400 block">{t('hygieneOverall')}</span>
                <span className="font-bold text-slate-200">{animal.hygiene_score}/10</span>
              </div>
              <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-700/30">
                <span className="text-slate-400 block">{t('milkingHygiene')}</span>
                <span className="font-bold text-slate-200">{animal.milking_hygiene_score}/10</span>
              </div>
              <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-700/30">
                <span className="text-slate-400 block">{t('milkingSchedule')}</span>
                <span className="font-bold text-slate-200">{animal.milking_schedule}</span>
              </div>
              <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-700/30">
                <span className="text-slate-400 block">{t('ambientTemp')}</span>
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
                <h3 className="text-base font-semibold text-white">{t('preventiveDecisionHeader')}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {t('preventiveDecisionDesc')}
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
              <p className="font-semibold text-amber-300">{t('importantDisclaimerTitle')}</p>
              <p className="leading-relaxed opacity-90">
                {t('gaugeDisclaimer')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
