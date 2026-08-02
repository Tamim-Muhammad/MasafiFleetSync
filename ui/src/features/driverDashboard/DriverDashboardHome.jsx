import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  CheckCircle2, 
  FileText, 
  ShieldCheck, 
  Truck, 
  MapPin, 
  Navigation, 
  Clock, 
  Wallet, 
  Calendar, 
  ArrowRight,
  Info
} from 'lucide-react';

// Fix Leaflet default marker icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const DriverDashboardHome = () => {
  const navigate = useNavigate();

  // Coordinates for Masafi / Fujairah route simulation
  const driverPosition = [25.3048, 56.1265]; // Masafi region
  const customerPosition = [25.1222, 56.3415]; // Delivery destination
  const routeCoordinates = [driverPosition, [25.2100, 56.2300], customerPosition];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 1. Compliance Status Banner */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-emerald-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="bg-emerald-500 text-white p-3 rounded-xl shadow-sm">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-emerald-800 font-bold text-lg tracking-tight">STATUS: CLEARED FOR DISPATCH</h3>
            <p className="text-gray-500 text-sm mt-0.5">All your documents are valid. You are good to go!</p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/driver/compliance')}
          className="bg-white hover:bg-gray-50 text-blue-600 border border-blue-200 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-2xs flex items-center space-x-2 cursor-pointer"
        >
          <span>View Compliance Details</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Document Expiry Grid Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Driving License */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-200 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-sm">Driving License</h4>
                <p className="text-xs text-gray-400 mt-0.5">Expiry: 17 Dec 2026</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-emerald-600">42</span>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Days Left</p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center space-x-1.5 text-emerald-600 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Valid</span>
          </div>
        </div>

        {/* Insurance */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-200 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-sm">Insurance</h4>
                <p className="text-xs text-gray-400 mt-0.5">Expiry: 28 Jan 2026</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-blue-600">84</span>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Days Left</p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center space-x-1.5 text-emerald-600 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Valid</span>
          </div>
        </div>

        {/* Vehicle Registration */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-200 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-amber-50 text-amber-600 p-2.5 rounded-xl">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-sm">Vehicle Registration</h4>
                <p className="text-xs text-gray-400 mt-0.5">Expiry: 05 Feb 2026</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-amber-600">92</span>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Days Left</p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center space-x-1.5 text-emerald-600 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Valid</span>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Current Assignment & Job Progress Map / Right Side Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Current Assignment Details */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-base">Current Assignment</h3>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-mono font-bold px-2.5 py-1 rounded-lg">
                JOB #J-250518-01
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 font-medium">Customer</p>
                <h4 className="font-extrabold text-gray-800 text-base mt-0.5">Al Badia Construction LLC</h4>
              </div>

              <div>
                <p className="text-xs text-gray-400 font-medium">Service Type</p>
                <p className="font-semibold text-gray-700 text-sm mt-0.5">Water Tanker Delivery</p>
              </div>

              <div>
                <p className="text-xs text-gray-400 font-medium">Volume</p>
                <p className="font-semibold text-gray-900 text-base mt-0.5">5,000 Gallons</p>
              </div>

              <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-4">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[11px] text-gray-400">Location</p>
                    <p className="text-xs font-semibold text-gray-700">Masafi, Fujairah, UAE</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Navigation className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[11px] text-gray-400">Distance</p>
                    <p className="text-xs font-bold text-gray-800">18.6 km</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-100">
                <div className="flex items-center space-x-2 text-blue-900 mb-1">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold">ETA</span>
                </div>
                <p className="text-sm font-extrabold text-gray-900">10:30 AM – 11:00 AM</p>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-gray-500">Order Amount</span>
                  <span className="font-bold text-emerald-600 text-sm">AED 350.00</span>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => navigate('/driver/assignments')}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-blue-600/20 text-sm cursor-pointer"
          >
            View Assignment Details
          </button>
        </div>

        {/* Center Column: Job Progress & Real Leaflet Map */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-base">Job Progress</h3>
              <div className="flex items-center space-x-1.5 text-blue-600 text-xs font-bold">
                <span className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></span>
                <span>Live Tracking</span>
              </div>
            </div>

            {/* Stepper Workflow */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-xs font-bold text-emerald-900">Accepted</p>
                    <p className="text-[11px] text-emerald-700">You accepted the job</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-semibold text-emerald-700">07:15 AM</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50 border border-blue-200">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">🚚</div>
                  <div>
                    <p className="text-xs font-bold text-blue-900">En Route</p>
                    <p className="text-[11px] text-blue-700">You are on the way</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-semibold text-blue-700">07:28 AM</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 opacity-60">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                  <div>
                    <p className="text-xs font-bold text-gray-700">Arrived at Location</p>
                    <p className="text-[11px] text-gray-500">Mark when you reach</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">--:--</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 opacity-60">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                  <div>
                    <p className="text-xs font-bold text-gray-700">Payment Received</p>
                    <p className="text-[11px] text-gray-500">Collect cash from customer</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">--:--</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 opacity-60">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                  <div>
                    <p className="text-xs font-bold text-gray-700">Completed</p>
                    <p className="text-[11px] text-gray-500">Complete the job</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">--:--</span>
              </div>
            </div>

            {/* Real Leaflet Map Container */}
            <div className="relative h-44 rounded-xl overflow-hidden border border-gray-200 z-10">
              <MapContainer 
                center={driverPosition} 
                zoom={10} 
                zoomControl={false}
                dragging={false}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={driverPosition}>
                  <Popup>Your Tanker Location</Popup>
                </Marker>
                <Marker position={customerPosition}>
                  <Popup>Delivery Destination</Popup>
                </Marker>
                <Polyline positions={routeCoordinates} color="#2563eb" weight={4} dashArray="5, 5" />
              </MapContainer>

              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-2 z-20">
                <Navigation className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-xs font-bold text-gray-800">23 min <span className="text-[10px] text-gray-400 font-normal">(18.6 km)</span></p>
                  <p className="text-[10px] text-gray-500">Fastest route via E84</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Notifications & Announcements */}
        <div className="space-y-6">
          {/* Notifications Card */}
          <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-gray-900 text-sm">Notifications</h4>
              <button onClick={() => navigate('/driver/notifications')} className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer">View All</button>
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 pb-3 border-b border-gray-100">
                <div className="bg-blue-50 text-blue-600 p-2 rounded-lg mt-0.5">
                  <Navigation className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">New assignment received</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Job #J-250518-02</p>
                  <span className="text-[10px] text-gray-400 mt-1 block">10 min ago</span>
                </div>
              </div>

              <div className="flex items-start space-x-3 pb-3 border-b border-gray-100">
                <div className="bg-amber-50 text-amber-600 p-2 rounded-lg mt-0.5">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">Vehicle registration expires in 92 days.</p>
                  <span className="text-[10px] text-gray-400 mt-1 block">1 day ago</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">Insurance document verified successfully.</p>
                  <span className="text-[10px] text-gray-400 mt-1 block">2 days ago</span>
                </div>
              </div>
            </div>
          </div>

          {/* Announcements Card */}
          <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-gray-900 text-sm">Announcements</h4>
              <button className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer">View All</button>
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 pb-3 border-b border-gray-100">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] text-gray-700 leading-snug">Safety First: Follow all traffic rules and ensure safe loading/unloading.</p>
                  <span className="text-[10px] text-gray-400 mt-1 block">2 days ago</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 shrink-0"></div>
                <div>
                  <p className="text-[11px] text-gray-700 leading-snug">System Maintenance on 12 May 2025 (12:00 AM - 02:00 AM).</p>
                  <span className="text-[10px] text-gray-400 mt-1 block">3 days ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 4. Bottom Row: Earnings, Schedule, and Vehicle Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Today's Earnings Ledger */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-gray-900 text-sm">Today’s Earnings</h4>
              <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 tracking-tight">AED 350.00</h3>
            
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-500">2 Jobs Completed</span>
              <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Cash AED 350.00</span>
            </div>
          </div>

          <button 
            onClick={() => navigate('/driver/earnings')}
            className="mt-6 w-full bg-gray-50 hover:bg-gray-100 text-gray-800 font-semibold py-2.5 rounded-xl border border-gray-200 transition-all text-xs cursor-pointer"
          >
            View Earnings Summary
          </button>
        </div>

        {/* Upcoming Schedule */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-gray-900 text-sm">Upcoming Schedule</h4>
            <Calendar className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <p className="text-xs font-bold text-gray-800">09 May 2025, 08:00 AM</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Water Delivery – 3,000 Gal</p>
              </div>
              <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-md">Confirmed</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-800">10 May 2025, 09:30 AM</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Water Delivery – 2,000 Gal</p>
              </div>
              <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-md">Confirmed</span>
            </div>
          </div>
        </div>

        {/* Vehicle Overview - Professionally Redesigned Banner with Integrated Image */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-gray-900 text-sm">Vehicle Overview</h4>
              <Truck className="w-5 h-5 text-gray-400" />
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs mb-4">
              <div>
                <p className="text-gray-400">Vehicle No.</p>
                <p className="font-bold text-gray-800 font-mono mt-0.5">KT-78452</p>
              </div>
              <div>
                <p className="text-gray-400">Fleet Class</p>
                <p className="font-bold text-gray-800 mt-0.5">5,000 Gallon Tanker</p>
              </div>
              <div>
                <p className="text-gray-400">Chassis No.</p>
                <p className="font-bold text-gray-800 font-mono mt-0.5">JN1BC1AR3BT022331</p>
              </div>
              <div>
                <p className="text-gray-400">Year</p>
                <p className="font-bold text-gray-800 mt-0.5">2021</p>
              </div>
            </div>
          </div>

          {/* Professionally integrated banner style container for truck image */}
          <div className="relative mt-2 overflow-hidden rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-white p-3 flex items-center justify-between shadow-2xs">
            <div className="flex items-center space-x-2.5">
              <div className="bg-blue-600 text-white p-2 rounded-lg shadow-xs">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-blue-900 uppercase tracking-wider">Active Fleet Asset</p>
                <p className="text-[10px] text-gray-500 font-medium">Al-Waqar Heavy Transport</p>
              </div>
            </div>
            <div className="relative group overflow-hidden rounded-lg shadow-xs border border-blue-200/60 bg-white">
              <img 
                src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=300" 
                alt="Water Tanker Truck" 
                className="h-14 w-24 object-cover transform transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-blue-900/10 pointer-events-none"></div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default DriverDashboardHome;