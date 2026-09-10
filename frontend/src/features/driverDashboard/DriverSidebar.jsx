import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo/logo-customer.png';
import { 
  LayoutDashboard, 
  ClipboardList, 
  History, 
  Wallet, 
  ShieldCheck, 
  FileText, 
  Truck, 
  HelpCircle, 
  Settings, 
  LogOut,
  AlertTriangle
} from 'lucide-react';

const DriverSidebar = () => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/driver/dashboard', icon: LayoutDashboard },
    { name: 'My Assignments', path: '/driver/assignments', icon: ClipboardList },
    { name: 'Deliveries History', path: '/driver/history', icon: History },
    { name: 'Earnings', path: '/driver/earnings', icon: Wallet },
    { name: 'Compliance', path: '/driver/compliance', icon: ShieldCheck },
    { name: 'Documents', path: '/driver/documents', icon: FileText },
    { name: 'Vehicle Profile', path: '/driver/vehicle-profile', icon: Truck },
    { name: 'Support', path: '/driver/support', icon: HelpCircle },
    { name: 'Settings', path: '/driver/settings', icon: Settings },
  ];

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    navigate('/login');
  };

  return (
    <>
      <aside className="w-64 bg-[#0B2A4D] text-gray-300 flex flex-col h-screen sticky top-0 border-r border-blue-900/50 justify-between">
        <div className="flex flex-col h-full">
          <div className="py-6 px-6 border-b border-white/10 flex items-center justify-start shrink-0">
            <img 
              src={logo} 
              alt="Al-Waqar Transport Logo" 
              className="h-20 w-auto object-contain"
            />
          </div>

          <nav className="flex-1 flex flex-col justify-around py-2 px-3">
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

          <div className="p-4 border-t border-white/10 shrink-0">
            <button
              onClick={handleLogoutClick}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-gray-100 space-y-5 text-center">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle size={24} />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-gray-900">Confirm logout?</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                You will need to sign in again to access the driver portal.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-2xl text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-black shadow-md shadow-red-600/20 transition cursor-pointer"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DriverSidebar;