import React from 'react';
import { servicesData } from '../data/siteContent';

const ServicesPage = () => {
  return (
    <div className="pt-32 px-8 max-w-6xl mx-auto pb-20">
      {/* Consistent Heading Style */}
      <h1 className="text-5xl font-extrabold text-[#2D4552] mb-12 tracking-tight">
        Our Professional Services
      </h1>
      
      {/* Consistent Grid Layout */}
      <div className="grid md:grid-cols-2 gap-8">
        {servicesData.map((service, index) => (
          <div 
            key={index} 
            className="p-10 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all"
          >
            {/* Consistent Sub-header Style */}
            <h3 className="font-bold text-2xl text-[#2D4552] mb-4">
              {service.title}
            </h3>
            {/* Consistent Body Style */}
            <p className="text-base text-gray-600 leading-relaxed">
              {service.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesPage;