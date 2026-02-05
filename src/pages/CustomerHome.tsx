// src/pages/CustomerHome.tsx
import { useNavigate } from "react-router-dom";

export default function CustomerHome() {
  const navigate = useNavigate();

  return (
    <div className="customer-home min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-pink-100 via-white to-purple-100 relative overflow-hidden">

      {/* Animated background shapes */}
      <div
        className="absolute top-[-80px] left-[-120px] w-[320px] h-[320px] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, #d63384 40%, transparent 70%)',
          animation: 'float 7s ease-in-out infinite',
          zIndex: 0,
        }}
      />
      <div
        className="absolute bottom-[-100px] right-[-100px] w-[260px] h-[260px] rounded-full opacity-15"
        style={{
          background: 'radial-gradient(circle, #b82a6f 40%, transparent 70%)',
          animation: 'float 9s ease-in-out infinite reverse',
          zIndex: 0,
        }}
      />

      {/* Customer Card */}
      <div className="customer-container relative z-10 fade-in">
        <h1>Welcome to Utica Hair Salon!</h1>
        <p>
          Discover beautiful, professional hairstyles and book your next appointment with ease.
          <br />
          Explore our gallery to find your perfect look, or manage your bookings from your dashboard.
        </p>
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button onClick={() => navigate('/customer/gallery')}>
            ✨ Explore Hairstyles ✨
          </button>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }
      `}</style>
    </div>
  );
}
