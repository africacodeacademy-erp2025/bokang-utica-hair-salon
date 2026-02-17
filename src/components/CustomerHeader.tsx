// src/components/CustomerHeader.tsx
import { NavLink } from "react-router-dom";

interface Props {
  onLogout: () => void;
}

export default function CustomerHeader({ onLogout }: Props) {
  // Base button style for all tabs
  const tabStyle = {
    fontWeight: 500,
    padding: "8px 20px",
    borderRadius: 9999, // fully rounded like other buttons
    background: "linear-gradient(90deg, #d63384, #b82a6f)",
    color: "white",
    boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
    transition: "all 0.2s",
    cursor: "pointer",
    textDecoration: "none" as const,
  };

  return (
    <header
      className="customer-header"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        height: 70,
        background: "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <h2
        className="logo"
        style={{ margin: 0, flex: 1, textAlign: "left", color: "#d63384" }}
      >
        Utica Hair Salon
      </h2>

      <nav
        className="customer-nav"
        style={{ display: "flex", flex: 2, justifyContent: "center", gap: 16 }}
      >
        <NavLink
          to="/customer/home"
          style={tabStyle}
          className="tab-btn"
        >
          Home
        </NavLink>

        <NavLink
          to="/customer/book"
          style={tabStyle}
          className="tab-btn"
        >
          Book
        </NavLink>

        <NavLink
          to="/customer/bookings"
          style={tabStyle}
          className="tab-btn"
        >
          My Bookings
        </NavLink>
      </nav>

      <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={onLogout}
          style={{
            background: "linear-gradient(90deg, #d63384, #b82a6f)",
            color: "white",
            border: "none",
            borderRadius: 9999,
            padding: "8px 20px",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
            transition: "all 0.2s",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.transform = "scale(1.05)")
          }
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
