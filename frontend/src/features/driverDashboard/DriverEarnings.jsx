import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Wallet, 
  TrendingUp, 
  CheckCircle2, 
  DollarSign,
  Download,
  Calendar
} from 'lucide-react';

const DriverEarnings = () => {
  const navigate = useNavigate();
  const [filterTab, setFilterTab] = useState('all');

  // Transaction state handler with Payment Collection Handshake trigger
  const [transactions, setTransactions] = useState([
    {
      id: 'J-250518-01',
      client: 'Al Badia Construction LLC',
      service: 'Water Tanker Delivery (5,000 Gallons)',
      location: 'Masafi, Fujairah',
      grossAmount: '350.00',
      commission: '35.00',
      netAmount: '315.00',
      time: 'Today, 07:15 AM',
      status: 'Cash Collected & Logged'
    },
    {
      id: 'J-250517-04',
      client: 'Fujairah Building Materials',
      service: 'Water Tanker Delivery (3,000 Gallons)',
      location: 'Dibba, Fujairah',
      grossAmount: '220.00',
      commission: '22.00',
      netAmount: '198.00',
      time: 'Yesterday, 04:30 PM',
      status: 'Cash Collected & Logged'
    }
  ]);

  const handlePaymentReceivedHandshake = (id) => {
    setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, status: 'Collected by Driver (Synced)' } : tx));
    alert(`Payment Received handshake executed for Job ${id}! Admin Financial Ledger updated to 'Collected by Driver'.`);
  };

  return (
    <div className="w-full space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-xs font-bold text-gray-600 hover:text-blue-600 bg-white px-4 py-2.5 rounded-xl border border-gray-200 transition-colors shadow-xs cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
        <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-100">
          PAYOUT SYSTEM: CASH ON DELIVERY (COD)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-200 flex flex-col justify-between">
          <div><p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Today's Earnings</p><h3 className="text-xl font-extrabold text-gray-900 mt-1">AED 350.00</h3></div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs"><span className="text-gray-500">2 Deliveries</span><span className="font-bold text-emerald-600">Settled</span></div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-200 flex flex-col justify-between">
          <div><p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">This Week</p><h3 className="text-xl font-extrabold text-gray-900 mt-1">AED 1,920.00</h3></div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs"><span className="text-gray-500">6 Deliveries</span><span className="font-bold text-blue-600">Verified</span></div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-200 flex flex-col justify-between">
          <div><p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">This Month (May)</p><h3 className="text-xl font-extrabold text-gray-900 mt-1">AED 7,450.00</h3></div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs"><span className="text-gray-500">24 Deliveries</span><span className="font-bold text-purple-600">Net Payout</span></div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-200 flex flex-col justify-between">
          <div><p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Pending Cash Deposit</p><h3 className="text-xl font-extrabold text-amber-600 mt-1">AED 350.00</h3></div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs"><span className="text-gray-500">Depot Handover</span><span className="font-semibold text-gray-700">End of Shift</span></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-gray-900 text-base">Delivery Transactions & Commission Ledger</h3>
            <p className="text-xs text-gray-500 mt-0.5">Tracking gross cash collections, automated commission deductions, and net payouts</p>
          </div>
          
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button onClick={() => alert('Exporting financial statement CSV report...')} className="bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold px-4 py-2 rounded-xl border border-gray-200 transition-colors flex items-center space-x-2 cursor-pointer">
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {transactions.map((tx, index) => (
            <div key={index} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl shrink-0 mt-0.5 sm:mt-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <h4 className="font-bold text-gray-900 text-sm">{tx.client}</h4>
                    <span className="bg-blue-50 text-blue-600 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">JOB #{tx.id}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{tx.service} • <span className="text-gray-400">{tx.location}</span></p>
                  <button onClick={() => handlePaymentReceivedHandshake(tx.id)} className="mt-2 text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 cursor-pointer">
                    Trigger 'Payment Received' Handshake
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-6 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                <div className="text-left sm:text-right">
                  <p className="text-[11px] text-gray-400">Gross: <span className="font-semibold text-gray-700">AED {tx.grossAmount}</span></p>
                  <p className="text-[11px] text-red-500">Commission (10%): <span className="font-semibold">- AED {tx.commission}</span></p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-emerald-600">Net: AED {tx.netAmount}</span>
                  <p className="text-[10px] text-gray-400 mt-0.5">{tx.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DriverEarnings;