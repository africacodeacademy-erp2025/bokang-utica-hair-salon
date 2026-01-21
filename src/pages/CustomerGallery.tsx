import { useEffect, useState } from "react";
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
  const [hairstyles, setHairstyles] = useState<Hairstyle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

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
      {/* Hero Section */}
      <div className="gallery-hero">
        <div className="gallery-hero-content">
          <h1 className="gallery-hero-title">
            Your Perfect Look
            <span>Awaits</span>
          </h1>
          <p className="gallery-hero-subtitle">Discover Premium Hairstyles</p>
          <p className="gallery-hero-description">
            Explore our exclusive collection of professionally crafted hairstyles. Find the perfect style that matches your personality and confidence.
          </p>
          <div className="gallery-hero-buttons">
            <button 
              className="gallery-hero-btn gallery-hero-btn-primary"
              onClick={() => document.querySelector('.gallery-search')?.focus()}
            >
              Explore Styles
            </button>
            <button className="gallery-hero-btn gallery-hero-btn-secondary">
              Learn More
            </button>
          </div>

          <div className="gallery-stats">
            <div className="stat-item">
              <div className="stat-number">{hairstyles.length}+</div>
              <div className="stat-label">Hairstyles</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">100%</div>
              <div className="stat-label">Premium Quality</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">✨</div>
              <div className="stat-label">Expert Crafted</div>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Controls */}
      <div className="gallery-controls">
        <input
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
      ) : (
        <div className={viewMode === "grid" ? "gallery-grid" : "gallery-list"}>
          {filteredHairstyles.map(style => (
            <div key={style.id} className={viewMode === "grid" ? "style-card" : "style-list-item"} style={viewMode === "list" ? { display: "flex", gap: "20px", alignItems: "center", padding: "15px", borderBottom: "1px solid #eee" } : {}}>
              <img 
                src={style.imageUrl} 
                alt={style.name}
                style={viewMode === "list" ? { width: "150px", height: "150px", objectFit: "cover", borderRadius: "4px" } : {}}
              />
              <div className="style-info">
                <h3>{style.name}</h3>
                {style.category && <p className="category">{style.category}</p>}
                {style.description && <p className="description">{style.description}</p>}
                {style.price && <p className="price">M{style.price}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
