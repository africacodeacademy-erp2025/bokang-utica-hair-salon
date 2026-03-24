// src/pages/BookingHistory.tsx

import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase/config";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../styles/CustomerPages.css";

export interface Review {
  rating: number;
  text: string;
  createdAt: string;
}

export interface CustomerAppointment {
  id: string;
  customerName: string;
  customerEmail: string;
  date: string;
  time: string;
  hairstyle: string;
  status?: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt?: any;
  review?: Review;
}

export default function BookingHistory() {

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const [appointments, setAppointments] = useState<CustomerAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, async (user) => {

      if (!user) {
        setAppointments([]);
        setLoading(false);
        return;
      }

      try {

        const q = query(
          collection(db, "appointments"),
          where("customerEmail", "==", user.email)
        );

        const snapshot = await getDocs(q);

        const data: CustomerAppointment[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<CustomerAppointment, "id">)
        }));

        setAppointments(data);

      } catch (err) {

        console.error(err);
        setError("Failed to load bookings.");

      }

      setLoading(false);

    });

    return () => unsubscribe();

  }, []);

  const cancelBooking = async (id: string) => {

    if (!window.confirm("Cancel this booking?")) return;

    try {

      await updateDoc(doc(db, "appointments", id), {
        status: "cancelled"
      });

      setAppointments(prev =>
        prev.map(a =>
          a.id === id ? { ...a, status: "cancelled" } : a
        )
      );

    } catch {
      alert("Failed to cancel booking.");
    }

  };

  const addReview = async (id: string, rating: number, text: string) => {

    const review = {
      rating,
      text,
      createdAt: new Date().toISOString()
    };

    try {

      await updateDoc(doc(db, "appointments", id), { review });

      setAppointments(prev =>
        prev.map(a =>
          a.id === id ? { ...a, review } : a
        )
      );

    } catch {

      alert("Failed to submit review.");

    }

  };

  const now = new Date();

  const appointmentDateTime = (a: CustomerAppointment) => {
    try {
      const datePart = a.date;
      const timePart = a.time;
      if (!datePart || !timePart) return new Date(a.date);
      return new Date(`${datePart}T${timePart}`);
    } catch {
      return new Date(a.date);
    }
  };

  const upcoming = appointments
    .filter((a) => {
      const appointmentTime = appointmentDateTime(a);
      return (
        appointmentTime >= now &&
        a.status !== "cancelled" &&
        a.status !== "completed"
      );
    })
    .sort((a, b) => appointmentDateTime(a).getTime() - appointmentDateTime(b).getTime());

  const past = appointments
    .filter((a) => {
      const appointmentTime = appointmentDateTime(a);
      return (
        appointmentTime < now ||
        a.status === "completed" ||
        a.status === "cancelled"
      );
    })
    .sort((a, b) => appointmentDateTime(b).getTime() - appointmentDateTime(a).getTime());

  const getStatusColor = (status?: string) => {

    switch (status) {

      case "confirmed":
        return "#28a745";

      case "completed":
        return "#6c757d";

      case "cancelled":
        return "#dc3545";

      default:
        return "#ffc107";

    }

  };

  const getStatusLabel = (status?: string) => {

    return status
      ? status.charAt(0).toUpperCase() + status.slice(1)
      : "Pending";

  };

  return (

    <div className="customer-container">

      <button
        onClick={() => navigate("/customer")}
        style={{
          marginBottom: "20px",
          padding: "10px 20px",
          backgroundColor: "#6c757d",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "14px"
        }}
      >
        ← Back
      </button>

      <h1>Your Bookings</h1>

      <div style={{ display: "flex", gap: "10px", marginBottom: "18px" }}>
        <button
          onClick={() => setActiveTab('upcoming')}
          style={{
            padding: "8px 16px",
            border: "1px solid #ccc",
            borderRadius: "20px",
            background: activeTab === 'upcoming' ? "linear-gradient(90deg, #d63384, #b82a6f)" : "#fff",
            color: activeTab === 'upcoming' ? "#fff" : "#333",
            cursor: "pointer",
            minWidth: "120px"
          }}
        >
          Upcoming ({upcoming.length})
        </button>

        <button
          onClick={() => setActiveTab('past')}
          style={{
            padding: "8px 16px",
            border: "1px solid #ccc",
            borderRadius: "20px",
            background: activeTab === 'past' ? "linear-gradient(90deg, #d63384, #b82a6f)" : "#fff",
            color: activeTab === 'past' ? "#fff" : "#333",
            cursor: "pointer",
            minWidth: "120px"
          }}
        >
          Past ({past.length})
        </button>
      </div>

      {loading && (
        <p style={{ textAlign: "center", color: "#6c757d" }}>
          Loading bookings...
        </p>
      )}

      {error && (
        <p style={{ textAlign: "center", color: "red" }}>
          {error}
        </p>
      )}

      {!loading && appointments.length === 0 && (
        <p style={{ textAlign: "center", color: "#6c757d" }}>
          No bookings found.
        </p>
      )}

      {activeTab === 'upcoming' && upcoming.length > 0 && (
        <>
          <h2 style={{ marginTop: "30px", marginBottom: "15px" }}>
            Upcoming Bookings
          </h2>

          {upcoming.map((apt) => (

            <div
              key={apt.id}
              style={{
                border: "1px solid #dee2e6",
                borderRadius: "8px",
                padding: "20px",
                marginBottom: "15px",
                backgroundColor: "#f8f9fa"
              }}
            >

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>

                <div>

                  <h3>{apt.hairstyle}</h3>

                  <p style={{ color: "#6c757d", fontSize: "14px" }}>
                    {apt.date} at {apt.time}
                  </p>

                </div>

                <div
                  style={{
                    backgroundColor: getStatusColor(apt.status),
                    color: "white",
                    padding: "5px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "bold"
                  }}
                >
                  {getStatusLabel(apt.status)}
                </div>

              </div>

              <div style={{ borderTop: "1px solid #dee2e6", paddingTop: "15px" }}>

                <p><strong>Name:</strong> {apt.customerName}</p>
                <p><strong>Email:</strong> {apt.customerEmail}</p>

                {apt.status !== "cancelled" && (

                  <button
                    style={{
                      marginTop: "10px",
                      padding: "5px 12px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px"
                    }}
                    onClick={() => cancelBooking(apt.id)}
                  >
                    Cancel Booking
                  </button>

                )}

              </div>

            </div>

          ))}

        </>
      )}

      {past.length > 0 && (

        <>
          <h2 style={{ marginTop: "30px", marginBottom: "15px" }}>
            Past Bookings
          </h2>

          {past.map((apt) => (

            <div
              key={apt.id}
              style={{
                border: "1px solid #dee2e6",
                borderRadius: "8px",
                padding: "20px",
                marginBottom: "15px",
                backgroundColor: "#f1f3f5"
              }}
            >

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>

                <div>

                  <h3>{apt.hairstyle}</h3>

                  <p style={{ color: "#6c757d", fontSize: "14px" }}>
                    {apt.date} at {apt.time}
                  </p>

                </div>

                <div
                  style={{
                    backgroundColor: getStatusColor(apt.status),
                    color: "white",
                    padding: "5px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "bold"
                  }}
                >
                  {getStatusLabel(apt.status)}
                </div>

              </div>

              <div style={{ borderTop: "1px solid #dee2e6", paddingTop: "15px" }}>

                <p><strong>Name:</strong> {apt.customerName}</p>
                <p><strong>Email:</strong> {apt.customerEmail}</p>

                {apt.status === "completed" && !apt.review && (
                  <ReviewForm
                    appointmentId={apt.id}
                    addReview={addReview}
                  />
                )}

                {apt.review && (

                  <div style={{
                    marginTop: "10px",
                    backgroundColor: "#e9ecef",
                    padding: "10px",
                    borderRadius: "6px"
                  }}>
                    <strong>Rating:</strong> {apt.review.rating}/5
                    <p>{apt.review.text}</p>
                  </div>

                )}

              </div>

            </div>

          ))}

        </>
      )}

    </div>
  );

}

function ReviewForm({ appointmentId, addReview }: any) {

  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");

  return (

    <form
      onSubmit={(e) => {

        e.preventDefault();
        addReview(appointmentId, rating, text);

      }}
    >

      <select
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
      >
        {[5,4,3,2,1].map(r => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Leave your review"
        required
      />

      <button type="submit">
        Submit Review
      </button>

    </form>

  );

}