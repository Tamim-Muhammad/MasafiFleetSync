import React from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Clock, Truck, AlertCircle } from 'lucide-react';

const CustomerStatsWidget = ({ activeOrdersCount = 0, pendingOrdersCount = 0, activeLeasesCount = 0, pendingLeasesCount = 0 }) => {
  const stats = [
    { 
      label: 'Active Orders', 
      value: String(activeOrdersCount || 0), 
      sub: 'Currently en route', 
      icon: <ClipboardList className="w-6 h-6 text-blue-600" />, 
      bg: 'bg-blue-50', 
      path: '/customer/dashboard/my-orders?status=active' 
    },
    { 
      label: 'Pending Orders', 
      value: String(pendingOrdersCount || 0), 
      sub: 'Awaiting dispatch', 
      icon: <Clock className="w-6 h-6 text-amber-600" />, 
      bg: 'bg-amber-50', 
      path: '/customer/dashboard/my-orders?status=pending' 
    },
    { 
      label: 'Active Rentals', 
      value: String(activeLeasesCount || 0), 
      sub: 'Currently deployed', 
      icon: <Truck className="w-6 h-6 text-indigo-600" />, 
      bg: 'bg-indigo-50', 
      path: '/customer/dashboard/my-leases?status=active' 
    },
    { 
      label: 'Pending Rentals', 
      value: String(pendingLeasesCount || 0), 
      sub: 'Awaiting approval', 
      icon: <AlertCircle className="w-6 h-6 text-purple-600" />, 
      bg: 'bg-purple-50', 
      path: '/customer/dashboard/my-leases?status=pending' 
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Link 
          key={index} 
          to={stat.path}
          className="bg-white p-6 rounded-3xl border-2 border-gray-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex items-center gap-4 group"
        >
          <div className={`p-4 rounded-2xl ${stat.bg} shrink-0`}>
            {stat.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider">{stat.label}</p>
            <h4 className="text-3xl font-black text-gray-900 mt-0.5">{stat.value}</h4>
            <p className="text-xs text-gray-500 font-semibold mt-0.5 truncate">{stat.sub}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default CustomerStatsWidget;