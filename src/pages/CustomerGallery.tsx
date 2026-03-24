// src/pages/CustomerGallery.tsx
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
      {/* Controls */}
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

      {/* Content */}
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
              <div key={style.id} className="style-list-item">
                <img src={style.imageUrl} alt={style.name} className="list-image" />
                <div className="style-info">
                  <h3>{style.name}</h3>
                  {style.category && <p className="category">{style.category}</p>}
                  {style.description && <p className="description">{style.description}</p>}
                  {style.price && <p className="price">M{style.price}</p>}
                  <button
                    onClick={() => navigate('/customer/book', { state: { name: style.name } })}
                    className="book-btn"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Responsive styles */}
      <style>
        {`
          .hairstyles-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 20px;
          }
          .hairstyle-card {
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            padding: 16px;
            text-align: center;
          }
          .hairstyle-card img {
            width: 100%;
            height: 200px;
            object-fit: cover;
            border-radius: 6px;
          }
          .hairstyle-card button {
            margin-top: 12px;
            background: #d63384;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 8px 20px;
            font-weight: 600;
            cursor: pointer;
          }

          .gallery-list .style-list-item {
            display: flex;
            gap: 20px;
            align-items: center;
            padding: 15px;
            border-bottom: 1px solid #eee;
          }
          .gallery-list .list-image {
            width: 150px;
            height: 150px;
            object-fit: cover;
            border-radius: 4px;
          }
          .book-btn {
            margin-top: 12px;
            background: #d63384;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 8px 20px;
            font-weight: 600;
            cursor: pointer;
          }

          /* Mobile adjustments */
          @media (max-width: 768px) {
            .hairstyles-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 12px;
            }
            .hairstyle-card img {
              height: 140px;
            }
            .gallery-controls {
              display: flex;
              flex-direction: column;
              gap: 8px;
              padding: 10px;
            }
            .gallery-view-buttons {
              display: flex;
              justify-content: space-around;
            }
            .gallery-list .style-list-item {
              flex-direction: column;
              align-items: flex-start;
            }
            .gallery-list .list-image {
              width: 100%;
              height: auto;
            }
          }
        `}
      </style>
    </div>
  );
}
