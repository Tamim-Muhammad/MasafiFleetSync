import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  ShieldCheck, 
  Truck, 
  ArrowRight,
  Info,
  Loader2,
  LayoutDashboard,
  TrendingUp,
  MapPin,
  Coffee,
  Bell,
  ChevronRight,
  X,
  Radio,
  CheckCircle2
} from 'lucide-react';
import axios from 'axios';

const DriverDashboardHome = () => {
  const navigate = useNavigate();
  
  // Dynamic States
  const [loading, setLoading] = useState(true);
  const [activeJob, setActiveJob] = useState(null);
  
  // Announcement States
  const [allAnnouncements, setAllAnnouncements] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [earnings, setEarnings] = useState({ 
    todayNet: '0.00', 
    todayCount: 0,
    history: [] 
  });

  const [compliance, setCompliance] = useState({
    status: 'Pending',
    licenseDays: null,
    insuranceDays: null,
    registrationDays: null
  });

  // STRICT FIX: Only check for driverId. Absolutely NO fallbacks to user.id or hardcoded 28.
  const getDriverId = () => {
    const storedUser = JSON.parse(sessionStorage.getItem('user') || '{}');
    const localUser = JSON.parse(localStorage.getItem('user') || '{}');
    
    return storedUser.driverId || localUser.driverId || null; 
  };
  const driverId = getDriverId();

  useEffect(() => {
    // Only fetch data if we successfully found a Driver ID
    if (driverId) {
      fetchDashboardData();
      fetchAnnouncements();
    } else {
      setLoading(false);
    }
  }, [driverId]);

  const fetchAnnouncements = async () => {
    const allBroadcasts = JSON.parse(localStorage.getItem('admin_system_broadcasts') || '[]');
    const driverAnnouncements = allBroadcasts.filter(a => 
      !a.audience || a.audience.includes('All') || a.audience.includes('Driver')
    );
    setAllAnnouncements(driverAnnouncements);
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      try {
        const jobRes = await axios.get(`http://localhost:5191/api/WaterOrders/driver/${driverId}/active`);
        setActiveJob(jobRes.data);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setActiveJob(null);
        }
      }

      try {
        const docRes = await axios.get(`http://localhost:5191/api/drivers/${driverId}/documents`);
        if (docRes.data && docRes.data.documents) {
          const docs = docRes.data.documents;
          
          const getDays = (keyword) => {
            const doc = docs.find(d => d.category.toLowerCase().includes(keyword.toLowerCase()));
            if (!doc || !doc.expiryDate) return null;
            const expiry = new Date(doc.expiryDate);
            const today = new Date();
            return Math.max(0, Math.ceil((expiry - today) / (1000 * 60 * 60 * 24)));
          };

          setCompliance({
            status: docRes.data.complianceStatus || 'Compliant',
            licenseDays: getDays('license'),
            insuranceDays: getDays('insurance'),
            registrationDays: getDays('registration') 
          });
        }
      } catch (err) {
        console.error("Failed to fetch compliance");
      }

      try {
        const earnRes = await axios.get(`http://localhost:5191/api/DriverDeliveries/driver/${driverId}`);
        if (earnRes.data && Array.isArray(earnRes.data)) {
          const now = new Date();
          
          const parseSqlDate = (dateStr) => {
            if (!dateStr) return null;
            const d = new Date(dateStr);
            return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
          };
          
          const todayTime = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
          const todayRecords = earnRes.data.filter(r => parseSqlDate(r.completedAt || r.CompletedAt) === todayTime);
          
          let grossSum = 0;
          todayRecords.forEach(r => grossSum += Number(r.amount || r.Amount || 0));
          const netSum = grossSum * 0.90;

          const history = [];
          for (let i = 6; i >= 0; i--) {
            const targetDate = new Date(now);
            targetDate.setDate(now.getDate() - i);
            const targetTime = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()).getTime();
            
            const dayRecords = earnRes.data.filter(r => parseSqlDate(r.completedAt || r.CompletedAt) === targetTime);
            const dayNet = dayRecords.reduce((sum, r) => sum + (Number(r.amount || r.Amount || 0) * 0.90), 0);
            
            history.push({ 
              day: targetDate.toLocaleDateString('en-US', { weekday: 'short' }), 
              amount: dayNet 
            });
          }

          setEarnings({
            todayNet: netSum.toFixed(2),
            todayCount: todayRecords.length,
            history: history
          });
        }
      } catch (err) {
        console.error("Failed to fetch earnings");
      }

    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500 font-bold text-sm">Syncing Fleet Telemetry...</p>
      </div>
    );
  }

  // SAFETY GUARD: If the driver ID is totally missing, show this instead of crashing or showing Sohail
  if (!driverId) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center font-sans animate-in fade-in">
        <div className="bg-amber-50 text-amber-600 p-5 rounded-full mb-4">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <h2 className="text-slate-800 font-black text-xl mb-2">Driver Profile Pending</h2>
        <p className="text-slate-500 text-sm max-w-sm text-center">
          Your account is active, but a driver record has not been securely linked to your profile yet. Please contact Dispatch.
        </p>
      </div>
    );
  }

  const maxEarning = Math.max(...earnings.history.map(h => h.amount), 100);
  const previewAnnouncements = allAnnouncements.slice(0, 3);

  return (
    <div className="w-full space-y-6 pb-28 font-sans animate-in fade-in duration-300 relative">
      
      {/* Top Banner Status Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-600 text-white p-3 rounded-xl shadow-sm">
            <LayoutDashboard className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-gray-900 font-bold text-lg tracking-tight">Driver Command Center</h1>
            <p className="text-gray-500 text-xs mt-0.5">Live operational status, next actions, and shift performance.</p>
          </div>
        </div>
      </div>

      {/* Compliance Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <ComplianceCard title="Driving License" days={compliance.licenseDays} onClick={() => navigate('/driver/compliance')} />
        <ComplianceCard title="Vehicle Insurance" days={compliance.insuranceDays} onClick={() => navigate('/driver/compliance')} />
        <ComplianceCard title="Fleet Registration" days={compliance.registrationDays} onClick={() => navigate('/driver/compliance')} />
      </div>

      {/* Balanced Two-Column Enterprise Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Active Assignment (or Compact Standby) + System Announcements */}
        <div className="xl:col-span-2 space-y-6">
          {activeJob ? (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden text-slate-900 relative p-7 border-l-4 border-l-emerald-500 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Active Live Assignment</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">ORD-{activeJob.id}</span>
                </div>
                
                <h2 className="text-xl font-bold mb-2 text-slate-900 leading-snug">{activeJob.deliveryAddress || 'Destination Pending'}</h2>
                <div className="flex items-center gap-4 text-slate-500 text-xs font-medium mb-6">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-blue-600" /> {activeJob.calculatedDistanceKm || '--'} km</span>
                  <span>•</span>
                  <span>{activeJob.volumeGallons?.toLocaleString() || '0'} Gallons</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Telemetry connected & syncing</span>
                <button 
                  onClick={() => navigate('/driver/assignments')} 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all cursor-pointer flex items-center gap-2 text-xs shadow-sm"
                >
                  <span>Open Job Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-3xl shadow-sm border border-slate-200 py-10 px-8 flex flex-col items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                   style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '24px 24px' }}>
              </div>

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="relative flex items-center justify-center w-16 h-16 mb-4">
                  <div className="absolute inset-0 bg-blue-200 rounded-full animate-ping opacity-20"></div>
                  <div className="relative bg-white text-blue-600 p-4 rounded-full shadow-md border border-blue-100">
                    <Radio className="w-6 h-6" />
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-800 tracking-tight mb-1">Awaiting Dispatch</h3>
                <p className="text-xs text-slate-500 max-w-sm leading-relaxed font-medium mb-5">
                  Your vehicle is on active standby. Location services are online and visible to the central yard.
                </p>

                <div className="flex flex-wrap justify-center gap-3 mb-6">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                    GPS Active
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm uppercase tracking-wider">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    Fleet Sync
                  </span>
                </div>

                <button onClick={() => navigate('/driver/assignments')} className="bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 font-bold py-2.5 px-6 rounded-xl shadow-xs transition-all cursor-pointer text-xs">
                  Open Job Queue
                </button>
              </div>
            </div>
          )}

          {/* System Announcements anchored back underneath on the left column */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
              <h4 className="font-black text-slate-900 text-xs tracking-widest uppercase">System Announcements</h4>
              <div className="flex items-center gap-3">
                <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2.5 py-1 rounded-full">{allAnnouncements.length} Live</span>
                <button 
                  onClick={() => setIsModalOpen(true)} 
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer flex items-center"
                >
                  View All <ChevronRight className="w-3 h-3 ml-0.5" />
                </button>
              </div>
            </div>
            
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {previewAnnouncements.length > 0 ? (
                previewAnnouncements.map((item, idx) => {
                  const isHighPriority = (item.title + item.message).toLowerCase().includes('maintenance') || (item.title + item.message).toLowerCase().includes('urgent');
                  
                  return (
                    <div key={idx} className="flex items-start space-x-4 p-4 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-blue-100 transition-all">
                      <div className="bg-blue-100 p-2.5 rounded-xl shrink-0">
                        <Bell className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <p className="text-xs font-bold text-slate-900 leading-tight">{item.title}</p>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">{item.time || 'Live'}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                          {item.message || item.description}
                        </p>
                        <div className="mt-3 flex items-center">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                            isHighPriority 
                              ? 'border-amber-200 text-amber-700 bg-amber-50' 
                              : 'border-slate-200 text-slate-600 bg-white'
                          }`}>
                            {isHighPriority ? 'High Priority' : 'Normal Priority'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <p className="text-xs text-slate-400 font-medium">No active broadcasts from dispatch.</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Earnings Overview */}
        <div className="space-y-6">
          <div onClick={() => navigate('/driver/earnings')} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-black text-slate-900 text-xs tracking-widest uppercase">Earnings Overview</h4>
              <TrendingUp className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
            </div>
            
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Today's Net</p>
            <div className="flex items-end gap-3 mb-6">
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter">AED {earnings.todayNet}</h3>
              <span className="text-xs font-bold text-slate-500 mb-1.5 bg-slate-50 px-2 py-0.5 rounded-md">{earnings.todayCount} Jobs</span>
            </div>

            <div className="mt-auto pt-4 border-t border-slate-100">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">7-Day Trend</p>
              
              <div className="flex items-end justify-between h-28 gap-1.5 pt-2">
                {earnings.history.map((dayData, idx) => {
                  const isToday = idx === 6;
                  const heightPercent = (dayData.amount / maxEarning) * 100;
                  const hasEarnings = dayData.amount > 0;
                  
                  return (
                    <div key={idx} className="flex flex-col items-center justify-end w-full h-full gap-1 group/bar relative">
                      <span className={`text-[9px] font-bold mb-1 transition-colors ${hasEarnings ? 'text-slate-700' : 'text-slate-300'}`}>
                        {hasEarnings ? Math.round(dayData.amount) : '-'}
                      </span>

                      <div className="w-full bg-slate-50 rounded-lg flex items-end h-full p-[2px] border border-slate-100 relative cursor-pointer">
                        <div className="opacity-0 group-hover/bar:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold py-1 px-2 rounded pointer-events-none transition-opacity whitespace-nowrap z-20 shadow-lg">
                          AED {dayData.amount.toFixed(2)}
                        </div>

                        <div 
                          className={`w-full rounded-md transition-all duration-700 ${
                            isToday ? 'bg-emerald-500 shadow-sm' : 
                            hasEarnings ? 'bg-blue-400 group-hover/bar:bg-blue-500' : 'bg-transparent'
                          }`}
                          style={{ height: `${Math.max(heightPercent, 3)}%` }}
                        ></div>
                      </div>
                      
                      <span className={`text-[9px] font-bold uppercase tracking-wider mt-1.5 ${isToday ? 'text-slate-900' : 'text-slate-400'}`}>
                        {dayData.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* FULL ANNOUNCEMENTS MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-lg">All Announcements</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">Complete history of dispatch broadcasts</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar bg-slate-50/50 rounded-b-3xl">
              {allAnnouncements.map((item, idx) => {
                const isHighPriority = (item.title + item.message).toLowerCase().includes('maintenance') || (item.title + item.message).toLowerCase().includes('urgent');
                
                return (
                  <div key={idx} className="flex items-start space-x-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                    <div className="bg-blue-50 p-3 rounded-2xl shrink-0 border border-blue-100/50">
                      <Bell className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <p className="text-base font-bold text-slate-900 leading-none">{item.title}</p>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{item.time || 'Live'}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        {item.message || item.description}
                      </p>
                      <div className="mt-4 flex items-center">
                        <span className={`text-[9px] font-bold px-2.5 py-1 rounded-md border uppercase tracking-wider shadow-xs ${
                          isHighPriority 
                            ? 'border-amber-200 text-amber-700 bg-amber-50' 
                            : 'border-slate-200 text-slate-600 bg-slate-50'
                        }`}>
                          {isHighPriority ? 'High Priority' : 'Normal Priority'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const ComplianceCard = ({ title, days, onClick }) => {
  const isCritical = days !== null && days <= 14;
  const isExpired = days !== null && days <= 0;
  
  let textColor = 'text-emerald-600';
  let badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-100';
  let statusText = 'Valid';
  
  if (isExpired) {
    textColor = 'text-red-600';
    badgeClass = 'bg-red-50 text-red-700 border-red-100';
    statusText = 'Expired';
  } else if (isCritical) {
    textColor = 'text-amber-600';
    badgeClass = 'bg-amber-50 text-amber-700 border-amber-100';
    statusText = 'Expiring Soon';
  }

  return (
    <div 
      onClick={onClick}
      className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{title}</h4>
        <span className={`text-[9px] font-bold px-2.5 py-1 rounded-md border uppercase tracking-wider ${badgeClass}`}>
          {statusText}
        </span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className={`text-4xl font-black tracking-tighter leading-none ${textColor}`}>
          {days !== null ? days : '--'}
        </span>
        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Days Left</span>
      </div>
    </div>
  );
};

export default DriverDashboardHome;