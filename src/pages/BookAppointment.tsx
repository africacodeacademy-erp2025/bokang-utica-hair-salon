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
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState("");
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);

  // ✅ Get logged-in user
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setName(currentUser.displayName || "");
      } else {
        setUser(null);
        setName("");
      }
    });
    return unsub;
  }, []);

  // ✅ Fetch booked times for selected date
  useEffect(() => {
    const fetchBookedTimes = async () => {
      const q = query(
        collection(db, "appointments"),
        where("date", "==", date),
        where("status", "in", ["pending", "confirmed"])
      );
      const snapshot = await getDocs(q);
      const times: string[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.time) times.push(data.time);
      });
      setBookedTimes(times);
    };
    fetchBookedTimes();
  }, [date]);

  // ✅ Generate 30-min interval slots from 05:00 → 19:00
  const generateTimeSlots = () => {
    const slots: string[] = [];
    for (let h = 5; h <= 19; h++) {
      ["00", "30"].forEach((m) => {
        const hour = h.toString().padStart(2, "0");
        slots.push(`${hour}:${m}`);
      });
    }
    return slots;
  };

  const generateConfirmationNumber = () =>
    "APPT" + Date.now().toString().slice(-8);

  const sendConfirmationEmail = async (
    recipient: string,
    customerName: string,
    appointmentDate: string,
    appointmentTime: string,
    hairstyle: string,
    confirmationNumber: string
  ) => {
    const apiUrl =
      import.meta.env.VITE_BOOKING_EMAIL_API_URL ||
      "http://localhost:3000/api/send-booking-confirmation";

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: recipient,
          subject: "Bokang Utica Hair Salon - Appointment Confirmation",
          body: `Dear ${customerName},\n\nYour appointment has been scheduled:\nDate: ${appointmentDate}\nTime: ${appointmentTime}\nService: ${hairstyle}\nConfirmation #: ${confirmationNumber}\n\nThank you!`,
        }),
      });
      const emailResponse = await res.json().catch(() => ({}));
      if (!res.ok) return `Failed to send email (${res.status})`;
      return emailResponse.testMode
        ? "Test mode: Email logged."
        : "Confirmation email sent.";
    } catch (err) {
      console.error(err);
      return `Failed to send confirmation email: ${err}`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setMessage("❌ Please login first.");
      return;
    }

    if (!name || !date || !time) {
      setMessage("❌ Please fill in all fields.");
      return;
    }

    setLoading(true);
    setMessage("");

    if (bookedTimes.includes(time)) {
      setMessage("❌ This time slot is already booked.");
      setLoading(false);
      return;
    }

    try {
      const confirmNumber = generateConfirmationNumber();

      await addDoc(collection(db, "appointments"), {
        userId: user.uid,
        customerName: name,
        customerEmail: user.email || "",
        date,
        time,
        hairstyle: selectedStyle?.name || "Not specified",
        status: "pending",
        confirmationNumber: confirmNumber,
        createdAt: Timestamp.now(),
      });

      setConfirmationNumber(confirmNumber);

      const emailStatus = await sendConfirmationEmail(
        user.email || "",
        name,
        date,
        time,
        selectedStyle?.name || "Not specified",
        confirmNumber
      );

      setMessage(
        `✅ Appointment booked! Confirmation #: ${confirmNumber}. ${emailStatus}`
      );
    } catch (error) {
      console.error("Booking error:", error);
      setMessage("❌ Failed to book appointment.");
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = generateTimeSlots();

  return (
    <div
      className="customer-container"
      style={{ maxWidth: "500px", margin: "40px auto", padding: "20px" }}
    >
      <button
        onClick={() => navigate("/customer/gallery")}
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
        <p
          style={{
            textAlign: "center",
            marginBottom: 20,
            fontWeight: 600,
          }}
        >
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
          required
        />

        <input type="email" value={user?.email || ""} disabled />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          style={{ padding: "14px", borderRadius: "10px", border: "1px solid #ccc", fontSize: "1rem", marginBottom: "15px" }}
        />

        <select
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
          style={{
            padding: "14px",
            borderRadius: "10px",
            border: "1px solid #ccc",
            fontSize: "1rem",
            width: "100%",
            marginBottom: "15px",
          }}
        >
          <option value="">Select a time</option>
          {timeSlots.map((slot) => (
            <option key={slot} value={slot} disabled={bookedTimes.includes(slot)}>
              {slot} {bookedTimes.includes(slot) ? " (Booked)" : ""}
            </option>
          ))}
        </select>

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