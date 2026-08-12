import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ShieldCheck, AlertTriangle, FileText, CheckCircle2, XCircle, Search, Eye, Filter, Image as ImageIcon } from 'lucide-react';

const AdminComplianceApproval = () => {
  const { darkMode } = useOutletContext();
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); 
  const [searchTerm, setSearchTerm] = useState('');

  const [allAssets, setAllAssets] = useState([
    { id: 'DRV-304', name: 'Salim Al-Ketbi', assetType: 'Driver + 5,000 Gal Tanker (KT-49201)', submittedDate: 'Aug 3, 2026', status: 'Pending Review', ocrStatus: 'Parsed Successfully', category: 'pending', licenseImg: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400', mulkiyaImg: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400' },
    { id: 'DRV-882', name: 'Ahmed Al-Mazrouei', assetType: 'Driver + 5,000 Gal Tanker (KT-78452)', submittedDate: 'Aug 4, 2026', status: 'Pending Review', ocrStatus: 'Parsed Successfully', category: 'pending', licenseImg: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400', mulkiyaImg: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400' },
    { id: 'DRV-310', name: 'Rashid Al-Kaabi', assetType: 'Driver + 1,000 Gal Tanker (MS-11820)', submittedDate: 'Aug 4, 2026', status: 'Manual Review', ocrStatus: 'OCR Read Failure', category: 'pending', licenseImg: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400', mulkiyaImg: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400' },
    { id: 'DRV-045', name: 'Tariq Bin Ziyad', assetType: 'Driver + Heavy Haul Tanker (SH-55431)', submittedDate: 'Jul 15, 2026', status: 'Expired', ocrStatus: 'Flagged Expired', category: 'blocked', licenseImg: '', mulkiyaImg: '' },
    { id: 'DRV-112', name: 'Saeed Al-Suwaidi', assetType: 'Driver + 5,000 Gal Tanker (DXB-99182)', submittedDate: 'Jun 10, 2026', status: 'Expiring Soon', ocrStatus: 'Expiring in 14 Days', category: 'expiring', licenseImg: '', mulkiyaImg: '' },
  ]);

  const handleApprove = (id) => {
    setAllAssets(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, status: 'Approved / Active', category: 'active', ocrStatus: 'Verified & Cleared' };
      }
      return item;
    }));
    alert(`Driver and Asset package ${id} successfully approved and activated for fleet deployment.`);
    setSelectedAsset(null);
  };

  const handleReject = (id) => {
    setAllAssets(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, status: 'Rejected / Resubmission Required', category: 'rejected' };
      }
      return item;
    }));
    alert(`Driver package ${id} rejected. Return notice and resubmission request dispatched.`);
    setSelectedAsset(null);
  };

  const filteredQueue = allAssets.filter(item => {
    const matchesCategory = 
      activeFilter === 'all' ? true :
      activeFilter === 'pending' ? item.category === 'pending' :
      activeFilter === 'expiring' ? item.category === 'expiring' :
      activeFilter === 'blocked' ? item.category === 'blocked' : true;

    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.assetType.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const complianceStats = [
    { label: 'System Compliance Rate', value: '98.5%', color: 'text-emerald-600', filterKey: 'all' },
    { label: 'Pending Approvals', value: `${allAssets.filter(i => i.category === 'pending').length} Packages`, color: 'text-blue-600', filterKey: 'pending' },
    { label: 'Expiring in 30 Days', value: '5 Units', color: 'text-amber-600', filterKey: 'expiring' },
    { label: 'Blocked / Non-Compliant', value: '1 Unit', color: 'text-red-600', filterKey: 'blocked' },
  ];

  return (
    <div className={`space-y-6 transition-colors duration-200 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
      <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#0B2A4D] border-blue-950'} p-6 rounded-2xl shadow-md text-white flex flex-col md:flex-row md:items-center md:justify-between border transition-colors`}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Driver & Asset Registration Approval</h1>
          <p className="text-sm text-blue-200 mt-1">Review unified driver onboarding packages, verify Mulkiya/License OCR extractions, and authorize fleet access.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {complianceStats.map((stat, idx) => {
          const isSelected = activeFilter === stat.filterKey;
          return (
            <div 
              key={idx} 
              onClick={() => setActiveFilter(stat.filterKey)}
              className={`p-5 rounded-2xl shadow-sm border transition-all cursor-pointer hover:shadow-md ${
                darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-100 text-gray-900'
              } ${isSelected ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20 dark:bg-blue-950/40' : ''}`}
            >
              <div className="flex justify-between items-start">
                <p className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>{stat.label}</p>
                {isSelected && <span className="text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded-md">Active Filter</span>}
              </div>
              <h3 className={`text-2xl font-bold mt-2 ${stat.color}`}>{stat.value}</h3>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 p-6 rounded-2xl shadow-sm border transition-colors ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-100 text-gray-900'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold">Driver Onboarding Verification Queue</h2>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${darkMode ? 'bg-slate-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                Showing: {activeFilter.toUpperCase()}
              </span>
            </div>
            
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search driver ID or name..." 
                className={`pl-9 pr-4 py-2 border rounded-xl text-xs focus:outline-none focus:border-blue-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b text-xs font-semibold uppercase ${darkMode ? 'border-slate-800 text-gray-400' : 'border-gray-100 text-gray-400'}`}>
                  <th className="pb-3">Reference ID</th>
                  <th className="pb-3">Driver & Assigned Asset</th>
                  <th className="pb-3">Package Details</th>
                  <th className="pb-3">OCR Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y text-sm ${darkMode ? 'divide-slate-800' : 'divide-gray-50'}`}>
                {filteredQueue.length > 0 ? (
                  filteredQueue.map((item, idx) => (
                    <tr key={idx} className={`transition-colors ${darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50/50'}`}>
                      <td className="py-3 font-semibold text-blue-500">{item.id}</td>
                      <td className={`py-3 font-bold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{item.name}</td>
                      <td className={`py-3 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.assetType}</td>
                      <td className="py-3">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                          item.ocrStatus.includes('Parsed') || item.ocrStatus.includes('Verified') ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {item.ocrStatus}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button 
                          onClick={() => setSelectedAsset(item)}
                          className="inline-flex items-center space-x-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-xs text-gray-400">
                      No registered driver packages found matching your search or filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Preview & Action Panel with Real Uploaded Photo Vault Integration */}
        <div className={`p-6 rounded-2xl shadow-sm border flex flex-col justify-between transition-colors ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-100 text-gray-900'}`}>
          <div>
            <h2 className="text-lg font-bold mb-4">Onboarding Inspection Portal</h2>
            {selectedAsset ? (
              <div className="space-y-4">
                <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>Selected Driver Package</p>
                  <h4 className={`font-bold text-sm mt-0.5 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{selectedAsset.name} ({selectedAsset.id})</h4>
                  <p className="text-xs text-blue-500 mt-1 font-semibold">{selectedAsset.assetType}</p>
                </div>

                {/* Linked Uploaded Photo Vault Preview */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 text-center p-2">
                    <p className="text-[10px] text-slate-400 font-bold mb-1">Driving License</p>
                    <img src={selectedAsset.licenseImg || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400'} alt="License Scan" className="h-24 w-full object-cover rounded-lg" />
                  </div>
                  <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 text-center p-2">
                    <p className="text-[10px] text-slate-400 font-bold mb-1">Vehicle Mulkiya</p>
                    <img src={selectedAsset.mulkiyaImg || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400'} alt="Mulkiya Scan" className="h-24 w-full object-cover rounded-lg" />
                  </div>
                </div>

                <div className={`space-y-2 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <div className={`flex justify-between py-1 border-b ${darkMode ? 'border-slate-800' : 'border-gray-50'}`}>
                    <span className="text-gray-400">Submission Date:</span>
                    <span className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedAsset.submittedDate}</span>
                  </div>
                  <div className={`flex justify-between py-1 border-b ${darkMode ? 'border-slate-800' : 'border-gray-50'}`}>
                    <span className="text-gray-400">License Expiry:</span>
                    <span className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>14 Dec 2027</span>
                  </div>
                  <div className={`flex justify-between py-1 border-b ${darkMode ? 'border-slate-800' : 'border-gray-50'}`}>
                    <span className="text-gray-400">Issuing Authority:</span>
                    <span className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Fujairah Police / RTA</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`h-64 flex items-center justify-center text-center p-6 border border-dashed rounded-2xl ${darkMode ? 'border-slate-700 bg-slate-800/40 text-gray-400' : 'border-gray-200 text-gray-400'}`}>
                <p className="text-xs">Select a registered driver from the queue to inspect uploaded credentials and authorize account activation.</p>
              </div>
            )}
          </div>

          {selectedAsset && (
            <div className="mt-6 flex space-x-3">
              <button 
                onClick={() => handleReject(selectedAsset.id)}
                className="flex-1 bg-red-50 hover:bg-red-100 dark:bg-red-950/60 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-red-200 dark:border-red-900"
              >
                Reject & Resubmit
              </button>
              <button 
                onClick={() => handleApprove(selectedAsset.id)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
              >
                Approve Driver
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminComplianceApproval;