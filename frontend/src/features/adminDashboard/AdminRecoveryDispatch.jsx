import React, { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, CheckCircle2, Clock, PlusCircle, X, ArrowRight, ShieldAlert, Truck, User, Filter, Phone, Search } from 'lucide-react';

const AdminRecoveryDispatch = () => {
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isManualIntakeOpen, setIsManualIntakeOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [statusFilter, setStatusFilter] = useState('Awaiting'); 
  const [roleFilter, setRoleFilter] = useState('All'); 
  const [searchTerm, setSearchTerm] = useState(''); 

  const [manualForm, setManualForm] = useState({ name: '', phone: '', vehicleType: '', issue: '', location: '' });
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  const fetchIncidents = async () => {
    try {
      const response = await fetch('http://localhost:5191/api/EmergencyIncidents');
      if (response.ok) {
        const data = await response.json();
        setIncidents(data);
      }
    } catch (error) {
      console.error("Failed to fetch incidents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAdvanceStatus = async (newStatus) => {
    if (!selectedIncident) return;
    
    const incidentId = selectedIncident.incidentNumber || selectedIncident.IncidentNumber;

    try {
      const response = await fetch(`http://localhost:5191/api/EmergencyIncidents/${incidentId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStatus)
      });

      if (response.ok) {
        setIncidents(prev => prev.map(inc => {
          const currentId = inc.incidentNumber || inc.IncidentNumber;
          return currentId === incidentId ? { ...inc, status: newStatus, Status: newStatus } : inc;
        }));
        setSelectedIncident(null);
      } else {
        alert("Failed to update status in the database.");
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingManual(true);

    const generatedId = `REC-MAN-${Math.floor(1000 + Math.random() * 9000)}`;

    const payload = {
      IncidentNumber: generatedId,
      RelatedOrder: "N/A",
      RelatedVehicle: manualForm.vehicleType || "Fleet Vehicle",
      ReportedByUserId: "Manual-Intake", 
      EmergencyType: "Control Room Logged Emergency",
      Description: `[Contact: ${manualForm.phone}] Caller: ${manualForm.name} | Details: ${manualForm.issue}`,
      Location: manualForm.location
    };

    try {
      const response = await fetch('http://localhost:5191/api/EmergencyIncidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setIsManualIntakeOpen(false);
        setManualForm({ name: '', phone: '', vehicleType: '', issue: '', location: '' });
        fetchIncidents(); 
      } else {
        alert("Failed to save manual intake.");
      }
    } catch (error) {
      console.error("Manual intake error:", error);
    } finally {
      setIsSubmittingManual(false);
    }
  };

  const getProp = (obj, propName) => {
    const capitalized = propName.charAt(0).toUpperCase() + propName.slice(1);
    return obj[propName] || obj[capitalized] || '';
  };

  const getReporterDetails = (incident) => {
    const order = getProp(incident, 'relatedOrder');
    if (order && order !== 'N/A') {
      return { type: 'Customer', label: 'Customer SOS', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    }
    return { type: 'Driver', label: 'Driver SOS', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
  };

  const parseDescription = (desc) => {
    if (!desc) return { route: null, phoneText: null, details: 'Urgent assistance requested.' };
    
    let route = null;
    let phoneText = '';
    let details = desc;

    const routeMatch = desc.match(/\[Route:\s*(.*?)\]/i);
    if (routeMatch) {
      route = routeMatch[1];
      details = details.replace(routeMatch[0], '');
    }

    const contactMatch = desc.match(/\[(?:Contact|Primary Contact|Primary Phone|Alt Phone):\s*(.*?)\]/i);
    if (contactMatch) {
      const rawNum = contactMatch[1].trim();
      if (rawNum && rawNum !== "Not Found in Profile" && rawNum !== "Unknown Contact") {
        phoneText = rawNum;
      }
      details = details.replace(contactMatch[0], '');
    }

    const secondPhoneMatch = desc.match(/\[(?:Alt Phone):\s*(.*?)\]/i);
    if (secondPhoneMatch) {
      if (!phoneText) phoneText = secondPhoneMatch[1].trim();
      details = details.replace(secondPhoneMatch[0], '');
    }

    details = details.replace(/^\s*\|\s*Details:\s*/i, '').replace(/^\s*Details:\s*/i, '').trim();

    if (!details) {
      details = "Urgent assistance requested.";
    }

    return { route, phoneText: phoneText.trim(), details };
  };

  const filteredIncidents = incidents.filter(inc => {
    const status = getProp(inc, 'status');
    const reporterDetails = getReporterDetails(inc);
    const parsedDesc = parseDescription(getProp(inc, 'description'));

    const matchesStatus = 
      statusFilter === 'Awaiting' ? status === 'Awaiting Control Room Acknowledgement' :
      statusFilter === 'Dispatched' ? status === 'Recovery Dispatched' :
      statusFilter === 'Resolved' ? status === 'Incident Resolved' : 
      true; 

    const matchesRole = 
      roleFilter === 'All' ? true : reporterDetails.type === roleFilter;

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' || 
      getProp(inc, 'incidentNumber').toLowerCase().includes(searchLower) ||
      getProp(inc, 'relatedVehicle').toLowerCase().includes(searchLower) ||
      (parsedDesc.phoneText && parsedDesc.phoneText.toLowerCase().includes(searchLower));

    return matchesStatus && matchesRole && matchesSearch;
  });

  const activeCount = incidents.filter(i => getProp(i, 'status') !== 'Incident Resolved').length;
  const resolvedCount = incidents.filter(i => getProp(i, 'status') === 'Incident Resolved').length;

  return (
    <div className="w-full space-y-6 pb-16 font-sans text-sm">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-widest mb-1">
            <ShieldAlert size={14} /> Critical Operations
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Emergency Recovery & SOS Hub</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Coordinate roadside breakdowns, filter incoming SOS alerts by role, and dispatch recovery units.
          </p>
        </div>
        <button 
          onClick={() => setIsManualIntakeOpen(true)}
          className="flex items-center space-x-1.5 bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Manual Intake</span>
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Lifetime Alerts</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{incidents.length}</p>
          </div>
          <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
            <AlertTriangle size={20} />
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Active Crises</p>
            <p className="text-2xl font-black text-red-700 mt-1">{activeCount}</p>
          </div>
          <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-500 animate-pulse">
            <ShieldAlert size={20} />
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Resolved</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{resolvedCount}</p>
          </div>
          <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>

      {/* Incident Log */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Professional Polished Filter Toolbar */}
        <div className="p-4 bg-gray-50/70 border-b border-gray-200/80 space-y-3">
          
          {/* Top Row: Status Tabs & Search Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            
            {/* Status Queue Tabs */}
            <div className="flex items-center bg-gray-200/60 p-1 rounded-2xl overflow-x-auto">
              {[
                { id: 'Awaiting', label: 'Awaiting Review' },
                { id: 'Dispatched', label: 'Recovery Dispatched' },
                { id: 'Resolved', label: 'Resolved' },
                { id: 'All', label: 'All Incidents' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    statusFilter === tab.id 
                      ? (tab.id === 'Awaiting' ? 'bg-red-600 text-white shadow-md' : 'bg-white text-gray-900 shadow-sm')
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/40'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Professional Search Input */}
            <div className="w-full md:w-80 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search size={15} className="text-gray-400" />
              </div>
              <input 
                type="text" 
                placeholder="Search ID, Vehicle, or Phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/10 shadow-sm transition-all"
              />
            </div>

          </div>

          {/* Bottom Row: Source Role Sub-Filters (Pill Design) */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
                <Filter size={12} /> Source Role:
              </span>
              <div className="flex gap-1.5 bg-gray-200/40 p-1 rounded-xl">
                {['All', 'Customer', 'Driver'].map(role => (
                  <button
                    key={role}
                    onClick={() => setRoleFilter(role)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      roleFilter === role 
                        ? 'bg-gray-900 text-white shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Filter Counter Notice */}
            <span className="text-[11px] font-semibold text-gray-500 hidden sm:inline">
              Showing <strong className="text-gray-900">{filteredIncidents.length}</strong> matching records
            </span>
          </div>

        </div>

        {/* Incident List Rendering */}
        <div className="p-5 space-y-4">
          {loading ? (
            <div className="text-center py-8 text-xs text-gray-500 font-bold">Scanning for secure transmissions...</div>
          ) : filteredIncidents.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-400 font-semibold bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-4">
              No emergency incidents found matching your current filter criteria.
            </div>
          ) : (
            filteredIncidents.map((inc) => {
              const incId = getProp(inc, 'incidentNumber');
              const status = getProp(inc, 'status');
              const badge = getReporterDetails(inc);
              
              const parsedDesc = parseDescription(getProp(inc, 'description'));

              return (
                <div 
                  key={incId} 
                  onClick={() => status !== 'Incident Resolved' && setSelectedIncident(inc)}
                  className={`p-4 rounded-2xl bg-white border flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition ${
                    status !== 'Incident Resolved' ? 'cursor-pointer hover:border-red-300 hover:shadow-md border-gray-200' : 'opacity-75 border-gray-100 bg-gray-50'
                  }`}
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-black text-gray-900 bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200 shadow-sm">
                        {incId}
                      </span>
                      <span className="text-[10px] font-black text-red-600 uppercase tracking-wider">{getProp(inc, 'emergencyType')}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${badge.color} uppercase tracking-wider`}>
                        {badge.label}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-gray-800">
                      <span className="flex items-center gap-1.5 bg-blue-50 text-blue-800 px-2 py-1 rounded-md border border-blue-100">
                        <Truck size={14} className="text-blue-600"/> {getProp(inc, 'relatedVehicle') || 'Unassigned'}
                      </span>
                      {getProp(inc, 'relatedOrder') !== 'N/A' && (
                        <span className="text-gray-600 flex items-center gap-1.5">
                          <User size={14} className="text-gray-400" /> Order: {getProp(inc, 'relatedOrder')}
                        </span>
                      )}
                      
                      {parsedDesc.phoneText && (
                        <span className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 font-mono text-[11px] font-bold">
                          <Phone size={12} className="text-emerald-600" /> {parsedDesc.phoneText}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col space-y-1.5">
                      <div className="flex items-start space-x-1.5 text-xs font-medium text-gray-600">
                        <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                        <span><strong className="text-gray-800">Location:</strong> {getProp(inc, 'location')}</span>
                      </div>
                      {parsedDesc.route && (
                        <div className="flex items-start space-x-1.5 text-[11px] font-medium text-gray-500 ml-5">
                          <span><strong className="text-gray-600">Active Route:</strong> {parsedDesc.route}</span>
                        </div>
                      )}
                    </div>
                    
                    {parsedDesc.details && (
                      <div className="inline-block mt-1 px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-700 w-full max-w-3xl">
                        <strong>Incident Details:</strong> {parsedDesc.details}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end justify-between h-full space-y-3 shrink-0">
                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      status === 'Incident Resolved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      status === 'Recovery Dispatched' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-red-50 text-red-700 border border-red-200 animate-pulse shadow-sm'
                    }`}>
                      {status}
                    </span>
                    <span className="text-[10px] text-gray-400 font-semibold block">
                      {new Date(getProp(inc, 'createdAt')).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Status Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-in zoom-in-95 duration-200 text-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-black text-gray-900 text-sm">Advance Incident Status</h3>
                <p className="text-gray-500 font-medium mt-0.5">{getProp(selectedIncident, 'incidentNumber')}</p>
              </div>
              <button onClick={() => setSelectedIncident(null)} className="text-gray-400 hover:text-gray-700 p-1.5 rounded-xl hover:bg-gray-50 transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 py-2">
              <p className="font-bold text-gray-700 mb-2">Select new milestone stage:</p>
              
              <button 
                onClick={() => handleAdvanceStatus('Recovery Dispatched')}
                className="w-full flex items-center justify-between p-3.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl font-bold transition cursor-pointer border border-blue-200"
              >
                <span>1. Recovery Team Dispatched</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button 
                onClick={() => handleAdvanceStatus('Incident Resolved')}
                className="w-full flex items-center justify-between p-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-bold transition cursor-pointer border border-emerald-200"
              >
                <span>2. Secure & Resolve Incident</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Intake */}
      {isManualIntakeOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-black text-gray-900 text-base">Control Room Manual Intake</h3>
                <p className="text-xs text-gray-500 mt-0.5">Log phone or radio-dispatched emergency calls.</p>
              </div>
              <button onClick={() => setIsManualIntakeOpen(false)} className="text-gray-400 hover:text-gray-700 p-1.5 rounded-xl hover:bg-gray-50 transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Caller Name</label>
                  <input 
                    type="text" 
                    required
                    value={manualForm.name}
                    onChange={(e) => setManualForm({...manualForm, name: e.target.value})}
                    placeholder="e.g., Driver / Client Name"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-red-400"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Contact Phone</label>
                  <input 
                    type="text" 
                    required
                    value={manualForm.phone}
                    onChange={(e) => setManualForm({...manualForm, phone: e.target.value})}
                    placeholder="+971 50 XXXXXXX"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-red-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Vehicle / Asset Unit</label>
                <input 
                  type="text" 
                  required
                  value={manualForm.vehicleType}
                  onChange={(e) => setManualForm({...manualForm, vehicleType: e.target.value})}
                  placeholder="e.g., Tanker WT-011"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-red-400"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Incident Location</label>
                <input 
                  type="text" 
                  required
                  value={manualForm.location}
                  onChange={(e) => setManualForm({...manualForm, location: e.target.value})}
                  placeholder="e.g., Masafi Mountain Pass"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-red-400"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Nature of Emergency</label>
                <textarea 
                  rows="3"
                  required
                  value={manualForm.issue}
                  onChange={(e) => setManualForm({...manualForm, issue: e.target.value})}
                  placeholder="Describe breakdown or site crisis..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-red-400"
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
                  disabled={isSubmittingManual}
                  className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingManual ? 'Logging...' : 'Log & Broadcast Emergency'}
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