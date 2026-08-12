import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import CustomerSidebar from './CustomerSidebar';
import CustomerDashboardHeader from './CustomerDashboardHeader';
import SOSModal from './SOSModal';
import { PhoneCall } from 'lucide-react';

const CustomerDashboardLayout = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [isSOSOpen, setIsSOSOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className={`flex h-screen w-screen overflow-hidden font-sans ${darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-gray-900'}`}>
      <aside className="w-64 flex-shrink-0 h-full">
        <CustomerSidebar />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <CustomerDashboardHeader title="Dashboard" />

        <main className={`flex-1 overflow-y-auto p-8 ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
          <div className="w-full space-y-8 pb-12">
            <Outlet context={{ darkMode, setDarkMode }} />
          </div>
        </main>

        <footer className={`px-8 py-4 border-t text-xs flex justify-between shrink-0 ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-gray-200 text-gray-500'}`}>
          <span>© 2026 Al Waqar Transport. All rights reserved.</span>
          <div className="flex gap-6">
            <span>Privacy Policy</span>
            <span>Terms & Conditions</span>
            <span>Version 1.0.0</span>
          </div>
        </footer>

        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setIsSOSOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 shadow-2xl flex items-center space-x-3 transition-all transform hover:scale-105 border-4 border-white dark:border-slate-900 animate-pulse cursor-pointer"
          >
            <div className="bg-white text-red-600 p-2 rounded-full">
              <PhoneCall className="w-6 h-6 animate-bounce" />
            </div>
            <span className="font-extrabold text-lg tracking-wider pr-2">SOS</span>
          </button>
        </div>
      </div>

      <SOSModal isOpen={isSOSOpen} onClose={() => setIsSOSOpen(false)} />
    </div>
  );
};

export default CustomerDashboardLayout;