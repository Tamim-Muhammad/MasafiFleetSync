import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Users, Shield, UserCheck, UserX, Lock, Key, X, Plus } from 'lucide-react';

const AdminUsersRoles = () => {
  const { darkMode } = useOutletContext();
  
  // Modal visibility state and form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Dispatcher / Operator'
  });

  // Mock users and roles matching RBAC specifications
  const [systemUsers, setSystemUsers] = useState([
    { id: 'USR-001', name: 'Muhammad Tamim', role: 'Super Admin', email: 'tamim@alwaqar.com', status: 'Active' },
    { id: 'USR-002', name: 'Zohaib Ahmed', role: 'Dispatcher / Operator', email: 'zohaib@alwaqar.com', status: 'Active' },
    { id: 'USR-003', name: 'Waqar Ali Shah', role: 'Compliance Manager', email: 'waqar@alwaqar.com', status: 'Active' },
    { id: 'USR-004', name: 'Ahmed Al-Mazrouei', role: 'Registered Driver', email: 'driver.ahmed@alwaqar.com', status: 'Active' },
  ]);

  // Handle status toggle (Block / Unblock)
  const toggleStatus = (id) => {
    setSystemUsers(prev => prev.map(usr => {
      if (usr.id === id) {
        const newStatus = usr.status === 'Active' ? 'Blocked' : 'Active';
        return { ...usr, status: newStatus };
      }
      return usr;
    }));
    alert(`Account status toggled successfully.`);
  };

  // Handle adding a new user from the modal
  const handleAddUserSubmit = (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) {
      alert("Please fill in all required fields.");
      return;
    }

    const nextIdNumber = systemUsers.length + 1;
    const formattedId = `USR-${String(nextIdNumber).padStart(3, '0')}`;

    const createdUser = {
      id: formattedId,
      name: newUser.name,
      role: newUser.role,
      email: newUser.email,
      status: 'Active'
    };

    setSystemUsers(prev => [createdUser, ...prev]);
    setIsModalOpen(false);
    setNewUser({ name: '', email: '', password: '', role: 'Dispatcher / Operator' });
    alert(`User ${createdUser.name} created successfully with role [${createdUser.role}]!`);
  };

  return (
    <div className={`space-y-6 transition-colors duration-200 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
      
      {/* Add New User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className={`p-8 rounded-3xl max-w-md w-full shadow-2xl border ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-100 text-gray-900'}`}>
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-lg font-black text-[#0B2A4D] dark:text-blue-400">Provision New Staff User</h3>
              <button onClick={() => setIsModalOpen(false)} className="cursor-pointer text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            
            <form onSubmit={handleAddUserSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-gray-500 uppercase mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  placeholder="Enter full name" 
                  className={`w-full p-3 border rounded-xl outline-none transition font-semibold ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
                  required 
                />
              </div>

              <div>
                <label className="block text-gray-500 uppercase mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="staff@alwaqar.com" 
                  className={`w-full p-3 border rounded-xl outline-none transition font-semibold ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
                  required 
                />
              </div>

              <div>
                <label className="block text-gray-500 uppercase mb-1">Temporary Password</label>
                <input 
                  type="password" 
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  placeholder="••••••••" 
                  className={`w-full p-3 border rounded-xl outline-none transition font-semibold ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
                  required 
                />
              </div>

              <div>
                <label className="block text-gray-500 uppercase mb-1">Assigned Role</label>
                <select 
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className={`w-full p-3 border rounded-xl outline-none transition font-semibold cursor-pointer ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
                >
                  <option value="Dispatcher / Operator">Dispatcher / Operator</option>
                  <option value="Compliance Manager">Compliance Manager</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className={`flex-1 py-3 border rounded-xl font-bold cursor-pointer ${darkMode ? 'border-slate-700 text-gray-300 hover:bg-slate-800' : 'border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-[#0B2A4D] hover:bg-[#153e6d] text-white py-3 rounded-xl font-bold cursor-pointer shadow-md"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Top Professional Navy Header */}
      <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#0B2A4D] border-blue-950'} p-6 rounded-2xl shadow-md text-white flex flex-col md:flex-row md:items-center md:justify-between border transition-colors`}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users & Role-Based Access Control (RBAC)</h1>
          <p className="text-sm text-blue-200 mt-1">Manage administrative permissions, secure credentials, and user account statuses.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Plus size={14} /> Add New User
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className={`p-6 rounded-2xl shadow-sm border transition-colors ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-100 text-gray-900'}`}>
        <h2 className="text-lg font-bold mb-4">System Access Directory</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b text-xs font-semibold uppercase ${darkMode ? 'border-slate-800 text-gray-400' : 'border-gray-100 text-gray-400'}`}>
                <th className="pb-3">User ID</th>
                <th className="pb-3">Full Name</th>
                <th className="pb-3">Assigned Role</th>
                <th className="pb-3">Email Address</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y text-sm ${darkMode ? 'divide-slate-800' : 'divide-gray-50'}`}>
              {systemUsers.map((usr, idx) => (
                <tr key={idx} className={`transition-colors ${darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50/50'}`}>
                  <td className="py-3 font-semibold text-blue-500">{usr.id}</td>
                  <td className={`py-3 font-bold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{usr.name}</td>
                  <td className="py-3">
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded-lg text-xs font-semibold">
                      {usr.role}
                    </span>
                  </td>
                  <td className={`py-3 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{usr.email}</td>
                  <td className="py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      usr.status === 'Active' 
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' 
                        : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                    }`}>
                      {usr.status}
                    </span>
                  </td>
                  <td className="py-3 text-right space-x-2">
                    <button 
                      onClick={() => toggleStatus(usr.id)}
                      className="text-amber-600 dark:text-amber-400 hover:underline text-xs font-bold cursor-pointer"
                    >
                      Block/Unblock
                    </button>
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

export default AdminUsersRoles;