import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/config";

// Pages
import LandingPage from "./pages/LandingPage";
import CustomerHome from "./pages/CustomerHome";
import BookAppointment from "./pages/BookAppointment";
import BookingHistory from "./pages/BookingHistory";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  const [adminLoggedIn, setAdminLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Track admin authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAdminLoggedIn(!!user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Prevent flashing before auth state is known
  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "80px", fontSize: "1.2rem" }}>
        Loading...
      </div>
    );
  }

  return (
      <Routes>
        {/* ===== LANDING PAGE ===== */}
        <Route path="/" element={<LandingPage />} />

        {/* ===== CUSTOMER PAGES ===== */}
        <Route path="/customer" element={<CustomerHome />} />
        <Route path="/customer/book" element={<BookAppointment />} />
        <Route path="/customer/bookings" element={<BookingHistory />} />

        {/* ===== ADMIN AUTH ===== */}
        <Route
          path="/admin/login"
          element={
            adminLoggedIn ? <Navigate to="/admin/dashboard" /> : <Login />
          }
        />

        {/* ===== ADMIN DASHBOARD ===== */}
        <Route
          path="/admin/dashboard"
          element={
            adminLoggedIn ? <AdminDashboard /> : <Navigate to="/admin/login" />
          }
        />

        {/* ===== FALLBACK ===== */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
  );
}
