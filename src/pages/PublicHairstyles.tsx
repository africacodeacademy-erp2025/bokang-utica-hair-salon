import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import "../styles/CustomerPages.css";

interface Hairstyle {
  id: string;
  name: string;
  imageUrl: string;
  price?: number;
  description?: string;
  category?: string;
}

export default function PublicGallery() {
  const [hairstyles, setHairstyles] = useState<Hairstyle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHairstyles = async () => {
      try {
        const snapshot = await getDocs(collection(db, "hairstyles"));
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Hairstyle, "id">),
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
      <h1 style={{ textAlign: "center", marginBottom: 30 }}>
        Our Hairstyles
      </h1>

      {loading ? (
        <p style={{ textAlign: "center" }}>Loading hairstyles...</p>
      ) : hairstyles.length === 0 ? (
        <p style={{ textAlign: "center" }}>No hairstyles available yet.</p>
      ) : (
        <div className="hairstyles-grid">
          {hairstyles.map(style => (
            <div key={style.id} className="hairstyle-card">
              {/* THIS is the same Cloudinary image field */}
              <img src={style.imageUrl} alt={style.name} />
              <h3>{style.name}</h3>

              {/* No booking button (public view) */}
              {style.price && <p>M{style.price}</p>}
              {style.category && <p>{style.category}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
