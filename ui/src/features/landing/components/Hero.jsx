import React from 'react';
import { Link } from 'react-router-dom';
import tankerIcon from '../../../assets/icons/tanker-icon.png';
import excavatorIcon from '../../../assets/icons/excavator-icon.png';
import heroBg from '../../../assets/images/hero-bg.png';

const Hero = () => {
  return (
    <section 
      className="relative py-24 px-8 text-center bg-cover bg-center bg-no-repeat font-sans"
      style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url(${heroBg})` }}
    >
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl font-extrabold text-white mb-4 tracking-tight leading-tight [text-shadow:_0_2px_4px_rgb(0_0_0_/_40%)]">
            SYNCHRONIZED FLEET & LOGISTICS MANAGEMENT
          </h1>
          <h2 className="text-2xl font-medium text-blue-100 mb-6 tracking-wide">
            FOR THE MASAFI/FUJAIRAH REGION
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white/95 border border-gray-100 rounded-3xl p-8 shadow-2xl transition flex flex-col justify-between">
            <div className="flex items-start justify-between gap-4 mb-8">
              <div className="text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Need Industrial Bulk Water?</h2>
                <p className="text-gray-600">Reliable bulk water deliveries delivered via COD.</p>
              </div>
              <img src={tankerIcon} alt="Water Tanker" className="h-20 w-auto object-contain flex-shrink-0" />
            </div>
            <Link to="/order" className="w-full block px-8 py-4 bg-[#2D4552] text-white rounded-xl font-bold hover:bg-[#1a2831] transition text-center text-lg">
              Order Tanker Now
            </Link>
          </div>

          <div className="bg-white/95 border border-gray-100 rounded-3xl p-8 shadow-2xl transition flex flex-col justify-between">
            <div className="flex items-start justify-between gap-4 mb-8">
              <div className="text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Looking to Lease Heavy Fleet Assets?</h2>
                <p className="text-gray-600">Browse our robust fleet of heavy vehicles and tankers.</p>
              </div>
              <img src={excavatorIcon} alt="Heavy Fleet" className="h-20 w-auto object-contain flex-shrink-0" />
            </div>
            <Link to="/rentals" className="w-full block px-8 py-4 bg-[#2D4552] text-white rounded-xl font-bold hover:bg-[#1a2831] transition text-center text-lg">
              Browse Rental Showroom
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;