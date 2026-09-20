import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Animals } from './pages/Animals';
import { AnimalDetails } from './pages/AnimalDetails';
import { HerdAnalytics } from './pages/HerdAnalytics';
import { Alerts } from './pages/Alerts';
import { Recommendations } from './pages/Recommendations';
import { Settings } from './pages/Settings';
import { SensorSimulator } from './pages/SensorSimulator';

export const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="flex flex-1 overflow-hidden">
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

          <main className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/animals" element={<Animals />} />
              <Route path="/animals/:animal_id" element={<AnimalDetails />} />
              <Route path="/simulator" element={<SensorSimulator />} />
              <Route path="/analytics" element={<HerdAnalytics />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};


export default App;
