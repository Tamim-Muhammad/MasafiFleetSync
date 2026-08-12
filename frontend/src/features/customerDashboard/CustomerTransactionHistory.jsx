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
  AlertCircle,
  Wallet,
  Clock
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const CustomerTransactionHistory = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('water'); // 'water' | 'rentals' | 'pending'
  const [searchTerm, setSearchTerm] = useState('');

  // Sync state with incoming URL query parameters when clicking dashboard metrics cards
  useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam === 'pending') {
      setActiveTab('pending');
    }
  }, [searchParams]);

  // Mock Data aligned with project scope (Water Deliveries & Vehicle Leases)
  const waterDeliveries = [
    {
      id: 'ORD-9821',
      date: 'June 14, 2026',
      volume: '5,000 Gallons',
      location: 'Sector 4, Main Industrial Highway, Masafi',
      amount: 450,
      status: 'Completed',
      paymentMethod: 'Cash on Delivery (COD)'
    },
    {
      id: 'ORD-9450',
      date: 'May 28, 2026',
      volume: '1,000 Gallons',
      location: 'Villa 14, Al-Hail Industrial Zone, Fujairah',
      amount: 180,
      status: 'Completed',
      paymentMethod: 'Cash on Delivery (COD)'
    },
    {
      id: 'ORD-9102',
      date: 'May 10, 2026',
      volume: '5,000 Gallons',
      location: 'Sector 2, Quarry Zone, Masafi',
      amount: 480,
      status: 'Completed',
      paymentMethod: 'Cash on Delivery (COD)'
    }
  ];

  const vehicleLeases = [
    {
      id: 'RNT-4021',
      date: 'April 01, 2026 - April 15, 2026',
      vehicle: '5000 Gal Heavy Water Tanker (Plate: A-7890)',
      duration: '14 Days',
      amount: 3500,
      deposit: 1000,
      status: 'Settled & Refunded'
    },
    {
      id: 'RNT-3890',
      date: 'March 05, 2026 - March 12, 2026',
      vehicle: 'Heavy Loading Flatbed Truck (Plate: F-4412)',
      duration: '7 Days',
      amount: 2100,
      deposit: 800,
      status: 'Settled & Refunded'
    }
  ];

  // Mock Data for Pending Payments / Invoices requiring attention
  const pendingInvoices = [
    {
      id: 'INV-2026-501',
      date: 'August 03, 2026',
      service: 'Bulk Water Tanker Express Supply (5,000 Gallons)',
      dueDate: 'August 06, 2026',
      location: 'Masafi Central Yard Delivery Zone',
      amount: 157.00,
      status: 'Pending Driver Collection'
    }
  ];

  // Filtered data based on search input
  const filteredWater = waterDeliveries.filter(item => 
    item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.volume.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLeases = vehicleLeases.filter(lease => 
    lease.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lease.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lease.duration.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPending = pendingInvoices.filter(inv =>
    inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadReceipt = (id) => {
    alert(`Downloading official PDF receipt / invoice for transaction ID: ${id}`);
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#0B2A4D] via-[#103E73] to-[#0B2A4D] p-8 rounded-3xl shadow-xl text-white flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-white/5 skew-x-12 pointer-events-none"></div>
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/30 border border-blue-400/30 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase text-blue-200">
            <Receipt size={13} /> Financial Records & Accounting Ledger
          </div>
          <h1 className="text-3xl font-black tracking-tight">Transaction History & Receipts</h1>
          <p className="text-xs text-blue-100 max-w-xl leading-relaxed">
            Review completed water dispatches, B2B heavy vehicle equipment leasing records, pending payments, and download official tax invoices.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-2xl flex flex-wrap gap-1 border border-white/15 shrink-0 relative z-10 shadow-inner">
          <button
            onClick={() => { setActiveTab('water'); setSearchTerm(''); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-200 cursor-pointer flex items-center gap-2 ${
              activeTab === 'water' 
                ? 'bg-white text-[#0B2A4D] shadow-lg scale-105' 
                : 'text-white hover:bg-white/10'
            }`}
          >
            <Droplet size={15} className={activeTab === 'water' ? 'text-blue-600' : 'text-blue-300'} /> 
            Water Deliveries
          </button>
          <button
            onClick={() => { setActiveTab('rentals'); setSearchTerm(''); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-200 cursor-pointer flex items-center gap-2 ${
              activeTab === 'rentals' 
                ? 'bg-white text-[#0B2A4D] shadow-lg scale-105' 
                : 'text-white hover:bg-white/10'
            }`}
          >
            <Truck size={15} className={activeTab === 'rentals' ? 'text-purple-600' : 'text-purple-300'} /> 
            Vehicle Leases
          </button>
          <button
            onClick={() => { setActiveTab('pending'); setSearchTerm(''); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-200 cursor-pointer flex items-center gap-2 ${
              activeTab === 'pending' 
                ? 'bg-white text-[#0B2A4D] shadow-lg scale-105' 
                : 'text-white hover:bg-white/10'
            }`}
          >
            <Wallet size={15} className={activeTab === 'pending' ? 'text-orange-500' : 'text-orange-300'} /> 
            Pending Payments ({pendingInvoices.length})
          </button>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0B2A4D]">
              {activeTab === 'water' && <Droplet size={20} />}
              {activeTab === 'rentals' && <Building2 size={20} />}
              {activeTab === 'pending' && <Wallet size={20} className="text-orange-500" />}
            </div>
            <div>
              <h2 className="text-sm font-black text-[#0B2A4D]">
                {activeTab === 'water' && 'Bulk Water Delivery Transactions'}
                {activeTab === 'rentals' && 'B2B Fleet Leasing Contracts'}
                {activeTab === 'pending' && 'Pending Invoices Aweiting Collection'}
              </h2>
              <p className="text-[11px] text-gray-400 font-medium">
                {activeTab === 'pending' ? 'Unpaid balances will automatically clear once marked collected by the driver or office.' : 'Showing all historical entries securely verified by Al-Waqar transport ledger.'}
              </p>
            </div>
          </div>
          
          <div className="w-full sm:w-auto relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Search by ID or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-72 pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B2A4D] shadow-xs"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          {activeTab === 'water' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-black text-gray-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Order ID & Date</th>
                  <th className="py-4 px-6">Tanker Volume</th>
                  <th className="py-4 px-6">Delivery Destination</th>
                  <th className="py-4 px-6">Payment Mode</th>
                  <th className="py-4 px-6">Total Cost</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                {filteredWater.length > 0 ? (
                  filteredWater.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-black text-[#0B2A4D] block text-sm">{item.id}</span>
                        <span className="text-[11px] text-gray-400 font-semibold flex items-center gap-1 mt-0.5">
                          <Calendar size={12} /> {item.date}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-900 font-bold whitespace-nowrap">
                          {item.volume}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-600 font-semibold max-w-xs truncate" title={item.location}>
                        {item.location}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-700 font-semibold whitespace-nowrap">
                          {item.paymentMethod}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-black text-gray-900 text-sm whitespace-nowrap">AED {item.amount}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold whitespace-nowrap">
                          <CheckCircle2 size={13} /> {item.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={() => handleDownloadReceipt(item.id)}
                          className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-[#0B2A4D] hover:text-white text-gray-700 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs group whitespace-nowrap"
                        >
                          <Download size={14} className="group-hover:translate-y-0.5 transition-transform" /> PDF Receipt
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-gray-400 text-xs font-semibold">
                      No matching water delivery transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'rentals' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-black text-gray-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Contract ID & Period</th>
                  <th className="py-4 px-6">Leased Asset Specification</th>
                  <th className="py-4 px-6">Duration</th>
                  <th className="py-4 px-6">Security Deposit</th>
                  <th className="py-4 px-6">Total Amount</th>
                  <th className="py-4 px-6">Agreement Status</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                {filteredLeases.length > 0 ? (
                  filteredLeases.map((lease) => (
                    <tr key={lease.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-black text-[#0B2A4D] block text-sm">{lease.id}</span>
                        <span className="text-[11px] text-gray-400 font-semibold flex items-center gap-1 mt-0.5">
                          <Calendar size={12} /> {lease.date}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold text-gray-900">{lease.vehicle}</td>
                      <td className="py-4 px-6">
                        <span className="text-gray-800 font-bold whitespace-nowrap">
                          {lease.duration}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold text-gray-600 whitespace-nowrap">AED {lease.deposit}</td>
                      <td className="py-4 px-6 font-black text-gray-900 text-sm whitespace-nowrap">AED {lease.amount}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1 text-purple-700 font-bold whitespace-nowrap">
                          <CheckCircle2 size={13} /> {lease.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={() => handleDownloadReceipt(lease.id)}
                          className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-[#0B2A4D] hover:text-white text-gray-700 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs group whitespace-nowrap"
                        >
                          <Download size={14} className="group-hover:translate-y-0.5 transition-transform" /> PDF Contract
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-gray-400 text-xs font-semibold">
                      No matching vehicle lease transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'pending' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-black text-gray-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Invoice ID & Billing Date</th>
                  <th className="py-4 px-6">Service Description</th>
                  <th className="py-4 px-6">Delivery Destination</th>
                  <th className="py-4 px-6">Due Date</th>
                  <th className="py-4 px-6">Balance Due</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Collection Info</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                {filteredPending.length > 0 ? (
                  filteredPending.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-black text-[#0B2A4D] block text-sm">{inv.id}</span>
                        <span className="text-[11px] text-gray-400 font-semibold flex items-center gap-1 mt-0.5">
                          <Calendar size={12} /> {inv.date}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold text-gray-900 max-w-xs">{inv.service}</td>
                      <td className="py-4 px-6 text-gray-600 font-semibold max-w-xs truncate" title={inv.location}>
                        {inv.location}
                      </td>
                      <td className="py-4 px-6 font-semibold text-orange-600 whitespace-nowrap">{inv.dueDate}</td>
                      <td className="py-4 px-6 font-black text-gray-900 text-sm whitespace-nowrap">AED {inv.amount.toFixed(2)}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 border border-orange-200 px-2.5 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap animate-pulse">
                          <Clock size={13} /> {inv.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-semibold text-gray-500 italic">
                        Payable to Driver Upon Delivery
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-gray-400 text-xs font-semibold">
                      No pending payment invoices found. All accounts are fully settled!
                    </td>
                  </tr>
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