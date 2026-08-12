import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Clock, 
  CheckCircle, 
  Truck, 
  MapPin, 
  Calendar, 
  Search, 
  Filter, 
  ArrowUpRight,
  Droplets,
  Key,
  X,
  SlidersHorizontal,
  ShieldCheck,
  Navigation,
  PackageOpen
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const CustomerMyOrders = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Tabs & Controls State
  const [activeTab, setActiveTab] = useState('water');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'completed'
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  // Live Database Orders State
  const [waterOrders, setWaterOrders] = useState([]);
  const [rentalOrders, setRentalOrders] = useState([]);

  // Sync state with incoming URL query parameters when clicking dashboard metrics cards
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const statusParam = searchParams.get('status');

    if (tabParam) {
      setActiveTab(tabParam);
    }
    if (statusParam) {
      setStatusFilter(statusParam);
    }
  }, [searchParams]);

  // Fetch actual water orders and vehicle rentals from backend database on mount
  useEffect(() => {
    // 1. Fetch Water Orders
    fetch('http://localhost:3000/orders')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const formattedOrders = data.map((item) => ({
            id: item.id ? `WTR-2026-${item.id.slice(-3).toUpperCase()}` : 'WTR-2026-942',
            date: item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Aug 02, 2026',
            volume: `${item.volume || item.volumeGallons || 5000} Gallons Tanker`,
            destination: item.deliveryAddress || 'Masafi Central Yard Delivery Zone',
            cost: item.price ? Number(item.price).toFixed(2) : '157.00',
            status: item.status ? item.status.toLowerCase() : 'pending',
            driverName: item.driverName || 'Ahmed Al-Mazrouei',
            vehiclePlate: item.vehiclePlate || 'F-92814',
            distance: '2 km from Yard',
            paymentMethod: 'Cash on Delivery (COD)'
          }));
          setWaterOrders(formattedOrders);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch backend orders:', err);
      });

    // 2. Fetch Live Vehicle Rentals from Backend
    fetch('http://localhost:3000/rentals')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const formattedRentals = data.map((item) => {
            const start = new Date(item.startDate);
            const end = new Date(item.endDate);
            const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            const durationDays = diffDays > 0 ? diffDays : 30;

            return {
              id: item.id ? `RNT-2026-${item.id.slice(-3).toUpperCase()}` : 'RNT-2026-110',
              date: item.startDate ? new Date(item.startDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Aug 01, 2026',
              vehicle: item.vehicle?.name || item.vehicleCategory || 'Heavy Water Tanker Truck',
              duration: `${durationDays} Days Lease`,
              cost: item.totalPrice ? Number(item.totalPrice).toFixed(2) : '3,500.00',
              status: item.status ? item.status.toLowerCase() : 'active',
              contractId: item.id ? `CNT-${item.id.slice(-5).toUpperCase()}` : 'CNT-99412',
              deposit: item.depositStatus === 'Verified' ? 'AED 1,000.00 (Verified)' : 'AED 1,000.00 (Held)'
            };
          });
          setRentalOrders(formattedRentals);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch backend rentals, falling back to mock data', err);
        setRentalOrders([
          {
            id: 'RNT-2026-110',
            date: 'Aug 01, 2026',
            vehicle: 'Heavy Water Tanker Truck (10,000L)',
            duration: '30 Days Lease',
            cost: '3,500.00',
            status: 'active',
            contractId: 'CNT-99412',
            deposit: 'AED 1,000.00 (Held)'
          }
        ]);
      });
  }, []);

  // Filtered Logic for Water Deliveries
  const filteredWaterOrders = waterOrders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) || order.destination.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter || (statusFilter === 'pending' && order.status === 'active');
    return matchesSearch && matchesStatus;
  });

  // Filtered Logic for Vehicle Leases
  const filteredRentalOrders = rentalOrders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) || order.vehicle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter || (statusFilter === 'pending' && order.status === 'active');
    return matchesSearch && matchesStatus;
  });

  const StatusBadge = ({ status }) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 px-3 py-1 rounded-lg text-xs font-bold border border-amber-200 shadow-sm animate-pulse">
            <Clock size={14} className="text-amber-600" /> Awaiting Dispatch
          </span>
        );
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 px-3 py-1 rounded-lg text-xs font-bold border border-blue-200 shadow-sm">
            <Truck size={14} className="text-blue-600" /> Active Lease
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-lg text-xs font-bold border border-emerald-200 shadow-sm">
            <CheckCircle size={14} className="text-emerald-600" /> Completed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header Section with Premium Gradient Background */}
      <div className="bg-gradient-to-r from-[#0B2A4D] via-[#103E73] to-[#0B2A4D] p-8 rounded-3xl shadow-xl text-white flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-white/5 skew-x-12 pointer-events-none"></div>
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/30 border border-blue-400/30 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase text-blue-200">
            <PackageOpen size={13} /> Logistics Tracking & Fulfillment
          </div>
          <h1 className="text-3xl font-black tracking-tight">My Orders & History</h1>
          <p className="text-xs text-blue-100 max-w-xl leading-relaxed">
            Manage active bulk water dispatch requests, monitor real-time delivery status, and download verified tax receipts.
          </p>
        </div>
      </div>

      {/* Control Toolbar Card */}
      <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tabs Switcher */}
        <div className="flex bg-gray-100 p-1.5 rounded-2xl shrink-0 border border-gray-200/60 shadow-inner">
          <button
            onClick={() => setActiveTab('water')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all duration-200 cursor-pointer flex items-center gap-2 ${
              activeTab === 'water' 
                ? 'bg-white text-[#0B2A4D] shadow-lg scale-105' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Droplets size={16} className={activeTab === 'water' ? 'text-blue-600' : 'text-gray-400'} /> 
            Bulk Water Deliveries ({filteredWaterOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('rentals')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all duration-200 cursor-pointer flex items-center gap-2 ${
              activeTab === 'rentals' 
                ? 'bg-white text-[#0B2A4D] shadow-lg scale-105' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Key size={16} className={activeTab === 'rentals' ? 'text-amber-600' : 'text-gray-400'} /> 
            Vehicle Leases ({filteredRentalOrders.length})
          </button>
        </div>

        {/* Search & Filter Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Reference ID or Destination..."
              className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B2A4D] w-72 shadow-2xs"
            />
          </div>
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer border shadow-2xs ${
              statusFilter !== 'all' ? 'bg-blue-50 text-[#0B2A4D] border-blue-200' : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
            }`}
          >
            <Filter size={14} /> Filter {statusFilter !== 'all' && `(1)`}
          </button>
        </div>
      </div>

      {/* Expandable Filter Box */}
      {isFilterOpen && (
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-md flex items-center justify-between animate-in fade-in zoom-in duration-200">
          <div className="flex items-center gap-4 text-xs font-bold text-gray-700">
            <span className="flex items-center gap-1 text-gray-400 uppercase tracking-wider text-[10px]">
              <SlidersHorizontal size={14} /> Filter Status:
            </span>
            <button 
              onClick={() => setStatusFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer font-bold ${statusFilter === 'all' ? 'bg-[#0B2A4D] text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              All Records
            </button>
            <button 
              onClick={() => setStatusFilter('pending')}
              className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer font-bold ${statusFilter === 'pending' ? 'bg-[#0B2A4D] text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Active / Pending
            </button>
            <button 
              onClick={() => setStatusFilter('completed')}
              className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer font-bold ${statusFilter === 'completed' ? 'bg-[#0B2A4D] text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Completed
            </button>
          </div>
          <button 
            onClick={() => { setStatusFilter('all'); setIsFilterOpen(false); }}
            className="text-xs text-gray-400 hover:text-gray-600 font-bold cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Data Card Grid/List */}
      <div className="space-y-4">
        {activeTab === 'water' && (
          <div className="grid grid-cols-1 gap-4">
            {filteredWaterOrders.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl text-center border border-gray-100 shadow-sm space-y-2">
                <p className="text-sm font-bold text-gray-700">No matching water delivery records found</p>
                <p className="text-xs text-gray-400">Try adjusting your search query or status filters.</p>
              </div>
            ) : (
              filteredWaterOrders.map((order) => (
                <div 
                  key={order.id} 
                  className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0B2A4D] flex flex-col items-center justify-center font-black shrink-0 border border-blue-100 shadow-inner">
                      <Droplets size={22} className="text-blue-600 mb-0.5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-[#0B2A4D]">{order.id}</span>
                        <StatusBadge status={order.status} />
                      </div>
                       
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-gray-500 pt-1 font-medium">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-gray-400" /> {order.date}
                        </span>
                        <span className="flex items-center gap-1.5 font-bold text-gray-700">
                          <Droplets size={13} className="text-blue-500" /> {order.volume}
                        </span>
                        <span className="flex items-center gap-1.5 truncate max-w-xs">
                          <MapPin size={13} className="text-gray-400" /> {order.destination}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:justify-end gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                    <div className="text-left lg:text-right">
                      <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Amount</span>
                      <span className="text-base font-black text-gray-900">AED {order.cost}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setSelectedOrderDetails(order)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs"
                      >
                        Details
                      </button>

                      {order.status === 'completed' ? (
                        <button 
                          onClick={() => alert(`Downloading verified tax invoice for order ${order.id}...`)}
                          className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer border border-blue-200 shadow-2xs"
                        >
                          <Download size={14} /> Receipt
                        </button>
                      ) : (
                        <button 
                          onClick={() => navigate('/customer/dashboard/track')}
                          className="flex items-center gap-2 bg-[#0B2A4D] hover:bg-blue-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
                        >
                          Track Live Status <ArrowUpRight size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'rentals' && (
          <div className="grid grid-cols-1 gap-4">
            {filteredRentalOrders.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl text-center border border-gray-100 shadow-sm space-y-2">
                <p className="text-sm font-bold text-gray-700">No matching vehicle lease records found</p>
                <p className="text-xs text-gray-400">Try adjusting your search query or status filters.</p>
              </div>
            ) : (
              filteredRentalOrders.map((order) => (
                <div 
                  key={order.id} 
                  className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-800 flex flex-col items-center justify-center font-black shrink-0 border border-amber-100 shadow-inner">
                      <Key size={22} className="text-amber-600 mb-0.5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-[#0B2A4D]">{order.id}</span>
                        <StatusBadge status={order.status} />
                      </div>
                       
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-gray-500 pt-1 font-medium">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-gray-400" /> {order.date}
                        </span>
                        <span className="flex items-center gap-1.5 font-bold text-gray-700">
                          <Truck size={13} className="text-amber-600" /> {order.vehicle}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={13} className="text-gray-400" /> {order.duration}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:justify-end gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                    <div className="text-left lg:text-right">
                      <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Lease Cost</span>
                      <span className="text-base font-black text-gray-900">AED {order.cost}</span>
                    </div>

                    <button 
                      onClick={() => alert(`Opening digital contract PDF viewer for lease ${order.id}...`)}
                      className="flex items-center gap-2 bg-[#0B2A4D] hover:bg-blue-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
                    >
                      <FileText size={14} /> View Digital Contract
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Detailed Order Modal Popup */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest">Order Summary Report</span>
                <h3 className="text-xl font-black text-[#0B2A4D]">{selectedOrderDetails.id}</h3>
              </div>
              <button 
                onClick={() => setSelectedOrderDetails(null)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div>
                  <span className="block text-[10px] text-gray-400 font-bold uppercase">Logistics Operator</span>
                  <span className="font-extrabold text-gray-800 text-sm">{selectedOrderDetails.driverName}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400 font-bold uppercase">Assigned Fleet Plate</span>
                  <span className="font-extrabold text-gray-800 text-sm">{selectedOrderDetails.vehiclePlate}</span>
                </div>
              </div>

              <div className="space-y-2.5 px-1">
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">Requested Volume:</span>
                  <span className="font-bold text-gray-800">{selectedOrderDetails.volume}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">Road Distance from Yard:</span>
                  <span className="font-bold text-gray-800">{selectedOrderDetails.distance}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">Destination Address:</span>
                  <span className="font-bold text-gray-800 max-w-[240px] text-right">{selectedOrderDetails.destination}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">Payment Protocol:</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <ShieldCheck size={14} /> {selectedOrderDetails.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between py-2 text-sm font-black text-[#0B2A4D] pt-1">
                  <span>Total Cost Breakdown:</span>
                  <span className="text-base">AED {selectedOrderDetails.cost}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl text-xs transition cursor-pointer"
              >
                Close Window
              </button>
              {selectedOrderDetails.status === 'pending' && (
                <button
                  onClick={() => { setSelectedOrderDetails(null); navigate('/customer/dashboard/track'); }}
                  className="flex-1 bg-[#0B2A4D] hover:bg-blue-900 text-white font-bold py-3 rounded-xl text-xs transition shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <Navigation size={14} /> Open Live Tracker
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerMyOrders;