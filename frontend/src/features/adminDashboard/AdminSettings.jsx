import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Shield, MapPin, Sliders, Moon, CheckCircle2, Server } from 'lucide-react';

const AdminSettings = () => {
  // Grab global dark mode context from the parent layout
  const { darkMode, setDarkMode, toggleDarkMode } = useOutletContext();

  const [baseRate, setBaseRate] = useState('150');
  const [perKmRate, setPerKmRate] = useState('3.5');
  const [commission, setCommission] = useState('10');
  const [geofenceZone, setGeofenceZone] = useState('Masafi-Fujairah Core (Default)');
  const [alertDays, setAlertDays] = useState('30 / 15 / 7 Days');
  const [autoBackup, setAutoBackup] = useState(true);

  const handleSaveFormulas = (e) => {
    e.preventDefault();
    alert('Global system parameters, geofencing perimeters, and database synchronization rules successfully committed.');
  };

  return (
    <div className={`space-y-6 transition-colors duration-200 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
      {/* Top Professional Header */}
      <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#0B2A4D] border-blue-950'} p-6 rounded-2xl shadow-md text-white flex flex-col md:flex-row md:items-center md:justify-between border transition-colors`}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Global System Settings & Cryptographic Audit Logs</h1>
          <p className="text-sm text-blue-200 mt-1">Configure pricing formula variables, geofencing perimeters, notification thresholds, and review immutable security logs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Settings Panels */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Pricing & Commission Settings */}
          <div className={`${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-100 text-gray-900'} p-6 rounded-2xl shadow-sm border transition-colors`}>
            <div className={`flex items-center space-x-2 mb-4 border-b pb-3 ${darkMode ? 'border-slate-800' : 'border-gray-100'}`}>
              <Sliders className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-bold">Pricing Formula & Commission Parameters</h2>
            </div>

            <form onSubmit={handleSaveFormulas} className="space-y-4 text-xs">
              <div className={`p-3 rounded-xl border font-mono text-center ${darkMode ? 'bg-slate-800 border-slate-700 text-blue-300' : 'bg-blue-50/60 border-blue-100 text-blue-900'}`}>
                Formula: [Base Rate + (Distance in km * Per-km Rate)] * Volume Multiplier
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block font-bold mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Base Rate Fee (AED)</label>
                  <input 
                    type="number" 
                    value={baseRate}
                    onChange={(e) => setBaseRate(e.target.value)}
                    className={`w-full p-3 border rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
                  />
                </div>
                <div>
                  <label className={`block font-bold mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Per-Kilometer Charge Factor (AED)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={perKmRate}
                    onChange={(e) => setPerKmRate(e.target.value)}
                    className={`w-full p-3 border rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block font-bold mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Company Commission Deduction Percentage (%)</label>
                <input 
                  type="number" 
                  value={commission}
                  onChange={(e) => setCommission(e.target.value)}
                  className={`w-full p-3 border rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  className="bg-[#0B2A4D] hover:bg-blue-900 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-sm cursor-pointer"
                >
                  Save Global Parameters
                </button>
              </div>
            </form>
          </div>

          {/* Operational Boundaries & System Preferences */}
          <div className={`${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-100 text-gray-900'} p-6 rounded-2xl shadow-sm border space-y-4 transition-colors`}>
            <div className={`flex items-center space-x-2 border-b pb-3 ${darkMode ? 'border-slate-800' : 'border-gray-100'}`}>
              <MapPin className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-bold">Operational Boundaries & System Preferences</h2>
            </div>

            <div className="space-y-4 text-xs">
              <div className={`flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b ${darkMode ? 'border-slate-800' : 'border-gray-50'}`}>
                <div>
                  <span className={`font-bold block ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Geofencing Service Zone</span>
                  <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-[11px]`}>Define operational boundary parameters for the Masafi/Fujairah region.</span>
                </div>
                <select 
                  value={geofenceZone}
                  onChange={(e) => setGeofenceZone(e.target.value)}
                  className={`p-2.5 border rounded-xl font-semibold focus:outline-none w-full md:w-64 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
                >
                  <option value="Masafi-Fujairah Core (Default)">Masafi-Fujairah Core Region</option>
                  <option value="Sharjah-East Coast Corridor">Sharjah-East Coast Corridor</option>
                  <option value="Global Expanded Zone">Global Expanded Zone</option>
                </select>
              </div>

              <div className={`flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b ${darkMode ? 'border-slate-800' : 'border-gray-50'}`}>
                <div>
                  <span className={`font-bold block ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Compliance Expiry Warning Thresholds</span>
                  <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-[11px]`}>Configure automated background alert intervals before document expiration.</span>
                </div>
                <select 
                  value={alertDays}
                  onChange={(e) => setAlertDays(e.target.value)}
                  className={`p-2.5 border rounded-xl font-semibold focus:outline-none w-full md:w-64 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
                >
                  <option value="30 / 15 / 7 Days">Standard (30 / 15 / 7 Days)</option>
                  <option value="45 / 30 / 14 Days">Extended (45 / 30 / 14 Days)</option>
                </select>
              </div>

              {/* Theme toggle connected via outlet context */}
              <div className={`flex items-center justify-between pb-3 border-b ${darkMode ? 'border-slate-800' : 'border-gray-50'}`}>
                <div className="flex items-center space-x-2">
                  <Moon className="w-4 h-4 text-blue-400" />
                  <div>
                    <span className={`font-bold block ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Dark High-Contrast Appearance (Global)</span>
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-[11px]`}>Switch application display theme across all viewports.</span>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={darkMode}
                  onChange={toggleDarkMode}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Server className="w-4 h-4 text-emerald-500" />
                  <div>
                    <span className={`font-bold block ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Automated 24-Hour SQL Database Snapshot Routine</span>
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-[11px]`}>Maintain encrypted historical backups of all transactional fleet data.</span>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={autoBackup}
                  onChange={() => setAutoBackup(!autoBackup)}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Immutable Audit Log Panel */}
        <div className={`${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-100 text-gray-900'} p-6 rounded-2xl shadow-sm border flex flex-col justify-between transition-colors`}>
          <div className="space-y-4">
            <div className={`flex items-center space-x-2 border-b pb-3 ${darkMode ? 'border-slate-800' : 'border-gray-100'}`}>
              <Shield className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-bold">Immutable System Audit Log</h2>
            </div>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tamper-proof chronological records of configuration overrides, administrative logins, and transactional database locks.</p>

            <div className="space-y-3 text-xs">
              <div className={`p-3 rounded-xl border space-y-1 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
                <span className="font-mono text-[10px] text-blue-400 font-bold">2026-08-04 09:12:45</span>
                <p className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Admin (TAMIM-01) updated Base Rate from 140 to 150 AED.</p>
              </div>

              <div className={`p-3 rounded-xl border space-y-1 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
                <span className="font-mono text-[10px] text-emerald-400 font-bold">2026-08-03 14:30:10</span>
                <p className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Geofencing boundary modified for Masafi/Fujairah operational sector.</p>
              </div>

              <div className={`p-3 rounded-xl border space-y-1 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
                <span className="font-mono text-[10px] text-indigo-400 font-bold">2026-08-02 18:05:22</span>
                <p className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Database pessimistic locking triggered for concurrent vehicle assignment.</p>
              </div>
            </div>
          </div>

          <div className={`mt-6 pt-4 border-t flex items-center justify-center space-x-1.5 text-[11px] font-bold py-2.5 rounded-xl ${darkMode ? 'border-slate-800 bg-emerald-950/40 text-emerald-400' : 'border-gray-100 bg-emerald-50/50 text-emerald-600'}`}>
            <CheckCircle2 className="w-4 h-4" />
            <span>Write-protected SQL Server logging active</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminSettings;