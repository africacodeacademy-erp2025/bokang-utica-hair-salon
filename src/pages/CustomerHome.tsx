import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import "../styles/CustomerPages.css";

interface Hairstyle {
  id: string;
  name: string;
  imageUrl: string;
}

export default function CustomerHome() {
  const [hairstyles, setHairstyles] = useState<Hairstyle[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHairstyles = async () => {
      try {
        const snapshot = await getDocs(collection(db, "hairstyles"));
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Hairstyle, "id">)
        }));
        setHairstyles(data);
      } catch (err) {
        console.error("Failed to fetch hairstyles:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHairstyles();
  }, []);

  return (
    <div className="customer-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ margin: 0 }}>Our Hairstyles</h1>
        <button
          onClick={() => navigate("/customer/bookings")}
          style={{ padding: "10px 20px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          View My Bookings
        </button>
      </div>
      
      <p style={{ textAlign: "center", marginBottom: 30 }}>
        Explore our latest styles and book the one you love
      </p>

      {loading ? (
        <p style={{ textAlign: "center" }}>Loading hairstyles...</p>
      ) : hairstyles.length === 0 ? (
        <p style={{ textAlign: "center" }}>
          No hairstyles available yet. Please check back soon.
        </p>
      ) : (
        <div className="hairstyles-grid">
          {hairstyles.map(style => (
            <div key={style.id} className="hairstyle-card">
              <img src={style.imageUrl} alt={style.name} />
              <h3>{style.name}</h3>
              <button
                style={{ marginBottom: 15 }}
                onClick={() => navigate("/customer/book", { state: style })}
              >
                Book this style
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
