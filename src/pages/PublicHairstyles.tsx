// src/pages/PublicHairstyles.tsx
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

export default function PublicHairstyles() {
  const [hairstyles, setHairstyles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHairstyles = async () => {
      try {
        const colRef = collection(db, "hairstyles"); // your hairstyles collection
        const snapshot = await getDocs(colRef);
        const list: any[] = [];
        snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
        setHairstyles(list);
      } catch (err) {
        console.error("Failed to fetch hairstyles:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHairstyles();
  }, []);

  if (loading) return <p className="loading">Loading hairstyles...</p>;

  return (
    <div className="customer-container">
      <h1>Our Hairstyles</h1>
      <div className="hairstyles-grid">
        {hairstyles.map((style) => (
          <div key={style.id} className="hairstyle-card">
            <img src={style.image} alt={style.name} />
            <h3>{style.name}</h3>
            <p>{style.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
