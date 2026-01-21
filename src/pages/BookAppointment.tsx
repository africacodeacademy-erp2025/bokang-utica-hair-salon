import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { collection, addDoc, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import "../styles/CustomerPages.css";

export default function BookAppointment() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedStyle = location.state as { name?: string };

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState("");

  // Generates a unique confirmation number
  const generateConfirmationNumber = () => "APPT" + Date.now().toString().slice(-8);

  // Checks if the selected slot is available
  const isSlotAvailable = async (date: string, time: string) => {
    const q = query(
      collection(db, "appointments"),
      where("date", "==", date),
      where("time", "==", time),
      where("status", "in", ["pending", "confirmed"]) // only consider active bookings
    );
    const snapshot = await getDocs(q);
    return snapshot.empty; // true if no conflicts
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !date || !time) {
      setMessage("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Check if the slot is already booked
      const available = await isSlotAvailable(date, time);
      if (!available) {
        setMessage("❌ Sorry, this time slot is already booked. Please choose another.");
        setLoading(false);
        return;
      }

      // If available, create the appointment
      const confirmNumber = generateConfirmationNumber();
      await addDoc(collection(db, "appointments"), {
        customerName: name,
        customerEmail: email.trim().toLowerCase(),
        date,
        time,
        hairstyle: selectedStyle?.name || "Not specified",
        status: "pending",
        confirmationNumber: confirmNumber,
        createdAt: Timestamp.now()
      });

      setConfirmationNumber(confirmNumber);
      setMessage(`✅ Appointment booked successfully! Confirmation #: ${confirmNumber}`);

      // Optional: redirect back to customer page after 3 seconds
      setTimeout(() => navigate("/customer"), 3000);

    } catch (error) {
      console.error("Booking error:", error);
      setMessage("❌ Failed to book appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customer-container" style={{ maxWidth: "500px", margin: "40px auto", padding: "20px" }}>
      <button 
        onClick={() => navigate("/customer")}
        style={{ marginBottom: "20px", backgroundColor: "#6c757d", padding: "10px 20px", fontSize: "14px" }}
      >
        ← Back
      </button>

      <h1>Book Appointment</h1>

      {selectedStyle?.name && (
        <p style={{ textAlign: "center", marginBottom: 20, fontSize: "16px", color: "#495057" }}>
          Selected style: <strong style={{ color: "#007bff" }}>{selectedStyle.name}</strong>
        </p>
      )}

      {confirmationNumber && (
        <div style={{ backgroundColor: "#d4edda", border: "1px solid #c3e6cb", color: "#155724", padding: "15px", borderRadius: "4px", marginBottom: "20px" }}>
          <strong>Confirmation Number: {confirmationNumber}</strong>
          <p style={{ margin: "10px 0 0 0", fontSize: "14px" }}>Please save this number for your records.</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "10px", border: "1px solid #ccc", borderRadius: "4px", boxSizing: "border-box" }}
        />
        <input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "10px", border: "1px solid #ccc", borderRadius: "4px", boxSizing: "border-box" }}
        />
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "10px", border: "1px solid #ccc", borderRadius: "4px", boxSizing: "border-box" }}
        />
        <input
          type="time"
          value={time}
          onChange={e => setTime(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "10px", border: "1px solid #ccc", borderRadius: "4px", boxSizing: "border-box" }}
        />

        <button 
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: "12px", backgroundColor: loading ? "#6c757d" : "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: loading ? "default" : "pointer", fontSize: "16px" }}
        >
          {loading ? "Booking..." : "Confirm Appointment"}
        </button>

        {message && (
          <p style={{ marginTop: "15px", padding: "10px", backgroundColor: confirmationNumber ? "#d4edda" : "#f8d7da", color: confirmationNumber ? "#155724" : "#721c24", borderRadius: "4px" }}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
