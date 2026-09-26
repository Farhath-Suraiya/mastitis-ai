import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Bell,
  CheckSquare,
  Settings,
  ShieldAlert,
  Info,
  Cpu
} from 'lucide-react';

import { useLanguage } from '../i18n/LanguageContext';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { t } = useLanguage();

  const navItems = [
    { name: t('navDashboard'), path: '/', icon: LayoutDashboard },
    { name: t('navAnimals'), path: '/animals', icon: Users },
    { name: t('navSimulator'), path: '/simulator', icon: Cpu },
    { name: t('navAnalytics'), path: '/analytics', icon: BarChart3 },
    { name: t('navAlerts'), path: '/alerts', icon: Bell },
    { name: t('navRecommendations'), path: '/recommendations', icon: CheckSquare },
    { name: t('navSettings'), path: '/settings', icon: Settings },
  ];


  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto flex flex-col justify-between ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Header padding for mobile */}
          <div className="h-16 flex items-center px-6 lg:hidden border-b border-slate-800">
            <span className="font-bold text-lg text-white">{t('navDashboard')}</span>
          </div>

          <nav className="px-4 py-6 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Prototype Disclaimer Widget */}
        <div className="p-4 m-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-400 space-y-2">
          <div className="flex items-center space-x-1.5 text-amber-400 font-semibold">
            <Info className="w-4 h-4 shrink-0" />
            <span>{t('softwareSimulation')}</span>
          </div>
          <p className="leading-relaxed text-[11px]">
            {t('simulatedPlatformDesc')}
          </p>
        </div>
      </aside>
    </>
  );
};
