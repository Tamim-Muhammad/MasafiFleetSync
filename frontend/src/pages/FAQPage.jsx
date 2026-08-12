import React from 'react';
import { faqData } from '../data/siteContent';

const FAQPage = () => {
  return (
    <div className="pt-32 px-8 max-w-5xl mx-auto pb-20">
      {/* Consistent Heading Style */}
      <h1 className="text-5xl font-extrabold text-[#2D4552] mb-12 tracking-tight">
        Frequently Asked Questions
      </h1>
      
      <div className="space-y-6">
        {faqData.map((item, index) => (
          <div 
            key={index} 
            className="p-8 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all"
          >
            {/* Consistent Sub-header Style */}
            <h3 className="font-bold text-xl text-[#2D4552] mb-3">
              {item.q}
            </h3>
            {/* Consistent Body Style */}
            <p className="text-base text-gray-600 leading-relaxed">
              {item.a}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQPage;