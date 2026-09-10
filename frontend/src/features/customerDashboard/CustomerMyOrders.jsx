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
  ArrowUpRight,
  Droplets,
  X,
  ShieldCheck,
  Navigation,
  PackageOpen
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const CustomerMyOrders = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Controls State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'pending' | 'completed'
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  // Live Database Orders State
  const [waterOrders, setWaterOrders] = useState([]);

  // Sync filter state with incoming URL query parameters
  useEffect(() => {
    const statusParam = searchParams.get('status');
    if (statusParam) {
      setStatusFilter(statusParam);
    }
  }, [searchParams]);

  // --- BULLETPROOF TOKEN EXTRACTOR ---
  const getAuthToken = () => {
    const storedUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
    return localStorage.getItem('token') || 
           sessionStorage.getItem('token') || 
           localStorage.getItem('jwt') || 
           localStorage.getItem('userToken') || 
           storedUser.token;
  };

  // Fetch actual water orders from backend database on mount with token authorization
  useEffect(() => {
    const fetchWaterOrders = async () => {
      try {
        const token = getAuthToken();
        if (!token) return; // Fail gracefully if not logged in

        const res = await fetch('http://localhost:5191/api/WaterOrders/my-orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const formattedOrders = data.map((item) => {
              const rawId = item.id || item.Id || 1;
              const gross = item.grossAmountAED ?? item.GrossAmountAED ?? 525;
              
              // CRITICAL FIX: Trim whitespace and safely lowercase to prevent filter mismatch bugs
              const rawStat = item.orderStatus || item.OrderStatus || 'Pending';
              const stat = String(rawStat).trim().toLowerCase();

              return {
                id: `ORD-${rawId}`,
                rawId: rawId,
                date: item.orderTimestamp ? new Date(item.orderTimestamp).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Aug 02, 2026',
                volume: gross > 400 ? '5,000 Gallons Tanker' : '1,000 Gallons Tanker',
                destination: item.deliveryAddress || item.DeliveryAddress || 'Masafi Central Yard Delivery Zone',
                cost: Number(gross).toFixed(2),
                status: stat,
                driverName: item.driverName || (item.assignedDriverId ? `Driver ID: ${item.assignedDriverId}` : 'Awaiting Dispatch'),
                vehiclePlate: item.assignedVehicleId ? `Vehicle #${item.assignedVehicleId}` : 'Unassigned',
                distance: `${item.calculatedDistanceKm || item.CalculatedDistanceKm || 5.0} km from Yard`,
                paymentMethod: 'Cash on Delivery (COD)'
              };
            });
            
            // Sort by newest first
            const sortedOrders = formattedOrders.sort((a, b) => b.rawId - a.rawId);
            setWaterOrders(sortedOrders);
          }
        }
      } catch (err) {
        console.error('Failed to fetch backend water orders:', err);
      }
    };

    fetchWaterOrders();
  }, []);

  // Filtered Logic with ordered matching and robust status arrays
  const filteredWaterOrders = waterOrders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          order.destination.toLowerCase().includes(searchQuery.toLowerCase());
      
    let matchesStatus = true;
    if (statusFilter === 'active') {
      matchesStatus = ['accepted', 'dispatched', 'enroute', 'arrived'].includes(order.status);
    } else if (statusFilter === 'pending') {
      matchesStatus = ['pending', 'pending review', 'scheduled'].includes(order.status);
    } else if (statusFilter === 'completed') {
      matchesStatus = ['completed', 'pending collection'].includes(order.status);
    }

    return matchesSearch && matchesStatus;
  });

  // Real Receipt Downloader Function
  const handleDownloadReceipt = (order) => {
    const receiptText = `=====================================================
            AL-WAQAR TRANSPORT L.L.C.
         OFFICIAL TAX INVOICE & FULFILLMENT RECEIPT
=====================================================
Shipment Reference:  ${order.id}
Fulfillment Date:    ${order.date}
Asset Specification: ${order.volume}
Delivery Location:   ${order.destination}
Logistics Operator:  ${order.driverName}
Assigned Vehicle:    ${order.vehiclePlate}
Payment Protocol:    ${order.paymentMethod}
Fulfillment Status:  ${order.status.toUpperCase()}
-----------------------------------------------------
TOTAL AMOUNT SETTLED: AED ${order.cost}
=====================================================
Thank you for choosing Al-Waqar Transport L.L.C.
Customer Support: support@alwaqartransport.ae
=====================================================`;

    const blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${order.id}-Tax-Invoice.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const StatusBadge = ({ status }) => {
    if (['pending', 'pending review', 'scheduled'].includes(status)) {
      return (
        <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 px-3 py-1 rounded-lg text-xs font-bold border border-amber-200 shadow-xs">
          <Clock size={14} className="text-amber-600" /> Pending Admin Dispatch
        </span>
      );
    }
    if (['accepted', 'dispatched', 'enroute', 'arrived'].includes(status)) {
      return (
        <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 px-3 py-1 rounded-lg text-xs font-bold border border-blue-200 shadow-xs animate-pulse">
          <Truck size={14} className="text-blue-600" /> Active / {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    }
    if (['completed', 'pending collection'].includes(status)) {
      return (
        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-lg text-xs font-bold border border-emerald-200 shadow-xs">
          <CheckCircle size={14} className="text-emerald-600" /> Completed & Reconciled
        </span>
      );
    }
    
    // Default Fallback
    return (
      <span className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-700 px-3 py-1 rounded-lg text-xs font-bold border border-gray-200 shadow-xs">
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="w-full space-y-6 pb-12 font-sans text-sm">
       
      {/* STANDARD PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">
            <PackageOpen size={14} /> Logistics Tracking & Fulfillment
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Water Orders History</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Manage bulk water dispatch requests, monitor ongoing deliveries, and review historical fulfillment archives.
          </p>
        </div>
      </div>

      {/* CONTROL TOOLBAR: ORDERED FILTERS & VISIBLE SEARCH BAR */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
         
        {/* Ordered Filter Pills: All, Active, Pending, Completed */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-black uppercase text-gray-400 tracking-wider mr-2">Filter:</span>
          <button 
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              statusFilter === 'all' ? 'bg-[#0B2A4D] text-white shadow-sm' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
          >
            All Dispatches ({waterOrders.length})
          </button>
          <button 
            onClick={() => setStatusFilter('active')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              statusFilter === 'active' ? 'bg-[#0B2A4D] text-white shadow-sm' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
          >
            Active
          </button>
          <button 
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              statusFilter === 'pending' ? 'bg-[#0B2A4D] text-white shadow-sm' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
          >
            Pending
          </button>
          <button 
            onClick={() => setStatusFilter('completed')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              statusFilter === 'completed' ? 'bg-[#0B2A4D] text-white shadow-sm' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
          >
            Completed
          </button>
        </div>

        {/* Enhanced High-Contrast Search Input Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Reference ID or Destination..."
            className="pl-10 pr-4 py-2.5 bg-white border-2 border-gray-300 focus:border-[#0B2A4D] rounded-xl text-xs font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none w-72 transition shadow-2xs"
          />
        </div>
      </div>

      {/* ORDERS LIST */}
      <div className="space-y-4">
        {filteredWaterOrders.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center border border-gray-200 shadow-sm space-y-2">
            <p className="text-sm font-bold text-gray-700">No matching water delivery records found</p>
            <p className="text-xs text-gray-400">Try adjusting your search query or status filters.</p>
          </div>
        ) : (
          filteredWaterOrders.map((order) => {
            const isActive = ['accepted', 'dispatched', 'enroute', 'arrived'].includes(order.status);

            return (
              <div 
                key={order.id} 
                className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
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

                    {order.status === 'completed' || order.status === 'pending collection' ? (
                      <button 
                        onClick={() => handleDownloadReceipt(order)}
                        className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer border border-blue-200 shadow-2xs"
                      >
                        <Download size={14} /> Receipt
                      </button>
                    ) : isActive ? (
                      <button 
                        onClick={() => navigate(`/customer/dashboard/track/${order.rawId}`)}
                        className="flex items-center gap-2 bg-[#0B2A4D] hover:bg-blue-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
                      >
                        Track Live Status <ArrowUpRight size={14} />
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 px-4 py-2.5 rounded-xl border border-amber-200">
                        Awaiting Dispatch
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
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
              {['accepted', 'dispatched', 'enroute', 'arrived'].includes(selectedOrderDetails.status) && (
                <button
                  onClick={() => { setSelectedOrderDetails(null); navigate(`/customer/dashboard/track/${selectedOrderDetails.rawId}`); }}
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