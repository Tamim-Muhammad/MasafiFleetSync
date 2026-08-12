import React, { useState } from 'react';
import { Truck, Calendar, Wrench, Shield, CheckCircle, Clock, X, Edit3, FileText, Download } from 'lucide-react';

const AdminFleetManagement = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [selectedLease, setSelectedLease] = useState(null);
  
  const [fleetInventory, setFleetInventory] = useState([
    { id: 'T-012', class: '5000 Gallon Water Tanker', plate: 'Fujairah 49201', status: 'Active', assignedDriver: 'Ahmed Al-Mazrouei', notes: 'Routine operations clear.' },
    { id: 'T-019', class: '1000 Gallon Water Tanker', plate: 'Masafi 11820', status: 'Active', assignedDriver: 'Salim Al-Ketbi', notes: 'Assigned to Masafi rural zone.' },
    { id: 'T-045', class: '5000 Gallon Water Tanker', plate: 'Fujairah 99182', status: 'Rented', assignedDriver: 'B2B Contractor Lease', notes: 'Active contract with Fujairah Infrastructure.' },
    { id: 'T-088', class: 'Heavy Loading Vehicle', plate: 'Sharjah 55431', status: 'In Maintenance', assignedDriver: 'Workshop Yard', notes: 'Hydraulic pump overhaul in progress.' },
  ]);

  const [b2bLeases, setB2bLeases] = useState([
    { id: 'LEASE-901', asset: 'T-045', client: 'Fujairah Infrastructure Corp', duration: '15 Days (Active)', status: 'Active', deposit: 'Verified', value: 'AED 45,000' },
    { id: 'LEASE-902', asset: 'T-019', client: 'Masafi Agricultural Group', duration: '30 Days (Pending Activation)', status: 'Pending Activation', deposit: 'Awaiting Deposit', value: 'AED 80,000' },
  ]);

  const handleSaveState = (e) => {
    e.preventDefault();
    setFleetInventory(prev => 
      prev.map(item => item.id === editingVehicle.id ? editingVehicle : item)
    );
    alert(`Vehicle ${editingVehicle.id} state successfully updated and synced across dispatch matrices!`);
    setEditingVehicle(null);
  };

  // Synchronized bidirectional binding: Activating deposit locks inventory status to 'Rented'
  const handleApproveDeposit = (leaseId, assetId) => {
    setB2bLeases(prev => prev.map(l => l.id === leaseId ? { ...l, status: 'Active (Synced)', deposit: 'Verified' } : l));
    
    // Automatically flag inventory asset as Rented so dispatcher dropdown blocks it
    setFleetInventory(prev => prev.map(veh => veh.id === assetId ? { ...veh, status: 'Rented', assignedDriver: 'B2B Lease Active' } : veh));

    alert(`Deposit confirmed! Lease ${leaseId} is now active and locked as Rented in the inventory.`);
    setSelectedLease(null);
  };

  return (
    <div className="space-y-6 relative">
      <div className="bg-[#0B2A4D] p-6 rounded-2xl shadow-md text-white flex flex-col md:flex-row md:items-center md:justify-between border border-blue-950">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fleet Inventory & Rental Management</h1>
          <p className="text-sm text-blue-200 mt-1">Manage asset states, sync rental calendars, and monitor workshop maintenance logs for Al-Waqar Transport.</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'inventory' ? 'bg-blue-600 text-white shadow-sm' : 'bg-blue-950/60 text-blue-200 hover:bg-blue-900'
            }`}
          >
            Master Inventory
          </button>
          <button 
            onClick={() => setActiveTab('rentals')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'rentals' ? 'bg-blue-600 text-white shadow-sm' : 'bg-blue-950/60 text-blue-200 hover:bg-blue-900'
            }`}
          >
            B2B Rental Calendar
          </button>
        </div>
      </div>

      {activeTab === 'inventory' ? (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Complete Company Fleet Assets</h2>
            <span className="text-xs text-gray-500 font-semibold">Total Units: {fleetInventory.length} Active Classes</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase">
                  <th className="pb-3">Vehicle ID</th>
                  <th className="pb-3">Fleet Class</th>
                  <th className="pb-3">Registration Plate</th>
                  <th className="pb-3">Operational Status</th>
                  <th className="pb-3">Assignment / Leasee</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {fleetInventory.map((veh, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="py-3 font-semibold text-gray-800 flex items-center space-x-2">
                      <Truck className="w-4 h-4 text-blue-500" />
                      <span>{veh.id}</span>
                    </td>
                    <td className="py-3 text-gray-600">{veh.class}</td>
                    <td className="py-3 text-gray-500 font-mono text-xs">{veh.plate}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        veh.status === 'Active' ? 'bg-emerald-50 text-emerald-700' :
                        veh.status === 'Rented' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {veh.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-600 text-xs">{veh.assignedDriver}</td>
                    <td className="py-3 text-right">
                      <button 
                        onClick={() => setEditingVehicle({ ...veh })}
                        className="inline-flex items-center space-x-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit State</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-gray-800">B2B Lease Availability & Contracts</h2>
            <button 
              onClick={() => alert('B2B Lease calendar successfully synchronized with accounting & logistics database.')}
              className="text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition cursor-pointer"
            >
              Sync Active Contracts
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {b2bLeases.map((lease, idx) => (
              <div 
                key={idx} 
                onClick={() => setSelectedLease(lease)}
                className="p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-blue-600">{lease.asset} Lease</span>
                    <span className="text-xs font-mono font-semibold text-gray-500">{lease.value}</span>
                  </div>
                  <h4 className="font-bold text-gray-800 text-base mt-1">{lease.client}</h4>
                  <p className="text-xs text-gray-500 mt-1">Duration: {lease.duration}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-200/60 flex justify-between items-center">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                    lease.deposit === 'Verified' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {lease.deposit}
                  </span>
                  <span className="text-xs font-bold text-blue-600 flex items-center space-x-1">
                    <span>Manage Lease</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {editingVehicle && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Update Fleet Asset State & Metadata</h3>
                <p className="text-xs text-blue-600 font-mono mt-0.5">Asset ID: {editingVehicle.id} — [{editingVehicle.class}]</p>
              </div>
              <button onClick={() => setEditingVehicle(null)} className="text-gray-400 hover:text-gray-700 p-1.5 rounded-xl hover:bg-gray-50 transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveState} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Registration Plate</label>
                  <input type="text" value={editingVehicle.plate} onChange={(e) => setEditingVehicle({...editingVehicle, plate: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0B2A4D]" />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Operational Status</label>
                  <select value={editingVehicle.status} onChange={(e) => setEditingVehicle({...editingVehicle, status: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0B2A4D]">
                    <option value="Active">Active (Available for Dispatch)</option>
                    <option value="Rented">Rented (B2B Contract Lease)</option>
                    <option value="In Maintenance">In Maintenance (Workshop Yard)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Assigned Driver / Leasee Entity</label>
                <input type="text" value={editingVehicle.assignedDriver} onChange={(e) => setEditingVehicle({...editingVehicle, assignedDriver: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0B2A4D]" />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Maintenance / Operational Notes</label>
                <textarea rows="3" value={editingVehicle.notes} onChange={(e) => setEditingVehicle({...editingVehicle, notes: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0B2A4D]" placeholder="Enter remarks regarding workshop status or lease terms..." />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setEditingVehicle(null)} className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition cursor-pointer">Cancel</button>
                <button type="submit" className="bg-[#0B2A4D] hover:bg-blue-900 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-sm cursor-pointer">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedLease && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in duration-200 text-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">B2B Contract & Lease Management</h3>
                <p className="text-blue-600 font-mono mt-0.5">{selectedLease.id} — {selectedLease.client}</p>
              </div>
              <button onClick={() => setSelectedLease(null)} className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-50 transition cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-3 text-gray-600">
              <div className="flex justify-between py-1 border-b border-gray-50"><span className="text-gray-400">Assigned Asset:</span><span className="font-semibold text-gray-800">{selectedLease.asset}</span></div>
              <div className="flex justify-between py-1 border-b border-gray-50"><span className="text-gray-400">Contract Value:</span><span className="font-semibold text-gray-800">{selectedLease.value}</span></div>
              <div className="flex justify-between py-1 border-b border-gray-50"><span className="text-gray-400">Deposit Status:</span><span className="font-semibold text-emerald-600">{selectedLease.deposit}</span></div>
            </div>

            <div className="pt-2 flex flex-col space-y-2">
              <button onClick={() => alert(`Downloading official PDF contract for ${selectedLease.client}...`)} className="w-full flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-bold transition cursor-pointer"><Download className="w-4 h-4" /><span>Download Signed PDF Contract</span></button>
              {selectedLease.deposit !== 'Verified' && (
                <button onClick={() => handleApproveDeposit(selectedLease.id, selectedLease.asset)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold transition shadow-sm cursor-pointer">
                  Verify Deposit & Activate Lease
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFleetManagement;