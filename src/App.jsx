import React from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ToastContainer } from 'react-toastify';

// Layout Components
import Nav from "./components/landing/nav";
import Footer from "./components/landing/footer";

// Public Pages
import Landing from "./pages/Landing";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import CommunityMapPage from "./pages/CommunityMap";
import Myplantmappage from "./pages/myplantmap";
import Adminlog from "./components/admin/AdminLogin";

// User Pages
import Dashboard from "./components/dashboard/Dashboard";
import ProfileView from "./components/profile/ProfileView";
import ProfileEdit from "./components/profile/ProfileEdit";
import AccountSecurity from "./components/profile/AccountSecurity";
import Adopt from "./components/adoption/AdoptPlant";

// Admin Pages
import Forest from "./components/admin/ForestManager";

// --- 🛡️ ROUTE GUARDS ---
const GuestRoute = () => {
  const { currentUser, userDetails, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-forest-base" />;

  if (currentUser) {
    // Check if the user is an admin based on the collection they belong to
    const isAdmin = userDetails?.role === 'Super Admin' || userDetails?.role === 'Forest Manager';
    
    if (isAdmin) {
      return <Navigate to="/admin/ForestManager" replace />;
    }
    // Regular users go here
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

const UserProtectedRoute = () => {
  const { currentUser, loading, userDetails } = useAuth();
  if (loading) return null; // Or a loading spinner
  
  // Checks if logged in and is NOT an admin
  const isUser = currentUser && (userDetails?.role !== 'Super Admin' && userDetails?.role !== 'Forest Manager');
  return isUser ? <Outlet /> : <Navigate to="/login" replace />;
};

const AdminProtectedRoute = () => {
  const { currentUser, userDetails, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-forest-base" />;

  // If we have a user but userDetails hasn't loaded yet, stay on a loading screen
  // instead of redirecting. This prevents the "bounce" to the landing page.
  if (currentUser && !userDetails) return <div className="min-h-screen bg-forest-base" />;

  const isAdmin = userDetails?.role === 'Super Admin' || userDetails?.role === 'Forest Manager';

  return isAdmin ? <Outlet /> : <Navigate to="/admin-login" replace />;
};

// --- 📱 MAIN CONTENT ---

function AppContent() {
  const location = useLocation();
  const { userDetails } = useAuth();
  // Logic to hide Nav/Footer on specific pages
  const isAuthPage = ["/adopt","/admin-login","/admin/ForestManager", {/*"/admin-login"*/}].includes(location.pathname);
  const isAdmin = userDetails?.role === 'Super Admin' || userDetails?.role === 'Forest Manager';
  const showNav = !isAuthPage || location.pathname=="/Dashboard";
  const hidefoot = location.pathname == "/Dashboard";
  const showFooter = !isAuthPage && !hidefoot;

  return (
    <div className="min-h-screen bg-forest-base font-sans text-forest-text overflow-x-hidden selection:bg-forest-accent selection:text-forest-base">
      {showNav &&  <Nav />}
      
      <main className={showNav ? "pt-0" : ""}>
        <Routes>
          {/* Logged in users cannot see these! */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/admin-login" element={<Adminlog />} />
          </Route>

          {/* --- PUBLIC ROUTES --- */}
          {/* Anyone can see these anytime */}
          <Route path="/" element={<Landing />} />
          <Route path="/map" element={<CommunityMapPage />} />

          {/* --- USER PROTECTED ROUTES (/...) --- */}
          <Route path="/" element={<UserProtectedRoute />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="/myplantmap" element={<Myplantmappage />} />
            <Route path="adopt" element={<Adopt />} />
            <Route path="profile" element={<div className="bg-[#0b1510] min-h-screen"><ProfileView /></div>} />
            <Route path="profile/edit" element={<div className="bg-[#0b1510] min-h-screen"><ProfileEdit /></div>} />
            <Route path="profile/security" element={<AccountSecurity />} />
          </Route>

          {/* --- ADMIN PROTECTED ROUTES (/admin/...) --- */}
          <Route path="/admin" element={<AdminProtectedRoute />}>
            <Route path="ForestManager" element={<Forest />} />
            {/* Add other admin panels here */}
            <Route path="dashboard" element={<div className="text-white p-10">Admin Stats Dashboard</div>} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {showFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
        <ToastContainer theme="dark" position="bottom-right" />
      </BrowserRouter>
    </AuthProvider>
  );
}