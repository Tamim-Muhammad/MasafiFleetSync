import React, { useState, createContext, useContext, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import DriverSidebar from './DriverSidebar';
import DriverDashboardHeader from './DriverDashboardHeader';
import SOSModal from '../customerDashboard/SOSModal'; 
import { PhoneCall } from 'lucide-react';

const DriverThemeContext = createContext();
export const useDriverTheme = () => useContext(DriverThemeContext);

const DriverDashboardLayout = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  
  const [driverActiveContext, setDriverActiveContext] = useState({
    vehicleNumber: "MFS-1245",
    route: "Masafi-Fujairah Route 4",
    siteName: "Masafi Mountain Pass"
  });

  // --- ROUTE GUARD USING SESSION STORAGE ---
  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    const storedRole = sessionStorage.getItem('role')?.toLowerCase() || '';

    if (!storedUser || !storedRole.includes('driver')) {
      console.warn("Unauthorized access attempt. Redirecting to appropriate portal.");
      
      if (storedRole.includes('customer')) {
        navigate('/customer/dashboard', { replace: true });
      } else if (storedRole.includes('admin') || storedRole.includes('operator') || storedRole.includes('manager')) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        sessionStorage.clear();
        navigate('/login', { replace: true });
      }
    }
  }, [navigate]);

  useEffect(() => {
    const fetchDriverActiveTrip = async () => {
      try {
        const storedUser = JSON.parse(sessionStorage.getItem('user') || '{}');
        
        // STRICT FIX: Eradicated ALL fallbacks to storedUser.id or storedUser.Id
        const driverId = storedUser.driverId || null;

        if (!driverId) return;

        const response = await fetch('http://localhost:5191/api/WaterOrders');
        if (response.ok) {
          const orders = await response.json();
          if (Array.isArray(orders)) {
            const activeTrip = orders.find(o => {
              const stat = (o.orderStatus || o.OrderStatus || '').toLowerCase();
              const matchesDriver = String(o.assignedDriverId || o.AssignedDriverId) === String(driverId);
              return matchesDriver && ['dispatched', 'enroute', 'arrived'].includes(stat);
            });

            if (activeTrip) {
              setDriverActiveContext({
                vehicleNumber: `Tanker Unit #${activeTrip.assignedVehicleId || activeTrip.AssignedVehicleId || '18'}`,
                route: activeTrip.deliveryAddress || activeTrip.DeliveryAddress || "Masafi Regional Corridor",
                siteName: activeTrip.deliveryAddress || activeTrip.DeliveryAddress || "Active Route Milestone"
              });
            }
          }
        }
      } catch (err) {
        console.error("Failed to sync driver telemetry for SOS:", err);
      }
    };

    fetchDriverActiveTrip();
  }, []);

  return (
    <DriverThemeContext.Provider value={{ darkMode, setDarkMode }}>
      <div className={`flex min-h-screen font-sans relative transition-colors duration-200 ${
        darkMode ? 'bg-slate-950 text-gray-100 dark' : 'bg-gray-100 text-gray-900'
      }`}>
        <DriverSidebar darkMode={darkMode} />
        <div className="flex-1 flex flex-col min-w-0">
          <DriverDashboardHeader darkMode={darkMode} />
          <main className="flex-1 p-6 pb-24 overflow-y-auto">
            <Outlet context={{ darkMode, setDarkMode }} />
          </main>
        </div>

        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setIsSOSOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 shadow-2xl flex items-center space-x-3 transition-all transform hover:scale-105 border-4 border-white dark:border-slate-800 animate-pulse cursor-pointer"
          >
            <div className="bg-white text-red-600 p-2 rounded-full">
              <PhoneCall className="w-6 h-6 animate-bounce" />
            </div>
            <span className="font-extrabold text-lg tracking-wider pr-2">SOS</span>
          </button>
        </div>

        <SOSModal 
          isOpen={isSOSOpen} 
          onClose={() => setIsSOSOpen(false)} 
          userRole="driver" 
          activeContext={driverActiveContext} 
        />
      </div>
    </DriverThemeContext.Provider>
  );
};

export default DriverDashboardLayout;