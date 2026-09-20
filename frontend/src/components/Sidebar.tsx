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

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Animals', path: '/animals', icon: Users },
    { name: 'IoT Simulator', path: '/simulator', icon: Cpu },
    { name: 'Herd Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Alerts', path: '/alerts', icon: Bell },
    { name: 'Recommendations', path: '/recommendations', icon: CheckSquare },
    { name: 'Settings & Data', path: '/settings', icon: Settings },
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
            <span className="font-bold text-lg text-white">Navigation</span>
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
            <span>Synthetic Prototype</span>
          </div>
          <p className="leading-relaxed text-[11px]">
            Trained on synthetic datasets for 7–14 day early warning decision support. Requires validation before clinical use.
          </p>
        </div>
      </aside>
    </>
  );
};
