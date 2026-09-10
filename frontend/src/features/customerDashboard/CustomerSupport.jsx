import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  PhoneCall, 
  Mail, 
  MapPin, 
  Send, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare, 
  CheckCircle,
  LifeBuoy,
  Clock,
  CheckCheck,
  Search,
  AlertCircle
} from 'lucide-react';

const CustomerSupport = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: 'Water Delivery Inquiry',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [myTickets, setMyTickets] = useState([]);
  const [ticketSearch, setTicketSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const loadMyTickets = () => {
      const tickets = JSON.parse(localStorage.getItem('admin_customer_tickets') || '[]');
      setMyTickets(tickets);
    };

    loadMyTickets();
    const interval = setInterval(loadMyTickets, 1000);
    return () => clearInterval(interval);
  }, []);

  const faqs = [
    {
      q: "How is the bulk water delivery price calculated?",
      a: "Delivery pricing is calculated automatically using the core matrix: Base Rate + (Distance in km × Per-km Rate) × Volume Multiplier via live OSRM routing."
    },
    {
      q: "What payment methods are supported?",
      a: "All short-term bulk water deliveries and services utilize a secure Cash-on-Delivery (COD) hand-to-hand payment protocol upon driver arrival."
    },
    {
      q: "How can I track my active tanker order?",
      a: "You can track your live shipment in real-time by clicking 'Track Delivery' on your sidebar, which pulls live GPS coordinates and ETAs from the assigned driver."
    },
    {
      q: "What is the policy for heavy vehicle equipment rentals?",
      a: "B2B equipment leases require date selection via the rental showroom, generating an automated digital PDF contract with security deposit terms before dispatch confirmation."
    }
  ];

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    if (!ticketForm.subject || !ticketForm.message) {
      alert("Please fill out all required fields before submitting your ticket.");
      return;
    }

    const newTicket = {
      id: `CUST-TKT-${Math.floor(100 + Math.random() * 900)}`,
      senderName: 'Muhammad Tamim',
      senderRole: 'Customer',
      category: ticketForm.category,
      subject: ticketForm.subject,
      message: ticketForm.message,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Open'
    };

    const existingTickets = JSON.parse(localStorage.getItem('admin_customer_tickets') || '[]');
    localStorage.setItem('admin_customer_tickets', JSON.stringify([newTicket, ...existingTickets]));

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setTicketForm({ subject: '', category: 'Water Delivery Inquiry', message: '' });
    }, 3500);
  };

  const filteredTickets = myTickets.filter(t => {
    const matchesSearch = t.id.toLowerCase().includes(ticketSearch.toLowerCase()) ||
                          t.subject.toLowerCase().includes(ticketSearch.toLowerCase()) ||
                          t.message.toLowerCase().includes(ticketSearch.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const openCount = myTickets.filter(t => t.status === 'Open').length;
  const resolvedCount = myTickets.filter(t => t.status === 'Resolved').length;

  return (
    <div className="w-full space-y-6 pb-12 font-sans">
      
      {/* Clean Professional Header (Banner Removed) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">
            <LifeBuoy size={14} /> Help Desk & Operations
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Support Center & Help Desk</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Get assistance regarding active dispatches, billing queries, or connect directly with Al-Waqar operations.
          </p>
        </div>

        {/* Live Metrics Pills */}
        <div className="flex items-center gap-3">
          <div className="bg-white border border-gray-200 px-4 py-2 rounded-2xl shadow-2xs flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="font-bold text-gray-700">Open Tickets:</span>
            <span className="font-black text-[#0B2A4D]">{openCount}</span>
          </div>
          <div className="bg-white border border-gray-200 px-4 py-2 rounded-2xl shadow-2xs flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-bold text-gray-700">Resolved:</span>
            <span className="font-black text-emerald-700">{resolvedCount}</span>
          </div>
        </div>
      </div>

      {/* Interactive Contact Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a href="tel:+971508821944" className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex items-center gap-4 hover:border-blue-300 transition group cursor-pointer">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100 group-hover:scale-105 transition">
            <PhoneCall size={20} className="text-emerald-600" />
          </div>
          <div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">SUPPORT HOTLINE</span>
            <p className="text-xs font-black text-[#0B2A4D] mt-0.5">+971 50 882 1944</p>
          </div>
        </a>

        <a href="mailto:support@masafifleetsync.com" className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex items-center gap-4 hover:border-blue-300 transition group cursor-pointer">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 group-hover:scale-105 transition">
            <Mail size={20} className="text-blue-600" />
          </div>
          <div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">EMAIL SUPPORT</span>
            <p className="text-xs font-black text-[#0B2A4D] mt-0.5 truncate max-w-[200px]">
              support@masafifleetsync.com
            </p>
          </div>
        </a>

        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center shrink-0 border border-purple-100">
            <MapPin size={20} className="text-purple-600" />
          </div>
          <div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">OPERATIONAL HQ</span>
            <p className="text-xs font-black text-[#0B2A4D] mt-0.5 leading-snug">
              Masafi / Fujairah Region, UAE
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: FAQs & Ticket Submission */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* FAQs */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <HelpCircle size={18} className="text-blue-600" />
            <h2 className="text-xs font-black text-gray-900 uppercase tracking-wider">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-2xl overflow-hidden transition bg-gray-50/50">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-4 text-left text-xs font-bold text-gray-800 hover:bg-gray-100/60 transition cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {openFaq === index ? <ChevronUp size={16} className="text-[#0B2A4D]" /> : <ChevronDown size={16} className="text-gray-400" />}
                </button>
                {openFaq === index && (
                  <div className="px-4 pb-4 text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-3 bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit Ticket Form */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <MessageSquare size={18} className="text-blue-600" />
            <h2 className="text-xs font-black text-gray-900 uppercase tracking-wider">Send Direct Support Ticket</h2>
          </div>

          {isSubmitted ? (
            <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-3 animate-in fade-in duration-300">
              <CheckCircle size={32} className="text-emerald-600 mx-auto" />
              <h3 className="text-xs font-black text-emerald-900">Ticket Submitted Successfully!</h3>
              <p className="text-[11px] text-emerald-700 leading-relaxed">
                An operations officer has received your request and will contact your registered phone number shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleTicketSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Inquiry Category *</label>
                <select
                  value={ticketForm.category}
                  onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#0B2A4D]"
                >
                  <option value="Water Delivery Inquiry">Bulk Water Delivery Inquiry</option>
                  <option value="Rental Lease Support">Vehicle Lease & Contract Support</option>
                  <option value="Billing & Receipt">Billing or Tax Receipt Issue</option>
                  <option value="General Support">General Support</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Subject / Issue Title *</label>
                <input 
                  type="text"
                  required
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                  placeholder="e.g. Delivery ETA update query"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#0B2A4D]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Detailed Message *</label>
                <textarea 
                  required
                  rows={4}
                  value={ticketForm.message}
                  onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                  placeholder="Describe your inquiry clearly so our dispatchers can assist..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#0B2A4D]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#0B2A4D] hover:bg-blue-900 text-white font-black py-3 rounded-xl transition shadow-md cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider text-xs"
              >
                <Send size={14} /> Submit Support Ticket
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Customer Ticket Tracker Section */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Clock size={16} className="text-blue-600" /> My Submitted Support Tickets & Status
            </h2>
            <p className="text-[11px] text-gray-400 font-medium mt-0.5">Real-time admin sync and official operator replies</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Filter Tabs */}
            <div className="flex bg-gray-100 p-1 rounded-xl text-[11px] font-bold">
              {['all', 'open', 'resolved'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition cursor-pointer ${
                    statusFilter === tab ? 'bg-white text-[#0B2A4D] shadow-2xs font-black' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text"
                placeholder="Search tickets..."
                value={ticketSearch}
                onChange={(e) => setTicketSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B2A4D] w-48"
              />
            </div>
          </div>
        </div>

        {filteredTickets.length === 0 ? (
          <div className="text-center py-10 text-xs text-gray-400 font-semibold bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-6">
            No support tickets found matching your criteria.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTickets.map((t) => (
              <div key={t.id} className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-3 hover:border-gray-300 transition">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-[#0B2A4D]">{t.id}</span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">{t.category}</span>
                    </div>
                    <h4 className="text-xs font-extrabold text-gray-900">{t.subject}</h4>
                    <p className="text-xs text-gray-600">{t.message}</p>
                  </div>

                  <div className="shrink-0 flex items-center gap-3">
                    <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1"><Clock size={12} /> {t.date}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                      t.status === 'Resolved' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {t.status === 'Resolved' ? <CheckCheck size={14} /> : <Clock size={14} />}
                      {t.status}
                    </span>
                  </div>
                </div>

                {t.status === 'Resolved' && t.adminResponse && (
                  <div className="bg-emerald-50/80 border border-emerald-200 p-3.5 rounded-xl text-xs text-emerald-900 space-y-1 mt-2">
                    <div className="font-black flex items-center gap-1.5 text-emerald-800">
                      <CheckCheck size={14} /> Official Admin Response:
                    </div>
                    <p className="text-emerald-700 leading-relaxed font-medium">{t.adminResponse}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default CustomerSupport;