import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, CheckCircle, AlertCircle } from 'lucide-react';

const AdminDispatchCenter = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Masafi / Fujairah center coordinates
  const mapCenter = [25.1028, 56.2872];

  // Mock pending customer orders
  const pendingOrders = [
    { id: 'ORD-501', customer: 'Emirates Foundation', volume: '5,000 Gal', location: 'Masafi Zone 3, Plot 14', distance: '12.4 km', coords: [25.1128, 56.2772] },
    { id: 'ORD-502', customer: 'Fujairah Agritech Farms', volume: '1,000 Gal', location: 'Fujairah Valley Road', distance: '8.1 km', coords: [25.0928, 56.3172] },
    { id: 'ORD-503', customer: 'Al-Ain Industrial Block', volume: '5,000 Gal', location: 'Industrial Sector 2', distance: '19.5 km', coords: [25.1328, 56.2472] },
  ];

  // Mock compliant vehicles available for dispatch
  const availableTankers = [
    { id: 'T-012', capacity: '5,000 Gal Tanker', driver: 'Ahmed Al-Mazrouei', compliance: 'Verified', status: 'Available' },
    { id: 'T-019', capacity: '1,000 Gal Tanker', driver: 'Salim Al-Ketbi', compliance: 'Verified', status: 'Available' },
    { id: 'T-045', capacity: '5,000 Gal Tanker', driver: 'Tariq Bin Ziyad', compliance: 'Expired Insurance', status: 'Blocked' },
  ];

  const handleRunVRP = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setIsOptimizing(false);
      alert('VRP Route Optimization completed successfully. Multi-drop path generated.');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Navy Header */}
      <div className="bg-[#0B2A4D] p-6 rounded-2xl shadow-md text-white flex flex-col md:flex-row md:items-center md:justify-between border border-blue-950">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dispatch Center & Spatial Canvas</h1>
          <p className="text-sm text-blue-200 mt-1">Manage active dispatches, geofenced zones, and VRP route pathfinding for Al-Waqar Transport.</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <button 
            onClick={handleRunVRP}
            disabled={isOptimizing}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Navigation className={`w-4 h-4 ${isOptimizing ? 'animate-spin' : ''}`} />
            <span>{isOptimizing ? 'Calculating VRP Routes...' : 'Run VRP Optimization'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Professional Operational Canvas & Order Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Drawer: Pending Order Requests */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Incoming Water Requests</h2>
              <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-lg">3 Pending</span>
            </div>

            <div className="space-y-3">
              {pendingOrders.map((order) => (
                <div 
                  key={order.id} 
                  onClick={() => setSelectedOrder(order)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedOrder?.id === order.id ? 'border-blue-500 bg-blue-50/40 shadow-sm' : 'border-gray-100 bg-gray-50/50 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-600">{order.id}</span>
                    <span className="text-xs font-semibold text-gray-500">{order.volume}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-800 mt-1">{order.customer}</h4>
                  <div className="flex items-center space-x-1 text-xs text-gray-500 mt-2">
                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                    <span>{order.location} ({order.distance})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-400 text-center">
            Click any order to load fleet assignment options.
          </div>
        </div>

        {/* Right Canvas: Professional Live Operational GIS Canvas */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Live Operational GIS Canvas</h2>
            <div className="flex items-center space-x-2 text-xs">
              <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span><span>Compliant Unit</span></span>
              <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span><span>Blocked Asset</span></span>
            </div>
          </div>

          {/* Map Component Container */}
          <div className="flex-1 min-h-[360px] rounded-2xl relative overflow-hidden border border-slate-200 shadow-inner z-0">
            <MapContainer 
              center={mapCenter} 
              zoom={11} 
              scrollWheelZoom={false} 
              style={{ height: '100%', width: '100%', minHeight: '360px', borderRadius: '1rem' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {pendingOrders.map((order) => (
                <Marker 
                  key={order.id} 
                  position={order.coords}
                  eventHandlers={{
                    click: () => setSelectedOrder(order),
                  }}
                >
                  <Popup>
                    <div className="text-xs">
                      <strong>{order.id}: {order.customer}</strong><br />
                      Volume: {order.volume}<br />
                      Location: {order.location}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Assignment Panel */}
          {selectedOrder && (
            <div className="mt-4 p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-blue-800">Assigning Asset for {selectedOrder.id}</p>
                <p className="text-xs text-blue-600 mt-0.5">System auto-verifying vehicle compliance & rental locks.</p>
              </div>
              <button 
                onClick={() => { alert(`Job ${selectedOrder.id} successfully assigned to compliant fleet unit!`); setSelectedOrder(null); }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm cursor-pointer"
              >
                Confirm Dispatch
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Compliant Tanker Inventory Table for Dispatch */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Verification Matrix</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase">
                <th className="pb-3">Vehicle ID</th>
                <th className="pb-3">Capacity Class</th>
                <th className="pb-3">Assigned Driver</th>
                <th className="pb-3">Compliance State</th>
                <th className="pb-3">Availability</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {availableTankers.map((v, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50">
                  <td className="py-3 font-semibold text-gray-800">{v.id}</td>
                  <td className="py-3 text-gray-600">{v.capacity}</td>
                  <td className="py-3 text-gray-600">{v.driver}</td>
                  <td className="py-3">
                    <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      v.compliance === 'Verified' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {v.compliance === 'Verified' ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                      <span>{v.compliance}</span>
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                      v.status === 'Available' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button 
                      disabled={v.status !== 'Available'}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                        v.status === 'Available' ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Select Asset
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDispatchCenter;