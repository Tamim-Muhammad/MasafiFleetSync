import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { AlertTriangle, PhoneCall, MapPin, Truck, CheckCircle2, Clock, PlusCircle, X, ArrowRight } from 'lucide-react';

const AdminRecoveryDispatch = () => {
  const [isManualIntakeOpen, setIsManualIntakeOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null); // For status update modal
  
  // Masafi / Fujairah center coordinates for emergency tracking
  const mapCenter = [25.1028, 56.2872];

  // Incident log state
  const [incidents, setIncidents] = useState([
    { 
      id: 'INC-901', 
      type: 'Affiliated Driver SOS', 
      name: 'Ahmed Al-Mazrouei', 
      vehicle: 'Tanker T-012 (5000 Gal)', 
      location: 'Masafi Mountain Pass (Lat 25.34, Lon 56.21)', 
      coords: [25.34, 56.21],
      time: '10 mins ago', 
      issue: 'Rear left tire blowout & engine overheating', 
      status: 'Recovery Dispatched',
      category: 'affiliated'
    },
    { 
      id: 'INC-902', 
      type: 'Public / Non-Affiliated', 
      name: 'External Caller (Mohammed)', 
      vehicle: 'Heavy Freight Truck', 
      location: 'Fujairah Highway Exit 4', 
      coords: [25.12, 56.32],
      time: '25 mins ago', 
      issue: 'Transmission failure', 
      status: 'Incident Reported',
      category: 'public'
    },
  ]);

  // New manual intake form state
  const [newIncident, setNewIncident] = useState({ name: '', phone: '', vehicleType: '', issue: '', location: '' });

  const handleManualIntakeSubmit = (e) => {
    e.preventDefault();
    const created = {
      id: `INC-90${incidents.length + 1}`,
      type: 'Public / Non-Affiliated',
      name: newIncident.name || 'Anonymous Caller',
      vehicle: newIncident.vehicleType || 'General Transport',
      location: newIncident.location || 'Fujairah Sector Zone',
      coords: [25.11, 56.29],
      time: 'Just now',
      issue: newIncident.issue || 'Roadside assistance requested',
      status: 'Incident Reported',
      category: 'public'
    };
    setIncidents([created, ...incidents]);
    setIsManualIntakeOpen(false);
    setNewIncident({ name: '', phone: '', vehicleType: '', issue: '', location: '' });
    alert('Manual public emergency intake logged successfully and broadcast to recovery units.');
  };

  const handleAdvanceStatus = (newStatus) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === selectedIncident.id) {
        return { ...inc, status: newStatus };
      }
      return inc;
    }));
    alert(`Incident ${selectedIncident.id} status successfully updated to: ${newStatus}`);
    setSelectedIncident(null);
  };

  return (
    <div className="space-y-6 relative">
      {/* Top Professional Navy Header */}
      <div className="bg-[#0B2A4D] p-6 rounded-2xl shadow-md text-white flex flex-col md:flex-row md:items-center md:justify-between border border-blue-950">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Emergency Recovery & SOS Command Hub</h1>
          <p className="text-sm text-blue-200 mt-1">Coordinate roadside breakdowns, track driver emergency telemetry, and manage recovery tow trucks for Al-Waqar Transport.</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button 
            className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 text-white shadow-sm"
          >
            Active SOS Incidents ({incidents.filter(i => i.status !== 'Incident Resolved').length})
          </button>
          <button 
            onClick={() => setIsManualIntakeOpen(true)}
            className="flex items-center space-x-1.5 bg-white hover:bg-gray-100 text-gray-900 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-red-600" />
            <span>Manual Public Intake</span>
          </button>
        </div>
      </div>

      {/* Live Incident GPS Mapping Canvas */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Live Incident GPS Mapping Canvas</h2>
          <div className="flex items-center space-x-2 text-xs">
            <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping"></span><span className="font-semibold text-red-600">Active SOS Signals</span></span>
          </div>
        </div>

        <div className="h-80 rounded-2xl relative overflow-hidden border border-slate-200 shadow-inner z-0">
          <MapContainer 
            center={mapCenter} 
            zoom={10} 
            scrollWheelZoom={false} 
            style={{ height: '100%', width: '100%', borderRadius: '1rem' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {incidents.map((inc) => (
              <Marker key={inc.id} position={inc.coords}>
                <Popup>
                  <div className="text-xs space-y-1">
                    <strong className="text-red-600">{inc.id}: {inc.type}</strong><br />
                    <span>Vehicle: {inc.vehicle}</span><br />
                    <span>Issue: {inc.issue}</span><br />
                    <span className="font-semibold text-gray-700">Status: {inc.status}</span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Real-Time Incident Alert Log */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Real-Time Incident Alert Log</h2>
          <span className="text-xs font-semibold text-gray-500">Auto-syncing via Local Intranet HTTP Stream</span>
        </div>

        <div className="space-y-4">
          {incidents.map((inc) => (
            <div key={inc.id} className="p-4 rounded-xl bg-gray-50/80 border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-red-200 transition">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-md border border-red-100">{inc.id}</span>
                  <span className="text-xs font-semibold text-gray-500">• {inc.type} ({inc.time})</span>
                </div>
                <h4 className="text-sm font-bold text-gray-900">{inc.vehicle} — {inc.name}</h4>
                <div className="flex items-center space-x-1.5 text-xs text-gray-600">
                  <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>{inc.location}</span>
                </div>
                <div className="inline-block mt-1 px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 shadow-2xs">
                  <strong>Fault Reported:</strong> {inc.issue}
                </div>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  inc.status === 'Incident Reported' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  inc.status === 'Recovery Dispatched' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                  inc.status === 'Team On Scene' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                  'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {inc.status}
                </span>
                {inc.status !== 'Incident Resolved' && (
                  <button 
                    onClick={() => setSelectedIncident(inc)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
                  >
                    Update Status
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Status Progression Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in duration-200 text-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Advance Incident Lifecycle</h3>
                <p className="text-red-600 font-mono mt-0.5">{selectedIncident.id} — Current: [{selectedIncident.status}]</p>
              </div>
              <button onClick={() => setSelectedIncident(null)} className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-50 transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 py-2">
              <p className="font-semibold text-gray-700">Select next milestone stage for {selectedIncident.vehicle}:</p>
              
              <button 
                onClick={() => handleAdvanceStatus('Recovery Dispatched')}
                className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl font-bold transition cursor-pointer border border-blue-200"
              >
                <span>1. Recovery Team Dispatched</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button 
                onClick={() => handleAdvanceStatus('Team On Scene')}
                className="w-full flex items-center justify-between p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-xl font-bold transition cursor-pointer border border-indigo-200"
              >
                <span>2. Team Arrived On Scene</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button 
                onClick={() => handleAdvanceStatus('Incident Resolved')}
                className="w-full flex items-center justify-between p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-bold transition cursor-pointer border border-emerald-200"
              >
                <span>3. Vehicle Recovered & Resolved (Restore Fleet)</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Public Intake Modal */}
      {isManualIntakeOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Manual Public Incident Intake</h3>
                <p className="text-xs text-gray-500 mt-0.5">Log emergency requests from non-affiliated or public callers.</p>
              </div>
              <button onClick={() => setIsManualIntakeOpen(false)} className="text-gray-400 hover:text-gray-700 p-1.5 rounded-xl hover:bg-gray-50 transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualIntakeSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Caller Name</label>
                  <input 
                    type="text" 
                    required
                    value={newIncident.name}
                    onChange={(e) => setNewIncident({...newIncident, name: e.target.value})}
                    placeholder="e.g., Mohammed Ali"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0B2A4D]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Contact Phone</label>
                  <input 
                    type="text" 
                    required
                    value={newIncident.phone}
                    onChange={(e) => setNewIncident({...newIncident, phone: e.target.value})}
                    placeholder="+971 50 XXXXXXX"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0B2A4D]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Vehicle Type / Description</label>
                <input 
                  type="text" 
                  required
                  value={newIncident.vehicleType}
                  onChange={(e) => setNewIncident({...newIncident, vehicleType: e.target.value})}
                  placeholder="e.g., Heavy Freight Truck / Private Car"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0B2A4D]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Incident Location Description</label>
                <input 
                  type="text" 
                  required
                  value={newIncident.location}
                  onChange={(e) => setNewIncident({...newIncident, location: e.target.value})}
                  placeholder="e.g., Fujairah Highway Exit 4"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0B2A4D]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Nature of Fault / Issue</label>
                <textarea 
                  rows="3"
                  required
                  value={newIncident.issue}
                  onChange={(e) => setNewIncident({...newIncident, issue: e.target.value})}
                  placeholder="Describe mechanical failure or roadside emergency..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0B2A4D]"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setIsManualIntakeOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-sm cursor-pointer"
                >
                  Dispatch Emergency Recovery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRecoveryDispatch;