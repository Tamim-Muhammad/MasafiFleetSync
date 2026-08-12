import React from 'react';
import { PhoneCall, AlertTriangle, X, ShieldAlert, MapPin, Truck } from 'lucide-react';

const SOSModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="bg-red-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <ShieldAlert size={22} className="text-white animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Emergency Operations (SOS)</h3>
              <p className="text-xs text-red-100">Al-Waqar 24/7 Dispatch Control Room</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" />
            <p className="text-xs text-red-900 font-medium leading-relaxed">
              Use this channel strictly for urgent on-site breakdowns, accidents, or immediate delivery crises. Your location telemetry is active.
            </p>
          </div>

          {/* Active Context Helper */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between text-gray-600 font-semibold">
              <span className="flex items-center gap-1.5"><Truck size={14} className="text-[#0B2A4D]" /> Active Vehicle:</span>
              <span className="text-gray-900 font-bold">MFS-1245 (Water Tanker)</span>
            </div>
            <div className="flex items-center justify-between text-gray-600 font-semibold">
              <span className="flex items-center gap-1.5"><MapPin size={14} className="text-[#0B2A4D]" /> Nearest Zone:</span>
              <span className="text-gray-900 font-bold">Al Hail Construction Site</span>
            </div>
          </div>

          {/* Action Buttons & Hotline Display */}
          <div className="space-y-3 pt-2">
            <a 
              href="tel:+971550000000"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 text-sm shadow-lg shadow-red-600/20 transition cursor-pointer"
            >
              <PhoneCall size={18} /> Call 24/7 Operations Control
            </a>
            
            <p className="text-center text-[11px] font-semibold text-gray-400">
              Direct Hotline: <span className="text-gray-700 font-bold">+971 55 000 0000</span>
            </p>

            <button 
              onClick={onClose}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-2xl text-xs transition cursor-pointer"
            >
              Dismiss / Return to Dashboard
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SOSModal;