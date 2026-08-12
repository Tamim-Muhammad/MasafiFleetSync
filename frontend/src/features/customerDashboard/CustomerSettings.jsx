import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { 
  Bell, 
  Moon, 
  Save, 
  CheckCircle2, 
  Building2,
  Shield,
  KeyRound
} from 'lucide-react';

const CustomerSettings = () => {
  const navigate = useNavigate();
  const { darkMode, setDarkMode } = useOutletContext();

  const [settings, setSettings] = useState({
    smsAlerts: true,
    emailReceipts: true,
    orderUpdates: true
  });

  const [savedSettings, setSavedSettings] = useState(false);
  const isDark = darkMode;

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 font-sans text-sm">
      
      {/* Consistent Blue Gradient Hero Banner */}
      <div className="bg-gradient-to-r from-[#0B2A4D] via-[#103E73] to-[#0B2A4D] p-8 rounded-3xl shadow-2xl text-white flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden border border-blue-900/50">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/30 border border-blue-400/30 px-4 py-1.5 rounded-full text-[11px] font-black tracking-wider uppercase text-blue-200 shadow-inner">
            <Building2 size={14} /> System Preferences
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Account Settings & Notifications</h1>
          <p className="text-blue-100 max-w-xl text-xs font-medium opacity-90">
            Configure alert channels, notification defaults, and site-wide theme appearances.
          </p>
        </div>
      </div>

      {/* Main Settings Form Container */}
      <div className={`rounded-3xl border shadow-xl p-8 max-w-3xl space-y-6 ${
        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/90 text-slate-900'
      }`}>
        <div className={`flex items-center justify-between border-b pb-4 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <h4 className={`font-bold text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#0B2A4D]'}`}>
            <Building2 className="w-4 h-4 text-blue-600" /> Notification Channels & Appearance
          </h4>
          <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
            Client Portal
          </span>
        </div>

        {savedSettings && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl flex items-center gap-2 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> System preferences updated successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className={`flex items-center justify-between p-4 rounded-2xl border ${
            isDark ? 'bg-slate-800/50 border-slate-800 text-gray-200' : 'bg-slate-50 border-slate-100 text-slate-800'
          }`}>
            <div className="space-y-0.5">
              <label className={`font-extrabold flex items-center gap-2 ${isDark ? 'text-blue-400' : 'text-[#0B2A4D]'}`}>
                <Bell size={16} className="text-blue-600" /> SMS Delivery Alerts
              </label>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Receive text notifications when your water tanker is close to arrival.</p>
            </div>
            <input
              type="checkbox"
              checked={settings.smsAlerts}
              onChange={(e) => setSettings({ ...settings, smsAlerts: e.target.checked })}
              className="w-5 h-5 accent-[#0B2A4D] cursor-pointer"
            />
          </div>

          <div className={`flex items-center justify-between p-4 rounded-2xl border ${
            isDark ? 'bg-slate-800/50 border-slate-800 text-gray-200' : 'bg-slate-50 border-slate-100 text-slate-800'
          }`}>
            <div className="space-y-0.5">
              <label className={`font-extrabold flex items-center gap-2 ${isDark ? 'text-blue-400' : 'text-[#0B2A4D]'}`}>
                <Bell size={16} className="text-blue-600" /> Email Invoices & Receipts
              </label>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Automatically email PDF receipts upon delivery completion.</p>
            </div>
            <input
              type="checkbox"
              checked={settings.emailReceipts}
              onChange={(e) => setSettings({ ...settings, emailReceipts: e.target.checked })}
              className="w-5 h-5 accent-[#0B2A4D] cursor-pointer"
            />
          </div>

          {/* Dark Mode Theme Toggle Connected to Layout Context */}
          <div className={`flex items-center justify-between p-4 rounded-2xl border ${
            isDark ? 'bg-slate-800/50 border-slate-800 text-gray-200' : 'bg-slate-50 border-slate-100 text-slate-800'
          }`}>
            <div className="space-y-0.5">
              <label className={`font-extrabold flex items-center gap-2 ${isDark ? 'text-indigo-400' : 'text-[#0B2A4D]'}`}>
                <Moon size={16} className="text-indigo-500" /> Dark Mode Appearance (Night View)
              </label>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Enable site-wide dark theme interface style across the portal.</p>
            </div>
            <input
              type="checkbox"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              className="w-5 h-5 accent-[#0B2A4D] cursor-pointer"
            />
          </div>

          <div className={`pt-4 border-t flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
            <span className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
              <Shield size={16} /> Secure Client Configuration
            </span>
            <button
              type="submit"
              className="bg-[#0B2A4D] hover:bg-blue-900 text-white font-extrabold px-6 py-3.5 rounded-2xl transition shadow-md flex items-center gap-2 cursor-pointer text-xs"
            >
              <Save size={16} /> Save Settings
            </button>
          </div>
        </form>

        {/* Quick Cross-link to Security page for Passwords */}
        <div className={`pt-4 border-t flex items-center justify-between p-4 rounded-2xl ${
          isDark ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-100'
        }`}>
          <div className="space-y-0.5">
            <p className={`text-xs font-black uppercase ${isDark ? 'text-white' : 'text-[#0B2A4D]'}`}>Looking to update your password?</p>
            <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Manage your security credentials and encryption keys.</p>
          </div>
          <button
            onClick={() => navigate('/customer/dashboard/security')}
            className={`font-extrabold px-4 py-2.5 rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer text-xs shrink-0 ${
              isDark ? 'bg-slate-800 text-blue-400 hover:bg-slate-700 border border-slate-700' : 'bg-white text-[#0B2A4D] hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <KeyRound size={14} /> Go to Security
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerSettings;