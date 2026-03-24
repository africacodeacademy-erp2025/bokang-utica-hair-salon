import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, onSnapshot, updateDoc, writeBatch } from "firebase/firestore";
import { db } from "../firebase/config";
import HairstyleUploader from "./HairstyleUploader";
import "../styles/HairstyleManager.css";

interface Hairstyle {
  id: string;
  name: string;
  imageUrl: string;
  createdAt?: any;
  order?: number;
}

export default function HairstyleManager() {
  const [hairstyles, setHairstyles] = useState<Hairstyle[]>([]);
  const [filteredHairstyles, setFilteredHairstyles] = useState<Hairstyle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date">("date");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [showUploader, setShowUploader] = useState(false);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [batchEditMode, setBatchEditMode] = useState(false);
  const [batchPrefix, setBatchPrefix] = useState("");
  const [batchSuffix, setBatchSuffix] = useState("");

  useEffect(() => {
    // Real-time listener for hairstyles
    const unsubscribe = onSnapshot(
      collection(db, "hairstyles"),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Hairstyle));
        setHairstyles(data);
        setLoading(false);
      },
      (err) => {
        setError("Failed to fetch hairstyles");
        console.error(err);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    // Filter and sort hairstyles
    let filtered = hairstyles.filter(style =>
      style.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else {
        // Sort by order first, then by date
        const orderA = a.order ?? 999999;
        const orderB = b.order ?? 999999;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime(); // Newest first
      }
    });

    setFilteredHairstyles(filtered);
  }, [hairstyles, searchTerm, sortBy]);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Delete "${name}"? This cannot be undone.`)) {
      try {
        await deleteDoc(doc(db, "hairstyles", id));
        setSelectedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      } catch (err) {
        console.error("Failed to delete hairstyle:", err);
        setError("Failed to delete hairstyle");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    const count = selectedIds.size;
    if (window.confirm(`Delete ${count} hairstyle${count > 1 ? 's' : ''}? This cannot be undone.`)) {
      try {
        const deletePromises = Array.from(selectedIds).map(id =>
          deleteDoc(doc(db, "hairstyles", id))
        );
        await Promise.all(deletePromises);
        setSelectedIds(new Set());
        alert(`${count} hairstyle${count > 1 ? 's' : ''} deleted successfully!`);
      } catch (err) {
        console.error("Failed to delete hairstyles:", err);
        setError("Failed to delete some hairstyles");
      }
    }
  };

  const handleEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editingName.trim()) return;

    try {
      await updateDoc(doc(db, "hairstyles", editingId), {
        name: editingName.trim()
      });
      setEditingId(null);
      setEditingName("");
    } catch (err) {
      console.error("Failed to update hairstyle:", err);
      setError("Failed to update hairstyle");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filteredHairstyles.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredHairstyles.map(h => h.id)));
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItemId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverItem(id);
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const draggedId = draggedItemId;
    setDraggedItemId(null);
    setDragOverItem(null);

    if (!draggedId || draggedId === targetId) return;

    const draggedIndex = filteredHairstyles.findIndex(h => h.id === draggedId);
    const targetIndex = filteredHairstyles.findIndex(h => h.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Create new order
    const newOrder = [...filteredHairstyles];
    const [draggedStyle] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedStyle);

    // Update order in Firestore
    try {
      const batch = writeBatch(db);
      newOrder.forEach((hairstyle, index) => {
        batch.update(doc(db, "hairstyles", hairstyle.id), { order: index });
      });
      await batch.commit();
    } catch (error) {
      console.error("Failed to update order:", error);
      setError("Failed to reorder hairstyles");
    }
  };

  const handleImagePreview = (imageUrl: string) => {
    setPreviewImage(imageUrl);
  };

  const closePreview = () => {
    setPreviewImage(null);
  };

  const handleBatchEdit = async () => {
    if (selectedIds.size === 0) return;

    if (!batchPrefix.trim() && !batchSuffix.trim()) {
      alert("Please enter a prefix or suffix to apply.");
      return;
    }

    try {
      const batch = writeBatch(db);
      const selectedHairstyles = filteredHairstyles.filter(h => selectedIds.has(h.id));

      selectedHairstyles.forEach(hairstyle => {
        const newName = `${batchPrefix}${hairstyle.name}${batchSuffix}`;
        batch.update(doc(db, "hairstyles", hairstyle.id), { name: newName.trim() });
      });

      await batch.commit();
      setSelectedIds(new Set());
      setBatchEditMode(false);
      setBatchPrefix("");
      setBatchSuffix("");
      alert(`Successfully updated ${selectedHairstyles.length} hairstyle${selectedHairstyles.length > 1 ? 's' : ''}!`);
    } catch (error) {
      console.error("Failed to batch edit:", error);
      setError("Failed to update hairstyles");
    }
  };

  const cancelBatchEdit = () => {
    setBatchEditMode(false);
    setBatchPrefix("");
    setBatchSuffix("");
  };

  if (loading) return (
    <div className="hairstyle-manager-container">
      <div className="hairstyle-loading">Loading hairstyles...</div>
    </div>
  );

  if (error) return (
    <div className="hairstyle-manager-container">
      <div className="hairstyle-error">{error}</div>
    </div>
  );

  return (
    <div className="hairstyle-manager-container">
      {/* Header with Statistics */}
      <div className="hairstyle-manager-header">
        <h2>Hairstyle Management</h2>
        <p>Manage your salon&apos;s hairstyle gallery ({hairstyles.length} total)</p>
      </div>

      {/* Controls */}
      <div className="hairstyle-controls">
        <div className="hairstyle-search-sort">
          <input
            type="text"
            placeholder="Search hairstyles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="hairstyle-search-input"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "name" | "date")}
            className="hairstyle-sort-select"
          >
            <option value="date">Sort by Custom Order</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>

        <div className="hairstyle-actions">
          <button
            onClick={() => setShowUploader(!showUploader)}
            className="hairstyle-action-btn upload-btn"
          >
            {showUploader ? 'Hide' : 'Show'} Uploader
          </button>
          {selectedIds.size > 0 && !batchEditMode && (
            <button
              onClick={() => setBatchEditMode(true)}
              className="hairstyle-action-btn batch-edit-btn"
            >
              Batch Edit ({selectedIds.size})
            </button>
          )}
          {selectedIds.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="hairstyle-action-btn delete-btn"
            >
              Delete Selected ({selectedIds.size})
            </button>
          )}
        </div>
      </div>

      {/* Uploader */}
      {showUploader && (
        <div className="hairstyle-uploader-section">
          <HairstyleUploader onUploadSuccess={() => {
            // The real-time listener will automatically update the list
            // but we can also clear any error state
            setError("");
          }} />
        </div>
      )}

      {/* Batch Edit Form */}
      {batchEditMode && selectedIds.size > 0 && (
        <div className="hairstyle-batch-edit-section">
          <h3>Batch Edit Selected Hairstyles ({selectedIds.size})</h3>
          <div className="hairstyle-batch-edit-form">
            <div className="hairstyle-batch-input-group">
              <label>Prefix:</label>
              <input
                type="text"
                value={batchPrefix}
                onChange={(e) => setBatchPrefix(e.target.value)}
                placeholder="Add before name (e.g., 'New - ')"
                className="hairstyle-batch-input"
              />
            </div>
            <div className="hairstyle-batch-input-group">
              <label>Suffix:</label>
              <input
                type="text"
                value={batchSuffix}
                onChange={(e) => setBatchSuffix(e.target.value)}
                placeholder="Add after name (e.g., ' - Special')"
                className="hairstyle-batch-input"
              />
            </div>
            <div className="hairstyle-batch-buttons">
              <button onClick={handleBatchEdit} className="hairstyle-batch-apply-btn">
                Apply Changes
              </button>
              <button onClick={cancelBatchEdit} className="hairstyle-batch-cancel-btn">
                Cancel
              </button>
            </div>
          </div>
          <div className="hairstyle-batch-preview">
            <p><strong>Preview:</strong></p>
            {filteredHairstyles.filter(h => selectedIds.has(h.id)).slice(0, 3).map(style => (
              <p key={style.id} className="hairstyle-batch-preview-item">
                "{style.name}" → "{batchPrefix}{style.name}{batchSuffix}"
              </p>
            ))}
            {selectedIds.size > 3 && <p className="hairstyle-batch-preview-more">... and {selectedIds.size - 3} more</p>}
          </div>
        </div>
      )}

      {/* Bulk Selection Controls */}
      {filteredHairstyles.length > 0 && (
        <div className="hairstyle-bulk-controls">
          <label className="hairstyle-select-all">
            <input
              type="checkbox"
              checked={selectedIds.size === filteredHairstyles.length && filteredHairstyles.length > 0}
              onChange={selectAll}
            />
            Select All ({filteredHairstyles.length})
          </label>
        </div>
      )}

      {/* Gallery */}
      {filteredHairstyles.length === 0 ? (
        <div className="hairstyle-empty">
          {searchTerm ? 'No hairstyles match your search.' : 'No hairstyles uploaded yet.'}
        </div>
      ) : (
        <div className="hairstyle-gallery">
          {filteredHairstyles.map(style => (
            <div
              key={style.id}
              className={`hairstyle-card-item ${draggedItemId === style.id ? 'dragging' : ''} ${dragOverItem === style.id ? 'drag-over' : ''}`}
              draggable={sortBy === "date"}
              onDragStart={(e) => handleDragStart(e, style.id)}
              onDragOver={(e) => handleDragOver(e, style.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, style.id)}
            >
              <div className="hairstyle-selection-overlay">
                <input
                  type="checkbox"
                  checked={selectedIds.has(style.id)}
                  onChange={() => toggleSelection(style.id)}
                  className="hairstyle-checkbox"
                />
              </div>

              <div className="hairstyle-card-image">
                <img
                  src={style.imageUrl}
                  alt={style.name}
                  onClick={() => handleImagePreview(style.imageUrl)}
                  style={{ cursor: 'pointer' }}
                />
              </div>

              <div className="hairstyle-card-content">
                {editingId === style.id ? (
                  <div className="hairstyle-edit-form">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="hairstyle-edit-input"
                      autoFocus
                    />
                    <div className="hairstyle-edit-buttons">
                      <button onClick={handleSaveEdit} className="hairstyle-save-btn">Save</button>
                      <button onClick={handleCancelEdit} className="hairstyle-cancel-btn">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    {sortBy === "date" && (
                      <div className="hairstyle-drag-handle">
                        <span>⋮⋮</span>
                        <span className="drag-hint">Drag to reorder</span>
                      </div>
                    )}
                    <h3>{style.name}</h3>
                    <div className="hairstyle-card-actions">
                      <button
                        onClick={() => handleEdit(style.id, style.name)}
                        className="hairstyle-edit-btn"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(style.id, style.name)}
                        className="hairstyle-delete-btn"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="hairstyle-preview-modal" onClick={closePreview}>
          <div className="hairstyle-preview-content" onClick={(e) => e.stopPropagation()}>
            <button className="hairstyle-preview-close" onClick={closePreview}>×</button>
            <img src={previewImage} alt="Preview" className="hairstyle-preview-image" />
          </div>
        </div>
      )}
    </div>
  );
}
