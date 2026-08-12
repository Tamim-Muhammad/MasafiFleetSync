import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, User, Settings, Shield, Clock } from 'lucide-react';

const CustomerDashboardHeader = ({ title }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // Added search state
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle global search submission when pressing Enter
  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      // Redirect to transaction history or orders page with search query
      navigate(`/customer/dashboard/history?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery(''); // Optional: clear input after search
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center relative z-40">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <p className="text-xs text-gray-400 mt-0.5">Your logistics partner for seamless operations.</p>
      </div>

      <div className="flex items-center gap-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search anything (Press Enter)..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchSubmit}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2A4D] w-64"
          />
        </div>

        {/* Notifications Popover Wrapper */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsOpen(false);
            }}
            className="relative text-gray-600 hover:text-[#0B2A4D] cursor-pointer p-1"
          >
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1 rounded-full">3</span>
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50">
              <div className="px-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                <span className="font-bold text-gray-800 text-sm">Notifications</span>
                <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full">3 New</span>
              </div>
              <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                <div className="p-3 hover:bg-gray-50 transition cursor-pointer">
                  <p className="text-xs font-bold text-gray-800">Driver assigned to your order</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Ahmed Hassan is en route with your 5,000G tanker.</p>
                  <span className="text-[10px] text-gray-400 mt-1 flex items-center gap-1"><Clock size={10}/> 10 mins ago</span>
                </div>
                <div className="p-3 hover:bg-gray-50 transition cursor-pointer">
                  <p className="text-xs font-bold text-gray-800">Rental contract approved</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Your heavy tanker lease agreement is ready.</p>
                  <span className="text-[10px] text-gray-400 mt-1 flex items-center gap-1"><Clock size={10}/> 2 hours ago</span>
                </div>
                <div className="p-3 hover:bg-gray-50 transition cursor-pointer">
                  <p className="text-xs font-bold text-gray-800">Payment receipt generated</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">COD receipt for Order #J-250518 is downloadable.</p>
                  <span className="text-[10px] text-gray-400 mt-1 flex items-center gap-1"><Clock size={10}/> Yesterday</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => {
              setIsOpen(!isOpen);
              setIsNotifOpen(false);
            }}
            className="flex items-center gap-3 cursor-pointer border-l pl-6 hover:opacity-80 transition text-left"
          >
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-200 text-blue-600">
              <User size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-tight">Muhammad</p>
              <p className="text-xs text-gray-500">Customer</p>
            </div>
            <ChevronDown size={16} className={`text-gray-500 transition-transform ml-1 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Minimalist Dropdown Menu */}
          {isOpen && (
            <div className="absolute right-0 mt-4 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
              <div className="px-4 py-2 text-xs text-gray-400 uppercase font-bold">Account</div>
              <button 
                onClick={() => { setIsOpen(false); navigate('/customer/dashboard/profile'); }}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                <User size={16}/> My Profile
              </button>
              <button 
                onClick={() => { setIsOpen(false); navigate('/customer/dashboard/settings'); }}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                <Settings size={16}/> Settings
              </button>
              <button 
                onClick={() => { setIsOpen(false); navigate('/customer/dashboard/security'); }}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
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