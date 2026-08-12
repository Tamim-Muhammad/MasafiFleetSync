import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { DollarSign, CheckCircle2, Clock, FileSpreadsheet, Download, ShieldCheck } from 'lucide-react';

const AdminFinancials = () => {
  const { darkMode } = useOutletContext();

  // Closed-loop cash-on-delivery (COD) transaction ledger state connected with Driver job handshakes
  const [cashLedger, setCashLedger] = useState([
    { id: 'TXN-901', driver: 'Ahmed Al-Mazrouei', volume: '5,000 Gal', gross: 1200, commission: 120, net: 1080, state: 'Settled & Reconciled' },
    { id: 'TXN-902', driver: 'Salim Al-Ketbi', volume: '1,000 Gal', gross: 450, commission: 45, net: 405, state: 'Collected by Driver' },
    { id: 'TXN-903', driver: 'Tariq Bin Ziyad', volume: '5,000 Gal', gross: 1200, commission: 120, net: 1080, state: 'Pending Collection' },
  ]);

  const handleSettleLedger = (id) => {
    setCashLedger(prev => prev.map(tx => {
      if (tx.id === id) {
        return { ...tx, state: 'Settled & Reconciled' };
      }
      return tx;
    }));
  };

  const handleExportCSV = () => {
    const headers = "Transaction ID,Driver,Volume,Gross Amount,Commission,Net Payout,Custody State\n";
    const rows = cashLedger.map(t => `${t.id},"${t.driver}",${t.volume},AED ${t.gross},AED ${t.commission},AED ${t.net},"${t.state}"`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `AlWaqar_Financial_Ledger_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalGrossToday = cashLedger.reduce((acc, curr) => acc + curr.gross, 0);
  const totalCommission = cashLedger.reduce((acc, curr) => acc + curr.commission, 0);
  const pendingSettlements = cashLedger
    .filter(t => t.state !== 'Settled & Reconciled')
    .reduce((acc, curr) => acc + curr.net, 0);

  return (
    <div className={`space-y-8 transition-colors duration-200 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
      <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#0B2A4D] border-blue-950'} p-6 rounded-2xl shadow-md text-white flex flex-col md:flex-row md:items-center md:justify-between border transition-colors`}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Global Financial Ledger & Commission Audits</h1>
          <p className="text-sm text-blue-200 mt-1">Audit Cash-on-Delivery (COD) flows, verify driver cash custody, and close out shift ledgers.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <button onClick={handleExportCSV} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer">
            <Download className="w-4 h-4" />
            <span>Export Financial Report (.CSV)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className={`p-6 rounded-2xl shadow-sm border transition-colors ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-100 text-gray-900'}`}>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gross Revenue (Today)</p>
          <h3 className="text-3xl font-black text-gray-800 dark:text-white mt-2">AED {totalGrossToday.toLocaleString()}</h3>
          <p className="text-xs font-bold text-emerald-600 mt-1.5">+8.4% vs yesterday</p>
        </div>
        <div className={`p-6 rounded-2xl shadow-sm border transition-colors ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-100 text-gray-900'}`}>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Company Commission Cut</p>
          <h3 className="text-3xl font-black text-gray-800 dark:text-white mt-2">AED {totalCommission.toLocaleString()}</h3>
          <p className="text-xs font-bold text-blue-600 mt-1.5">10% Configured Rate</p>
        </div>
        <div className={`p-6 rounded-2xl shadow-sm border transition-colors ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-100 text-gray-900'}`}>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Yard Settlement</p>
          <h3 className="text-3xl font-black text-gray-800 dark:text-white mt-2">AED {pendingSettlements.toLocaleString()}</h3>
          <p className="text-xs font-bold text-amber-600 mt-1.5">With Active Drivers</p>
        </div>
      </div>

      <div className={`p-8 rounded-3xl shadow-md border space-y-6 transition-colors ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4 border-gray-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-black tracking-tight">Cash-on-Delivery (COD) Custody State Machine</h2>
            <p className="text-xs text-gray-400 mt-0.5">Manage hand-to-hand collections and execute yard reconciliations.</p>
          </div>
          <span className="mt-2 sm:mt-0 px-3 py-1 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 text-xs font-bold rounded-xl w-fit">Live Database Sync Active</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b text-xs font-bold uppercase tracking-wider ${darkMode ? 'border-slate-800 text-gray-400' : 'border-gray-200 text-gray-400'}`}>
                <th className="py-3 px-3">Transaction ID</th>
                <th className="py-3 px-3">Driver</th>
                <th className="py-3 px-3">Gross Amount</th>
                <th className="py-3 px-3">Commission Deduction</th>
                <th className="py-3 px-3">Net Payout</th>
                <th className="py-3 px-3">Custody State</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y text-xs font-medium ${darkMode ? 'divide-slate-800 text-gray-300' : 'divide-gray-100 text-gray-700'}`}>
              {cashLedger.map((tx, idx) => (
                <tr key={idx} className={`transition-colors ${darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50/50'}`}>
                  <td className="py-4 px-3 font-bold text-blue-500">{tx.id}</td>
                  <td className={`py-4 px-3 font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{tx.driver}</td>
                  <td className="py-4 px-3 font-semibold">AED {tx.gross}</td>
                  <td className="py-4 px-3 text-gray-500">AED {tx.commission} (10%)</td>
                  <td className="py-4 px-3 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">AED {tx.net}</td>
                  <td className="py-4 px-3">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                      tx.state === 'Settled & Reconciled' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                      tx.state === 'Collected by Driver' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {tx.state}
                    </span>
                  </td>
                  <td className="py-4 px-3 text-right">
                    {tx.state !== 'Settled & Reconciled' ? (
                      <button onClick={() => handleSettleLedger(tx.id)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs">Settle Ledger</button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-xs"><ShieldCheck size={14} /> Reconciled</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminFinancials;