import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  PhoneCall, 
  Clock, 
  Building2, 
  Radio,
  ShieldCheck,
  Truck,
  Navigation,
  MapPin,
  Search,
  ArrowRight
} from 'lucide-react';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const YARD_LOCATION = [25.2861, 56.3314]; // Masafi Central Depot Yard

const MapBoundsUpdater = ({ truckCoords, destinationCoords }) => {
  const map = useMap();
  useEffect(() => {
    if (truckCoords && destinationCoords) {
      const bounds = L.latLngBounds([truckCoords, destinationCoords]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [truckCoords, destinationCoords, map]);
  return null;
};

const CustomerDeliveryTrackerScreen = () => {
  const { id: routeOrderId } = useParams();
  const navigate = useNavigate();

  const [allOrders, setAllOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // --- BULLETPROOF TOKEN EXTRACTOR ---
  const getAuthToken = () => {
    const storedUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
    return localStorage.getItem('token') || 
           sessionStorage.getItem('token') || 
           localStorage.getItem('jwt') || 
           localStorage.getItem('userToken') || 
           storedUser.token;
  };

  const fetchCustomerDeliveries = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5191/api/WaterOrders/my-orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const orders = await response.json();
        if (Array.isArray(orders) && orders.length > 0) {
          
          // STRICT FILTER: Keep only active trips (Accepted, Dispatched, EnRoute, Arrived)
          const activeCustomerOrders = orders.filter(o => {
            const stat = (o.orderStatus || o.OrderStatus || '').toLowerCase();
            return ['accepted', 'dispatched', 'enroute', 'arrived'].includes(stat);
          });

          setAllOrders(activeCustomerOrders);

          let target = null;
          if (routeOrderId) {
            target = activeCustomerOrders.find(o => String(o.id || o.Id) === String(routeOrderId));
          }
          if (!target && activeCustomerOrders.length > 0) {
            target = activeCustomerOrders[activeCustomerOrders.length - 1]; // Default to most recent
          }

          if (target) {
            setSelectedOrder(target);
            fetchOsrmRoute(target);
          } else {
            setSelectedOrder(null);
          }
        } else {
          setAllOrders([]);
          setSelectedOrder(null);
        }
      }
    } catch (err) {
      console.error("Failed to load customer delivery list:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOsrmRoute = async (order) => {
    const destLat = order.targetLatitude ?? order.TargetLatitude ?? 25.1028;
    const destLng = order.targetLongitude ?? order.TargetLongitude ?? 56.2872;
    const truckLat = order.currentLatitude ?? order.CurrentLatitude ?? YARD_LOCATION[0];
    const truckLng = order.currentLongitude ?? order.CurrentLongitude ?? YARD_LOCATION[1];

    try {
      const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${truckLng},${truckLat};${destLng},${destLat}?overview=full&geometries=geojson`);
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const formattedCoords = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
        setRouteCoordinates(formattedCoords);
      } else {
        setRouteCoordinates([[truckLat, truckLng], [destLat, destLng]]);
      }
    } catch (e) {
      console.error("OSRM Routing error:", e);
      setRouteCoordinates([[truckLat, truckLng], [destLat, destLng]]);
    }
  };

  useEffect(() => {
    fetchCustomerDeliveries();
    const interval = setInterval(fetchCustomerDeliveries, 10000);
    return () => clearInterval(interval);
  }, [routeOrderId]);

  const handleSelectOrderCard = (order) => {
    setSelectedOrder(order);
    fetchOsrmRoute(order);
    navigate(`/customer/dashboard/track/${order.id || order.Id}`);
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-gray-500 font-bold">Synchronizing live delivery telemetry...</div>;
  }

  return (
    <div className="w-full space-y-6 pb-16 font-sans text-sm">
      
      {/* PROFESSIONAL PAGE HEADER (Kept visible even if empty) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">
            <Navigation size={14} /> Logistics & Fulfillment
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Real-Time Bulk Water Delivery Tracker</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Select an active shipment from your queue below to monitor live GPS telemetry and OSRM road routes.
          </p>
        </div>
      </div>

      {/* CONDITIONAL RENDER: Empty State vs Active Tracking */}
      {!selectedOrder ? (
        
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-16 flex flex-col items-center justify-center text-center space-y-5 my-8">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center border border-blue-100 shadow-inner">
            <Truck size={36} strokeWidth={1.5} />
          </div>
          <div className="max-w-md space-y-1.5">
            <h2 className="text-xl font-black text-gray-900 tracking-tight">No Active Deliveries on the Road</h2>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              You currently have no active tankers in transit. Once your pending orders are dispatched from the Masafi Central Yard, live GPS telemetry will automatically appear here.
            </p>
          </div>
          <button 
            onClick={() => navigate('/customer/dashboard/order')}
            className="mt-4 bg-[#0B2A4D] hover:bg-blue-900 text-white px-8 py-3.5 rounded-xl text-xs font-bold transition shadow-md flex items-center gap-2 uppercase tracking-wider"
          >
            Order Bulk Water <ArrowRight size={16} />
          </button>
        </div>

      ) : (

        /* PROFESSIONAL UNIFIED GRID LAYOUT */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: SCROLLABLE SHIPMENTS QUEUE WITH SEARCH */}
          <div className="lg:col-span-4 bg-white rounded-3xl shadow-sm border border-gray-200 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <Clock size={15} className="text-blue-600" /> Active Shipments
                </h2>
                <p className="text-[10px] text-gray-400 font-medium mt-0.5">Select active order to track</p>
              </div>
              <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full uppercase border border-blue-200">
                {allOrders.length} Active
              </span>
            </div>

            {/* SEARCH INPUT BAR */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search Shipment ID or Address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-blue-600 transition"
              />
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Search size={13} />
              </span>
            </div>

            <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
              {allOrders
                  .filter(ord => {
                    const q = searchQuery.toLowerCase();
                    const idStr = String(ord.id || ord.Id).toLowerCase();
                    const addrStr = (ord.deliveryAddress || ord.DeliveryAddress || '').toLowerCase();
                    return idStr.includes(q) || addrStr.includes(q);
                  })
                  .map((ord) => {
                    const ordId = ord.id || ord.Id;
                    const isSelected = String(ordId) === String(selectedOrder.id || selectedOrder.Id);
                    const ordStatus = ord.orderStatus || ord.OrderStatus || 'Dispatched';
                    const ordGallons = ord.volumeGallons ?? ord.VolumeGallons ?? 5000;
                    const volText = `${ordGallons.toLocaleString()} Gal`;

                    return (
                      <div 
                        key={ordId}
                        onClick={() => handleSelectOrderCard(ord)}
                        className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer space-y-2 ${
                          isSelected 
                            ? 'border-[#0B2A4D] bg-blue-50/70 shadow-sm ring-2 ring-[#0B2A4D]/10' 
                            : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-[#0B2A4D]">Shipment #ORD-{ordId}</span>
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase bg-blue-100 text-blue-800 animate-pulse">
                            {ordStatus}
                          </span>
                        </div>
                        <h4 className="text-xs font-extrabold text-gray-900">{volText} Bulk Water Tanker</h4>
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 pt-1 border-t border-gray-200/60">
                          <MapPin size={13} className="text-red-500 shrink-0" />
                          <span className="truncate">{ord.deliveryAddress || ord.DeliveryAddress || 'Masafi Industrial Zone'}</span>
                        </div>
                      </div>
                    );
                  })
              }
            </div>
          </div>

          {/* RIGHT COLUMN: MAP CANVAS & TELEMETRY SPECS */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* MAP CONTAINER */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-5 space-y-4">
              <div className="bg-slate-900 text-white px-5 py-3.5 rounded-2xl flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Live Tracking State (Shipment #ORD-{selectedOrder.id || selectedOrder.Id})</p>
                    <p className="text-xs font-extrabold text-white">{selectedOrder.orderStatus || selectedOrder.OrderStatus || 'Pending'} — GPS Polling Active (10s interval)</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-xl font-bold text-[11px] border border-emerald-500/30">
                  <Radio size={13} className="animate-pulse" /> Signal Secured
                </div>
              </div>

              <div className="relative h-[360px] rounded-2xl overflow-hidden border border-gray-200 shadow-inner z-0">
                <MapContainer 
                  center={[selectedOrder.targetLatitude ?? selectedOrder.TargetLatitude ?? 25.1028, selectedOrder.targetLongitude ?? selectedOrder.TargetLongitude ?? 56.2872]} 
                  zoom={11} 
                  scrollWheelZoom={true} 
                  style={{ width: '100%', height: '100%' }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapBoundsUpdater 
                    truckCoords={[selectedOrder.currentLatitude ?? selectedOrder.CurrentLatitude ?? YARD_LOCATION[0], selectedOrder.currentLongitude ?? selectedOrder.CurrentLongitude ?? YARD_LOCATION[1]]} 
                    destinationCoords={[selectedOrder.targetLatitude ?? selectedOrder.TargetLatitude ?? 25.1028, selectedOrder.targetLongitude ?? selectedOrder.TargetLongitude ?? 56.2872]} 
                  />
                   
                  <Marker position={[selectedOrder.targetLatitude ?? selectedOrder.TargetLatitude ?? 25.1028, selectedOrder.targetLongitude ?? selectedOrder.TargetLongitude ?? 56.2872]}>
                    <Popup><strong>Customer Delivery Site</strong><br />{selectedOrder.deliveryAddress || selectedOrder.DeliveryAddress}</Popup>
                  </Marker>
                  <Marker position={[selectedOrder.currentLatitude ?? selectedOrder.CurrentLatitude ?? YARD_LOCATION[0], selectedOrder.currentLongitude ?? selectedOrder.CurrentLongitude ?? YARD_LOCATION[1]]}>
                    <Popup><strong>Tanker Unit #ORD-{selectedOrder.id || selectedOrder.Id}</strong><br />Status: {selectedOrder.orderStatus || selectedOrder.OrderStatus}</Popup>
                  </Marker>
                   
                  {routeCoordinates.length > 0 && (
                    <Polyline positions={routeCoordinates} color="#2563eb" weight={5} opacity={0.85} />
                  )}
                </MapContainer>
              </div>
            </div>

            {/* BOTTOM METRICS & SPECS CARDS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* ETA & DRIVER CONTACT CARD */}
              <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <Clock size={15} className="text-blue-600" /> Estimated Arrival (ETA)
                  </h3>
                </div>
                 
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Calculated ETA</p>
                    <p className="text-base font-black text-[#0B2A4D] mt-0.5">
                      {(selectedOrder.orderStatus || selectedOrder.OrderStatus) === 'Completed' ? 'Arrived' : `${Math.max(Math.round(((selectedOrder.calculatedDistanceKm ?? selectedOrder.CalculatedDistanceKm ?? 5.0) / 40) * 60), 2)} mins`}
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Distance Left</p>
                    <p className="text-base font-black text-[#0B2A4D] mt-0.5">{Number(selectedOrder.calculatedDistanceKm ?? selectedOrder.CalculatedDistanceKm ?? 5.0).toFixed(1)} km</p>
                  </div>
                </div>

                <div className="bg-blue-50/70 border border-blue-100 p-3 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-blue-900 truncate max-w-[140px]">
                      {selectedOrder.driverName || selectedOrder.DriverName || (selectedOrder.assignedDriverId ? `Driver ID: ${selectedOrder.assignedDriverId}` : 'Awaiting Dispatch')}
                    </span>
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-md">Status: {selectedOrder.orderStatus || selectedOrder.OrderStatus || 'Pending'}</span>
                  </div>
                  <a
                    href={`tel:${selectedOrder.driverPhone || selectedOrder.DriverPhone || '+971 50 000 0000'}`}
                    className="w-full bg-[#0B2A4D] hover:bg-blue-900 text-white font-bold py-2.5 rounded-xl transition shadow-sm flex items-center justify-center gap-2 text-xs cursor-pointer"
                  >
                    <PhoneCall size={13} /> Call Driver Directly ({selectedOrder.driverPhone || selectedOrder.DriverPhone || '+971 50 000 0000'})
                  </a>
                </div>
              </div>

              {/* SETTLEMENT & SPECS CARD */}
              <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck size={15} className="text-emerald-600" /> Settlement & Specs
                  </h3>
                </div>

                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="font-semibold">Asset Class:</span>
                    <span className="font-bold text-[#0B2A4D]">{(selectedOrder.volumeGallons ?? selectedOrder.VolumeGallons ?? 5000).toLocaleString()} Gallon Tanker</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Delivery Address:</span>
                    <span className="font-bold text-[#0B2A4D] text-right truncate max-w-[150px]">
                      {selectedOrder.deliveryAddress || selectedOrder.DeliveryAddress}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-100 pt-2">
                    <span className="font-semibold">Settlement Amount:</span>
                    <span className="font-black text-[#0B2A4D]">AED {Number(selectedOrder.grossAmountAED ?? selectedOrder.GrossAmountAED ?? 525).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-100 pt-2">
                    <span className="font-semibold">Payment Mode:</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Cash on Delivery (COD)
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-gray-200 p-2.5 rounded-xl text-[10px] text-slate-500 leading-tight flex items-start gap-2">
                  <ShieldCheck size={14} className="text-blue-600 shrink-0 mt-0.5" />
                  <span>GPS telemetry updates automatically every 10 seconds.</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}
    </div>
  );
};

export default CustomerDeliveryTrackerScreen;