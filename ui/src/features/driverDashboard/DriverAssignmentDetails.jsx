import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Navigation, 
  Clock, 
  Building2, 
  Droplet, 
  FileText, 
  CheckCircle2,
  Phone,
  MessageSquare
} from 'lucide-react';

const DriverAssignmentDetails = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Top Header & Back Navigation */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-xs font-bold text-gray-600 hover:text-blue-600 bg-white px-4 py-2.5 rounded-xl border border-gray-200 transition-colors shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
        <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-100">
          JOB #J-250518-01 — ACTIVE ASSIGNMENT
        </span>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Order Specs & Customer Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Customer & Location Overview Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" /> Client & Delivery Location
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Customer Name</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">Al Badia Construction LLC</p>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer" title="Call Customer">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer" title="Message Dispatch">
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center space-x-2 text-gray-400 mb-1">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Destination</span>
                  </div>
                  <p className="text-xs font-bold text-gray-800 mt-1">Masafi Construction Site, Sector B</p>
                  <p className="text-[11px] text-gray-500">Masafi, Fujairah, UAE</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center space-x-2 text-gray-400 mb-1">
                    <Navigation className="w-4 h-4 text-blue-500" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Route Metrics</span>
                  </div>
                  <p className="text-xs font-bold text-gray-800 mt-1">18.6 km (Fastest via E84)</p>
                  <p className="text-[11px] text-gray-500">Est. Transit Time: 23 mins</p>
                </div>
              </div>
            </div>
          </div>

          {/* Service & Water Tanker Specifications */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Droplet className="w-5 h-5 text-blue-600" /> Cargo & Service Specifications
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50/40 rounded-xl border border-blue-100">
                <p className="text-[11px] text-blue-600 font-bold uppercase tracking-wider">Service Type</p>
                <p className="text-xs font-bold text-gray-900 mt-1">Water Tanker Delivery</p>
              </div>

              <div className="p-4 bg-blue-50/40 rounded-xl border border-blue-100">
                <p className="text-[11px] text-blue-600 font-bold uppercase tracking-wider">Volume Load</p>
                <p className="text-xs font-bold text-gray-900 mt-1">5,000 Gallons</p>
              </div>

              <div className="p-4 bg-blue-50/40 rounded-xl border border-blue-100">
                <p className="text-[11px] text-blue-600 font-bold uppercase tracking-wider">Water Grade</p>
                <p className="text-xs font-bold text-gray-900 mt-1">Treated Industrial Supply</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Financial Summary & Actions */}
        <div className="space-y-6">
          
          {/* Time & Financial Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" /> Schedule & Payment
              </h3>

              <div className="space-y-4">
                <div className="pb-3 border-b border-gray-100">
                  <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Assigned ETA Window</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">10:30 AM – 11:00 AM</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Base Service Fare</span>
                    <span className="font-semibold text-gray-800">AED 320.00</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Express Route Surcharge</span>
                    <span className="font-semibold text-gray-800">AED 30.00</span>
                  </div>
                  <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-900">Total Order Amount</span>
                    <span className="text-lg font-bold text-emerald-600">AED 350.00</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center space-x-2 text-emerald-800 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Collection Mode: Cash on Delivery (COD)</span>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <button 
                onClick={() => alert('Job status advanced to Arrived!')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3 rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                Mark as Arrived at Location
              </button>
              <button 
                onClick={() => navigate(-1)}
                className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold py-2.5 rounded-xl transition-colors border border-gray-200 cursor-pointer"
              >
                Return to Live Dashboard
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default DriverAssignmentDetails;