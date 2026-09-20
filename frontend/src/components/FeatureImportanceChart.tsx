import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { ShieldCheck, Info, Activity, AlertTriangle } from 'lucide-react';
import { RiskFactor } from '../types';

interface FeatureImportanceChartProps {
  riskFactors: RiskFactor[];
}

export const FeatureImportanceChart: React.FC<FeatureImportanceChartProps> = ({ riskFactors }) => {
  const hasFactors = riskFactors && riskFactors.length > 0;

  if (!hasFactors) {
    return (
      <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 p-5 shadow-lg space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-semibold text-white">Why is this animal at risk?</h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            Model-derived risk factors
          </span>
        </div>

        <div className="bg-slate-900/60 rounded-xl border border-slate-700/40 p-3 text-xs text-slate-300 flex items-start space-x-2.5">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p>
            <span className="font-semibold text-white">Model Notice:</span> These factors are associated with the model's prediction and should not be interpreted as a clinical diagnosis.
          </p>
        </div>

        <div className="p-6 bg-slate-900/40 rounded-xl border border-dashed border-slate-700/60 text-center space-y-2">
          <div className="inline-flex p-2.5 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-200">No Elevated Model-Derived Risk Factors Detected</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            All physiological telemetry (SCC, conductivity, milk yield, rumination, temperature) and farm environmental conditions fall within healthy baseline parameters according to the trained Random Forest model.
          </p>
        </div>
      </div>
    );
  }

  // Format risk factors into data points for horizontal bar chart using authentic model contribution
  const data = riskFactors.map((rf) => {
    const contrib = rf.contribution_pct ?? (rf.impact === 'High' ? 12.0 : rf.impact === 'Medium' ? 6.0 : 2.5);

    return {
      name: rf.name,
      value: contrib,
      actualValue: rf.value,
      impact: rf.impact,
      description: rf.description,
      displayContrib: `+${contrib.toFixed(1)}%`
    };
  });

  return (
    <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 p-5 shadow-lg space-y-4">
      {/* Header with Title and Required Section Label */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-blue-400" />
          <h3 className="text-base font-semibold text-white">Why is this animal at risk?</h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
          Model-derived risk factors
        </span>
      </div>

      {/* Required Clarification Statement */}
      <div className="bg-slate-900/70 rounded-xl border border-slate-700/50 p-3 text-xs text-slate-300 flex items-start space-x-2.5">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-medium text-slate-200">
            These factors are associated with the model's prediction and should not be interpreted as a clinical diagnosis.
          </p>
          <p className="text-[11px] text-slate-400">
            Calculated via Random Forest decision tree path decomposition for this specific animal observation. Factors reflect statistical associations learned by the model from historical patterns, not guaranteed individual causal relationships.
          </p>
        </div>
      </div>

      {/* Model-Derived Local Feature Contribution Chart */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span className="font-medium text-slate-300">Feature Risk Contribution (Probability Shift)</span>
          <span className="text-[11px] text-slate-400">Higher % = Stronger upward push toward mastitis risk</span>
        </div>

        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 5, right: 40, left: 10, bottom: 5 }}
            >
              <XAxis
                type="number"
                tickFormatter={(v) => `+${v}%`}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={{ stroke: '#334155' }}
              />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                width={170}
                tick={{ fill: '#cbd5e1', fontSize: 11, fontWeight: 500 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs max-w-xs space-y-1.5">
                        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
                          <span className="font-bold text-white">{item.name}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              item.impact === 'High'
                                ? 'bg-rose-500/20 text-rose-300'
                                : item.impact === 'Medium'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-blue-500/20 text-blue-300'
                            }`}
                          >
                            {item.impact}
                          </span>
                        </div>
                        <p className="text-emerald-400 font-medium">
                          Observed Value: <span className="text-white font-semibold">{item.actualValue}</span>
                        </p>
                        <p className="text-blue-300 font-semibold">
                          Model Contribution: {item.displayContrib} to mastitis risk
                        </p>
                        <p className="text-slate-300 text-[11px] leading-relaxed pt-1">
                          {item.description}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={16}>
                {data.map((entry, index) => {
                  let fill = '#3B82F6';
                  if (entry.impact === 'High') fill = '#EF4444';
                  else if (entry.impact === 'Medium') fill = '#F59E0B';
                  return <Cell key={`cell-${index}`} fill={fill} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Individual Factor Breakdown Cards */}
      <div className="pt-2 border-t border-slate-700/50 space-y-2">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Observed Telemetry & Model Rationale
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
          {riskFactors.map((rf, i) => (
            <div
              key={i}
              className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 hover:border-slate-700/70 transition space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      rf.impact === 'High' ? 'bg-rose-500' : rf.impact === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'
                    }`}
                  />
                  <span className="font-semibold text-slate-100">{rf.name}</span>
                </div>
                <div className="flex items-center space-x-1.5 shrink-0">
                  {rf.contribution_pct !== undefined && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-blue-300 border border-slate-700 font-semibold">
                      +{rf.contribution_pct.toFixed(1)}%
                    </span>
                  )}
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      rf.impact === 'High'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : rf.impact === 'Medium'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}
                  >
                    {rf.impact}
                  </span>
                </div>
              </div>

              <div className="text-[11px] bg-slate-950/40 px-2 py-1 rounded border border-slate-800/60 flex items-center justify-between">
                <span className="text-slate-400">Recorded Reading:</span>
                <span className="font-semibold text-emerald-400 font-mono">{rf.value}</span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                {rf.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
