import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { Phone, Truck, Droplets, MapPin, CreditCard, Clock } from 'lucide-react';

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

const CustomerDeliveryTracker = () => {
  const position = [33.6844, 73.0479]; 

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-gray-800 text-lg">Active Delivery</h3>
        <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          En Route
        </span>
      </div>
      
      {/* Driver & Truck Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center font-bold text-gray-600">AH</div>
          <div>
            <p className="font-bold text-gray-800">Ahmed Hassan <span className="text-green-600 text-xs">★ 4.8</span></p>
            <p className="text-xs text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" /> +971 55 987 6543</p>
          </div>
        </div>

        <div className="flex items-center justify-around bg-gray-50 p-4 rounded-xl">
           <div className="flex items-center gap-2">
             <Truck className="w-5 h-5 text-gray-400" />
             <div>
               <p className="text-[10px] uppercase text-gray-400 font-bold">Truck No.</p>
               <p className="text-sm font-bold text-gray-800">MFS-1245</p>
             </div>
           </div>
           <div className="flex items-center gap-2">
             <Droplets className="w-5 h-5 text-gray-400" />
             <div>
               <p className="text-[10px] uppercase text-gray-400 font-bold">Capacity</p>
               <p className="text-sm font-bold text-gray-800">5,000 G</p>
             </div>
           </div>
        </div>
      </div>

      {/* Map and Data Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Data Column */}
        <div className="space-y-4">
           <div className="flex gap-3">
             <MapPin className="w-5 h-5 text-blue-600 mt-1" />
             <div>
               <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Delivery Address</p>
               <p className="text-sm font-medium text-gray-800 leading-tight">Al Hail Construction Site, Fujairah Industrial Area</p>
             </div>
           </div>
           <div className="flex gap-3">
             <CreditCard className="w-5 h-5 text-blue-600 mt-1" />
             <div>
               <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">COD Amount</p>
               <p className="text-sm font-bold text-gray-800">AED 315.00</p>
             </div>
           </div>
           <div className="flex gap-3">
             <Clock className="w-5 h-5 text-blue-600 mt-1" />
             <div>
               <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">ETA</p>
               <p className="text-sm font-bold text-gray-800">25 min <span className="text-gray-400 font-normal">2:15 PM</span></p>
             </div>
           </div>
        </div>

        {/* Map Container */}
        <div className="h-64 lg:h-48 w-full rounded-xl overflow-hidden border border-gray-100 shadow-inner">
          <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={position} />
          </MapContainer>
        </div>
      </div>

      {/* Footer CTA */}
      <button className="w-full bg-[#0B2A4D] text-white py-3 rounded-xl font-bold hover:bg-[#153e6d] transition flex items-center justify-center gap-2">
        Track Live →
      </button>
    </div>
  );
};

export default CustomerDeliveryTracker;