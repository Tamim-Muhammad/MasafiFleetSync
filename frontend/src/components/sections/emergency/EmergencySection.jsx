import React from 'react';

const EmergencySection = () => {
  return (
    <footer className="bg-[#1e2f38] text-white">
      {/* Main Footer Block */}
      <div className="py-12 px-8 max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10">
        
        {/* Left: Text - Keep it clear and left-aligned */}
        <div className="flex-1">
          <h3 className="text-2xl font-bold mb-2">Roadside Emergency?</h3>
          <p className="text-blue-100 text-sm opacity-80 leading-relaxed">
            Our specialized heavy-duty recovery team is on standby 24/7 across the Masafi/Fujairah region.
          </p>
        </div>

        {/* Center: Icons - Use a tighter grid */}
        <div className="flex gap-8 text-center">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xl">⚡</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">Fast Dispatch</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-xl">🛡️</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">Certified Crew</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-xl">🕒</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">24/7 Service</span>
          </div>
        </div>

        {/* Right: Button */}
        <div className="flex-1 flex justify-end">
          <a href="tel:+971XXXXXXXXX" className="bg-red-600 hover:bg-red-700 px-8 py-3 rounded-lg font-bold transition flex items-center gap-2">
            <span>📞</span> Call 800-ALWAQAR
          </a>
        </div>
      </div>

      {/* The "Anchor" Strip - This fixes your white screen issue! */}
      <div className="bg-[#17252d] py-4 text-center text-[10px] text-gray-500 uppercase tracking-widest">
        © 2026 Al-Waqar Transport L.L.C. All rights reserved.
      </div>
    </footer>
  );
};

export default EmergencySection;