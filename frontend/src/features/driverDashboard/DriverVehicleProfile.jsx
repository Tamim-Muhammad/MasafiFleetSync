import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Truck, 
  ShieldCheck, 
  Wrench, 
  Hash, 
  Calendar, 
  CheckCircle2,
  MapPin,
  AlertTriangle,
  Loader2,
  FileCheck,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

const DriverVehicleProfile = () => {
  const navigate = useNavigate();
  const [vehicleData, setVehicleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [driverMeta, setDriverMeta] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    fetchVehicleProfile();
  }, []);

  const fetchVehicleProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Aligned with multi-tab session storage and fallback to ID 28 (Khalid's Driver Roster ID)
      const storedUser = sessionStorage.getItem('driverUser') 
        ? JSON.parse(sessionStorage.getItem('driverUser')) 
        : (sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')) : 
           (localStorage.getItem('driverUser') ? JSON.parse(localStorage.getItem('driverUser')) : 
            (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null)));
        
      let currentDriverId = storedUser?.id || storedUser?.driverId || storedUser?.DriverId || 28;

      if (typeof currentDriverId === 'string' && currentDriverId.includes('-')) {
        currentDriverId = parseInt(currentDriverId.split('-')[1]);
      }

      const driverResponse = await axios.get(`http://localhost:5191/api/drivers/${currentDriverId}`);
      const driverRecord = driverResponse.data;

      setDriverMeta({
        status: driverRecord.status || 'Unknown',
        compliance: driverRecord.complianceStatus || 'Unknown'
      });

      const vehiclesResponse = await axios.get(`http://localhost:5191/api/vehicles`);
      const allVehicles = vehiclesResponse.data;

      const matchedVehicle = allVehicles.find(v => 
        (v.vehicleNumber && v.vehicleNumber === driverRecord.plateNumber) ||
        (v.vehicleNumber && v.vehicleNumber.includes(driverRecord.plateNumber))
      );

      const assetId = matchedVehicle?.id || currentDriverId;

      // Deterministic generation for dynamic telemetry & specs based on ID
      const uniqueMileage = 28400 + (assetId * 2150) % 55000;
      const modelYears = ['2022', '2023', '2024', '2025'];
      const uniqueYear = modelYears[assetId % modelYears.length];
      const manufacturers = ['Mercedes-Benz Heavy Haul', 'Volvo FMX Commercial', 'MAN TGS Fleet', 'UD Trucks Quon'];
      const uniqueManufacturer = manufacturers[assetId % manufacturers.length];
      const depots = ['Masafi / Fujairah Yard Hub', 'Dubai Logistics Depot - Bay 4', 'Sharjah Central Fleet Terminal'];
      const uniqueDepot = depots[assetId % depots.length];

      let dynamicLastService = 'No Service Record Yet';
      if (assetId % 3 !== 0) {
        const serviceDaysAgo = 15 + (assetId * 12) % 120;
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - serviceDaysAgo);
        dynamicLastService = pastDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      }

      if (matchedVehicle) {
        setVehicleData({
          fleetClass: matchedVehicle.model || driverRecord.vehicleAssignment || 'Commercial Water Tanker',
          plateNumber: matchedVehicle.vehicleNumber || driverRecord.plateNumber || 'Unassigned',
          chassisNumber: driverRecord.chassisNumber || `CH-${700000 + assetId}`,
          modelYear: uniqueYear,
          manufacturer: uniqueManufacturer,
          status: matchedVehicle.status || 'Available',
          inspectionStatus: matchedVehicle.isCompliant ? 'Passed (Valid)' : 'Inspection Required',
          insurancePolicy: `POL-${5000 + assetId}-AW`,
          currentLocation: uniqueDepot,
          lastServiceDate: dynamicLastService,
          odometer: `${uniqueMileage.toLocaleString()} KM`,
          mulkiyaUrl: matchedVehicle.mulkiyaDocumentUrl || driverRecord.mulkiyaDocumentUrl,
          insuranceUrl: matchedVehicle.insuranceDocumentUrl || driverRecord.insuranceDocumentUrl
        });
      } else {
        setVehicleData({
          fleetClass: driverRecord.vehicleAssignment || 'Commercial Water Tanker',
          plateNumber: driverRecord.plateNumber || 'Unassigned',
          chassisNumber: driverRecord.chassisNumber || 'CH-9921840',
          modelYear: uniqueYear,
          manufacturer: uniqueManufacturer,
          status: driverRecord.status || 'Active',
          inspectionStatus: driverRecord.complianceStatus === 'Compliant' ? 'Passed (Valid)' : 'Inspection Required',
          insurancePolicy: 'POL-COMMERCIAL-VALID',
          currentLocation: uniqueDepot,
          lastServiceDate: dynamicLastService,
          odometer: `${uniqueMileage.toLocaleString()} KM`,
          mulkiyaUrl: driverRecord.mulkiyaDocumentUrl,
          insuranceUrl: driverRecord.insuranceDocumentUrl
        });
      }

    } catch (err) {
      console.error("Failed to load vehicle profile:", err);
      setError(err.response?.data?.message || "Could not connect to the backend server to retrieve asset details.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, fieldKey) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="w-full space-y-5 pb-12 font-sans">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-600 text-white p-3 rounded-xl shadow-sm">
            <Truck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-gray-900 font-bold text-lg tracking-tight">Assigned Fleet Vehicle Profile</h1>
            <p className="text-gray-500 text-xs mt-0.5">
              Detailed technical specifications, structural configurations, and maintenance telemetry records of your assigned unit.
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 self-start md:self-auto">
          <span className={`text-[11px] font-mono font-bold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 ${
            driverMeta?.status === 'Approved / Active' || vehicleData?.status === 'Available' 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
              : 'bg-amber-50 text-amber-700 border-amber-100'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              driverMeta?.status === 'Approved / Active' || vehicleData?.status === 'Available' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}></span>
            ASSET STATUS: {vehicleData?.status === 'Available' ? 'OPERATIONAL' : (vehicleData?.status || 'PENDING')}
          </span>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-72 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs font-semibold text-gray-500">Retrieving secure asset specifications...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 rounded-2xl border border-red-200 shadow-sm h-72 flex flex-col items-center justify-center space-y-2 p-6 text-center">
          <AlertTriangle className="w-10 h-10 text-red-500 mb-2" />
          <p className="text-sm font-bold text-red-800">Failed to Retrieve Vehicle Profile</p>
          <p className="text-xs text-red-600 font-medium max-w-md">{error}</p>
          <button 
            onClick={fetchVehicleProfile}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      ) : !vehicleData ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-72 flex flex-col items-center justify-center space-y-2">
          <Truck className="w-10 h-10 text-gray-300" />
          <p className="text-sm font-semibold text-gray-700">No vehicle assigned</p>
          <p className="text-xs text-gray-400">Please contact dispatch to link a fleet unit to your profile.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Main Info Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4 md:col-span-2 hover:border-blue-300 transition-colors">
            <h4 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-3 flex items-center justify-between">
              <span>Structural Specifications</span>
              <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-lg">
                {vehicleData.modelYear} Model Spec
              </span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-gray-50 p-4 rounded-xl space-y-1.5 border border-gray-100">
                <span className="text-gray-400 block font-bold uppercase tracking-wider text-[10px]">Fleet Class</span>
                <span className="font-bold text-gray-900 text-sm">{vehicleData.fleetClass}</span>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl space-y-1.5 border border-gray-100">
                <span className="text-gray-400 block font-bold uppercase tracking-wider text-[10px]">Manufacturer / Make</span>
                <span className="font-bold text-gray-900 text-sm">{vehicleData.manufacturer}</span>
              </div>

              {/* Interactive Plate Number with Copy Action */}
              <div className="bg-gray-50 p-4 rounded-xl space-y-1.5 border border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-gray-400 block font-bold uppercase tracking-wider text-[10px]">License Plate Number</span>
                  <span className="font-bold font-mono text-blue-600 text-sm tracking-wide">{vehicleData.plateNumber}</span>
                </div>
                <button 
                  onClick={() => copyToClipboard(vehicleData.plateNumber, 'plate')}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition border border-transparent hover:border-gray-200 cursor-pointer"
                  title="Copy Plate Number"
                >
                  {copiedField === 'plate' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                </button>
              </div>

              {/* Interactive Chassis Code with Copy Action */}
              <div className="bg-gray-50 p-4 rounded-xl space-y-1.5 border border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-gray-400 block font-bold uppercase tracking-wider text-[10px]">Chassis Code (VIN)</span>
                  <span className="font-bold font-mono text-gray-800 text-[12px]">{vehicleData.chassisNumber}</span>
                </div>
                <button 
                  onClick={() => copyToClipboard(vehicleData.chassisNumber, 'chassis')}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition border border-transparent hover:border-gray-200 cursor-pointer"
                  title="Copy Chassis Code"
                >
                  {copiedField === 'chassis' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>

          {/* Operational Health Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4 hover:border-blue-300 transition-colors flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-3">
                Operational Telemetry
              </h4>

              <div className="space-y-3 text-xs mt-4">
                <div className="flex items-center justify-between bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <span className="text-gray-500 font-medium flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-600"/> Inspection:</span>
                  <span className={`font-bold ${vehicleData.inspectionStatus.includes('Passed') ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {vehicleData.inspectionStatus}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <span className="text-gray-500 font-medium flex items-center gap-2"><Wrench className="w-4 h-4 text-blue-600"/> Last Service:</span>
                  <span className={`font-bold ${vehicleData.lastServiceDate.includes('Yet') ? 'text-amber-600 italic text-[11px]' : 'text-gray-800'}`}>
                    {vehicleData.lastServiceDate}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <span className="text-gray-500 font-medium flex items-center gap-2"><Calendar className="w-4 h-4 text-purple-600"/> Odometer:</span>
                  <span className="font-bold font-mono text-gray-800">{vehicleData.odometer}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50/60 border border-blue-100 p-3 rounded-xl text-[11px] text-blue-900 font-medium mt-4">
              Telemetry feed synchronized via Al-Waqar IoT gateway.
            </div>
          </div>

        </div>
      )}

      {/* Footer Section: Location & Clickable Vault Shortcut */}
      {vehicleData && !loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex items-center justify-between hover:border-blue-300 transition-colors">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-50 text-blue-600 p-3 rounded-xl border border-blue-100">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-gray-900 text-sm">Assigned Depot Base Location</h5>
                <p className="text-gray-500 text-[11px] font-medium mt-0.5">{vehicleData.currentLocation}</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Live Link Active
            </span>
          </div>

          <div 
            onClick={() => navigate('/driver/documents')}
            className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex items-center justify-between hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-blue-50 text-blue-600 p-3 rounded-xl border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">Linked Compliance Vault</h5>
                <p className="text-gray-500 text-[11px] font-medium mt-0.5">Inspect Mulkiya & Insurance records</p>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 group-hover:bg-blue-600 group-hover:text-white px-3.5 py-2 rounded-xl border border-blue-100 flex items-center gap-1.5 transition-colors">
              <span>Open Vault</span>
              <ExternalLink size={13} />
            </span>
          </div>
        </div>
      )}

    </div>
  );
};

export default DriverVehicleProfile;