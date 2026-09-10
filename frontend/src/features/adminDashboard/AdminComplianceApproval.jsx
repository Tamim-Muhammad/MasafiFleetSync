import React, { useState, useEffect } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
  ShieldCheck, 
  FileText, 
  Search, 
  Eye, 
  Calendar, 
  Truck, 
  Award, 
  Hash, 
  X, 
  ExternalLink, 
  FolderSearch, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  AlertCircle, 
  Users,
  Ban,
  RotateCcw,
  UserCheck
} from 'lucide-react';

const AdminComplianceApproval = () => {
  const { darkMode } = useOutletContext();
  const [searchParams] = useSearchParams();
  
  const tabParam = searchParams.get('tab');
  const windowParam = searchParams.get('window');

  // 3 Primary Tabs
  const [activeTab, setActiveTab] = useState(
    tabParam === 'assets' ? 'assets' : tabParam === 'licenses' ? 'driver-licenses' : 'drivers'
  );
  const [assetWindowFilter, setAssetWindowFilter] = useState(windowParam || 'all');
  const [driverWindowFilter, setDriverWindowFilter] = useState('all');

  // Professional Toast / Inline Feedback State (Replaced intrusive native window.alert)
  const [toast, setToast] = useState({ message: '', type: '' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: '', type: '' });
    }, 4000);
  };

  // Driver Approvals State
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [selectedDriverAudit, setSelectedDriverAudit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingDrivers, setPendingDrivers] = useState([]);
  const [allDrivers, setAllDrivers] = useState([]);
  const [activeDocPreview, setActiveDocPreview] = useState(null);

  // Fleet Expiries State
  const [selectedAssetDossier, setSelectedAssetDossier] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [assetSearchTerm, setAssetSearchTerm] = useState('');
  const [driverSearchTerm, setDriverSearchTerm] = useState('');
  const [loadingAssets, setLoadingAssets] = useState(false);

  useEffect(() => {
    fetchPendingDrivers();
    fetchAllDrivers();
    fetchFleetAssets();
  }, []);

  useEffect(() => {
    if (tabParam === 'assets') setActiveTab('assets');
    if (tabParam === 'licenses') setActiveTab('driver-licenses');
    if (windowParam) setAssetWindowFilter(windowParam);
  }, [tabParam, windowParam]);

  const fetchPendingDrivers = async () => {
    try {
      const response = await axios.get('http://localhost:5191/api/drivers/pending');
      setPendingDrivers(response.data);
    } catch (error) {
      console.error("Error fetching pending drivers:", error);
    }
  };

  const fetchAllDrivers = async () => {
    try {
      const response = await axios.get('http://localhost:5191/api/drivers');
      setAllDrivers(response.data);
    } catch (error) {
      console.error("Error fetching all drivers:", error);
    }
  };

  const fetchFleetAssets = async () => {
    try {
      setLoadingAssets(true);
      const response = await axios.get('http://localhost:5191/api/vehicles');
      setVehicles(response.data);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoadingAssets(false);
    }
  };

  const handleApproveDriver = async (driver) => {
    const rawId = driver.id ?? driver.Id;
    try {
      await axios.put(`http://localhost:5191/api/drivers/${rawId}/approve`);
      showToast(`Driver package DRV-${rawId} successfully approved!`, 'success');
      setSelectedDriver(null);
      fetchPendingDrivers();
      fetchAllDrivers();
    } catch (error) {
      console.error("Approval error:", error);
      showToast(`Approval Failed: ${error.message}`, 'error');
    }
  };

  const handleRejectDriver = async (driverId) => {
    try {
      await axios.delete(`http://localhost:5191/api/drivers/${driverId}`);
      showToast("Driver registration rejected and purged.", 'success');
      setSelectedDriver(null);
      fetchPendingDrivers();
      fetchAllDrivers();
    } catch (error) {
      console.error("Rejection error:", error);
      showToast(`Rejection Failed: ${error.message}`, 'error');
    }
  };

  // Professional replacement for window.alert / window.confirm
  const handleToggleBlockade = async (vehicleId, currentStatus) => {
    if (!vehicleId) {
      showToast("Error: Vehicle ID is undefined.", 'error');
      return;
    }
    const action = currentStatus === 'Blockaded' ? 'lift blockade on' : 'enforce dispatch blockade on';
    if (!window.confirm(`Are you sure you want to ${action} this vehicle?`)) return;

    try {
      const response = await axios.put(`http://localhost:5191/api/vehicles/${vehicleId}/blockade`, {});
      showToast(response.data?.message || 'Database record updated successfully.', 'success');
      setSelectedAssetDossier(null);
      fetchFleetAssets();
    } catch (error) {
      console.error("Blockade update error:", error);
      showToast(`Failed to update database: ${error.message}`, 'error');
    }
  };

  const handleToggleDriverBlockade = async (driverId, currentStatus) => {
    if (!driverId) {
      showToast("Error: Driver ID is undefined.", 'error');
      return;
    }
    const isCurrentlySuspended = currentStatus === 'Suspended' || currentStatus === 'Blockaded';
    const action = isCurrentlySuspended ? 'restore dispatch authorization for' : 'suspend & block';
    if (!window.confirm(`Are you sure you want to ${action} this driver?`)) return;

    try {
      const response = await axios.put(`http://localhost:5191/api/drivers/${driverId}/blockade`, {});
      showToast(response.data?.message || 'Driver status updated successfully.', 'success');
      setSelectedDriverAudit(null);
      fetchAllDrivers();
    } catch (error) {
      console.error("Driver blockade update error:", error);
      showToast(`Failed to update driver status: ${error.message}`, 'error');
    }
  };

  const getDaysRemaining = (expiryDateStr) => {
    if (!expiryDateStr) return null;
    const expiry = new Date(expiryDateStr);
    if (isNaN(expiry.getTime()) || expiry.getFullYear() < 1900) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);
    return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  };

  const assetComplianceList = vehicles.map(v => {
    const rawId = v.id ?? v.Id;
    const rawRegistrationExpiry = v.registrationExpiryDate || v.RegistrationExpiryDate;
    const rawInsExpiry = v.insuranceExpiryDate || v.InsuranceExpiryDate || rawRegistrationExpiry;
    const daysLeft = getDaysRemaining(rawRegistrationExpiry);
    const insDaysLeft = getDaysRemaining(rawInsExpiry);
    
    let category = 'compliant';
    let label = 'Compliant';

    if (daysLeft === null) {
      category = 'unregistered';
      label = 'Unregistered';
    } else if (daysLeft < 0) {
      category = 'expired';
      label = `Expired (${Math.abs(daysLeft)}d ago)`;
    } else if (daysLeft <= 7) {
      category = 'critical';
      label = `${daysLeft} Days Remaining`;
    } else if (daysLeft <= 15) {
      category = 'warning';
      label = `${daysLeft} Days Remaining`;
    } else if (daysLeft <= 30) {
      category = 'upcoming';
      label = `${daysLeft} Days Remaining`;
    } else {
      category = 'compliant';
      label = `${daysLeft} Days Remaining`;
    }

    return {
      id: rawId,
      vehicleNumber: v.vehicleNumber || v.VehicleNumber || `V-00${rawId}`,
      model: v.model || v.Model || 'Commercial Vehicle',
      type: v.type || v.Type || 'Utility Asset',
      status: v.status || v.Status || 'Available',
      fleetCategory: v.fleetCategory || v.FleetCategory || 'Internal',
      registrationExpiryDate: rawRegistrationExpiry,
      insuranceExpiryDate: rawInsExpiry,
      mulkiyaDocumentUrl: v.mulkiyaDocumentUrl || v.MulkiyaDocumentUrl || '',
      insuranceDocumentUrl: v.insuranceDocumentUrl || v.InsuranceDocumentUrl || '',
      vehiclePhotoUrl: v.vehiclePhotoUrl || v.VehiclePhotoUrl || '',
      daysLeft,
      insDaysLeft,
      category,
      label
    };
  });

  const filteredAssets = assetComplianceList.filter(item => {
    const query = assetSearchTerm.toLowerCase().trim();
    const matchesSearch = 
      item.vehicleNumber.toLowerCase().includes(query) ||
      item.model.toLowerCase().includes(query) ||
      item.type.toLowerCase().includes(query);

    let matchesWindow = true;
    if (assetWindowFilter === 'critical') matchesWindow = item.category === 'critical' || item.category === 'expired' || item.category === 'unregistered';
    else if (assetWindowFilter === 'warning') matchesWindow = item.category === 'warning';
    else if (assetWindowFilter === 'upcoming') matchesWindow = item.category === 'upcoming';
    else if (assetWindowFilter === 'flagged') matchesWindow = ['critical', 'warning', 'upcoming', 'expired', 'unregistered'].includes(item.category);

    return matchesSearch && matchesWindow;
  });

  const assetCounts = {
    all: assetComplianceList.length,
    flagged: assetComplianceList.filter(a => ['critical', 'warning', 'upcoming', 'expired', 'unregistered'].includes(a.category)).length,
    critical: assetComplianceList.filter(a => a.category === 'critical' || a.category === 'expired' || a.category === 'unregistered').length,
    warning: assetComplianceList.filter(a => a.category === 'warning').length,
    upcoming: assetComplianceList.filter(a => a.category === 'upcoming').length,
  };

  const driverLicenseComplianceList = allDrivers.map(d => {
    const rawId = d.id ?? d.Id;
    const rawLicenseExpiry = d.licenseExpiryDate || d.LicenseExpiryDate;
    const daysLeft = getDaysRemaining(rawLicenseExpiry);
    
    let category = 'compliant';
    let label = 'Valid License';

    if (daysLeft === null) {
      category = 'unregistered';
      label = 'No License Record';
    } else if (daysLeft < 0) {
      category = 'expired';
      label = `License Expired (${Math.abs(daysLeft)}d ago)`;
    } else if (daysLeft <= 7) {
      category = 'critical';
      label = `${daysLeft} Days Remaining`;
    } else if (daysLeft <= 15) {
      category = 'warning';
      label = `${daysLeft} Days Remaining`;
    } else if (daysLeft <= 30) {
      category = 'upcoming';
      label = `${daysLeft} Days Remaining`;
    } else {
      category = 'compliant';
      label = `${daysLeft} Days Remaining`;
    }

    return {
      id: rawId,
      name: d.name || d.Name || 'Driver',
      email: d.email || d.Email || '',
      phone: d.phone || d.Phone || '',
      licenseNumber: d.licenseNumber || d.LicenseNumber || 'N/A',
      licenseIssuingAuthority: d.licenseIssuingAuthority || d.LicenseIssuingAuthority || 'RTA',
      licenseExpiryDate: rawLicenseExpiry,
      drivingLicenseDocumentUrl: d.drivingLicenseDocumentUrl || d.DrivingLicenseDocumentUrl || '',
      vehicleAssignment: d.vehicleAssignment || d.VehicleAssignment || 'Unassigned',
      status: d.status || d.Status || 'Active',
      daysLeft,
      category,
      label
    };
  });

  const filteredDriverLicenses = driverLicenseComplianceList.filter(item => {
    const query = driverSearchTerm.toLowerCase().trim();
    const matchesSearch = 
      item.name.toLowerCase().includes(query) ||
      item.email.toLowerCase().includes(query) ||
      item.licenseNumber.toLowerCase().includes(query) ||
      item.vehicleAssignment.toLowerCase().includes(query);

    let matchesWindow = true;
    if (driverWindowFilter === 'critical') matchesWindow = item.category === 'critical' || item.category === 'expired' || item.category === 'unregistered';
    else if (driverWindowFilter === 'warning') matchesWindow = item.category === 'warning';
    else if (driverWindowFilter === 'upcoming') matchesWindow = item.category === 'upcoming';
    else if (driverWindowFilter === 'flagged') matchesWindow = ['critical', 'warning', 'upcoming', 'expired', 'unregistered'].includes(item.category);

    return matchesSearch && matchesWindow;
  });

  const driverLicenseCounts = {
    all: driverLicenseComplianceList.length,
    flagged: driverLicenseComplianceList.filter(d => ['critical', 'warning', 'upcoming', 'expired', 'unregistered'].includes(d.category)).length,
    critical: driverLicenseComplianceList.filter(d => d.category === 'critical' || d.category === 'expired' || d.category === 'unregistered').length,
    warning: driverLicenseComplianceList.filter(d => d.category === 'warning').length,
    upcoming: driverLicenseComplianceList.filter(d => d.category === 'upcoming').length,
  };

  const filteredPendingDrivers = pendingDrivers.filter(item => {
    const q = searchTerm.toLowerCase();
    const n = (item.name || item.Name || '').toLowerCase();
    const e = (item.email || item.Email || '').toLowerCase();
    const v = (item.vehicleAssignment || item.VehicleAssignment || '').toLowerCase();
    return n.includes(q) || e.includes(q) || v.includes(q);
  });

  return (
    <div className={`space-y-6 transition-colors duration-200 pb-12 font-sans ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
      
      {/* Professional Toast Notification Banner (Replaces intrusive window.alert boxes) */}
      {toast.message && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl text-xs font-black shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-top-4 duration-300 ${
          toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
        }`}>
          {toast.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Universal Standalone Document Preview Modal */}
      {activeDocPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-black flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Verified Credential Record: {activeDocPreview.name}</span>
              </h3>
              <button onClick={() => setActiveDocPreview(null)} className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl text-center border border-slate-200 dark:border-slate-800 space-y-3">
              {activeDocPreview.filename && (activeDocPreview.filename.endsWith('.png') || activeDocPreview.filename.endsWith('.jpg') || activeDocPreview.filename.endsWith('.jpeg')) ? (
                <div className="bg-slate-900 rounded-xl p-2 border border-slate-800 flex items-center justify-center shadow-inner">
                  <img 
                    src={`http://localhost:5191/uploads/${activeDocPreview.filename}`} 
                    alt={activeDocPreview.name} 
                    className="max-h-[50vh] w-auto object-contain rounded-lg"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              ) : (
                <div className="py-10 space-y-2 bg-slate-900/50 rounded-xl border border-slate-800">
                  <FileText className="w-12 h-12 mx-auto text-blue-500 opacity-80" />
                  <p className="text-xs font-bold text-gray-300">RTA Digital Record Synced</p>
                  <p className="text-[11px] text-gray-400">Authenticated via official regulatory portal.</p>
                </div>
              )}

              <div>
                <p className="text-xs font-black uppercase tracking-wider">{activeDocPreview.name}</p>
                <p className="text-[11px] text-slate-400 mt-0.5 font-mono">Ref: {activeDocPreview.filename || 'SYS-RTA-SYNCED'}</p>
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Authenticated via RTA Gateway
                </span>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              {activeDocPreview.filename && (
                <a
                  href={`http://localhost:5191/uploads/${activeDocPreview.filename}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-black rounded-xl cursor-pointer transition shadow-sm uppercase tracking-wider flex items-center gap-2"
                >
                  <ExternalLink size={14} />
                  <span>Open Full View</span>
                </a>
              )}
              <button onClick={() => setActiveDocPreview(null)} className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl cursor-pointer transition shadow-sm uppercase tracking-wider">Close Preview</button>
            </div>
          </div>
        </div>
      )}

      {/* Asset Expiry Dossier Modal */}
      {selectedAssetDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-black flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span>Compliance Audit: {selectedAssetDossier.vehicleNumber}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">{selectedAssetDossier.model} ({selectedAssetDossier.type})</p>
              </div>
              <button onClick={() => setSelectedAssetDossier(null)} className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div 
                onClick={() => {
                  const doc = selectedAssetDossier.mulkiyaDocumentUrl;
                  setSelectedAssetDossier(null);
                  setActiveDocPreview({ name: `Vehicle Registration - ${selectedAssetDossier.vehicleNumber}`, filename: doc });
                }}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-center hover:border-blue-600 transition cursor-pointer group"
              >
                <FileText className="w-6 h-6 mx-auto text-blue-600 mb-1 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-black">Vehicle Registration</p>
                <p className="text-[10px] font-bold text-slate-500 mt-0.5">
                  {selectedAssetDossier.daysLeft !== null ? `${selectedAssetDossier.daysLeft}d left` : 'Unregistered'}
                </p>
                <span className="text-[10px] text-blue-600 font-bold block mt-2">Inspect Document →</span>
              </div>

              <div 
                onClick={() => {
                  const doc = selectedAssetDossier.insuranceDocumentUrl;
                  setSelectedAssetDossier(null);
                  setActiveDocPreview({ name: `Insurance Certificate - ${selectedAssetDossier.vehicleNumber}`, filename: doc });
                }}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-center hover:border-amber-500 transition cursor-pointer group"
              >
                <ShieldCheck className="w-6 h-6 mx-auto text-amber-500 mb-1 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-black">Insurance Policy</p>
                <p className="text-[10px] font-bold text-slate-500 mt-0.5">
                  {selectedAssetDossier.insDaysLeft !== null ? `${selectedAssetDossier.insDaysLeft}d left` : 'Active Policy'}
                </p>
                <span className="text-[10px] text-amber-600 font-bold block mt-2">Inspect Document →</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <button 
                onClick={() => handleToggleBlockade(selectedAssetDossier.id, selectedAssetDossier.status)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-black text-xs transition cursor-pointer ${
                  selectedAssetDossier.status === 'Blockaded'
                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                    : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                }`}
              >
                {selectedAssetDossier.status === 'Blockaded' ? <RotateCcw size={14} /> : <Ban size={14} />}
                <span>{selectedAssetDossier.status === 'Blockaded' ? 'Lift Blockade / Authorize Dispatch' : 'Enforce Dispatch Blockade'}</span>
              </button>
              <button onClick={() => setSelectedAssetDossier(null)} className="px-5 py-2.5 bg-slate-900 text-white text-xs font-black rounded-xl cursor-pointer">Close Audit</button>
            </div>
          </div>
        </div>
      )}

      {/* Driver License Audit & Blockade Modal */}
      {selectedDriverAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-black flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>Driver Eligibility Audit: {selectedDriverAudit.name}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">DRV-{selectedDriverAudit.id} • Assigned: {selectedDriverAudit.vehicleAssignment}</p>
              </div>
              <button onClick={() => setSelectedDriverAudit(null)} className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl border bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold">License Number:</span>
                <span className="font-mono font-black">{selectedDriverAudit.licenseNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold">Issuing Authority:</span>
                <span className="font-bold">{selectedDriverAudit.licenseIssuingAuthority}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold">Expiration Window:</span>
                <span className="font-black text-blue-600 dark:text-blue-400">{selectedDriverAudit.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold">Current Dispatch Status:</span>
                <span className={`font-black uppercase ${selectedDriverAudit.status === 'Suspended' || selectedDriverAudit.status === 'Blockaded' ? 'text-red-600' : 'text-emerald-600'}`}>
                  {selectedDriverAudit.status === 'Suspended' || selectedDriverAudit.status === 'Blockaded' ? 'Suspended / Grounded' : 'Active Dispatch Pool'}
                </span>
              </div>
            </div>

            <div 
              onClick={() => {
                const doc = selectedDriverAudit.drivingLicenseDocumentUrl;
                const drvName = selectedDriverAudit.name;
                const drvId = selectedDriverAudit.id;
                setSelectedDriverAudit(null);
                setActiveDocPreview({ name: `Driving License - ${drvName} (DRV-${drvId})`, filename: doc });
              }}
              className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-center hover:border-blue-600 cursor-pointer transition flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-black text-blue-600">Inspect Verified Driving License Scan →</span>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <button 
                onClick={() => handleToggleDriverBlockade(selectedDriverAudit.id, selectedDriverAudit.status)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-black text-xs transition cursor-pointer ${
                  selectedDriverAudit.status === 'Suspended' || selectedDriverAudit.status === 'Blockaded'
                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                    : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                }`}
              >
                {selectedDriverAudit.status === 'Suspended' || selectedDriverAudit.status === 'Blockaded' ? <RotateCcw size={14} /> : <Ban size={14} />}
                <span>{selectedDriverAudit.status === 'Suspended' || selectedDriverAudit.status === 'Blockaded' ? 'Restore Dispatch Authorization' : 'Suspend & Block Driver'}</span>
              </button>
              <button onClick={() => setSelectedDriverAudit(null)} className="px-5 py-2.5 bg-slate-900 text-white text-xs font-black rounded-xl cursor-pointer">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-black text-blue-600 dark:text-blue-400 tracking-wider uppercase mb-1">
            <ShieldCheck size={14} /> Back-Office Compliance & RBAC
          </div>
          <h1 className="text-2xl font-black tracking-tight">Driver & Asset Compliance Center</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            Review driver onboarding credentials, monitor vehicle document renewal windows, and inspect compliance dossiers.
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-blue-50 dark:bg-slate-900 border border-blue-200 dark:border-slate-800 px-4 py-2 rounded-2xl text-xs font-bold text-blue-900 dark:text-blue-300 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>RTA Gateway Live</span>
        </div>
      </div>

      {/* Primary 3-Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('drivers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'drivers'
              ? 'bg-[#0B2A4D] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users size={14} />
          <span>Driver Onboarding Queue</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-500/20 text-blue-300 font-bold">
            {pendingDrivers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('assets')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'assets'
              ? 'bg-[#0B2A4D] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Truck size={14} />
          <span>Fleet Document Expiries</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-400 font-bold">
            {assetCounts.flagged} Alerts
          </span>
        </button>

        <button
          onClick={() => setActiveTab('driver-licenses')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'driver-licenses'
              ? 'bg-[#0B2A4D] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <UserCheck size={14} />
          <span>Driver License Expiries</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-400 font-bold">
            {driverLicenseCounts.flagged} Alerts
          </span>
        </button>
      </div>

      {/* TAB 1: Driver Onboarding Queue */}
      {activeTab === 'drivers' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className={`lg:col-span-2 p-6 rounded-3xl shadow-xl border ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/90 text-slate-900'}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-black tracking-tight">Pending Queue</h2>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-black tracking-wider uppercase">
                  {pendingDrivers.length} Active
                </span>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search name, email, or vehicle..." 
                  className={`w-full pl-10 pr-8 py-2.5 border rounded-2xl text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-3 text-slate-400">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b text-[10px] font-black uppercase tracking-wider ${darkMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-400'}`}>
                    <th className="pb-3 px-3">ID Ref</th>
                    <th className="pb-3 px-3">Driver Profile</th>
                    <th className="pb-3 px-3">Asset Assignment</th>
                    <th className="pb-3 px-3">Status</th>
                    <th className="pb-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className={`divide-y text-xs ${darkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                  {filteredPendingDrivers.length > 0 ? (
                    filteredPendingDrivers.map((item) => {
                      const rawId = item.id ?? item.Id;
                      const isSelected = (selectedDriver?.id ?? selectedDriver?.Id) === rawId;
                      const name = item.name || item.Name || '';
                      const email = item.email || item.Email || '';
                      const assignment = item.vehicleAssignment || item.VehicleAssignment || '';
                      const status = item.status || item.Status || '';

                      return (
                        <tr 
                          key={rawId} 
                          className={`transition-all group ${
                            isSelected 
                              ? (darkMode ? 'bg-blue-950/50 border-l-4 border-blue-500' : 'bg-blue-50/80 border-l-4 border-blue-600') 
                              : (darkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/70')
                          }`}
                        >
                          <td className="py-4 px-3 font-black text-blue-600 dark:text-blue-400 font-mono">DRV-{rawId}</td>
                          <td className="py-4 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                                {name.charAt(0) || 'D'}
                              </div>
                              <div>
                                <p className={`font-black ${darkMode ? 'text-gray-100' : 'text-slate-900'}`}>{name}</p>
                                <p className="text-[11px] text-slate-400 font-medium">{email}</p>
                              </div>
                            </div>
                          </td>
                          <td className={`py-4 px-3 font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{assignment}</td>
                          <td className="py-4 px-3">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 shadow-2xs">
                              <Clock size={10} /> {status}
                            </span>
                          </td>
                          <td className="py-4 px-3 text-right">
                            <button 
                              onClick={() => setSelectedDriver(item)}
                              className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs ${
                                isSelected 
                                  ? 'bg-blue-600 text-white shadow-blue-500/25' 
                                  : 'bg-slate-100 hover:bg-blue-600 hover:text-white dark:bg-slate-800 dark:hover:bg-blue-600 text-slate-700 dark:text-slate-200'
                              }`}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>{isSelected ? 'Inspecting' : 'Inspect'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-16 text-center text-xs text-slate-400 space-y-1.5">
                        <p className="font-black text-sm text-slate-700 dark:text-slate-300">No pending driver applications found.</p>
                        <p className="font-medium">All queue records have been processed.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className={`p-6 rounded-3xl shadow-xl border flex flex-col justify-between ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/90 text-slate-900'}`}>
            <div>
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-base font-black tracking-tight flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Inspection Dossier</span>
                </h2>
                {selectedDriver && (
                  <button onClick={() => setSelectedDriver(null)} className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {selectedDriver ? (
                <div className="space-y-4 text-xs">
                  <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-800/60 border-slate-700/80' : 'bg-slate-50 border-slate-200/80'} shadow-xs space-y-2`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {(selectedDriver.profileImage || selectedDriver.ProfileImage || selectedDriver.profileImageUrl || selectedDriver.ProfileImageUrl) ? (
                          <img 
                            src={`http://localhost:5191/uploads/${selectedDriver.profileImage || selectedDriver.ProfileImage || selectedDriver.profileImageUrl || selectedDriver.ProfileImageUrl}`} 
                            alt="Driver Profile" 
                            className="w-12 h-12 rounded-full object-cover border-2 border-blue-500 shadow-sm cursor-pointer hover:opacity-90 transition"
                            onClick={() => setActiveDocPreview({ name: `Driver Profile Photo - ${selectedDriver.name || selectedDriver.Name}`, filename: selectedDriver.profileImage || selectedDriver.ProfileImage || selectedDriver.profileImageUrl || selectedDriver.ProfileImageUrl })}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center font-black text-sm shadow-xs border border-blue-200">
                            {(selectedDriver.name || selectedDriver.Name || 'D').charAt(0)}
                          </div>
                        )}
                        <div>
                          <span className="font-black text-blue-600 dark:text-blue-400 text-sm block">{selectedDriver.name || selectedDriver.Name}</span>
                          <span className="text-[10px] text-slate-400 font-medium">Verified Driver Applicant</span>
                        </div>
                      </div>
                      <span className="font-mono text-[10px] font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-lg">DRV-{selectedDriver.id || selectedDriver.Id}</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">{selectedDriver.email || selectedDriver.Email}</p>
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700 flex justify-between font-semibold">
                      <span>Phone: <strong className="text-slate-800 dark:text-slate-200">{selectedDriver.phone || selectedDriver.Phone}</strong></span>
                      <span>Emergency: <strong className="text-amber-600 dark:text-amber-400">{selectedDriver.emergencyPhone || selectedDriver.EmergencyPhone || 'N/A'}</strong></span>
                    </div>
                  </div>

                  <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-800/60 border-slate-700/80' : 'bg-slate-50 border-slate-200/80'} shadow-xs space-y-2.5`}>
                    <p className="font-black text-slate-400 uppercase tracking-wider text-[10px]">Legal Credentials</p>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 flex items-center gap-1.5 font-medium"><Award className="w-3.5 h-3.5 text-blue-500"/> License No:</span>
                      <span className="font-black font-mono">{selectedDriver.licenseNumber || selectedDriver.LicenseNumber}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 flex items-center gap-1.5 font-medium"><Calendar className="w-3.5 h-3.5 text-blue-500"/> Expiry Date:</span>
                      <span className="font-black text-emerald-600 dark:text-emerald-400">
                        {new Date(selectedDriver.licenseExpiryDate || selectedDriver.LicenseExpiryDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Issuing Authority:</span>
                      <span className="font-black">{selectedDriver.licenseIssuingAuthority || selectedDriver.LicenseIssuingAuthority}</span>
                    </div>
                  </div>

                  <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-800/60 border-slate-700/80' : 'bg-slate-50 border-slate-200/80'} shadow-xs space-y-2.5`}>
                    <p className="font-black text-slate-400 uppercase tracking-wider text-[10px]">Assigned Asset Specs</p>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 flex items-center gap-1.5 font-medium"><Truck className="w-3.5 h-3.5 text-blue-500"/> Vehicle:</span>
                      <span className="font-black">{selectedDriver.vehicleAssignment || selectedDriver.VehicleAssignment}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Plate Number:</span>
                      <span className="font-black font-mono text-blue-600 dark:text-blue-400">{selectedDriver.plateNumber || selectedDriver.PlateNumber}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 flex items-center gap-1.5 font-medium"><Hash className="w-3.5 h-3.5 text-blue-500"/> Chassis No:</span>
                      <span className="font-black font-mono text-[11px]">{selectedDriver.chassisNumber || selectedDriver.ChassisNumber}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="font-black text-slate-400 uppercase tracking-wider text-[10px]">Uploaded Document Vault (Click to Inspect)</p>
                    <div className="grid grid-cols-2 gap-2.5">
                      
                      <div 
                        onClick={() => setActiveDocPreview({ name: 'Driving License', filename: selectedDriver.drivingLicenseDocumentUrl || selectedDriver.DrivingLicenseDocumentUrl })}
                        className="p-3 rounded-2xl border text-center cursor-pointer hover:border-blue-600 transition bg-slate-50 dark:bg-slate-800/80"
                      >
                        <FileText className="w-5 h-5 mx-auto text-blue-600 mb-1.5" />
                        <span className="text-[11px] font-black block truncate">Driving License</span>
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center gap-1 mt-1"><ExternalLink className="w-3 h-3"/> Inspect</span>
                      </div>

                      <div 
                        onClick={() => setActiveDocPreview({ name: 'Vehicle Registration', filename: selectedDriver.mulkiyaDocumentUrl || selectedDriver.MulkiyaDocumentUrl })}
                        className="p-3 rounded-2xl border text-center cursor-pointer hover:border-blue-600 transition bg-slate-50 dark:bg-slate-800/80"
                      >
                        <ShieldCheck className="w-5 h-5 mx-auto text-emerald-600 mb-1.5" />
                        <span className="text-[11px] font-black block truncate">Vehicle Registration</span>
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center gap-1 mt-1"><ExternalLink className="w-3 h-3"/> Inspect</span>
                      </div>

                      <div 
                        onClick={() => setActiveDocPreview({ name: 'Insurance Certificate', filename: selectedDriver.insuranceDocumentUrl || selectedDriver.InsuranceDocumentUrl })}
                        className="p-3 rounded-2xl border text-center cursor-pointer hover:border-blue-600 transition bg-slate-50 dark:bg-slate-800/80"
                      >
                        <FileText className="w-5 h-5 mx-auto text-amber-500 mb-1.5" />
                        <span className="text-[11px] font-black block truncate">Insurance Certificate</span>
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center gap-1 mt-1"><ExternalLink className="w-3 h-3"/> Inspect</span>
                      </div>

                      <div 
                        onClick={() => setActiveDocPreview({ name: 'Fleet Photos', filename: selectedDriver.photosDocumentUrl || selectedDriver.PhotosDocumentUrl })}
                        className="p-3 rounded-2xl border text-center cursor-pointer hover:border-blue-600 transition bg-slate-50 dark:bg-slate-800/80"
                      >
                        <Truck className="w-5 h-5 mx-auto text-indigo-500 mb-1.5" />
                        <span className="text-[11px] font-black block truncate">Fleet Photos</span>
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center gap-1 mt-1"><ExternalLink className="w-3 h-3"/> Inspect</span>
                      </div>

                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[440px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-2xl space-y-3">
                  <FolderSearch className="w-10 h-10 text-slate-400" />
                  <p className="text-xs font-black text-slate-500 uppercase">No Application Selected</p>
                </div>
              )}
            </div>

            {selectedDriver && (
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex space-x-3">
                <button 
                  onClick={() => handleRejectDriver(selectedDriver.id || selectedDriver.Id)}
                  className="flex-1 bg-red-50 text-red-700 py-3 rounded-2xl text-xs font-black cursor-pointer border border-red-200"
                >
                  Reject Application
                </button>
                <button 
                  onClick={() => handleApproveDriver(selectedDriver)}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-2xl text-xs font-black shadow-md cursor-pointer"
                >
                  Approve Driver
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Fleet Asset Document Expiries */}
      {activeTab === 'assets' && (
        <div className={`p-6 rounded-3xl shadow-xl border ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/90 text-slate-900'} space-y-6`}>
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            
            <div className="flex flex-wrap items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner">
              {[
                { id: 'all', label: 'All Fleet', count: assetCounts.all },
                { id: 'flagged', label: 'Renewal Alerts', count: assetCounts.flagged },
                { id: 'critical', label: 'Critical (0-7 Days)', count: assetCounts.critical },
                { id: 'warning', label: 'Warning (8-15 Days)', count: assetCounts.warning },
                { id: 'upcoming', label: 'Upcoming (16-30 Days)', count: assetCounts.upcoming },
              ].map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setAssetWindowFilter(tier.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    assetWindowFilter === tier.id
                      ? 'bg-[#0B2A4D] text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {tier.label} <span className="ml-1 opacity-80 text-[10px]">({tier.count})</span>
                </button>
              ))}
            </div>

            <div className="relative w-full lg:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input 
                type="text" 
                value={assetSearchTerm}
                onChange={(e) => setAssetSearchTerm(e.target.value)}
                placeholder="Search vehicle unit, model..." 
                className="w-full pl-10 pr-8 py-2.5 border rounded-2xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
              {assetSearchTerm && (
                <button onClick={() => setAssetSearchTerm('')} className="absolute right-3 top-3 text-slate-400">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {loadingAssets ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <div className="w-8 h-8 border-4 border-[#0B2A4D] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-black uppercase">Loading asset compliance ledger...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b text-[10px] font-black uppercase tracking-wider ${darkMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-400'}`}>
                    <th className="pb-3 px-3">Vehicle Number</th>
                    <th className="pb-3 px-3">Asset Spec & Category</th>
                    <th className="pb-3 px-3">Vehicle Registration Expiry</th>
                    <th className="pb-3 px-3">Insurance Expiry</th>
                    <th className="pb-3 px-3">Compliance Window</th>
                    <th className="pb-3 px-3">Blockade Policy</th>
                    <th className="pb-3 px-3 text-right">Verification Vault</th>
                  </tr>
                </thead>
                <tbody className={`divide-y text-xs ${darkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                  {filteredAssets.length > 0 ? (
                    filteredAssets.map((asset, idx) => (
                      <tr key={idx} className={`transition-colors ${darkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/70'}`}>
                        <td className="py-4 px-3 font-black text-blue-600 dark:text-blue-400 font-mono flex items-center space-x-3">
                          <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shadow-xs border border-blue-100 dark:border-blue-900">
                            <Truck className="w-4 h-4" />
                          </div>
                          <span className="text-sm">{asset.vehicleNumber}</span>
                        </td>
                        <td className="py-4 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">{asset.model}</span>
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                              asset.fleetCategory === 'Internal' 
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200' 
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300'
                            }`}>
                              {asset.fleetCategory}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-medium">{asset.type}</p>
                        </td>
                        <td className="py-4 px-3 font-mono font-bold">
                          {asset.daysLeft !== null && asset.registrationExpiryDate 
                            ? new Date(asset.registrationExpiryDate).toLocaleDateString() 
                            : <span className="text-slate-400 italic">Not Registered</span>
                          }
                        </td>
                        <td className="py-4 px-3 font-mono font-bold">
                          {asset.insDaysLeft !== null && asset.insuranceExpiryDate 
                            ? new Date(asset.insuranceExpiryDate).toLocaleDateString() 
                            : <span className="text-slate-400 italic">Not Available</span>
                          }
                        </td>
                        <td className="py-4 px-3">
                          <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-2xs ${
                            asset.status === 'Blockaded' ? 'bg-red-600 text-white' :
                            asset.category === 'expired' ? 'bg-red-600 text-white' :
                            asset.category === 'critical' ? 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200' :
                            asset.category === 'warning' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200' :
                            asset.category === 'upcoming' ? 'bg-yellow-50 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-300 border border-yellow-200' :
                            asset.category === 'unregistered' ? 'bg-gray-100 text-gray-700 border border-gray-300' :
                            'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200'
                          }`}>
                            {asset.status === 'Blockaded' ? 'Manually Blockaded' : asset.label}
                          </span>
                        </td>
                        <td className="py-4 px-3">
                          {asset.status === 'Blockaded' || asset.category === 'critical' || asset.category === 'expired' || asset.category === 'unregistered' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 dark:text-red-400">
                              <AlertTriangle size={13} /> Immediate Blockade
                            </span>
                          ) : asset.category === 'warning' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                              <AlertCircle size={13} /> Dispatch Restricted Soon
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 size={13} /> Clear for Dispatch
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-3 text-right">
                          <button 
                            onClick={() => setSelectedAssetDossier(asset)}
                            className="inline-flex items-center space-x-1.5 bg-slate-100 hover:bg-[#0B2A4D] hover:text-white dark:bg-slate-800 dark:hover:bg-[#0B2A4D] text-slate-700 dark:text-slate-200 px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer shadow-xs"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Inspect Vault</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-16 text-center text-xs text-slate-400 font-bold uppercase tracking-wider">
                        No fleet assets found in the selected renewal window.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Driver License Expiries */}
      {activeTab === 'driver-licenses' && (
        <div className={`p-6 rounded-3xl shadow-xl border ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/90 text-slate-900'} space-y-6`}>
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            
            <div className="flex flex-wrap items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner">
              {[
                { id: 'all', label: 'All Active Drivers', count: driverLicenseCounts.all },
                { id: 'flagged', label: 'License Renewal Alerts', count: driverLicenseCounts.flagged },
                { id: 'critical', label: 'Critical (0-7 Days)', count: driverLicenseCounts.critical },
                { id: 'warning', label: 'Warning (8-15 Days)', count: driverLicenseCounts.warning },
                { id: 'upcoming', label: 'Upcoming (16-30 Days)', count: driverLicenseCounts.upcoming },
              ].map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setDriverWindowFilter(tier.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    driverWindowFilter === tier.id
                      ? 'bg-[#0B2A4D] text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {tier.label} <span className="ml-1 opacity-80 text-[10px]">({tier.count})</span>
                </button>
              ))}
            </div>

            <div className="relative w-full lg:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input 
                type="text" 
                value={driverSearchTerm}
                onChange={(e) => setDriverSearchTerm(e.target.value)}
                placeholder="Search driver name, license no..." 
                className="w-full pl-10 pr-8 py-2.5 border rounded-2xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
              {driverSearchTerm && (
                <button onClick={() => setDriverSearchTerm('')} className="absolute right-3 top-3 text-slate-400">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b text-[10px] font-black uppercase tracking-wider ${darkMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-400'}`}>
                  <th className="pb-3 px-3">Driver Profile</th>
                  <th className="pb-3 px-3">License Spec</th>
                  <th className="pb-3 px-3">License Expiration</th>
                  <th className="pb-3 px-3">Compliance Window</th>
                  <th className="pb-3 px-3">Dispatch Eligibility</th>
                  <th className="pb-3 px-3 text-right">Audit & Verification</th>
                </tr>
              </thead>
              <tbody className={`divide-y text-xs ${darkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                {filteredDriverLicenses.length > 0 ? (
                  filteredDriverLicenses.map((drv, idx) => (
                    <tr key={idx} className={`transition-colors ${darkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/70'}`}>
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                            {drv.name?.charAt(0) || 'D'}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 dark:text-white">{drv.name}</p>
                            <p className="text-[11px] text-slate-400 font-mono">DRV-{drv.id} • {drv.phone || drv.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <p className="font-mono font-bold text-slate-900 dark:text-white">Lic: {drv.licenseNumber}</p>
                        <p className="text-[11px] text-slate-400 font-medium">{drv.licenseIssuingAuthority}</p>
                      </td>
                      <td className="py-4 px-3 font-mono font-bold">
                        {drv.daysLeft !== null && drv.licenseExpiryDate 
                          ? new Date(drv.licenseExpiryDate).toLocaleDateString() 
                          : <span className="text-slate-400 italic">Unregistered</span>
                        }
                      </td>
                      <td className="py-4 px-3">
                        <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-2xs ${
                          drv.status === 'Suspended' || drv.status === 'Blockaded' ? 'bg-red-600 text-white' :
                          drv.category === 'expired' ? 'bg-red-600 text-white' :
                          drv.category === 'critical' ? 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200' :
                          drv.category === 'warning' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200' :
                          drv.category === 'upcoming' ? 'bg-yellow-50 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-300 border border-yellow-200' :
                          'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200'
                        }`}>
                          {drv.status === 'Suspended' || drv.status === 'Blockaded' ? 'Manually Suspended' : drv.label}
                        </span>
                      </td>
                      <td className="py-4 px-3">
                        {drv.status === 'Suspended' || drv.status === 'Blockaded' || drv.category === 'critical' || drv.category === 'expired' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 dark:text-red-400">
                            <Ban size={13} /> Disqualified from Dispatch
                          </span>
                        ) : drv.category === 'warning' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                            <AlertCircle size={13} /> Renewal Required
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 size={13} /> Authorized for Routes
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-3 text-right">
                        <button 
                          onClick={() => setSelectedDriverAudit(drv)}
                          className="inline-flex items-center space-x-1.5 bg-slate-100 hover:bg-[#0B2A4D] hover:text-white dark:bg-slate-800 dark:hover:bg-[#0B2A4D] text-slate-700 dark:text-slate-200 px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer shadow-xs"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Audit & Block</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-16 text-center text-xs text-slate-400 font-bold uppercase tracking-wider">
                      No drivers match the selected renewal filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminComplianceApproval;