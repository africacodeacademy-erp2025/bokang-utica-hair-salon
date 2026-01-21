import { useState } from "react";
import { db } from "../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function HairstyleUploader() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!imageFile || !name) {
      setMessage("Please provide a name and select an image.");
      return;
    }

    try {
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
        name,
        imageUrl: data.secure_url,
        createdAt: serverTimestamp(),
      });

      setMessage("Hairstyle uploaded successfully ✅");
      setName("");
      setImageFile(null);
    } catch (error) {
      console.error(error);
      setMessage("Upload failed ❌");
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
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
      />

      <button onClick={handleUpload}>Upload</button>

      {message && <p>{message}</p>}
    </div>
  );
}
