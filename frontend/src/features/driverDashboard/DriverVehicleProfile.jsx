import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Truck, 
  ShieldCheck, 
  Wrench, 
  Hash, 
  Calendar, 
  CheckCircle2,
  MapPin
} from 'lucide-react';

const DriverVehicleProfile = () => {
  const navigate = useNavigate();

  // Vehicle profile details matching Al-Waqar Transport fleet specs
  const vehicleData = {
    fleetClass: '5,000 Gallon Water Tanker',
    plateNumber: 'KT-78452-UAE',
    chassisNumber: 'CH-992184029-TX',
    modelYear: '2024',
    manufacturer: 'Mercedes-Benz Heavy Haul',
    status: 'Active & Assigned',
    inspectionStatus: 'Passed (Valid)',
    insurancePolicy: 'POL-99281-OM',
    currentLocation: 'Masafi / Fujairah Yard Hub',
    lastServiceDate: '12 May 2026',
    odometer: '48,210 KM'
  };

  return (
    <div className="w-full space-y-6 pb-12 relative">
      
      {/* Top Header & Back Navigation */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-xs font-bold text-gray-600 hover:text-blue-600 bg-white px-4 py-2.5 rounded-xl border border-gray-200 transition-colors shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
        <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-100 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" /> ASSET STATUS: OPERATIONAL
        </span>
      </div>

      {/* Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-blue-200 flex items-center space-x-4">
        <div className="bg-blue-600 text-white p-3.5 rounded-xl shadow-sm">
          <Truck className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-blue-900 font-bold text-lg">Assigned Fleet Vehicle Profile</h3>
          <p className="text-gray-500 text-xs mt-0.5">Detailed technical specifications, structural configurations, and maintenance records of your assigned unit.</p>
        </div>
      </div>

      {/* Vehicle Specification Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Main Info Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4 md:col-span-2">
          <h4 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-3 flex items-center justify-between">
            <span>Structural Specifications</span>
            <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">{vehicleData.modelYear} Model</span>
          </h4>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-gray-50 p-3.5 rounded-xl space-y-1 border border-gray-100">
              <span className="text-gray-400 block font-semibold uppercase text-[10px]">Fleet Class</span>
              <span className="font-bold text-gray-900 text-sm">{vehicleData.fleetClass}</span>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-xl space-y-1 border border-gray-100">
              <span className="text-gray-400 block font-semibold uppercase text-[10px]">Manufacturer</span>
              <span className="font-bold text-gray-900 text-sm">{vehicleData.manufacturer}</span>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-xl space-y-1 border border-gray-100">
              <span className="text-gray-400 block font-semibold uppercase text-[10px]">License Plate Number</span>
              <span className="font-bold font-mono text-blue-600 text-sm">{vehicleData.plateNumber}</span>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-xl space-y-1 border border-gray-100">
              <span className="text-gray-400 block font-semibold uppercase text-[10px]">Chassis Code (VIN)</span>
              <span className="font-bold font-mono text-gray-800 text-xs">{vehicleData.chassisNumber}</span>
            </div>
          </div>
        </div>

        {/* Operational Status Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4">
          <h4 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-3">
            Operational Health
          </h4>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
              <span className="text-gray-500 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-600"/> Inspection:</span>
              <span className="font-bold text-emerald-600">{vehicleData.inspectionStatus}</span>
            </div>

            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
              <span className="text-gray-500 flex items-center gap-1.5"><Wrench className="w-4 h-4 text-blue-600"/> Last Service:</span>
              <span className="font-bold text-gray-800">{vehicleData.lastServiceDate}</span>
            </div>

            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
              <span className="text-gray-500 flex items-center gap-1.5"><Calendar className="w-4 h-4 text-purple-600"/> Odometer:</span>
              <span className="font-bold font-mono text-gray-800">{vehicleData.odometer}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Location & Depot Assignment Footer */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h5 className="font-bold text-gray-900 text-xs">Assigned Depot Base Location</h5>
            <p className="text-gray-500 text-[11px] mt-0.5">{vehicleData.currentLocation}</p>
          </div>
        </div>
        <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
          Sync Status: Real-Time Active
        </span>
      </div>

    </div>
  );
};

export default DriverVehicleProfile;