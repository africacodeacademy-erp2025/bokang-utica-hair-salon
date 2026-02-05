// src/layouts/CustomerLayout.tsx
import { Outlet, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import CustomerHeader from "../components/CustomerHeader";

export default function CustomerLayout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/auth");
  };

  return (
    <div className="customer-layout">
      <CustomerHeader onLogout={handleLogout} />

      <main className="customer-content">
        <Outlet />
      </main>
    </div>
  );
}
