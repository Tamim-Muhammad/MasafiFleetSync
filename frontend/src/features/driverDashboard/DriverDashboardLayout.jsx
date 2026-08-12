import React, { useState, createContext, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import DriverSidebar from './DriverSidebar';
import DriverDashboardHeader from './DriverDashboardHeader';
import { PhoneCall } from 'lucide-react';

// Create context for sharing dark mode across all driver screens and layout elements
const DriverThemeContext = createContext();
export const useDriverTheme = () => useContext(DriverThemeContext);

const DriverDashboardLayout = () => {
  const [darkMode, setDarkMode] = useState(false);

  const handleSOSClick = () => {
    alert("Emergency SOS Triggered! GPS Coordinates and Alert Packet transmitted to Dispatch Recovery Desk.");
  };

  return (
    <DriverThemeContext.Provider value={{ darkMode, setDarkMode }}>
      <div className={`flex min-h-screen font-sans relative transition-colors duration-200 ${
        darkMode ? 'bg-slate-950 text-gray-100 dark' : 'bg-gray-100 text-gray-900'
      }`}>
        {/* Sidebar Navigation */}
        <DriverSidebar darkMode={darkMode} />

        {/* Main App Canvas */}
        <div className="flex-1 flex flex-col min-w-0">
          <DriverDashboardHeader darkMode={darkMode} />
          
          {/* Nested Content Outlet with shared theme context passed down */}
          <main className="flex-1 p-6 pb-24 overflow-y-auto">
            <Outlet context={{ darkMode, setDarkMode }} />
          </main>
        </div>

        {/* Floating SOS Emergency Button (Persistent across all driver screens) */}
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={handleSOSClick}
            className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 shadow-2xl flex items-center space-x-3 transition-all transform hover:scale-105 border-4 border-white dark:border-slate-800 animate-pulse cursor-pointer"
          >
            <div className="bg-white text-red-600 p-2 rounded-full">
              <PhoneCall className="w-6 h-6 animate-bounce" />
            </div>
            <span className="font-extrabold text-lg tracking-wider pr-2">SOS</span>
          </button>
        </div>
      </div>
    </DriverThemeContext.Provider>
  );
};

export default DriverDashboardLayout;