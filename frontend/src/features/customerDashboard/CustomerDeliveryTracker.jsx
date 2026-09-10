import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Phone, Truck, Droplets, MapPin, CreditCard, Clock, CheckCircle2, Radio, ArrowRight } from 'lucide-react';

// Fix for default Leaflet marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const CustomerDeliveryTracker = ({ order = null, onViewLiveTracker }) => {
  // Fallback position if no live order coords are supplied
  const position = [order?.targetLatitude || 25.2861, order?.targetLongitude || 56.3314];

  const status = (order?.orderStatus || order?.OrderStatus || 'enroute').toLowerCase();
  const isPending = ['pending', 'scheduled', 'pending review'].includes(status);

  return (
    <div className="bg-white p-8 rounded-3xl border-2 border-gray-200/90 shadow-sm space-y-6">
      
      {/* Header Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
            Logistics Fulfillment Feed
          </span>
          <h3 className="font-black text-gray-900 text-lg mt-1">
            {isPending ? 'Order Pending Dispatch' : 'Active Delivery Status'}
          </h3>
        </div>
        <span className={`text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider border shadow-xs ${
          isPending 
            ? 'bg-amber-100 text-amber-800 border-amber-200' 
            : 'bg-emerald-100 text-emerald-800 border-emerald-200 animate-pulse'
        }`}>
          {isPending ? 'Awaiting Review' : (status.charAt(0).toUpperCase() + status.slice(1))}
        </span>
      </div>
      
      {/* Driver & Truck Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="flex items-center gap-4 bg-gray-50/80 border border-gray-200/80 p-4.5 rounded-2xl shadow-2xs">
          <div className="w-12 h-12 bg-[#0B2A4D] text-white rounded-2xl flex items-center justify-center font-black text-sm shadow">
            {order?.driverName ? order.driverName.slice(0, 2).toUpperCase() : 'AH'}
          </div>
          <div className="min-w-0">
            <p className="font-black text-gray-900 text-sm truncate">
              {order?.driverName || order?.DriverName || 'Ahmed Hassan'} 
              <span className="text-emerald-600 text-xs font-bold ml-1.5">★ 4.8</span>
            </p>
            <p className="text-xs text-blue-600 font-semibold flex items-center gap-1.5 mt-0.5">
              <Phone className="w-3.5 h-3.5" /> {order?.driverPhone || order?.DriverPhone || '+971 55 987 6543'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 bg-gray-50/80 border border-gray-200/80 p-4.5 rounded-2xl shadow-2xs">
           <div className="flex items-center gap-3">
             <div className="p-2.5 bg-blue-100/70 text-blue-800 rounded-xl">
               <Truck className="w-4 h-4" />
             </div>
             <div>
               <p className="text-[10px] uppercase text-gray-400 font-black">Truck No.</p>
               <p className="text-xs font-black text-gray-900">MFS-1245</p>
             </div>
           </div>
           <div className="flex items-center gap-3">
             <div className="p-2.5 bg-blue-100/70 text-blue-800 rounded-xl">
               <Droplets className="w-4 h-4" />
             </div>
             <div>
               <p className="text-[10px] uppercase text-gray-400 font-black">Capacity</p>
               <p className="text-xs font-black text-gray-900">{order?.volumeGallons || order?.VolumeGallons || '5,000'} Gal</p>
             </div>
           </div>
        </div>
      </div>

      {/* Map and Data Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Data Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4 bg-slate-50/70 border border-slate-200/80 p-5 rounded-2xl">
           <div className="flex items-start gap-3">
             <div className="p-2 bg-red-100 text-red-600 rounded-xl shrink-0 mt-0.5">
               <MapPin className="w-4 h-4" />
             </div>
             <div className="min-w-0">
               <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Delivery Address</p>
               <p className="text-xs font-bold text-gray-900 mt-0.5 leading-relaxed break-words">
                 {order?.deliveryAddress || order?.DeliveryAddress || 'Al Hail Construction Site, Fujairah Industrial Area'}
               </p>
             </div>
           </div>

           <div className="flex items-start gap-3">
             <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl shrink-0 mt-0.5">
               <CreditCard className="w-4 h-4" />
             </div>
             <div>
               <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">COD Settlement</p>
               <p className="text-xs font-black text-[#0B2A4D] mt-0.5">
                 AED {Number(order?.grossAmountAED || order?.GrossAmountAED || 315.00).toFixed(2)}
               </p>
             </div>
           </div>

           <div className="flex items-start gap-3">
             <div className="p-2 bg-blue-100 text-blue-700 rounded-xl shrink-0 mt-0.5">
               <Clock className="w-4 h-4" />
             </div>
             <div>
               <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Estimated ETA</p>
               <p className="text-xs font-black text-gray-900 mt-0.5">
                 {isPending ? 'Pending Dispatch' : '25 mins'} <span className="text-gray-400 font-normal">({order?.distanceKm || '5.0'} km away)</span>
               </p>
             </div>
           </div>
        </div>

        {/* Map Container (7 cols) */}
        <div className="lg:col-span-7 h-64 w-full rounded-2xl overflow-hidden border-2 border-gray-200 shadow-inner relative z-0">
          <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={position}>
              <Popup><strong>Delivery Destination Pin</strong></Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>

      {/* Footer CTA */}
      <button 
        onClick={onViewLiveTracker}
        className="w-full bg-[#0B2A4D] hover:bg-blue-900 text-white py-4 rounded-2xl font-black transition-all shadow-md flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
      >
        <span>Track Live Telemetry & OSRM Route</span>
        <ArrowRight size={16} />
      </button>
    </div>
  );
};

export default CustomerDeliveryTracker;