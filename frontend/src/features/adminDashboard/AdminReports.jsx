import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { FileText, Download, TrendingUp, ShieldCheck, Users, Truck } from 'lucide-react';

const AdminReports = () => {
  const { darkMode } = useOutletContext();

  const reportsList = [
    { 
      title: 'Global Fleet Compliance Audit Report', 
      type: 'PDF / CSV', 
      date: 'Generated Daily', 
      desc: 'Detailed breakdown of expiring licenses, insurance policies, and active blockades.',
      filename: 'AlWaqar_Compliance_Audit_Report.csv',
      data: "Asset ID,Type,License/Mulkiya Expiry,Compliance State\nAST-001,5000 Gal Tanker,2026-04-12,Active\nAST-002,1000 Gal Tanker,2026-03-01,Blocked (Expired)"
    },
    { 
      title: 'Driver Performance & Revenue Summary', 
      type: 'Excel Spreadsheet', 
      date: 'Weekly Payroll Cycle', 
      desc: 'Completed deliveries, gross cash collected, and net commission deductions.',
      filename: 'AlWaqar_Driver_Performance_Summary.csv',
      data: "Driver ID,Name,Completed Deliveries,Gross Collected (AED),Commission (10%),Net Payout (AED)\nDRV-101,Ahmed Al-Mazrouei,42,AED 5,000,AED 500,AED 4,500\nDRV-102,Salim Al-Ketbi,38,AED 4,200,AED 420,AED 3,780"
    },
    { 
      title: 'B2B Rental Contract & Deposit Ledger', 
      type: 'PDF Report', 
      date: 'Monthly Audit', 
      desc: 'Active machinery leases, security deposit holdings, and maintenance downtime credits.',
      filename: 'AlWaqar_Rental_Deposit_Ledger.csv',
      data: "Contract ID,Client Name,Vehicle Assigned,Lease Duration,Security Deposit (AED),Status\nCNT-501,Al-Fujairah Builders,Heavy Loader Tanker,30 Days,AED 2,500,Active\nCNT-502,Masafi Construction,5000 Gal Tanker,14 Days,AED 1,200,Active"
    },
    { 
      title: 'Emergency Recovery Incident & ART Analysis', 
      type: 'PDF Report', 
      date: 'On Demand', 
      desc: 'Average Resolution Time (ART) metrics, breakdown heatmaps, and public call logs.',
      filename: 'AlWaqar_Emergency_Recovery_ART_Report.csv',
      data: "Incident ID,Caller Type,Fault Description,Dispatch Timestamp,Resolution Time (ART),Status\nINC-801,Affiliated Driver,Tire Blowout,2026-03-20 14:15,45 Minutes,Resolved\nINC-802,Public External,Engine Overheating,2026-03-21 09:30,60 Minutes,Resolved"
    },
  ];

  const handleDownloadReport = (rep) => {
    const blob = new Blob([rep.data], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', rep.filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`space-y-8 transition-colors duration-200 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
      
      {/* Top Professional Navy Header */}
      <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#0B2A4D] border-blue-950'} p-6 rounded-2xl shadow-md text-white flex flex-col md:flex-row md:items-center md:justify-between border transition-colors`}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Executive Reports & System Analytics</h1>
          <p className="text-sm text-blue-200 mt-1">Export official system-wide audit reports for management review.</p>
        </div>
      </div>  

      {/* Visually Separated Reports Grid Container */}
      <div className={`p-8 rounded-3xl shadow-md border space-y-6 transition-colors ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
        <div className="border-b pb-4 border-gray-100 dark:border-slate-800">
          <h2 className="text-xl font-black tracking-tight">System Audit Documents & Analytics Feeds</h2>
          <p className="text-xs text-gray-400 mt-0.5">Select a report module to generate and download live audit files.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportsList.map((rep, idx) => (
            <div key={idx} className={`p-6 rounded-2xl shadow-sm border transition-all flex flex-col justify-between ${darkMode ? 'bg-slate-800/60 border-slate-700 text-white hover:border-blue-500' : 'bg-gray-50 border-gray-200 text-gray-900 hover:border-blue-300'}`}>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-300 px-2.5 py-1 rounded-lg">{rep.type}</span>
                  <span className="text-xs font-semibold text-gray-400">{rep.date}</span>
                </div>
                <h3 className={`text-lg font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{rep.title}</h3>
                <p className={`text-xs mt-1 leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{rep.desc}</p>
              </div>
              
              <div className={`mt-6 pt-4 border-t flex items-center justify-between ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                <span className={`text-[11px] font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Format: Standardized Enterprise Layout</span>
                <button 
                  onClick={() => handleDownloadReport(rep)}
                  className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Report</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminReports;