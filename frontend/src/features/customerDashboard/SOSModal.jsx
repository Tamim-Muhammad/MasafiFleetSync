import React, { useState } from 'react';
import { PhoneCall, AlertTriangle, X, ShieldAlert, MapPin, Truck, CheckCircle2, Loader2, Send, Clock } from 'lucide-react';

const SOSModal = ({ isOpen, onClose, userRole = 'customer', activeContext = {} }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [incidentState, setIncidentState] = useState('form'); 
  const [incidentId, setIncidentId] = useState('');
  const [transmissionTime, setTransmissionTime] = useState('');
  const [incidentStatus, setIncidentStatus] = useState('Awaiting Control Room Acknowledgement');
  const [incidentType, setIncidentType] = useState('supply_crisis');
  const [description, setDescription] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formError, setFormError] = useState(''); // NEW: Inline error state
  
  const [locationName, setLocationName] = useState(
    activeContext.siteName || (userRole === 'driver' ? "Masafi Mountain Pass" : "Al Hail Construction Site, Zone 4")
  );

  if (!isOpen) return null;

  const config = {
    customer: {
      title: "Emergency Support (SOS)",
      subtitle: "Al-Waqar Operations Control",
      warningHeader: "EMERGENCY CHANNEL",
      warningText: "For critical supply failures, vehicle breakdowns, or safety crises.",
      primaryLabel: "Order / Lease:",
      primaryValue: activeContext.orderNumber || "ORD-9241",
      assetLabel: "Assigned Vehicle:",
      assetValue: activeContext.vehicleNumber || "Tanker WT-018",
    },
    driver: {
      title: "Driver Emergency (SOS)",
      subtitle: "Al-Waqar Dispatch & Fleet Control",
      warningHeader: "EMERGENCY CHANNEL",
      warningText: "For urgent on-site breakdowns or accidents. Telemetry is active.",
      primaryLabel: "Active Vehicle:",
      primaryValue: activeContext.vehicleNumber || "MFS-1245",
      assetLabel: "Assigned Route:",
      assetValue: activeContext.route || "Masafi-Fujairah Route 4",
    }
  }[userRole] || config?.customer;

  const handleEmergencySubmit = async (e) => {
    e.preventDefault();
    setFormError(''); // Reset errors on new submission
    
    // Strict Validation mapped to inline error state
    if (!locationName || !locationName.trim()) {
      setFormError("CRITICAL: Please provide your current incident location.");
      return;
    }

    if (!phoneNumber.trim()) {
      setFormError("Please provide a valid contact phone number.");
      return;
    }

    if (!description.trim() || description.trim().length < 5) {
      setFormError("Please provide brief details explaining the emergency (at least 5 characters).");
      return;
    }

    setIsSubmitting(true);
    
    const generatedId = `REC-2026-${Math.floor(100000 + Math.random() * 900000)}`.toUpperCase();
    const currentDate = new Date();
    const formattedTime = `${currentDate.toLocaleDateString()} • ${currentDate.toLocaleTimeString()}`;

    let currentUserId = localStorage.getItem("userId") || localStorage.getItem("id");
    const userStr = localStorage.getItem("user");
    if (userStr && !currentUserId) {
      const userObj = JSON.parse(userStr);
      currentUserId = userObj.id || userObj.Id || userObj.customerId;
    }

    let finalDescription = `[Contact: ${phoneNumber.trim()}] | Details: ${description.trim()}`;
      
    if (userRole === 'driver') {
      finalDescription = `[Route: ${config.assetValue}] ${finalDescription}`;
    }

    const payloadOrder = userRole === 'customer' ? config.primaryValue : 'N/A';
    const payloadVehicle = userRole === 'customer' ? config.assetValue : config.primaryValue;

    const payload = {
      IncidentNumber: generatedId,
      RelatedOrder: payloadOrder,
      RelatedVehicle: payloadVehicle,
      ReportedByUserId: String(currentUserId || 'Unknown'),
      EmergencyType: incidentType,
      Description: finalDescription,
      Location: locationName.trim()
    };

    try {
      const response = await fetch('http://localhost:5191/api/EmergencyIncidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setIncidentId(generatedId);
        setTransmissionTime(formattedTime);
        setIncidentStatus('Operations Control Room: Acknowledged');
        setIncidentState('submitted');
      } else {
        const errorText = await response.text();
        setFormError(`Backend Error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error("SOS Transmission Error:", error);
      setFormError("Network error. Please make sure your C# server is running.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setIncidentState('form');
    setIncidentStatus('Awaiting Control Room Acknowledgement');
    setDescription('');
    setPhoneNumber('');
    setFormError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-red-100 max-w-lg w-full transition-all">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 px-5 py-3 text-white flex items-center justify-between shadow-md rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md shadow-inner">
              <ShieldAlert size={20} className="text-white animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight">{config.title}</h3>
              <p className="text-[10px] text-red-100 font-medium">{config.subtitle}</p>
            </div>
          </div>
          <button 
            onClick={resetAndClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-3">
          
          {incidentState === 'submitted' ? (
            <div className="space-y-4 animate-in zoom-in-95 duration-300">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-md">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-950">Emergency Request Sent</h4>
                  <p className="text-[10px] text-emerald-800 font-medium mt-0.5">Your request was received by the Control Room.</p>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500 font-semibold">Incident ID:</span>
                  <span className="text-gray-900 font-mono font-bold bg-white px-2 py-0.5 rounded-md border border-gray-200">{incidentId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-semibold flex items-center gap-1.5"><Clock size={13} /> Submitted:</span>
                  <span className="text-gray-800 font-bold">{transmissionTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-semibold">Status:</span>
                  <span className="text-amber-600 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                    {incidentStatus}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <a 
                  href="tel:+971550000000"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs shadow-md transition"
                >
                  <PhoneCall size={15} /> Call Dispatch Center
                </a>
                <button 
                  onClick={resetAndClose}
                  className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 px-4 rounded-xl text-xs transition shadow-md cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : (
            /* ENTIRE BODY WRAPPED IN FORM FOR NATIVE BROWSER VALIDATION */
            <form onSubmit={handleEmergencySubmit} className="space-y-3">
              <div className="bg-red-50 border border-red-100 rounded-xl p-2.5 flex items-start gap-2.5">
                <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-black text-red-900 uppercase tracking-tight">{config.warningHeader}</p>
                  <p className="text-[11px] text-red-900 font-medium leading-snug mt-0.5">{config.warningText}</p>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-3 border-b border-gray-200/60 pb-2 items-start">
                  <div>
                    <span className="flex items-center gap-1.5 text-gray-500 font-semibold mb-0.5"><Truck size={13} className="text-[#0B2A4D]" /> {config.primaryLabel}</span>
                    <span className="text-gray-900 font-bold leading-tight block pr-2">{config.primaryValue}</span>
                  </div>
                  <div>
                    <span className="flex items-center gap-1.5 text-gray-500 font-semibold mb-0.5"><ShieldAlert size={13} className="text-[#0B2A4D]" /> {config.assetLabel}</span>
                    <span className="text-gray-900 font-bold leading-tight block">{config.assetValue}</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-gray-600 font-semibold">
                    <span className="flex items-center gap-1.5"><MapPin size={13} className="text-red-600" /> Incident Location:</span>
                    <span className="text-[10px] text-gray-500 hover:text-gray-800 transition cursor-pointer">Edit</span>
                  </div>
                  <input 
                    type="text"
                    required
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-gray-900 focus:outline-none focus:border-gray-500 shadow-sm transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wider">Emergency Type</label>
                  <select 
                    value={incidentType}
                    onChange={(e) => setIncidentType(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-gray-800 focus:outline-none focus:border-red-600 shadow-sm"
                  >
                    <option value="supply_crisis">Water Supply Outage</option>
                    <option value="breakdown">Vehicle Breakdown</option>
                    <option value="access_blocked">Site Access Blocked</option>
                    <option value="contamination">Contamination Alert</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wider">
                    Contact Phone <span className="text-red-600">*</span>
                  </label>
                  <input 
                    type="tel"
                    required
                    placeholder="+971 50 XXXXXXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-gray-800 focus:outline-none focus:border-red-600 shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wider">
                  Emergency Description <span className="text-red-600">*</span>
                </label>
                <input 
                  type="text"
                  required
                  minLength={5}
                  placeholder="Describe specific issue, situation, or hazards..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-[11px] text-gray-800 focus:outline-none focus:border-red-600 shadow-sm"
                />
              </div>

              <div className="bg-blue-50/60 border border-blue-100 rounded-lg p-2 flex items-center justify-between">
                <span className="font-bold uppercase tracking-wide text-[9px] text-blue-800">Auto-Shared:</span>
                <div className="flex gap-2.5 text-[9px] font-bold text-blue-900/70">
                  <span>✓ Location</span>
                  <span>✓ Order / Asset</span>
                  <span>✓ Callback Number</span>
                </div>
              </div>

              {/* Inline Error Banner for Edge Cases */}
              {formError && (
                <div className="flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-100 p-2 rounded-lg text-[10px] font-bold">
                  <AlertTriangle size={14} className="shrink-0" />
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-[11px] shadow-md transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />} 
                  {isSubmitting ? 'Transmitting...' : 'Transmit SOS'}
                </button>

                <a 
                  href="tel:+971550000000"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-[11px] shadow-md transition cursor-pointer"
                >
                  <PhoneCall size={13} /> Call Dispatch
                </a>
              </div>

              <div className="flex items-center justify-between px-1 pt-1">
                <span className="text-[9px] font-semibold text-gray-400">
                  Hotline: <span className="text-gray-700 font-bold">+971 55 000 0000</span>
                </span>
                <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> 24/7 Active
                </span>
              </div>

              <div className="text-center pt-0.5">
                <button 
                  type="button" 
                  onClick={resetAndClose}
                  className="text-[10px] font-bold text-gray-400 hover:text-gray-700 transition cursor-pointer uppercase tracking-wider"
                >
                  Cancel & Return to Dashboard
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SOSModal;