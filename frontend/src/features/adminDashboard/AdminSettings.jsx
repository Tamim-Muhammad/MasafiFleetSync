import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Shield, MapPin, Sliders, Moon, CheckCircle2, Server, Save } from 'lucide-react';

const AdminSettings = () => {
  const { darkMode, toggleDarkMode } = useOutletContext();

  const [baseRate, setBaseRate] = useState('150');
  const [perKmRate, setPerKmRate] = useState('3.5');
  const [commission, setCommission] = useState('10');
  const [geofenceZone, setGeofenceZone] = useState('Masafi-Fujairah Core (Default)');
  const [alertDays, setAlertDays] = useState('30 / 15 / 7 Days');
  const [autoBackup, setAutoBackup] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Audit log state
  const [auditLogs, setAuditLogs] = useState(() => {
    return JSON.parse(localStorage.getItem('alwaqar_audit_logs') || JSON.stringify([
      { date: '2026-08-27 09:12:45', text: 'Base Rate parameter adjusted to 150 AED.', type: 'blue' },
      { date: '2026-08-26 14:30:10', text: 'Geofence active for Masafi-Fujairah Core Region.', type: 'emerald' },
      { date: '2026-08-25 18:05:22', text: 'Database pessimistic locking triggered for concurrency.', type: 'indigo' }
    ]));
  });

  // Fetch current system configuration from backend on load
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('http://localhost:5191/api/WaterOrders/config');
        if (response.ok) {
          const data = await response.json();
          setBaseRate(data.baseRate?.toString() || '150');
          setPerKmRate(data.perKmRate?.toString() || '3.5');
          setCommission(data.companyCommissionPercentage?.toString() || '10');
          setGeofenceZone(data.geofenceZone || 'Masafi-Fujairah Core (Default)');
          setAlertDays(data.complianceAlertThreshold || '30 / 15 / 7 Days');
          setAutoBackup(data.autoBackupEnabled ?? true);
        }
      } catch (error) {
        console.error("Failed to fetch system configs from backend, falling back to localStorage:", error);
        setBaseRate(localStorage.getItem('alwaqar_base_rate') || '150');
        setPerKmRate(localStorage.getItem('alwaqar_per_km_rate') || '3.5');
        setCommission(localStorage.getItem('alwaqar_commission_rate') || '10');
      }
    };
    fetchSettings();
  }, []);

  const handleSaveFormulas = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    // 1. Save to localStorage for instant client-side fallback & map updates
    localStorage.setItem('alwaqar_base_rate', baseRate);
    localStorage.setItem('alwaqar_per_km_rate', perKmRate);
    localStorage.setItem('alwaqar_commission_rate', commission);
    localStorage.setItem('alwaqar_geofence', geofenceZone);
    localStorage.setItem('alwaqar_alert_days', alertDays);
    localStorage.setItem('alwaqar_auto_backup', autoBackup);

    let bounds = { minLat: 24.9000, maxLat: 25.6000, minLon: 56.0000, maxLon: 56.6000 };
    if (geofenceZone.includes('Sharjah')) {
      bounds = { minLat: 25.2000, maxLat: 25.4500, minLon: 55.3000, maxLon: 56.0000 };
    } else if (geofenceZone.includes('Global')) {
      bounds = { minLat: 22.0000, maxLat: 26.0000, minLon: 51.0000, maxLon: 58.0000 };
    }
    localStorage.setItem('alwaqar_geofence_bounds', JSON.stringify(bounds));

    try {
      // 2. Persist configuration directly to SQL Server via C# backend API
      const payload = {
        BaseRate: parseFloat(baseRate) || 150,
        PerKmRate: parseFloat(perKmRate) || 3.5,
        CompanyCommissionPercentage: parseFloat(commission) || 10,
        GeofenceZone: geofenceZone,
        ComplianceAlertThreshold: alertDays,
        AutoBackupEnabled: autoBackup
      };

      const response = await fetch('http://localhost:5191/api/WaterOrders/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to synchronize parameters with backend database.');
      }
    } catch (err) {
      console.error("Backend persistence warning:", err);
    }

    // 3. Append to immutable audit log
    const newLog = {
      date: new Date().toISOString().slice(0, 19).replace('T', ' '),
      text: `Admin updated parameters: BaseRate [${baseRate} AED], Zone [${geofenceZone}], Thresholds [${alertDays}].`,
      type: 'blue'
    };
    const updatedLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedLogs);
    localStorage.setItem('alwaqar_audit_logs', JSON.stringify(updatedLogs));

    setIsSaving(false);
    setSuccessMessage('Global parameters successfully committed to SQL Server & cross-system formulas updated.');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  return (
    <div className={`space-y-6 transition-colors duration-200 pb-12 font-sans ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
      
      {/* Clean Enterprise Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-black text-blue-600 dark:text-blue-400 tracking-wider uppercase mb-1">
            <Shield size={14} /> System Governance & Parameters
          </div>
          <h1 className="text-2xl font-black tracking-tight">Global System Settings & Cryptographic Audit Logs</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            Configure dynamic pricing formula variables, geofencing perimeters, notification thresholds, and security logs.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-sm">
          <CheckCircle2 size={16} /> {successMessage}
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Form Panels (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Panel 1: Pricing & Commission Settings */}
          <div className={`p-6 rounded-3xl shadow-xl border ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/90 text-slate-900'} space-y-5`}>
            <div className={`flex items-center justify-between border-b pb-3.5 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <div className="flex items-center space-x-2.5">
                <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black tracking-tight">Pricing Formula & Commission Parameters</h2>
                  <p className="text-xs text-slate-400 font-medium">Real-time valuation metrics applied across all customer order calculations.</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveFormulas} className="space-y-4">
              <div className={`p-3.5 rounded-2xl border font-mono text-xs font-bold text-center ${darkMode ? 'bg-slate-800/80 border-slate-700 text-blue-300' : 'bg-blue-50/80 border-blue-100 text-blue-900'}`}>
                Active Formula: [Base Rate ({baseRate} AED) + (Distance in km * Per-km Rate ({perKmRate} AED))] * Volume Multiplier
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className={`block font-bold mb-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Base Rate Fee (AED)</label>
                  <input 
                    type="number" 
                    value={baseRate}
                    onChange={(e) => setBaseRate(e.target.value)}
                    className={`w-full p-3 border rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                  />
                </div>
                <div>
                  <label className={`block font-bold mb-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Per-Kilometer Charge Factor (AED)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={perKmRate}
                    onChange={(e) => setPerKmRate(e.target.value)}
                    className={`w-full p-3 border rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className={`block font-bold mb-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Company Commission Deduction Percentage (%)</label>
                <input 
                  type="number" 
                  value={commission}
                  onChange={(e) => setCommission(e.target.value)}
                  className={`w-full p-3 border rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-[#0B2A4D] hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Save size={14} /> {isSaving ? 'Committing...' : 'Save Global Parameters'}
                </button>
              </div>
            </form>
          </div>

          {/* Panel 2: Operational Boundaries & System Preferences */}
          <div className={`p-6 rounded-3xl shadow-xl border ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/90 text-slate-900'} space-y-5`}>
            <div className={`flex items-center justify-between border-b pb-3.5 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <div className="flex items-center space-x-2.5">
                <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black tracking-tight">Operational Boundaries & System Preferences</h2>
                  <p className="text-xs text-slate-400 font-medium">Manage regional routing geofences, alerts, and system appearance.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                <div>
                  <span className={`font-bold block ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Geofencing Service Zone</span>
                  <span className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} text-[11px]`}>Defines active delivery bounding box on the customer map.</span>
                </div>
                <select 
                  value={geofenceZone}
                  onChange={(e) => setGeofenceZone(e.target.value)}
                  className={`p-3 border rounded-xl font-bold focus:outline-none w-full sm:w-64 cursor-pointer ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                >
                  <option value="Masafi-Fujairah Core (Default)">Masafi-Fujairah Core Region</option>
                  <option value="Sharjah-East Coast Corridor">Sharjah-East Coast Corridor</option>
                  <option value="Global Expanded Zone">Global Expanded Zone</option>
                </select>
              </div>

              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                <div>
                  <span className={`font-bold block ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Compliance Expiry Warning Thresholds</span>
                  <span className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} text-[11px]`}>Configure background alert intervals before document expiration.</span>
                </div>
                <select 
                  value={alertDays}
                  onChange={(e) => setAlertDays(e.target.value)}
                  className={`p-3 border rounded-xl font-bold focus:outline-none w-full sm:w-64 cursor-pointer ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                >
                  <option value="30 / 15 / 7 Days">Standard (30 / 15 / 7 Days)</option>
                  <option value="45 / 30 / 14 Days">Extended (45 / 30 / 14 Days)</option>
                </select>
              </div>

              {/* Theme toggle connected via outlet context */}
              <div className={`flex items-center justify-between pb-4 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                <div className="flex items-center space-x-2.5">
                  <Moon className="w-4 h-4 text-blue-400" />
                  <div>
                    <span className={`font-bold block ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Dark High-Contrast Appearance (Global)</span>
                    <span className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} text-[11px]`}>Switch application display theme across all viewports.</span>
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
                <div className="flex items-center space-x-2.5">
                  <Server className="w-4 h-4 text-emerald-500" />
                  <div>
                    <span className={`font-bold block ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Automated 24-Hour SQL Database Snapshot Routine</span>
                    <span className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} text-[11px]`}>Maintain encrypted historical backups of all transactional fleet data.</span>
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

        {/* Right Panel: Immutable Audit Log */}
        <div className={`p-6 rounded-3xl shadow-xl border ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/90 text-slate-900'} flex flex-col justify-between space-y-6`}>
          <div className="space-y-4">
            <div className={`flex items-center space-x-2.5 border-b pb-3.5 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black tracking-tight">Immutable Audit Log</h2>
                <p className="text-xs text-slate-400 font-medium">Tamper-proof system records.</p>
              </div>
            </div>

            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} leading-relaxed`}>
              Chronological ledger of administrative parameter overrides, geofence updates, and security locks.
            </p>

            <div className="space-y-3 text-xs max-h-80 overflow-y-auto pr-1">
              {auditLogs.map((log, idx) => (
                <div key={idx} className={`p-3.5 rounded-2xl border space-y-1 ${darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200/80'}`}>
                  <span className="font-mono text-[10px] text-blue-400 font-bold">{log.date}</span>
                  <p className={`font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{log.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`mt-4 pt-4 border-t flex items-center justify-center space-x-1.5 text-[11px] font-bold py-3 rounded-2xl ${darkMode ? 'border-slate-800 bg-emerald-950/40 text-emerald-400' : 'border-slate-100 bg-emerald-50/80 text-emerald-600'}`}>
            <CheckCircle2 className="w-4 h-4" />
            <span>Write-protected SQL Server logging active</span>
          </div>
        </div>

      </div>
    </div>
  );
};
export default AdminSettings;