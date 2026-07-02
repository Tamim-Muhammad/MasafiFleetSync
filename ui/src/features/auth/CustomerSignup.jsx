import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import signupHero from '../../assets/images/Signup-hero.png';
import logo from '../../assets/logo/logo.png';

const CustomerSignup = () => {
  const [formData, setFormData] = useState({
    fullName: '', phone: '', email: '', password: '', confirmPassword: '', otp: ''
  });
  
  const [activePolicy, setActivePolicy] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    let tempErrors = {};
    if (!formData.fullName) tempErrors.fullName = "Full name is required";
    if (formData.phone.length < 7) tempErrors.phone = "Invalid phone number";
    if (formData.password !== formData.confirmPassword) tempErrors.confirmPassword = "Passwords do not match";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log("Form submitted successfully:", formData);
    setIsLoading(false);
  };

  const handleSendOtp = () => {
    if (!formData.phone) return setErrors({ phone: "Enter phone first" });
    alert("Verification code sent successfully.");
  };

  return (
    <div className="flex h-screen w-full bg-gray-50">
      <div className="hidden lg:flex w-1/2 relative">
        <img src={signupHero} alt="Al-Waqar Logistics" className="object-cover w-full h-full" />
        <div className="absolute inset-0 bg-black/30 flex flex-col justify-start pt-24 px-12 text-white">
          <h1 className="text-4xl font-bold mb-4 leading-tight">Water Transport &<br />Heavy Fleet Services</h1>
          <p className="text-xl max-w-sm">Integrated Logistics, Reliable Water Supply, and Premium Vehicle Leasing for the UAE region.</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Logo Restored */}
          <img src={logo} alt="Al-Waqar Logo" className="h-16 mb-6 mx-auto" />
          <h2 className="text-2xl font-bold mb-6 text-center">Create Your Account</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input type="text" className={`w-full p-3 border rounded-lg focus:border-[#2F5673] focus:ring-1 focus:ring-[#2F5673] outline-none transition ${errors.fullName ? 'border-red-500' : ''}`} required onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <div className="flex gap-2">
                <div className="p-3 border rounded-lg bg-gray-50 font-medium flex items-center">🇦🇪 +971</div>
                <input type="tel" className="flex-1 p-3 border rounded-lg focus:border-[#2F5673] focus:ring-1 focus:ring-[#2F5673] outline-none transition" placeholder="50-XXXXXXX" required onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                <button type="button" onClick={handleSendOtp} className="px-4 py-2 bg-gray-100 border rounded-lg text-sm font-semibold hover:bg-gray-200 transition">Send Code</button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Verification Code</label>
              <input type="text" maxLength="6" placeholder="Enter 6-digit OTP" className="w-full p-3 border rounded-lg focus:border-[#2F5673] focus:ring-1 focus:ring-[#2F5673] outline-none transition" required onChange={(e) => setFormData({...formData, otp: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email Address</label>
              <input type="email" className="w-full p-3 border rounded-lg focus:border-[#2F5673] focus:ring-1 focus:ring-[#2F5673] outline-none transition" required onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder="••••••••" className="w-full p-3 border rounded-lg focus:border-[#2F5673] focus:ring-1 focus:ring-[#2F5673] outline-none transition" required onChange={(e) => setFormData({...formData, password: e.target.value})} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              <div className="relative">
                <input type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" className={`w-full p-3 border rounded-lg focus:border-[#2F5673] focus:ring-1 focus:ring-[#2F5673] outline-none transition ${errors.confirmPassword ? 'border-red-500' : ''}`} required onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            <div className="text-xs text-gray-500 mt-2">
              <input type="checkbox" required className="mr-2" />
              By clicking "Submit", you agree to our <button type="button" onClick={() => setActivePolicy('terms')} className="text-[#2F5673] underline">Terms of Service</button>, 
              acknowledge our <button type="button" onClick={() => setActivePolicy('privacy')} className="text-[#2F5673] underline">Privacy Policy</button>, and consent to receiving notifications.
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-[#1e3a4a] text-white p-4 rounded-lg font-bold hover:bg-[#2c5364] transition disabled:opacity-50">
              {isLoading ? "PROCESSING..." : "SUBMIT"}
            </button>
          </form>
        </div>
      </div>

      {activePolicy && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-lg max-w-lg max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{activePolicy === 'terms' ? 'Terms of Service' : 'Privacy Policy'}</h2>
            <p className="text-sm text-gray-600 mb-6">{activePolicy === 'terms' ? 'Terms: By using Al-Waqar Fleet Sync, you agree to lawful use of our logistics services...' : 'Privacy: We protect your data and use it solely for fleet management and service communication...'}</p>
            <button onClick={() => setActivePolicy(null)} className="bg-[#1e3a4a] text-white px-6 py-2 rounded">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerSignup;