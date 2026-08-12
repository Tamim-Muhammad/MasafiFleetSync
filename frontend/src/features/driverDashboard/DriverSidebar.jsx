import React from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../../assets/logo/logo-customer.png';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Calendar, 
  History, 
  Wallet, 
  ShieldCheck, 
  FileText, 
  Truck, 
  HelpCircle, 
  Settings, 
  UserCheck
} from 'lucide-react';

const DriverSidebar = () => {
  const menuItems = [
    { name: 'Dashboard', path: '/driver/dashboard', icon: LayoutDashboard },
    { name: 'My Assignments', path: '/driver/assignments', icon: ClipboardList },
    { name: 'My Schedule', path: '/driver/schedule', icon: Calendar },
    { name: 'Deliveries History', path: '/driver/history', icon: History },
    { name: 'Earnings', path: '/driver/earnings', icon: Wallet },
    { name: 'Compliance', path: '/driver/compliance', icon: ShieldCheck },
    { name: 'Documents', path: '/driver/documents', icon: FileText },
    { name: 'Vehicle Profile', path: '/driver/vehicle-profile', icon: Truck },
    { name: 'Support', path: '/driver/support', icon: HelpCircle },
    { name: 'Settings', path: '/driver/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0B2A4D] text-gray-300 flex flex-col h-screen sticky top-0 border-r border-blue-900/50 justify-between">
      {/* Top: Logo & Navigation */}
      <div>
        {/* Brand Header */}
        <div className="py-6 px-6 border-b border-white/10 flex items-center justify-start">
          <img 
            src={logo} 
            alt="Al-Waqar Transport Logo" 
            className="h-20 w-auto object-contain"
          />
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/15'
                      : 'hover:bg-[#1e4a7d] hover:text-white'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </div>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Driver Profile Footer Widget (Unified Background) */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-blue-600/30 border-2 border-blue-500 flex items-center justify-center text-blue-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <h4 className="text-white text-sm font-bold truncate">Muhammad Tamim</h4>
            <p className="text-xs text-gray-400">Driver</p>
          </div>
        </div>
        <div className="text-[11px] text-gray-400 space-y-1 bg-black/20 p-2.5 rounded-lg border border-white/5">
          <p><span className="text-gray-500">Driver ID:</span> <span className="text-white font-mono font-medium">DR-10234</span></p>
          <p><span className="text-gray-500">Vehicle:</span> <span className="text-white font-medium">Tanker - 5,000 Gal</span></p>
        </div>
      </div>
    </aside>
  );
};

export default DriverSidebar;