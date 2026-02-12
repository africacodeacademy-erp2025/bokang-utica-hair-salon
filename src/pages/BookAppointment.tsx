import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { auth, db } from "../firebase/config";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import "../styles/CustomerPages.css";

export default function BookAppointment() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedStyle = location.state as { name?: string };

  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState("");

  // Automatically get current logged-in user
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setName(currentUser.displayName || "");
        setEmail(currentUser.email || "");
      } else {
        setUser(null);
        setName("");
        setEmail("");
      }
    });
    return unsub;
  }, []);

  const generateConfirmationNumber = () =>
    "APPT" + Date.now().toString().slice(-8);

  // Check if the selected slot is available
  const isSlotAvailable = async (date: string, time: string) => {
    const q = query(
      collection(db, "appointments"),
      where("date", "==", date),
      where("time", "==", time),
      where("status", "in", ["pending", "confirmed"])
    );
    const snapshot = await getDocs(q);
    return snapshot.empty;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setMessage("❌ You must be logged in to book.");
      return;
    }

    if (!name || !email || !date || !time) {
      setMessage("❌ Please fill in all fields.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Check slot availability
      const available = await isSlotAvailable(date, time);
      if (!available) {
        setMessage("❌ This time slot is already booked.");
        setLoading(false);
        return;
      }

      const confirmNumber = generateConfirmationNumber();

      // Save appointment in Firestore
      await addDoc(collection(db, "appointments"), {
        customerName: name,
        customerEmail: email.trim().toLowerCase(), // Email-based security
        date,
        time,
        hairstyle: selectedStyle?.name || "Not specified",
        status: "pending",
        confirmationNumber: confirmNumber,
        createdAt: Timestamp.now(),
      });

      setConfirmationNumber(confirmNumber);
      setMessage(`✅ Appointment booked! Confirmation #: ${confirmNumber}`);
    } catch (error) {
      console.error("Booking error:", error);
      setMessage("❌ Failed to book appointment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="customer-container"
      style={{ maxWidth: "500px", margin: "40px auto", padding: "20px" }}
    >
      <button
        onClick={() => navigate("/customer/dashboard")}
        style={{
          marginBottom: "20px",
          backgroundColor: "#6c757d",
          padding: "10px 20px",
          fontSize: "14px",
        }}
      >
        ← Back
      </button>

      <h1>Confirm Booking</h1>

      {selectedStyle?.name && (
        <p style={{ textAlign: "center", marginBottom: 20, fontWeight: 600 }}>
          Selected style:{" "}
          <span style={{ color: "#d63384" }}>{selectedStyle.name}</span>
        </p>
      )}

      {confirmationNumber && (
        <div
          style={{
            backgroundColor: "#d4edda",
            border: "1px solid #c3e6cb",
            color: "#155724",
            padding: "15px",
            borderRadius: "4px",
            marginBottom: "20px",
          }}
        >
          <strong>Confirmation Number: {confirmationNumber}</strong>
          <p style={{ margin: "10px 0 0 0", fontSize: "14px" }}>
            Please save this number for your records.
          </p>
          <button
            style={{
              marginTop: "15px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "10px 20px",
              fontWeight: 600,
              cursor: "pointer",
            }}
            onClick={() => navigate("/customer/bookings")}
          >
            Go to My Bookings
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={!!name}
          required
        />
        <input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={!!email}
          required
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Booking..." : "Confirm Appointment"}
        </button>
        {message && (
          <p
            style={{
              marginTop: "15px",
              padding: "10px",
              borderRadius: "4px",
              backgroundColor: confirmationNumber ? "#d4edda" : "#f8d7da",
              color: confirmationNumber ? "#155724" : "#721c24",
            }}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
