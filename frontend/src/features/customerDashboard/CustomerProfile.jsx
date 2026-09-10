import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, ShieldCheck, Building2, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';

const CustomerProfile = () => {
  const [profile, setProfile] = useState({
    fullName: '',
    phone: '',
    email: '',
    role: 'Water Customer / Renter',
    userId: 1
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load real user details from localStorage on mount and resolve dynamic ID properly
  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
      const resolvedId = storedUser.id || storedUser.UserId || storedUser.userId || localStorage.getItem('userId') || sessionStorage.getItem('userId') || 1;
      
      setProfile({
        fullName: storedUser.fullName || storedUser.name || 'Muhammad Tamim',
        phone: storedUser.phoneNumber || storedUser.phone || '+971-55-123-4567',
        email: storedUser.email || storedUser.recoveryEmail || 'muhammad.tamim@masafifleetsync.ae',
        role: storedUser.role || 'Water Customer / Renter',
        userId: Number(resolvedId)
      });
    } catch (err) {
      console.error("Failed to parse stored user session:", err);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      // 1. Sync update permanently with SQL database via UsersController endpoint
      await axios.put(`http://localhost:5191/api/Users/${profile.userId}/profile`, {
        FullName: profile.fullName,
        Email: profile.email
      });

      // 2. Update local storage user object completely so active session and header reflect changes instantly
      const storedUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
      const updatedUser = {
        ...storedUser,
        fullName: profile.fullName,
        name: profile.fullName,
        email: profile.email
      };

      if (localStorage.getItem('user')) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      if (sessionStorage.getItem('user')) {
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
      }

      setShowSuccess(true);
      
      // 3. Dispatch storage sync events to refresh layout state elements instantly
      window.dispatchEvent(new Event('storage'));

      setTimeout(() => {
        setShowSuccess(false);
      }, 2500);

    } catch (err) {
      console.error("Profile update error:", err);
      setErrorMessage(err.response?.data?.message || "Failed to update profile in database.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 font-sans text-sm">
      
      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-[#0B2A4D] via-[#103E73] to-[#0B2A4D] p-8 rounded-3xl shadow-2xl text-white flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden border border-blue-900/50">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/30 border border-blue-400/30 px-4 py-1.5 rounded-full text-[11px] font-black tracking-wider uppercase text-blue-200 shadow-inner">
            <Building2 size={14} /> Account Settings
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Customer Profile Management</h1>
          <p className="text-blue-100 max-w-xl text-xs font-medium opacity-90">
            View and update your personal contact details and account identity credentials. Changes apply globally across your portal and database.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-center gap-3 text-red-900 text-xs max-w-3xl shadow-xs">
          <AlertCircle size={20} className="text-red-600 shrink-0" />
          <span className="font-bold">{errorMessage}</span>
        </div>
      )}

      {/* Success Notification Banner */}
      {showSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3 text-emerald-900 text-xs animate-in fade-in duration-200 max-w-3xl shadow-xs">
          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
          <div>
            <strong className="font-black uppercase tracking-wide">Profile Updated & Saved in Database!</strong>
            <p className="text-emerald-700 font-medium">Your credentials have been permanently synchronized.</p>
          </div>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-xl max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <User size={14} /> Full Name *
            </label>
            <input
              type="text"
              required
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Phone size={14} /> Phone Number (Read-Only / Admin Verified)
            </label>
            <input
              type="text"
              disabled
              value={profile.phone}
              className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-500 font-bold cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Mail size={14} /> Email Address *
            </label>
            <input
              type="email"
              required
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
              <ShieldCheck size={16} /> Role: {profile.role}
            </span>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#0B2A4D] hover:bg-blue-900 text-white font-extrabold px-6 py-3.5 rounded-2xl transition shadow-md flex items-center gap-2 cursor-pointer text-xs uppercase tracking-wider disabled:opacity-50"
            >
              <Save size={16} /> {isLoading ? 'Synchronizing...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerProfile;