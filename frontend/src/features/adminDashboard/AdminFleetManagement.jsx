import React, { useState, useEffect } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Truck, ShieldCheck, X, FileText, Eye, Search, Plus, UploadCloud, CheckCircle, Trash2 } from 'lucide-react';

const AdminFleetManagement = () => {
  const { darkMode } = useOutletContext();
  const [searchParams] = useSearchParams();
  const filterQuery = searchParams.get('filter');

  const [selectedVehicleDetails, setSelectedVehicleDetails] = useState(null);
  const [activeDocPreview, setActiveDocPreview] = useState(null);
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Initialize filter state directly from URL query param if present
  const [statusFilter, setStatusFilter] = useState(
    filterQuery ? filterQuery : 'All'
  );
  
  const [fleetInventory, setFleetInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Asset Form State
  const [newAssetForm, setNewAssetForm] = useState({
    vehicleNumber: '',
    model: '',
    type: 'Water Tanker',
    capacity: '',
    chassisNumber: '',
    yearOfManufacture: new Date().getFullYear(),
    fleetCategory: 'Internal'
  });
  const [mulkiyaFile, setMulkiyaFile] = useState(null);
  const [insuranceFile, setInsuranceFile] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchFleetData();
  }, []);

  // Sync state whenever the URL search param changes
  useEffect(() => {
    if (filterQuery) {
      // Capitalize first letter to match tab names (e.g., "dispatched" -> "Dispatched")
      const formatted = filterQuery.charAt(0).toUpperCase() + filterQuery.slice(1);
      setStatusFilter(formatted);
    }
  }, [filterQuery]);

  const fetchFleetData = async () => {
    try {
      setIsLoading(true);
      const vehiclesRes = await axios.get('http://localhost:5191/api/vehicles');

      const formattedVehicles = vehiclesRes.data.map(v => {
        const typeLower = (v.type || '').toLowerCase();
        const modelLower = (v.model || '').toLowerCase();
        
        let formattedCapacity = `${v.capacity} Gallons`;
        if (typeLower.includes('loading') || typeLower.includes('flatbed') || modelLower.includes('flatbed')) {
          formattedCapacity = `${v.capacity} Tons Payload`;
        } else if (typeLower.includes('recovery') || typeLower.includes('towing') || modelLower.includes('towing')) {
          formattedCapacity = `${v.capacity} Tow Rating`;
        } else if (!typeLower.includes('tanker')) {
          formattedCapacity = `${v.capacity} Units`;
        }

        return {
          id: v.id,
          vehicleNumber: v.vehicleNumber || v.VehicleNumber || `V-00${v.id}`,
          model: v.model || v.Model || 'Standard Asset',
          type: v.type || v.Type || 'Utility Vehicle',
          capacity: formattedCapacity,
          status: v.status || v.Status || 'Available',
          fleetCategory: v.fleetCategory || v.FleetCategory || 'Internal',
          mulkiyaDocumentUrl: v.mulkiyaDocumentUrl || v.MulkiyaDocumentUrl || '',
          insuranceDocumentUrl: v.insuranceDocumentUrl || v.InsuranceDocumentUrl || '',
          vehiclePhotoUrl: v.vehiclePhotoUrl || v.VehiclePhotoUrl || ''
        };
      });

      setFleetInventory(formattedVehicles);
    } catch (error) {
      console.error("Error fetching database fleet data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAsset = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      
      const formData = new FormData();
      formData.append('vehicleNumber', newAssetForm.vehicleNumber);
      formData.append('model', newAssetForm.model);
      formData.append('type', newAssetForm.type);
      formData.append('capacity', parseInt(newAssetForm.capacity) || 5000);
      formData.append('chassisNumber', newAssetForm.chassisNumber || 'CHASSIS-000');
      formData.append('yearOfManufacture', parseInt(newAssetForm.yearOfManufacture) || 2026);
      formData.append('status', 'Available');
      formData.append('insurancePolicyNumber', 'POL-SYSTEM-AUTO');
      formData.append('insuranceExpiryDate', new Date().toISOString());
      formData.append('mulkiyaNumber', 'MUL-SYSTEM-AUTO');
      formData.append('registrationExpiryDate', new Date().toISOString());
      formData.append('fleetCategory', newAssetForm.fleetCategory);
      formData.append('isCompliant', 'true');

      if (mulkiyaFile) formData.append('mulkiyaDocument', mulkiyaFile);
      if (insuranceFile) formData.append('insuranceDocument', insuranceFile);
      if (photoFile) formData.append('vehiclePhoto', photoFile);

      await axios.post('http://localhost:5191/api/vehicles', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('New fleet asset successfully registered to database inventory!');
      setIsAddAssetModalOpen(false);
      setNewAssetForm({
        vehicleNumber: '', model: '', type: 'Water Tanker', capacity: '',
        chassisNumber: '', yearOfManufacture: new Date().getFullYear(),
        fleetCategory: 'Internal'
      });
      setMulkiyaFile(null);
      setInsuranceFile(null);
      setPhotoFile(null);
      fetchFleetData();
    } catch (error) {
      console.error("Error creating asset:", error);
      alert("Failed to register new asset on the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDecommissionAsset = async (vehicleId) => {
    if (!window.confirm("Are you sure you want to decommission this fleet asset? It will be archived from active operations.")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5191/api/vehicles/${vehicleId}`);
      alert("Fleet asset successfully decommissioned.");
      setSelectedVehicleDetails(null);
      fetchFleetData();
    } catch (error) {
      console.error("Error deleting asset:", error);
      alert("Failed to decommission asset from the server.");
    }
  };

  // Filter supporting search as well as All / Available / Dispatched / Rented
  const filteredInventory = fleetInventory.filter(veh => {
    const query = searchTerm.toLowerCase().trim();
    const statusLower = (veh.status || '').toLowerCase();
    
    const vehicleNum = veh.vehicleNumber ? String(veh.vehicleNumber).toLowerCase() : '';
    const vehicleModel = veh.model ? String(veh.model).toLowerCase() : '';
    const vehicleType = veh.type ? String(veh.type).toLowerCase() : '';
    const vehicleId = veh.id !== undefined && veh.id !== null ? String(veh.id).toLowerCase() : '';
    const paddedId = veh.id !== undefined && veh.id !== null ? `v-00${veh.id}`.toLowerCase() : '';

    const matchesSearch = 
      vehicleNum.includes(query) ||
      vehicleModel.includes(query) ||
      vehicleType.includes(query) ||
      vehicleId.includes(query) ||
      paddedId.includes(query);
    
    let matchesStatus = true;
    if (statusFilter && statusFilter.toLowerCase() !== 'all') {
      matchesStatus = statusLower === statusFilter.toLowerCase();
    }

    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    All: fleetInventory.length,
    Available: fleetInventory.filter(v => v.status.toLowerCase() === 'available').length,
    Dispatched: fleetInventory.filter(v => v.status.toLowerCase() === 'dispatched').length,
    Rented: fleetInventory.filter(v => v.status.toLowerCase() === 'rented').length,
  };

  return (
    <div className={`space-y-6 transition-colors duration-200 pb-12 font-sans ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
      
      {/* Document Inspector Popup Modal */}
      {activeDocPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-black flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Verified Credential Record: {activeDocPreview.name}</span>
              </h3>
              <button onClick={() => setActiveDocPreview(null)} className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl text-center border border-slate-200 dark:border-slate-800 space-y-3">
              {activeDocPreview.filename && activeDocPreview.filename.trim() !== '' ? (
                <div className="bg-slate-900 rounded-xl p-2 border border-slate-800 flex items-center justify-center shadow-inner">
                  <img 
                    src={`http://localhost:5191/uploads/${activeDocPreview.filename}`} 
                    alt={activeDocPreview.name} 
                    className="max-h-[50vh] w-auto object-contain rounded-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="py-10 space-y-2 bg-slate-900/50 rounded-xl border border-slate-800">
                  <FileText className="w-12 h-12 mx-auto text-blue-600 dark:text-blue-400 opacity-80" />
                  <p className="text-xs font-bold text-gray-300">No Document File Attached</p>
                </div>
              )}

              <div>
                <p className="text-xs font-black uppercase tracking-wider">{activeDocPreview.name}</p>
                <p className="text-[11px] text-slate-400 mt-0.5 font-mono">Ref: {activeDocPreview.filename || 'None'}</p>
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Authenticated via RTA Gateway
                </span>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button onClick={() => setActiveDocPreview(null)} className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl cursor-pointer transition shadow-sm uppercase tracking-wider">Close Preview</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-black text-blue-600 dark:text-blue-400 tracking-wider uppercase mb-1">
            <Truck size={14} /> Fleet & Asset Control
          </div>
          <h1 className="text-2xl font-black tracking-tight">Master Fleet Inventory</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            Monitor active corporate fleet units, inspect system-synced operational statuses, and manage physical asset compliance documents.
          </p>
        </div>

        <button 
          onClick={() => setIsAddAssetModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-[#0B2A4D] hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-md transition cursor-pointer uppercase tracking-wider shrink-0"
        >
          <Plus size={15} /> Register New Asset
        </button>
      </div>

      {/* Main Table */}
      {isLoading ? (
        <div className={`p-16 text-center rounded-3xl border shadow-lg ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>
          <div className="w-8 h-8 border-4 border-[#0B2A4D] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-black uppercase tracking-wider">Loading Fleet Database Records...</p>
        </div>
      ) : (
        <div className={`p-6 rounded-3xl shadow-xl border ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/90 text-slate-900'} space-y-6`}>
          
          {/* Filter Pills & Search */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner">
              {['All', 'Available', 'Dispatched', 'Rented'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    statusFilter.toLowerCase() === status.toLowerCase()
                      ? 'bg-[#0B2A4D] text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {status} <span className="ml-1 opacity-80 text-[10px]">({statusCounts[status] ?? 0})</span>
                </button>
              ))}
            </div>

            <div className="relative w-full lg:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search vehicle number, model..." 
                className={`w-full pl-10 pr-8 py-2.5 border rounded-2xl text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[#0B2A4D] ${
                  darkMode 
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400' 
                    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                }`}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b text-[10px] font-black uppercase tracking-wider ${darkMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-400'}`}>
                  <th className="pb-3 px-3">Vehicle Number</th>
                  <th className="pb-3 px-3">Model & Type</th>
                  <th className="pb-3 px-3">Capacity / Rating</th>
                  <th className="pb-3 px-3">Operational Status</th>
                  <th className="pb-3 px-3">Document Vault</th>
                  <th className="pb-3 px-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className={`divide-y text-xs ${darkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                {filteredInventory.length > 0 ? (
                  filteredInventory.map((veh, idx) => (
                    <tr key={idx} className={`transition-colors ${darkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/70'}`}>
                      <td className="py-4 px-3 font-black text-blue-600 dark:text-blue-400 font-mono flex items-center space-x-3">
                        <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shadow-xs border border-blue-100 dark:border-blue-900">
                          <Truck className="w-4 h-4" />
                        </div>
                        <span className="text-sm">{veh.vehicleNumber}</span>
                      </td>
                      <td className="py-4 px-3">
                        <p className="font-bold text-slate-900 dark:text-white">{veh.model}</p>
                        <p className="text-[11px] text-slate-400 font-medium">{veh.type}</p>
                      </td>
                      <td className="py-4 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">{veh.capacity}</td>
                      <td className="py-4 px-3">
                        <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-2xs ${
                          veh.status.toLowerCase() === 'available' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200' :
                          veh.status.toLowerCase() === 'rented' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200'
                        }`}>
                          {veh.status}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-slate-600 dark:text-slate-300 font-semibold">
                        <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-sans font-bold">
                          <ShieldCheck size={14} /> Linked to Vault
                        </span>
                      </td>
                      <td className="py-4 px-3 text-right">
                        <button 
                          onClick={() => setSelectedVehicleDetails(veh)}
                          className="inline-flex items-center space-x-1.5 bg-slate-100 hover:bg-[#0B2A4D] hover:text-white dark:bg-slate-800 dark:hover:bg-[#0B2A4D] text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect Asset</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-16 text-center text-xs text-slate-400 font-bold uppercase tracking-wider">
                      No fleet assets match your search or status filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add New Asset Modal */}
      {isAddAssetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`rounded-3xl max-w-xl w-full p-8 shadow-2xl border space-y-5 ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-black text-sm uppercase tracking-wider">Register New Fleet Asset</h3>
                <p className="text-xs text-slate-400 mt-0.5">Provision a new commercial vehicle and attach its verification documents.</p>
              </div>
              <button onClick={() => setIsAddAssetModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="space-y-4 text-xs font-medium">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider mb-1 text-slate-400">Vehicle Number / Plate</label>
                  <input 
                    type="text" required
                    value={newAssetForm.vehicleNumber}
                    onChange={(e) => setNewAssetForm({...newAssetForm, vehicleNumber: e.target.value})}
                    placeholder="e.g., V-5000T or DXB-9981" 
                    className={`w-full p-3 rounded-2xl border text-xs font-bold ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider mb-1 text-slate-400">Model & Specification</label>
                  <input 
                    type="text" required
                    value={newAssetForm.model}
                    onChange={(e) => setNewAssetForm({...newAssetForm, model: e.target.value})}
                    placeholder="e.g., Mercedes-Benz Actros 5000G" 
                    className={`w-full p-3 rounded-2xl border text-xs font-bold ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider mb-1 text-slate-400">Fleet Type</label>
                  <select 
                    value={newAssetForm.type}
                    onChange={(e) => setNewAssetForm({...newAssetForm, type: e.target.value})}
                    className={`w-full p-3 rounded-2xl border text-xs font-bold ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  >
                    <option value="Water Tanker">Water Tanker</option>
                    <option value="Loading Asset">Loading Asset / Flatbed</option>
                    <option value="Recovery Asset">Recovery & Towing</option>
                    <option value="Cargo Transport">Industrial Cargo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider mb-1 text-slate-400">Capacity / Rating</label>
                  <input 
                    type="number" required
                    value={newAssetForm.capacity}
                    onChange={(e) => setNewAssetForm({...newAssetForm, capacity: e.target.value})}
                    placeholder="e.g., 5000" 
                    className={`w-full p-3 rounded-2xl border text-xs font-bold ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider mb-1 text-slate-400">Manufacture Year</label>
                  <input 
                    type="number" required
                    value={newAssetForm.yearOfManufacture}
                    onChange={(e) => setNewAssetForm({...newAssetForm, yearOfManufacture: e.target.value})}
                    className={`w-full p-3 rounded-2xl border text-xs font-bold ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider mb-1 text-slate-400">Chassis Number</label>
                <input 
                  type="text" required
                  value={newAssetForm.chassisNumber}
                  onChange={(e) => setNewAssetForm({...newAssetForm, chassisNumber: e.target.value})}
                  placeholder="Enter unique chassis identifier" 
                  className={`w-full p-3 rounded-2xl border text-xs font-bold ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                />
              </div>

              {/* Upload Dropzones */}
              <div className="space-y-2 pt-1">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Required Vehicle Verification Documents</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  
                  <label className={`border-2 border-dashed rounded-2xl p-3 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1.5 ${
                    mulkiyaFile ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300' : 'border-slate-200 dark:border-slate-700 hover:border-blue-600 bg-slate-50 dark:bg-slate-800/40 text-slate-500'
                  }`}>
                    {mulkiyaFile ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <UploadCloud className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider">{mulkiyaFile ? 'Mulkiya Attached' : 'Upload Mulkiya'}</p>
                      <p className="text-[9px] text-slate-400 truncate max-w-[120px]">{mulkiyaFile ? mulkiyaFile.name : 'PDF, JPG or PNG'}</p>
                    </div>
                    <input type="file" onChange={(e) => setMulkiyaFile(e.target.files[0])} className="hidden" />
                  </label>

                  <label className={`border-2 border-dashed rounded-2xl p-3 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1.5 ${
                    insuranceFile ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300' : 'border-slate-200 dark:border-slate-700 hover:border-blue-600 bg-slate-50 dark:bg-slate-800/40 text-slate-500'
                  }`}>
                    {insuranceFile ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <UploadCloud className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider">{insuranceFile ? 'Insurance Attached' : 'Upload Insurance'}</p>
                      <p className="text-[9px] text-slate-400 truncate max-w-[120px]">{insuranceFile ? insuranceFile.name : 'PDF, JPG or PNG'}</p>
                    </div>
                    <input type="file" onChange={(e) => setInsuranceFile(e.target.files[0])} className="hidden" />
                  </label>

                  <label className={`border-2 border-dashed rounded-2xl p-3 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1.5 ${
                    photoFile ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300' : 'border-slate-200 dark:border-slate-700 hover:border-blue-600 bg-slate-50 dark:bg-slate-800/40 text-slate-500'
                  }`}>
                    {photoFile ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <UploadCloud className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider">{photoFile ? 'Photo Attached' : 'Upload Vehicle Photo'}</p>
                      <p className="text-[9px] text-slate-400 truncate max-w-[120px]">{photoFile ? photoFile.name : 'JPG or PNG'}</p>
                    </div>
                    <input type="file" onChange={(e) => setPhotoFile(e.target.files[0])} className="hidden" />
                  </label>

                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setIsAddAssetModalOpen(false)} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-bold uppercase tracking-wider text-xs cursor-pointer">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-[#0B2A4D] hover:bg-slate-800 text-white rounded-2xl font-black uppercase tracking-wider text-xs cursor-pointer shadow-md transition">
                  {isSubmitting ? 'Registering...' : 'Save & Provision Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Asset Inspection Modal */}
      {selectedVehicleDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`rounded-3xl max-w-xl w-full p-8 shadow-2xl border space-y-5 ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-black text-sm uppercase tracking-wider">Asset Inspection & Document Vault</h3>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-mono mt-0.5 font-bold">Vehicle Unit: {selectedVehicleDetails.vehicleNumber}</p>
              </div>
              <button onClick={() => setSelectedVehicleDetails(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800"><span className="text-slate-400 font-bold">Model & Specification:</span><span className="font-black text-slate-900 dark:text-white">{selectedVehicleDetails.model}</span></div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800"><span className="text-slate-400 font-bold">Fleet Type:</span><span className="font-black text-slate-900 dark:text-white">{selectedVehicleDetails.type}</span></div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800"><span className="text-slate-400 font-bold">Capacity / Rating:</span><span className="font-black font-mono text-slate-900 dark:text-white">{selectedVehicleDetails.capacity}</span></div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800"><span className="text-slate-400 font-bold">Operational Status:</span><span className="font-black text-emerald-600 dark:text-emerald-400 uppercase">{selectedVehicleDetails.status} (System Managed)</span></div>
            </div>

            {/* Document Vault Grid */}
            <div className="space-y-2 pt-2">
              <p className="font-black text-slate-400 uppercase tracking-wider text-[10px]">Vehicle Verification Document Vault</p>
              <div className="grid grid-cols-3 gap-3">

                <div 
                  onClick={() => setActiveDocPreview({ name: 'Vehicle Mulkiya', filename: selectedVehicleDetails.mulkiyaDocumentUrl })}
                  className={`p-3 rounded-2xl border text-center cursor-pointer transition-all hover:border-blue-600 hover:shadow-md group ${darkMode ? 'bg-slate-800/80 border-slate-700 text-gray-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                >
                  <FileText className="w-5 h-5 mx-auto text-emerald-600 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-black block truncate">Mulkiya</span>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold block mt-0.5">View Document</span>
                </div>

                <div 
                  onClick={() => setActiveDocPreview({ name: 'Insurance Certificate', filename: selectedVehicleDetails.insuranceDocumentUrl })}
                  className={`p-3 rounded-2xl border text-center cursor-pointer transition-all hover:border-blue-600 hover:shadow-md group ${darkMode ? 'bg-slate-800/80 border-slate-700 text-gray-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                >
                  <FileText className="w-5 h-5 mx-auto text-amber-500 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-black block truncate">Insurance</span>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold block mt-0.5">View Document</span>
                </div>

                <div 
                  onClick={() => setActiveDocPreview({ name: 'Fleet Asset Photos', filename: selectedVehicleDetails.vehiclePhotoUrl })}
                  className={`p-3 rounded-2xl border text-center cursor-pointer transition-all hover:border-blue-600 hover:shadow-md group ${darkMode ? 'bg-slate-800/80 border-slate-700 text-gray-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                >
                  <Truck className="w-5 h-5 mx-auto text-indigo-500 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-black block truncate">Asset Photo</span>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold block mt-0.5">View Photo</span>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => handleDecommissionAsset(selectedVehicleDetails.id)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 rounded-2xl font-black text-xs transition cursor-pointer border border-red-200 dark:border-red-900 uppercase tracking-wider"
              >
                <Trash2 size={14} /> Decommission Asset
              </button>

              <button 
                onClick={() => setSelectedVehicleDetails(null)} 
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black transition shadow-md cursor-pointer uppercase tracking-wider text-xs"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFleetManagement;