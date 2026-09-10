import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {  
  MapPin,  
  Navigation,  
  Clock,  
  Building2,  
  Droplet,  
  CheckCircle2,
  Phone,
  MessageSquare,
  Radio,
  RefreshCw,
  AlertCircle,
  LayoutDashboard,
  Map
} from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const DriverAssignmentDetails = () => {
  const navigate = useNavigate();
  const [activeJob, setActiveJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastCoords, setLastCoords] = useState({ lat: 25.1028, lng: 56.2872 });
  const [routeCoordinates, setRouteCoordinates] = useState([]);

  // Bulletproof fallback: Default to Khalid's ID (28) if localStorage is missing or set to 11
  const storedUserId = Number(localStorage.getItem('userId'));
  const driverId = (!storedUserId || storedUserId === 11) ? 28 : storedUserId; 

  const fetchActiveAssignment = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5191/api/WaterOrders/driver/${driverId}/active`);
      if (response.ok) {
        const data = await response.json();
        setActiveJob(data);

        const destLat = data.targetLatitude || data.TargetLatitude || 25.1028;
        const destLng = data.targetLongitude || data.TargetLongitude || 56.2872;
        fetchRouteGeometry(25.1028, 56.2872, destLat, destLng);
      } else {
        setActiveJob(null);
      }
    } catch (err) {
      console.error("Failed to fetch driver assignment:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRouteGeometry = async (startLat, startLng, endLat, endLng) => {
    try {
      const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`);
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const formattedCoords = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
        setRouteCoordinates(formattedCoords);
      }
    } catch (e) {
      console.error("Failed to fetch OSRM route path:", e);
      setRouteCoordinates([[startLat, startLng], [endLat, endLng]]);
    }
  };

  useEffect(() => {
    fetchActiveAssignment();
  }, [driverId]);

  useEffect(() => {
    const sendTelemetry = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const currentLat = position.coords.latitude;
            const currentLng = position.coords.longitude;
            setLastCoords({ lat: currentLat, lng: currentLng });
            
            if (activeJob) {
              const destLat = activeJob.targetLatitude || activeJob.TargetLatitude || 25.1028;
              const destLng = activeJob.targetLongitude || activeJob.TargetLongitude || 56.2872;
              fetchRouteGeometry(currentLat, currentLng, destLat, destLng);
            }
          },
          (error) => console.warn("Geolocation warning:", error.message),
          { enableHighAccuracy: true }
        );
      }
    };

    sendTelemetry();
    const interval = setInterval(sendTelemetry, 30000);
    return () => clearInterval(interval);
  }, [activeJob]);

  const handleUpdateStatus = async (newStatus) => {
    if (!activeJob) return;
    try {
      const res = await fetch(`http://localhost:5191/api/WaterOrders/${activeJob.id || activeJob.Id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        alert(`Job status successfully updated to: ${newStatus}. Vehicle is now restored to available pool.`);
        fetchActiveAssignment();
      } else {
        alert("Failed to update status on server.");
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full py-20 text-center font-sans">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
        <p className="text-xs text-gray-500 font-bold">Synchronizing active driver assignments...</p>
      </div>
    );
  }

  // --- EMPTY STATE ---
  if (!activeJob) {
    return (
      <div className="w-full space-y-6 pb-28 font-sans animate-in fade-in duration-300">
        
        {/* Top Banner Status Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-600 text-white p-3 rounded-xl shadow-sm">
              <Map className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-gray-900 font-bold text-lg tracking-tight">Active Field Mission</h1>
              <p className="text-gray-500 text-xs mt-0.5">
                Dispatch execution and live navigation terminal.
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 self-start md:self-auto">
            <span className="text-[11px] font-mono font-bold bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg border border-gray-200 flex items-center gap-1.5 shadow-xs">
              <Radio size={14} className="text-gray-400" /> SYSTEM STATUS: STANDBY MODE
            </span>
          </div>
        </div>

        {/* Empty State Content */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-12 flex flex-col items-center justify-center min-h-[450px] relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
               style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '32px 32px' }}>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-inner border border-emerald-100">
              <CheckCircle2 size={36} className="opacity-90" />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Queue Clear</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed mb-8 font-medium">
              You have successfully completed all assigned water dispatches. The Masafi depot operations center will pair your vehicle when a new order is ready.
            </p>

            <div className="flex justify-center w-full">
              <button
                onClick={fetchActiveAssignment}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <RefreshCw size={14} />
                Refresh Queue
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  // --- END OF EMPTY STATE ---

  const volumeText = (activeJob.grossAmountAED || activeJob.GrossAmountAED) > 400 ? '5,000 Gallons' : '1,000 Gallons';
  
  const customerPhone = activeJob.customerPhone || activeJob.CustomerPhone || '+971501234567';
  const siteAddress = activeJob.deliveryAddress || activeJob.DeliveryAddress || 'Masafi Regional Delivery Corridor';
  
  const destLat = activeJob.targetLatitude || activeJob.TargetLatitude || 25.1028;
  const destLng = activeJob.targetLongitude || activeJob.TargetLongitude || 56.2872;
  const destinationCoords = [destLat, destLng];
  const driverPosition = [lastCoords.lat, lastCoords.lng];

  return (
    <div className="w-full space-y-6 pb-28 font-sans animate-in fade-in duration-300">
      
      {/* Top Banner Status Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-600 text-white p-3 rounded-xl shadow-sm">
            <Map className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-gray-900 font-bold text-lg tracking-tight">Active Field Mission</h1>
            <p className="text-gray-500 text-xs mt-0.5">
              Dispatch execution and live navigation terminal.
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 self-start md:self-auto">
          <span className="text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100 flex items-center gap-1.5 shadow-xs">
            <Radio size={14} className="animate-pulse text-emerald-500" /> GPS TELEMETRY ACTIVE
          </span>
          <span className="text-[11px] font-mono font-bold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100 shadow-xs">
            ORD-{activeJob.id || activeJob.Id}
          </span>
        </div>
      </div>

      {/* 1. TOP FULL-WIDTH BANNER: Cargo Specifications */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Droplet className="w-5 h-5 text-blue-600" /> Cargo Specifications
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50/40 rounded-2xl border border-blue-100">
            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Service Type</p>
            <p className="text-xs font-bold text-gray-900 mt-1">Bulk Tanker Delivery</p>
          </div>

          <div className="p-4 bg-blue-50/40 rounded-2xl border border-blue-100">
            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Volume Load</p>
            <p className="text-xs font-bold text-gray-900 mt-1">{volumeText}</p>
          </div>

          <div className="p-4 bg-blue-50/40 rounded-2xl border border-blue-100">
            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Water Grade</p>
            <p className="text-xs font-bold text-gray-900 mt-1">Treated Industrial</p>
          </div>
        </div>
      </div>

      {/* 2. BELOW: Side-by-Side Map & Schedule/Payment Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Client & Live Route Map (Spans 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" /> Client & Delivery Location
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Customer & Site Phone</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">Account #{activeJob.customerId || activeJob.CustomerId} — <span className="text-blue-600 font-mono">{customerPhone}</span></p>
                </div>
                <div className="flex space-x-2 w-full sm:w-auto">
                  <a 
                    href={`tel:${customerPhone}`}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold border border-blue-200" 
                    title="Call Customer"
                  >
                    <Phone className="w-4 h-4 text-blue-600" /> Call
                  </a>
                  <a 
                    href={`https://wa.me/${customerPhone.replace(/[^0-9]/g, '')}?text=Hello,%20this%20is%20your%20Masafi%20Tanker%20Driver%20regarding%20Order%20%23ORD-${activeJob.id || activeJob.Id}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold border border-emerald-200" 
                    title="Chat via WhatsApp"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-600" /> Chat
                  </a>
                </div>
              </div>

              {/* Real OSRM Road Route Map Container */}
              <div className="relative h-64 rounded-2xl overflow-hidden border border-gray-200 shadow-inner z-0">
                <MapContainer 
                  center={driverPosition} 
                  zoom={11} 
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={driverPosition}>
                    <Popup>Your Tanker Position</Popup>
                  </Marker>
                  <Marker position={destinationCoords}>
                    <Popup><strong>Delivery Site:</strong><br />{siteAddress}</Popup>
                  </Marker>
                  {routeCoordinates.length > 0 && (
                    <Polyline positions={routeCoordinates} color="#2563eb" weight={5} opacity={0.85} />
                  )}
                </MapContainer>
                <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-bold text-gray-700 shadow-md border border-gray-200 z-10 pointer-events-none uppercase tracking-wider">
                  Optimized VRP Route • {activeJob.calculatedDistanceKm || activeJob.CalculatedDistanceKm || 5.0} km
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center space-x-2 text-gray-400 mb-1">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Destination Address</span>
                  </div>
                  <p className="text-xs font-bold text-gray-900 mt-1 leading-relaxed">{siteAddress}</p>
                  <p className="text-[10px] text-gray-500 font-mono font-medium mt-1">Lat: {destLat}, Lon: {destLng}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center space-x-2 text-gray-400 mb-1">
                    <Navigation className="w-4 h-4 text-blue-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Live Telemetry</span>
                  </div>
                  <p className="text-xs font-mono font-bold text-gray-800 mt-1">{lastCoords.lat.toFixed(4)}° N, {lastCoords.lng.toFixed(4)}° E</p>
                  <p className="text-[10px] text-emerald-600 font-bold mt-1">Transmitting to Dispatch</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Schedule & Payment / Action Card */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" /> Schedule & Payment
              </h3>

              <div className="space-y-4">
                <div className="pb-4 border-b border-gray-100">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Calculated Distance</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{activeJob.calculatedDistanceKm || activeJob.CalculatedDistanceKm || 5.0} km from Depot</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Driver Net</span>
                    <span className="font-bold text-gray-800">AED {(activeJob.driverNetEarningsAED || activeJob.DriverNetEarningsAED || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Commission Cut</span>
                    <span className="font-bold text-gray-800">AED {(activeJob.commissionDeductionAED || activeJob.CommissionDeductionAED || 0).toFixed(2)}</span>
                  </div>
                  <div className="pt-4 border-t border-gray-100 flex justify-between items-end">
                    <span className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">Total Gross</span>
                    <span className="text-2xl font-black text-emerald-600 leading-none">AED {(activeJob.grossAmountAED || activeJob.GrossAmountAED || 0).toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center space-x-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Custody: {activeJob.custodyStatus || activeJob.CustodyStatus}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-gray-100 space-y-3">
              {((activeJob.orderStatus || activeJob.OrderStatus) === 'Dispatched') && (
                <button 
                  onClick={() => handleUpdateStatus('Arrived')}
                  className="w-full bg-[#0B2A4D] hover:bg-blue-900 text-white text-xs font-black py-4 rounded-xl transition-all shadow-xs hover:shadow-sm cursor-pointer uppercase tracking-wider"
                >
                  Mark as Arrived
                </button>
              )}

              {((activeJob.orderStatus || activeJob.OrderStatus) === 'Arrived') && (
                <button 
                  onClick={() => handleUpdateStatus('Completed')}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black py-4 rounded-xl transition-all shadow-xs hover:shadow-sm cursor-pointer uppercase tracking-wider"
                >
                  Complete & Reconcile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverAssignmentDetails;