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

// Customer Dashboard & Sub-pages
import CustomerDashboardLayout from './features/customerDashboard/CustomerDashboardLayout';
import CustomerDashboardHome from './features/customerDashboard/CustomerDashboardHome';
import CustomerOrderWater from './features/customerDashboard/CustomerOrderWater';
import CustomerMyOrders from './features/customerDashboard/CustomerMyOrders';
import CustomerSavedAddresses from './features/customerDashboard/CustomerSavedAddresses';
import CustomerSupport from './features/customerDashboard/CustomerSupport';
import CustomerTransactionHistory from './features/customerDashboard/CustomerTransactionHistory';
import CustomerVehicleRentals from './features/customerDashboard/CustomerVehicleRentals';
import CustomerMyLeases from './features/customerDashboard/CustomerMyLeases'; 
import CustomerDeliveryTrackerScreen from './features/customerDashboard/CustomerDeliveryTrackerScreen';
import CustomerProfile from './features/customerDashboard/CustomerProfile';
import CustomerSettings from './features/customerDashboard/CustomerSettings';
import CustomerSecurity from './features/customerDashboard/CustomerSecurity';

// Driver Dashboard & Sub-pages
import DriverDashboardLayout from './features/driverDashboard/DriverDashboardLayout';
import DriverDashboardHome from './features/driverDashboard/DriverDashboardHome';
import DriverAssignmentDetails from './features/driverDashboard/DriverAssignmentDetails';
import DriverComplianceDetails from './features/driverDashboard/DriverComplianceDetails';
import DriverEarnings from './features/driverDashboard/DriverEarnings';
import DriverSchedule from './features/driverDashboard/DriverSchedule';
import DeliveriesHistory from './features/driverDashboard/DeliveriesHistory';
import DriverDocuments from './features/driverDashboard/DriverDocuments';
import DriverVehicleProfile from './features/driverDashboard/DriverVehicleProfile';
import DriverSupport from './features/driverDashboard/DriverSupport';
import DriverSettings from './features/driverDashboard/DriverSettings';

// Admin Dashboard & Sub-pages
import AdminDashboardLayout from './features/adminDashboard/AdminDashboardLayout';
import AdminDashboardHome from './features/adminDashboard/AdminDashboardHome';
import AdminDispatchCenter from './features/adminDashboard/AdminDispatchCenter';
import AdminComplianceApproval from './features/adminDashboard/AdminComplianceApproval';
import AdminFleetManagement from './features/adminDashboard/AdminFleetManagement';
import AdminRecoveryDispatch from './features/adminDashboard/AdminRecoveryDispatch';
import AdminFinancials from './features/adminDashboard/AdminFinancials';
import AdminReports from './features/adminDashboard/AdminReports';
import AdminUsersRoles from './features/adminDashboard/AdminUsersRoles';
import AdminSettings from './features/adminDashboard/AdminSettings';
import AdminAnnouncements from './features/adminDashboard/AdminAnnouncements'; 

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
          {/* Public Pages */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/services" element={<PublicLayout><ServicesPage /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><AboutUsPage /></PublicLayout>} />
          <Route path="/faq" element={<PublicLayout><FAQPage /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
          <Route path="/pending-approval" element={<PendingApproval />} />
          
          {/* Auth Pages */}
          <Route path="/login" element={<LoginPortal />} />
          <Route path="/register-driver" element={<DriverRegistration />} />
          <Route path="/signup" element={<CustomerSignup />} />

          {/* Customer Dashboard Routes */}
          <Route path="/customer/dashboard" element={<CustomerDashboardLayout />}>
            <Route index element={<CustomerDashboardHome />} />
            <Route path="order" element={<CustomerOrderWater />} />
            <Route path="track" element={<CustomerDeliveryTrackerScreen />} />
            <Route path="track/:id" element={<CustomerDeliveryTrackerScreen />} />
            <Route path="my-orders" element={<CustomerMyOrders />} />
            <Route path="addresses" element={<CustomerSavedAddresses />} />
            <Route path="support" element={<CustomerSupport />} />
            <Route path="history" element={<CustomerTransactionHistory />} />
            <Route path="rentals" element={<CustomerVehicleRentals />} />
            <Route path="my-leases" element={<CustomerMyLeases />} />
            <Route path="profile" element={<CustomerProfile />} />
            <Route path="settings" element={<CustomerSettings />} />
            <Route path="security" element={<CustomerSecurity />} />
          </Route>

          {/* Driver Dashboard Routes */}
          <Route path="/driver" element={<DriverDashboardLayout />}>
            <Route path="dashboard" element={<DriverDashboardHome />} />
            <Route path="assignments" element={<DriverAssignmentDetails />} />
            <Route path="compliance" element={<DriverComplianceDetails />} />
            <Route path="earnings" element={<DriverEarnings />} />
            <Route path="schedule" element={<DriverSchedule />} />
            <Route path="history" element={<DeliveriesHistory />} />
            <Route path="documents" element={<DriverDocuments />} />
            <Route path="vehicle-profile" element={<DriverVehicleProfile />} />
            <Route path="support" element={<DriverSupport />} />
            <Route path="settings" element={<DriverSettings />} />
          </Route>

          {/* Admin Dashboard Routes */}
          <Route path="/admin" element={<AdminDashboardLayout />}>
            <Route path="dashboard" element={<AdminDashboardHome />} />
            <Route path="dispatch" element={<AdminDispatchCenter />} />
            <Route path="compliance" element={<AdminComplianceApproval />} />
            <Route path="inventory" element={<AdminFleetManagement />} />
            <Route path="recovery" element={<AdminRecoveryDispatch />} />
            <Route path="financials" element={<AdminFinancials />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="users" element={<AdminUsersRoles />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
          </Route>

          {/* Other Modules */}
          <Route path="/forgot-password" element={<div className="p-10">Password Recovery</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;