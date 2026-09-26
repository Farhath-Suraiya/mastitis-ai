import React, { useEffect, useState } from 'react';
import {
  Cpu,
  Database,
  Award,
  MessageSquare,
  ToggleLeft,
  ToggleRight,
  Phone,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  Smartphone,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { CsvUploader } from '../components/CsvUploader';
import {
  getModelMetrics,
  getSmsSettings,
  updateSmsSettings,
  sendTestSms,
  getSmsHistory,
} from '../services/api';
import { ModelMetrics, SMSSettings, SMSNotification } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

export const Settings: React.FC = () => {
  const { t } = useLanguage();
  const [, setMetrics] = useState<ModelMetrics | null>(null);
  const [, setLoading] = useState(true);

  // SMS state
  const [, setSmsSettings] = useState<SMSSettings | null>(null);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [farmerPhone, setFarmerPhone] = useState('');
  const [vetPhone, setVetPhone] = useState('');
  const [smsMode] = useState<'SIMULATED' | 'REAL'>('SIMULATED');
  const [smsHistory, setSmsHistory] = useState<SMSNotification[]>([]);
  const [smsLoading, setSmsLoading] = useState(false);
  const [testSmsRecipient, setTestSmsRecipient] = useState('');
  const [testSmsStatus, setTestSmsStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [m, s, h] = await Promise.all([
          getModelMetrics(),
          getSmsSettings(),
          getSmsHistory(20),
        ]);
        setMetrics(m);
        setSmsSettings(s);
        setSmsEnabled(s.enabled);
        setFarmerPhone(s.farmer_phone || '');
        setVetPhone(s.vet_phone || '');
        setSmsHistory(h);
      } catch (err) {
        console.error('Error fetching settings data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    setSettingsSaved(false);
    try {
      const updated = await updateSmsSettings({
        enabled: smsEnabled,
        farmer_phone: farmerPhone,
        vet_phone: vetPhone,
        mode: smsMode,
      });
      setSmsSettings(updated);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (err) {
      console.error('Error saving SMS settings:', err);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSendTestSms = async () => {
    const recipient = testSmsRecipient.trim() || farmerPhone.trim() || vetPhone.trim();
    if (!recipient) {
      setTestSmsStatus({
        type: 'error',
        message: 'Enter a phone number in Farmer or Veterinarian field first, or the test recipient field.',
      });
      return;
    }
    setSmsLoading(true);
    setTestSmsStatus({ type: null, message: '' });
    try {
      const res = await sendTestSms(recipient);
      if (res.success) {
        setTestSmsStatus({
          type: 'success',
          message: `Simulated SMS sent to ${res.recipient}. Message logged to history.`,
        });
        // Refresh history
        const h = await getSmsHistory(20);
        setSmsHistory(h);
      } else {
        setTestSmsStatus({ type: 'error', message: res.reason || 'Test SMS failed.' });
      }
    } catch (err: any) {
      setTestSmsStatus({
        type: 'error',
        message: err.response?.data?.detail || 'Error sending test SMS.',
      });
    } finally {
      setSmsLoading(false);
    }
  };

  const handleRefreshHistory = async () => {
    setSmsLoading(true);
    try {
      const h = await getSmsHistory(20);
      setSmsHistory(h);
    } catch (err) {
      console.error('Error refreshing SMS history:', err);
    } finally {
      setSmsLoading(false);
    }
  };

  const formatTime = (iso: string | null) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">{t('systemSettingsTitle')}</h1>
        <p className="text-xs text-slate-400 mt-1">
          {t('systemSettingsSubtitle')}
        </p>
      </div>

      {/* CSV Uploader */}
      <CsvUploader />

      {/* ------------------------------------------------------------------ */}
      {/* SMS Notifications Panel                                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 p-6 shadow-lg space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/50 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{t('smsPanelTitle')}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {t('smsPanelSubtitle')}
              </p>
            </div>
          </div>

          {/* Demo Mode Badge */}
          <div className="hidden sm:flex items-center space-x-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs px-3 py-1.5 rounded-full">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span className="font-semibold">{t('demoModeBadge')}</span>
          </div>
        </div>

        {/* Demo Mode Disclaimer */}
        <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl p-4 flex items-start space-x-3 text-xs text-amber-200">
          <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-300">{t('demoModeDisclaimerTitle')}</p>
            <p className="opacity-90 leading-relaxed">
              {t('demoModeDisclaimerBody')}
            </p>
          </div>
        </div>

        {/* Enable Toggle + Mode */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Enable toggle */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50 flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-white block">{t('enableSmsTitle')}</span>
              <span className="text-xs text-slate-400">{t('enableSmsDesc')}</span>
            </div>
            <button
              onClick={() => setSmsEnabled((v) => !v)}
              className="focus:outline-none shrink-0"
              aria-label="Toggle SMS notifications"
            >
              {smsEnabled ? (
                <ToggleRight className="w-10 h-10 text-emerald-400 transition" />
              ) : (
                <ToggleLeft className="w-10 h-10 text-slate-600 transition" />
              )}
            </button>
          </div>

          {/* SMS Mode */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50 space-y-2">
            <span className="text-sm font-semibold text-white block">{t('smsModeTitle')}</span>
            <div className="flex items-center space-x-3 text-xs">
              <div className="flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-3 py-1.5 rounded-full">
                <Smartphone className="w-3.5 h-3.5" />
                <span className="font-semibold">{t('simulatedSmsActive')}</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-slate-800 border border-slate-700 text-slate-500 px-3 py-1.5 rounded-full">
                <Phone className="w-3.5 h-3.5" />
                <span>{t('realSmsComingSoon')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Phone Number Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold flex items-center space-x-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('farmerPhoneTitle')}</span>
            </label>
            <input
              type="tel"
              placeholder="+1-555-123-4567"
              value={farmerPhone}
              onChange={(e) => setFarmerPhone(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold flex items-center space-x-1.5">
              <Phone className="w-3.5 h-3.5 text-blue-400" />
              <span>{t('vetPhoneTitle')}</span>
            </label>
            <input
              type="tel"
              placeholder="+1-555-987-6543"
              value={vetPhone}
              onChange={(e) => setVetPhone(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
        </div>

        {/* Save Settings Button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSaveSettings}
            disabled={savingSettings}
            className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition disabled:opacity-50 shadow-lg shadow-emerald-500/20"
          >
            {savingSettings ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
            <span>{savingSettings ? t('loadingData') : t('saveSmsSettingsBtn')}</span>
          </button>
          {settingsSaved && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t('settingsSavedBadge')}</span>
            </span>
          )}
        </div>

        {/* Send Test SMS */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50 space-y-3">
          <div className="flex items-center space-x-2 text-sm font-semibold text-white">
            <Send className="w-4 h-4 text-emerald-400" />
            <span>{t('sendTestSmsTitle')}</span>
          </div>
          <p className="text-xs text-slate-400">
            {t('sendTestSmsDesc')}
          </p>
          <div className="flex items-center space-x-2">
            <input
              type="tel"
              placeholder={t('testRecipientPlaceholder')}
              value={testSmsRecipient}
              onChange={(e) => setTestSmsRecipient(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-emerald-500 transition"
            />
            <button
              onClick={handleSendTestSms}
              disabled={smsLoading}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition disabled:opacity-50 shrink-0"
            >
              {smsLoading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>{smsLoading ? t('loadingData') : t('sendTestSmsButtonText')}</span>
            </button>
          </div>

          {testSmsStatus.type && (
            <div
              className={`p-3 rounded-xl text-xs flex items-start space-x-2 ${
                testSmsStatus.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              }`}
            >
              {testSmsStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              )}
              <span>{testSmsStatus.message}</span>
            </div>
          )}
        </div>

        {/* SMS History */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm font-semibold text-white">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>{t('recentSmsHistoryTitle')}</span>
            </div>
            <button
              onClick={handleRefreshHistory}
              disabled={smsLoading}
              className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs text-slate-300 font-semibold transition"
            >
              <RefreshCw className={`w-3 h-3 ${smsLoading ? 'animate-spin' : ''}`} />
              <span>{t('refreshDataBtn')}</span>
            </button>
          </div>

          {smsHistory.length === 0 ? (
            <div className="text-center text-slate-500 text-xs py-8 bg-slate-900/40 rounded-xl border border-slate-700/50">
              {t('noSmsRecordedMsg')}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-700/50">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-700">
                  <tr>
                    <th className="p-3">{t('thAnimalId')}</th>
                    <th className="p-3">{t('recipientLabel')}</th>
                    <th className="p-3">{t('thCategory')}</th>
                    <th className="p-3">{t('statusLabel')}</th>
                    <th className="p-3">{t('modeLabel')}</th>
                    <th className="p-3">{t('sentAtLabel')}</th>
                    <th className="p-3">Message Preview</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {smsHistory.map((sms) => (
                    <tr key={sms.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 font-bold text-white font-mono">{sms.animal_id}</td>
                      <td className="p-3 text-slate-300 font-mono">{sms.recipient}</td>
                      <td className="p-3">
                        {sms.risk_category === 'TEST' ? (
                          <span className="px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 text-[10px] font-bold">TEST</span>
                        ) : (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            sms.risk_category === 'High Risk'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : sms.risk_category === 'Moderate Risk'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-700 text-slate-400'
                          }`}>
                            {sms.risk_category} {sms.risk_score > 0 ? `(${sms.risk_score.toFixed(1)}%)` : ''}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-bold">
                          {sms.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-slate-400">{sms.mode}</span>
                      </td>
                      <td className="p-3 text-slate-400 whitespace-nowrap">{formatTime(sms.sent_at)}</td>
                      <td className="p-3 text-slate-500 max-w-xs truncate" title={sms.message}>
                        {sms.message.slice(0, 80)}…
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Architecture & Model Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 shadow-lg space-y-2">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold">
            <Cpu className="w-5 h-5" />
            <span>{t('primaryModelCardTitle')}</span>
          </div>
          <p className="text-slate-300 font-medium">Random Forest Classifier (scikit-learn)</p>
          <p className="text-slate-400 text-[11px]">
            {t('primaryModelCardDesc')}
          </p>
        </div>

        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 shadow-lg space-y-2">
          <div className="flex items-center space-x-2 text-blue-400 font-bold">
            <Database className="w-5 h-5" />
            <span>{t('persistenceEngineTitle')}</span>
          </div>
          <p className="text-slate-300 font-medium">SQLite Database (`mastitis_ai.db`)</p>
          <p className="text-slate-400 text-[11px]">
            {t('persistenceEngineDesc')}
          </p>
        </div>

        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 shadow-lg space-y-2">
          <div className="flex items-center space-x-2 text-amber-400 font-bold">
            <Award className="w-5 h-5" />
            <span>{t('baselineModelCardTitle')}</span>
          </div>
          <p className="text-slate-300 font-medium">Logistic Regression</p>
          <p className="text-slate-400 text-[11px]">
            {t('baselineModelCardDesc')}
          </p>
        </div>
      </div>
    </div>
  );
};
