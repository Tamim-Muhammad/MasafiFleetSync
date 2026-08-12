import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerDeliveryTracker from './CustomerDeliveryTracker'; 
import CustomerStatsWidget from './CustomerStatsWidget';
import customerHero from '../../assets/images/customer-hero.png';
import { Calendar, Bell } from 'lucide-react';
import api from '../../api';

const CustomerDashboardHome = () => {
  const navigate = useNavigate();
  const [liveOrders, setLiveOrders] = useState([]);
  const [announcements, setAnnouncements] = useState([]); // <-- 1. Add state for announcements

  useEffect(() => {
    const fetchLiveOrders = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const customerId = storedUser.id || "cmslp0iy30000xcuoff9hgxr7";

        const response = await api.get(`/orders?customerId=${customerId}`);
        const orders = Array.isArray(response.data) ? response.data : (response.data.orders || []);
        setLiveOrders(orders);
      } catch (error) {
        console.error("Error fetching live orders for dashboard:", error);
      }
    };

    // 2. Fetch announcements from your new backend endpoint
    const fetchAnnouncements = async () => {
      try {
        const response = await api.get('/announcements');
        setAnnouncements(response.data);
      } catch (error) {
        console.error("Error fetching announcements:", error);
      }
    };

    fetchLiveOrders();
    fetchAnnouncements();
  }, []);

  // Prioritize Accepted/Active orders first, otherwise fallback to latest order
  const latestOrder = liveOrders.find(o => o.status === 'Accepted' || o.status === 'En Route') || (liveOrders.length > 0 ? liveOrders[liveOrders.length - 1] : null);

  return (
    <div className="w-full space-y-8">
      <div className="relative bg-[#0B2A4D] rounded-3xl p-10 text-white flex items-center justify-between shadow-xl overflow-hidden min-h-[200px]">
        <div className="max-w-lg relative z-10">
          <h1 className="text-4xl font-bold mb-3">Welcome back, Muhammad!</h1>
          <p className="text-blue-200 text-lg">Here’s what’s happening with your deliveries and rentals today.</p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-2/5 flex items-center justify-end">
          <img src={customerHero} alt="Fleet" className="h-full w-full object-contain object-right-bottom translate-x-4" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CustomerDeliveryTracker />
        </div>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
               <h3 className="font-bold text-gray-800">Upcoming Delivery</h3>
               <button 
                 onClick={() => navigate('/customer/dashboard/my-orders')} 
                 className="text-xs text-blue-600 font-bold cursor-pointer hover:underline bg-transparent border-none p-0"
               >
                 View All
               </button>
            </div>
            {latestOrder ? (
              <div className="flex gap-3">
                <div className="bg-blue-50 p-2 rounded-lg h-fit">
                    <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-800 truncate max-w-[200px]">{latestOrder.deliveryAddress}</p>
                    <p className="text-xs text-gray-500">Volume: {latestOrder.volumeGallons || 5000} Gallons</p>
                    <p className="text-xs text-amber-600 font-bold mt-1">Status: {latestOrder.status || 'Pending Review'}</p>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <div className="bg-blue-50 p-2 rounded-lg h-fit">
                    <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-800">No Upcoming Deliveries</p>
                    <p className="text-xs text-gray-400">Order water to schedule a shipment</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
               <h3 className="font-bold text-gray-800">Announcements</h3>
               <button 
                 onClick={() => alert("System Notice: All active logistics alerts and holiday notices have been displayed.")}
                 className="text-xs text-blue-600 font-bold cursor-pointer hover:underline bg-transparent border-none p-0"
               >
                 View All
               </button>
            </div>
            {announcements.length > 0 ? (
              announcements.map((item) => (
                <div key={item.id} className="flex gap-3 mb-4 last:mb-0">
                  <div className="bg-blue-50 p-2 rounded-lg h-fit">
                      <Bell className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                      <p className="text-sm text-gray-700 font-medium">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.message}</p>
                      <span className="text-[10px] text-amber-600 font-bold uppercase">{item.priority}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400">No active broadcast feeds found.</p>
            )}
          </div>
        </div>
      </div>

      <CustomerStatsWidget />
    </div>
  );
};

export default CustomerDashboardHome;