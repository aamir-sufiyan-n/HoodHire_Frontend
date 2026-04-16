import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import GuestHome from './components/GuestHome';
import SeekerHome from './components/SeekerHome';
import HirerHome from './components/HirerHome';
import AuthPage from './components/AuthPage';
import ProfilePage from './components/ProfilePage';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import HirerOnboardingFlow from './components/onboarding/HirerOnboardingFlow';
import HirerProfilePage from './components/HirerProfilePage';
import JobListings from './components/JobListings';
import JobDetails from './components/JobDetails';
import SeekerProfileView from './components/seeker/SeekerProfileView';
import ApplicationsPage from './components/seeker/ApplicationsPage';
import CompaniesDirectory from './components/CompaniesDirectory';
import CompanyDetailsPage from './components/CompanyDetailsPage';
import DisplayProfile from './components/hirer/DisplayProfile';
import HirerJobDetails from './components/hirer/HirerJobDetails';
import ChatPage from './components/chat/ChatPage';
import { chatAPI } from './api/chat';
import { Toaster } from 'react-hot-toast';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import ManageUsers from './components/admin/ManageUsers';
import ManageBusinesses from './components/admin/ManageBusinesses';
import ManageTickets from './components/admin/ManageTickets';
import ManageRoles from './components/admin/ManageRoles';
import BusinessDetails from './components/admin/BusinessDetails';
import AdminProfile from './components/admin/AdminProfile';
import WebConfig from './components/admin/WebConfig';
import ManageJobs from './components/admin/ManageJobs';
import ManageCategories from './components/admin/ManageCategories';
import ManageSubscriptions from './components/admin/ManageSubscriptions';
import SubscriptionRevenue from './components/admin/SubscriptionRevenue';
import HirerSubscriptionsPage from './components/hirer/HirerSubscriptionsPage';
import AdminRoute from './components/admin/AdminRoute';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('accessToken');
      const user = localStorage.getItem('user');

      if (user && !token) {
        // Token was removed but user object remains
        localStorage.removeItem('user');
        chatAPI.disconnectWebSocket();
        window.location.href = '/';
      } else if (token) {
        chatAPI.connectWebSocket(token);
      }
    };

    checkAuth();

    // Listen for storage changes (for cross-tab logout)
    window.addEventListener('storage', (e) => {
      if (e.key === 'accessToken' && !e.newValue) {
        localStorage.removeItem('user');
        chatAPI.disconnectWebSocket();
        window.location.href = '/';
      }
    });

    return () => {
      chatAPI.disconnectWebSocket();
      window.removeEventListener('storage', () => {});
    };
  }, []);

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<GuestHome />} />
        <Route path="/seeker" element={<ProtectedRoute role="seeker"><SeekerHome /></ProtectedRoute>} />
        <Route path="/hirer" element={<ProtectedRoute role="hirer"><HirerHome /></ProtectedRoute>} />
        <Route path="/login" element={<AuthPage defaultView="login" />} />
        <Route path="/signin/seeker" element={<AuthPage defaultView="signup" role="seeker" />} />
        <Route path="/signin/hirer" element={<AuthPage defaultView="signup" role="hirer" />} />
        <Route path="/onboarding" element={<ProtectedRoute><OnboardingFlow /></ProtectedRoute>} />
        <Route path="/onboarding/hirer" element={<ProtectedRoute><HirerOnboardingFlow /></ProtectedRoute>} />
        <Route path="/profile/seeker" element={<ProtectedRoute role="seeker"><ProfilePage /></ProtectedRoute>} />
        <Route path="/profile/seeker/:id" element={<ProtectedRoute><DisplayProfile /></ProtectedRoute>} />
        <Route path="/profile/hirer" element={<ProtectedRoute role="hirer"><HirerProfilePage /></ProtectedRoute>} />
        <Route path="/hirer/seeker/:id" element={<ProtectedRoute role="hirer"><DisplayProfile /></ProtectedRoute>} />
        <Route path="/hirer/jobs/:id" element={<ProtectedRoute role="hirer"><HirerJobDetails /></ProtectedRoute>} />
        <Route path="/hirer/subscriptions" element={<ProtectedRoute role="hirer"><HirerSubscriptionsPage /></ProtectedRoute>} />
        <Route path="/applications" element={<ProtectedRoute role="seeker"><ApplicationsPage /></ProtectedRoute>} />
        <Route path="/companies" element={<CompaniesDirectory />} />
        <Route path="/companies/:id" element={<CompanyDetailsPage />} />
        <Route path="/jobs" element={<JobListings />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/messages" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="businesses" element={<ManageBusinesses />} />
          <Route path="businesses/:id" element={<BusinessDetails />} />
          <Route path="tickets" element={<ManageTickets />} />
          <Route path="roles" element={<ManageRoles />} />
          <Route path="jobs" element={<ManageJobs />} />
          <Route path="categories" element={<ManageCategories />} />
          <Route path="subscriptions" element={<ManageSubscriptions />} />
          <Route path="revenue" element={<SubscriptionRevenue />} />
          <Route path="config" element={<WebConfig />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
