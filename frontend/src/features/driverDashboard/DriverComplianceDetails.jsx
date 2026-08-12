import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShieldCheck, 
  FileText, 
  Truck, 
  CheckCircle2, 
  Upload, 
  AlertCircle,
  X,
  Send
} from 'lucide-react';

const DriverComplianceDetails = () => {
  const navigate = useNavigate();

  // State to manage the active upload modal workflow
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocTitle, setSelectedDocTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleOpenUpload = (docTitle) => {
    setSelectedDocTitle(docTitle);
    setSelectedFile(null);
    setIsSubmitted(false);
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmitUpload = (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    // Simulate sending document to compliance manager / admin queue
    setIsSubmitted(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setIsSubmitted(false);
      setSelectedFile(null);
      alert('Document successfully submitted for compliance audit and OCR verification.');
    }, 1500);
  };

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
        <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-100">
          COMPLIANCE STATUS: CLEARED
        </span>
      </div>

      {/* Compliance Overview Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-emerald-200 flex items-center space-x-4">
        <div className="bg-emerald-500 text-white p-3.5 rounded-xl shadow-sm">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-emerald-800 font-bold text-lg">All Legal and Safety Documents are Valid</h3>
          <p className="text-gray-500 text-xs mt-0.5">Your profile meets all operational standards for Al-Waqar Transport. No immediate renewals required.</p>
        </div>
      </div>

      {/* Document Detailed Breakdown Cards */}
      <div className="space-y-4">
        
        {/* Driving License Row */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-50 text-blue-600 p-3 rounded-xl mt-0.5">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-bold text-gray-900 text-base">Commercial Driving License (CDL)</h4>
                <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Valid
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">License No: <span className="font-mono font-semibold text-gray-700">UAE-DXB-883920</span></p>
              <p className="text-xs text-gray-400 mt-0.5">Expiry Date: 17 Dec 2026 (42 Days Left)</p>
            </div>
          </div>
          <button 
            onClick={() => handleOpenUpload('Commercial Driving License (CDL)')}
            className="bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold px-4 py-2 rounded-xl border border-gray-200 text-xs flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Update Document</span>
          </button>
        </div>

        {/* Insurance Row */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-50 text-blue-600 p-3 rounded-xl mt-0.5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-bold text-gray-900 text-base">Vehicle Commercial Insurance</h4>
                <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Valid
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Policy No: <span className="font-mono font-semibold text-gray-700">POL-99281-OM</span></p>
              <p className="text-xs text-gray-400 mt-0.5">Expiry Date: 28 Jan 2026 (84 Days Left)</p>
            </div>
          </div>
          <button 
            onClick={() => handleOpenUpload('Vehicle Commercial Insurance')}
            className="bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold px-4 py-2 rounded-xl border border-gray-200 text-xs flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Update Document</span>
          </button>
        </div>

        {/* Vehicle Registration Row */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="bg-amber-50 text-amber-600 p-3 rounded-xl mt-0.5">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-bold text-gray-900 text-base">Vehicle Registration (Mulkiya)</h4>
                <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Valid
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Registration No: <span className="font-mono font-semibold text-gray-700">KT-78452-UAE</span></p>
              <p className="text-xs text-gray-400 mt-0.5">Expiry Date: 05 Feb 2026 (92 Days Left)</p>
            </div>
          </div>
          <button 
            onClick={() => handleOpenUpload('Vehicle Registration (Mulkiya)')}
            className="bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold px-4 py-2 rounded-xl border border-gray-200 text-xs flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Update Document</span>
          </button>
        </div>

      </div>

      {/* Document Upload & Send Modal (Fulfills Admin Review Queue & OCR Verification Flow) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-5 animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Upload Renewal Document</h3>
                <p className="text-xs text-gray-500 mt-0.5">Target Asset: <span className="font-semibold text-blue-600">{selectedDocTitle}</span></p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Upload Form Area */}
            {!isSubmitted ? (
              <form onSubmit={handleSubmitUpload} className="space-y-4">
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-blue-500 transition-colors bg-gray-50/50">
                  <input 
                    type="file" 
                    id="docFile" 
                    className="hidden" 
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="docFile" className="cursor-pointer flex flex-col items-center space-y-2">
                    <div className="bg-blue-50 text-blue-600 p-3 rounded-xl shadow-xs">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-gray-700">
                      {selectedFile ? selectedFile.name : "Click to browse or drag and drop file"}
                    </span>
                    <span className="text-[11px] text-gray-400">PDF, JPEG or PNG (Max size: 5MB)</span>
                  </label>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start space-x-2.5 text-xs text-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p>Submitting this document will send it directly to the Compliance Manager's review queue for OCR verification and audit approval.</p>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={!selectedFile}
                    className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-xs flex items-center space-x-2 transition-all ${selectedFile ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer' : 'bg-gray-300 cursor-not-allowed'}`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send for Verification</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="py-8 text-center space-y-3">
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