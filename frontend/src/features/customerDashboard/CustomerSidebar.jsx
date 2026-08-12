import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Droplets, 
  Truck, 
  ShoppingBag, 
  History, 
  MapPin, 
  LifeBuoy, 
  LogOut
} from 'lucide-react';
import logo from '../../assets/logo/logo-customer.png';

const CustomerSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear any user tokens/session data if needed
    localStorage.removeItem('customerToken');
    
    // Redirect user to login portal
    navigate('/login');
  };

  const navItems = [
    { path: '/customer/dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} />, end: true },
    { path: '/customer/dashboard/order', name: 'Order Water', icon: <Droplets size={20} /> },
    { path: '/customer/dashboard/track', name: 'Track Delivery', icon: <Truck size={20} /> },
    { path: '/customer/dashboard/rentals', name: 'Vehicle Rentals', icon: <ShoppingBag size={20} /> },
    { path: '/customer/dashboard/my-orders', name: 'My Orders', icon: <History size={20} /> },
    { path: '/customer/dashboard/history', name: 'Transaction History', icon: <History size={20} /> },
    { path: '/customer/dashboard/addresses', name: 'Saved Addresses', icon: <MapPin size={20} /> },
    { path: '/customer/dashboard/support', name: 'Support Center', icon: <LifeBuoy size={20} /> },
  ];

  return (
    <div className="h-screen w-64 bg-[#0B2A4D] text-white flex flex-col justify-between shadow-xl">
      {/* Top: Logo & Navigation */}
      <div>
        <div className="py-6 px-6 border-b border-white/10 flex items-center justify-start">
          <img 
            src={logo} 
            alt="Al-Waqar Logo" 
            className="h-16 w-auto object-contain" 
          />
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all font-semibold text-sm ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                    : 'text-blue-100 hover:bg-[#153e6d] hover:text-white'
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom: Logout Button */}
      <div className="p-4 border-t border-white/10">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3.5 px-4 py-3.5 text-red-200 hover:bg-red-500/15 hover:text-red-100 rounded-xl transition w-full cursor-pointer font-semibold text-sm"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default CustomerSidebar;