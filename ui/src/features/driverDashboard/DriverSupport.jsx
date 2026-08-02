import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  HelpCircle, 
  PhoneCall, 
  Mail, 
  Send, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2,
  Headphones,
  MapPin
} from 'lucide-react';

const DriverSupport = () => {
  const navigate = useNavigate();
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [msgSent, setMsgSent] = useState(false);
  const [formData, setFormData] = useState({ subject: '', message: '' });

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
    setMsgSent(true);
    setTimeout(() => {
      setMsgSent(false);
      setFormData({ subject: '', message: '' });
    }, 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 relative">
      
      {/* Top Header & Back Navigation */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-xs font-bold text-gray-600 hover:text-blue-600 bg-white px-4 py-2.5 rounded-xl border border-gray-200 transition-colors shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
        <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-100 flex items-center gap-1.5">
          <Headphones className="w-3.5 h-3.5" /> 24/7 DRIVER ASSISTANCE DESK
        </span>
      </div>

      {/* Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-blue-200 flex items-center space-x-4">
        <div className="bg-blue-600 text-white p-3.5 rounded-xl shadow-sm">
          <HelpCircle className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-blue-900 font-bold text-lg">Driver Help Center & Support</h3>
          <p className="text-gray-500 text-xs mt-0.5">Our dedicated support team is available around the clock to assist with emergency recovery dispatch, order inquiries, and compliance documentation support.</p>
        </div>
      </div>

      {/* Contact Cards Grid (Matching Landing Page Details) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Support Hotline */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 flex items-center space-x-4">
          <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl shrink-0">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider text-gray-400">Support Hotline</h4>
            <a href="tel:+971508821944" className="text-sm font-bold text-blue-600 hover:underline mt-1 inline-block">
              +971-50-882-1944
            </a>
          </div>
        </div>

        {/* Email Support */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 flex items-center space-x-4">
          <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl shrink-0">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider text-gray-400">Email Support</h4>
            <span className="text-xs font-bold text-gray-800 mt-1 block truncate">
              support@masafifleetsync.com
            </span>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 flex items-center space-x-4">
          <div className="bg-purple-50 text-purple-600 p-4 rounded-2xl shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider text-gray-400">Our Location</h4>
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
              <h5 className="font-bold text-emerald-900 text-xs">Message Sent Successfully!</h5>
              <p className="text-[11px] text-emerald-600">Our dispatch team will review your ticket and reply shortly.</p>
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

    </div>
  );
};

export default DriverSupport;