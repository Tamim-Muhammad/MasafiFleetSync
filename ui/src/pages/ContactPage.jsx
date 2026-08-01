import React from 'react';
import { contactData } from '../data/siteContent';

const ContactPage = () => {
  return (
    <div className="pt-32 px-8 max-w-6xl mx-auto pb-20">
      <div className="grid md:grid-cols-2 gap-16 items-start">
        {/* Left Column: Contact Details */}
        <div>
          <h1 className="text-5xl font-extrabold text-[#2D4552] mb-8 tracking-tight">Let's Connect</h1>
          <p className="text-lg text-gray-600 mb-12 leading-relaxed max-w-lg">
            {contactData.description}
          </p>
          
          <div className="space-y-10">
            {/* Location */}
            <div className="flex items-start gap-5">
              <span className="text-3xl mt-1">📍</span>
              <div>
                <h4 className="font-bold text-lg text-[#2D4552] uppercase tracking-wide">Our Location</h4>
                <p className="text-base text-gray-600 mt-1">{contactData.headquarters}</p>
              </div>
            </div>
            {/* Hotline */}
            <div className="flex items-start gap-5">
              <span className="text-3xl mt-1">📞</span>
              <div>
                <h4 className="font-bold text-lg text-[#2D4552] uppercase tracking-wide">Support Hotline</h4>
                <p className="text-base text-gray-600 mt-1">{contactData.hotline}</p>
              </div>
            </div>
            {/* Email */}
            <div className="flex items-start gap-5">
              <span className="text-3xl mt-1">📧</span>
              <div>
                <h4 className="font-bold text-lg text-[#2D4552] uppercase tracking-wide">Email Support</h4>
                <p className="text-base text-gray-600 mt-1">{contactData.supportEmail}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Action Card */}
        <div className="bg-[#2D4552] p-10 rounded-3xl text-white shadow-2xl h-fit">
          <h3 className="text-2xl font-bold mb-4">Need Immediate Help?</h3>
          <p className="text-blue-100 text-base mb-8 leading-relaxed">
            Our dispatch team operates 24/7 to assist with emergency recovery or urgent tanker scheduling requirements.
          </p>
          <a 
            href={`tel:${contactData.hotline}`} 
            className="block text-center py-4 bg-white text-[#2D4552] font-bold text-base rounded-xl hover:bg-gray-100 transition shadow-lg"
          >
            Call Dispatch Now
          </a>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;