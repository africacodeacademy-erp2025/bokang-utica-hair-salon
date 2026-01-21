import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase/config";
import "../styles/HairstyleManager.css";

interface Hairstyle {
  id: string;
  name: string;
  imageUrl: string;
  createdAt?: any;
}

export default function HairstyleManager() {
  const [hairstyles, setHairstyles] = useState<Hairstyle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHairstyles = async () => {
      try {
        setLoading(true);
        setError("");
        const snapshot = await getDocs(collection(db, "hairstyles"));
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Hairstyle));
        setHairstyles(data);
      } catch (err) {
        setError("Failed to fetch hairstyles");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHairstyles();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Delete "${name}"? This cannot be undone.`)) {
      try {
        await deleteDoc(doc(db, "hairstyles", id));
        setHairstyles(hairstyles.filter(h => h.id !== id));
        alert("Hairstyle deleted successfully!");
      } catch (err) {
        console.error("Failed to delete hairstyle:", err);
        setError("Failed to delete hairstyle");
      }
    }
  };

  if (loading) return <p className="hairstyle-loading">Loading hairstyles...</p>;
  if (error) return <p className="hairstyle-error">{error}</p>;

  return (
    <div className="hairstyle-manager-container">
      {hairstyles.length === 0 ? (
        <p className="hairstyle-empty">No hairstyles uploaded yet.</p>
      ) : (
        <div className="hairstyle-gallery">
          {hairstyles.map(style => (
            <div key={style.id} className="hairstyle-card-item">
              <div className="hairstyle-card-image">
                <img src={style.imageUrl} alt={style.name} />
              </div>
              <div className="hairstyle-card-content">
                <h3>{style.name}</h3>
                <button
                  onClick={() => handleDelete(style.id, style.name)}
                  className="hairstyle-delete-btn"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
