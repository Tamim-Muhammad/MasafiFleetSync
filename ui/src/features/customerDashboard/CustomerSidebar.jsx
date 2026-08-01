import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Droplets, 
  Truck, 
  ShoppingBag, 
  History, 
  MapPin, 
  LifeBuoy, 
  LogOut,
  Phone
} from 'lucide-react';
import logo from '../../assets/logo/logo-customer.png';

const CustomerSidebar = () => {
  const navItems = [
    { path: '/customer/dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/customer/dashboard/order', name: 'Order Water', icon: <Droplets size={20} /> },
    { path: '/customer/dashboard/track', name: 'Track Delivery', icon: <Truck size={20} /> },
    { path: '/customer/dashboard/rentals', name: 'Vehicle Rentals', icon: <ShoppingBag size={20} /> },
    { path: '/customer/dashboard/orders', name: 'My Orders', icon: <History size={20} /> },
    { path: '/customer/dashboard/history', name: 'Transaction History', icon: <History size={20} /> },
    { path: '/customer/dashboard/addresses', name: 'Saved Addresses', icon: <MapPin size={20} /> },
    { path: '/customer/dashboard/support', name: 'Support Center', icon: <LifeBuoy size={20} /> },
  ];

  return (
    <div className="h-screen w-64 bg-[#0B2A4D] text-white flex flex-col justify-between">
      {/* Top: Logo & Navigation */}
      <div>
        {/* Updated logo container with h-20 for a larger, professional look */}
        <div className="py-6 px-6 border-b border-white/10 flex items-center justify-start">
          <img 
            src={logo} 
            alt="Al-Waqar Logo" 
            className="h-20 w-auto object-contain" 
          />
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-[#1e4a7d] text-white' : 'text-gray-300 hover:bg-[#1e4a7d] hover:text-white'
                }`
              }
            >
              {item.icon}
              <span className="text-sm font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom: Emergency Support & Logout */}
      <div className="p-4 border-t border-white/10 space-y-4">
        <div className="bg-[#E74C3C] p-4 rounded-lg">
          <p className="text-[10px] uppercase font-bold text-white/80 mb-1">Emergency Support</p>
          <p className="text-lg font-bold mb-2">800-ALWAQAR</p>
          <button className="w-full bg-white text-[#E74C3C] text-xs font-bold py-2 rounded transition hover:bg-gray-100 flex items-center justify-center gap-2">
            <Phone size={12} /> Call Now
          </button>
        </div>
        
        <button className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white transition w-full">
          <LogOut size={20} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default CustomerSidebar;