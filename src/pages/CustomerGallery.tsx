import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import "../styles/CustomerPages.css";
import "../styles/GalleryHero.css";

interface Hairstyle {
  id: string;
  name: string;
  imageUrl: string;
  price?: number;
  description?: string;
  category?: string;
}

type ViewMode = "grid" | "list";

export default function CustomerGallery() {
  const navigate = useNavigate();
  const [hairstyles, setHairstyles] = useState<Hairstyle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // ✅ Use a ref for the search input
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchHairstyles = async () => {
      try {
        setLoading(true);
        setError("");
        const snapshot = await getDocs(collection(db, "hairstyles"));
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Hairstyle[];

        setHairstyles(data);
      } catch (error) {
        console.error("Error fetching hairstyles:", error);
        setError("Failed to load hairstyles");
      } finally {
        setLoading(false);
      }
    };

    fetchHairstyles();
  }, []);

  const filteredHairstyles = hairstyles.filter(style =>
    style.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <p className="loading-text">Loading hairstyles...</p>;
  if (error) return <p className="loading-text" style={{ color: "red" }}>{error}</p>;

  return (
    <div className="gallery-page">
      {/* Gallery Controls */}
      <div className="gallery-controls">
        <input
          ref={searchRef}
          type="text"
          placeholder="🔍 Search hairstyles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="gallery-search"
        />
        <div className="gallery-view-buttons">
          <button 
            onClick={() => setViewMode("grid")}
            className={`gallery-view-btn ${viewMode === "grid" ? "active" : ""}`}
          >
            ⊞ Grid
          </button>
          <button 
            onClick={() => setViewMode("list")}
            className={`gallery-view-btn ${viewMode === "list" ? "active" : ""}`}
          >
            ≡ List
          </button>
        </div>
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm("")}
            className="gallery-clear-btn"
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* Gallery Content */}
      <div className="gallery-content">
        {filteredHairstyles.length === 0 ? (
          <p className="loading-text">No hairstyles found.</p>
        ) : viewMode === "grid" ? (
          <div className="hairstyles-grid">
            {filteredHairstyles.map(style => (
              <div key={style.id} className="hairstyle-card">
                <img src={style.imageUrl} alt={style.name} />
                <h3>{style.name}</h3>
                {style.category && <p className="category">{style.category}</p>}
                {style.description && <p className="description">{style.description}</p>}
                {style.price && <p className="price">M{style.price}</p>}
                <button
                  onClick={() => navigate('/customer/book', { state: { name: style.name } })}
                >
                  Book Now
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="gallery-list">
            {filteredHairstyles.map(style => (
              <div
                key={style.id}
                className="style-list-item"
                style={{ display: "flex", gap: "20px", alignItems: "center", padding: "15px", borderBottom: "1px solid #eee" }}
              >
                <img
                  src={style.imageUrl}
                  alt={style.name}
                  style={{ width: "150px", height: "150px", objectFit: "cover", borderRadius: "4px" }}
                />
                <div className="style-info">
                  <h3>{style.name}</h3>
                  {style.category && <p className="category">{style.category}</p>}
                  {style.description && <p className="description">{style.description}</p>}
                  {style.price && <p className="price">M{style.price}</p>}
                  <button
                    onClick={() => navigate('/customer/book', { state: { name: style.name } })}
                    style={{ marginTop: 12, background: '#d63384', color: 'white', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
