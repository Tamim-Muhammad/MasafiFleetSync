import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import CustomerSidebar from './CustomerSidebar';
import CustomerDashboardHeader from './CustomerDashboardHeader';
import SOSModal from './SOSModal';
import { PhoneCall } from 'lucide-react';

const CustomerDashboardLayout = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [showInactiveModal, setShowInactiveModal] = useState(false);

  const [userActiveContext, setUserActiveContext] = useState({
    hasActiveService: false, 
    orderNumber: null,
    vehicleNumber: null,
    siteName: null
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  // Synchronized directly with CustomerDeliveryTracker.jsx logic
  useEffect(() => {
    const checkActiveOrders = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const customerId = storedUser.id || 2;
        const token = localStorage.getItem('token');

        // Fetch securely from the authenticated my-orders endpoint
        const response = await fetch('http://localhost:5191/api/WaterOrders/my-orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const allOrders = await response.json();
          
          if (Array.isArray(allOrders) && allOrders.length > 0) {
            // Replicating your exact tracking filter logic
            const activeOrder = allOrders.find(o => {
              const stat = (o.orderStatus || o.OrderStatus || '').toLowerCase();
              const isActiveTrip = ['dispatched', 'enroute', 'arrived'].includes(stat);
              return isActiveTrip;
            });

            if (activeOrder) {
              setUserActiveContext({
                hasActiveService: true,
                orderNumber: `ORD-${activeOrder.id || activeOrder.Id}`,
                vehicleNumber: (activeOrder.assignedVehicleId || activeOrder.AssignedVehicleId) 
                  ? `Vehicle ${activeOrder.assignedVehicleId || activeOrder.AssignedVehicleId}` 
                  : "Pending Assignment",
                siteName: activeOrder.deliveryAddress || activeOrder.DeliveryAddress
              });
            } else {
              setUserActiveContext(prev => ({ ...prev, hasActiveService: false }));
            }
          }
        }
      } catch (error) {
        console.error("SOS Tracker Sync Failed:", error);
      }
    };

    checkActiveOrders();
    // Syncing interval to 10s to match your delivery tracker
    const interval = setInterval(checkActiveOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSOSTrigger = () => {
    if (userActiveContext.hasActiveService) {
      setIsSOSOpen(true);
    } else {
      setShowInactiveModal(true);
    }
  };

  return (
    <div className={`flex h-screen w-screen overflow-hidden font-sans ${darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-gray-900'}`}>
      <aside className="w-64 flex-shrink-0 h-full">
        <CustomerSidebar />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <CustomerDashboardHeader title="Dashboard" />

        <main className={`flex-1 overflow-y-auto p-8 ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
          <div className="w-full space-y-8 pb-12">
            <Outlet context={{ darkMode, setDarkMode }} />
          </div>
        </main>

        <footer className={`px-8 py-4 border-t text-xs flex justify-between shrink-0 ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-gray-200 text-gray-500'}`}>
          <span>© 2026 Al Waqar Transport. All rights reserved.</span>
          <div className="flex gap-6">
            <span>Privacy Policy</span>
            <span>Terms & Conditions</span>
            <span>Version 1.0.0</span>
          </div>
        </footer>

        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={handleSOSTrigger}
            className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 shadow-2xl flex items-center space-x-3 transition-all transform hover:scale-105 border-4 border-white dark:border-slate-900 animate-pulse cursor-pointer"
          >
            <div className="bg-white text-red-600 p-2 rounded-full">
              <PhoneCall className="w-6 h-6 animate-bounce" />
            </div>
            <span className="font-extrabold text-lg tracking-wider pr-2">SOS</span>
          </button>
        </div>
      </div>

      <SOSModal 
        isOpen={isSOSOpen} 
        onClose={() => setIsSOSOpen(false)} 
        userRole="customer" 
        activeContext={userActiveContext} 
      />

      {showInactiveModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 max-w-md w-full overflow-hidden p-6 space-y-4 text-center">
            <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner text-xl font-bold">
              ⚠
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-gray-900">No Active Orders or Leases</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Emergency dispatch and recovery channels are strictly reserved for clients with active water supply orders or heavy vehicle lease agreements.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3 text-xs text-gray-700 space-y-1">
              <p className="font-semibold text-gray-900">Need general assistance or want to rent equipment?</p>
              <p className="text-[11px] text-gray-500">Contact customer care at <span className="text-gray-800 font-bold">+971 55 000 0000</span> or place a new order online.</p>
            </div>

            <button 
              onClick={() => setShowInactiveModal(false)}
              className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 px-4 rounded-2xl text-xs transition cursor-pointer shadow-md"
            >
              Close & Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboardLayout;