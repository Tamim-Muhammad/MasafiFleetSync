import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MapPin, 
  ShieldCheck, 
  Truck, 
  AlertTriangle, 
  DollarSign, 
  FileText, 
  Users, 
  Settings,
  LifeBuoy,
  LogOut
} from 'lucide-react';
import logoCustomer from '../../assets/logo/logo-customer.png';

const AdminSidebar = () => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleConfirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Dispatch Center', path: '/admin/dispatch', icon: MapPin },
    { name: 'Compliance', path: '/admin/compliance', icon: ShieldCheck },
    { name: 'Fleet Management', path: '/admin/inventory', icon: Truck },
    { name: 'Recovery Dispatch', path: '/admin/recovery', icon: AlertTriangle },
    { name: 'Financials', path: '/admin/financials', icon: DollarSign },
    { name: 'Reports', path: '/admin/reports', icon: FileText },
    { name: 'Users & Roles', path: '/admin/users', icon: Users },
    { name: 'Announcements & Support', path: '/admin/announcements', icon: LifeBuoy },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <>
      <aside className="w-64 bg-[#0B2A4D] text-white flex flex-col h-screen sticky top-0 shadow-lg justify-between font-sans">
        <div className="flex flex-col h-full">
          {/* Full Logo Image Container */}
          <div className="p-6 border-b border-blue-900/50 flex items-center justify-center shrink-0">
            <img src={logoCustomer} alt="Al-Waqar Transport Logo" className="w-full max-w-[160px] object-contain" />
          </div>

          {/* Navigation Links - Equally Spread */}
          <nav className="flex-1 flex flex-col justify-around py-2 px-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'text-blue-100/70 hover:bg-blue-900/40 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom Section: Logout Only */}
          <div className="p-4 border-t border-blue-900/50 bg-[#09223e] shrink-0">
            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-all duration-200 cursor-pointer"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Clean Professional Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-5 text-gray-900">
            <div className="space-y-1.5">
              <h3 className="text-base font-black text-gray-900 tracking-tight">Confirm logout?</h3>
              <p className="text-xs text-gray-500 font-medium">
                You will need to sign in again to access the admin console.
              </p>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-bold py-2.5 rounded-xl transition cursor-pointer shadow-2xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="flex-1 bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-bold py-2.5 rounded-xl transition cursor-pointer shadow-2xs"
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

export default AdminSidebar;