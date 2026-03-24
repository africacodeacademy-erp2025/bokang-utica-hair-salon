import { useState } from "react";
import { db } from "../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface HairstyleUploaderProps {
  onUploadSuccess?: () => void;
}

export default function HairstyleUploader({ onUploadSuccess }: HairstyleUploaderProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!imageFile || !name.trim()) {
      setMessage("Please provide a name and select an image.");
      return;
    }

    try {
      setIsUploading(true);
      setMessage("Uploading image...");

      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append(
        "upload_preset",
        import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
      );

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        throw new Error(`Cloudinary upload failed: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();

      if (!data.secure_url) {
        throw new Error("Cloudinary upload succeeded but no URL returned");
      }

      // Save to Firestore
      await addDoc(collection(db, "hairstyles"), {
        name: name.trim(),
        imageUrl: data.secure_url,
        createdAt: serverTimestamp(),
      });

      setMessage("Hairstyle uploaded successfully ✅");
      setName("");
      setImageFile(null);

      // Call the success callback to refresh the parent component
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error(error);
      setMessage("Upload failed ❌");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="upload-box">
      <h2>Upload New Hairstyle</h2>

      <input
        type="text"
        placeholder="Hairstyle name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={isUploading}
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
        disabled={isUploading}
      />

      <button onClick={handleUpload} disabled={isUploading}>
        {isUploading ? "Uploading..." : "Upload"}
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}
