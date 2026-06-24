// src/pages/AdminDashboard.tsx
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
    <div className="admin-layout" style={{ display: "flex", minHeight: "100vh" }}>
      {/* ================= SIDEBAR (Desktop) ================= */}
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

          <button
            className="logout-link"
            onClick={handleLogout}
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* ================= TOP NAV (Mobile) ================= */}
      <nav className="admin-topnav">
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
          Upload
        </button>
        <button
          className={activeSection === "manage" ? "active" : ""}
          onClick={() => setActiveSection("manage")}
        >
          Manage
        </button>
        <button onClick={handleLogout}>Logout</button>
      </nav>

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

      {/* Inline responsive styles */}
      <style>
        {`
          .admin-sidebar {
            width: 240px;
            background: #f8f9fa;
            padding: 20px;
            box-shadow: 2px 0 8px rgba(0,0,0,0.1);
            position: sticky;
            top: 0;
            height: 100vh;
            overflow: auto;
          }
          .admin-sidebar nav {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .admin-sidebar nav button {
            display: block;
            width: 100%;
            margin: 0;
            padding: 10px;
            border: none;
            background: #eee;
            cursor: pointer;
            border-radius: 4px;
            text-align: left;
          }
          .admin-sidebar nav button.active {
            background: linear-gradient(90deg, #d63384, #b82a6f);
            color: white;
          }
          .logout-link {
            background: #ff6b6b;
            color: white;
            font-weight: 600;
          }
          .logout-link:hover {
            opacity: 0.95;
          }

          /* Mobile top nav */
          .admin-topnav {
            display: none;
          }

          @media (max-width: 768px) {
            .admin-sidebar {
              display: none;
            }
            .admin-topnav {
              display: flex;
              justify-content: space-around;
              align-items: center;
              background: #fff;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              padding: 10px;
              position: sticky;
              top: 0;
              z-index: 100;
            }
            .admin-topnav button {
              flex: 1;
              margin: 0 4px;
              padding: 8px;
              border: none;
              background: #eee;
              border-radius: 4px;
              font-size: 14px;
            }
            .admin-topnav button.active {
              background: linear-gradient(90deg, #d63384, #b82a6f);
              color: white;
            }
          }
        `}
      </style>
    </div>
  );
}
