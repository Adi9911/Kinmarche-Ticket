import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import LocationsPage from './pages/LocationsPage';
import UsersPage from './pages/UsersPage';
import DepartmentsPage from './pages/DepartmentsPage';
import StoresPage from './pages/StoresPage';
import TicketsPage from './pages/TicketsPage';
import CreateTicketPage from './pages/CreateTicketPage';
import TicketDetailPage from './pages/TicketDetailPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/locations" element={<LocationsPage />} />
        <Route path="/departments" element={<DepartmentsPage />} />
        <Route path="/stores" element={<StoresPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/tickets" element={<TicketsPage />} />
        <Route path="/tickets/new" element={<CreateTicketPage />} />
        <Route path="/tickets/:id" element={<TicketDetailPage />} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<div>404 - Page Not Found. <a href="/dashboard">Go to Dashboard</a></div>} />
      </Routes>
    </Router>
  );
}

export default App;
