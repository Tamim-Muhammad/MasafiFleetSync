import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
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
  ShieldCheck,
  Eye,
  EyeOff,
  AlertTriangle,
  Sliders
} from 'lucide-react';
import axios from 'axios';

const DriverSettings = () => {
  const { darkMode, setDarkMode } = useOutletContext();
   
  const [profileData, setProfileData] = useState(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user') || '{}');
    const resolvedId = storedUser.id || storedUser.driverId || Number(sessionStorage.getItem('userId')) || 28;
    return {
      fullName: storedUser.fullName || storedUser.name || storedUser.username || 'Khalid',
      phone: storedUser.phone || storedUser.phoneNumber || '+971 50 882 1944',
      email: storedUser.email || 'khalid.driver@alwaqartransport.ae',
      driverId: resolvedId
    };
  });

  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [notifications, setNotifications] = useState({
    jobAlerts: true,
    complianceReminders: true,
    soundEffects: true
  });

  const [savedProfile, setSavedProfile] = useState(false);
  const [savedPass, setSavedPass] = useState(false);
  const [passError, setPassError] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  
  const [toggleStatus, setToggleStatus] = useState({});

  // OTP Modal States
  const [pendingProfileData, setPendingProfileData] = useState(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');

  // Forgot Password Modal States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const triggerInlineFeedback = (key) => {
    setToggleStatus(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setToggleStatus(prev => ({ ...prev, [key]: false }));
    }, 2000);
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    const storedUser = JSON.parse(sessionStorage.getItem('user') || '{}');
    const currentEmail = storedUser.email || 'khalid.driver@alwaqartransport.ae';

    if (profileData.email.trim().toLowerCase() !== currentEmail.toLowerCase()) {
      setPendingProfileData(profileData);
      setShowOtpModal(true);
      return;
    }

    commitProfileUpdate(profileData);
  };

  const commitProfileUpdate = async (data) => {
    setProfileLoading(true);
    try {
      // Calls backend database to persist name and email changes
      await axios.put(`http://localhost:5191/api/Users/${profileData.driverId}/profile`, {
        FullName: data.fullName,
        Email: data.email
      });

      const storedUser = JSON.parse(sessionStorage.getItem('user') || '{}');
      storedUser.fullName = data.fullName;
      storedUser.name = data.fullName;
      storedUser.email = data.email;
      sessionStorage.setItem('user', JSON.stringify(storedUser));

      setSavedProfile(true);
      setTimeout(() => setSavedProfile(false), 2500);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile in database.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otpCode !== '123456') {
      setOtpError('Invalid verification code. (Demo code: 123456)');
      return;
    }
    setShowOtpModal(false);
    setOtpCode('');
    setOtpError('');
    if (pendingProfileData) {
      commitProfileUpdate(pendingProfileData);
      setPendingProfileData(null);
    }
  };

  const getPasswordStrength = (pass) => {
    if (!pass) return { label: '', color: 'bg-gray-200', width: 'w-0' };
    if (pass.length < 8) return { label: 'Too Short', color: 'bg-red-500', width: 'w-1/4' };
    if (pass.match(/[A-Z]/) && pass.match(/[0-9]/) && pass.match(/[^A-Za-z0-9]/)) {
      return { label: 'Strong', color: 'bg-emerald-500', width: 'w-full' };
    }
    return { label: 'Medium', color: 'bg-amber-500', width: 'w-2/4' };
  };
  const passStrength = getPasswordStrength(passData.newPassword);

  const handlePasswordSubmit = async (e) => {
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

    setPassLoading(true);
    try {
      await axios.put(`http://localhost:5191/api/Users/${profileData.driverId}/password`, {
        CurrentPassword: passData.currentPassword,
        NewPassword: passData.newPassword
      });

      setSavedPass(true);
      setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSavedPass(false), 2500);
    } catch (err) {
      setPassError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setPassLoading(false);
    }
  };

  const handleForgotEmailSubmit = (e) => {
    e.preventDefault();
    setForgotError('');
    if (forgotEmail.trim().toLowerCase() !== profileData.email.toLowerCase()) {
      setForgotError('Email not found in our registry.');
      return;
    }
    setForgotStep(2);
  };

  const handleForgotOtpSubmit = (e) => {
    e.preventDefault();
    setForgotError('');
    if (forgotOtp !== '123456') {
      setForgotError('Invalid verification code. (Demo code: 123456)');
      return;
    }
    setForgotStep(3);
  };

  const handleForgotResetSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');
    if (forgotNewPass.length < 8) {
      setForgotError('Password must be at least 8 characters long.');
      return;
    }

    try {
      // Calls backend to overwrite password securely without requiring old password during recovery
      await axios.put(`http://localhost:5191/api/Users/${profileData.driverId}/password`, {
        CurrentPassword: "", 
        NewPassword: forgotNewPass
      });

      setForgotSuccess(true);
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotStep(1);
        setForgotEmail('');
        setForgotOtp('');
        setForgotNewPass('');
        setForgotSuccess(false);
      }, 2500);
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to reset password.');
    }
  };

  const playTestChime = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(() => {});
    } catch (err) {}
  };

  const isDark = darkMode;

  return (
    <div className="w-full space-y-6 pb-28 font-sans relative">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-600 text-white p-3 rounded-xl shadow-sm">
            <Sliders className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-gray-900 font-bold text-lg tracking-tight">Driver Account Settings & Security</h1>
            <p className="text-gray-500 text-xs mt-0.5">Manage your personal profile credentials, account passwords, and app notification channels in real-time.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-6">
          <div className={`rounded-2xl border shadow-xs p-6 space-y-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
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
                <CheckCircle2 className="w-4 h-4 shrink-0" /> Profile updated successfully in database!
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
                  className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-none focus:border-blue-500 font-medium ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                />
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Contact Phone Number (Verified)</label>
                <input 
                  type="text" 
                  disabled
                  value={profileData.phone}
                  className={`w-full px-3.5 py-2.5 border rounded-xl font-medium cursor-not-allowed ${isDark ? 'bg-slate-900/60 border-slate-700 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-500'}`}
                />
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email Address</label>
                <input 
                  type="email" 
                  required
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-none focus:border-blue-500 font-medium ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                />
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Driver ID (Read-Only)</label>
                <input 
                  type="text" 
                  disabled
                  value={`DR-${profileData.driverId}`}
                  className={`w-full px-3.5 py-2.5 border rounded-xl font-mono font-bold cursor-not-allowed ${isDark ? 'bg-slate-900/60 border-slate-700 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-500'}`}
                />
              </div>

              <button 
                type="submit"
                disabled={profileLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center space-x-2 mt-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{profileLoading ? 'Synchronizing...' : 'Save Profile Changes'}</span>
              </button>
            </form>
          </div>

          <div className={`rounded-2xl border shadow-xs p-6 space-y-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
            <h4 className={`font-bold text-sm border-b pb-3 flex items-center gap-2 ${isDark ? 'text-white border-slate-700' : 'text-gray-900 border-gray-100'}`}>
              <Bell className="w-4 h-4 text-emerald-600" /> Notification & Interface Preferences
            </h4>

            <div className="space-y-3 text-xs">
              <div className={`flex items-center justify-between p-3 rounded-xl border relative ${isDark ? 'bg-slate-900 border-slate-700 text-gray-200' : 'bg-gray-50 border-gray-100 text-gray-800'}`}>
                <span className="font-semibold">Job Assignment Push Alerts</span>
                <input type="checkbox" checked={notifications.jobAlerts} onChange={() => { setNotifications({ ...notifications, jobAlerts: !notifications.jobAlerts }); triggerInlineFeedback('jobAlerts'); }} className="w-4 h-4 accent-blue-600 cursor-pointer" />
              </div>
              <div className={`flex items-center justify-between p-3 rounded-xl border relative ${isDark ? 'bg-slate-900 border-slate-700 text-gray-200' : 'bg-gray-50 border-gray-100 text-gray-800'}`}>
                <span className="font-semibold">Compliance & Expiry Warnings</span>
                <input type="checkbox" checked={notifications.complianceReminders} onChange={() => { setNotifications({ ...notifications, complianceReminders: !notifications.complianceReminders }); triggerInlineFeedback('compliance'); }} className="w-4 h-4 accent-blue-600 cursor-pointer" />
              </div>
              <div className={`flex items-center justify-between p-3 rounded-xl border relative ${isDark ? 'bg-slate-900 border-slate-700 text-gray-200' : 'bg-gray-50 border-gray-100 text-gray-800'}`}>
                <span className="font-semibold flex items-center gap-1.5"><Volume2 className="w-3.5 h-3.5 text-blue-500"/> Notification Sound Effects</span>
                <input type="checkbox" checked={notifications.soundEffects} onChange={() => { const newState = !notifications.soundEffects; setNotifications({ ...notifications, soundEffects: newState }); triggerInlineFeedback('sound'); if (newState) playTestChime(); }} className="w-4 h-4 accent-blue-600 cursor-pointer" />
              </div>
              <div className={`flex items-center justify-between p-3 rounded-xl border relative ${isDark ? 'bg-slate-900 border-slate-700 text-gray-200' : 'bg-gray-50 border-gray-100 text-gray-800'}`}>
                <span className="font-semibold flex items-center gap-1.5"><Moon className="w-3.5 h-3.5 text-indigo-500"/> Dark Mode Theme (Night View)</span>
                <input type="checkbox" checked={darkMode} onChange={() => { setDarkMode(!darkMode); triggerInlineFeedback('theme'); }} className="w-4 h-4 accent-blue-600 cursor-pointer" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className={`rounded-2xl border shadow-xs p-6 space-y-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
            <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-slate-700' : 'border-gray-100'}`}>
              <h4 className={`font-bold text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <Lock className="w-4 h-4 text-purple-600" /> Change Security Password
              </h4>
              <ShieldCheck className="w-4 h-4 text-purple-600" />
            </div>

            {savedPass && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> Password updated successfully in database!
              </div>
            )}

            {passError && (
              <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl text-rose-400 text-xs font-semibold">
                {passError}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-3 text-xs" autoComplete="off">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className={`block font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Current Password</label>
                  <button type="button" onClick={() => { setShowForgotModal(true); setForgotStep(1); setForgotError(''); }} className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer">
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input 
                    type={showCurrentPass ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={passData.currentPassword}
                    onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
                    className={`w-full px-3.5 py-2.5 pr-10 border rounded-xl focus:outline-none focus:border-blue-500 ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  />
                  <button type="button" onClick={() => setShowCurrentPass(!showCurrentPass)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer">
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>New Password (Min 8 Chars)</label>
                <div className="relative">
                  <input 
                    type={showNewPass ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={passData.newPassword}
                    onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                    className={`w-full px-3.5 py-2.5 pr-10 border rounded-xl focus:outline-none focus:border-blue-500 ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  />
                  <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer">
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passData.newPassword && (
                  <div className="mt-1.5 space-y-1">
                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-300 ${passStrength.color} ${passStrength.width}`}></div>
                    </div>
                    <span className="text-[10px] text-gray-400 font-semibold">Strength: {passStrength.label}</span>
                  </div>
                )}
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Confirm New Password</label>
                <div className="relative">
                  <input 
                    type={showConfirmPass ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={passData.confirmPassword}
                    onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                    className={`w-full px-3.5 py-2.5 pr-10 border rounded-xl focus:outline-none focus:border-blue-500 ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  />
                  <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer">
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                disabled={passLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center space-x-2 mt-4 disabled:opacity-50"
              >
                <Key className="w-4 h-4" />
                <span>{passLoading ? 'Updating Database...' : 'Update Password'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={`rounded-2xl border p-4 flex flex-col sm:flex-row items-center justify-between text-xs ${isDark ? 'bg-slate-800/80 border-slate-700 text-gray-400' : 'bg-white border-gray-200 text-gray-500 shadow-2xs'}`}>
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-blue-600" />
          <span className="font-bold text-gray-800 dark:text-gray-200">Al-Waqar Transport Driver Suite</span>
          <span>• Secure Fleet Telemetry Edition</span>
        </div>
        <span className="font-mono font-bold mt-2 sm:mt-0 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-slate-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 text-[11px]">
          v1.0.0
        </span>
      </div>

      {/* Email Change OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-5 border border-gray-100">
            <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
              <div className="bg-amber-50 text-amber-600 p-2.5 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Security Verification Required</h3>
                <p className="text-[11px] text-gray-500">Confirm email address modification.</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              For security compliance, changing your registered email requires entering the 6-digit confirmation code dispatched to your inbox. <strong className="text-blue-600">(Demo code: 123456)</strong>
            </p>

            {otpError && (
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-rose-700 text-xs font-semibold">
                {otpError}
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <input 
                type="text" 
                maxLength="6"
                required
                placeholder="Enter 6-digit code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-center font-mono text-lg font-bold tracking-widest text-gray-900 focus:outline-none focus:border-blue-500"
              />

              <div className="flex items-center space-x-3 pt-2">
                <button type="button" onClick={() => { setShowOtpModal(false); setPendingProfileData(null); setOtpError(''); }} className="w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl text-xs transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs transition-colors cursor-pointer shadow-sm">
                  Verify & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-5 border border-gray-100">
            <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
              <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Password Recovery</h3>
                <p className="text-[11px] text-gray-500">
                  {forgotStep === 1 && "Step 1: Enter your registered email"}
                  {forgotStep === 2 && "Step 2: Enter verification code"}
                  {forgotStep === 3 && "Step 3: Create new password"}
                </p>
              </div>
            </div>

            {forgotSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-700 text-xs font-semibold text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600" />
                <p>Password successfully reset in database! You can now log in with your new credentials.</p>
              </div>
            ) : (
              <>
                {forgotError && (
                  <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-rose-700 text-xs font-semibold">
                    {forgotError}
                  </div>
                )}

                {forgotStep === 1 && (
                  <form onSubmit={handleForgotEmailSubmit} className="space-y-4 text-xs">
                    <p className="text-gray-600 leading-relaxed">Enter your account email address. We will verify your identity and send a recovery code.</p>
                    <div>
                      <label className="block font-semibold mb-1 text-gray-700">Email Address</label>
                      <input type="email" required placeholder="e.g. khalid.driver@alwaqartransport.ae" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} className="w-full px-3.5 py-2.5 border rounded-xl focus:outline-none focus:border-blue-500 font-medium bg-gray-50 text-gray-900" />
                    </div>
                    <div className="flex items-center space-x-3 pt-2">
                      <button type="button" onClick={() => setShowForgotModal(false)} className="w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors cursor-pointer">Cancel</button>
                      <button type="submit" className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer shadow-sm">Send Code</button>
                    </div>
                  </form>
                )}

                {forgotStep === 2 && (
                  <form onSubmit={handleForgotOtpSubmit} className="space-y-4 text-xs">
                    <p className="text-gray-600 leading-relaxed">A 6-digit confirmation code has been dispatched to <strong className="text-blue-600">{forgotEmail}</strong>. <span className="text-gray-400">(Demo code: 123456)</span></p>
                    <input type="text" maxLength="6" required placeholder="Enter 6-digit code" value={forgotOtp} onChange={(e) => setForgotOtp(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-center font-mono text-lg font-bold tracking-widest text-gray-900 focus:outline-none focus:border-blue-500" />
                    <div className="flex items-center space-x-3 pt-2">
                      <button type="button" onClick={() => setForgotStep(1)} className="w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors cursor-pointer">Back</button>
                      <button type="submit" className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer shadow-sm">Verify Code</button>
                    </div>
                  </form>
                )}

                {forgotStep === 3 && (
                  <form onSubmit={handleForgotResetSubmit} className="space-y-4 text-xs">
                    <p className="text-gray-600 leading-relaxed">Identity verified successfully. Please enter your new security password below.</p>
                    <div>
                      <label className="block font-semibold mb-1 text-gray-700">New Password (Min 8 Chars)</label>
                      <input type="password" required placeholder="••••••••" value={forgotNewPass} onChange={(e) => setForgotNewPass(e.target.value)} className="w-full px-3.5 py-2.5 border rounded-xl focus:outline-none focus:border-blue-500 font-medium bg-gray-50 text-gray-900" />
                    </div>
                    <div className="flex items-center space-x-3 pt-2">
                      <button type="button" onClick={() => setShowForgotModal(false)} className="w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors cursor-pointer">Cancel</button>
                      <button type="submit" className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer shadow-sm">Reset Password</button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverSettings;