// src/components/CustomerHeader.tsx
import { NavLink } from "react-router-dom";

interface Props {
  onLogout: () => void;
}

export default function CustomerHeader({ onLogout }: Props) {
  return (
    <header className="customer-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: 70 }}>
      <h2 className="logo" style={{ margin: 0, flex: 1, textAlign: 'left' }}>Utica Hair Salon</h2>
      <nav className="customer-nav" style={{ display: 'flex', flex: 2, justifyContent: 'center', gap: 32 }}>
        <NavLink to="/customer/home" style={{ fontWeight: 500 }}>Home</NavLink>
        <NavLink to="/customer/book" style={{ fontWeight: 500 }}>Book</NavLink>
        <NavLink to="/customer/bookings" style={{ fontWeight: 500 }}>My Bookings</NavLink>
      </nav>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={onLogout} style={{ background: '#d63384', color: 'white', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 600, cursor: 'pointer' }}>Logout</button>
      </div>
    </header>
  );
}
