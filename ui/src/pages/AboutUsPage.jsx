import React from 'react';
import { aboutUsData } from '../data/siteContent';

const AboutUsPage = () => {
  return (
    <div className="pt-32 px-8 max-w-5xl mx-auto pb-20">
      {/* Header Section */}
      <div className="mb-20">
        <h1 className="text-5xl font-extrabold text-[#2D4552] mb-8 tracking-tight">
          About Masafi Fleet Sync
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          {aboutUsData.background}
        </p>
      </div>

      {/* Uniform Mission & Vision Section */}
      <div className="grid md:grid-cols-2 gap-8 mb-20">
        <div className="p-8 border border-gray-200 rounded-2xl shadow-sm">
          <h2 className="text-2xl font-bold text-[#2D4552] mb-4">Our Mission</h2>
          <p className="text-base text-gray-600 leading-relaxed">{aboutUsData.mission}</p>
        </div>
        <div className="p-8 border border-gray-200 rounded-2xl shadow-sm">
          <h2 className="text-2xl font-bold text-[#2D4552] mb-4">Our Vision</h2>
          <p className="text-base text-gray-600 leading-relaxed">{aboutUsData.vision}</p>
        </div>
      </div>

      {/* Core Values Section */}
      <h2 className="text-3xl font-bold text-[#2D4552] mb-10">Our Core Values</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {aboutUsData.coreValues.map((value, idx) => (
          <div key={idx} className="p-8 border border-gray-200 rounded-2xl shadow-sm">
            <h3 className="font-bold text-xl text-[#2D4552] mb-4">{value.title}</h3>
            <p className="text-base text-gray-600 leading-relaxed">{value.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AboutUsPage;