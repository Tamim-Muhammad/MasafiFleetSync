import React from 'react';

const EmergencySection = () => {
  return (
    <section className="py-16 px-8 bg-[#1e2f38] text-white">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10">
        
        {/* Left: Balanced Typography */}
        <div className="flex-1 text-center lg:text-left">
          {/* Reduced from font-black to font-bold for a more professional, less "noisy" feel */}
          <h3 className="text-3xl font-bold text-white mb-3">
            Roadside Emergency?
          </h3>
          <p className="text-blue-100 text-lg opacity-80 max-w-sm mx-auto lg:mx-0 leading-relaxed">
            Our specialized heavy-duty recovery team is on standby 24/7 across the Masafi/Fujairah region.
          </p>
        </div>

        {/* Middle: Clean Icons with proper spacing */}
        <div className="flex gap-8 text-xs font-semibold uppercase tracking-wider text-blue-200">
          <div className="flex flex-col items-center gap-2">
            <span className="text-2xl opacity-90">⚡</span>
            <span>Fast Dispatch</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-2xl opacity-90">🛡️</span>
            <span>Certified Crew</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-2xl opacity-90">🕒</span>
            <span>24/7 Service</span>
          </div>
        </div>

        {/* Right: Button */}
        <div className="flex-1 flex justify-center lg:justify-end">
          <a 
            href="tel:+971XXXXXXXXX" 
            className="flex items-center gap-3 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all duration-300 shadow-md text-lg"
          >
            <span>📞</span> 
            Call +971-XX-XXXXXXX
          </a>
        </div>
      </div>
    </section>
  );
};

export default EmergencySection;