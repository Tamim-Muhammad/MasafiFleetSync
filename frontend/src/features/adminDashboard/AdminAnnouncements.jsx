import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Bell, Send, Megaphone, CheckCircle2, Trash2, Radio, LifeBuoy, MessageSquare, Clock, CheckCheck, User, Filter } from 'lucide-react';

const AdminAnnouncements = () => {
  const { darkMode } = useOutletContext();

  const [activeTab, setActiveTab] = useState('announcements'); // 'announcements' | 'tickets'

  // Broadcast state with localStorage synchronization
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState('All Users');
  const [priority, setPriority] = useState('Normal');
  const [broadcasts, setBroadcasts] = useState([]);

  // Support Tickets state
  const [tickets, setTickets] = useState([]);
  const [adminResponseText, setAdminResponseText] = useState({});
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'open' | 'resolved'
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'customer' | 'driver'

  useEffect(() => {
    // Load Broadcasts from localStorage or initialize default seed
    const savedBroadcasts = JSON.parse(localStorage.getItem('admin_system_broadcasts') || '[]');
    if (savedBroadcasts.length === 0) {
      const initialSeed = [
        { 
          id: 'ANN-101', 
          title: 'Scheduled System Maintenance', 
          message: 'The Masafi Fleet Sync intranet will undergo a 15-minute database synchronization tonight at 02:00 AM.', 
          audience: 'All Connected Portals', 
          priority: 'High', 
          time: '2 hours ago',
          status: 'Active Feed' 
        },
        { 
          id: 'ANN-102', 
          title: 'Monsoon Delivery Advisory', 
          message: 'Caution advised along the Masafi Mountain Pass due to heavy fog and active road maintenance.', 
          audience: 'Driver Portal Only', 
          priority: 'Normal', 
          time: '1 day ago',
          status: 'Active Feed' 
        }
      ];
      setBroadcasts(initialSeed);
      localStorage.setItem('admin_system_broadcasts', JSON.stringify(initialSeed));
    } else {
      setBroadcasts(savedBroadcasts);
    }

    // Load Support Tickets
    const loadTickets = () => {
      const stored = JSON.parse(localStorage.getItem('admin_customer_tickets') || '[]');
      setTickets(stored);
    };

    loadTickets();
    const interval = setInterval(loadTickets, 1000);
    return () => clearInterval(interval);
  }, []);

  const saveBroadcastsToStorage = (updated) => {
    setBroadcasts(updated);
    localStorage.setItem('admin_system_broadcasts', JSON.stringify(updated));
  };

  const handleBroadcastSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    let audienceLabel = 'All Connected Portals';
    if (targetAudience === 'Customers Only') audienceLabel = 'Customer Portal Only';
    if (targetAudience === 'Drivers Only') audienceLabel = 'Driver Portal Only';

    const newBroadcast = {
      id: `ANN-${Math.floor(100 + Math.random() * 900)}`,
      title: title.trim(),
      message: message.trim(),
      audience: audienceLabel,
      priority,
      time: 'Just now',
      status: 'Active Feed'
    };

    const updated = [newBroadcast, ...broadcasts];
    saveBroadcastsToStorage(updated);

    setTitle('');
    setMessage('');
    alert('System announcement successfully pushed and synced to target portals.');
  };

  const handleDeleteBroadcast = (id) => {
    const filtered = broadcasts.filter(item => item.id !== id);
    saveBroadcastsToStorage(filtered);
  };

  const handleResolveTicket = (ticketId) => {
    const responseNote = adminResponseText[ticketId] || 'Issue reviewed and resolved by operations management.';
    
    const updated = tickets.map(t => {
      if (t.id === ticketId) {
        return { ...t, status: 'Resolved', adminResponse: responseNote };
      }
      return t;
    });

    setTickets(updated);
    localStorage.setItem('admin_customer_tickets', JSON.stringify(updated));
  };

  // Filter tickets based on status and role
  const filteredTickets = tickets.filter(t => {
    const matchesStatus = statusFilter === 'all' || t.status.toLowerCase() === statusFilter.toLowerCase();
    
    let matchesRole = true;
    const role = (t.senderRole || 'Customer').toLowerCase();
    if (roleFilter === 'customer') matchesRole = role === 'customer';
    if (roleFilter === 'driver') matchesRole = role === 'driver';

    return matchesStatus && matchesRole;
  });

  const openTicketsCount = tickets.filter(t => t.status === 'Open').length;

  return (
    <div className={`space-y-6 transition-colors duration-200 font-sans pb-12 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
      
      {/* Clean Professional Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">
            <Megaphone size={14} /> Communications & Operations
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">System Announcements & Help Desk</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Manage operational broadcast alerts and review direct support tickets submitted by customers and drivers.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-xs font-bold text-emerald-800 w-fit shadow-2xs">
          <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
          <span>Client Sync Channels: Online</span>
        </div>
      </div>

      {/* Modern Segmented Navigation Tabs */}
      <div className={`flex items-center p-1.5 rounded-2xl border w-fit ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200 shadow-2xs'}`}>
        <button
          onClick={() => setActiveTab('announcements')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
            activeTab === 'announcements' 
              ? 'bg-[#0B2A4D] text-white shadow-sm' 
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>System Broadcasts ({broadcasts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tickets')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-black transition cursor-pointer relative ${
            activeTab === 'tickets' 
              ? 'bg-[#0B2A4D] text-white shadow-sm' 
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <LifeBuoy className="w-4 h-4" />
          <span>Support Tickets Queue</span>
          {openTicketsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse shadow">
              {openTicketsCount}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: SYSTEM ANNOUNCEMENTS                               */}
      {/* ========================================================= */}
      {activeTab === 'announcements' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Form Panel: Compose Broadcast */}
          <div className={`${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900'} p-6 rounded-3xl shadow-sm border space-y-5`}>
            <div className="flex items-center space-x-2 border-b border-gray-100 dark:border-slate-800 pb-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Megaphone size={16} />
              </div>
              <h2 className="text-xs font-black uppercase tracking-wider">Compose Broadcast Alert</h2>
            </div>

            <form onSubmit={handleBroadcastSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Broadcast Title *</label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Operational Update"
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#0B2A4D]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Target Recipient Dashboard *</label>
                <select 
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#0B2A4D]"
                >
                  <option value="All Users">All Connected Portals (Customers & Drivers)</option>
                  <option value="Customers Only">Customer Portal Only</option>
                  <option value="Drivers Only">Driver Portal Only</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Priority Classification</label>
                <select 
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#0B2A4D]"
                >
                  <option value="Normal">Normal Advisory</option>
                  <option value="High">High Priority Warning</option>
                  <option value="Critical">Critical Emergency Alert</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Announcement Message Body *</label>
                <textarea 
                  rows="4"
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type notification details to broadcast across portals..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#0B2A4D]"
                />
              </div>

              <button 
                type="submit"
                className="w-full flex items-center justify-center space-x-2 bg-[#0B2A4D] hover:bg-blue-900 text-white p-3 rounded-xl font-black transition shadow-md cursor-pointer uppercase tracking-wider text-xs"
              >
                <Send className="w-4 h-4" />
                <span>Push Broadcast to Portals</span>
              </button>
            </form>
          </div>

          {/* Right Active Broadcast Feed List */}
          <div className={`${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900'} p-6 rounded-3xl shadow-sm border lg:col-span-2 space-y-4`}>
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Bell size={16} />
                </div>
                <h2 className="text-xs font-black uppercase tracking-wider">Active Broadcast Feeds & History</h2>
              </div>
              <span className="text-xs font-bold text-gray-400">Total Active Records: {broadcasts.length}</span>
            </div>

            {broadcasts.length === 0 ? (
              <div className="text-center py-16 text-xs text-gray-400 font-semibold bg-gray-50 dark:bg-slate-800 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700 p-6">
                No active broadcasts found. Push a new announcement above.
              </div>
            ) : (
              <div className="space-y-4">
                {broadcasts.map((ann) => (
                  <div key={ann.id} className={`p-5 rounded-2xl border space-y-3 transition ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-black text-blue-600 bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 rounded">{ann.id}</span>
                        <span className="text-xs font-semibold text-gray-400">• Target: {ann.audience} ({ann.time})</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        ann.priority === 'Critical' ? 'bg-red-50 text-red-600 border border-red-200' :
                        ann.priority === 'High' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {ann.priority} Priority
                      </span>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-gray-100 dark:border-slate-800 space-y-1">
                      <h4 className="text-sm font-black text-gray-900 dark:text-white">{ann.title}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{ann.message}</p>
                    </div>

                    <div className="pt-2 border-t border-gray-200/60 dark:border-slate-700 flex justify-between items-center text-xs">
                      <span className="flex items-center space-x-1 text-emerald-600 font-bold"><CheckCircle2 className="w-3.5 h-3.5" /><span>{ann.status}</span></span>
                      <button 
                        onClick={() => handleDeleteBroadcast(ann.id)}
                        className="text-red-600 hover:text-red-700 flex items-center space-x-1 font-bold cursor-pointer bg-red-50 dark:bg-red-950/40 px-3 py-1.5 rounded-xl transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Revoke Notice</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: SUPPORT TICKETS QUEUE                              */}
      {/* ========================================================= */}
      {activeTab === 'tickets' && (
        <div className={`${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900'} p-6 rounded-3xl shadow-sm border space-y-6`}>
          
          {/* Header & Professional Filter Toolbar */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-gray-100 dark:border-slate-800 pb-5">
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-blue-600" /> Collective Support Tickets Queue (Customers & Drivers)
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Review, manage, and reply to inbound support inquiries from both driver and customer portals.</p>
            </div>

            {/* Professional Separated Filter Bar */}
            <div className="flex flex-wrap items-center gap-3">
              
              {/* Role Dropdown Selector */}
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold">
                <Filter size={13} className="text-gray-400" />
                <span className="text-gray-400 font-medium">Role:</span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-transparent text-gray-800 dark:text-white font-black focus:outline-none cursor-pointer"
                >
                  <option value="all" className="bg-white dark:bg-slate-900">All Roles</option>
                  <option value="customer" className="bg-white dark:bg-slate-900">Customers Only</option>
                  <option value="driver" className="bg-white dark:bg-slate-900">Drivers Only</option>
                </select>
              </div>

              {/* Status Pill Group */}
              <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold border border-gray-200 dark:border-slate-700">
                {[
                  { id: 'all', label: 'All Status' },
                  { id: 'open', label: 'Open' },
                  { id: 'resolved', label: 'Resolved' }
                ].map((status) => (
                  <button
                    key={status.id}
                    onClick={() => setStatusFilter(status.id)}
                    className={`px-3.5 py-1.5 rounded-lg uppercase tracking-wider transition cursor-pointer ${
                      statusFilter === status.id ? 'bg-white dark:bg-slate-700 text-[#0B2A4D] dark:text-white shadow-2xs font-black' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>

            </div>
          </div>

          {filteredTickets.length === 0 ? (
            <div className="text-center py-16 text-xs text-gray-400 font-semibold bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700 p-6 space-y-2">
              <MessageSquare className="w-8 h-8 text-gray-400 mx-auto" />
              <p>No support tickets found matching your selected filters.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredTickets.map((t) => (
                <div key={t.id} className={`p-6 rounded-3xl border-2 space-y-4 transition shadow-md ${
                  darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-blue-600 bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 rounded">{t.id}</span>
                        <span className="text-xs font-bold bg-gray-100 dark:bg-slate-700 px-2.5 py-0.5 rounded text-gray-700 dark:text-gray-300">{t.category}</span>
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          t.senderRole === 'Driver' ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {t.senderRole || 'Customer'} Inquiry
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-gray-900 dark:text-white">{t.subject}</h4>
                    </div>

                    <div className="shrink-0 flex flex-col sm:items-end gap-1.5">
                      <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1"><Clock size={12} /> {t.date}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                        t.status === 'Resolved' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {t.status === 'Resolved' ? <CheckCheck size={14} /> : <Clock size={14} />}
                        {t.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-700 dark:text-gray-200 leading-relaxed bg-gray-50/70 dark:bg-slate-900/80 p-4 rounded-2xl border border-gray-100 dark:border-slate-800">{t.message}</p>

                  {/* Sender metadata info */}
                  <div className="flex items-center gap-4 text-[11px] text-gray-500 dark:text-gray-400 pt-1 border-t border-gray-100 dark:border-slate-700/50">
                    <span className="flex items-center gap-1 font-semibold"><User size={13} className="text-blue-600" /> {t.senderName || 'Authorized User'}</span>
                  </div>

                  {/* Resolution Input */}
                  {t.status === 'Open' ? (
                    <div className="pt-3 border-t border-gray-200/60 dark:border-slate-700 space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Official Operator Response Note:</label>
                        <input 
                          type="text"
                          placeholder="Type reply or resolution notes for user view..."
                          value={adminResponseText[t.id] || ''}
                          onChange={(e) => setAdminResponseText({ ...adminResponseText, [t.id]: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0B2A4D]"
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleResolveTicket(t.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-sm transition cursor-pointer flex items-center gap-1.5 uppercase tracking-wider"
                        >
                          <CheckCircle2 size={14} /> Resolve & Send Reply
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 p-4 rounded-2xl text-xs text-emerald-900 dark:text-emerald-300 space-y-1">
                      <div className="font-black flex items-center gap-1.5">
                        <CheckCheck size={14} /> Official Admin Response Sent:
                      </div>
                      <p className="text-emerald-700 dark:text-emerald-400 font-medium">{t.adminResponse}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default AdminAnnouncements;