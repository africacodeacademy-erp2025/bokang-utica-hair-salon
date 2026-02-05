// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase/config";
import { doc, getDoc } from "firebase/firestore";

// public pages
import LandingPage from "./pages/LandingPage";
import Auth from "./pages/auth/auth";
import PublicHairstyles from "./pages/PublicHairstyles"; // ✅ import added

// admin
import AdminDashboard from "./pages/AdminDashboard";

// customer layout + pages
import CustomerLayout from "./layouts/CustomerLayout";
import CustomerHome from "./pages/CustomerHome";
import BookAppointment from "./pages/BookAppointment";
import BookingHistory from "./pages/BookingHistory";
import CustomerGallery from "./pages/CustomerGallery";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<"admin" | "customer" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      setUser(currentUser);

      try {
        const snap = await getDoc(doc(db, "users", currentUser.uid));

        if (snap.exists()) {
          const data = snap.data();
          setRole(data.role === "admin" ? "admin" : "customer");
        } else {
          // fallback safety
          setRole("customer");
        }
      } catch (err) {
        console.error("Failed to fetch user role:", err);
        setRole("customer");
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 80 }}>
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      {/* public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/hairstyles" element={<PublicHairstyles />} /> {/* public gallery */}

      {/* ADMIN */}
      <Route
        path="/admin"
        element={
          user && role === "admin" ? (
            <AdminDashboard />
          ) : (
            <Navigate to="/auth" />
          )
        }
      />

      {/* CUSTOMER */}
      <Route
        path="/customer"
        element={
          user && role === "customer" ? (
            <CustomerLayout />
          ) : (
            <Navigate to="/auth" />
          )
        }
      >
        <Route index element={<Navigate to="home" />} />
        <Route path="home" element={<CustomerHome />} />
        <Route path="gallery" element={<CustomerGallery />} />
        <Route path="book" element={<BookAppointment />} />
        <Route path="bookings" element={<BookingHistory />} />
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
