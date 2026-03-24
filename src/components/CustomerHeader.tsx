// src/components/CustomerHeader.tsx
import { NavLink } from "react-router-dom";

interface Props {
  onLogout: () => void;
}

export default function CustomerHeader({ onLogout }: Props) {
  return (
    <>
      {/* Top Header */}
      <header className="customer-header">
        <h2 className="logo">Utica Hair Salon</h2>

        {/* Desktop Navigation */}
        <nav className="customer-nav">
          <NavLink to="/customer/home" className="tab-btn">
            Home
          </NavLink>
          <NavLink to="/customer/book" className="tab-btn">
            Book
          </NavLink>
          <NavLink to="/customer/bookings" className="tab-btn">
            My Bookings
          </NavLink>
          <button onClick={onLogout} className="tab-btn logout-btn">
            Logout
          </button>
        </nav>
      </header>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="customer-bottomnav">
        <NavLink to="/customer/home" className="bottom-btn">
          Home
        </NavLink>
        <NavLink to="/customer/book" className="bottom-btn">
          Book
        </NavLink>
        <NavLink to="/customer/bookings" className="bottom-btn">
          My Bookings
        </NavLink>
        <button onClick={onLogout} className="bottom-btn">
          Logout
        </button>
      </nav>

      {/* Styles */}
      <style>
        {`
        /* ===== Header ===== */
        .customer-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: #ffffff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          padding: 10px 15px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
        }

        .logo {
          margin: 0;
          font-size: 20px;
          color: #d63384;
          font-weight: 700;
        }

        /* ===== Desktop Nav ===== */
        .customer-nav {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .tab-btn {
          padding: 8px 14px;
          border-radius: 20px;
          background: linear-gradient(90deg, #d63384, #b82a6f);
          color: white;
          text-decoration: none;
          border: none;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
          transition: transform 0.2s ease;
          white-space: nowrap;
        }

        .tab-btn:hover {
          transform: scale(1.05);
        }

        .tab-btn.active {
          background: linear-gradient(90deg, #b82a6f, #8c1f52);
          font-weight: 600;
        }

        .logout-btn {
          font-weight: 600;
        }

        /* ===== Bottom Mobile Nav ===== */
        .customer-bottomnav {
          display: none;
        }

        /* ===== Mobile Styles ===== */
        @media (max-width: 768px) {
          .customer-nav {
            display: none;
          }

          .customer-header {
            justify-content: center;
            text-align: center;
          }

          .logo {
            font-size: 18px;
          }

          /* Bottom nav */
          .customer-bottomnav {
            display: flex;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: #ffffff;
            box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
            z-index: 200;
          }

          .bottom-btn {
            flex: 1;
            text-align: center;
            padding: 12px 0;
            font-size: 14px;
            border: none;
            background: none;
            color: #d63384;
            cursor: pointer;
            text-decoration: none;
            font-weight: 500;
          }

          .bottom-btn.active {
            color: #b82a6f;
            font-weight: 700;
          }

          /* Prevent content from being hidden behind bottom nav */
          body {
            padding-bottom: 65px;
          }
        }
        `}
      </style>
    </>
  );
}
