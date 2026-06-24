import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import logo from '../../assets/logo/logo.png';
import loginHero from '../../assets/images/login-hero.png';

const LoginPortal = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex w-full">
      {/* Hero Image Container */}
      <div className="hidden lg:flex flex-1 relative bg-gray-900">
        <img 
          src={loginHero} 
          alt="Al-Waqar Fleet" 
          className="w-full h-full object-cover opacity-90" 
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Login Form Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <img src={logo} alt="Al-Waqar Logo" className="h-20 w-auto mb-2" />
            <p className="text-gray-500 font-medium">Operations Management Portal</p>
          </div>
          
          {/* Login Form */}
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email or Phone</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none transition duration-200 
                focus:border-[#2F5673] focus:ring-2 focus:ring-[#2F5673]/20 bg-gray-50 hover:bg-white" 
                placeholder="Enter your email or phone" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none transition duration-200 
                  focus:border-[#2F5673] focus:ring-2 focus:ring-[#2F5673]/20 bg-gray-50 hover:bg-white" 
                  placeholder="••••••••" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password Row */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-600 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="mr-2 h-4 w-4 text-[#2F5673] border-gray-300 rounded focus:ring-[#2F5673]" 
                />
                Remember me
              </label>
              <a href="/forgot-password" className="text-[#2F5673] hover:underline font-medium">
                Forgot Password?
              </a>
            </div>

            <button 
              type="submit" 
              className="w-full bg-[#2F5673] text-white py-3.5 rounded-lg font-bold text-lg hover:bg-[#1F3A4D] transition duration-200 shadow-md"
            >
              Sign In
            </button>
          </form>

          {/* Registration Options */}
          <div className="mt-8 text-center text-sm space-y-2">
            <p className="text-gray-500">Don't have an account?</p>
            <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
              <a href="/register-driver" className="text-[#2F5673] font-bold hover:underline">
                Register as Driver
              </a>
              <span className="hidden sm:inline text-gray-300">|</span>
              <a href="/signup" className="text-[#2F5673] font-bold hover:underline">
                Sign up as Customer
              </a>
            </div>
          </div>

          <div className="mt-12 text-center text-gray-400 text-xs">
            <p>© 2026 Al-Waqar Transport LLC</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPortal;