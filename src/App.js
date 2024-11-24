import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import SignUp from './Pages/Signup';
import AdminDashboard from './Pages/AdminPages/AdminDashboard';
import Home from './Pages/AdminPages/Home';
import ManageUsers from './Pages/AdminPages/ManageUsers';
import Appointments from './Pages/AdminPages/Appointments';
import PatientDashboard from './Pages/PatientPages/PatientDashboard';
import BookAppointment from './Pages/PatientPages/BookAppointment';
import PatientAppointments from './Pages/PatientPages/PatientAppointments';
import Profile from './Pages/PatientPages/Profile';
import CaregiverDashboard from './Pages/CaregiverPages/CaregiverDashboard'; 
import CaregiverAppointments from './Pages/CaregiverPages/CaregiverAppointments'; // New page
import CaregiverProfile from './Pages/CaregiverPages/CaregiverProfile'; // New page
import ActionLogs from './Pages/AdminPages/ActionLogs';
import { AuthProvider, useAuth } from './context/authContext';
import ScheduleAppointment from './Pages/CaregiverPages/ScheduleAppointment';

// Protected Route Component
const ProtectedRoute = ({ isAllowed, redirectPath = '/', children }) => {
 
 
  const { loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>; // Add a proper loading spinner here
  }
  
  if (!isAllowed) {
    return <Navigate to={redirectPath} replace />;
  }
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  //const [loggedInUser, setLoggedInUser] = useState(null);


  const isAdmin = user?.role === 'admin';
  const isPatient = user?.role === 'patient';
  const isCaregiver = user?.role === 'caregiver';

  return (
    <div>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login/>} />
        <Route path="/sign-up" element={<SignUp />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute isAllowed={isAdmin}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} /> {/* Default view */}
          <Route path="home" element={<Home />} />
          <Route path="manage-users" element={<ManageUsers />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="logs" element={<ActionLogs />} />

        </Route>

        {/* Patient Routes */}
        <Route
          path="/patient"
          element={
            <ProtectedRoute isAllowed={isPatient}>
              <PatientDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Profile />} /> {/* Default view */}
          <Route path="profile" element={<Profile />} />
          <Route path="book-appointment" element={<BookAppointment />} />
          <Route path="appointments" element={<PatientAppointments />} />
        </Route>

        {/* Caregiver Routes */}
        <Route
          path="/caregiver"
          element={
            <ProtectedRoute isAllowed={isCaregiver}>
              <CaregiverDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<CaregiverProfile />} /> {/* Default view */}
          <Route path="profile" element={<CaregiverProfile />} />
          <Route path="appointments" element={<CaregiverAppointments />} />
          <Route path="schedule-appointment" element={<ScheduleAppointment />} />

        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;
