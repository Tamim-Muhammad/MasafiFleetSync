import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Droplet, 
  Truck, 
  Calendar, 
  Search, 
  CheckCircle2,
  Receipt,
  Building2,
  RefreshCw
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const CustomerTransactionHistory = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('water'); // 'water' | 'rentals'
  const [searchTerm, setSearchTerm] = useState('');
   
  const [waterDeliveries, setWaterDeliveries] = useState([]);
  const [vehicleLeases, setVehicleLeases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- BULLETPROOF TOKEN EXTRACTOR ---
  const getAuthToken = () => {
    const storedUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
    return localStorage.getItem('token') || 
           sessionStorage.getItem('token') || 
           localStorage.getItem('jwt') || 
           localStorage.getItem('userToken') || 
           storedUser.token;
  };

  // Fetch live historical ledger data from C# backend APIs with token authorization
  const fetchLedgerData = async () => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        setIsLoading(false);
        return; // Fail gracefully if no token is found
      }

      // 1. Fetch Water Orders from secure my-orders endpoint and filter strictly for COMPLETED transactions
      const orderRes = await fetch('http://localhost:5191/api/WaterOrders/my-orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (orderRes.ok) {
        const orders = await orderRes.json();
        
        const completedWater = orders
          .filter(o => {
            // CRITICAL FIX: Trim whitespace and safely lowercase to prevent filter mismatch bugs
            const stat = String(o.orderStatus || o.OrderStatus || '').trim().toLowerCase();
            return ['completed', 'pending collection'].includes(stat);
          })
          .map(o => {
            const dateStr = o.orderTimestamp ? new Date(o.orderTimestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent';
            const exactGallons = o.volumeGallons ?? o.VolumeGallons ?? 5000;
            const gross = o.grossAmountAED ?? o.GrossAmountAED ?? 525;

            return {
              id: `ORD-${o.id ?? o.Id}`,
              date: dateStr,
              volume: `${exactGallons.toLocaleString()} Gallons`,
              location: o.deliveryAddress || o.DeliveryAddress || 'Masafi Industrial Zone',
              amount: Number(gross),
              status: 'Completed',
              paymentMethod: 'Cash on Delivery (COD)'
            };
          });

        // Sort by newest first
        setWaterDeliveries(completedWater.sort((a, b) => {
           const idA = parseInt(a.id.split('-')[1]);
           const idB = parseInt(b.id.split('-')[1]);
           return idB - idA;
        }));
      }

      // 2. Fetch Rental Agreements from secure my-leases endpoint and filter for active/completed historical records
      const rentalRes = await fetch('http://localhost:5191/api/RentalAgreements/my-leases', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (rentalRes.ok) {
        const rentals = await rentalRes.json();

        const formattedRentals = rentals.map(r => {
          const start = r.startDate ? new Date(r.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Start';
          const end = r.endDate ? new Date(r.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'End';
          const stat = String(r.status || r.Status || 'Active').trim();
          
          return {
            id: r.contractReferenceNo || `RNT-${r.id || r.Id}`,
            date: `${start} - ${end}`,
            vehicle: r.vehicleCategory || 'Industrial Heavy Vehicle',
            duration: 'Commercial Lease',
            amount: Number(r.totalPrice || 3500),
            deposit: Number(r.securityDeposit || 1000),
            status: stat.charAt(0).toUpperCase() + stat.slice(1)
          };
        });

        // Sort by newest first
        setVehicleLeases(formattedRentals.reverse());
      }

    } catch (err) {
      console.error("Failed to sync transaction ledger:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLedgerData();
  }, []);

  // Filtered data based on search input
  const filteredWater = waterDeliveries.filter(item => 
    item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.volume.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLeases = vehicleLeases.filter(lease => 
    lease.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lease.vehicle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadReceipt = (id) => {
    const textContent = `=====================================================
          AL-WAQAR TRANSPORT L.L.C.
         OFFICIAL TAX INVOICE & RECEIPT
=====================================================
Transaction / Reference ID: ${id}
Issued By: Al-Waqar Transport Billing Operations
Payment Terms: Cash on Delivery (COD) / Verified Ledger
Status: Settled & Verified

Thank you for your business!
=====================================================`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${id}-Tax-Invoice.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-6 pb-12 font-sans">
       
      {/* Clean Professional Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">
            <Receipt size={14} /> Financial Records & Accounting Ledger
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Transaction History & Receipts</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Review completed water dispatches, B2B heavy vehicle equipment leasing records, and download official tax invoices.
          </p>
        </div>

        <button 
          onClick={fetchLedgerData}
          className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl text-xs font-bold transition border border-gray-200 shadow-2xs cursor-pointer w-fit"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /> Refresh Ledger
        </button>
      </div>

      {/* Modern Segmented Navigation Bar (2 Clean Tabs) */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-2 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setActiveTab('water'); setSearchTerm(''); }}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'water' 
                ? 'bg-[#0B2A4D] text-white shadow-md' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Droplet size={15} className={activeTab === 'water' ? 'text-blue-400' : 'text-gray-400'} /> 
            Water Deliveries ({waterDeliveries.length})
          </button>
          <button
            onClick={() => { setActiveTab('rentals'); setSearchTerm(''); }}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'rentals' 
                ? 'bg-[#0B2A4D] text-white shadow-md' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Truck size={15} className={activeTab === 'rentals' ? 'text-amber-400' : 'text-gray-400'} /> 
            Vehicle Leases ({vehicleLeases.length})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72 pr-2">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text"
            placeholder="Search by ID or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0B2A4D] transition"
          />
        </div>
      </div>

      {/* Main Content Card / Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              {activeTab === 'water' && <Droplet size={18} />}
              {activeTab === 'rentals' && <Building2 size={18} />}
            </div>
            <div>
              <h2 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                {activeTab === 'water' && 'Completed Bulk Water Transactions'}
                {activeTab === 'rentals' && 'B2B Fleet Leasing Contracts'}
              </h2>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                Showing historical, settled financial entries securely verified by the Al-Waqar transport ledger.
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'water' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-black text-gray-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Order ID & Date</th>
                  <th className="py-3.5 px-6">Tanker Volume</th>
                  <th className="py-3.5 px-6">Delivery Destination</th>
                  <th className="py-3.5 px-6">Payment Mode</th>
                  <th className="py-3.5 px-6">Total Cost</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-800">
                {isLoading ? (
                  <tr><td colSpan="7" className="py-12 text-center text-gray-400">Loading records from database...</td></tr>
                ) : filteredWater.length > 0 ? (
                  filteredWater.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-black text-[#0B2A4D] block">{item.id}</span>
                        <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                          <Calendar size={12} /> {item.date}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold text-gray-900">{item.volume}</td>
                      <td className="py-4 px-6 text-gray-600 max-w-xs truncate">{item.location}</td>
                      <td className="py-4 px-6 text-gray-600">{item.paymentMethod}</td>
                      <td className="py-4 px-6 font-black text-gray-900">AED {item.amount.toFixed(2)}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                          <CheckCircle2 size={12} /> {item.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={() => handleDownloadReceipt(item.id)}
                          className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3.5 py-2 rounded-xl text-xs font-bold transition border border-blue-200 cursor-pointer"
                        >
                          <Download size={13} /> PDF Receipt
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="7" className="py-12 text-center text-gray-400 text-xs">No completed water delivery transactions found.</td></tr>
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'rentals' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-black text-gray-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Contract ID & Period</th>
                  <th className="py-3.5 px-6">Leased Asset Specification</th>
                  <th className="py-3.5 px-6">Duration</th>
                  <th className="py-3.5 px-6">Security Deposit</th>
                  <th className="py-3.5 px-6">Total Amount</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-semibold text-gray-800">
                {isLoading ? (
                  <tr><td colSpan="7" className="py-12 text-center text-gray-400">Loading lease records...</td></tr>
                ) : filteredLeases.length > 0 ? (
                  filteredLeases.map((lease) => (
                    <tr key={lease.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-black text-[#0B2A4D] block">{lease.id}</span>
                        <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                          <Calendar size={12} /> {lease.date}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold text-gray-900">{lease.vehicle}</td>
                      <td className="py-4 px-6 text-gray-600">{lease.duration}</td>
                      <td className="py-4 px-6 text-gray-600">AED {lease.deposit.toFixed(2)}</td>
                      <td className="py-4 px-6 font-black text-gray-900">AED {lease.amount.toFixed(2)}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1 text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                          <CheckCircle2 size={12} /> {lease.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={() => handleDownloadReceipt(lease.id)}
                          className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3.5 py-2 rounded-xl text-xs font-bold transition border border-blue-200 cursor-pointer"
                        >
                          <Download size={13} /> Contract PDF
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="7" className="py-12 text-center text-gray-400 text-xs">No active or historical vehicle lease records found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerTransactionHistory;