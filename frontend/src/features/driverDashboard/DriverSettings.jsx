import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { 
  ArrowLeft, 
  Settings as SettingsIcon, 
  User, 
  Lock, 
  Bell, 
  Save, 
  CheckCircle2,
  Key,
  Moon,
  Volume2,
  Info,
  ShieldCheck
} from 'lucide-react';

const DriverSettings = () => {
  const navigate = useNavigate();
  const { darkMode, setDarkMode } = useOutletContext();
   
  // Profile state matching logged-in driver Muhammad Tamim
  const [profileData, setProfileData] = useState({
    fullName: 'Muhammad Tamim',
    phone: '+971 50 123 4567',
    email: 'tamim.driver@alwaqartransport.ae',
    driverId: 'DR-10234'
  });

  // Password state
  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notifications and App Preferences toggles
  const [notifications, setNotifications] = useState({
    jobAlerts: true,
    complianceReminders: true,
    smsAlerts: false,
    soundEffects: true
  });

  const [savedProfile, setSavedProfile] = useState(false);
  const [savedPass, setSavedPass] = useState(false);
  const [passError, setPassError] = useState('');

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setSavedProfile(true);
    setTimeout(() => setSavedProfile(false), 2500);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPassError('');

    if (passData.newPassword.length < 8) {
      setPassError('Password must be at least 8 characters long.');
      return;
    }

    if (passData.newPassword !== passData.confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    setSavedPass(true);
    setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setSavedPass(false), 2500);
  };

  const isDark = darkMode;

  return (
    <div className="w-full space-y-6 pb-16">
       
      {/* Top Header & Back Navigation */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className={`flex items-center space-x-2 text-xs font-bold px-4 py-2.5 rounded-xl border transition-colors shadow-xs cursor-pointer ${
            isDark 
              ? 'bg-slate-800 border-slate-700 text-gray-200 hover:text-blue-400' 
              : 'bg-white border-gray-200 text-gray-600 hover:text-blue-600'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
        <span className={`text-xs font-mono font-bold px-3 py-1.5 rounded-full border flex items-center gap-1.5 ${
          isDark 
            ? 'bg-blue-950/60 border-blue-800 text-blue-300' 
            : 'bg-blue-50 border-blue-100 text-blue-700'
        }`}>
          <SettingsIcon className="w-3.5 h-3.5" /> SECURE ACCOUNT PREFERENCES
        </span>
      </div>

      {/* Hero Banner */}
      <div className={`rounded-2xl p-6 shadow-xs border flex items-center space-x-4 ${
        isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-blue-100'
      }`}>
        <div className="bg-blue-600 text-white p-3.5 rounded-xl shadow-sm shrink-0">
          <SettingsIcon className="w-8 h-8" />
        </div>
        <div>
          <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-blue-900'}`}>
            Driver Account Settings & Security
          </h3>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Manage your personal profile credentials, account passwords, and app notification channels in real-time.
          </p>
        </div>
      </div>

      {/* Balanced Two-Column Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
         
        {/* Left Column: Personal Profile & Interface Preferences */}
        <div className="space-y-6">
           
          {/* Personal Profile Card */}
          <div className={`rounded-2xl border shadow-xs p-6 space-y-4 ${
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
          }`}>
            <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-slate-700' : 'border-gray-100'}`}>
              <h4 className={`font-bold text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <User className="w-4 h-4 text-blue-600" /> Personal Profile Information
              </h4>
              <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Verified Driver
              </span>
            </div>

            {savedProfile && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> Profile details updated successfully!
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
              <div>
                <label className={`block font-semibold mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Full Name</label>
                <input 
                  type="text" 
                  required
                  value={profileData.fullName}
                  onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                  className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-none focus:border-blue-500 font-medium ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Contact Phone Number</label>
                <input 
                  type="text" 
                  required
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-none focus:border-blue-500 font-medium ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email Address</label>
                <input 
                  type="email" 
                  required
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-none focus:border-blue-500 font-medium ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Driver ID (Read-Only)</label>
                <input 
                  type="text" 
                  disabled
                  value={profileData.driverId}
                  className={`w-full px-3.5 py-2.5 border rounded-xl font-mono font-bold cursor-not-allowed ${
                    isDark ? 'bg-slate-900/60 border-slate-700 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-500'
                  }`}
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center space-x-2 mt-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </form>
          </div>

          {/* Notification & Interface Preferences Card */}
          <div className={`rounded-2xl border shadow-xs p-6 space-y-4 ${
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
          }`}>
            <h4 className={`font-bold text-sm border-b pb-3 flex items-center gap-2 ${
              isDark ? 'text-white border-slate-700' : 'text-gray-900 border-gray-100'
            }`}>
              <Bell className="w-4 h-4 text-emerald-600" /> Notification & Interface Preferences
            </h4>

            <div className="space-y-3 text-xs">
              <div className={`flex items-center justify-between p-3 rounded-xl border ${
                isDark ? 'bg-slate-900 border-slate-700 text-gray-200' : 'bg-gray-50 border-gray-100 text-gray-800'
              }`}>
                <span className="font-semibold">Job Assignment Push Alerts</span>
                <input 
                  type="checkbox" 
                  checked={notifications.jobAlerts}
                  onChange={() => setNotifications({ ...notifications, jobAlerts: !notifications.jobAlerts })}
                  className="w-4 h-4 accent-blue-600 cursor-pointer"
                />
              </div>

              <div className={`flex items-center justify-between p-3 rounded-xl border ${
                isDark ? 'bg-slate-900 border-slate-700 text-gray-200' : 'bg-gray-50 border-gray-100 text-gray-800'
              }`}>
                <span className="font-semibold">Compliance & Expiry Warnings (30/15/7 Days)</span>
                <input 
                  type="checkbox" 
                  checked={notifications.complianceReminders}
                  onChange={() => setNotifications({ ...notifications, complianceReminders: !notifications.complianceReminders })}
                  className="w-4 h-4 accent-blue-600 cursor-pointer"
                />
              </div>

              <div className={`flex items-center justify-between p-3 rounded-xl border ${
                isDark ? 'bg-slate-900 border-slate-700 text-gray-200' : 'bg-gray-50 border-gray-100 text-gray-800'
              }`}>
                <span className="font-semibold">SMS Gateway Notifications</span>
                <input 
                  type="checkbox" 
                  checked={notifications.smsAlerts}
                  onChange={() => setNotifications({ ...notifications, smsAlerts: !notifications.smsAlerts })}
                  className="w-4 h-4 accent-blue-600 cursor-pointer"
                />
              </div>

              <div className={`flex items-center justify-between p-3 rounded-xl border ${
                isDark ? 'bg-slate-900 border-slate-700 text-gray-200' : 'bg-gray-50 border-gray-100 text-gray-800'
              }`}>
                <span className="font-semibold flex items-center gap-1.5"><Volume2 className="w-3.5 h-3.5 text-blue-500"/> In-App Notification Sound Effects</span>
                <input 
                  type="checkbox" 
                  checked={notifications.soundEffects}
                  onChange={() => setNotifications({ ...notifications, soundEffects: !notifications.soundEffects })}
                  className="w-4 h-4 accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Global Dark Mode Toggle Connected to Layout Context */}
              <div className={`flex items-center justify-between p-3 rounded-xl border ${
                isDark ? 'bg-slate-900 border-slate-700 text-gray-200' : 'bg-gray-50 border-gray-100 text-gray-800'
              }`}>
                <span className="font-semibold flex items-center gap-1.5"><Moon className="w-3.5 h-3.5 text-indigo-500"/> Dark Mode Theme (Night View)</span>
                <input 
                  type="checkbox" 
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                  className="w-4 h-4 accent-blue-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Password Security & System Info */}
        <div className="space-y-6">
           
          {/* Change Security Password Card */}
          <div className={`rounded-2xl border shadow-xs p-6 space-y-4 ${
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
          }`}>
            <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-slate-700' : 'border-gray-100'}`}>
              <h4 className={`font-bold text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <Lock className="w-4 h-4 text-purple-600" /> Change Security Password
              </h4>
              <ShieldCheck className="w-4 h-4 text-purple-600" />
            </div>

            {savedPass && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> Password updated successfully!
              </div>
            )}

            {passError && (
              <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl text-rose-400 text-xs font-semibold">
                {passError}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-3 text-xs">
              <div>
                <label className={`block font-semibold mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Current Password</label>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  value={passData.currentPassword}
                  onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
                  className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-none focus:border-blue-500 ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>New Password (Min 8 Chars)</label>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  value={passData.newPassword}
                  onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                  className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-none focus:border-blue-500 ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Confirm New Password</label>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  value={passData.confirmPassword}
                  onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                  className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-none focus:border-blue-500 ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center space-x-2 mt-4"
              >
                <Key className="w-4 h-4" />
                <span>Update Password</span>
              </button>
            </form>
          </div>

          {/* App Version & Build Metadata Card */}
          <div className={`rounded-2xl border p-5 flex items-center justify-between text-xs ${
            isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200 shadow-2xs'
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`p-2.5 rounded-xl ${isDark ? 'bg-blue-950 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h5 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Masafi Fleet Sync (Driver App)</h5>
                <p className={`text-[11px] mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Intranet Build Hash: #ALW-2026-PROD-V1</p>
              </div>
            </div>
            <span className={`font-mono font-bold px-3 py-1.5 rounded-lg border text-xs ${
              isDark ? 'bg-slate-900 border-slate-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'
            }`}>
              v1.0.0
            </span>
          </div>

        </div>

      </div>

    </div>
  );
};

export default DriverSettings;