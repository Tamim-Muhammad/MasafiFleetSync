import React from 'react';
import { Outlet } from 'react-router-dom';
import CustomerSidebar from './CustomerSidebar';
import CustomerDashboardHeader from './CustomerDashboardHeader';

const CustomerDashboardLayout = () => {
  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Sidebar: Fixed width, pinned to the left */}
      <aside className="w-64 flex-shrink-0">
        <CustomerSidebar />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header: Dynamic based on the route title */}
        <CustomerDashboardHeader title="Dashboard" />

        {/* Dynamic Content Area: This is where your nested routes render */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </main>

        {/* Footer: Consistent with enterprise design standards */}
        <footer className="px-8 py-4 bg-white border-t border-gray-200 text-xs text-gray-500 flex justify-between">
          <span>© 2026 Masafi Fleet Sync. All rights reserved.</span>
          <div className="flex gap-6">
            <span>Privacy Policy</span>
            <span>Terms & Conditions</span>
            <span>Version 1.0.0</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default CustomerDashboardLayout;