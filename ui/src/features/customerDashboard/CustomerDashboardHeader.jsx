import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronDown, User, Settings, Shield } from 'lucide-react';

const CustomerDashboardHeader = ({ title }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center relative">
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>

      <div className="flex items-center gap-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2A4D] w-64"
          />
        </div>

        {/* Notifications */}
        <button className="relative text-gray-600 hover:text-[#0B2A4D]">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1 rounded-full">3</span>
        </button>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-3 cursor-pointer border-l pl-6 hover:opacity-80 transition"
          >
            <p className="text-sm font-bold text-gray-800">Muhammad</p>
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
              <User size={20} className="text-gray-500" />
            </div>
            <ChevronDown size={16} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Minimalist Dropdown Menu */}
          {isOpen && (
            <div className="absolute right-0 mt-4 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
              <div className="px-4 py-2 text-xs text-gray-400 uppercase font-bold">Account</div>
              <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <User size={16}/> My Profile
              </button>
              <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <Settings size={16}/> Settings
              </button>
              <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <Shield size={16}/> Security
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default CustomerDashboardHeader;