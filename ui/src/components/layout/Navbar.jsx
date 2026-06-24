import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo/logo.png';

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-sm">
      <div className="flex items-center">
        <img src={logo} alt="Al-Waqar Transport Logo" className="h-12 w-auto" />
      </div>

      <div className="hidden md:flex space-x-10 font-medium text-gray-700">
        <Link to="/" className="hover:text-blue-700 transition px-2">Home</Link>
        <Link to="/bulk-water" className="hover:text-blue-700 transition px-2">Bulk Water Services</Link>
        <Link to="/fleet-rentals" className="hover:text-blue-700 transition px-2">Fleet Rentals</Link>
        <Link to="/faq" className="hover:text-blue-700 transition px-2">FAQ</Link>
        <Link to="/contact" className="hover:text-blue-700 transition px-2">Contact Us</Link>
      </div>

      <div className="flex items-center space-x-6">
        <Link to="/register-driver" className="text-gray-700 font-semibold hover:text-blue-600">
          Register as Driver
        </Link>
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