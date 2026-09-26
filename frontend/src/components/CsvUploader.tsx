import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertTriangle, Table } from 'lucide-react';
import { uploadCsvData } from '../services/api';
import { useLanguage } from '../i18n/LanguageContext';

export const CsvUploader: React.FC = () => {
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<any | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const res = await uploadCsvData(file);
      setUploadResult(res);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error validating CSV file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 p-6 shadow-lg space-y-5">
      <div>
        <h3 className="text-base font-semibold text-white">{t('csvUploadTitle')}</h3>
        <p className="text-xs text-slate-400">
          Upload farm telemetry or historical health records for structural validation and preview.
        </p>
      </div>

      <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-2xl p-6 text-center transition bg-slate-900/40">
        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-200">
          {file ? file.name : t('dragDropCsv')}
        </p>
        <p className="text-xs text-slate-500 mt-1">Supports standard bovine mastitis CSV structure</p>

        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
          id="csv-file-input"
        />

        <div className="mt-4 flex items-center justify-center space-x-3">
          <label
            htmlFor="csv-file-input"
            className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold cursor-pointer transition"
          >
            Browse CSV
          </label>
          {file && (
            <button
              onClick={handleUpload}
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition disabled:opacity-50"
            >
              {loading ? 'Validating...' : 'Validate CSV'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start space-x-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Validation Failed</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {uploadResult && (
        <div className="space-y-4 pt-2">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-semibold">CSV File Validated Successfully!</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
              <span className="text-slate-400 block">Total Rows</span>
              <span className="text-lg font-bold text-white">{uploadResult.total_rows.toLocaleString()}</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
              <span className="text-slate-400 block">Total Columns</span>
              <span className="text-lg font-bold text-white">{uploadResult.total_columns}</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
              <span className="text-slate-400 block">Unique Animals</span>
              <span className="text-lg font-bold text-emerald-400">{uploadResult.unique_animals}</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
              <span className="text-slate-400 block">Unique Farms</span>
              <span className="text-lg font-bold text-teal-400">{uploadResult.unique_farms}</span>
            </div>
          </div>

          {/* Missing Values breakdown */}
          {Object.keys(uploadResult.detected_missing_values).length > 0 && (
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/50 text-xs">
              <span className="font-semibold text-amber-400 block mb-1.5">Detected Missing Values (Imputed automatically):</span>
              <div className="flex flex-wrap gap-2">
                {Object.entries(uploadResult.detected_missing_values).map(([col, count]: any) => (
                  <span key={col} className="bg-slate-800 border border-slate-700 px-2 py-1 rounded text-slate-300">
                    {col}: <strong className="text-amber-300">{count}</strong>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Data Preview Table */}
          {uploadResult.preview && uploadResult.preview.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center space-x-1">
                <Table className="w-3.5 h-3.5" />
                <span>Data Preview (First 5 Rows)</span>
              </h4>
              <div className="overflow-x-auto rounded-xl border border-slate-700/60">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-700">
                    <tr>
                      <th className="p-2.5">Animal ID</th>
                      <th className="p-2.5">Farm</th>
                      <th className="p-2.5">Breed</th>
                      <th className="p-2.5">SCC</th>
                      <th className="p-2.5">Milk Yield</th>
                      <th className="p-2.5">Conductivity</th>
                      <th className="p-2.5">Rumination</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {uploadResult.preview.slice(0, 5).map((row: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-800/40 font-mono text-[11px]">
                        <td className="p-2.5 font-bold text-white">{row.animal_id}</td>
                        <td className="p-2.5 text-slate-400">{row.farm_id}</td>
                        <td className="p-2.5 text-slate-300">{row.breed}</td>
                        <td className="p-2.5 text-emerald-400">{row.scc_cells_ml}</td>
                        <td className="p-2.5">{row.milk_yield_l_day} L</td>
                        <td className="p-2.5">{row.milk_conductivity_ms_cm || 'N/A'}</td>
                        <td className="p-2.5">{row.rumination_min_day || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
