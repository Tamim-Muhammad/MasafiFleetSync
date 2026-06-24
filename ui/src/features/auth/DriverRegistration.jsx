import React, { useState, useRef } from 'react';
import { ChevronRight, User, Phone, Lock, Eye, EyeOff, FileText, Truck, ShieldCheck, Upload, Mail, AlertTriangle, Camera, Smartphone, X } from 'lucide-react';
import driverHeroBg from '../../assets/images/DriverReg-hero.png';

const steps = [
  { id: 1, title: "CORE PERSONAL IDENTITY" },
  { id: 2, title: "LEGAL DRIVING CREDENTIALS" },
  { id: 3, title: "VEHICLE SPECIFICATIONS" },
  { id: 4, title: "COMPLIANCE CERTIFICATES" }
];

const DriverRegistration = () => {
  const [step, setStep] = useState(1);
  const [showPass, setShowPass] = useState(false);
  const [fileNames, setFileNames] = useState({ license: "", mulkiya: "", insurance: "", photos: "", profile: "" });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const licenseRef = useRef(null);
  const mulkiyaRef = useRef(null);
  const insuranceRef = useRef(null);
  const photosRef = useRef(null);
  const profileRef = useRef(null);

  const handleFileChange = (ref, key) => {
    const file = ref.current.files[0];
    if (file) {
      const validTypes = ["application/pdf", "image/jpeg", "image/png"];
      if (validTypes.includes(file.type)) {
        setFileNames(prev => ({ ...prev, [key]: file.name }));
      } else {
        alert("Invalid file type. Please upload a PDF, JPEG, or PNG.");
        ref.current.value = "";
      }
    }
  };

  const inputStyle = "w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D4552] focus:border-transparent transition-all";
  const labelStyle = "text-xs font-bold text-gray-500 uppercase block mb-1 mt-4";

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white p-8 rounded-lg max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Terms of Service</h3>
              <button onClick={() => setShowModal(false)}><X /></button>
            </div>
            <div className="text-sm text-gray-600 space-y-4">
              <p><strong>1. Compliance:</strong> By registering, you confirm that all provided documentation is authentic and legally obtained.</p>
              <p><strong>2. Telemetry:</strong> You acknowledge that Al-Waqar Transport utilizes real-time GPS tracking for fleet safety and logistical optimization.</p>
              <p><strong>3. Liability:</strong> The operator assumes full responsibility for maintaining valid vehicle registrations and licenses during the period of service.</p>
            </div>
            <button onClick={() => setShowModal(false)} className="mt-6 w-full bg-[#2D4552] text-white py-2 rounded font-bold">Close</button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="w-1/2 p-16 text-white flex flex-col justify-between relative" style={{ backgroundImage: `linear-gradient(rgba(45, 69, 82, 0.85), rgba(45, 69, 82, 0.85)), url(${driverHeroBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div>
          <h1 className="text-4xl font-extrabold mb-3 leading-tight">SYNCHRONIZED FLEET & LOGISTICS MANAGEMENT</h1>
          <p className="text-lg font-medium opacity-90 mb-20">A unified onboarding pipeline for field drivers and asset registration.</p>
          <div className="relative ml-4 space-y-16">
            {steps.map((s, index) => (
              <div key={s.id} className="flex items-center gap-8 relative">
                {index < steps.length - 1 && <div className="absolute left-[19px] top-10 h-16 w-0.5 bg-white/40" />}
                <div className={`w-10 h-10 rounded-full border-[6px] flex items-center justify-center shrink-0 z-10 transition-colors ${step >= s.id ? 'bg-white border-[#007bff]' : 'bg-transparent border-white'}`}>
                  {step === s.id && <div className="w-2.5 h-2.5 bg-[#007bff] rounded-full" />}
                </div>
                <div><p className="text-xs font-bold opacity-70">Step {s.id}:</p><h3 className="text-xl font-bold tracking-wider">{s.title}</h3></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="w-1/2 p-16 flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Driver & Asset Onboarding</h2>
          <form className="space-y-2" onSubmit={(e) => e.preventDefault()}>
            {step === 1 && (
              <>
                <div className="flex justify-center mb-4"><input type="file" ref={profileRef} className="hidden" onChange={() => handleFileChange(profileRef, 'profile')} />
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer border-2 border-dashed" onClick={() => profileRef.current.click()}>
                    {fileNames.profile ? <p className="text-xs truncate p-2">{fileNames.profile}</p> : <Camera size={30} className="text-gray-500" />}</div></div>
                <label className={labelStyle}>Full Name</label><div className="relative"><User className="absolute left-3 top-3.5 text-gray-400" size={18} /><input className={inputStyle} placeholder="Full Name" /></div>
                <label className={labelStyle}>Email Address</label><div className="relative"><Mail className="absolute left-3 top-3.5 text-gray-400" size={18} /><input className={inputStyle} placeholder="driver@masafi.com" /></div>
                <label className={labelStyle}>Phone & Emergency Contact</label>
                  <div className="flex gap-2"><div className="relative flex-1"><Phone className="absolute left-3 top-3.5 text-gray-400" size={18} /><input className={inputStyle} placeholder="Phone" /></div>
                  <div className="relative flex-1"><AlertTriangle className="absolute left-3 top-3.5 text-gray-400" size={18} /><input className={inputStyle} placeholder="Emergency #" /></div></div>
                <label className={labelStyle}>Password</label>
                  <div className="relative"><Lock className="absolute left-3 top-3.5 text-gray-400" size={18} /><input type={showPass ? "text" : "password"} className={inputStyle} placeholder="••••••••" /><button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3.5 text-gray-400">{showPass ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
                <label className={labelStyle}>SMS OTP Confirmation</label>
                  <div className="relative"><Smartphone className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    <input className={inputStyle} placeholder="Enter OTP" />
                    <button className="absolute right-2 top-2 bg-[#2D4552] text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-[#1f303a]">Request OTP</button>
                  </div>
              </>
            )}
            {step === 2 && (
              <>
                <label className={labelStyle}>License Number</label>
                <input className={inputStyle} placeholder="Enter License Number" />
                <label className={labelStyle}>Issuing Authority</label>
                <select className={inputStyle}>
                    <option value="">Select Authority</option>
                    <option value="dubai">Dubai RTA</option>
                    <option value="abu_dhabi">Abu Dhabi ITC</option>
                    <option value="fujairah">Fujairah Transport Authority</option>
                </select>
                <label className={labelStyle}>License Expiry Date</label>
                <input className={inputStyle} type="date" />
                <input type="file" ref={licenseRef} className="hidden" onChange={() => handleFileChange(licenseRef, 'license')} />
                <div className="mt-4 border-2 border-dashed border-gray-300 p-8 text-center rounded-lg cursor-pointer hover:border-[#2D4552]" onClick={() => licenseRef.current.click()}>
                    <Upload className="mx-auto text-gray-400 mb-2" /><p className="text-sm truncate px-2">{fileNames.license || "Upload Driving License"}</p>
                </div>
              </>
            )}
            {step === 3 && (
              <>
                <label className={labelStyle}>Vehicle Assignment</label>
                <select className={inputStyle}><option>1000 Gallon Water Tanker</option><option>5000 Gallon Water Tanker</option><option>Heavy Loading Vehicle</option></select>
                <label className={labelStyle}>Plate Number</label>
                <input className={inputStyle} placeholder="Enter Plate Number" />
                <label className={labelStyle}>Chassis Number</label>
                <input className={inputStyle} placeholder="Enter Chassis Number" />
              </>
            )}
            {step === 4 && (
              <>
                <label className={labelStyle}>Compliance Documents</label>
                <input type="file" ref={mulkiyaRef} className="hidden" onChange={() => handleFileChange(mulkiyaRef, 'mulkiya')} />
                <div className="border p-4 rounded-lg flex items-center gap-4 cursor-pointer hover:bg-gray-100" onClick={() => mulkiyaRef.current.click()}><ShieldCheck className="text-[#2D4552]" /> {fileNames.mulkiya || "Upload Mulkiya"}</div>
                <input type="file" ref={insuranceRef} className="hidden" onChange={() => handleFileChange(insuranceRef, 'insurance')} />
                <div className="border p-4 rounded-lg flex items-center gap-4 cursor-pointer hover:bg-gray-100" onClick={() => insuranceRef.current.click()}><FileText className="text-[#2D4552]" /> {fileNames.insurance || "Upload Insurance"}</div>
                <input type="file" ref={photosRef} className="hidden" onChange={() => handleFileChange(photosRef, 'photos')} />
                <div className="border p-4 rounded-lg flex items-center gap-4 cursor-pointer hover:bg-gray-100" onClick={() => photosRef.current.click()}><Truck className="text-[#2D4552]" /> {fileNames.photos || "Upload Photos"}</div>
                <label className="flex items-center text-sm text-gray-600 mt-4 cursor-pointer">
                  <input type="checkbox" className="mr-2" checked={acceptedTerms} onChange={() => setAcceptedTerms(!acceptedTerms)} />
                  <span>I agree to <button type="button" onClick={() => setShowModal(true)} className="text-[#2D4552] font-bold underline">Terms & Conditions</button></span>
                </label>
              </>
            )}
            <div className="flex gap-4 pt-4">
              <button disabled={step === 1} onClick={() => setStep(step - 1)} className="flex-1 py-3 border rounded-lg font-bold text-gray-600 disabled:opacity-40">Back</button>
              <button disabled={step === 4 && !acceptedTerms} onClick={() => setStep(step < 4 ? step + 1 : 4)} className="flex-1 bg-[#2D4552] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                {step === 4 ? "Submit" : "Next Step"} <ChevronRight size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default DriverRegistration;