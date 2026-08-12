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
  AlertCircle,
  CheckCircle,
  FileCheck
} from 'lucide-react';

import tanker1000gImg from '../../assets/images/Water-Tanker-1000g.png';
import tanker5000gImg from '../../assets/images/water-tanker-5000g.png';
import flatbedImg from '../../assets/images/heavy-flatbed-truck.png';
import towingImg from '../../assets/images/Towing-Truck.png';

const CustomerVehicleRentals = () => {
  const availableVehicles = [
    {
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
  
  const [bookingState, setBookingState] = useState('idle');
  const [contractId, setContractId] = useState('');

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
  const totalCost = subtotal + (selectedVehicle ? selectedVehicle.deposit : 0);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (rentalDays <= 0) {
      alert("Please select a valid lease duration (End date must be after start date).");
      return;
    }

    try {
      let customerId = "cmslp0iy30000xcuoff9hgxr7";
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed && parsed.id) {
            customerId = parsed.id;
          }
        } catch (err) {
          // fallback default
        }
      }

      const response = await fetch('http://127.0.0.1:3000/rentals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: customerId,
          vehicleCategory: selectedVehicle.category,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          totalPrice: totalCost
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create rental agreement on backend');
      }

      const data = await response.json();
      const generatedId = data.rental?.id ? `CNT-2026-${data.rental.id.slice(-3).toUpperCase()}` : 'CNT-2026-9941';
      setContractId(generatedId);
      setBookingState('pending_approval');
    } catch (error) {
      console.error("Rental submission error:", error);
      alert("Error submitting lease agreement to backend. Please ensure an active vehicle is available in inventory.");
    }
  };

  const simulateAdminApproval = () => {
    setBookingState('approved_contract');

    try {
      const storedInventory = JSON.parse(localStorage.getItem('fleetInventory') || '[]');
      const updated = storedInventory.map(item => item.displayId === selectedVehicle.displayId ? { ...item, status: 'Rented' } : item);
      localStorage.setItem('fleetInventory', JSON.stringify(updated));
    } catch (e) {
      console.warn("Inventory sync storage update notice:", e);
    }
  };

  const handleDownloadContract = () => {
    alert(`Downloading official signed PDF contract (${contractId}) to your device for company records.`);
  };

  const resetBooking = () => {
    setBookingState('idle');
    setSelectedVehicle(null);
    setStartDate('');
    setEndDate('');
    setContractId('');
  };

  return (
    <div className="w-full space-y-6 pb-12 font-sans text-sm">
      <div className="bg-gradient-to-r from-[#0B2A4D] via-[#103E73] to-[#0B2A4D] p-8 rounded-3xl shadow-xl text-white flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden border border-blue-900/50">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-white/5 skew-x-12 pointer-events-none"></div>
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/30 border border-blue-400/30 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase text-blue-200">
            <Building2 size={13} /> Al-Waqar Commercial Fleet Division
          </div>
          <h1 className="text-3xl font-black tracking-tight">Heavy Vehicle & Equipment Leasing Portal</h1>
          <p className="text-xs text-blue-100 max-w-xl leading-relaxed">
            Premium industrial water tankers, flatbeds, and recovery vehicles available for short and long-term B2B contracts.
          </p>
        </div>
      </div>

      {bookingState === 'pending_approval' && selectedVehicle && (
        <div className="bg-white rounded-3xl border-2 border-amber-400 shadow-2xl p-10 space-y-6 animate-in fade-in duration-300 max-w-3xl mx-auto">
          <div className="text-center space-y-3">
            <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border-4 border-amber-100 shadow-inner">
              <Clock size={40} className="animate-pulse" />
            </div>
            <h3 className="text-2xl font-extrabold text-[#0B2A4D]">Lease Request Submitted & Pending Review</h3>
            <p className="text-gray-600 max-w-lg mx-auto leading-relaxed">
              Your request for the <span className='font-bold text-blue-900'>{selectedVehicle.name}</span> has been received and logged in the database queue. Fleet management will review security deposit and availability.
            </p>
          </div>

          <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 space-y-4 text-xs">
            <div className="flex justify-between border-b border-gray-200 pb-3"><span className="text-gray-500 font-semibold">Selected Asset:</span><span className="font-bold text-[#0B2A4D]">{selectedVehicle.name}</span></div>
            <div className="flex justify-between border-b border-gray-200 pb-3"><span className="text-gray-500 font-semibold">Lease Duration:</span><span className="font-bold text-gray-800">{rentalDays} Days ({startDate} to {endDate})</span></div>
            <div className="flex justify-between border-b border-gray-200 pb-3"><span className="text-gray-500 font-semibold">Total Estimated Cost (Inc. Deposit):</span><span className="font-bold text-gray-900 text-lg">AED {totalCost}.00</span></div>
            <div className="flex justify-between items-center pt-2"><span className="text-gray-500 font-semibold">Status:</span><span className="bg-amber-100 text-amber-800 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">In Review Queue</span></div>
          </div>

          <div className="flex gap-5 pt-4">
            <button onClick={resetBooking} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 rounded-2xl text-sm transition cursor-pointer shadow-sm">Cancel Request</button>
            <button onClick={simulateAdminApproval} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl text-sm transition shadow-lg flex items-center justify-center gap-3 cursor-pointer"><CheckCircle size={18} /> Simulate Approval & Generate Contract</button>
          </div>
        </div>
      )}

      {bookingState === 'approved_contract' && selectedVehicle && (
        <div className="bg-white rounded-3xl border-2 border-emerald-500 shadow-2xl p-10 space-y-8 animate-in fade-in duration-300 max-w-4xl mx-auto">
          <div className="flex items-center justify-between border-b border-gray-100 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center border-4 border-emerald-100 font-bold shadow-inner"><FileCheck size={32} /></div>
              <div>
                <h3 className="text-2xl font-extrabold text-[#0B2A4D]">Lease Agreement Confirmed</h3>
                <p className="text-sm text-gray-500 font-medium">Contract Reference ID: <span className="font-bold text-emerald-700">{contractId}</span></p>
              </div>
            </div>
            <button onClick={resetBooking} className="text-gray-400 hover:text-gray-600 p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition cursor-pointer"><X size={24} /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-gray-50 p-8 rounded-2xl border border-gray-100 text-xs">
            <div className="space-y-2"><span className="text-gray-400 font-bold uppercase tracking-wider text-[11px]">Leased Asset</span><p className="font-extrabold text-[#0B2A4D] text-lg">{selectedVehicle.name}</p><p className="text-gray-600 text-sm">Capacity: {selectedVehicle.capacity}</p></div>
            <div className="space-y-2"><span className="text-gray-400 font-bold uppercase tracking-wider text-[11px]">Lease Timeline</span><p className="font-extrabold text-[#0B2A4D] text-lg">{rentalDays} Days</p><p className="text-gray-600 text-sm">{startDate} to {endDate}</p></div>
            <div className="space-y-2"><span className="text-gray-400 font-bold uppercase tracking-wider text-[11px]">Financial Status</span><p className="font-extrabold text-[#0B2A4D] text-lg">AED {totalCost}.00</p><p className="text-gray-600 text-sm">Deposit of AED {selectedVehicle.deposit} Secured</p></div>
          </div>

          <div className="flex justify-end gap-5 pt-4 border-t border-gray-100">
            <button onClick={resetBooking} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-8 py-4 rounded-2xl text-sm transition cursor-pointer shadow-sm">Return to Catalog</button>
            <button onClick={handleDownloadContract} className="bg-[#0B2A4D] hover:bg-blue-900 text-white font-bold px-8 py-4 rounded-2xl text-sm transition shadow-lg flex items-center gap-3 cursor-pointer"><Download size={18} /> Download Executed PDF Contract</button>
          </div>
        </div>
      )}

      {bookingState === 'idle' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {availableVehicles.map((vehicle, idx) => {
              const isSelected = selectedVehicle?.displayId === vehicle.displayId;
              return (
                <div key={idx} className={`bg-white rounded-3xl border transition-all shadow-md overflow-hidden flex flex-col justify-between group ${isSelected ? 'border-blue-600 ring-4 ring-blue-500/10 shadow-2xl scale-[1.01]' : 'border-slate-200 hover:border-slate-300 hover:shadow-xl'}`}>
                  <div>
                    <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                      <img src={vehicle.image} alt={vehicle.name} className="w-full h-full object-cover opacity-95 group-hover:scale-105 transition duration-700 ease-in-out" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent"></div>
                      <span className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm text-[#0B2A4D] px-3.5 py-1.5 rounded-full text-xs font-extrabold shadow-lg">AED {vehicle.dailyRate} / day</span>
                      <span className="absolute top-4 left-4 bg-[#0B2A4D]/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-wider shadow-md border border-white/10 uppercase">{vehicle.category}</span>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="text-base font-extrabold text-[#0B2A4D] tracking-tight">{vehicle.name}</h3>
                        <p className="text-xs text-slate-500 font-semibold mt-1">Model Year: {vehicle.modelYear} | Capacity: {vehicle.capacity}</p>
                      </div>
                      <ul className="space-y-2 text-xs text-slate-600">
                        {vehicle.specs.map((spec, i) => (
                          <li key={i} className="flex items-center gap-2.5"><ShieldCheck size={16} className="text-blue-600 shrink-0" /><span className="font-medium">{spec}</span></li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="p-6 pt-0">
                    <button onClick={() => setSelectedVehicle(vehicle)} className={`w-full py-3.5 rounded-2xl text-xs font-extrabold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2 ${isSelected ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 ring-2 ring-emerald-400' : 'bg-[#0B2A4D] hover:bg-blue-900 text-white'}`}>
                      {isSelected ? 'Asset Selected for Lease' : 'Select for Lease Booking'} <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="xl:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xl space-y-6 sticky top-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-[#0B2A4D] rounded-xl"><Calendar size={18} /></div>
                <h2 className="text-sm font-extrabold text-[#0B2A4D]">Lease Booking & Availability Calendar</h2>
              </div>
              {selectedVehicle && (
                <button onClick={() => setSelectedVehicle(null)} className="text-slate-500 hover:text-slate-700 text-xs font-bold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer shadow-sm">Cancel Selection</button>
              )}
            </div>

            {selectedVehicle ? (
              <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
                <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl space-y-1.5 shadow-sm">
                  <div className="flex justify-between items-center"><span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Active Selection</span><span className="text-[10px] font-bold text-slate-400">{selectedVehicle.displayId}</span></div>
                  <h4 className="text-xs font-black text-[#0B2A4D]">{selectedVehicle.name}</h4>
                  <p className="text-[11px] text-slate-500 font-medium">Daily Rate: AED {selectedVehicle.dailyRate} | Deposit: AED {selectedVehicle.deposit}</p>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Lease Start Date *</label>
                  <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#0B2A4D] text-slate-800" />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Lease End Date *</label>
                  <input type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#0B2A4D] text-slate-800" />
                </div>

                {rentalDays > 0 && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                    <div className="flex justify-between text-slate-600"><span>Total Duration:</span><span className="font-bold text-slate-900">{rentalDays} Days</span></div>
                    <div className="flex justify-between text-slate-600"><span>Lease Subtotal:</span><span className="font-bold text-slate-900">AED {subtotal}</span></div>
                    <div className="flex justify-between text-slate-600"><span>Security Deposit (Refundable):</span><span className="font-bold text-slate-900">AED {selectedVehicle.deposit}</span></div>
                    <div className="border-t border-slate-200 pt-2.5 flex justify-between items-center text-sm font-black text-[#0B2A4D]"><span>Total Payable:</span><span className="text-blue-900 text-base">AED {totalCost}</span></div>
                  </div>
                )}

                <button type="submit" className="w-full bg-[#0B2A4D] hover:bg-blue-900 text-white font-bold py-3.5 rounded-2xl transition shadow-md cursor-pointer flex items-center justify-center gap-2 text-xs tracking-wide">
                  <FileText size={15} /> Confirm Booking & Submit for Review
                </button>
              </form>
            ) : (
              <div className="text-center py-14 space-y-3 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 p-6">
                <Key size={32} className="text-slate-300 mx-auto" />
                <h4 className="text-xs font-black text-slate-700">No Vehicle Selected</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed max-w-[240px] mx-auto font-medium">Please browse the catalog and click <span className="font-bold text-slate-600">"Select for Lease Booking"</span> to open the calendar and submit your lease request.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerVehicleRentals;