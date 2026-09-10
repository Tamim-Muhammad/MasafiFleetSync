import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Droplets, 
  Truck, 
  ShoppingBag, 
  History, 
  MapPin, 
  LifeBuoy, 
  LogOut,
  FileText
} from 'lucide-react';
import logo from '../../assets/logo/logo-customer.png';

const CustomerSidebar = () => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleConfirmLogout = () => {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { path: '/customer/dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} />, end: true },
    { path: '/customer/dashboard/order', name: 'Order Water', icon: <Droplets size={20} /> },
    { path: '/customer/dashboard/track', name: 'Track Delivery', icon: <Truck size={20} /> },
    { path: '/customer/dashboard/rentals', name: 'Vehicle Rentals', icon: <ShoppingBag size={20} /> },
    { path: '/customer/dashboard/my-leases', name: 'My Leases', icon: <FileText size={20} /> },
    { path: '/customer/dashboard/my-orders', name: 'My Orders', icon: <History size={20} /> },
    { path: '/customer/dashboard/history', name: 'Transaction History', icon: <History size={20} /> },
    { path: '/customer/dashboard/addresses', name: 'Saved Addresses', icon: <MapPin size={20} /> },
    { path: '/customer/dashboard/support', name: 'Support Center', icon: <LifeBuoy size={20} /> },
  ];

  return (
    <>
      <aside className="w-64 bg-[#0B2A4D] text-white flex flex-col h-screen sticky top-0 shadow-xl justify-between font-sans">
        <div className="flex flex-col h-full">
          {/* Top: Logo */}
          <div className="py-6 px-6 border-b border-white/10 flex items-center justify-start shrink-0">
            <img 
              src={logo} 
              alt="Al-Waqar Logo" 
              className="h-16 w-auto object-contain" 
            />
          </div>

          {/* Navigation Links - Equally Spread */}
          <nav className="flex-1 flex flex-col justify-around py-2 px-4">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                      : 'text-blue-100 hover:bg-[#153e6d] hover:text-white'
                  }`
                }
              >
                {item.icon}
                <span className="truncate">{item.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* Bottom: Logout Button */}
          <div className="p-4 border-t border-white/10 shrink-0">
            <button 
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center gap-3.5 px-4 py-3 text-red-200 hover:bg-red-500/15 hover:text-red-100 rounded-xl transition w-full cursor-pointer font-semibold text-sm"
            >
              <LogOut size={20} className="shrink-0" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Custom Clean Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 space-y-6 animate-in fade-in zoom-in duration-150 text-gray-900">
            <div className="space-y-2">
              <h3 className="text-xl font-black text-gray-900">Confirm logout?</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                You will need to sign in again to access your client portal.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200 font-bold py-3 rounded-2xl text-xs transition cursor-pointer shadow-2xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 bg-white hover:bg-red-50 text-red-600 border-2 border-red-200 hover:border-red-400 font-bold py-3 rounded-2xl text-xs transition cursor-pointer shadow-2xs"
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

export default CustomerSidebar;