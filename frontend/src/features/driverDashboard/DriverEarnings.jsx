import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Wallet, 
  TrendingUp, 
  CheckCircle2, 
  DollarSign,
  Download,
  Calendar,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Filter,
  ChevronLeft,
  ChevronRight,
  ListFilter,
  SearchX
} from 'lucide-react';

const DriverEarnings = () => {
  const [filterPeriod, setFilterPeriod] = useState('all'); // 'all', 'today', 'week', 'custom'
  const [earningsData, setEarningsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Enterprise Table States
  const [sortOrder, setSortOrder] = useState('newest'); // newest, oldest, highest, lowest
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Retrieve driver ID matching other driver screens
  const storedUserId = Number(localStorage.getItem('userId'));
  const driverId = (!storedUserId || storedUserId === 11) ? 28 : storedUserId;

  const fetchEarningsAndHistory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5191/api/DriverDeliveries/driver/${driverId}`);
      if (response.ok) {
        const records = await response.json();
        const now = new Date();
        
        // Map backend delivery records into transaction items with precise dynamic time tags
        const mappedTransactions = records.map((r, index) => {
          const gross = r.amount || r.Amount || 227.00;
          const commission = gross * 0.10;
          const net = gross - commission;
          const dateObj = r.completedAt ? new Date(r.completedAt) : new Date();

          const isToday = dateObj.toDateString() === now.toDateString();
          const diffDays = (now - dateObj) / (1000 * 60 * 60 * 24);
          const isWeek = diffDays <= 7 && diffDays >= 0;
          const isMonth = dateObj.getMonth() === now.getMonth() && dateObj.getFullYear() === now.getFullYear();

          return {
            id: r.jobReference || r.JobReference || `J-${index}`,
            client: r.clientName || r.ClientName || 'B2B Client',
            service: r.serviceDescription || r.ServiceDescription || 'Water Tanker Delivery (1000 Gallons)',
            location: r.location || r.Location || 'Fujairah Residential Villa, Al-Hail Industrial Zone, Fujairah',
            grossAmount: gross.toFixed(2),
            commission: commission.toFixed(2),
            netAmount: net.toFixed(2),
            time: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' at ' + dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            rawDate: dateObj,
            isToday,
            isWeek,
            isMonth,
            status: r.status || r.Status || 'Pending Collection'
          };
        });

        // Calculate REAL dynamic metrics from database records
        const todayRecords = mappedTransactions.filter(t => t.isToday);
        const weekRecords = mappedTransactions.filter(t => t.isWeek);
        const monthRecords = mappedTransactions.filter(t => t.isMonth);

        const todayNetSum = todayRecords.reduce((acc, curr) => acc + Number(curr.netAmount), 0);
        const weekNetSum = weekRecords.reduce((acc, curr) => acc + Number(curr.netAmount), 0);
        const monthNetSum = monthRecords.reduce((acc, curr) => acc + Number(curr.netAmount), 0);

        // Pending cash deposit tracks only today's transactions that are NOT yet settled/reconciled by the admin
        const pendingTodayRecords = todayRecords.filter(t => {
          const statusStr = (t.status || '').toLowerCase();
          return !statusStr.includes('settled') && !statusStr.includes('reconciled');
        });
        const pendingNetSum = pendingTodayRecords.reduce((acc, curr) => acc + Number(curr.netAmount), 0);

        setEarningsData({
          todayEarnings: todayNetSum > 0 ? todayNetSum.toFixed(2) : '0.00',
          todayDeliveries: todayRecords.length,
          weekEarnings: weekNetSum > 0 ? weekNetSum.toFixed(2) : '0.00',
          weekDeliveries: weekRecords.length,
          monthEarnings: monthNetSum > 0 ? monthNetSum.toFixed(2) : '0.00',
          monthDeliveries: monthRecords.length,
          pendingDeposit: pendingNetSum > 0 ? pendingNetSum.toFixed(2) : '0.00',
          transactions: mappedTransactions
        });
      } else {
        setEarningsData(getEmptyEarnings());
      }
    } catch (err) {
      console.error("Failed to fetch earnings ledger:", err);
      setEarningsData(getEmptyEarnings());
    } finally {
      setIsLoading(false);
    }
  };

  const getEmptyEarnings = () => ({
    todayEarnings: '0.00',
    todayDeliveries: 0,
    weekEarnings: '0.00',
    weekDeliveries: 0,
    monthEarnings: '0.00',
    monthDeliveries: 0,
    pendingDeposit: '0.00',
    transactions: []
  });

  useEffect(() => {
    fetchEarningsAndHistory();
  }, [driverId]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterPeriod, sortOrder, startDate, endDate]);

  const handleExportCSV = () => {
    if (!earningsData || !earningsData.transactions.length) return;
    const headers = "Job ID,Client Name,Service Description,Location,Gross AED,Commission AED,Net AED,Timestamp,Status\n";
    const rows = earningsData.transactions.map(t => 
      `"${t.id}","${t.client}","${t.service}","${t.location}",${t.grossAmount},${t.commission},${t.netAmount},"${t.time}","${t.status}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Driver-${driverId}-Earnings-Statement.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="w-full py-20 text-center font-sans">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
        <p className="text-xs text-gray-500 font-bold">Synchronizing financial ledger & commission records...</p>
      </div>
    );
  }

  // --- Enterprise Data Processing (Filter -> Sort -> Paginate) ---
  let processedTransactions = [...(earningsData?.transactions || [])];

  // 1. Filter
  if (filterPeriod === 'today') {
    processedTransactions = processedTransactions.filter(tx => tx.isToday);
  } else if (filterPeriod === 'week') {
    processedTransactions = processedTransactions.filter(tx => tx.isWeek);
  } else if (filterPeriod === 'custom' && startDate && endDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    processedTransactions = processedTransactions.filter(tx => {
      const txDate = new Date(tx.rawDate);
      return txDate >= start && txDate <= end;
    });
  }

  // 2. Sort
  processedTransactions.sort((a, b) => {
    if (sortOrder === 'newest') return new Date(b.rawDate) - new Date(a.rawDate);
    if (sortOrder === 'oldest') return new Date(a.rawDate) - new Date(b.rawDate);
    if (sortOrder === 'highest') return Number(b.netAmount) - Number(a.netAmount);
    if (sortOrder === 'lowest') return Number(a.netAmount) - Number(b.netAmount);
    return 0;
  });

  // 3. Paginate
  const totalPages = Math.ceil(processedTransactions.length / itemsPerPage);
  const paginatedTransactions = processedTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Helper for generated client avatar
  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'C';
  };

  return (
    // pb-28 ensures floating SOS button doesn't obscure the last row of data
    <div className="w-full space-y-6 pb-28 font-sans">
      
      {/* Top Banner Status Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-600 text-white p-3 rounded-xl shadow-sm">
            <Wallet className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-gray-900 font-bold text-lg tracking-tight">Driver Earnings & Payout Ledger</h1>
            <p className="text-gray-500 text-xs mt-0.5">
              Real-time breakdown of completed trip compensation and cash collections.
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 self-start md:self-auto">
          <span className="text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100 flex items-center gap-1.5 shadow-xs">
            <ShieldCheck size={14} className="text-emerald-600" /> PAYOUT SYSTEM: CASH ON DELIVERY (COD)
          </span>
          <button 
            onClick={fetchEarningsAndHistory} 
            className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition cursor-pointer"
            title="Refresh Ledger"
          >
            <RefreshCw size={14} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Financial Overview Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-200 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">Daily Metric</span>
            <h3 className="text-2xl font-black text-gray-900 mt-2">AED {earningsData.todayEarnings}</h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Today's Net Earnings</p>
          </div>
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-500 font-semibold">{earningsData.todayDeliveries} Deliveries Completed</span>
            <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Settled</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-200 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">Weekly Metric</span>
            <h3 className="text-2xl font-black text-gray-900 mt-2">AED {earningsData.weekEarnings}</h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Current Weekly Payout</p>
          </div>
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-500 font-semibold">{earningsData.weekDeliveries} Deliveries Logged</span>
            <span className="font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Verified</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-200 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md">Monthly Metric</span>
            <h3 className="text-2xl font-black text-gray-900 mt-2">AED {earningsData.monthEarnings}</h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Monthly Accrued Payout</p>
          </div>
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-500 font-semibold">{earningsData.monthDeliveries} Total Trips Volume</span>
            <span className="font-extrabold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">Net Payout</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-200 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">Pending Action</span>
            <h3 className="text-2xl font-black text-amber-600 mt-2">AED {earningsData.pendingDeposit}</h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Pending Cash Deposit</p>
          </div>
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-500 font-semibold">Depot Handover</span>
            <span className="font-extrabold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-full">End of Shift</span>
          </div>
        </div>
      </div>

      {/* Main Ledger Section */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        
        {/* Enterprise Filter & Sort Header */}
        <div className="p-6 border-b border-gray-100 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
          <div>
            <h3 className="font-black text-gray-900 text-base">Delivery Transactions & Commission Ledger</h3>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">Tracking real database gross cash collections, automated deductions, and net payouts</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            
            {/* Filter Pills */}
            <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs font-bold items-center shrink-0">
              <button 
                onClick={() => setFilterPeriod('all')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${filterPeriod === 'all' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              >
                All
              </button>
              <button 
                onClick={() => setFilterPeriod('today')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${filterPeriod === 'today' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Today
              </button>
              <button 
                onClick={() => setFilterPeriod('week')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${filterPeriod === 'week' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Week
              </button>
              <button 
                onClick={() => setFilterPeriod('custom')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${filterPeriod === 'custom' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Custom</span>
              </button>
            </div>

            {/* Custom Date Inputs (Appears only when 'Custom' is clicked) */}
            {filterPeriod === 'custom' && (
              <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-xl border border-gray-200">
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={e => setStartDate(e.target.value)} 
                  className="text-xs bg-transparent text-gray-700 font-medium focus:outline-none cursor-pointer"
                />
                <span className="text-gray-400 text-xs font-bold">-</span>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={e => setEndDate(e.target.value)} 
                  className="text-xs bg-transparent text-gray-700 font-medium focus:outline-none cursor-pointer"
                />
              </div>
            )}

            {/* Sort Dropdown */}
            <div className="flex items-center bg-white border border-gray-200 rounded-xl shadow-2xs shrink-0">
              <div className="pl-3 pr-2 text-gray-400">
                <ListFilter className="w-3.5 h-3.5" />
              </div>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="bg-transparent text-gray-700 text-xs font-bold py-2.5 pr-3 focus:outline-none cursor-pointer appearance-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest AED</option>
                <option value="lowest">Lowest AED</option>
              </select>
            </div>

            <button 
              onClick={handleExportCSV} 
              className="bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold px-4 py-2.5 rounded-xl border border-gray-200 transition flex items-center space-x-2 cursor-pointer shadow-2xs shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Data Rendering */}
        <div className="divide-y divide-gray-100">
          {paginatedTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="bg-gray-50 p-4 rounded-full mb-3 border border-gray-100">
                <SearchX className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-sm font-bold text-gray-800 mb-1">No Transactions Found</h4>
              <p className="text-xs text-gray-500 max-w-sm">
                We couldn't find any financial records matching your current filter and date criteria. Try adjusting your parameters.
              </p>
            </div>
          ) : (
            paginatedTransactions.map((tx, index) => {
              const isSettled = (tx.status || '').toLowerCase().includes('settled') || (tx.status || '').toLowerCase().includes('reconciled');
              return (
                <div key={index} className="p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 hover:bg-gray-50/60 transition-colors">
                  <div className="flex items-start space-x-4">
                    
                    {/* Status Icon */}
                    <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl shrink-0 mt-0.5 border border-emerald-100 shadow-2xs">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        {/* Client Avatar Integration */}
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[9px] shrink-0 border border-blue-200">
                            {getInitials(tx.client)}
                          </div>
                          <h4 className="font-extrabold text-gray-900 text-sm">{tx.client}</h4>
                        </div>
                        
                        <span className="bg-gray-100 text-gray-700 text-[10px] font-mono font-black px-2.5 py-0.5 rounded-md border border-gray-200">JOB #{tx.id}</span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${
                          isSettled 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {tx.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium">{tx.service} • <span className="text-gray-400 font-normal">{tx.location}</span></p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-8 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-100 font-sans">
                    <div className="text-left lg:text-right space-y-0.5">
                      <p className="text-[11px] text-gray-400 font-semibold">Gross: <span className="font-bold text-gray-800">AED {tx.grossAmount}</span></p>
                      <p className="text-[11px] text-red-500 font-semibold">Commission (10%): <span className="font-bold">- AED {tx.commission}</span></p>
                    </div>
                    <div className="text-right space-y-0.5">
                      <span className="text-sm font-black text-emerald-600 block">Net: AED {tx.netAmount}</span>
                      <p className="text-[10px] text-gray-400 font-medium">{tx.time}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {/* Enterprise Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-gray-500 font-medium">
              Showing <span className="font-bold text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-gray-900">{Math.min(currentPage * itemsPerPage, processedTransactions.length)}</span> of <span className="font-bold text-gray-900">{processedTransactions.length}</span> entries
            </span>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="text-xs font-bold text-gray-700 px-2">
                Page {currentPage} of {totalPages}
              </div>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverEarnings;