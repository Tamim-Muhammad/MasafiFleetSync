import React, { useState, useRef, useEffect } from 'react';
import { Bell, User, Sun, Sunrise, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DriverDashboardHeader = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  const [driverName, setDriverName] = useState('Driver');
  const [driverProfileImage, setDriverProfileImage] = useState(null);
  
  // FIXED: Strictly bounds to driverId ONLY. Eradicated user table fallbacks.
  const [driverUserId, setDriverUserId] = useState(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user') || '{}');
    return storedUser.driverId || null;
  });

  const navigate = useNavigate();
  const notifRef = useRef(null);

  // Dynamic Greeting Engine based on current hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good Morning', icon: <Sunrise className="w-5 h-5 text-amber-500 animate-pulse" /> };
    if (hour < 18) return { text: 'Good Afternoon', icon: <Sun className="w-5 h-5 text-amber-500 animate-spin-slow" /> };
    return { text: 'Good Evening', icon: <Moon className="w-5 h-5 text-indigo-400" /> };
  };
  const greeting = getGreeting();

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user') || '{}');
    
    // FIXED: Strictly bounds to driverId ONLY. Eradicated user table fallbacks.
    const resolvedId = storedUser.driverId || null;
    setDriverUserId(resolvedId);

    if (storedUser.fullName) {
      setDriverName(storedUser.fullName);
    } else if (storedUser.name) {
      setDriverName(storedUser.name);
    } else if (storedUser.username) {
      setDriverName(storedUser.username);
    }

    if (storedUser.profileImage || storedUser.ProfileImage || storedUser.profileImageUrl || storedUser.ProfileImageUrl) {
      setDriverProfileImage(storedUser.profileImage || storedUser.ProfileImage || storedUser.profileImageUrl || storedUser.ProfileImageUrl);
    }

    // Fetch latest driver record to ensure profile image is up to date if storedUser lacks it
    if (resolvedId) {
      fetch(`http://localhost:5191/api/drivers/${resolvedId}`)
        .then(res => res.json())
        .then(data => {
          if (data) {
            if (data.name || data.Name) setDriverName(data.name || data.Name);
            const img = data.profileImage || data.ProfileImage || data.profileImageUrl || data.ProfileImageUrl;
            if (img) setDriverProfileImage(img);
          }
        })
        .catch(err => console.error("Failed to fetch driver profile data:", err));
    }
  }, []);

  const fetchNotifications = async () => {
    if (!driverUserId) return; // Prevent fetching if no driver ID exists

    try {
      const response = await fetch(`http://localhost:5191/api/Notifications/${driverUserId}`);
      let backendNotifs = [];
      if (response.ok) {
        backendNotifs = await response.json();
      }

      const rawBroadcasts = JSON.parse(localStorage.getItem('admin_system_broadcasts') || '[]');
      const driverBroadcasts = rawBroadcasts
        .filter(a => !a.audience || a.audience.includes('All') || a.audience.includes('Driver') || a.audience.includes('Portals'))
        .map(a => ({
          id: `broadcast-${a.id}`,
          title: `[Announcement] ${a.title}`,
          message: a.message,
          createdAt: new Date().toISOString(),
          isRead: false
        }));

      const readBroadcasts = JSON.parse(localStorage.getItem('driver_read_broadcasts') || '[]');
      const markedBroadcasts = driverBroadcasts.map(b => ({
        ...b,
        isRead: readBroadcasts.includes(b.id) ? true : b.isRead
      }));

      setNotifications([...markedBroadcasts, ...backendNotifs]);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    if (driverUserId) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 5000);
      return () => clearInterval(interval);
    }
  }, [driverUserId]);

  const handleMarkAsRead = async () => {
    if (!driverUserId) return; // Prevent action if no driver ID exists

    try {
      await fetch(`http://localhost:5191/api/Notifications/${driverUserId}/read`, {
        method: 'PUT'
      });

      const currentRead = JSON.parse(localStorage.getItem('driver_read_broadcasts') || '[]');
      const broadcastIds = notifications
        .filter(n => String(n.id).startsWith('broadcast-'))
        .map(n => n.id);

      const mergedRead = Array.from(new Set([...currentRead, ...broadcastIds]));
      localStorage.setItem('driver_read_broadcasts', JSON.stringify(mergedRead));

      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-40 shadow-xs font-sans">
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          {greeting.text}, {driverName} <span className="inline-block">{greeting.icon}</span>
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
              const nextState = !showNotifications;
              setShowNotifications(nextState);
              if (nextState && unreadCount > 0) {
                handleMarkAsRead();
              }
            }}
            className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-50">
              <div className="px-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                <h4 className="font-bold text-gray-900 text-sm">Notifications</h4>
                <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                  {unreadCount === 0 ? 'All Read' : `${unreadCount} Unread`}
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-400">No notifications found.</div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="p-3 hover:bg-gray-50 transition-colors">
                      <p className="text-xs font-bold text-gray-800">{n.title}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{n.message}</p>
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Clean, Driver Identity Badge with Profile Image support */}
        <div className="flex items-center space-x-3 border-l pl-6 border-gray-200">
          {driverProfileImage ? (
            <img 
              src={`http://localhost:5191/uploads/${driverProfileImage}`} 
              alt={driverName} 
              className="w-9 h-9 rounded-full object-cover border border-blue-500 shadow-xs"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-500 flex items-center justify-center text-blue-700 font-bold">
              <User className="w-5 h-5" />
            </div>
          )}
          <div className="hidden md:block text-left">
            <h4 className="text-xs font-bold text-gray-900 leading-tight">{driverName}</h4>
            <p className="text-[11px] text-gray-500">Driver</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DriverDashboardHeader;