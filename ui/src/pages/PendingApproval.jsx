import React from 'react';
import { ShieldCheck, Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PendingApproval = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        {/* Header Section */}
        <div className="bg-[#2D4552] p-8 text-white text-center">
          <div className="bg-white/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
            <ShieldCheck size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">Onboarding Request Received</h2>
          <p className="text-blue-100 mt-2 font-medium">Masafi Fleet Sync | Driver Onboarding Portal</p>
        </div>

        {/* Content Section */}
        <div className="p-10">
          <div className="space-y-6">
            <p className="text-gray-700 leading-relaxed">
              Your registration documents have been securely uploaded and are currently under <strong>Level-1 Compliance Review</strong> by our automated vetting system and human audit team.
            </p>
            
            {/* Status Timeline */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock size={18} className="text-[#2D4552]" /> Application Status
              </h4>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex flex-col items-center">
                  <CheckCircle2 size={24} className="text-green-500" />
                  <div className="w-0.5 h-8 bg-green-500 my-1"></div>
                  <Clock size={24} className="text-[#2D4552]" />
                </div>
                <div className="space-y-6">
                  <p className="font-bold text-gray-900">Registration Complete</p>
                  <p className="text-gray-600">Pending Admin Approval & OCR Verification</p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-lg border border-amber-100 text-amber-800 text-sm">
              <AlertCircle size={20} className="shrink-0" />
              <p>You do not need to take any further action. Access to the Driver Dashboard will be granted automatically once your credentials are verified.</p>
            </div>
          </div>

          {/* Footer Action */}
          <div className="mt-10 pt-6 border-t flex justify-center">
            <button 
              onClick={() => navigate('/')} 
              className="flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all"
            >
              Return to Homepage <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;