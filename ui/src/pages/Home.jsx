// import React from 'react';

// const PublicHomepage = () => {
//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Navigation Bar */}
//       <nav className="flex justify-between items-center py-4 px-8 bg-white shadow-sm">
//         <div className="text-2xl font-bold text-blue-900">Al-Waqar Transport</div>
//         <div className="flex items-center gap-4">
//           <a href="/register" className="text-gray-600 hover:text-blue-600 font-medium">Register as Driver</a>
//           <button className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition">Login</button>
//         </div>
//       </nav>

//       {/* Main Content */}
//       <main className="flex flex-col items-center justify-center py-16">
//         <h1 className="text-4xl font-bold text-blue-900 mb-2">SYNCHRONIZED FLEET & LOGISTICS</h1>
//         <p className="text-lg text-gray-600 mb-12">Welcome to Al-Waqar Transport L.L.C.</p>

//         <div className="flex gap-8">
//           <div className="bg-white p-8 rounded-2xl shadow-lg w-80 text-center">
//             <h2 className="text-xl font-bold mb-4">Need Industrial Bulk Water?</h2>
//             <button className="w-full bg-blue-900 text-white py-3 rounded-lg hover:bg-blue-800">Order Tanker Now</button>
//           </div>
//           <div className="bg-white p-8 rounded-2xl shadow-lg w-80 text-center">
//             <h2 className="text-xl font-bold mb-4">Looking to Lease Heavy Fleet Assets?</h2>
//             <button className="w-full bg-blue-900 text-white py-3 rounded-lg hover:bg-blue-800">Browse Rental Showroom</button>
//           </div>
//         </div>
//       </main>

//       {/* Emergency Strip */}
//       <div className="bg-red-600 text-white text-center py-4 font-bold">
//         ROAD SIDE BREAKDOWN OR EMERGENCY? Call Our 24/7 Recovery Team Instantly: +971-XX-XXXXXXX
//       </div>
//     </div>
//   );
// };

// export default PublicHomepage;
import React from 'react';
import Navbar from '../components/layout/Navbar';
import Hero from '../features/landing/components/Hero';
import EmergencySection from '../components/sections/emergency/EmergencySection';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main>
        <Hero />
        <EmergencySection />
      </main>

      {/* Footer can be added here once you build it */}
    </div>
  );
};

export default Home;