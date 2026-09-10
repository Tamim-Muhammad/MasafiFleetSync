import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminDashboardService } from './adminDashboard.service';
import { 
  TrendingUp, 
  Truck, 
  ShieldAlert, 
  AlertTriangle, 
  DollarSign, 
  BarChart3,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

const AdminDashboardHome = () => {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [chartMetric, setChartMetric] = useState('ALL'); // 'ALL', 'WATER', 'LEASING'

  const fetchAllTelemetry = async () => {
    try {
      const summaryRes = await adminDashboardService.getDashboardSummary();
      setDashboardData(summaryRes);
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (error) {
      console.error("Telemetry sync failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTelemetry();
    const interval = setInterval(fetchAllTelemetry, 15000);
    return () => clearInterval(interval);
  }, []);

  const activeCrisesCount = dashboardData?.activeCrisesCount ?? 0;
  const activeVehicles = dashboardData?.activeVehiclesCount ?? 0;
  const totalVehicles = dashboardData?.totalVehiclesCount ?? 0;
  const compliantVehicles = dashboardData?.compliantVehiclesCount ?? 0;

  const kpis = [
    { 
      title: 'Total Fleet Revenue', 
      value: loading ? '...' : `AED ${Math.round(dashboardData?.totalRevenue || 0).toLocaleString()}`, 
      subtext: 'Cumulative Completed Revenue',
      icon: DollarSign, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50 border-emerald-100', 
      path: '/admin/financials' 
    },
    { 
      title: 'Active Tanker Utilization', 
      value: loading ? '...' : `${dashboardData?.utilizationPercentage ?? 0}%`, 
      subtext: `${activeVehicles} of ${totalVehicles} units active`,
      icon: Truck, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50 border-blue-100', 
      path: '/admin/inventory' // Fixed: Navigates cleanly to Master Fleet Inventory overview without empty filter trap
    },
    { 
      title: 'Global Compliance Rate', 
      value: loading ? '...' : `${dashboardData?.globalComplianceRate ?? 100}%`, 
      subtext: `${compliantVehicles} of ${totalVehicles} assets compliant`,
      icon: ShieldAlert, 
      color: (dashboardData?.globalComplianceRate ?? 100) < 100 ? 'text-amber-600' : 'text-indigo-600', 
      bg: (dashboardData?.globalComplianceRate ?? 100) < 100 ? 'bg-amber-50 border-amber-100' : 'bg-indigo-50 border-indigo-100', 
      path: '/admin/compliance?tab=assets&window=flagged' 
    },
    { 
      title: 'Active Breakdown Incidents', 
      value: loading ? '...' : String(activeCrisesCount), 
      subtext: activeCrisesCount > 0 ? 'Requires control room action' : 'All assets operational',
      icon: activeCrisesCount > 0 ? AlertTriangle : CheckCircle2, 
      color: activeCrisesCount > 0 ? 'text-red-600 animate-pulse' : 'text-emerald-600', 
      bg: activeCrisesCount > 0 ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100', 
      path: '/admin/recovery' 
    },
  ];

  const chartData = dashboardData?.weeklyPerformance || [];
  
  // Dynamic scale calculation based on selected metric view
  const maxMetricValue = chartData.length > 0 
    ? Math.max(...chartData.map(d => {
        if (chartMetric === 'WATER') return d.waterDeliveriesVolume;
        if (chartMetric === 'LEASING') return d.leasingRevenue;
        return Math.max(d.waterDeliveriesVolume, d.leasingRevenue);
      }))
    : 100;
    
  const safeMax = maxMetricValue > 0 ? Math.ceil(maxMetricValue * 1.15) : 100;

  const formatAxisLabel = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1).replace('.0', '') + 'k';
    return Math.round(num);
  };

  return (
    <div className="space-y-6 p-2 bg-gray-50/50 min-h-screen font-sans text-sm">
      
      {/* Top Operations Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">
            <TrendingUp size={14} /> Masafi & Fujairah Region Operations
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Operations Overview</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Real-time fleet oversight, performance analytics, and emergency dispatch tracking.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold shadow-sm">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
          <span className="text-gray-700">Live Data · Updated {lastSyncTime}</span>
        </div>
      </div>

      {/* Red Operations Emergency Banner */}
      <div 
        onClick={() => navigate('/admin/recovery')}
        className="bg-red-600 text-white p-4 rounded-2xl shadow-lg border border-red-500 flex items-center justify-between cursor-pointer hover:bg-red-700 transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider">Critical Action Required</h3>
            <p className="text-xs text-red-100 font-medium">
              There are <strong className="underline">{activeCrisesCount} active roadside breakdown incidents</strong> awaiting resolution in the Recovery Hub.
            </p>
          </div>
        </div>
        <span className="bg-white text-red-700 px-4 py-2 rounded-xl text-xs font-bold shadow-sm">
          Open Recovery Dispatch
        </span>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div 
              key={idx} 
              onClick={() => navigate(kpi.path)}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200/80 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-blue-600 transition-colors">
                  {kpi.title}
                </p>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">{kpi.value}</h3>
                <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1">
                  <span>{kpi.subtext}</span>
                </p>
              </div>
              <div className={`p-3.5 rounded-2xl border ${kpi.bg} shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform`}>
                <Icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts & Compliance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Revenue & Volume Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-200/80 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 size={18} className="text-blue-600" /> Revenue & Delivery Trends
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">7-day rolling performance across active transport contracts</p>
            </div>
            
            {/* View Stream Toggle */}
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button 
                onClick={() => setChartMetric('ALL')} 
                className={`px-2.5 py-1 rounded-lg transition ${chartMetric === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Combined
              </button>
              <button 
                onClick={() => setChartMetric('WATER')} 
                className={`px-2.5 py-1 rounded-lg transition ${chartMetric === 'WATER' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Water (Gal)
              </button>
              <button 
                onClick={() => setChartMetric('LEASING')} 
                className={`px-2.5 py-1 rounded-lg transition ${chartMetric === 'LEASING' ? 'bg-teal-500 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Leasing (AED)
              </button>
            </div>
          </div>
          
          <div className="flex h-56 mt-2">
            {/* Y-Axis Column */}
            <div className="flex flex-col justify-between items-end text-[10px] font-bold text-gray-400 pr-3 pb-6 border-r border-gray-200">
              <span>{formatAxisLabel(safeMax)}</span>
              <span>{formatAxisLabel(safeMax / 2)}</span>
              <span>0</span>
            </div>

            {/* Chart Bars Area */}
            <div className="relative flex-1 flex items-end justify-between gap-4 px-4 pb-0 bg-gray-50/50 rounded-r-2xl border-y border-r border-gray-100">
              
              <div className="absolute inset-0 flex flex-col justify-between pb-6 pointer-events-none opacity-40">
                <div className="w-full border-b border-dashed border-gray-300"></div>
                <div className="w-full border-b border-dashed border-gray-300"></div>
                <div className="w-full border-b border-solid border-transparent"></div>
              </div>

              {loading ? (
                <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xs z-10">Fetching telemetry...</div>
              ) : (
                chartData.map((data, idx) => {
                  const waterHeight = (data.waterDeliveriesVolume / safeMax) * 100;
                  const leaseHeight = (data.leasingRevenue / safeMax) * 100;

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative z-10">
                      
                      {/* Context-aware Hover Tooltip */}
                      <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-gray-900 text-white text-[10px] font-bold py-1.5 px-3 rounded-xl shadow-xl pointer-events-none whitespace-nowrap z-20">
                        <p className="font-extrabold text-slate-200 border-b border-slate-700 pb-0.5 mb-1">{data.day}</p>
                        {(chartMetric === 'ALL' || chartMetric === 'WATER') && (
                          <p className="text-blue-300">Water: {data.waterDeliveriesVolume.toLocaleString()} Gal</p>
                        )}
                        {(chartMetric === 'ALL' || chartMetric === 'LEASING') && (
                          <p className="text-teal-300">Lease: AED {data.leasingRevenue.toLocaleString()}</p>
                        )}
                      </div>

                      <div className="w-full flex items-end justify-center gap-1.5 h-[calc(100%-24px)]">
                        {(chartMetric === 'ALL' || chartMetric === 'WATER') && (
                          <div 
                            style={{ height: `${Math.max(waterHeight, 2)}%` }} 
                            className={`w-full max-w-[16px] rounded-t-sm transition-all duration-500 shadow-sm ${
                              data.waterDeliveriesVolume > 0 ? 'bg-blue-600 group-hover:bg-blue-700' : 'bg-slate-200'
                            }`}
                          ></div>
                        )}
                        {(chartMetric === 'ALL' || chartMetric === 'LEASING') && (
                          <div 
                            style={{ height: `${Math.max(leaseHeight, 2)}%` }} 
                            className={`w-full max-w-[16px] rounded-t-sm transition-all duration-500 shadow-sm ${
                              data.leasingRevenue > 0 ? 'bg-teal-500 group-hover:bg-teal-600' : 'bg-slate-200'
                            }`}
                          ></div>
                        )}
                      </div>

                      <span className="text-xs font-bold text-gray-600 mt-2 h-4">{data.day}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Compliance Health Widget */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200/80 flex flex-col justify-between">
          <div className="pb-3 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">Compliance Health</h2>
              <p className="text-xs text-gray-500 mt-0.5">Automated document expiration alerts</p>
            </div>
            <ShieldAlert className="text-indigo-600" size={20} />
          </div>

          <div className="space-y-3 my-3">
            {/* 0-7 Days -> Filtered to critical asset window */}
            <div 
              onClick={() => navigate('/admin/compliance?tab=assets&window=critical')} 
              className="flex items-center justify-between p-3.5 rounded-2xl bg-red-50/80 border border-red-200/60 cursor-pointer hover:bg-red-100/50 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <span className="w-3.5 h-3.5 rounded-full bg-red-500 ring-4 ring-red-100"></span>
                <span className="text-xs font-bold text-red-900">Critical Expiry (0-7 Days)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-red-700 bg-white px-2.5 py-1 rounded-xl border border-red-100">
                  {loading ? '-' : `${dashboardData?.complianceAlerts?.criticalCount || 0} ${dashboardData?.complianceAlerts?.criticalCount === 1 ? 'Asset' : 'Assets'}`}
                </span>
                <ChevronRight size={14} className="text-red-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            {/* 8-15 Days -> Filtered to warning asset window */}
            <div 
              onClick={() => navigate('/admin/compliance?tab=assets&window=warning')} 
              className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/60 cursor-pointer hover:bg-amber-100/50 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500 ring-4 ring-amber-100"></span>
                <span className="text-xs font-bold text-amber-900">Warning Window (8-15 Days)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-amber-700 bg-white px-2.5 py-1 rounded-xl border border-amber-100">
                  {loading ? '-' : `${dashboardData?.complianceAlerts?.warningCount || 0} ${dashboardData?.complianceAlerts?.warningCount === 1 ? 'Asset' : 'Assets'}`}
                </span>
                <ChevronRight size={14} className="text-amber-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            {/* 16-30 Days -> Filtered to upcoming asset window */}
            <div 
              onClick={() => navigate('/admin/compliance?tab=assets&window=upcoming')} 
              className="flex items-center justify-between p-3.5 rounded-2xl bg-yellow-50/80 border border-yellow-200/60 cursor-pointer hover:bg-yellow-100/50 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <span className="w-3.5 h-3.5 rounded-full bg-yellow-400 ring-4 ring-yellow-100"></span>
                <span className="text-xs font-bold text-yellow-900">Heading Notice (16-30 Days)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-yellow-800 bg-white px-2.5 py-1 rounded-xl border border-yellow-100">
                  {loading ? '-' : `${dashboardData?.complianceAlerts?.upcomingCount || 0} ${dashboardData?.complianceAlerts?.upcomingCount === 1 ? 'Asset' : 'Assets'}`}
                </span>
                <ChevronRight size={14} className="text-yellow-500 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 text-[11px] font-medium text-center text-gray-400">
            * Blockades enforced automatically upon expiration.
          </div>
        </div>
      </div>

    </div>
  );
};
export default AdminDashboardHome;