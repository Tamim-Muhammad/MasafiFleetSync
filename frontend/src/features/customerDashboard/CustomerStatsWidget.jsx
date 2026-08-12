import React from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, CheckCircle2, Truck, Wallet } from 'lucide-react';

const CustomerStatsWidget = () => {
  const stats = [
    { label: 'Active Orders', value: '02', sub: 'Currently', icon: <ClipboardList className="w-6 h-6 text-blue-600" />, bg: 'bg-blue-50', path: '/orders' },
    { label: 'Completed Orders', value: '18', sub: 'All time', icon: <CheckCircle2 className="w-6 h-6 text-green-600" />, bg: 'bg-green-50', path: '/orders' },
    { label: 'Active Rentals', value: '01', sub: 'Currently', icon: <Truck className="w-6 h-6 text-indigo-600" />, bg: 'bg-indigo-50', path: '/rentals' },
    { label: 'Pending Payments', value: '01', sub: 'Requires attention', icon: <Wallet className="w-6 h-6 text-orange-500" />, bg: 'bg-orange-50', path: '/payments' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Link 
          key={index} 
          to={stat.path}
          className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
        >
          {/* Icon Container */}
          <div className={`p-3 rounded-full ${stat.bg}`}>
            {stat.icon}
          </div>
          
          {/* Text Content */}
          <div className="flex-1">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <h4 className="text-2xl font-bold text-gray-800">{stat.value}</h4>
            <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
          </div>
          
          {/* Arrow Icon */}
          <span className="text-gray-300">→</span>
        </Link>
      ))}
    </div>
  );
};

export default CustomerStatsWidget;