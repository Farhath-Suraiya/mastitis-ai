import React, { useEffect, useState } from 'react';
import {
  RefreshCw,
  Award
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ScatterChart,
  Scatter
} from 'recharts';
import { ModelMetrics, HerdSummary } from '../types';
import { getAnalyticsData, getModelMetrics, getHerdSummary } from '../services/api';
import { useLanguage } from '../i18n/LanguageContext';

export const HerdAnalytics: React.FC = () => {
  const { t } = useLanguage();
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [summary, setSummary] = useState<HerdSummary | null>(null);
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [chartData, sumData, metricData] = await Promise.all([
        getAnalyticsData(),
        getHerdSummary(),
        getModelMetrics()
      ]);
      setAnalytics(chartData);
      setSummary(sumData);
      setMetrics(metricData);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
        <span className="text-sm font-medium text-slate-400">{t('loadingData')}</span>
      </div>
    );
  }

  const highRiskPct = summary ? ((summary.high_risk_count / summary.total_animals) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">{t('analyticsHeader')}</h1>
          <p className="text-xs text-slate-400 mt-1">
            {t('analyticsSub')}
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="self-start sm:self-auto flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{t('refreshAnalyticsBtn')}</span>
        </button>
      </div>

      {/* Aggregate Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
        <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60 shadow-md">
          <span className="text-slate-400 block">{t('totalHerdSize')}</span>
          <span className="text-xl font-black text-white">{summary?.total_animals}</span>
        </div>
        <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60 shadow-md">
          <span className="text-slate-400 block">{t('avgSccCard')}</span>
          <span className="text-xl font-black text-emerald-400">{summary?.average_scc.toLocaleString()}</span>
        </div>
        <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60 shadow-md">
          <span className="text-slate-400 block">{t('avgYieldCard')}</span>
          <span className="text-xl font-black text-blue-400">{summary?.average_milk_yield} L</span>
        </div>
        <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60 shadow-md">
          <span className="text-slate-400 block">{t('avgConductivityCard')}</span>
          <span className="text-xl font-black text-teal-300">{summary?.average_conductivity} mS/cm</span>
        </div>
        <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60 shadow-md">
          <span className="text-slate-400 block">{t('highRiskRatioCard')}</span>
          <span className="text-xl font-black text-rose-400">{highRiskPct}%</span>
        </div>
        <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60 shadow-md">
          <span className="text-slate-400 block">{t('avgRuminationCard')}</span>
          <span className="text-xl font-black text-amber-300">{summary?.average_rumination} min</span>
        </div>
      </div>

      {/* Section 1: Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Concentration by Farm */}
        <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 p-5 shadow-lg">
          <h3 className="text-sm font-semibold text-white mb-1">{t('riskByFarmTitle')}</h3>
          <p className="text-xs text-slate-400 mb-3">{t('riskByFarmDesc')}</p>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.risk_by_farm || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="farm" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="high_risk" fill="#EF4444" radius={[6, 6, 0, 0]} name={t('highRisk')} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Concentration by Breed */}
        <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 p-5 shadow-lg">
          <h3 className="text-sm font-semibold text-white mb-1">{t('riskByBreedTitle')}</h3>
          <p className="text-xs text-slate-400 mb-3">{t('riskByBreedDesc')}</p>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.risk_by_breed || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="breed" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="high_risk" fill="#F59E0B" radius={[6, 6, 0, 0]} name={t('highRisk')} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Scatter Chart: SCC vs AI Risk Score */}
        <div className="lg:col-span-2 bg-slate-800/80 rounded-2xl border border-slate-700/60 p-5 shadow-lg">
          <h3 className="text-sm font-semibold text-white mb-1">{t('sccVsRiskTitle')}</h3>
          <p className="text-xs text-slate-400 mb-3">{t('sccVsRiskDesc')}</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" dataKey="scc" name="SCC" unit=" cells" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis type="number" dataKey="risk_score" name={t('riskScore')} unit="%" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Scatter name={t('animalsLabel')} data={analytics?.scc_vs_risk || []} fill="#10B981" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Section 2: Machine Learning Model Benchmark Metrics */}
      {metrics && (
        <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 p-6 shadow-lg space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{t('mlBenchmarkingTitle')}</h3>
              <p className="text-xs text-slate-400">
                {t('mlBenchmarkingDesc')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Primary Model: Random Forest Classifier */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-emerald-500/30 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-bold text-white text-sm">{t('primaryModelTitle')}</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {t('selectedModelBadge')}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/40">
                  <span className="text-slate-400 block">{t('accuracyLabel')}</span>
                  <span className="text-base font-bold text-emerald-400">
                    {(metrics.random_forest.accuracy * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/40">
                  <span className="text-slate-400 block">{t('rocAucLabel')}</span>
                  <span className="text-base font-bold text-emerald-400">
                    {metrics.random_forest.roc_auc.toFixed(3)}
                  </span>
                </div>
                <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/40">
                  <span className="text-slate-400 block">{t('f1ScoreLabel')}</span>
                  <span className="text-base font-bold text-emerald-400">
                    {metrics.random_forest.f1_score.toFixed(3)}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-300 space-y-1">
                <p>{t('precisionLabel')}: <strong>{(metrics.random_forest.precision * 100).toFixed(1)}%</strong></p>
                <p>{t('recallLabel')}: <strong>{(metrics.random_forest.recall * 100).toFixed(1)}%</strong></p>
              </div>
            </div>

            {/* Baseline Model: Logistic Regression */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-700 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-bold text-white text-sm">{t('baselineModelTitle')}</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  {t('baselineBadge')}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/40">
                  <span className="text-slate-400 block">{t('accuracyLabel')}</span>
                  <span className="text-base font-bold text-slate-200">
                    {(metrics.logistic_regression.accuracy * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/40">
                  <span className="text-slate-400 block">{t('rocAucLabel')}</span>
                  <span className="text-base font-bold text-slate-200">
                    {metrics.logistic_regression.roc_auc.toFixed(3)}
                  </span>
                </div>
                <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/40">
                  <span className="text-slate-400 block">{t('f1ScoreLabel')}</span>
                  <span className="text-base font-bold text-slate-200">
                    {metrics.logistic_regression.f1_score.toFixed(3)}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-300 space-y-1">
                <p>{t('precisionLabel')}: <strong>{(metrics.logistic_regression.precision * 100).toFixed(1)}%</strong></p>
                <p>{t('recallLabel')}: <strong>{(metrics.logistic_regression.recall * 100).toFixed(1)}%</strong></p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
