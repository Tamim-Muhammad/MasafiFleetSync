import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  FileCheck,
  Truck,
  Shield,
  CreditCard,
  Download,
  Eye,
  CheckCircle2,
  X
} from 'lucide-react';

const DriverDocuments = () => {
  const navigate = useNavigate();
  const [viewingDoc, setViewingDoc] = useState(null);

  // Exact documents matching your Compliance screen and Onboarding
  const documentsList = [
    {
      id: 'DOC-01',
      title: 'Commercial Driving License (CDL)',
      number: 'UAE-DXB-883920',
      expiryDate: '17 Dec 2026',
      daysRemaining: 42,
      status: 'Valid',
      issuer: 'Fujairah Licensing Authority',
      type: 'Scanned Image / PDF Copy',
      icon: CreditCard
    },
    {
      id: 'DOC-02',
      title: 'Vehicle Commercial Insurance',
      number: 'POL-99281-OM',
      expiryDate: '28 Jan 2026',
      daysRemaining: 84,
      status: 'Valid',
      issuer: 'Oman Insurance Co.',
      type: 'Insurance Policy Certificate',
      icon: Shield
    },
    {
      id: 'DOC-03',
      title: 'Vehicle Registration (Mulkiya)',
      number: 'KT-78452-UAE',
      expiryDate: '05 Feb 2026',
      daysRemaining: 92,
      status: 'Valid',
      issuer: 'Ministry of Interior - UAE',
      type: 'Official Mulkiya Card',
      icon: FileCheck
    },
    {
      id: 'DOC-04',
      title: 'Vehicle Exterior & Interior Photos',
      number: 'ASSET-TRK-5000',
      expiryDate: 'N/A (Active Asset)',
      daysRemaining: null,
      status: 'Verified',
      issuer: 'Al-Waqar Inspection Team',
      type: 'Asset Photo Vault',
      icon: Truck
    }
  ];

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
          SECURE DIGITAL REPOSITORY
        </span>
      </div>

      {/* Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-blue-200 flex items-center space-x-4">
        <div className="bg-blue-600 text-white p-3.5 rounded-xl shadow-sm">
          <FileText className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-blue-900 font-bold text-lg">My Compliance Documents Vault</h3>
          <p className="text-gray-500 text-xs mt-0.5">Centralized cloud archive of your active driver license, insurance policy, Mulkiya, and vehicle inspection photos.</p>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documentsList.map((doc, index) => {
          const IconComponent = doc.icon;
          return (
            <div key={index} className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4 hover:border-blue-300 transition-colors">
              
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{doc.title}</h4>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{doc.number}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> {doc.status}
                </span>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl space-y-1.5 text-xs border border-gray-100">
                <div className="flex justify-between">
                  <span className="text-gray-400">Issuer / Authority:</span>
                  <span className="font-semibold text-gray-800">{doc.issuer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Validity Status:</span>
                  <span className="font-bold text-gray-900">
                    {doc.daysRemaining !== null ? `${doc.expiryDate} (${doc.daysRemaining} days left)` : doc.expiryDate}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-gray-400 font-medium">{doc.type}</span>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setViewingDoc(doc)}
                    className="bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-600 text-xs font-semibold px-3.5 py-2 rounded-xl border border-gray-200 transition-colors cursor-pointer flex items-center space-x-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Record</span>
                  </button>
                  <button 
                    onClick={() => alert(`Downloading verified record for ${doc.title}...`)}
                    className="bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold px-3.5 py-2 rounded-xl border border-gray-200 transition-colors cursor-pointer flex items-center space-x-1"
                  >
                    <Download className="w-3.5 h-3.5 text-gray-500" />
                    <span>PDF</span>
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Document Viewer Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Official Record Inspector</h3>
                <p className="text-xs text-blue-600 font-mono mt-0.5">{viewingDoc.title} — [{viewingDoc.number}]</p>
              </div>
              <button 
                onClick={() => setViewingDoc(null)}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-100 rounded-xl h-60 flex flex-col items-center justify-center text-gray-400 text-xs space-y-2 border border-gray-200">
              <FileText className="w-12 h-12 text-blue-500 opacity-80" />
              <p className="font-semibold text-gray-700">Encrypted Digital Document Preview</p>
              <p className="text-[10px] font-mono text-gray-400">Issued by: {viewingDoc.issuer}</p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-900 flex justify-between items-center">
              <span>Need to update or renew this certificate?</span>
              <button 
                onClick={() => {
                  setViewingDoc(null);
                  navigate('/driver/compliance');
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-[11px]"
              >
                Go to Compliance Screen
              </button>
            </div>

            <div className="flex justify-end pt-1">
              <button 
                onClick={() => setViewingDoc(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DriverDocuments;