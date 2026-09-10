import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  History, 
  CheckCircle2, 
  MapPin, 
  Droplet, 
  Download, 
  FileText,
  Search,
  X,
  Loader2,
  AlertTriangle
} from 'lucide-react';

const DeliveriesHistory = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDeliveriesHistory();
  }, []);

  const fetchDeliveriesHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const storedUser = sessionStorage.getItem('driverUser') 
        ? JSON.parse(sessionStorage.getItem('driverUser')) 
        : (sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')) : null);
        
      let currentDriverId = storedUser?.id || storedUser?.driverId || storedUser?.DriverId || 28;

      if (typeof currentDriverId === 'string' && currentDriverId.includes('-')) {
        currentDriverId = parseInt(currentDriverId.split('-')[1]);
      }

      const response = await axios.get(`http://localhost:5191/api/driverdeliveries/driver/${currentDriverId}`);
      if (Array.isArray(response.data)) {
        setDeliveries(response.data);
      }
    } catch (err) {
      console.error("Failed to load delivery history:", err);
      setError(err.response?.data?.message || "Could not connect to the backend server.");
    } finally {
      setLoading(false);
    }
  };

  const formatClientName = (name) => {
    if (!name) return 'Valued Client';
    if (name.includes('@')) {
      const handle = name.split('@')[0];
      return handle.charAt(0).toUpperCase() + handle.slice(1);
    }
    return name;
  };

  const filteredHistory = deliveries.filter(item => 
    item.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.jobReference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full space-y-6 pb-12 relative font-sans">
      
      {/* Top Banner Status Bar (Synchronized with Earnings & Assignments) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-600 text-white p-3 rounded-xl shadow-sm">
            <History className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-gray-900 font-bold text-lg tracking-tight">Deliveries History Ledger</h1>
            <p className="text-gray-500 text-xs mt-0.5">Comprehensive audit log of all completed delivery runs, dates, and receipt copies.</p>
          </div>
        </div>
        <span className="text-[11px] font-mono font-bold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100 self-start md:self-auto shrink-0 shadow-xs">
          COMPLETED RUNS ARCHIVE
      </span>
      </div>

      {/* Prominent Search & Filter Toolbar */}
      <div className="bg-white p-5 rounded-2xl border-2 border-blue-200 shadow-md flex items-center justify-between gap-4">
        <div className="relative w-full max-w-lg">
          <Search className="w-5 h-5 text-blue-600 absolute left-4 top-3.5" />
          <input 
            type="text"
            placeholder="Search by client name, job ID, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-blue-50/50 border-2 border-blue-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner"
          />
        </div>
        <span className="text-xs font-bold bg-blue-100 text-blue-800 px-3 py-2 rounded-xl shrink-0">
          Showing {filteredHistory.length} Records
        </span>
      </div>

      {/* History Ledger List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-72 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs font-semibold text-gray-500">Retrieving delivery logs from database...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 rounded-2xl border border-red-200 shadow-sm h-72 flex flex-col items-center justify-center space-y-2 p-6 text-center">
          <AlertTriangle className="w-10 h-10 text-red-500 mb-2" />
          <p className="text-sm font-bold text-red-800">Failed to Load Delivery History</p>
          <p className="text-xs text-red-600 font-medium max-w-md">{error}</p>
          <button 
            onClick={fetchDeliveriesHistory}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden divide-y divide-gray-100">
          {filteredHistory.length > 0 ? (
            filteredHistory.map((item) => (
              <div 
                key={item.id} 
                onClick={() => setSelectedReceipt(item)}
                className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-gray-50/70 transition-all cursor-pointer group"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl shrink-0 mt-0.5 group-hover:bg-emerald-100 transition-colors">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <h4 className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{formatClientName(item.clientName)}</h4>
                      <span className="bg-blue-50 text-blue-600 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">JOB #{item.jobReference}</span>
                      <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-md">{item.status}</span>
                    </div>
                    <p className="text-xs font-semibold text-gray-700 mt-1 flex items-center gap-1.5">
                      <Droplet className="w-3.5 h-3.5 text-blue-500" />
                      {item.serviceDescription}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      {item.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                  <div className="text-left md:text-right">
                    <span className="text-sm font-extrabold text-emerald-600">+ AED {item.amount?.toFixed(2)}</span>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {new Date(item.completedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedReceipt(item);
                    }}
                    className="bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold px-3.5 py-2 rounded-xl border border-gray-200 transition-colors flex items-center space-x-1.5 cursor-pointer shrink-0"
                  >
                    <Download className="w-3.5 h-3.5 text-gray-500" />
                    <span>Receipt</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-400 text-xs">
              No delivery history records found for this driver account.
            </div>
          )}
        </div>
      )}

      {/* Receipt Preview Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-5 animate-in fade-in zoom-in duration-200">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Delivery Receipt</h3>
                  <p className="text-[11px] text-gray-400 font-mono">ID: #{selectedReceipt.jobReference}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedReceipt(null)}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-gray-50 p-3.5 rounded-xl space-y-1 border border-gray-100">
                <p className="text-gray-400 font-semibold uppercase text-[10px]">Client Name</p>
                <p className="font-bold text-gray-900 text-sm">{formatClientName(selectedReceipt.clientName)}</p>
              </div>

              <div className="bg-gray-50 p-3.5 rounded-xl space-y-1 border border-gray-100">
                <p className="text-gray-400 font-semibold uppercase text-[10px]">Service Rendered</p>
                <p className="font-bold text-gray-800">{selectedReceipt.serviceDescription}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3.5 rounded-xl space-y-1 border border-gray-100">
                  <p className="text-gray-400 text-[10px] uppercase font-semibold">Completion Date</p>
                  <p className="font-bold text-gray-800">
                    {new Date(selectedReceipt.completedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="bg-gray-50 p-3.5 rounded-xl space-y-1 border border-gray-100">
                  <p className="text-gray-400 text-[10px] uppercase font-semibold">Cash Collected</p>
                  <p className="font-bold text-emerald-600">AED {selectedReceipt.amount?.toFixed(2)}</p>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center text-emerald-800 font-semibold">
                Status: Verified & Settled Hand-to-Hand (COD)
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button 
                onClick={() => {
                  const receiptContent = `========================================
MASAFI FLEET SYNC - OFFICIAL DELIVERY RECEIPT
========================================
Job Reference : #${selectedReceipt.jobReference}
Client Name   : ${formatClientName(selectedReceipt.clientName)}
Service       : ${selectedReceipt.serviceDescription}
Location      : ${selectedReceipt.location}
Completed Date: ${new Date(selectedReceipt.completedAt).toLocaleDateString()}
Amount Paid   : AED ${selectedReceipt.amount?.toFixed(2)}
Status        : ${selectedReceipt.status}
========================================
Verified & Settled Hand-to-Hand (COD)
`;
                  const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `Receipt-${selectedReceipt.jobReference}.txt`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                  setSelectedReceipt(null);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer shadow-xs flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Receipt</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default DeliveriesHistory;