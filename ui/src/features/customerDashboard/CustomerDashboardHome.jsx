import React from 'react';
import CustomerDeliveryTracker from './CustomerDeliveryTracker'; 
import CustomerStatsWidget from './CustomerStatsWidget';
import customerHero from '../../assets/images/customer-hero.png';
import { Calendar, Bell, ClipboardList } from 'lucide-react'; // Added icons

const upcomingDeliveries = [
  { id: 1, title: 'Al Hail Construction Site', time: '10:00 AM - 12:00 PM', date: 'Tomorrow, May 23' }
];

const announcements = [
  { id: 1, title: 'Scheduled maintenance on May 25', time: '2 hours ago' },
  { id: 2, title: 'Eid Al Adha Holiday Notice', time: '1 day ago' }
];

const CustomerDashboardHome = () => {
  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      {/* Hero Section - Keeping your existing code */}
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
          {/* Upcoming Delivery Card with Icon */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
               <h3 className="font-bold text-gray-800">Upcoming Delivery</h3>
               <span className="text-xs text-blue-600 font-bold cursor-pointer hover:underline">View All</span>
            </div>
            {upcomingDeliveries.map((delivery) => (
              <div key={delivery.id} className="flex gap-3">
                <div className="bg-blue-50 p-2 rounded-lg h-fit">
                    <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-800">{delivery.title}</p>
                    <p className="text-xs text-gray-500">{delivery.date}</p>
                    <p className="text-xs text-gray-400">{delivery.time}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Announcements Card with Icon */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
               <h3 className="font-bold text-gray-800">Announcements</h3>
               <span className="text-xs text-blue-600 font-bold cursor-pointer hover:underline">View All</span>
            </div>
            {announcements.map((item) => (
              <div key={item.id} className="flex gap-3 mb-4 last:mb-0">
                <div className="bg-blue-50 p-2 rounded-lg h-fit">
                    <Bell className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <p className="text-sm text-gray-700">{item.title}</p>
                    <p className="text-xs text-gray-400">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <CustomerStatsWidget />
    </div>
  );
};

export default CustomerDashboardHome;