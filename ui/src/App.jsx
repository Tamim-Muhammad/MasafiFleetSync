import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home'; // Import the new Home page

// Placeholder components
const Login = () => <div className="p-8"><h1>Login Portal</h1></div>;
const RegisterDriver = () => <div className="p-8"><h1>Driver Registration Wizard</h1></div>;

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* REMOVE <Navbar /> from here */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register-driver" element={<RegisterDriver />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;