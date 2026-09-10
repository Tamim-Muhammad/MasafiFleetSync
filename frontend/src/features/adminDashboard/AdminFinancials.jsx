import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { DollarSign, ShieldCheck, Download, Wallet, ArrowUpRight, Search, Phone, Calendar, X, TrendingUp, Percent, Clock } from 'lucide-react';

const AdminFinancials = () => {
  const { darkMode } = useOutletContext();

  // Dynamic States
  const [financialData, setFinancialData] = useState(null);
  const [cashLedger, setCashLedger] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeModal, setActiveModal] = useState(null);

  // Fetch live ledger data from backend
  useEffect(() => {
    const fetchFinancials = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('http://localhost:5191/api/Financials/ledger');
        setFinancialData(response.data);
        setCashLedger(response.data.cashLedger || []);
      } catch (error) {
        console.error("Error fetching live financials:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFinancials();
  }, []);

  // Settle single ledger entry
  const handleSettleLedger = async (id) => {
    try {
      await axios.put(`http://localhost:5191/api/Financials/settle/${id}`);
      
      setCashLedger(prev => prev.map(tx => {
        if (tx.id === id) {
          return { ...tx, state: 'Settled & Reconciled' };
        }
        return tx;
      }));
    } catch (error) {
      console.error("Failed to settle ledger:", error);
      alert("Failed to settle transaction. Check backend connection.");
    }
  };

  // Metrics mapping
  const totalGrossToday = financialData?.totalGrossToday || 0;
  const weeklyAccumulatedRevenue = financialData?.weeklyAccumulatedRevenue || 0; 
  const totalCommission = financialData?.totalCommissionToday || 0;
  const monthlyContributors = financialData?.monthlyTopContributors || [];
  const totalMonthlyOrdersCount = financialData?.totalMonthlyOrdersCount || 0;

  // Dynamic CSV generation
  const handleExportCSV = () => {
    const headers = "Transaction ID,Date & Time,Driver Name,Phone Number,Volume,Gross Amount (AED),Commission (AED),Net Payout (AED),Custody State\n";
    
    const rows = cashLedger.map(t => 
      `${t.transactionId},"${t.formattedDate || 'N/A'}","${t.driver}","'${t.phone}","${t.volume}",${t.gross},${t.commission},${t.net},"${t.state}"`
    ).join("\n");

    const footerRow = `\n"SUMMARY","MTD Revenue: AED ${weeklyAccumulatedRevenue.toFixed(2)}",,,,${totalGrossToday.toFixed(2)},${totalCommission.toFixed(2)},,`;

    const blob = new Blob([headers + rows + footerRow], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `AlWaqar_Financial_Ledger_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to safely evaluate custody status
  const isSettled = (state) => (state || '').toLowerCase().replace(/[\s&_]/g, '').includes('settled');

  // Search & Status Filter
  const filteredLedger = cashLedger.filter(tx => {
    const matchesSearch = 
      (tx.driver || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (tx.transactionId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.phone || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'ALL') return matchesSearch;
    if (statusFilter === 'SETTLED') return matchesSearch && isSettled(tx.state);
    if (statusFilter === 'PENDING') return matchesSearch && !isSettled(tx.state);
    return matchesSearch;
  });

  return (
    <div className={`space-y-6 transition-colors duration-200 pb-12 font-sans relative ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-black text-blue-600 dark:text-blue-400 tracking-wider uppercase mb-1">
            <DollarSign size={14} /> Treasury & Financial Governance
          </div>
          <h1 className="text-2xl font-black tracking-tight">Global Financial Ledger & Commission Audits</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            Audit Cash-on-Delivery (COD) flows, verify driver cash custody, and close out shift ledgers.
          </p>
        </div>

        <button 
          onClick={handleExportCSV} 
          className="flex items-center justify-center gap-2 bg-[#0B2A4D] hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-md transition cursor-pointer uppercase tracking-wider shrink-0"
        >
          <Download size={15} /> Export Financial Report (.CSV)
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        <div 
          onClick={() => setActiveModal('GROSS')}
          className={`p-6 rounded-3xl shadow-xl border transition-all cursor-pointer group hover:scale-[1.01] ${
            darkMode ? 'bg-slate-900 border-slate-800 hover:border-emerald-500 text-white' : 'bg-white border-slate-200/90 hover:border-emerald-300 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Gross Revenue (Today)</p>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <Wallet size={16} />
            </div>
          </div>
          <h3 className="text-3xl font-black tracking-tight mt-1">AED {isLoading ? '...' : totalGrossToday.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          <p className="text-xs font-bold text-emerald-600 mt-2 flex items-center justify-between">
            <span className="flex items-center gap-1"><ArrowUpRight size={14} /> Live SQL Sync</span>
            <span className="text-[10px] font-black underline uppercase text-slate-400 group-hover:text-emerald-500">View Breakdown</span>
          </p>
        </div>

        <div 
          onClick={() => setActiveModal('WEEKLY')}
          className={`p-6 rounded-3xl shadow-xl border transition-all cursor-pointer group hover:scale-[1.01] ${
            darkMode ? 'bg-slate-900 border-slate-800 hover:border-blue-500 text-white' : 'bg-white border-slate-200/90 hover:border-blue-300 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Monthly Revenue (MTD)</p>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <Calendar size={16} />
            </div>
          </div>
          <h3 className="text-3xl font-black tracking-tight mt-1">AED {isLoading ? '...' : weeklyAccumulatedRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-2 flex items-center justify-between">
            <span>Active Cycle Trend</span>
            <span className="text-[10px] font-black underline uppercase text-slate-400 group-hover:text-blue-500">View Trends</span>
          </p>
        </div>

        <div 
          onClick={() => setActiveModal('COMMISSION')}
          className={`p-6 rounded-3xl shadow-xl border transition-all cursor-pointer group hover:scale-[1.01] ${
            darkMode ? 'bg-slate-900 border-slate-800 hover:border-indigo-500 text-white' : 'bg-white border-slate-200/90 hover:border-indigo-300 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Company Commission Cut</p>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
              <DollarSign size={16} />
            </div>
          </div>
          <h3 className="text-3xl font-black tracking-tight mt-1">AED {isLoading ? '...' : totalCommission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-2 flex items-center justify-between">
            <span>Dynamic Rate Cut</span>
            <span className="text-[10px] font-black underline uppercase text-slate-400 group-hover:text-indigo-500">Audit Rules</span>
          </p>
        </div>

      </div>

      {/* Main Ledger Table Card */}
      <div className={`p-6 rounded-3xl shadow-xl border ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/90 text-slate-900'} space-y-6`}>
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b pb-4 border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-black tracking-tight">Cash-on-Delivery (COD) Custody State Machine</h2>
            <p className="text-xs text-slate-400 mt-0.5">Manage hand-to-hand collections, verify transaction timestamps, and execute reconciliations.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input 
                type="text" 
                placeholder="Search driver, phone, or TXN ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs font-medium border outline-none transition ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'
                }`}
              />
            </div>

            <div className="relative w-full sm:w-auto">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border outline-none transition cursor-pointer ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <option value="ALL">All States</option>
                <option value="PENDING">Pending Collection / Active</option>
                <option value="SETTLED">Settled & Reconciled</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs font-bold uppercase tracking-wider">
            Loading Live SQL Ledger...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b text-[10px] font-black uppercase tracking-wider ${darkMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-400'}`}>
                  <th className="pb-3.5 px-3">Transaction</th>
                  <th className="pb-3.5 px-3">Driver Profile</th>
                  <th className="pb-3.5 px-3">Gross Amount</th>
                  <th className="pb-3.5 px-3">Commission Cut</th>
                  <th className="pb-3.5 px-3">Net Payout</th>
                  <th className="pb-3.5 px-3">Custody State</th>
                  <th className="pb-3.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y text-xs ${darkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                {filteredLedger.length > 0 ? (
                  filteredLedger.map((tx, idx) => {
                    const settled = isSettled(tx.state);
                    return (
                      <tr key={idx} className={`transition-colors ${darkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/70'}`}>
                        <td className="py-4 px-3 align-middle">
                          <div className="flex flex-col">
                            <span className="font-black text-blue-600 dark:text-blue-400 font-mono">{tx.transactionId}</span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                              <Clock size={10} /> {tx.formattedDate || 'Recent'}
                            </span>
                          </div>
                        </td>
                        
                        <td className="py-4 px-3 align-middle">
                          <div className="flex flex-col">
                            <span className={`font-black text-sm tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                              {tx.driver}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                                <Phone size={12} className="text-blue-500 shrink-0" /> {tx.phone}
                              </span>
                              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md whitespace-nowrap">
                                {tx.volume}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-3 font-semibold align-middle">AED {tx.gross.toFixed(2)}</td>
                        <td className="py-4 px-3 text-slate-500 align-middle">AED {tx.commission.toFixed(2)}</td>
                        <td className="py-4 px-3 text-emerald-600 dark:text-emerald-400 font-extrabold align-middle">AED {tx.net.toFixed(2)}</td>
                        
                        <td className="py-4 px-3 align-middle">
                          <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border whitespace-nowrap ${
                            settled ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200' :
                            'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200'
                          }`}>
                            {settled ? 'Settled & Reconciled' : 'Pending Collection'}
                          </span>
                        </td>

                        <td className="py-4 px-3 text-right align-middle">
                          {!settled ? (
                            <button onClick={() => handleSettleLedger(tx.id)} className="bg-[#0B2A4D] hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer shadow-xs uppercase tracking-wider whitespace-nowrap">
                              Settle Ledger
                            </button>
                          ) : (
                            <span className="inline-flex items-center justify-end gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-xs w-full">
                              <ShieldCheck size={14} /> Reconciled
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400 font-bold text-xs">
                      No matching transactions found in the active ledger.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal 1: Gross Revenue Today Breakdown */}
      {activeModal === 'GROSS' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-2xl p-6 rounded-3xl shadow-2xl border space-y-6 ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                  <Wallet size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight">Gross Revenue Breakdown (Today)</h2>
                  <p className="text-xs text-slate-400">Complete transaction log of today's active shift collections.</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-black uppercase text-slate-400">Total Shift Gross</span>
                <h4 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">AED {totalGrossToday.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-black uppercase text-slate-400">Audited Table Records</span>
                <h4 className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{cashLedger.length} Entries</h4>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Shift Transaction Contributors</h4>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {cashLedger.map((t, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs">
                    <span className="font-bold">{t.driver} <span className="text-[10px] text-slate-400 font-mono">({t.transactionId} - {t.volume})</span></span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400">AED {t.gross.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setActiveModal(null)} className="bg-[#0B2A4D] hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer">
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Month-to-Date Revenue Trend (Rich Breakdown) */}
      {activeModal === 'WEEKLY' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-2xl p-6 rounded-3xl shadow-2xl border space-y-6 ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight">Month-to-Date Performance Audit</h2>
                  <p className="text-xs text-slate-400">Aggregated revenue performance and driver contributions across August 2026.</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-black uppercase text-slate-400">Total Monthly Revenue (MTD)</span>
                <h4 className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">AED {weeklyAccumulatedRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-black uppercase text-slate-400">Total Fulfilled Orders</span>
                <h4 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{totalMonthlyOrdersCount} Deliveries</h4>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Top Driver Revenue Contributors (Monthly)</h4>
              <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                {monthlyContributors.length > 0 ? (
                  monthlyContributors.map((c, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs">
                      <div className="flex flex-col">
                        <span className="font-bold">{c.driverName}</span>
                        <span className="text-[10px] text-slate-400">{c.totalOrders} fulfilled tanker orders</span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-blue-600 dark:text-blue-400 block">AED {c.totalGross.toFixed(2)}</span>
                        <span className="text-[10px] text-slate-400">Comm: AED {c.totalCommission.toFixed(2)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4">No monthly driver records logged.</p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setActiveModal(null)} className="bg-[#0B2A4D] hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer">
                Close Monthly View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Company Commission Cut Audit */}
      {activeModal === 'COMMISSION' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-2xl p-6 rounded-3xl shadow-xl border space-y-6 ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                  <Percent size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight">Company Commission Audit</h2>
                  <p className="text-xs text-slate-400">Detailed driver-by-driver commission deductions for today's shift.</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400">Commission Policy</span>
                <h4 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">Tiered / Dynamic Cut</h4>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase text-slate-400">Total Company Cut Today</span>
                <h4 className="text-2xl font-black mt-1">AED {totalCommission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Active Shift Commission Deductions</h4>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {cashLedger.map((t, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs">
                    <span className="font-bold">{t.driver} <span className="text-[10px] text-slate-400">(Gross: AED {t.gross.toFixed(2)})</span></span>
                    <span className="font-black text-indigo-600 dark:text-indigo-400">AED {t.commission.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setActiveModal(null)} className="bg-[#0B2A4D] hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer">
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminFinancials;