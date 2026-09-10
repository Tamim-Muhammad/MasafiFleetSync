import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerStatsWidget from './CustomerStatsWidget';
import customerHero from '../../assets/images/customer-hero.png';
import { Calendar, Bell, ArrowRight, Droplets, Navigation, MapPin, Truck, ShieldCheck } from 'lucide-react';

const CustomerDashboardHome = () => {
  const navigate = useNavigate();
  const [liveOrders, setLiveOrders] = useState([]);
  const [leasesData, setLeasesData] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [customerName, setCustomerName] = useState('Tamim');

  useEffect(() => {
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user') || '{}';
    const storedUser = JSON.parse(userStr);
    
    if (storedUser.fullName) setCustomerName(storedUser.fullName);
    else if (storedUser.name) setCustomerName(storedUser.name);
    else if (storedUser.username) setCustomerName(storedUser.username);

    // --- BULLETPROOF TOKEN EXTRACTOR ---
    const getAuthToken = () => {
      return localStorage.getItem('token') || 
             sessionStorage.getItem('token') || 
             localStorage.getItem('jwt') || 
             localStorage.getItem('userToken') || 
             storedUser.token;
    };

    // Fetch water orders from secure user-specific endpoint
    const fetchLiveOrders = async () => {
      try {
        const token = getAuthToken();
        if (!token) return;

        const response = await fetch('http://localhost:5191/api/WaterOrders/my-orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const orders = await response.json();
          if (Array.isArray(orders)) setLiveOrders(orders);
        }
      } catch (error) {
        console.error("Error fetching live orders for dashboard:", error);
      }
    };

    // Fetch rental agreements from secure user-specific endpoint
    const fetchLeases = async () => {
      try {
        const token = getAuthToken();
        if (!token) return;

        const response = await fetch('http://localhost:5191/api/RentalAgreements/my-leases', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) setLeasesData(data);
        }
      } catch (error) {
        console.error("Error fetching leases for dashboard:", error);
      }
    };

    const loadAnnouncements = () => {
      const allBroadcasts = JSON.parse(localStorage.getItem('admin_system_broadcasts') || '[]');
      const customerAnnouncements = allBroadcasts.filter(a => 
        !a.audience || a.audience.includes('All') || a.audience.includes('Customer') || a.audience.includes('Portals')
      );
      setAnnouncements(customerAnnouncements);
    };

    fetchLiveOrders();
    fetchLeases();
    loadAnnouncements();

    const interval = setInterval(() => {
      fetchLiveOrders();
      fetchLeases();
      loadAnnouncements();
    }, 5000); // Polling every 5 seconds to catch admin approvals live

    return () => clearInterval(interval);
  }, []);

  // Compute exact dynamic counts for the 4 stat cards
  const activeOrdersCount = liveOrders.filter(o => {
    const stat = (o.orderStatus || o.OrderStatus || '').toLowerCase();
    return ['dispatched', 'enroute', 'arrived', 'accepted'].includes(stat);
  }).length;

  const pendingOrdersCount = liveOrders.filter(o => {
    const stat = (o.orderStatus || o.OrderStatus || '').toLowerCase();
    return ['pending', 'pending review', 'scheduled'].includes(stat);
  }).length;

  const activeLeasesCount = leasesData.filter(r => (r.status || r.Status || '').toLowerCase() === 'active').length;
  const pendingLeasesCount = leasesData.filter(r => (r.status || r.Status || '').toLowerCase() === 'pending').length;

  const activeOrder = liveOrders.find(o => {
    const stat = (o.orderStatus || o.OrderStatus || '').toLowerCase();
    return ['dispatched', 'enroute', 'arrived', 'accepted'].includes(stat);
  }) || (liveOrders.length > 0 ? liveOrders[0] : null);

  const upcomingOrder = liveOrders.find(o => {
    const stat = (o.orderStatus || o.OrderStatus || '').toLowerCase();
    return ['pending', 'pending review', 'scheduled'].includes(stat);
  });

  return (
    <div className="w-full space-y-8 font-sans pb-12">
      
      {/* Clean Hero Banner (Buttons Removed) */}
      <div className="relative bg-[#0B2A4D] rounded-3xl p-10 text-white flex items-center justify-between shadow-xl overflow-hidden min-h-[200px]">
        <div className="max-w-lg relative z-10 space-y-2">
          <h1 className="text-4xl font-black tracking-tight">Welcome back, {customerName}!</h1>
          <p className="text-blue-200 text-sm font-medium">Monitor live water tanker deliveries, track vehicle rentals, and review dispatch notifications below.</p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-2/5 flex items-center justify-end">
          <img src={customerHero} alt="Fleet" className="h-full w-full object-contain object-right-bottom translate-x-4" />
        </div>
      </div>

      {/* Dynamic Statistics Cards */}
      <CustomerStatsWidget 
        activeOrdersCount={activeOrdersCount}
        pendingOrdersCount={pendingOrdersCount}
        activeLeasesCount={activeLeasesCount}
        pendingLeasesCount={pendingLeasesCount}
      />

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left / Center: Active Delivery Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border-2 border-gray-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                  Live Telemetry Feed
                </span>
                <h3 className="text-base font-black text-gray-900 mt-1">Active Delivery</h3>
              </div>
              <span className="text-xs font-black px-3 py-1 rounded-full uppercase bg-emerald-100 text-emerald-800 animate-pulse border border-emerald-200">
                {activeOrder ? (activeOrder.orderStatus || activeOrder.OrderStatus || 'En Route') : 'No Active Trip'}
              </span>
            </div>

            {activeOrder ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 border border-gray-200/80 p-4 rounded-2xl space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Assigned Driver</p>
                    <p className="text-sm font-black text-gray-900 truncate">
                      {activeOrder.driverName || activeOrder.DriverName || 'Assigned Driver'}
                    </p>
                    <p className="text-[11px] text-blue-600 font-semibold">{activeOrder.driverPhone || activeOrder.DriverPhone || '+971 50 000 0000'}</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200/80 p-4 rounded-2xl space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Tanker / Volume</p>
                    <p className="text-sm font-black text-gray-900">MFS-1245</p>
                    <p className="text-[11px] text-gray-600 font-semibold">{activeOrder.volumeGallons ?? activeOrder.VolumeGallons ?? 5000} Gallons</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200/80 p-4 rounded-2xl space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Settlement (COD)</p>
                    <p className="text-sm font-black text-[#0B2A4D]">AED {Number(activeOrder.grossAmountAED ?? activeOrder.GrossAmountAED ?? 525).toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs bg-blue-50/50 p-3.5 rounded-2xl border border-blue-100">
                  <MapPin size={16} className="text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-gray-900">Delivery Address:</p>
                    <p className="text-gray-600">{activeOrder.deliveryAddress || activeOrder.DeliveryAddress || 'Masafi Industrial Zone'}</p>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/customer/dashboard/track/${activeOrder.id || activeOrder.Id}`)}
                  className="w-full bg-[#0B2A4D] hover:bg-blue-900 text-white font-black py-3 rounded-2xl transition text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                >
                  <Navigation size={15} />
                  <span>Track Live →</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-10 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <Truck size={24} />
                </div>
                <p className="text-xs text-gray-500 font-medium">No active delivery currently on the road.</p>
                <button
                  onClick={() => navigate('/customer/dashboard/order')}
                  className="bg-[#0B2A4D] text-white font-bold px-5 py-2.5 rounded-xl text-xs inline-flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Order Bulk Water Now</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Right Sidebar: Upcoming Deliveries & Announcements */}
        <div className="space-y-6">
          
          <div className="bg-white p-6 rounded-3xl border-2 border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
               <h3 className="font-black text-gray-900 text-sm uppercase tracking-wider">Upcoming & Scheduled Orders</h3>
               <button 
                 onClick={() => navigate('/customer/dashboard/my-orders')} 
                 className="text-xs text-blue-600 font-bold cursor-pointer hover:underline bg-transparent border-none p-0 flex items-center gap-1"
               >
                 <span>View All</span>
                 <ArrowRight size={12} />
               </button>
            </div>

            {upcomingOrder ? (
              <div className="flex gap-3 items-start bg-blue-50/50 p-3.5 rounded-xl border border-blue-100">
                <div className="bg-blue-600 text-white p-2.5 rounded-xl h-fit shrink-0">
                    <Calendar className="w-4 h-4" />
                </div>
                <div className="space-y-1 text-xs">
                    <p className="font-bold text-gray-900 truncate max-w-[210px]">{upcomingOrder.deliveryAddress || upcomingOrder.DeliveryAddress}</p>
                    <p className="text-gray-600 font-medium">Volume: {upcomingOrder.volumeGallons || upcomingOrder.VolumeGallons || 5000} Gallons</p>
                    <span className="inline-block bg-amber-100 text-amber-800 font-black px-2 py-0.5 rounded text-[10px]">
                      Status: {upcomingOrder.orderStatus || upcomingOrder.OrderStatus || 'Pending Review'}
                    </span>
                </div>
              </div>
            ) : (
              <div className="flex gap-3 items-center py-2">
                <div className="bg-gray-100 text-gray-500 p-3 rounded-xl shrink-0">
                    <Droplets className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-800">No Pending Shipments</p>
                    <p className="text-[11px] text-gray-400">Place a new water order to queue an upcoming delivery.</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-3xl border-2 border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
               <h3 className="font-black text-gray-900 text-sm uppercase tracking-wider">System Announcements</h3>
               <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full">
                 {announcements.length} Live
               </span>
            </div>

            {announcements.length > 0 ? (
              <div className="space-y-3">
                {announcements.map((item) => (
                  <div key={item.id} className="flex gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="bg-blue-50 p-2.5 rounded-xl h-fit shrink-0 text-blue-600">
                        <Bell className="w-4 h-4" />
                    </div>
                    <div className="space-y-1 text-xs">
                        <p className="text-gray-900 font-black">{item.title}</p>
                        <p className="text-gray-600 leading-relaxed">{item.message}</p>
                        <span className="inline-block text-[10px] bg-amber-50 text-amber-700 font-black uppercase px-2 py-0.5 rounded border border-amber-200">
                          {item.priority || 'Normal'} Priority
                        </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <ShieldCheck size={14} className="text-emerald-600" /> Normal Operations
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  All Masafi and Fujairah regional corridors are fully operational. No major weather or traffic delays reported.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
};

export default CustomerDashboardHome;