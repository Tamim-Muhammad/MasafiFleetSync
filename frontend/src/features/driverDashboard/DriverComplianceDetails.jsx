import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ShieldCheck, 
  FileText, 
  Truck, 
  CheckCircle2, 
  Upload, 
  AlertCircle,
  X,
  Send,
  Loader2,
  AlertTriangle,
  Clock,
  CheckCircle,
  FileBadge,
  Calendar,
  Hash,
  AlertOctagon,
  History
} from 'lucide-react';

const DriverComplianceDetails = () => {
  const [documents, setDocuments] = useState([]);
  const [driverMeta, setDriverMeta] = useState(null);
  const [complianceLogs, setComplianceLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal upload state with drag-and-drop polish
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocCategory, setSelectedDocCategory] = useState('');
  const [selectedDocTitle, setSelectedDocTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [newExpiryDate, setNewExpiryDate] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    fetchComplianceData();
  }, []);

  const fetchComplianceData = async () => {
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

      // Fetch documents and driver details
      const docResponse = await axios.get(`http://localhost:5191/api/drivers/${currentDriverId}/documents`);
      
      if (docResponse.data) {
        const complianceDocs = (docResponse.data.documents || []).filter(
          doc => doc.category !== 'asset' && doc.category !== 'photos'
        );

        setDocuments(complianceDocs);
        setDriverMeta({
          name: docResponse.data.driverName,
          status: docResponse.data.accountStatus,
          compliance: docResponse.data.complianceStatus
        });
      }

      // Fetch notifications and filter for UNREAD active compliance alerts
      try {
        const notifResponse = await axios.get(`http://localhost:5191/api/Notifications/${currentDriverId}`);
        if (Array.isArray(notifResponse.data)) {
          const activeAlerts = notifResponse.data
            .filter(n => !n.isRead && (n.title.includes('Compliance') || n.title.includes('Warning') || n.title.includes('Alert') || n.title.includes('Expiry')))
            .slice(0, 3);
          
          setComplianceLogs(activeAlerts);
        }
      } catch (notifErr) {
        console.warn("Could not fetch notification activity logs:", notifErr);
      }

    } catch (err) {
      console.error("Failed to load compliance details:", err);
      setError(err.response?.data?.message || "Could not connect to the backend server.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUpload = (docTitle, category) => {
    setSelectedDocTitle(docTitle);
    setSelectedDocCategory(category);
    setSelectedFile(null);
    setNewExpiryDate('');
    setUploadError(null);
    setIsSubmitted(false);
    setIsDragging(false);
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmitUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setIsSubmitted(true);
      setUploadError(null);

      const storedUser = sessionStorage.getItem('driverUser') 
        ? JSON.parse(sessionStorage.getItem('driverUser')) 
        : (sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')) : 
           (localStorage.getItem('driverUser') ? JSON.parse(localStorage.getItem('driverUser')) : 
            (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null)));
        
      let currentDriverId = storedUser?.id || storedUser?.driverId || storedUser?.DriverId || 28;
      if (typeof currentDriverId === 'string' && currentDriverId.includes('-')) {
        currentDriverId = parseInt(currentDriverId.split('-')[1]);
      }

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('category', selectedDocCategory);
      if (newExpiryDate) {
        formData.append('expiryDate', newExpiryDate);
      }

      await axios.put(`http://localhost:5191/api/drivers/${currentDriverId}/documents/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setTimeout(() => {
        setIsModalOpen(false);
        setIsSubmitted(false);
        setSelectedFile(null);
        setNewExpiryDate('');
        fetchComplianceData();
      }, 1000);

    } catch (err) {
      console.error("Upload error:", err);
      setUploadError(err.response?.data?.message || "Failed to upload document.");
      setIsSubmitted(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'license': return FileText;
      case 'insurance': return ShieldCheck;
      case 'registration': return Truck;
      default: return FileText;
    }
  };

  const getExpiryStatus = (expiryDateStr) => {
    if (!expiryDateStr) return { text: 'Active Record', type: 'valid' };
    const expDate = new Date(expiryDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `Expired ${Math.abs(diffDays)} days ago`, type: 'expired' };
    } else if (diffDays === 0) {
      return { text: 'Expires today', type: 'warning' };
    } else if (diffDays <= 30) {
      return { text: `Expires in ${diffDays} days`, type: 'warning' };
    } else {
      return { text: `${diffDays} days remaining`, type: 'valid' };
    }
  };

  const isGloballyCompliant = driverMeta?.compliance === 'Compliant';
  const validCount = documents.filter(d => {
    const statusInfo = getExpiryStatus(d.expiryDate);
    return statusInfo.type === 'valid';
  }).length;
  const attentionCount = documents.length - validCount;

  return (
    <div className="w-full space-y-5 pb-12 font-sans relative">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-600 text-white p-3 rounded-xl shadow-sm">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-gray-900 font-bold text-lg tracking-tight">Driver & Fleet Compliance</h1>
            <p className="text-gray-500 text-xs mt-0.5">
              Monitored operational records, legal credentials, and regulatory renewal management.
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 self-start md:self-auto">
          <span className={`text-[11px] font-mono font-bold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 ${
            isGloballyCompliant ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isGloballyCompliant ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`}></span>
            STATUS: {driverMeta?.compliance || (attentionCount > 0 ? 'Non-Compliant' : 'Status Pending')}
          </span>
          <span className="text-[11px] font-mono font-bold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100 shadow-xs">
            COMPLIANCE MANAGEMENT
          </span>

        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 px-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">Monitored Records</p>
            <h3 className="text-sm font-bold text-gray-900">{documents.length} Documents Active</h3>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <FileBadge className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 px-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">Verified & Valid</p>
            <h3 className="text-sm font-bold text-emerald-600">{validCount} Verified Good</h3>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 px-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">Action Required</p>
            <h3 className="text-sm font-bold text-red-600">{attentionCount} Expiring / Expired</h3>
          </div>
          <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Content Area - Core Cards */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-72 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs font-semibold text-gray-500">Loading compliance ledger...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 rounded-2xl border border-red-200 shadow-sm h-72 flex flex-col items-center justify-center space-y-2 p-6 text-center">
          <AlertTriangle className="w-10 h-10 text-red-500 mb-2" />
          <p className="text-sm font-bold text-red-800">Failed to Load Compliance Details</p>
          <p className="text-xs text-red-600 font-medium max-w-md">{error}</p>
          <button 
            onClick={fetchComplianceData}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {documents.map((doc) => {
            const Icon = getCategoryIcon(doc.category);
            const expiryInfo = getExpiryStatus(doc.expiryDate);
            const isValid = expiryInfo.type === 'valid';

            return (
              <div key={doc.id} className={`bg-white rounded-2xl border ${
                isValid ? 'border-gray-200 shadow-sm' : 'border-red-300 shadow-red-50'
              } p-5 space-y-4 hover:border-blue-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between`}>
                
                {/* Card Header & Status */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2.5 rounded-xl border ${
                        isValid ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-red-50 text-red-600 border-red-100'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">{doc.title}</h3>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">{doc.number}</p>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1 border ${
                      expiryInfo.type === 'valid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      expiryInfo.type === 'warning' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                      'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {expiryInfo.type === 'valid' ? <CheckCircle2 className="w-3 h-3" /> : <AlertOctagon className="w-3 h-3" />}
                      {expiryInfo.type === 'valid' ? 'Valid' : expiryInfo.type === 'warning' ? 'Expiring Soon' : 'Expired'}
                    </span>
                  </div>

                  {/* Metadata Box with live time remaining */}
                  <div className="bg-gray-50 p-3 rounded-xl space-y-1.5 text-xs border border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Expiry Date:</span>
                      <span className="font-mono font-semibold text-gray-800 text-right">
                        {doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Active Record'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Time Status:</span>
                      <span className={`font-bold text-right ${
                        expiryInfo.type === 'valid' ? 'text-emerald-600' :
                        expiryInfo.type === 'warning' ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {expiryInfo.text}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button 
                  onClick={() => handleOpenUpload(doc.title, doc.category)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 transition-colors shadow-sm cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Update Document</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Section: Dynamic Compliance Activity Feed with State-Driven Fallback */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Compliance Activity</h3>
              <p className="text-xs text-gray-400">Recent verification and document status updates</p>
            </div>
          </div>
          <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
            attentionCount > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
          }`}>
            {attentionCount > 0 ? 'ACTION REQUIRED' : 'UP TO DATE'}
          </span>

        </div>

        <div className="space-y-3">
          {complianceLogs.length > 0 ? (
            complianceLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                  <div>
                    <p className="font-bold text-gray-800">{log.title}</p>
                    <p className="text-[11px] text-gray-500">{log.message}</p>
                  </div>
                </div>
                <span className="font-mono text-gray-400 text-[11px] shrink-0 ml-2">
                  {new Date(log.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} • {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          ) : attentionCount > 0 ? (
            <div className="flex items-center justify-between p-3 rounded-xl bg-red-50/50 border border-red-100 text-xs">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <div>
                  <p className="font-bold text-red-900">Credential Expiry Flagged</p>
                  <p className="text-[11px] text-red-700">{attentionCount} document(s) have expired and require immediate renewal.</p>
                </div>
              </div>
              <span className="font-mono text-red-600 text-[11px] font-semibold">Action Required</span>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <div>
                  <p className="font-bold text-emerald-900">All Credentials Verified</p>
                  <p className="text-[11px] text-emerald-700">Driving license, vehicle registration, and insurance policies are currently valid.</p>
                </div>
              </div>
              <span className="font-mono text-emerald-600 text-[11px] font-semibold">Active Ledger</span>
            </div>
          )}
        </div>
      </div>

      {/* Document Upload Modal with Drag-and-Drop Micro-Animations */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-5 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Upload Renewal Document</h3>
                <p className="text-xs text-gray-500 mt-0.5">Target Credential: <span className="font-semibold text-blue-600">{selectedDocTitle}</span></p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!isSubmitted ? (
              <form onSubmit={handleSubmitUpload} className="space-y-4">
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 ${
                    isDragging 
                      ? 'border-blue-600 bg-blue-50/80 scale-[1.01] shadow-md' 
                      : 'border-gray-200 hover:border-blue-500 bg-gray-50/50'
                  }`}
                >
                  <input 
                    type="file" 
                    id="docFile" 
                    className="hidden" 
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="docFile" className="cursor-pointer flex flex-col items-center space-y-2">
                    <div className={`p-3 rounded-xl shadow-xs transition-transform duration-300 ${
                      isDragging ? 'bg-blue-600 text-white scale-110 animate-bounce' : 'bg-blue-50 text-blue-600'
                    }`}>
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-gray-700">
                      {selectedFile ? selectedFile.name : isDragging ? "Drop your document here..." : "Click to browse or drag and drop file"}
                    </span>
                    <span className="text-[11px] text-gray-400">PDF, JPEG or PNG (Max size: 5MB)</span>
                  </label>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">New Expiry Date (Printed on Document)</label>
                  <input 
                    type="date" 
                    required
                    value={newExpiryDate}
                    onChange={(e) => setNewExpiryDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-normal border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50/50 transition-all"
                  />
                </div>

                {uploadError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs font-medium text-red-700 animate-in fade-in">
                    {uploadError}
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start space-x-2.5 text-xs text-blue-900 leading-relaxed">
                  <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p>Submitting this document automatically updates your secure repository, resolves pending expiry warnings, and clears the admin audit queue.</p>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={!selectedFile || !newExpiryDate}
                    className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-xs flex items-center space-x-2 transition-all ${
                      selectedFile && newExpiryDate 
                        ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-sm active:scale-95' 
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send for Verification</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="py-8 text-center space-y-3 animate-in fade-in">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-gray-900 text-sm">Transmitting Document...</h4>
                <p className="text-xs text-gray-500">Securing file transmission and routing to admin verification gateway.</p>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default DriverComplianceDetails;