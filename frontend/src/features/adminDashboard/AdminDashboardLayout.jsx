import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import { Outlet } from 'react-router-dom';

const AdminDashboardLayout = () => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  return (
    <div className={`flex h-screen overflow-hidden font-sans transition-colors duration-200 ${darkMode ? 'bg-slate-950 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
      {/* Persistent Admin Sidebar */}
      <AdminSidebar darkMode={darkMode} />

      {/* Main Content Viewport */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        <main className={`flex-1 overflow-y-auto p-6 transition-colors duration-200 ${darkMode ? 'bg-slate-950' : 'bg-gray-50'}`}>
          <Outlet context={{ darkMode, setDarkMode, toggleDarkMode }} />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;