import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, User, Settings, Shield, Clock } from 'lucide-react';

const CustomerDashboardHeader = ({ title }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Live Notifications State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Dynamic User State
  const [userName, setUserName] = useState('Muhammad');

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  // Function to sync user name from storage
  const syncUserName = () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
      if (storedUser.fullName) {
        setUserName(storedUser.fullName);
      } else if (storedUser.name) {
        setUserName(storedUser.name);
      }
    } catch (err) {
      console.error("Failed to parse user session for header", err);
    }
  };

  // Load user details from storage on mount and listen for updates
  useEffect(() => {
    syncUserName();

    // Listen for custom profile update events or cross-tab storage changes
    window.addEventListener('storage', syncUserName);
    return () => {
      window.removeEventListener('storage', syncUserName);
    };
  }, []);

  // Fetch live notifications from backend API and admin broadcasts
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
        const customerId = storedUser.id || storedUser.userId || 1;
        const token = localStorage.getItem('token');

        // 1. Fetch backend API notifications securely
        const response = await fetch(`http://localhost:5191/api/Notifications/${customerId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        let backendNotifs = [];
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) backendNotifs = data;
        }

        // 2. Fetch admin broadcasts from localStorage
        const rawBroadcasts = JSON.parse(localStorage.getItem('admin_system_broadcasts') || '[]');
        const customerBroadcasts = rawBroadcasts
          .filter(a => !a.audience || a.audience.includes('All') || a.audience.includes('Customer') || a.audience.includes('Portals'))
          .map(a => ({
            id: `broadcast-${a.id}`,
            title: `[Announcement] ${a.title}`,
            message: a.message,
            createdAt: new Date().toISOString(),
            isRead: false
          }));

        // Retrieve read broadcast IDs stored permanently in localStorage
        const readBroadcasts = JSON.parse(localStorage.getItem('customer_read_broadcasts') || '[]');
        const markedBroadcasts = customerBroadcasts.map(b => ({
          ...b,
          isRead: readBroadcasts.includes(b.id) ? true : b.isRead
        }));

        const combined = [...markedBroadcasts, ...backendNotifs];
        setNotifications(combined);
        setUnreadCount(combined.filter(n => !n.isRead).length);
      } catch (err) {
        console.error("Failed to fetch customer notifications from backend:", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  // Professional UX: Mark notifications as read permanently when the popover opens
  const handleOpenNotifications = async () => {
    const nextState = !isNotifOpen;
    setIsNotifOpen(nextState);
    setIsOpen(false);

    if (nextState && unreadCount > 0) {
      setUnreadCount(0);
      
      // Save all current broadcast IDs into localStorage so they stay read permanently
      const currentRead = JSON.parse(localStorage.getItem('customer_read_broadcasts') || '[]');
      const broadcastIds = notifications
        .filter(n => String(n.id).startsWith('broadcast-'))
        .map(n => n.id);
      
      const mergedRead = Array.from(new Set([...currentRead, ...broadcastIds]));
      localStorage.setItem('customer_read_broadcasts', JSON.stringify(mergedRead));

      // Also call backend to mark database notifications as read securely
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
        const customerId = storedUser.id || storedUser.userId || 1;
        const token = localStorage.getItem('token');
        
        await fetch(`http://localhost:5191/api/Notifications/${customerId}/read`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (err) {
        console.error("Failed to sync read status with backend:", err);
      }

      // Update local state to reflect read status
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }
  };

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

  // Smart Search: Route to different pages based on the search query prefix/keywords
  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      const query = searchQuery.trim().toLowerCase();
      
      if (query.includes('cnt') || query.includes('lease') || query.includes('contract')) {
        navigate(`/customer/dashboard/my-leases?search=${encodeURIComponent(searchQuery)}`);
      } else if (query.includes('address') || query.includes('pin') || query.includes('yard')) {
        navigate(`/customer/dashboard/addresses?search=${encodeURIComponent(searchQuery)}`);
      } else {
        // Default to orders & deliveries
        navigate(`/customer/dashboard/my-orders?search=${encodeURIComponent(searchQuery)}`);
      }
      
      setSearchQuery('');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center relative z-40 font-sans">
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
            placeholder="Search orders, leases, addresses..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchSubmit}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2A4D] w-64"
          />
        </div>

        {/* Notifications Popover Wrapper */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={handleOpenNotifications}
            className="relative text-gray-600 hover:text-[#0B2A4D] cursor-pointer p-1"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50">
              <div className="px-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                <span className="font-bold text-gray-800 text-sm">Notifications</span>
                <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full">
                  {unreadCount === 0 ? 'All Read' : `${unreadCount} New`}
                </span>
              </div>
              <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-400 font-semibold">
                    No new notifications right now.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      onClick={() => navigate('/customer/dashboard/track')}
                      className="p-3 hover:bg-gray-50 transition cursor-pointer space-y-1"
                    >
                      <p className="text-xs font-bold text-gray-800">{notif.title}</p>
                      <p className="text-[11px] text-gray-500 leading-relaxed">{notif.message}</p>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1 pt-0.5">
                        <Clock size={10}/> {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
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
              <p className="text-sm font-bold text-gray-900 leading-tight">{userName}</p>
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