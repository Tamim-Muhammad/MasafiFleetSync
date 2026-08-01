import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PendingApproval from './pages/PendingApproval';

// Layout & Components
import Navbar from './components/layout/Navbar'; 
import Home from './pages/Home';
import LoginPortal from './features/auth/LoginPortal';
import DriverRegistration from './features/auth/DriverRegistration';
import CustomerSignup from './features/auth/CustomerSignup';
import ServicesPage from './pages/ServicesPage';
import AboutUsPage from './pages/AboutUsPage';
import FAQPage from './pages/FAQPage';
import ContactPage from './pages/ContactPage';

// Dashboard
import CustomerDashboardLayout from './features/customerDashboard/CustomerDashboardLayout';
import CustomerDashboardHome from './features/customerDashboard/CustomerDashboardHome';

// 1. Create a Layout wrapper for pages that NEED the Navbar
const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
  </>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Pages: Wrapped in PublicLayout to include Navbar */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/services" element={<PublicLayout><ServicesPage /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><AboutUsPage /></PublicLayout>} />
          <Route path="/faq" element={<PublicLayout><FAQPage /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
          <Route path="/pending-approval" element={<PendingApproval />} />
          
          {/* Auth Pages: Raw components (No Navbar) */}
          <Route path="/login" element={<LoginPortal />} />
          <Route path="/register-driver" element={<DriverRegistration />} />
          <Route path="/signup" element={<CustomerSignup />} />

          {/* Customer Dashboard Routes */}
          <Route path="/customer/dashboard" element={<CustomerDashboardLayout />}>
            <Route index element={<CustomerDashboardHome />} />
          </Route>

          {/* Other Modules */}
          <Route path="/driver/dashboard" element={<div className="p-10">Driver Dashboard</div>} />
          <Route path="/forgot-password" element={<div className="p-10">Password Recovery</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;