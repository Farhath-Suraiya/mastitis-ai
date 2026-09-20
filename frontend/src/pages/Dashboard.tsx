import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Bell,
  Activity,
  TrendingUp,
  ArrowRight,
  RefreshCw,
  Droplet,
  Zap,
  Clock,
  MessageSquare,
  Database,
  HeartPulse,
  Flame,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { HerdSummary, Alert } from '../types';
import { getHerdSummary, getAlerts, getAnalyticsData, getSmsHistory } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';

export const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<HerdSummary | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [smsCount, setSmsCount] = useState(0);
  const [selectedIndicator, setSelectedIndicator] = useState<'all' | 'yield' | 'scc' | 'cond' | 'act' | 'rum'>('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumData, alertData, chartData, smsHist] = await Promise.all([
        getHerdSummary(),
        getAlerts(),
        getAnalyticsData(),
        getSmsHistory(100),
      ]);
      setSummary(sumData);
      setAlerts(alertData);
      setAnalytics(chartData);
      setSmsCount(smsHist.filter(s => s.status === 'SENT_SIMULATED' && s.animal_id !== 'TEST').length);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
        <span className="text-sm font-medium text-slate-400">Loading Herd Health Platform...</span>
      </div>
    );
  }

  const atRiskCount = (summary?.moderate_risk_count || 0) + (summary?.high_risk_count || 0);
  const unreviewedAlerts = alerts.filter(a => !a.is_reviewed).length;
  const totalMonitored = summary?.animals_monitored || summary?.total_animals || 500;

  // Pie chart risk distribution data
  const riskDistData = analytics?.risk_distribution || [
    { name: 'No Risk', count: summary?.no_risk_count || 0, color: '#10B981' },
    { name: 'Low Risk', count: summary?.low_risk_count || 0, color: '#3B82F6' },
    { name: 'Moderate Risk', count: summary?.moderate_risk_count || 0, color: '#F59E0B' },
    { name: 'High Risk', count: summary?.high_risk_count || 0, color: '#EF4444' },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* ------------------------------------------------------------------- */}
      {/* 7. Synthetic Data Indicator Banner                                 */}
      {/* ------------------------------------------------------------------- */}
      <div className="bg-gradient-to-r from-amber-500/15 via-slate-800/80 to-slate-800/80 border border-amber-500/30 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Prototype using synthetic data
              </span>
              <span className="text-[11px] text-slate-400">Research & Demonstration Model</span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              This system forecasts bovine mastitis risk within a <strong>7–14 day window</strong> using trained machine learning models on synthetic telemetry. It does <strong>not</strong> claim clinical diagnostic validation and is built for operational decision support.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
          <div className="flex items-center space-x-1.5 bg-slate-900/80 border border-slate-700 text-slate-400 text-[11px] px-3 py-1.5 rounded-full">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-semibold text-slate-300">Forecast Horizon: 7–14 days</span>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition"
            title="Refresh dashboard data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 1. Herd Overview Section                                            */}
      {/* ------------------------------------------------------------------- */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span>1. Herd Overview</span>
          </h2>
          <span className="text-xs text-slate-400">All monitored animals on record</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Total Animals */}
          <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 p-4 shadow-sm flex flex-col justify-between">
            <span className="text-[11px] font-medium text-slate-400 block">Total Animals</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-white">{summary?.total_animals.toLocaleString()}</span>
              <Users className="w-4 h-4 text-blue-400 opacity-60" />
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">Full registered herd</span>
          </div>

          {/* Animals Under Monitoring */}
          <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 p-4 shadow-sm flex flex-col justify-between">
            <span className="text-[11px] font-medium text-slate-400 block">Under Monitoring</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-cyan-400">{totalMonitored.toLocaleString()}</span>
              <Activity className="w-4 h-4 text-cyan-400 opacity-60" />
            </div>
            <span className="text-[10px] text-cyan-400/80 mt-1 block">Active sensor telemetry</span>
          </div>

          {/* High Risk */}
          <div className="bg-slate-800/80 rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4 shadow-sm flex flex-col justify-between">
            <span className="text-[11px] font-medium text-rose-300 block">High Risk</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-rose-400">{summary?.high_risk_count}</span>
              <ShieldAlert className="w-4 h-4 text-rose-400 opacity-80" />
            </div>
            <span className="text-[10px] text-rose-300/80 mt-1 block">&gt; 60% mastitis risk</span>
          </div>

          {/* Moderate Risk */}
          <div className="bg-slate-800/80 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 shadow-sm flex flex-col justify-between">
            <span className="text-[11px] font-medium text-amber-300 block">Moderate Risk</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-amber-400">{summary?.moderate_risk_count}</span>
              <AlertTriangle className="w-4 h-4 text-amber-400 opacity-80" />
            </div>
            <span className="text-[10px] text-amber-300/80 mt-1 block">40% – 60% mastitis risk</span>
          </div>

          {/* Low Risk */}
          <div className="bg-slate-800/80 rounded-2xl border border-blue-500/30 bg-blue-500/5 p-4 shadow-sm flex flex-col justify-between">
            <span className="text-[11px] font-medium text-blue-300 block">Low Risk</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-blue-400">{summary?.low_risk_count}</span>
              <ShieldCheck className="w-4 h-4 text-blue-400 opacity-80" />
            </div>
            <span className="text-[10px] text-blue-300/80 mt-1 block">20% – 40% mastitis risk</span>
          </div>

          {/* No Risk */}
          <div className="bg-slate-800/80 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 shadow-sm flex flex-col justify-between">
            <span className="text-[11px] font-medium text-emerald-300 block">No Risk</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-emerald-400">{summary?.no_risk_count}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 opacity-80" />
            </div>
            <span className="text-[10px] text-emerald-300/80 mt-1 block">&le; 20% healthy baseline</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 2. Early Warning Section                                           */}
      {/* ------------------------------------------------------------------- */}
      <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-700/50 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">2. Early Warning Status</h2>
              <p className="text-xs text-slate-400">
                Proactive indicators identifying potential mastitis onset prior to clinical signs
              </p>
            </div>
          </div>
          <div className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 self-start sm:self-center">
            Forecasting Window: <span className="text-emerald-400">7–14 days</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* High-Risk Animals */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-rose-500/30 flex items-start space-x-3.5">
            <div className="p-3 rounded-lg bg-rose-500/15 text-rose-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium block">High-Risk Animals</span>
              <span className="text-2xl font-black text-rose-400 block mt-0.5">{summary?.high_risk_count}</span>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Immediate clinical review recommended for milking anomalies
              </p>
            </div>
          </div>

          {/* Potential Mastitis Risk within 7-14 Days */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-amber-500/30 flex items-start space-x-3.5">
            <div className="p-3 rounded-lg bg-amber-500/15 text-amber-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium block">Risk within 7–14 Days</span>
              <span className="text-2xl font-black text-amber-400 block mt-0.5">{atRiskCount}</span>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Moderate + High risk cows flagged for pre-emptive care
              </p>
            </div>
          </div>

          {/* Active Alerts */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-purple-500/30 flex items-start space-x-3.5">
            <div className="p-3 rounded-lg bg-purple-500/15 text-purple-400 shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium block">Active Early Alerts</span>
              <span className="text-2xl font-black text-purple-300 block mt-0.5">{unreviewedAlerts}</span>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Unreviewed system alerts requiring herd health inspection
              </p>
            </div>
          </div>

          {/* SMS Alerts Sent */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-emerald-500/30 flex items-start space-x-3.5">
            <div className="p-3 rounded-lg bg-emerald-500/15 text-emerald-400 shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium block">SMS Alerts Sent</span>
              <span className="text-2xl font-black text-emerald-400 block mt-0.5">{smsCount}</span>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Early-warning SMS dispatches logged to farmer/veterinarian
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 3. Herd Risk Distribution Section & Overview Chart                  */}
      {/* ------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Chart */}
        <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>3. Herd Risk Distribution</span>
              </h3>
              <span className="text-[11px] font-semibold text-slate-400">Total: {summary?.total_animals}</span>
            </div>
            <p className="text-xs text-slate-400">Forecasted mastitis risk category breakdown</p>
          </div>

          <div className="h-56 w-full my-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={82}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {riskDistData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      const pct = summary?.total_animals ? ((item.count / summary.total_animals) * 100).toFixed(1) : '0';
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-xs font-semibold text-white shadow-xl">
                          <p style={{ color: item.color }} className="font-bold">{item.name}</p>
                          <p className="text-slate-300 mt-0.5">{item.count} cows ({pct}%)</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-700/50">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-emerald-500/20">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-emerald-300 font-medium">No Risk</span>
              </div>
              <span className="font-bold text-white">{summary?.no_risk_count}</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-blue-500/20">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-blue-300 font-medium">Low Risk</span>
              </div>
              <span className="font-bold text-white">{summary?.low_risk_count}</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-amber-500/20">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-amber-300 font-medium">Moderate</span>
              </div>
              <span className="font-bold text-white">{summary?.moderate_risk_count}</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-rose-500/20">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-rose-300 font-medium">High Risk</span>
              </div>
              <span className="font-bold text-white">{summary?.high_risk_count}</span>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* 4. Milk and Health Indicators Overview Panel                      */}
        {/* ----------------------------------------------------------------- */}
        <div className="lg:col-span-2 bg-slate-800/80 rounded-2xl border border-slate-700/60 p-5 shadow-lg flex flex-col justify-between space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-700/50 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <HeartPulse className="w-4 h-4 text-cyan-400" />
                <span>4. Milk and Health Indicators</span>
              </h3>
              <p className="text-xs text-slate-400">Herd-wide averages across 5 key physiological sensors</p>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-1 text-xs">
              <button
                onClick={() => setSelectedIndicator('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  selectedIndicator === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                All 5
              </button>
              <button
                onClick={() => setSelectedIndicator('yield')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  selectedIndicator === 'yield' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                Yield
              </button>
              <button
                onClick={() => setSelectedIndicator('scc')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  selectedIndicator === 'scc' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                SCC
              </button>
              <button
                onClick={() => setSelectedIndicator('cond')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  selectedIndicator === 'cond' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                Conductivity
              </button>
              <button
                onClick={() => setSelectedIndicator('act')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  selectedIndicator === 'act' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                Activity
              </button>
              <button
                onClick={() => setSelectedIndicator('rum')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  selectedIndicator === 'rum' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                Rumination
              </button>
            </div>
          </div>

          {/* 5 Indicator Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            {/* Avg Milk Yield */}
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50">
              <div className="flex items-center space-x-1.5 text-blue-400 font-semibold mb-1">
                <Droplet className="w-3.5 h-3.5" />
                <span>Milk Yield</span>
              </div>
              <span className="text-lg font-black text-white">{summary?.average_milk_yield} L/day</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Normal: &gt; 15 L</span>
            </div>

            {/* Avg SCC */}
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold mb-1">
                <Activity className="w-3.5 h-3.5" />
                <span>Avg SCC</span>
              </div>
              <span className="text-lg font-black text-white">{Math.round(summary?.average_scc || 0).toLocaleString()}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">cells/ml</span>
            </div>

            {/* Avg Conductivity */}
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50">
              <div className="flex items-center space-x-1.5 text-amber-400 font-semibold mb-1">
                <Zap className="w-3.5 h-3.5" />
                <span>Conductivity</span>
              </div>
              <span className="text-lg font-black text-white">{summary?.average_conductivity} mS/cm</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Normal: &lt; 5.5</span>
            </div>

            {/* Avg Activity */}
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50">
              <div className="flex items-center space-x-1.5 text-purple-400 font-semibold mb-1">
                <Activity className="w-3.5 h-3.5" />
                <span>Activity</span>
              </div>
              <span className="text-lg font-black text-white">{summary?.average_activity}%</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Baseline: 70–95%</span>
            </div>

            {/* Avg Rumination */}
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50 col-span-2 sm:col-span-1">
              <div className="flex items-center space-x-1.5 text-cyan-400 font-semibold mb-1">
                <HeartPulse className="w-3.5 h-3.5" />
                <span>Rumination</span>
              </div>
              <span className="text-lg font-black text-white">{Math.round(summary?.average_rumination || 0)} min</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Normal: &gt; 420 min</span>
            </div>
          </div>

          {/* Primary Trend Chart based on selected indicator */}
          <div className="h-44 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              {selectedIndicator === 'scc' ? (
                <LineChart data={analytics?.scc_trend || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} domain={['auto', 'auto']} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="avg_scc" name="SCC (cells/ml)" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              ) : selectedIndicator === 'cond' ? (
                <LineChart data={analytics?.conductivity_trend || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} domain={[4.8, 6.2]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="avg_conductivity" name="Conductivity (mS/cm)" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              ) : selectedIndicator === 'act' ? (
                <LineChart data={analytics?.activity_trend || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} domain={[65, 95]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="avg_activity" name="Activity (%)" stroke="#A855F7" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              ) : selectedIndicator === 'rum' ? (
                <LineChart data={analytics?.rumination_trend || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} domain={[380, 540]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="avg_rumination" name="Rumination (min/day)" stroke="#06B6D4" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              ) : (
                // 'all' or 'yield' default
                <LineChart data={analytics?.milk_yield_trend || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} domain={[10, 16]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="avg_yield" name="Milk Yield (L/day)" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 5. High-Risk Animal Table                                           */}
      {/* ------------------------------------------------------------------- */}
      <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 p-5 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>5. High-Risk Animal Table</span>
            </h3>
            <p className="text-xs text-slate-400">
              Animals flagged with elevated probability within the 7–14 day forecast window
            </p>
          </div>
          <Link
            to="/animals"
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center space-x-1"
          >
            <span>View All Animals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-700/50">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-700">
              <tr>
                <th className="p-3">Animal ID</th>
                <th className="p-3">Farm</th>
                <th className="p-3">Breed</th>
                <th className="p-3">Milk Yield</th>
                <th className="p-3">SCC</th>
                <th className="p-3">Risk Score</th>
                <th className="p-3">Risk Category</th>
                <th className="p-3">Forecast Window</th>
                <th className="p-3">Alert Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {summary?.high_risk_animals && summary.high_risk_animals.length > 0 ? (
                summary.high_risk_animals.slice(0, 8).map((anim) => (
                  <tr key={anim.animal_id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-bold text-white font-mono">{anim.animal_id}</td>
                    <td className="p-3 text-slate-400">{anim.farm_id}</td>
                    <td className="p-3 text-slate-300">{anim.breed}</td>
                    <td className="p-3">{anim.milk_yield_l_day} L/day</td>
                    <td className="p-3 font-semibold text-emerald-400">{anim.scc_cells_ml.toLocaleString()}</td>
                    <td className="p-3">
                      <span className="font-extrabold text-rose-400">{anim.risk_score}%</span>
                    </td>
                    <td className="p-3">
                      <RiskBadge category={anim.risk_category} />
                    </td>
                    <td className="p-3">
                      <span className="text-[11px] font-medium text-slate-300 px-2 py-0.5 rounded bg-slate-900 border border-slate-700">
                        {anim.forecast_window || '7–14 days'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          anim.alert_status === 'SMS Sent'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : anim.alert_status === 'Active Alert'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}
                      >
                        {anim.alert_status || 'Monitoring'}
                      </span>
                    </td>
                    <td className="p-3">
                      <Link
                        to={`/animals/${anim.animal_id}`}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 font-semibold transition"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="p-6 text-center text-slate-500">
                    No high-risk animals flagged in the current forecast window.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 6. Recent Alerts Section                                            */}
      {/* ------------------------------------------------------------------- */}
      <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Bell className="w-4 h-4 text-purple-400" />
              <span>6. Recent Alerts</span>
            </h3>
            <p className="text-xs text-slate-400">
              Live alert notifications, automated risk triggers, and SMS dispatch status
            </p>
          </div>
          <Link
            to="/alerts"
            className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center space-x-1"
          >
            <span>Manage All Alerts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-700/50">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-700">
              <tr>
                <th className="p-3">Animal</th>
                <th className="p-3">Risk Level</th>
                <th className="p-3">Time</th>
                <th className="p-3">Alert Type</th>
                <th className="p-3">SMS Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {alerts && alerts.length > 0 ? (
                alerts.slice(0, 6).map((a) => {
                  const formattedTime = a.created_at
                    ? new Date(a.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Recent';

                  return (
                    <tr key={a.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3">
                        <Link
                          to={`/animals/${a.animal_id}`}
                          className="font-bold text-white font-mono hover:text-emerald-400 transition"
                        >
                          {a.animal_id}
                        </Link>
                        <span className="text-[10px] text-slate-500 block">{a.farm_id}</span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`font-bold ${
                            a.severity === 'HIGH'
                              ? 'text-rose-400'
                              : a.severity === 'MODERATE'
                              ? 'text-amber-400'
                              : 'text-blue-400'
                          }`}
                        >
                          {a.risk_score ? `${a.risk_score}%` : a.severity}
                        </span>
                        <span className="text-[10px] text-slate-400 block">{a.risk_category || a.severity}</span>
                      </td>
                      <td className="p-3 text-slate-400 whitespace-nowrap">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{formattedTime}</span>
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 border border-slate-700 text-slate-200">
                          {a.alert_type}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center space-x-1 w-fit ${
                            a.sms_status === 'Sent (Simulated)' || a.sms_status === 'SENT_SIMULATED'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          <MessageSquare className="w-2.5 h-2.5" />
                          <span>{a.sms_status || 'Not Dispatched'}</span>
                        </span>
                      </td>
                      <td className="p-3">
                        <Link
                          to={`/animals/${a.animal_id}`}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold transition"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500">
                    No active alerts on record.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
