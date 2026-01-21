import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import AppointmentList from "../components/AppointmentList";
import HairstyleUploader from "../components/HairstyleUploader";
import HairstyleManager from "../components/HairstyleManager";
import "../styles/AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<"appointments" | "upload" | "manage">(
    "appointments"
  );

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="admin-layout">
      {/* ================= SIDEBAR ================= */}
      <aside className="admin-sidebar">
        <h2>Bokang Utica</h2>

        <nav>
          <button
            className={activeSection === "appointments" ? "active" : ""}
            onClick={() => setActiveSection("appointments")}
          >
            Appointments
          </button>

          <button
            className={activeSection === "upload" ? "active" : ""}
            onClick={() => setActiveSection("upload")}
          >
            Upload Hairstyle
          </button>

          <button
            className={activeSection === "manage" ? "active" : ""}
            onClick={() => setActiveSection("manage")}
          >
            Manage Hairstyles
          </button>
        </nav>

        <div className="sidebar-logout">
          <button onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="admin-content">
        <button 
          onClick={() => navigate("/")}
          style={{ marginBottom: "20px" }}
        >
          ← Back to Landing
        </button>

        {activeSection === "appointments" && (
          <section className="dashboard-section">
            <h1>Booked Appointments</h1>
            <AppointmentList />
          </section>
        )}

        {activeSection === "upload" && (
          <section className="dashboard-section">
            <h1>Upload New Hairstyle</h1>
            <HairstyleUploader />
          </section>
        )}

        {activeSection === "manage" && (
          <section className="dashboard-section">
            <HairstyleManager />
          </section>
        )}
      </main>
    </div>
  );
}
