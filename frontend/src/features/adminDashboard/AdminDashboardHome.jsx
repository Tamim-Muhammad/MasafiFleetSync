import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Truck, 
  ShieldAlert, 
  AlertTriangle, 
  DollarSign, 
  CheckCircle2, 
  MapPin, 
  ArrowUpRight 
} from 'lucide-react';

const AdminDashboardHome = () => {
  const navigate = useNavigate();

  // Mock data for analytics and monitoring with target routes
  const kpis = [
    { title: 'Total Fleet Revenue', value: 'AED 894,520', change: '+12.5%', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100', path: '/admin/financials' },
    { title: 'Active Tanker Utilization', value: '88%', change: '+3.2%', icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100', path: '/admin/inventory' },
    { title: 'Global Onboarding Compliance', value: '95%', change: 'Optimal', icon: ShieldAlert, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100', path: '/admin/compliance' },
    { title: 'Active Breakdown Incidents', value: '2', change: 'Requires Action', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50 border-red-100', path: '/admin/recovery' },
  ];

  const activeTankers = [
    { id: 'T-012', driver: 'Ahmed Al-Mazrouei', location: 'Masafi Zone A', status: 'En Route', eta: '15 mins' },
    { id: 'T-045', driver: 'Tariq Bin Ziyad', location: 'Fujairah Highway', status: 'Arrived', eta: 'Completed' },
    { id: 'T-088', driver: 'Rashid Al-Kaabi', location: 'Central Yard', status: 'Maintenance', eta: 'N/A' },
  ];

  const recentApprovals = [
    { name: 'Mohammed Al-Fayed', type: 'Driver License', date: 'Aug 4, 2026', status: 'Approved' },
    { name: 'Vehicle V-776 (5000 Gal)', type: 'Mulkiya & Insurance', date: 'Aug 4, 2026', status: 'Approved' },
  ];

  return (
    <div className="space-y-8 p-2 bg-gray-50/50 min-h-screen">
      {/* Top Header Bar matched to sidebar color */}
      <div className="bg-[#0B2A4D] p-6 rounded-2xl shadow-md text-white flex flex-col md:flex-row md:items-center md:justify-between border border-blue-900/40">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Super Admin Master Command</h1>
          <p className="text-sm text-blue-200 mt-1">Real-time oversight for Al-Waqar Transport (Masafi/Fujairah Region)</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/15 text-xs font-medium shadow-inner">
          <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></span>
          <span className="text-white">System Synchronized</span>
        </div>
      </div>

      {/* KPI Grid - Fully Clickable */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div 
              key={idx} 
              onClick={() => navigate(kpi.path)}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider group-hover:text-blue-600 transition-colors">{kpi.title}</p>
                <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">{kpi.value}</h3>
                <p className={`text-xs font-semibold mt-1 flex items-center space-x-1 ${kpi.color}`}>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>{kpi.change} vs last month</span>
                </p>
              </div>
              <div className={`p-4 rounded-2xl border ${kpi.bg} shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform`}>
                <Icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts & Compliance Thresholds Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Delivery Trend Simulator */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Revenue & Delivery Trends</h2>
              <p className="text-xs text-gray-500 mt-0.5">Comparing water distribution vs B2B heavy asset leasing</p>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-xl shadow-2xs">Last 7 Days</span>
          </div>
          
          <div className="h-64 flex items-center justify-center bg-gray-50/70 rounded-2xl border border-dashed border-gray-300/80 p-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
                <TrendingUp className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-gray-800">Interactive VRP & Financial Graph Rendering</p>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">Live data feeds active from SQL Server nodes awaiting time-series dataset connection.</p>
            </div>
          </div>
        </div>

        {/* Compliance Warning Clusters */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80 flex flex-col justify-between">
          <div className="pb-3 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Compliance Thresholds</h2>
            <p className="text-xs text-gray-500 mt-0.5">Automated document expiration alerts</p>
          </div>

          <div className="space-y-3.5 my-4">
            <div 
              onClick={() => navigate('/admin/compliance')} 
              className="flex items-center justify-between p-3.5 rounded-xl bg-red-50/80 border border-red-200/60 shadow-2xs cursor-pointer hover:bg-red-100/50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="w-3.5 h-3.5 rounded-full bg-red-500 ring-4 ring-red-100"></span>
                <span className="text-xs font-bold text-red-900">Critical Expiry (0-7 Days)</span>
              </div>
              <span className="text-xs font-extrabold text-red-700 bg-white px-2.5 py-1 rounded-lg border border-red-100 shadow-2xs">14 Assets</span>
            </div>

            <div 
              onClick={() => navigate('/admin/compliance')} 
              className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/60 shadow-2xs cursor-pointer hover:bg-amber-100/50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500 ring-4 ring-amber-100"></span>
                <span className="text-xs font-bold text-amber-900">Warning Window (8-15 Days)</span>
              </div>
              <span className="text-xs font-extrabold text-amber-700 bg-white px-2.5 py-1 rounded-lg border border-amber-100 shadow-2xs">29 Assets</span>
            </div>

            <div 
              onClick={() => navigate('/admin/compliance')} 
              className="flex items-center justify-between p-3.5 rounded-xl bg-yellow-50/80 border border-yellow-200/60 shadow-2xs cursor-pointer hover:bg-yellow-100/50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="w-3.5 h-3.5 rounded-full bg-yellow-400 ring-4 ring-yellow-100"></span>
                <span className="text-xs font-bold text-yellow-900">Upcoming Notice (16-30 Days)</span>
              </div>
              <span className="text-xs font-extrabold text-yellow-800 bg-white px-2.5 py-1 rounded-lg border border-yellow-100 shadow-2xs">23 Assets</span>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 text-[11px] font-medium text-center text-gray-400">
            * Blockades enforced automatically upon expiration.
          </div>
        </div>
      </div>

      {/* Bottom Data Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Tanker Status Feed */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Active Tanker Telemetry</h2>
              <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg">30s GPS Refresh Loop</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="pb-3 pl-1">Tanker ID</th>
                    <th className="pb-3">Driver</th>
                    <th className="pb-3">Location</th>
                    <th className="pb-3 text-right pr-1">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs">
                  {activeTankers.map((t, idx) => (
                    <tr 
                      key={idx} 
                      onClick={() => navigate('/admin/dispatch')}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                      title="Click to view in Dispatch Center"
                    >
                      <td className="py-3.5 pl-1 font-bold text-gray-900">{t.id}</td>
                      <td className="py-3.5 font-medium text-gray-700">{t.driver}</td>
                      <td className="py-3.5 text-gray-500 flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="truncate">{t.location}</span>
                      </td>
                      <td className="py-3.5 text-right pr-1">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-block ${
                          t.status === 'En Route' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          t.status === 'Arrived' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Compliance Approvals */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Recent Compliance Verifications</h2>
              <span 
                onClick={() => navigate('/admin/compliance')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer transition-colors"
              >
                View All Queue
              </span>
            </div>
            <div className="space-y-3">
              {recentApprovals.map((item, idx) => (
                <div 
                  key={idx} 
                  onClick={() => navigate('/admin/compliance')}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50/80 border border-gray-200/60 shadow-2xs hover:bg-blue-50/40 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100/80 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">{item.name}</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5 font-medium">{item.type} • {item.date}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-xl text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardHome;