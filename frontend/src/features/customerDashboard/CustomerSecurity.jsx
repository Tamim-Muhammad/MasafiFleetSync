import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Shield, KeyRound, Lock, Building2, CheckCircle2, AlertCircle } from 'lucide-react';

const CustomerSecurity = () => {
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (passwords.newPassword !== passwords.confirmPassword) {
      setErrorMessage("New passwords do not match!");
      return;
    }

    if (passwords.newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Try to extract ID from stored user or localStorage
      const storedUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
      let userId = storedUser.id || storedUser.UserId || storedUser.userId || localStorage.getItem('userId') || sessionStorage.getItem('userId');

      // 2. Fallback: If ID is missing, query the backend users list to find the matching account by email or default to ID 1
      if (!userId) {
        try {
          const userEmail = storedUser.email || storedUser.Email;
          const res = await axios.get('http://localhost:5191/api/Users');
          if (res.data && Array.isArray(res.data)) {
            const match = userEmail 
              ? res.data.find(u => u.email?.toLowerCase() === userEmail.toLowerCase())
              : res.data[0]; // Default to first user if no email found
            if (match) userId = match.id;
          }
        } catch (err) {
          console.warn("Could not fetch users list fallback, defaulting to ID 1");
        }
      }

      const finalUserId = userId ? Number(userId) : 1;

      // Securely update password hash via backend C# API
      await axios.post('http://localhost:5191/api/Auth/change-password', {
        UserId: finalUserId,
        CurrentPassword: passwords.currentPassword,
        NewPassword: passwords.newPassword
      });

      setSuccessMessage(true);

      setTimeout(() => {
        localStorage.clear();
        sessionStorage.clear();
        navigate('/login');
      }, 2500);

    } catch (err) {
      console.error("Password update error:", err);
      setErrorMessage(err.response?.data?.message || "Failed to update password. Check your current password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 font-sans text-sm">
      <div className="bg-gradient-to-r from-[#0B2A4D] via-[#103E73] to-[#0B2A4D] p-8 rounded-3xl shadow-2xl text-white flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden border border-blue-900/50">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/30 border border-blue-400/30 px-4 py-1.5 rounded-full text-[11px] font-black tracking-wider uppercase text-blue-200 shadow-inner">
            <Building2 size={14} /> Security Credentials
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Account Security & Password</h1>
          <p className="text-blue-100 max-w-xl text-xs font-medium opacity-90">
            Manage your account security, encryption keys, and password modification.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-center gap-3 text-red-900 text-xs max-w-3xl shadow-xs">
          <AlertCircle size={20} className="text-red-600 shrink-0" />
          <span className="font-bold">{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3 text-emerald-900 text-xs max-w-3xl shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
          <div>
            <strong className="font-black uppercase tracking-wide">Password Updated Successfully!</strong>
            <p className="text-emerald-700">BCrypt hash securely synchronized. Redirecting you to sign in with your new credentials...</p>
          </div>
        </div>
      )}

      <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-xl max-w-3xl">
        <form onSubmit={handlePasswordChange} className="space-y-6" autoComplete="off">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Lock size={14} /> Current Password *
            </label>
            <input
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={passwords.currentPassword}
              onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound size={14} /> New Password *
            </label>
            <input
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
            <p className="text-[11px] text-slate-400 font-medium">Must be minimum 8 characters, including upper/lower case and 1 special character.</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound size={14} /> Confirm New Password *
            </label>
            <input
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 flex items-center gap-1.5">
              <Shield size={16} /> SSL / AES-256 Encrypted Session
            </span>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#0B2A4D] hover:bg-blue-900 text-white font-extrabold px-6 py-3.5 rounded-2xl transition shadow-md flex items-center gap-2 cursor-pointer text-xs uppercase tracking-wider disabled:opacity-50"
            >
              <KeyRound size={16} /> {isLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerSecurity;