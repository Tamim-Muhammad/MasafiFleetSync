import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { Users, Shield, UserCheck, UserX, Lock, Key, X, Plus, Search, Filter } from 'lucide-react';

const AdminUsersRoles = () => {
  const { darkMode } = useOutletContext();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [systemUsers, setSystemUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Dispatcher / Operator',
    phoneNumber: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5191/api/Users');
      const formatted = response.data.map(u => ({
        id: `USR-${String(u.id).padStart(3, '0')}`,
        rawId: u.id,
        name: u.fullName || u.name,
        role: u.role,
        email: u.email,
        status: u.accountStatus || u.status || 'Active'
      }));
      setSystemUsers(formatted);
    } catch (error) {
      console.error("Error fetching system users:", error);
    }
  };

  const toggleStatus = async (user) => {
    try {
      const newStatus = user.status === 'Active' ? 'Blocked' : 'Active';
      
      const getRes = await axios.get(`http://localhost:5191/api/Users/${user.rawId}`);
      const existingUser = getRes.data;

      const updatedPayload = {
        ...existingUser,
        accountStatus: newStatus
      };

      await axios.put(`http://localhost:5191/api/Users/${user.rawId}`, updatedPayload);
      
      fetchUsers();
      alert(`Account status updated to ${newStatus}.`);
    } catch (error) {
      console.error("Status update error:", error.response?.data || error);
      alert(error.response?.data?.message || "Failed to update account status on the server.");
    }
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        fullName: newUser.name,
        email: newUser.email,
        passwordHash: newUser.password,
        role: newUser.role,
        accountStatus: 'Active',
        phoneNumber: newUser.phoneNumber || '0000000000'
      };

      await axios.post('http://localhost:5191/api/Users', payload);
      setIsModalOpen(false);
      setNewUser({ name: '', email: '', password: '', role: 'Dispatcher / Operator', phoneNumber: '' });
      fetchUsers();
      alert(`Staff user ${newUser.name} created successfully! Credentials are now active for system login.`);
    } catch (error) {
      console.error("Creation error:", error.response?.data || error);
      alert(error.response?.data?.message || "Failed to create new user on the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to convert raw database roles into clean Title Case
  const formatRoleName = (role) => {
    if (!role) return 'User';
    const lower = role.toLowerCase();
    if (lower === 'superadmin' || lower === 'super admin') return 'Super Admin';
    if (lower === 'customer') return 'Customer';
    if (lower === 'driver') return 'Driver';
    if (lower.includes('compliance')) return 'Compliance Manager';
    if (lower.includes('dispatcher') || lower.includes('operator')) return 'Dispatcher / Operator';
    // Fallback capitalizer for any other string
    return role.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  const filteredUsers = systemUsers.filter(usr => {
    const query = searchTerm.toLowerCase().trim();
    
    const matchesSearch = 
      (usr.id && usr.id.toLowerCase().includes(query)) ||
      (usr.name && usr.name.toLowerCase().includes(query)) ||
      (usr.email && usr.email.toLowerCase().includes(query)) ||
      (usr.role && usr.role.toLowerCase().includes(query));

    const isNotPending = usr.status !== 'Pending Approval';
    if (!isNotPending) return false;

    let matchesRole = true;
    const roleLower = usr.role.toLowerCase();
    if (selectedRoleFilter === 'Drivers') matchesRole = roleLower.includes('driver');
    else if (selectedRoleFilter === 'Customers') matchesRole = roleLower.includes('customer');
    else if (selectedRoleFilter === 'Admins') matchesRole = (roleLower.includes('admin') || roleLower.includes('operator') || roleLower.includes('manager') || roleLower.includes('superadmin') || roleLower.includes('compliance'));

    let matchesStatus = true;
    if (selectedStatusFilter === 'Active') matchesStatus = usr.status === 'Active';
    else if (selectedStatusFilter === 'Blocked') matchesStatus = usr.status === 'Blocked';

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className={`space-y-6 transition-colors duration-200 pb-12 font-sans ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
      
      {/* Add New User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`p-8 rounded-3xl max-w-lg w-full border shadow-2xl relative space-y-5 ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-gray-900'}`}>
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-black text-sm uppercase tracking-wider">Provision New Staff User</h3>
                <p className="text-xs text-slate-400 mt-0.5">Create secure database credentials for back-office login access.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddUserSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider mb-1 text-slate-400">Full Name</label>
                <input 
                  type="text" 
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  placeholder="Enter full name" 
                  className={`w-full p-3 rounded-2xl border text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[#0B2A4D] ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  required 
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider mb-1 text-slate-400">Email Address (Login Username)</label>
                <input 
                  type="email" 
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="staff@alwaqar.com" 
                  className={`w-full p-3 rounded-2xl border text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[#0B2A4D] ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  required 
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider mb-1 text-slate-400">Temporary Password</label>
                <input 
                  type="password" 
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  placeholder="••••••••" 
                  className={`w-full p-3 rounded-2xl border text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[#0B2A4D] ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  required 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider mb-1 text-slate-400">Assigned Role</label>
                  <select 
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className={`w-full p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0B2A4D] ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  >
                    <option value="Dispatcher / Operator">Dispatcher / Operator</option>
                    <option value="Compliance Manager">Compliance Manager</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider mb-1 text-slate-400">Phone Number</label>
                  <input 
                    type="text" 
                    value={newUser.phoneNumber}
                    onChange={(e) => setNewUser({...newUser, phoneNumber: e.target.value})}
                    placeholder="+971 50 000 0000" 
                    className={`w-full p-3 rounded-2xl border text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[#0B2A4D] ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-bold uppercase tracking-wider text-xs cursor-pointer">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-[#0B2A4D] hover:bg-slate-800 text-white rounded-2xl font-black uppercase tracking-wider text-xs cursor-pointer shadow-md transition">
                  {isSubmitting ? 'Saving...' : 'Save & Provision User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clean Enterprise Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-black text-blue-600 dark:text-blue-400 tracking-wider uppercase mb-1">
            <Users size={14} /> Access Control & Security
          </div>
          <h1 className="text-2xl font-black tracking-tight">Users & Role-Based Access Control (RBAC)</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            Manage administrative permissions, secure login credentials, and user account statuses.
          </p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-[#0B2A4D] hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-md transition cursor-pointer uppercase tracking-wider shrink-0"
        >
          <Plus size={15} /> Add New User
        </button>
      </div>

      {/* Users Management Main Card Container */}
      <div className={`p-6 rounded-3xl shadow-xl border ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/90 text-slate-900'} space-y-6`}>
        
        {/* Toolbar with Role Tabs & Search */}
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          
          {/* Role Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner overflow-x-auto w-full xl:w-auto">
            {['All', 'Drivers', 'Customers', 'Admins'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedRoleFilter(tab)}
                className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                  selectedRoleFilter === tab
                    ? 'bg-[#0B2A4D] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className={`w-full sm:w-auto px-4 py-2.5 border rounded-2xl text-xs font-bold transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0B2A4D] ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800 shadow-inner'
              }`}
            >
              <option value="All">Status: All</option>
              <option value="Active">Status: Active Only</option>
              <option value="Blocked">Status: Blocked Only</option>
            </select>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search ID, name, email..." 
                className={`w-full pl-10 pr-8 py-2.5 border rounded-2xl text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[#0B2A4D] ${
                  darkMode 
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400' 
                    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                }`}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b text-[10px] font-black uppercase tracking-wider ${darkMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-400'}`}>
                <th className="pb-3.5 px-3">User ID</th>
                <th className="pb-3.5 px-3">Full Name</th>
                <th className="pb-3.5 px-3">Assigned Role</th>
                <th className="pb-3.5 px-3">Email Address</th>
                <th className="pb-3.5 px-3">Status</th>
                <th className="pb-3.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y text-xs ${darkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((usr, idx) => {
                  const roleLower = (usr.role || '').toLowerCase();
                  
                  let roleBadgeStyle = 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200';
                  if (roleLower.includes('admin') || roleLower.includes('manager') || roleLower.includes('super')) {
                    roleBadgeStyle = 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200';
                  } else if (roleLower.includes('driver')) {
                    roleBadgeStyle = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200';
                  }

                  const formattedRoleText = formatRoleName(usr.role);

                  return (
                    <tr key={idx} className={`transition-colors ${darkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/70'}`}>
                      <td className="py-4 px-3 font-black text-blue-600 dark:text-blue-400 font-mono">{usr.id}</td>
                      <td className="py-4 px-3">
                        <p className={`font-bold ${darkMode ? 'text-gray-100' : 'text-slate-900'}`}>{usr.name}</p>
                      </td>
                      <td className="py-4 px-3">
                        {/* Removed 'uppercase' class and applied Title Case formatter */}
                        <span className={`px-3 py-1 rounded-xl text-[10px] font-black tracking-wider ${roleBadgeStyle}`}>
                          {formattedRoleText}
                        </span>
                      </td>
                      <td className={`py-4 px-3 font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        {usr.email}
                      </td>
                      <td className="py-4 px-3">
                        <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                          usr.status === 'Active' 
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200' 
                            : 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200'
                        }`}>
                          {usr.status}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-right">
                        <button 
                          onClick={() => toggleStatus(usr)}
                          className={`inline-flex items-center space-x-1 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer border shadow-xs ${
                            usr.status === 'Active'
                              ? 'bg-red-50 hover:bg-red-100 dark:bg-red-950/50 dark:text-red-300 text-red-700 border-red-200 dark:border-red-900'
                              : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 text-emerald-700 border-emerald-200 dark:border-emerald-900'
                          }`}
                        >
                          <span>{usr.status === 'Active' ? 'Block Account' : 'Unblock Account'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-xs text-slate-400 font-bold uppercase tracking-wider">
                    No users found matching your active filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersRoles;