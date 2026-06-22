import React from 'react';
import logo from '../../assets/logo/logo.png';

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-sm">
      <div className="flex items-center">
        <img src={logo} alt="Al-Waqar Transport Logo" className="h-12 w-auto" />
      </div>

      {/* Increased spacing to space-x-10 for breathing room */}
      <div className="hidden md:flex space-x-10 font-medium text-gray-700">
        <a href="/" className="hover:text-blue-700 transition px-2">Home</a>
        <a href="/bulk-water" className="hover:text-blue-700 transition px-2">Bulk Water Services</a>
        <a href="/fleet-rentals" className="hover:text-blue-700 transition px-2">Fleet Rentals</a>
        <a href="/faq" className="hover:text-blue-700 transition px-2">FAQ</a>
        <a href="/contact" className="hover:text-blue-700 transition px-2">Contact Us</a>
      </div>

      <div className="flex items-center space-x-6">
        <a href="/register-driver" className="text-gray-700 font-semibold hover:text-blue-600">
          Register as Driver
        </a>
        <a 
          href="/login" 
          className="px-6 py-2 bg-[#2D4552] text-white rounded-md font-semibold hover:bg-[#1a2831] transition"
        >
          Login
        </a>
      </div>
    </nav>
  );
};

export default Navbar;