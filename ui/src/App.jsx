import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Pages
import Home from './pages/Home';

// Features / Auth Components
import LoginPortal from './features/auth/LoginPortal';
import DriverRegistration from './features/auth/DriverRegistration';
import CustomerSignup from './features/auth/CustomerSignup'; // Correct path

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Gateway & Auth */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPortal />} />
          <Route path="/register-driver" element={<DriverRegistration />} />
          
          {/* New Route */}
          <Route path="/signup" element={<CustomerSignup />} />
          
          {/* Existing Mappings */}
          <Route path="/order" element={<LoginPortal />} />
          <Route path="/rentals" element={<LoginPortal />} />

          {/* Core Modules */}
          <Route path="/customer/dashboard" element={<div className="p-10">Customer Dashboard</div>} />
          <Route path="/driver/dashboard" element={<div className="p-10">Driver Dashboard</div>} />
          <Route path="/forgot-password" element={<div className="p-10">Password Recovery</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;