import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo/logo.png';

const Navbar = () => {
  return (
    // 'bg-white/80' gives a light glass look, 'backdrop-blur-md' adds the pro feel
    <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="flex items-center">
        {/* Your logo remains perfectly visible on light background */}
        <img src={logo} alt="Al-Waqar Transport Logo" className="h-12 w-auto" />
      </div>

      <div className="hidden md:flex space-x-10 font-medium text-gray-800">
        <Link to="/" className="hover:text-blue-700 transition px-2">Home</Link>
        <Link to="/services" className="hover:text-blue-700 transition px-2">Services</Link>
        <Link to="/about" className="hover:text-blue-700 transition px-2">About Us</Link>
        <Link to="/faq" className="hover:text-blue-700 transition px-2">FAQ</Link>
        <Link to="/contact" className="hover:text-blue-700 transition px-2">Contact Us</Link>
      </div>

      <div className="flex items-center space-x-6">
        <Link to="/register-driver" className="text-gray-800 font-semibold hover:text-blue-600 transition">
          Register as Driver
        </Link>
        {/* Login button color preserved exactly as you wanted */}
        <Link 
          to="/login" 
          className="px-6 py-2 bg-[#2D4552] text-white rounded-md font-semibold hover:bg-[#1a2831] transition"
        >
          Login
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;