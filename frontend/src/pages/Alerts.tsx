import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCircle2, AlertTriangle, ShieldAlert, Eye, RefreshCw, Filter, MessageSquare } from 'lucide-react';
import { Alert, SMSNotification } from '../types';
import { getAlerts, markAlertAsReviewed, getSmsHistory, getSmsSettings, sendSmsForAnimal } from '../services/api';

export const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('UNREVIEWED');
  const [smsHistory, setSmsHistory] = useState<SMSNotification[]>([]);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [smsSending, setSmsSending] = useState<number | null>(null);
  const [smsSentIds, setSmsSentIds] = useState<Record<string, boolean>>({});

  const fetchAlertsData = async () => {
    setLoading(true);
    try {
      const [data, smsHist, smsCfg] = await Promise.all([
        getAlerts(),
        getSmsHistory(100),
        getSmsSettings(),
      ]);
      setAlerts(data);
      setSmsHistory(smsHist);
      setSmsEnabled(smsCfg.enabled);
      // Build a map of animal_ids that have had SMS sent
      const sentMap: Record<string, boolean> = {};
      smsHist.forEach((s) => {
        if (s.status === 'SENT_SIMULATED' && s.animal_id !== 'TEST') {
          sentMap[s.animal_id] = true;
        }
      });
      setSmsSentIds(sentMap);
    } catch (err) {
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertsData();
  }, []);

  const handleMarkReviewed = async (id: number) => {
    try {
      await markAlertAsReviewed(id);
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_reviewed: true } : a))
      );
    } catch (err) {
      console.error('Error marking alert reviewed:', err);
    }
  };

  const handleDispatchSms = async (alert: Alert) => {
    setSmsSending(alert.id);
    try {
      // Get the configured SMS settings to pick a recipient
      const cfg = await getSmsSettings();
      const recipient = cfg.farmer_phone || cfg.vet_phone || '+00-000-PLACEHOLDER';
      await sendSmsForAnimal(alert.animal_id, recipient);
      setSmsSentIds((prev) => ({ ...prev, [alert.animal_id]: true }));
      // Refresh SMS history
      const h = await getSmsHistory(100);
      setSmsHistory(h);
    } catch (err) {
      console.error('Error dispatching SMS:', err);
    } finally {
      setSmsSending(null);
    }
  };

  const getSmsForAnimal = (animal_id: string): SMSNotification | undefined =>
    smsHistory.find((s) => s.animal_id === animal_id && s.status === 'SENT_SIMULATED' && s.animal_id !== 'TEST');

  const filteredAlerts = alerts.filter((a) => {
    if (statusFilter === 'UNREVIEWED' && a.is_reviewed) return false;
    if (statusFilter === 'REVIEWED' && !a.is_reviewed) return false;
    if (severityFilter !== 'ALL' && a.severity.toUpperCase() !== severityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Active Early Warning Alerts</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time notifications generated when an animal's predicted mastitis risk exceeds threshold limits
          </p>
        </div>

        <button
          onClick={fetchAlertsData}
          className="self-start sm:self-auto flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Alerts</span>
        </button>
      </div>

      {/* Filter Options */}
      <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 p-4 shadow-lg flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-slate-400 font-medium">
            <Filter className="w-4 h-4" />
            <span>Filter Status:</span>
          </div>
          <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setStatusFilter('UNREVIEWED')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                statusFilter === 'UNREVIEWED' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Active / Unreviewed
            </button>
            <button
              onClick={() => setStatusFilter('REVIEWED')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                statusFilter === 'REVIEWED' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Reviewed
            </button>
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                statusFilter === 'ALL' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Alerts
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-400">Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-slate-200 text-xs focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="HIGH">High Severity</option>
            <option value="MODERATE">Moderate Severity</option>
            <option value="LOW">Low Severity</option>
          </select>
        </div>
      </div>

      {/* Alerts Grid / Cards */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-slate-400 bg-slate-800/50 rounded-2xl border border-slate-700">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
            Checking alert system records...
          </div>
        ) : filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-5 rounded-2xl border transition shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
                alert.severity === 'HIGH'
                  ? 'bg-rose-950/20 border-rose-500/30'
                  : alert.severity === 'MODERATE'
                  ? 'bg-amber-950/20 border-amber-500/30'
                  : 'bg-slate-800/80 border-slate-700'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div
                  className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                    alert.severity === 'HIGH'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  <ShieldAlert className="w-5 h-5" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-white text-sm">{alert.title}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        alert.severity === 'HIGH'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {alert.alert_type}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{alert.message}</p>

                  {alert.main_indicators && alert.main_indicators.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {alert.main_indicators.map((ind, i) => (
                        <span key={i} className="text-[10px] bg-slate-900/80 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                          {ind}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 sm:self-center shrink-0">
                <Link
                  to={`/animals/${alert.animal_id}`}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1 transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect</span>
                </Link>

                {/* SMS Alert Badge / Dispatch Button */}
                {alert.severity === 'HIGH' && (() => {
                  const sentSms = getSmsForAnimal(alert.animal_id);
                  if (sentSms) {
                    return (
                      <div className="flex flex-col items-end">
                        <span className="flex items-center space-x-1 text-[10px] px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold">
                          <MessageSquare className="w-3 h-3" />
                          <span>SMS Alert Sent</span>
                        </span>
                        <span className="text-[10px] text-slate-500 mt-0.5">
                          → {sentSms.recipient} · {sentSms.sent_at ? new Date(sentSms.sent_at).toLocaleTimeString() : ''}
                        </span>
                      </div>
                    );
                  }
                  return (
                    <button
                      onClick={() => handleDispatchSms(alert)}
                      disabled={smsSending === alert.id}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition disabled:opacity-50"
                    >
                      {smsSending === alert.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <MessageSquare className="w-3.5 h-3.5" />
                      )}
                      <span>{smsSending === alert.id ? 'Sending…' : 'Dispatch SMS'}</span>
                    </button>
                  );
                })()}

                {!alert.is_reviewed ? (
                  <button
                    onClick={() => handleMarkReviewed(alert.id)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1 transition"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Reviewed</span>
                  </button>
                ) : (
                  <span className="text-xs text-slate-500 font-semibold px-3 py-1 bg-slate-900/60 rounded-xl border border-slate-800">
                    Reviewed
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-slate-500 bg-slate-800/50 rounded-2xl border border-slate-700">
            No alerts found matching the current filter criteria.
          </div>
        )}
      </div>
    </div>
  );
};
