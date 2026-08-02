import React, { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, User, Sliders, LogOut, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DriverDashboardHeader = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-40 shadow-xs">
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          Good Morning, Muhammad Tamim <span className="inline-block animate-bounce">👋</span>
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">Drive safe. Deliver trust.</p>
      </div>

      <div className="flex items-center space-x-6">
        
        <button 
          onClick={() => setIsOnline(!isOnline)}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full border transition-all ${
            isOnline ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-100 border-gray-300 text-gray-600'
          }`}
        >
          <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></span>
          <span className="text-xs font-semibold">{isOnline ? 'Online' : 'Offline'}</span>
        </button>

        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              3
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-50">
              <div className="px-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                <h4 className="font-bold text-gray-900 text-sm">Notifications</h4>
                <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">3 Unread</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                <div className="p-3 hover:bg-gray-50 transition-colors cursor-pointer">
                  <p className="text-xs font-bold text-gray-800">New assignment received</p>
                  <p className="text-[11px] text-gray-500">Job #J-250518-02 assigned by dispatch.</p>
                  <span className="text-[10px] text-gray-400 mt-1 block">10 min ago</span>
                </div>
                <div className="p-3 hover:bg-gray-50 transition-colors cursor-pointer">
                  <p className="text-xs font-bold text-gray-800">Vehicle registration expires soon</p>
                  <p className="text-[11px] text-gray-500">Document renewal required in 92 days.</p>
                  <span className="text-[10px] text-gray-400 mt-1 block">1 day ago</span>
                </div>
              </div>
              <div className="pt-2 px-3 text-center border-t border-gray-100">
                <button 
                  onClick={() => { setShowNotifications(false); navigate('/driver/notifications'); }}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="relative border-l pl-6 border-gray-200" ref={profileRef}>
          <button 
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center space-x-3 cursor-pointer group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-500 flex items-center justify-center text-blue-700 font-bold">
              <User className="w-5 h-5" />
            </div>
            <div className="hidden md:block text-left">
              <h4 className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">Muhammad Tamim</h4>
              <p className="text-[11px] text-gray-500">Driver</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-900">Muhammad Tamim</p>
                <p className="text-[11px] text-gray-400 font-mono">DR-10234</p>
              </div>
              <button 
                onClick={() => { setShowProfileMenu(false); navigate('/driver/settings'); }}
                className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <Sliders className="w-4 h-4" />
                <span>App Preferences</span>
              </button>
              <div className="border-t border-gray-100 my-1"></div>
              <button 
                onClick={() => { setShowProfileMenu(false); navigate('/login'); }}
                className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default DriverDashboardHeader;