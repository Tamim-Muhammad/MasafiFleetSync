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