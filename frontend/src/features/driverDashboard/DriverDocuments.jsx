import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FileText, 
  FileCheck,
  Truck,
  Shield,
  CreditCard,
  Download,
  Eye,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';

const DriverDocuments = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [driverMeta, setDriverMeta] = useState(null);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [driverId, setDriverId] = useState(28);

  useEffect(() => {
    fetchRegisteredDocuments();
  }, []);

  const fetchRegisteredDocuments = async () => {
    try {
      setLoading(true);
      setError(null);

      // Aligned with multi-tab session storage and fallback to ID 28 (Khalid's Driver Roster ID)
      const storedUser = sessionStorage.getItem('driverUser') 
        ? JSON.parse(sessionStorage.getItem('driverUser')) 
        : (sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')) : 
           (localStorage.getItem('driverUser') ? JSON.parse(localStorage.getItem('driverUser')) : 
            (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null)));
        
      let currentDriverId = storedUser?.id || storedUser?.driverId || storedUser?.DriverId || 28;

      if (typeof currentDriverId === 'string' && currentDriverId.includes('-')) {
        currentDriverId = parseInt(currentDriverId.split('-')[1]);
      }
      
      setDriverId(currentDriverId);

      const response = await axios.get(`http://localhost:5191/api/drivers/${currentDriverId}/documents`);
      
      if (response.data && response.data.documents) {
        setDocuments(response.data.documents);
        setDriverMeta({
          name: response.data.driverName,
          status: response.data.accountStatus,
          compliance: response.data.complianceStatus
        });
      }
    } catch (err) {
      console.error("Failed to load official driver documents:", err);
      setError(err.response?.data?.message || "Could not connect to the backend server.");
    } finally {
      setLoading(false);
    }
  };

  const getDaysRemaining = (expiryDateString) => {
    if (!expiryDateString) return null;
    const expiry = new Date(expiryDateString);
    if (expiry.getFullYear() < 2000) return null;
    const today = new Date();
    return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'license': return CreditCard;
      case 'registration': return FileCheck;
      case 'insurance': return Shield;
      case 'asset': return Truck;
      default: return FileText;
    }
  };

  return (
    <div className="w-full space-y-5 pb-12 font-sans">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-600 text-white p-3 rounded-xl shadow-sm">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-gray-900 font-bold text-lg tracking-tight">Compliance Documents Vault</h1>
            <p className="text-gray-500 text-xs mt-0.5">
              Verified operational records and credentials uploaded during driver onboarding.
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 self-start md:self-auto">
          <span className={`text-[11px] font-mono font-bold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 ${
            driverMeta?.compliance === 'Compliant' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
          }`}>
            <span className={`w-2 h-2 rounded-full ${driverMeta?.compliance === 'Compliant' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`}></span>
            {driverMeta?.compliance || 'Status Pending'}
          </span>
          <span className="text-[11px] font-mono font-bold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100 shadow-xs">
            SECURE REPOSITORY
          </span>

        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-72 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs font-semibold text-gray-500">Retrieving encrypted documents...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 rounded-2xl border border-red-200 shadow-sm h-72 flex flex-col items-center justify-center space-y-2 p-6 text-center">
          <AlertTriangle className="w-10 h-10 text-red-500 mb-2" />
          <p className="text-sm font-bold text-red-800">Failed to Retrieve Documents</p>
          <p className="text-xs text-red-600 font-medium max-w-md">{error}</p>
          <button 
            onClick={fetchRegisteredDocuments}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-72 flex flex-col items-center justify-center space-y-2">
          <FileText className="w-10 h-10 text-gray-300" />
          <p className="text-sm font-semibold text-gray-700">No documents found</p>
          <p className="text-xs text-gray-400">Please verify onboarding file uploads in your profile.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {documents.map((doc) => {
            const Icon = getCategoryIcon(doc.category);
            const daysRemaining = getDaysRemaining(doc.expiryDate);
            const isCritical = daysRemaining !== null && daysRemaining <= 7;
            const isExpired = doc.status === 'Expired' || (daysRemaining !== null && daysRemaining < 0);

            return (
              <div 
                key={doc.id} 
                className={`bg-white rounded-2xl border ${
                  isExpired ? 'border-red-300 shadow-red-50' : isCritical ? 'border-amber-300 shadow-amber-50' : 'border-gray-200 shadow-sm'
                } p-5 space-y-4 hover:border-blue-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2.5 rounded-xl border ${
                        isExpired ? 'bg-red-50 text-red-600 border-red-100' : isCritical ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">{doc.title}</h3>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">{doc.number}</p>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1 border ${
                      isExpired 
                        ? 'bg-red-50 text-red-700 border-red-100' 
                        : isCritical 
                        ? 'bg-amber-50 text-amber-700 border-amber-100' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    }`}>
                      {isExpired ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                      {isExpired ? 'Expired' : doc.status}
                    </span>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-xl space-y-1.5 text-xs border border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Issuer / Authority:</span>
                      <span className="font-semibold text-gray-800 text-right">{doc.issuer}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Validity Status:</span>
                      <span className={`font-bold text-right ${isExpired ? 'text-red-600' : isCritical ? 'text-amber-600' : 'text-gray-900'}`}>
                        {daysRemaining !== null 
                          ? `${new Date(doc.expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} (${daysRemaining} days left)`
                          : doc.category === 'asset' 
                            ? 'Valid Asset Record / N/A' 
                            : 'Date Missing - Update Required'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                  <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">{doc.type}</span>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setViewingDoc(doc)}
                      className="bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-600 text-xs font-semibold px-3 py-1.5 rounded-xl border border-gray-200 transition-colors flex items-center space-x-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                    {/* DIRECT API DOWNLOAD LINK */}
                    {doc.fileUrl && (
                      <a 
                        href={`http://localhost:5191/api/drivers/${driverId}/download/${doc.category}`}
                        className="bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-xl border border-gray-200 transition-colors flex items-center space-x-1 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-gray-500" />
                        <span>Save</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Document Inspector Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Official Document Inspector</h3>
                <p className="text-xs text-blue-600 font-mono mt-0.5">{viewingDoc.title} [{viewingDoc.number}]</p>
              </div>
              <button 
                onClick={() => setViewingDoc(null)}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-xl hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl min-h-[250px] flex flex-col items-center justify-center border border-gray-200 overflow-hidden relative p-2">
              {viewingDoc.fileUrl ? (
                viewingDoc.fileUrl.endsWith('.pdf') ? (
                  <iframe 
                    src={viewingDoc.fileUrl} 
                    title={viewingDoc.title}
                    className="w-full h-72 rounded-lg"
                  />
                ) : (
                  <img 
                    src={viewingDoc.fileUrl} 
                    alt={viewingDoc.title}
                    className="max-h-72 object-contain rounded-lg shadow-sm"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <FileText className="w-12 h-12 text-gray-300 mb-2" />
                  <p className="text-xs font-bold text-gray-500">Encrypted Document Stored Securely</p>
                  <p className="text-[10px] text-gray-400 mt-1">Physical document vault verification pending sync.</p>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-900 flex justify-between items-center">
              <span>Notice an error or need to renew?</span>
              <button 
                onClick={() => {
                  setViewingDoc(null);
                  navigate('/driver/support');
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
              >
                Contact Support
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              {viewingDoc.fileUrl && (
                <a 
                  href={viewingDoc.fileUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200 transition flex items-center gap-1.5"
                >
                  <ExternalLink size={13} />
                  <span>Open Full View</span>
                </a>
              )}
              <button 
                onClick={() => setViewingDoc(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DriverDocuments;