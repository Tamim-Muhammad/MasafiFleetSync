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
  CheckCheck
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

  useEffect(() => {
    const loadMyTickets = () => {
      const tickets = JSON.parse(localStorage.getItem('admin_customer_tickets') || '[]');
      setMyTickets(tickets);
    };

    loadMyTickets();
    const interval = setInterval(loadMyTickets, 500);
    return () => clearInterval(interval);
  }, []);

  const faqs = [
    {
      q: "How is the bulk water delivery price calculated?",
      a: "Delivery pricing is calculated automatically using the core matrix: Base Rate + (Distance in km × Per-km Rate) × Volume Multiplier via the Google Maps Distance Matrix API."
    },
    {
      q: "What payment methods are supported?",
      a: "All short-term bulk water deliveries and services utilize a secure Cash-on-Delivery (COD) hand-to-hand payment protocol upon driver arrival."
    },
    {
      q: "How can I track my active tanker order?",
      a: "You can track your live shipment in real-time by clicking 'Track Live Status' on your My Orders page, which pulls live GPS coordinates and ETAs from the assigned driver."
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
    }, 4000);
  };

  return (
    <div className="w-full space-y-6 pb-12">
      <div className="bg-gradient-to-r from-[#0B2A4D] via-[#103E73] to-[#0B2A4D] p-8 rounded-3xl shadow-xl text-white flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-white/5 skew-x-12 pointer-events-none"></div>
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/30 border border-blue-400/30 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase text-blue-200">
            <LifeBuoy size={13} /> Help Desk & Operations
          </div>
          <h1 className="text-3xl font-black tracking-tight">Support Center & Help Desk</h1>
          <p className="text-xs text-blue-100 max-w-xl leading-relaxed">
            Get assistance regarding active dispatches, billing queries, or connect directly with Al-Waqar operations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
            <PhoneCall size={22} className="text-emerald-600" />
          </div>
          <div>
            <span className="text-[11px] font-black text-[#0B2A4D] uppercase tracking-wider block">SUPPORT HOTLINE</span>
            <p className="text-xs font-medium text-gray-600 mt-0.5">+971-50-882-1944</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
            <Mail size={22} className="text-blue-600" />
          </div>
          <div>
            <span className="text-[11px] font-black text-[#0B2A4D] uppercase tracking-wider block">EMAIL SUPPORT</span>
            <p className="text-xs font-medium text-gray-600 mt-0.5 truncate max-w-[200px]">
              support@masafifleetsync.com
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center shrink-0 border border-purple-100">
            <MapPin size={22} className="text-purple-600" />
          </div>
          <div>
            <span className="text-[11px] font-black text-[#0B2A4D] uppercase tracking-wider block">OUR LOCATION</span>
            <p className="text-xs font-medium text-gray-600 mt-0.5 leading-snug">
              Al-Waqar Transport L.L.C., Masafi/Fujairah Region, UAE
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <HelpCircle size={18} className="text-[#0B2A4D]" />
            <h2 className="text-sm font-black text-[#0B2A4D]">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-100 rounded-xl overflow-hidden transition bg-gray-50/50">
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

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 h-fit">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <MessageSquare size={18} className="text-[#0B2A4D]" />
            <h2 className="text-sm font-black text-[#0B2A4D]">Send Direct Helpdesk Ticket</h2>
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
                className="w-full bg-[#0B2A4D] hover:bg-blue-900 text-white font-bold py-3 rounded-xl transition shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <Send size={14} /> Submit Support Ticket
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Customer Ticket Tracker */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h4 className="font-bold text-[#0B2A4D] text-sm border-b border-gray-100 pb-3 flex items-center justify-between">
          <span>My Submitted Support Tickets & Status</span>
          <span className="text-xs font-normal text-gray-400">Real-time Admin Sync</span>
        </h4>

        {myTickets.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">You have not submitted any helpdesk tickets yet.</p>
        ) : (
          <div className="space-y-3">
            {myTickets.map((t) => (
              <div key={t.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#0B2A4D]">{t.id}</span>
                      <span className="text-xs font-bold text-gray-800">• {t.subject}</span>
                    </div>
                    <p className="text-xs text-gray-500">{t.message}</p>
                  </div>
                  <div className="shrink-0 flex items-center gap-3">
                    <span className="text-[11px] text-gray-400 flex items-center gap-1"><Clock size={12} /> {t.date}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                      t.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {t.status === 'Resolved' ? <CheckCheck size={14} /> : <Clock size={14} />}
                      {t.status}
                    </span>
                  </div>
                </div>

                {t.status === 'Resolved' && t.adminResponse && (
                  <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-900 space-y-1">
                    <div className="font-bold flex items-center gap-1 text-emerald-800">
                      <CheckCheck size={14} /> Official Admin Response:
                    </div>
                    <p className="text-emerald-700 leading-relaxed">{t.adminResponse}</p>
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