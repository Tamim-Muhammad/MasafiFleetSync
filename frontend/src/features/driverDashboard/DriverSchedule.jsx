import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Droplet, 
  CheckCircle2,
  Building2,
  X,
  FileText,
  AlertCircle
} from 'lucide-react';

const DriverSchedule = () => {
  const navigate = useNavigate();
  const [filterTab, setFilterTab] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);

  const scheduledJobs = [
    {
      id: 'J-250519-01',
      date: '2026-05-09',
      displayDate: '09 May 2026',
      time: '08:00 AM',
      client: 'Al Badia Construction LLC',
      service: 'Water Tanker Delivery (5,000 Gallons)',
      location: 'Masafi Sector 3, Fujairah',
      status: 'Confirmed',
      instructions: 'Gate 2 entry requires contractor pass. Tanker hookup is standard 3-inch valve connection.',
      contactPerson: 'Eng. Rashid Al-Ketbi (+971 50 123 4567)'
    },
    {
      id: 'J-250520-02',
      date: '2026-05-10',
      displayDate: '10 May 2026',
      time: '09:30 AM',
      client: 'Emirates Oasis Camps',
      service: 'Water Tanker Delivery (3,000 Gallons)',
      location: 'Dibba Road, Fujairah',
      status: 'Confirmed',
      instructions: 'Deliver directly to secondary storage tanks behind main camp office.',
      contactPerson: 'Mohammed Bilal (+971 55 987 6543)'
    },
    {
      id: 'J-250522-04',
      date: '2026-05-12',
      displayDate: '12 May 2026',
      time: '11:00 AM',
      client: 'Fujairah Building Materials',
      service: 'Industrial Supply (10,000 Gallons)',
      location: 'Siji Industrial Zone',
      status: 'Pending Dispatch',
      instructions: 'High-volume industrial manifold connection required. Report to Weighbridge 1 first.',
      contactPerson: 'Tariq Superintendant (+971 52 444 1122)'
    }
  ];

  // Frontend Filter logic
  const filteredJobs = scheduledJobs.filter(job => {
    if (filterTab === 'confirmed') return job.status === 'Confirmed';
    if (filterTab === 'pending') return job.status === 'Pending Dispatch';
    return true;
  });

  return (
    <div className="w-full space-y-6 pb-12 relative">
      
      {/* Top Header & Back Navigation */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-xs font-bold text-gray-600 hover:text-blue-600 bg-white px-4 py-2.5 rounded-xl border border-gray-200 transition-colors shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
        <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-100">
          UPCOMING ROTATION TIMELINE
        </span>
      </div>

      {/* Schedule Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-blue-200 flex items-center space-x-4">
        <div className="bg-blue-600 text-white p-3.5 rounded-xl shadow-sm">
          <CalendarIcon className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-blue-900 font-bold text-lg">Your Upcoming Delivery Schedule</h3>
          <p className="text-gray-500 text-xs mt-0.5">Review your pre-assigned future delivery slots and location timelines below. Click any card to inspect site instructions.</p>
        </div>
      </div>

      {/* Filter Tabs Toolbar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex items-center space-x-2 text-xs font-bold text-gray-700">
          <span>Filter Schedule:</span>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-semibold">
          <button 
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${filterTab === 'all' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'}`}
          >
            All Slots ({scheduledJobs.length})
          </button>
          <button 
            onClick={() => setFilterTab('confirmed')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${filterTab === 'confirmed' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Confirmed
          </button>
          <button 
            onClick={() => setFilterTab('pending')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${filterTab === 'pending' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Pending Dispatch
          </button>
        </div>
      </div>

      {/* Scheduled Jobs List */}
      <div className="space-y-4">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job, index) => (
            <div 
              key={index} 
              onClick={() => setSelectedJob(job)}
              className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-blue-300 transition-all cursor-pointer group"
            >
              
              <div className="flex items-start space-x-4">
                <div className="bg-blue-50 text-blue-600 p-3 rounded-xl mt-0.5 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <h4 className="font-bold text-gray-900 text-base group-hover:text-blue-600 transition-colors">{job.client}</h4>
                    <span className="bg-blue-50 text-blue-600 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">JOB #{job.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${job.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {job.status}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                    <Droplet className="w-3.5 h-3.5 text-blue-500" />
                    {job.service}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {job.location}
                  </p>
                </div>
              </div>

              <div className="text-left md:text-right bg-gray-50 md:bg-transparent p-3 md:p-0 rounded-xl w-full md:w-auto border md:border-0 border-gray-100 flex md:flex-col justify-between items-center md:items-end">
                <span className="text-xs text-gray-400 font-medium">Scheduled Time</span>
                <span className="text-sm font-extrabold text-gray-900">{job.displayDate}</span>
                <span className="text-xs font-bold text-blue-600 mt-0.5">{job.time}</span>
              </div>

            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400 text-xs">
            No scheduled jobs found matching this filter criteria.
          </div>
        )}
      </div>

      {/* Detailed Site Instructions Modal (Frontend Interactive UI) */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-5 animate-in fade-in zoom-in duration-200">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="bg-blue-50 text-blue-600 text-[10px] font-mono font-bold px-2.5 py-1 rounded-md">JOB #{selectedJob.id}</span>
                <h3 className="font-bold text-gray-900 text-base mt-1.5">{selectedJob.client}</h3>
              </div>
              <button 
                onClick={() => setSelectedJob(null)}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-gray-50 p-3.5 rounded-xl space-y-2 border border-gray-100">
                <p className="text-gray-500 font-semibold uppercase tracking-wider text-[10px]">Service & Volume</p>
                <p className="font-bold text-gray-800 text-sm">{selectedJob.service}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3.5 rounded-xl space-y-1 border border-gray-100">
                  <p className="text-gray-400 text-[10px] uppercase font-semibold">Date & Time</p>
                  <p className="font-bold text-gray-800">{selectedJob.displayDate} at {selectedJob.time}</p>
                </div>
                <div className="bg-gray-50 p-3.5 rounded-xl space-y-1 border border-gray-100">
                  <p className="text-gray-400 text-[10px] uppercase font-semibold">Status</p>
                  <p className="font-bold text-emerald-600">{selectedJob.status}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-3.5 rounded-xl space-y-1 border border-gray-100">
                <p className="text-gray-400 text-[10px] uppercase font-semibold">Delivery Location</p>
                <p className="font-bold text-gray-800">{selectedJob.location}</p>
              </div>

              <div className="bg-blue-50/60 p-3.5 rounded-xl space-y-1 border border-blue-100">
                <p className="text-blue-700 font-bold text-[11px] uppercase">Site Instructions & Notes</p>
                <p className="text-gray-600">{selectedJob.instructions}</p>
              </div>

              <div className="bg-emerald-50/60 p-3.5 rounded-xl space-y-1 border border-emerald-100">
                <p className="text-emerald-800 font-bold text-[11px] uppercase">Site Contact Person</p>
                <p className="text-gray-700 font-semibold">{selectedJob.contactPerson}</p>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button 
                onClick={() => setSelectedJob(null)}
                className="bg-gray-900 hover:bg-gray-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default DriverSchedule;