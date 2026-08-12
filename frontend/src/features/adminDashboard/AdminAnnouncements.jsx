import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Bell, Send, Megaphone, CheckCircle2, Trash2, AlertTriangle, Radio } from 'lucide-react';

const AdminAnnouncements = () => {
  const { darkMode } = useOutletContext();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState('All Users');
  const [priority, setPriority] = useState('Normal');

  // Broadcast history state initialized to sync with customer/driver header popovers
  const [broadcasts, setBroadcasts] = useState([
    { 
      id: 'ANN-101', 
      title: 'Scheduled System Maintenance', 
      message: 'The Masafi Fleet Sync intranet will undergo a 15-minute database synchronization tonight at 02:00 AM.', 
      audience: 'All Registered Drivers & Staff', 
      priority: 'High', 
      time: '2 hours ago',
      status: 'Active Feed' 
    },
    { 
      id: 'ANN-102', 
      title: 'Monsoon Delivery Advisory', 
      message: 'Caution advised along the Masafi Mountain Pass due to heavy fog and active road maintenance.', 
      audience: 'Active Tanker Drivers', 
      priority: 'Normal', 
      time: '1 day ago',
      status: 'Active Feed' 
    },
    { 
      id: 'ANN-103', 
      title: 'Rental Contract Approved', 
      message: 'Your heavy tanker lease agreement is ready for final verification in the customer portal.', 
      audience: 'Water Customers', 
      priority: 'Normal', 
      time: 'Yesterday',
      status: 'Active Feed' 
    }
  ]);

  const handleBroadcastSubmit = (e) => {
    e.preventDefault();
    if (!title || !message) return;

    const newBroadcast = {
      id: `ANN-10${broadcasts.length + 1}`,
      title,
      message,
      audience: targetAudience,
      priority,
      time: 'Just now',
      status: 'Broadcast Pushed'
    };

    setBroadcasts([newBroadcast, ...broadcasts]);
    setTitle('');
    setMessage('');
    alert('System announcement successfully pushed across active customer and driver notification feeds.');
  };

  const handleDeleteBroadcast = (id) => {
    setBroadcasts(prev => prev.filter(item => item.id !== id));
    alert(`Announcement ${id} revoked and removed from client notification channels.`);
  };

  return (
    <div className={`space-y-6 transition-colors duration-200 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
      {/* Top Professional Header */}
      <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#0B2A4D] border-blue-950'} p-6 rounded-2xl shadow-md text-white flex flex-col md:flex-row md:items-center md:justify-between border transition-colors`}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Announcements & Notification Broadcasts</h1>
          <p className="text-sm text-blue-200 mt-1">Push real-time operational announcements, emergency advisories, and compliance reminders to customer and driver notification panels.</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-2 bg-blue-950/60 px-4 py-2 rounded-xl border border-blue-900 text-xs font-semibold text-blue-200">
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>Active Client Sync Channels: Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Form Panel: Compose Broadcast */}
        <div className={`${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-100 text-gray-900'} p-6 rounded-2xl shadow-sm border transition-colors lg:col-span-1 space-y-4`}>
          <div className={`flex items-center space-x-2 border-b pb-3 ${darkMode ? 'border-slate-800' : 'border-gray-100'}`}>
            <Megaphone className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-bold">Compose Broadcast Alert</h2>
          </div>

          <form onSubmit={handleBroadcastSubmit} className="space-y-4 text-xs">
            <div>
              <label className={`block font-bold mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Broadcast Title</label>
              <input 
                type="text" 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Operational Update"
                className={`w-full p-3 border rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
              />
            </div>

            <div>
              <label className={`block font-bold mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Target Recipient Group</label>
              <select 
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className={`w-full p-3 border rounded-xl font-semibold focus:outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
              >
                <option value="All Users">All Connected Users (Customers & Drivers)</option>
                <option value="Active Tanker Drivers">Active Fleet Drivers Only</option>
                <option value="Water Customers">Bulk Water Customers Only</option>
                <option value="B2B Lease Contractors">B2B Heavy Fleet Renters Only</option>
              </select>
            </div>

            <div>
              <label className={`block font-bold mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Priority Classification</label>
              <select 
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className={`w-full p-3 border rounded-xl font-semibold focus:outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
              >
                <option value="Normal">Normal Advisory</option>
                <option value="High">High Priority Warning</option>
                <option value="Critical">Critical Emergency Alert</option>
              </select>
            </div>

            <div>
              <label className={`block font-bold mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Announcement Message Body</label>
              <textarea 
                rows="4"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type notification details to broadcast across headers..."
                className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
              />
            </div>

            <button 
              type="submit"
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-bold transition shadow-sm cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Push Broadcast to Portals</span>
            </button>
          </form>
        </div>

        {/* Right Active Broadcast Feed List */}
        <div className={`${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-100 text-gray-900'} p-6 rounded-2xl shadow-sm border lg:col-span-2 space-y-4 transition-colors`}>
          <div className={`flex items-center justify-between border-b pb-3 ${darkMode ? 'border-slate-800' : 'border-gray-100'}`}>
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-bold">Active Broadcast Feeds & History</h2>
            </div>
            <span className="text-xs font-semibold text-gray-500">Total Active Records: {broadcasts.length}</span>
          </div>

          <div className="space-y-3">
            {broadcasts.map((ann) => (
              <div key={ann.id} className={`p-4 rounded-xl border flex flex-col justify-between space-y-2 transition ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-blue-500 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-md">{ann.id}</span>
                    <span className="text-xs font-semibold text-gray-400">• Target: {ann.audience} ({ann.time})</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                    ann.priority === 'Critical' ? 'bg-red-50 text-red-600 border border-red-200' :
                    ann.priority === 'High' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                    'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  }`}>
                    {ann.priority} Priority
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold">{ann.title}</h4>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{ann.message}</p>
                </div>

                <div className="pt-2 border-t flex justify-between items-center text-[11px] text-gray-400 border-gray-200/50">
                  <span className="flex items-center space-x-1 text-emerald-500 font-semibold"><CheckCircle2 className="w-3.5 h-3.5" /><span>{ann.status}</span></span>
                  <button 
                    onClick={() => handleDeleteBroadcast(ann.id)}
                    className="text-red-500 hover:text-red-700 flex items-center space-x-1 font-semibold cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Revoke Notice</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminAnnouncements;