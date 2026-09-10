import React, { useState, useEffect } from 'react';
import { Key, FileText, Download, Clock, CheckCircle, AlertTriangle, Building2, Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const CustomerMyLeases = () => {
  const [searchParams] = useSearchParams();
  const [leases, setLeases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Sync status filter with URL query parameters instantly
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

  const fetchCustomerLeases = async () => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        setIsLoading(false);
        return; // Exit gracefully if no session exists
      }

      const res = await fetch('http://localhost:5191/api/RentalAgreements/my-leases', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        
        const formattedLeases = data.map(r => {
          const startObj = r.startDate ? new Date(r.startDate) : new Date();
          const endObj = r.endDate ? new Date(r.endDate) : new Date();
          
          // CRITICAL FIX: Trim whitespace and safely lowercase to prevent filter bugs
          let computedStatus = String(r.status || r.Status || 'pending').trim().toLowerCase();

          if (computedStatus === 'active' && new Date() > endObj) {
            computedStatus = 'expired';
          }

          return {
            id: r.contractReferenceNo || r.ContractReferenceNo || `CNT-2026-${r.id || r.Id}`,
            rawId: r.id || r.Id,
            customerId: r.customerId || r.CustomerId || 1,
            companyName: r.companyName || r.CompanyName || 'Al-Waqar Enterprise LLC',
            tradeLicense: r.tradeLicenseNo || r.TradeLicenseNo || 'TRD-DEFAULT-01',
            signatoryName: r.signatoryName || r.SignatoryName || 'Authorized Signatory',
            contactPhone: r.contactPhone || r.ContactPhone || '+971 50 000 0000',
            projectSite: r.projectSite || r.ProjectSite || 'Fujairah Regional Site',
            vehicle: r.vehicleCategory || r.VehicleCategory || 'Industrial Heavy Vehicle',
            startDate: startObj.toISOString().split('T')[0],
            endDate: endObj.toISOString().split('T')[0],
            cost: (r.totalPrice ?? r.TotalPrice) ? Number(r.totalPrice ?? r.TotalPrice).toFixed(2) : '0.00',
            status: computedStatus,
            deposit: r.depositStatus || r.DepositStatus || 'Corporate Post-Dated Cheque (PDC)',
            securityDepositAmount: r.securityDeposit || r.SecurityDeposit || 1000.00
          };
        });

        // Sort dynamically: Newest IDs at the top
        setLeases(formattedLeases.sort((a, b) => b.rawId - a.rawId));
      }
    } catch (err) {
      console.error("Failed to fetch customer leases:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerLeases();
  }, []);

  const handleDownloadPdf = (rental) => {
    const contractContent = `=====================================================
          AL-WAQAR TRANSPORT L.L.C.
         COMMERCIAL FLEET LEASE AGREEMENT
=====================================================
Contract Reference No: ${rental.id}
Lessee / Company Name: ${rental.companyName}
Trade License No:      ${rental.tradeLicense}
Authorized Signatory:  ${rental.signatoryName}
Contact Phone:         ${rental.contactPhone}
Project Site / Location: ${rental.projectSite}
Leased Fleet Asset:    ${rental.vehicle}
Lease Timeline:        From ${rental.startDate} To ${rental.endDate}
Security Guarantee:    ${rental.deposit}
Security Collateral:   AED ${rental.securityDepositAmount}
Total Lease Value:     AED ${rental.cost}
Handover Terminal:     Al-Waqar Central Fleet Yard, Masafi Depot #4
=====================================================`;

    const blob = new Blob([contractContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${rental.id}-Lease-Agreement.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredLeases = leases.filter(l => {
    const matchesSearch = 
      l.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.projectSite.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full space-y-6 pb-12 font-sans text-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">
            <Key size={14} /> Corporate Account
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Lease Contracts & Agreements</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Inspect active heavy vehicle lease agreements, check status approvals, and download official contract documents.
          </p>
        </div>

        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-600">
            <Search size={15} />
          </span>
          <input
            type="text"
            placeholder="Search Contract ID or Asset..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 bg-blue-50/50 border-2 border-blue-200 focus:border-blue-600 rounded-xl text-xs font-bold text-gray-900 focus:outline-none transition w-64 shadow-2xs"
          />
        </div>
      </div>

      {/* STATUS FILTER TABS */}
      <div className="flex flex-wrap gap-2 bg-gray-100 p-1.5 rounded-2xl w-fit border border-gray-200 shadow-inner">
        {[
          { key: 'all', label: `All Contracts (${leases.length})` },
          { key: 'pending', label: `Pending (${leases.filter(l => l.status === 'pending').length})` },
          { key: 'active', label: `Active (${leases.filter(l => l.status === 'active').length})` },
          { key: 'completed', label: `Completed (${leases.filter(l => l.status === 'completed').length})` },
          { key: 'expired', label: `Expired (${leases.filter(l => l.status === 'expired').length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer uppercase tracking-wider ${
              statusFilter === tab.key ? 'bg-[#0B2A4D] text-white shadow-md' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-black text-gray-400 uppercase tracking-wider">
                <th className="pb-3 pl-2">Contract ID</th>
                <th className="pb-3">Company / Asset</th>
                <th className="pb-3">Project Site</th>
                <th className="pb-3">Timeline</th>
                <th className="pb-3">Total Value</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right pr-2">Action / Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/60 text-xs font-semibold text-gray-800">
              {isLoading ? (
                <tr><td colSpan="7" className="text-center py-12 text-xs text-gray-400">Loading leases...</td></tr>
              ) : filteredLeases.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-12 text-xs text-gray-400 bg-gray-50 rounded-2xl">No lease agreements found.</td></tr>
              ) : (
                filteredLeases.map((l) => (
                  <tr key={l.rawId || l.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-4 pl-2 font-black text-[#0B2A4D]">{l.id}</td>
                    <td className="py-4">
                      <strong className="block text-gray-900 font-extrabold">{l.vehicle}</strong>
                      <span className="text-[11px] text-gray-500 font-medium">{l.companyName}</span>
                    </td>
                    <td className="py-4 text-blue-900 font-bold">{l.projectSite}</td>
                    <td className="py-4 text-gray-700 font-medium">{l.startDate} to {l.endDate}</td>
                    <td className="py-4 font-black text-gray-900">AED {l.cost}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        l.status === 'active' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        l.status === 'pending' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>{l.status}</span>
                    </td>
                    <td className="py-4 text-right pr-2">
                      <button onClick={() => handleDownloadPdf(l)} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold transition border border-blue-200 cursor-pointer">
                        <Download size={13} className="inline mr-1" /> Download Contract
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerMyLeases;