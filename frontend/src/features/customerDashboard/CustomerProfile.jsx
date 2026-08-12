import React, { useState } from 'react';
import { User, Phone, Mail, ShieldCheck, Building2, Save } from 'lucide-react';

const CustomerProfile = () => {
  const [profile, setProfile] = useState({
    fullName: 'Muhammad Tamim',
    phone: '+971-55-123-4567',
    email: 'muhammad.tamim@masafifleetsync.ae',
    role: 'Water Customer / Renter'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Customer profile updated successfully.');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 font-sans text-sm">
      <div className="bg-gradient-to-r from-[#0B2A4D] via-[#103E73] to-[#0B2A4D] p-8 rounded-3xl shadow-2xl text-white flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden border border-blue-900/50">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/30 border border-blue-400/30 px-4 py-1.5 rounded-full text-[11px] font-black tracking-wider uppercase text-blue-200 shadow-inner">
            <Building2 size={14} /> Account Settings
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Customer Profile Management</h1>
          <p className="text-blue-100 max-w-xl text-xs font-medium opacity-90">
            View and update your personal contact details and account identity.
          </p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-xl max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <User size={14} /> Full Name
            </label>
            <input
              type="text"
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Phone size={14} /> Phone Number (SMS OTP Verified)
            </label>
            <input
              type="text"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Mail size={14} /> Recovery Email Address
            </label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
              <ShieldCheck size={16} /> Role: {profile.role}
            </span>
            <button
              type="submit"
              className="bg-[#0B2A4D] hover:bg-blue-900 text-white font-extrabold px-6 py-3.5 rounded-2xl transition shadow-md flex items-center gap-2 cursor-pointer text-xs"
            >
              <Save size={16} /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerProfile;