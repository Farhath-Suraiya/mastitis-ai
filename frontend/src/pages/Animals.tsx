import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, RefreshCw, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Animal } from '../types';
import { getAnimals } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';

export const Animals: React.FC = () => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [farmId, setFarmId] = useState('All');
  const [breed, setBreed] = useState('All');
  const [riskCategory, setRiskCategory] = useState('All');
  const [prevMastitis, setPrevMastitis] = useState<string>('All');
  const [sensorStatus, setSensorStatus] = useState('All');

  const fetchAnimalsData = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit,
        search: search || undefined,
        farm_id: farmId !== 'All' ? farmId : undefined,
        breed: breed !== 'All' ? breed : undefined,
        risk_category: riskCategory !== 'All' ? riskCategory : undefined,
        previous_mastitis: prevMastitis !== 'All' ? Number(prevMastitis) : undefined,
        sensor_status: sensorStatus !== 'All' ? sensorStatus : undefined,
      };
      const res = await getAnimals(params);
      setAnimals(res.animals);
      setTotal(res.total);
    } catch (err) {
      console.error('Error fetching animals list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnimalsData();
  }, [page, search, farmId, breed, riskCategory, prevMastitis, sensorStatus]);

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Animal Directory</h1>
          <p className="text-xs text-slate-400 mt-1">
            Search, filter, and inspect individual animal health telemetry and AI risk forecasts
          </p>
        </div>

        <button
          onClick={fetchAnimalsData}
          className="self-start sm:self-auto flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload Table</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 p-4 shadow-lg space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
          {/* Search Box */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Animal ID, Farm, Breed..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Farm Filter */}
          <div>
            <label className="text-slate-400 font-medium block mb-1">Farm</label>
            <select
              value={farmId}
              onChange={(e) => {
                setFarmId(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Farms</option>
              <option value="FARM-001">FARM-001</option>
              <option value="FARM-002">FARM-002</option>
              <option value="FARM-003">FARM-003</option>
              <option value="FARM-004">FARM-004</option>
              <option value="FARM-005">FARM-005</option>
            </select>
          </div>

          {/* Breed Filter */}
          <div>
            <label className="text-slate-400 font-medium block mb-1">Breed</label>
            <select
              value={breed}
              onChange={(e) => {
                setBreed(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Breeds</option>
              <option value="Holstein Friesian">Holstein Friesian</option>
              <option value="Jersey">Jersey</option>
              <option value="Crossbreed">Crossbreed</option>
              <option value="Sahiwal">Sahiwal</option>
              <option value="Gir">Gir</option>
            </select>
          </div>

          {/* Risk Category Filter */}
          <div>
            <label className="text-slate-400 font-medium block mb-1">Risk Category</label>
            <select
              value={riskCategory}
              onChange={(e) => {
                setRiskCategory(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Risk Levels</option>
              <option value="No Risk">No Risk</option>
              <option value="Low Risk">Low Risk</option>
              <option value="Moderate Risk">Moderate Risk</option>
              <option value="High Risk">High Risk</option>
            </select>
          </div>

          {/* Previous Mastitis Filter */}
          <div>
            <label className="text-slate-400 font-medium block mb-1">Past Mastitis</label>
            <select
              value={prevMastitis}
              onChange={(e) => {
                setPrevMastitis(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All</option>
              <option value="1">Yes (History)</option>
              <option value="0">No (Clean)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Animals Table */}
      <div className="bg-slate-800/80 rounded-2xl border border-slate-700/60 p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Showing <strong>{animals.length}</strong> of <strong>{total}</strong> animals</span>
          <span>Page {page} of {totalPages}</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-700/50">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-700">
              <tr>
                <th className="p-3">Animal ID</th>
                <th className="p-3">Farm</th>
                <th className="p-3">Breed</th>
                <th className="p-3">Age</th>
                <th className="p-3">Lactation</th>
                <th className="p-3">Yield</th>
                <th className="p-3">SCC (cells/ml)</th>
                <th className="p-3">Activity</th>
                <th className="p-3">Rumination</th>
                <th className="p-3">Risk Score</th>
                <th className="p-3">Category</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={12} className="p-8 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
                    Fetching animal telemetry...
                  </td>
                </tr>
              ) : animals.length > 0 ? (
                animals.map((a) => (
                  <tr key={a.animal_id} className="hover:bg-slate-800/50 transition">
                    <td className="p-3 font-bold text-white font-mono">{a.animal_id}</td>
                    <td className="p-3 text-slate-400">{a.farm_id}</td>
                    <td className="p-3 text-slate-300">{a.breed}</td>
                    <td className="p-3">{a.age_years} yrs</td>
                    <td className="p-3">L{a.lactation_number}</td>
                    <td className="p-3 font-medium">{a.milk_yield_l_day} L</td>
                    <td className="p-3 font-semibold text-emerald-400">
                      {a.scc_cells_ml ? a.scc_cells_ml.toLocaleString() : 'N/A'}
                    </td>
                    <td className="p-3">{a.activity_percent ? `${a.activity_percent}%` : 'N/A'}</td>
                    <td className="p-3">{a.rumination_min_day ? `${a.rumination_min_day}m` : 'N/A'}</td>
                    <td className="p-3">
                      <span className="font-extrabold text-white">{a.risk_score || 0}%</span>
                    </td>
                    <td className="p-3">
                      <RiskBadge category={a.risk_category || 'No Risk'} size="sm" />
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        to={`/animals/${a.animal_id}`}
                        className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 font-semibold transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12} className="p-8 text-center text-slate-500">
                    No animals matched the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center space-x-1 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs text-slate-300 font-semibold transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-xs text-slate-400">Page {page} of {totalPages}</span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="flex items-center space-x-1 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs text-slate-300 font-semibold transition"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
