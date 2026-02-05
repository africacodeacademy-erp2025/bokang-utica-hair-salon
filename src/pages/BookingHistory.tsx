// src/pages/BookingHistory.tsx
import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase/config";
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
  const [appointments, setAppointments] = useState<CustomerAppointment[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch bookings for logged-in user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const q = query(
            collection(db, "appointments"),
            where("customerEmail", "==", user.email)
          );
          const querySnapshot = await getDocs(q);
          const appts: CustomerAppointment[] = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...(doc.data() as Omit<CustomerAppointment, "id">),
          }));
          setAppointments(appts);
        } catch (err) {
          console.error("Error fetching bookings:", err);
          setError("Failed to load bookings. Please try again.");
        }
      } else {
        setAppointments([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Cancel booking
  const handleCancelBooking = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      await updateDoc(doc(db, "appointments", id), { status: "cancelled" });
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === id ? { ...apt, status: "cancelled" } : apt
        )
      );
      alert("Booking cancelled successfully!");
    } catch (err) {
      console.error("Error cancelling booking:", err);
      alert("Failed to cancel booking. Please try again.");
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "confirmed":
        return "#28a745";
      case "completed":
        return "#6c757d";
      case "cancelled":
        return "#dc3545";
      default:
        return "#ffc107"; // pending
    }
  };

  const getStatusLabel = (status?: string) => {
    return status ? status.charAt(0).toUpperCase() + status.slice(1) : "Pending";
  };

  const today = new Date();
  const upcomingAppointments = appointments.filter(
    (apt: CustomerAppointment) => new Date(apt.date) >= today && apt.status !== "cancelled"
  );
  const pastAppointments = appointments.filter(
    (apt: CustomerAppointment) => new Date(apt.date) < today || apt.status === "completed" || apt.status === "cancelled"
  );

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
          fontSize: "14px",
        }}
      >
        ← Back
      </button>

      <h1>Your Bookings</h1>

      {loading && <p style={{ textAlign: "center", color: "#6c757d" }}>Loading bookings...</p>}
      {error && <p style={{ textAlign: "center", color: "red" }}>{error}</p>}
      {!loading && appointments.length === 0 && (
        <p style={{ textAlign: "center", color: "#6c757d" }}>No bookings found.</p>
      )}

      {/* Upcoming Bookings */}
      {upcomingAppointments.length > 0 && (
        <>
          <h2 style={{ marginTop: "30px", marginBottom: "15px" }}>Upcoming Bookings</h2>
          {upcomingAppointments.map((apt: CustomerAppointment) => (
            <div
              key={apt.id}
              style={{
                border: "1px solid #dee2e6",
                borderRadius: "8px",
                padding: "20px",
                marginBottom: "15px",
                backgroundColor: "#f8f9fa",
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
                    fontWeight: "bold",
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
                      fontSize: "12px",
                    }}
                    onClick={() => handleCancelBooking(apt.id)}
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          ))}
        </>
      )}

      {/* Past / Completed / Cancelled Bookings */}
      {pastAppointments.length > 0 && (
        <>
          <h2 style={{ marginTop: "30px", marginBottom: "15px" }}>Past Bookings</h2>
          {pastAppointments.map((apt: CustomerAppointment) => (
            <div
              key={apt.id}
              style={{
                border: "1px solid #dee2e6",
                borderRadius: "8px",
                padding: "20px",
                marginBottom: "15px",
                backgroundColor: "#f1f3f5",
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
                    fontWeight: "bold",
                  }}
                >
                  {getStatusLabel(apt.status)}
                </div>
              </div>

              <div style={{ borderTop: "1px solid #dee2e6", paddingTop: "15px" }}>
                <p><strong>Name:</strong> {apt.customerName}</p>
                <p><strong>Email:</strong> {apt.customerEmail}</p>
                {apt.status === "completed" && (
                  <ReviewSection appointment={apt} appointmentId={apt.id} refresh={() => window.location.reload()} />
                )}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ReviewSection Component
function ReviewSection({ appointment, appointmentId, refresh }: { appointment: CustomerAppointment, appointmentId: string, refresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (appointment.review) {
    return (
      <div style={{ marginTop: "10px", background: "#e9ecef", borderRadius: "6px", padding: "12px" }}>
        <strong>Your Review:</strong>
        <div style={{ marginTop: "6px" }}>
          <span style={{ color: "#f59f00", fontWeight: 600 }}>Rating: {appointment.review.rating} / 5</span>
        </div>
        <div style={{ marginTop: "6px" }}>{appointment.review.text}</div>
        <div style={{ fontSize: "12px", color: "#868e96", marginTop: "4px" }}>
          Reviewed on {new Date(appointment.review.createdAt).toLocaleDateString()}
        </div>
      </div>
    );
  }

  if (!showForm) {
    return (
      <button
        style={{ marginTop: "10px", backgroundColor: "#d63384", color: "white", border: "none", borderRadius: "4px", padding: "8px 20px", fontWeight: 600, cursor: "pointer" }}
        onClick={() => setShowForm(true)}
      >
        Leave Review
      </button>
    );
  }

  return (
    <form
      style={{ marginTop: "10px", background: "#fff0f6", borderRadius: "6px", padding: "12px" }}
      onSubmit={async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        try {
          await updateDoc(doc(db, "appointments", appointmentId), {
            review: {
              rating,
              text,
              createdAt: new Date().toISOString(),
            },
          });
          refresh();
        } catch (err) {
          setError("Failed to submit review. Please try again.");
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <div style={{ marginBottom: "8px" }}>
        <label style={{ fontWeight: 500, marginRight: "8px" }}>Rating:</label>
        <select value={rating} onChange={e => setRating(Number(e.target.value))} disabled={submitting}>
          {[5,4,3,2,1].map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>
      <div style={{ marginBottom: "8px" }}>
        <label style={{ fontWeight: 500, marginRight: "8px" }}>Review:</label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={3}
          style={{ width: "100%", borderRadius: "4px", border: "1px solid #dee2e6", padding: "6px" }}
          disabled={submitting}
          required
        />
      </div>
      {error && <div style={{ color: "#d63384", marginBottom: "8px" }}>{error}</div>}
      <button
        type="submit"
        style={{ backgroundColor: "#d63384", color: "white", border: "none", borderRadius: "4px", padding: "8px 20px", fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer" }}
        disabled={submitting}
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
