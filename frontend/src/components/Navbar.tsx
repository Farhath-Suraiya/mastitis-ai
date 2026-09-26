import React from 'react';
import { Activity, ShieldAlert, Cpu, Layers, Menu, X, Globe } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { Language } from '../i18n/translations';

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            aria-label="Toggle Navigation"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-transparent">
                  MastiGuard
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  PROTOTYPE
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                {t('headerSubtitle')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="hidden md:flex items-center space-x-2 bg-slate-800/80 border border-slate-700/60 rounded-full px-3 py-1 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{t('forecastLeadBadge')}</span>
          </div>

          <div className="hidden sm:flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs px-3 py-1 rounded-full">
            <Cpu className="w-3.5 h-3.5" />
            <span>{t('mlActiveBadge')}</span>
          </div>

          {/* Multilingual Selector */}
          <div className="flex items-center space-x-1.5 bg-slate-800/90 border border-slate-700 rounded-xl px-2.5 py-1.5 shadow-sm">
            <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer pr-1"
              aria-label="Select Language"
            >
              <option value="en" className="bg-slate-900 text-white">English</option>
              <option value="ta" className="bg-slate-900 text-white">தமிழ்</option>
              <option value="hi" className="bg-slate-900 text-white">हिन्दी</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
