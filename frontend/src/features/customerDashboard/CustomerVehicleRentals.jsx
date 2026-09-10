import React, { useState } from 'react';
import { 
  Calendar, 
  FileText, 
  ShieldCheck, 
  X, 
  Download, 
  Building2, 
  ArrowRight,
  Key,
  Clock,
  CheckCircle,
  FileCheck,
  CreditCard,
  MapPin,
  Phone,
  UserCheck,
  AlertCircle
} from 'lucide-react';

import tanker1000gImg from '../../assets/images/Water-Tanker-1000g.png';
import tanker5000gImg from '../../assets/images/water-tanker-5000g.png';
import flatbedImg from '../../assets/images/heavy-flatbed-truck.png';
import towingImg from '../../assets/images/Towing-Truck.png';

const CustomerVehicleRentals = () => {
  const availableVehicles = [
    {
      id: 1,
      displayId: 'V-1000T',
      name: '1,000 Gallon Compact Water Tanker',
      category: 'Water Tanker Fleet',
      modelYear: '2024',
      capacity: '1,000 Gallons',
      dailyRate: 180,
      deposit: 500,
      image: tanker1000gImg,
      specs: ['Urban Narrow Access', 'Quick-Release Hoses', 'Full Insurance Active']
    },
    {
      id: 2,
      displayId: 'V-5000T',
      name: '5,000 Gallon Heavy Water Tanker',
      category: 'Water Tanker Fleet',
      modelYear: '2025',
      capacity: '5,000 Gallons',
      dailyRate: 350,
      deposit: 1000,
      image: tanker5000gImg,
      specs: ['Heavy Duty Diesel', 'Dual Pumping Valves', 'Full Insurance Active']
    },
    {
      id: 3,
      displayId: 'V-FLT01',
      name: 'Heavy Loading Flatbed Truck',
      category: 'Machinery & Hauling',
      modelYear: '2025',
      capacity: '15 Ton Payloads',
      dailyRate: 450,
      deposit: 1200,
      image: flatbedImg,
      specs: ['Hydraulic Crane Lift', 'Reinforced Chassis', 'Mulkiya Included']
    },
    {
      id: 4,
      displayId: 'V-TOW01',
      name: 'Heavy Recovery & Towing Truck',
      category: 'Emergency Recovery',
      modelYear: '2025',
      capacity: 'Commercial Wrecker',
      dailyRate: 500,
      deposit: 1500,
      image: towingImg,
      specs: ['Winch & Boom System', 'Roadside Support Kit', '24/7 Ready']
    }
  ];

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [depositMethod, setDepositMethod] = useState('Corporate Post-Dated Cheque (PDC)');
  
  // Enhanced Professional B2B Lease Verification Fields
  const [companyName, setCompanyName] = useState('');
  const [tradeLicense, setTradeLicense] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [signatoryName, setSignatoryName] = useState('');
  const [projectSite, setProjectSite] = useState('');
  const [driverLicenseVerified, setDriverLicenseVerified] = useState(false);

  const [bookingState, setBookingState] = useState('idle');
  const [contractId, setContractId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Professional Error Handling State
  const [errorMessage, setErrorMessage] = useState('');

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const rentalDays = calculateDays();
  const subtotal = selectedVehicle ? rentalDays * selectedVehicle.dailyRate : 0;
  const securityDeposit = selectedVehicle ? selectedVehicle.deposit : 0;
  const totalCost = rentalDays > 0 ? subtotal + securityDeposit : 0;

  // --- BULLETPROOF TOKEN EXTRACTOR ---
  const getAuthToken = () => {
    const storedUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
    return localStorage.getItem('token') || 
           sessionStorage.getItem('token') || 
           localStorage.getItem('jwt') || 
           localStorage.getItem('userToken') || 
           storedUser.token;
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (rentalDays <= 0) {
      setErrorMessage("Please select a valid lease duration. The end date must be after the start date.");
      return;
    }

    if (!driverLicenseVerified) {
      setErrorMessage("Please confirm that the assigned driver holds a verified Commercial Heavy Vehicle License.");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = getAuthToken();
      if (!token) {
        setErrorMessage("Authentication error: No session token found. Please log out and log back in.");
        setIsSubmitting(false);
        return;
      }

      const response = await fetch('http://localhost:5191/api/RentalAgreements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          VehicleId: selectedVehicle.id,
          VehicleCategory: selectedVehicle.name,
          StartDate: new Date(startDate).toISOString(),
          EndDate: new Date(endDate).toISOString(),
          DailyRate: selectedVehicle.dailyRate,
          SecurityDeposit: selectedVehicle.deposit,
          TotalPrice: totalCost,
          DepositMethod: depositMethod,
          CompanyName: companyName,
          TradeLicenseNo: tradeLicense,
          ContactPhone: contactPhone,
          SignatoryName: signatoryName,
          ProjectSite: projectSite,
          IsDriverCertified: driverLicenseVerified
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
            setErrorMessage("Your session has expired. Please log out and log back in.");
            setIsSubmitting(false);
            return;
        }
        throw new Error('Failed to register lease agreement with backend server.');
      }

      const data = await response.json();
      const generatedId = data.rental?.contractReferenceNo || `CNT-2026-${Math.floor(100 + Math.random() * 900)}`;
      setContractId(generatedId);
      setBookingState('pending_approval');
      setSelectedVehicle(null); // Close modal on success

    } catch (error) {
      console.error("Rental submission error:", error);
      setErrorMessage("Error submitting lease agreement to backend server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetBooking = () => {
    setBookingState('idle');
    setSelectedVehicle(null);
    setStartDate('');
    setEndDate('');
    setCompanyName('');
    setTradeLicense('');
    setContactPhone('');
    setSignatoryName('');
    setProjectSite('');
    setDriverLicenseVerified(false);
    setContractId('');
    setErrorMessage('');
  };

  return (
    <div className="w-full space-y-6 pb-12 font-sans text-sm relative">
      {/* Page Header */}
      <div className="space-y-1">
        <div className="text-xs font-bold text-blue-600 uppercase tracking-widest">
          Al-Waqar Commercial Fleet Division
        </div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Heavy Vehicle & Equipment Leasing Portal</h1>
        <p className="text-xs text-gray-500 font-medium">
          Premium industrial water tankers, flatbeds, and recovery vehicles available for short and long-term B2B contracts.
        </p>
      </div>

      {/* SUCCESS STATE */}
      {bookingState === 'pending_approval' && (
        <div className="bg-white rounded-3xl border-2 border-amber-400 shadow-xl p-6 space-y-4 max-w-xl mx-auto animate-in fade-in duration-200 mt-8">
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border-2 border-amber-100 shadow-inner">
              <Clock size={24} className="animate-pulse" />
            </div>
            <h3 className="text-lg font-extrabold text-[#0B2A4D]">Lease Request Submitted & Pending Review</h3>
            <p className="text-gray-500 text-[11px] max-w-sm mx-auto leading-relaxed">
              Your request has been securely logged for <span className="font-semibold text-gray-800">{companyName}</span> (Rep: {signatoryName}).
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2 text-xs">
            <div className="flex justify-between border-b border-gray-200 pb-1.5"><span className="text-gray-500 font-semibold">Contract Reference:</span><span className="font-bold text-amber-700">{contractId}</span></div>
            <div className="flex justify-between border-b border-gray-200 pb-1.5"><span className="text-gray-500 font-semibold">Lessee Entity:</span><span className="font-bold text-gray-800">{companyName} (Lic: {tradeLicense})</span></div>
            <div className="flex justify-between border-b border-gray-200 pb-1.5"><span className="text-gray-500 font-semibold">Authorized Signatory:</span><span className="font-bold text-gray-800">{signatoryName} ({contactPhone})</span></div>
            <div className="flex justify-between border-b border-gray-200 pb-1.5"><span className="text-gray-500 font-semibold">Operating Project Site:</span><span className="font-bold text-gray-800">{projectSite}</span></div>
            <div className="flex justify-between border-b border-gray-200 pb-1.5"><span className="text-gray-500 font-semibold">Lease Timeline:</span><span className="font-bold text-gray-800">{rentalDays} Days ({startDate} to {endDate})</span></div>
            <div className="flex justify-between border-b border-gray-200 pb-1.5"><span className="text-gray-500 font-semibold">Total Initial Payable:</span><span className="font-bold text-gray-900 text-sm">AED {totalCost}.00</span></div>
            <div className="flex justify-between items-center pt-1"><span className="text-gray-500 font-semibold">Status:</span><span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">In Admin Review Queue</span></div>
          </div>

          <div className="pt-1">
            <button onClick={resetBooking} className="w-full bg-[#0B2A4D] hover:bg-blue-900 text-white font-bold py-3 rounded-xl text-xs transition shadow-md cursor-pointer">
              Return to Fleet Catalog
            </button>
          </div>
        </div>
      )}

      {/* FULL WIDTH CATALOG GRID - 2x2 Layout taking complete width */}
      {bookingState === 'idle' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mt-8 w-full">
          {availableVehicles.map((vehicle, idx) => {
            return (
              <div key={idx} className="bg-white rounded-3xl border border-slate-200 hover:border-slate-300 transition-all shadow-sm hover:shadow-lg overflow-hidden flex flex-col justify-between group">
                <div>
                  <div className="relative h-72 w-full overflow-hidden bg-slate-100">
                    <img src={vehicle.image} alt={vehicle.name} className="w-full h-full object-cover opacity-95 group-hover:scale-105 transition duration-500 ease-in-out" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
                    <span className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm text-[#0B2A4D] px-4 py-2 rounded-full text-sm font-extrabold shadow-md">
                      AED {vehicle.dailyRate} / day
                    </span>
                    <span className="absolute top-4 left-4 bg-[#0B2A4D]/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-wider shadow-xs uppercase">
                      {vehicle.category}
                    </span>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-extrabold text-[#0B2A4D] tracking-tight">{vehicle.name}</h3>
                      <p className="text-xs text-slate-500 font-semibold mt-1">Model Year: {vehicle.modelYear} | Capacity: {vehicle.capacity}</p>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-600">
                      {vehicle.specs.map((spec, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <ShieldCheck size={16} className="text-blue-600 shrink-0" />
                          <span className="font-medium text-xs">{spec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="p-6 pt-0 mt-2">
                  <button 
                    onClick={() => { 
                      setSelectedVehicle(vehicle); 
                      setErrorMessage(''); 
                    }} 
                    className="w-full py-4 rounded-xl text-xs font-extrabold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2 bg-[#0B2A4D] hover:bg-blue-900 text-white"
                  >
                    Select for Lease Booking <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PROFESSIONAL MODAL FOR BOOKING FORM (Compacted) */}
      {selectedVehicle && bookingState === 'idle' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-5 lg:p-6 space-y-4 animate-in fade-in zoom-in duration-200 my-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-[#0B2A4D] rounded-xl"><Calendar size={20} /></div>
                <div>
                  <h2 className="text-lg font-black text-[#0B2A4D]">Lease Booking Configuration</h2>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Complete the B2B commercial details below.</p>
                </div>
              </div>
              <button 
                onClick={() => { setSelectedVehicle(null); setErrorMessage(''); }} 
                className="text-slate-400 hover:text-slate-600 p-2 bg-slate-50 rounded-xl transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl flex items-start gap-2.5 text-xs font-bold shadow-sm">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
                <p className="leading-relaxed">{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
              
              {/* Asset Selected Summary */}
              <div className="bg-slate-50 border border-slate-200/70 p-3 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-1">Active Selection</span>
                  <h4 className="text-sm font-black text-[#0B2A4D]">{selectedVehicle.name}</h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">Asset ID: {selectedVehicle.displayId}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-slate-500 font-bold uppercase mb-0.5">Daily Rate</p>
                  <p className="text-base font-black text-[#0B2A4D]">AED {selectedVehicle.dailyRate}</p>
                </div>
              </div>

              {/* B2B Commercial & Signatory Details */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider border-b border-slate-100 pb-1">Lessee Information</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-700 text-[11px] flex items-center gap-1.5"><Building2 size={14} className="text-blue-600" /> Company Name *</label>
                    <input type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. Al-Futtaim Engineering LLC" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#0B2A4D] text-slate-800 text-xs transition" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-700 text-[11px] flex items-center gap-1.5"><FileCheck size={14} className="text-blue-600" /> Trade License # *</label>
                    <input type="text" required value={tradeLicense} onChange={(e) => setTradeLicense(e.target.value)} placeholder="e.g. TRD-998214" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#0B2A4D] text-slate-800 text-xs transition" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-700 text-[11px] flex items-center gap-1.5"><UserCheck size={14} className="text-blue-600" /> Authorized Signatory *</label>
                    <input type="text" required value={signatoryName} onChange={(e) => setSignatoryName(e.target.value)} placeholder="e.g. Eng. John Doe" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#0B2A4D] text-slate-800 text-xs transition" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-700 text-[11px] flex items-center gap-1.5"><Phone size={14} className="text-blue-600" /> Contact Phone *</label>
                    <input type="text" required value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="e.g. +971 50 987 6543" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#0B2A4D] text-slate-800 text-xs transition" />
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block font-bold text-slate-700 text-[11px] flex items-center gap-1.5"><MapPin size={14} className="text-blue-600" /> Project Site / Location *</label>
                    <input type="text" required value={projectSite} onChange={(e) => setProjectSite(e.target.value)} placeholder="e.g. Fujairah Port Phase 2" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#0B2A4D] text-slate-800 text-xs transition" />
                  </div>
                </div>
              </div>

              {/* Lease Duration & Terms */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider border-b border-slate-100 pb-1">Lease Timeline & Terms</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-700 text-[11px]">Start Date *</label>
                    <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#0B2A4D] text-slate-800 text-xs transition" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-700 text-[11px]">End Date *</label>
                    <input type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#0B2A4D] text-slate-800 text-xs transition" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-700 text-[11px] flex items-center gap-1.5"><CreditCard size={14} className="text-blue-600" /> Security Guarantee *</label>
                    <select value={depositMethod} onChange={(e) => setDepositMethod(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#0B2A4D] text-slate-800 cursor-pointer text-xs transition">
                      <option value="Corporate Post-Dated Cheque (PDC)">Corporate Post-Dated Cheque (PDC)</option>
                      <option value="Bank Wire Transfer (IBAN)">Bank Wire Transfer (IBAN)</option>
                      <option value="Depot Cash Escrow">Depot Cash Escrow Guarantee</option>
                    </select>
                  </div>
                </div>

                <div className="pt-1">
                  <label className="flex items-start gap-3 cursor-pointer bg-blue-50/50 p-3 rounded-xl border border-blue-100 transition hover:bg-blue-50">
                    <input 
                      type="checkbox" 
                      required 
                      checked={driverLicenseVerified} 
                      onChange={(e) => setDriverLicenseVerified(e.target.checked)} 
                      className="mt-0.5 rounded border-slate-300 w-4 h-4 text-[#0B2A4D] focus:ring-[#0B2A4D]" 
                    />
                    <span className="text-[11px] text-slate-700 font-medium leading-relaxed">
                      I confirm and warrant that our assigned operator holds a valid UAE Commercial Heavy Vehicle / Equipment License, and agree to the Al-Waqar Transport Terms of Service.
                    </span>
                  </label>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span className="font-semibold">Calculated Duration:</span>
                  <span className="font-black text-slate-900">{rentalDays > 0 ? `${rentalDays} Days` : 'Select dates'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="font-semibold">Lease Subtotal:</span>
                  <span className="font-black text-slate-900">AED {subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="font-semibold">Security Deposit:</span>
                  <span className="font-black text-emerald-700">AED {securityDeposit}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-sm font-black text-[#0B2A4D]">
                  <span>Total Initial Payable:</span>
                  <span className="text-lg">AED {totalCost}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <button 
                  type="button" 
                  onClick={() => { setSelectedVehicle(null); setErrorMessage(''); }}
                  className="flex-1 bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-[2] bg-[#0B2A4D] hover:bg-blue-900 text-white font-bold py-2.5 rounded-xl transition shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : (
                    <>
                      <FileText size={16} /> Confirm Booking & Submit
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerVehicleRentals;