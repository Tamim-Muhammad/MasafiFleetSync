import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HelpCircle, 
  PhoneCall, 
  Mail, 
  Send, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2,
  Headphones,
  MapPin,
  Clock,
  MessageSquare,
  CheckCircle,
  Filter
} from 'lucide-react';

const DriverSupport = () => {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [msgSent, setMsgSent] = useState(false);
  const [formData, setFormData] = useState({ subject: '', message: '' });
  const [myTickets, setMyTickets] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'open' | 'resolved'

  // Load driver's submitted tickets from localStorage
  const loadDriverTickets = () => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const driverName = storedUser.fullName || storedUser.name || storedUser.username || 'Driver';
    
    const allTickets = JSON.parse(localStorage.getItem('admin_customer_tickets') || '[]');
    // Filter tickets submitted by this specific driver
    const driverTickets = allTickets.filter(t => t.senderRole === 'Driver' && t.senderName === driverName);
    setMyTickets(driverTickets);
  };

  useEffect(() => {
    loadDriverTickets();
    const interval = setInterval(loadDriverTickets, 3000);
    return () => clearInterval(interval);
  }, []);

  // FAQs tailored for drivers based on project specs
  const faqs = [
    {
      q: 'What should I do if my compliance documents are expiring soon?',
      a: 'You will receive automated system warnings at 30, 15, and 7 days prior to document expiration. You can upload renewed certificates directly through your Compliance screen.'
    },
    {
      q: 'How do I report a roadside vehicle breakdown or emergency?',
      a: 'Tap the prominent red "SOS" button floating at the bottom right of your screen. You can use Push-to-Call for an immediate voice link or Push-to-Log to transmit your live GPS coordinates to the recovery desk instantly.'
    },
    {
      q: 'How are my daily earnings and commission calculated?',
      a: 'The system automatically logs cash-on-delivery collections and deducts the pre-defined company commission percentage configured by the Super Admin, displaying your net payout on your Earnings summary page.'
    },
    {
      q: 'Can I complete an active job if my license expires mid-delivery?',
      a: 'Yes, the system enforces a mid-job grace period allowing you to complete your current active delivery, but it will automatically block you from receiving new assignments until your documents are renewed.'
    }
  ];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.message.trim()) return;

    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const driverName = storedUser.fullName || storedUser.name || storedUser.username || 'Driver';
    const driverPhone = storedUser.phone || storedUser.phoneNumber || storedUser.mobile || storedUser.contact || 'N/A';

    const newTicket = {
      id: `DRV-TKT-${Math.floor(100 + Math.random() * 900)}`,
      category: 'Driver Operational Inquiry',
      senderRole: 'Driver',
      subject: formData.subject.trim(),
      message: formData.message.trim(),
      senderName: driverName,
      phone: driverPhone,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Open',
      adminResponse: ''
    };

    const existingTickets = JSON.parse(localStorage.getItem('admin_customer_tickets') || '[]');
    const updatedTickets = [newTicket, ...existingTickets];
    localStorage.setItem('admin_customer_tickets', JSON.stringify(updatedTickets));

    setMsgSent(true);
    loadDriverTickets();
    
    setTimeout(() => {
      setMsgSent(false);
      setFormData({ subject: '', message: '' });
    }, 2500);
  };

  // Filtered tickets based on status selection
  const filteredTickets = myTickets.filter(t => {
    if (statusFilter === 'open') return t.status.toLowerCase() === 'open';
    if (statusFilter === 'resolved') return t.status.toLowerCase() === 'resolved';
    return true; // 'all'
  });

  return (
    <div className="w-full space-y-6 pb-12 relative font-sans">
      
      {/* Top Banner Status Bar (Synchronized with Earnings & Assignments) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-600 text-white p-3 rounded-xl shadow-sm">
            <HelpCircle className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-gray-900 font-bold text-lg tracking-tight">Driver Help Center & Support</h1>
            <p className="text-gray-500 text-xs mt-0.5">
              Our dedicated support team is available around the clock to assist with emergency recovery dispatch.
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono font-bold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100 flex items-center gap-1.5 shadow-xs self-start md:self-auto shrink-0">
          <Headphones size={14} className="text-blue-600" /> 24/7 DRIVER ASSISTANCE DESK
      </span>
      </div>

      {/* Contact Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 flex items-center space-x-4">
          <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl shrink-0">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-gray-400 text-xs uppercase tracking-wider">Support Hotline</h4>
            <a href="tel:+971508821944" className="text-sm font-bold text-blue-600 hover:underline mt-1 inline-block">
              +971-50-882-1944
            </a>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 flex items-center space-x-4">
          <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl shrink-0">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-gray-400 text-xs uppercase tracking-wider">Email Support</h4>
            <span className="text-xs font-bold text-gray-800 mt-1 block truncate">
              support@masafifleetsync.com
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 flex items-center space-x-4">
          <div className="bg-purple-50 text-purple-600 p-4 rounded-2xl shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-gray-400 text-xs uppercase tracking-wider">Our Location</h4>
            <p className="text-xs font-semibold text-gray-800 mt-1">
              Al-Waqar Transport L.L.C., Masafi/Fujairah Region, UAE
            </p>
          </div>
        </div>

      </div>

      {/* Direct Message Form & FAQs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Send Message to Support */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4">
          <h4 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-3">
            Send Message to Support Desk
          </h4>

          {msgSent ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h5 className="font-bold text-emerald-900 text-xs">Ticket Submitted & Synced!</h5>
              <p className="text-[11px] text-emerald-600">Your ticket has been routed to the admin help desk queue.</p>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Subject / Issue Topic</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., Earnings Reconciliation Inquiry"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Detailed Message</label>
                <textarea 
                  rows="4" 
                  required
                  placeholder="Describe your issue clearly..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Ticket</span>
              </button>
            </form>
          )}
        </div>

        {/* FAQ Accordion */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4">
          <h4 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-3">
            Frequently Asked Questions (FAQs)
          </h4>

          <div className="space-y-2.5">
            {faqs.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden transition-all">
                  <button 
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-3.5 text-left bg-gray-50 hover:bg-gray-100/70 transition-colors font-bold text-xs text-gray-800 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-blue-600 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="p-3.5 bg-white text-xs text-gray-600 border-t border-gray-100 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Submitted Tickets & Admin Responses Section with Status Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="flex items-center space-x-2">
            <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span>My Submitted Tickets & Admin Responses</span>
            </h4>
            <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-full">
              {myTickets.length} Total
            </span>

          </div>

          {/* Status Filter Pill Group */}
          <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl text-xs font-bold border border-gray-200">
            <span className="text-[11px] text-gray-500 px-2 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            {[
              { id: 'all', label: 'All' },
              { id: 'open', label: 'Open' },
              { id: 'resolved', label: 'Resolved' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1 rounded-lg uppercase tracking-wider transition cursor-pointer ${
                  statusFilter === tab.id 
                    ? 'bg-white text-[#0B2A4D] shadow-2xs font-black' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {filteredTickets.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400">
            No support tickets found matching your selected filter.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <div key={ticket.id} className="border border-gray-200 rounded-2xl p-4 space-y-3 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-md">
                      {ticket.id}
                    </span>
                    <span className="text-xs font-bold text-gray-800">{ticket.subject}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {ticket.date}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      ticket.status === 'Resolved' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-600 bg-white p-3 rounded-xl border border-gray-200/80">
                  <strong className="text-gray-900">Your Message:</strong> {ticket.message}
                </p>

                {ticket.adminResponse ? (
                  <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl space-y-1">
                    <div className="flex items-center space-x-1.5 text-emerald-800 font-bold text-xs">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Official Dispatch Response Note:</span>
                    </div>
                    <p className="text-xs text-emerald-900 leading-relaxed pl-5">
                      {ticket.adminResponse}
                    </p>
                  </div>
                ) : (
                  <div className="text-[11px] text-amber-600 font-medium italic flex items-center gap-1.5 pt-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    Awaiting review and response from the central dispatch team...
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

export default DriverSupport;