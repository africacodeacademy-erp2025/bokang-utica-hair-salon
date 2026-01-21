import { useState } from "react";
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import "../styles/CustomerPages.css";

interface CustomerAppointment {
  id: string;
  customerName: string;
  customerEmail: string;
  date: string;
  time: string;
  hairstyle: string;
  status?: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt?: any;
}

export default function BookingHistory() {
  const navigate = useNavigate();

  const [customerEmail, setCustomerEmail] = useState("");
  const [appointments, setAppointments] = useState<CustomerAppointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  // Search bookings by email
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerEmail.trim()) {
      setError("Please enter your email");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const q = query(
        collection(db, "appointments"),
        where("customerEmail", "==", customerEmail.trim().toLowerCase())
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as CustomerAppointment)
      );

      // Sort descending by date
      setAppointments(
        data.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      );

      setSearched(true);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError("Failed to fetch your bookings");
    } finally {
      setLoading(false);
    }
  };

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

  // Helper for status badge colors
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
    return status ? status.charAt(0).toUpperCase() + status.slice(1) : "Pending";
  };

  // Split upcoming vs past bookings
  const today = new Date();
  const upcomingAppointments = appointments.filter(
    (apt) => new Date(apt.date) >= today && apt.status !== "cancelled"
  );
  const pastAppointments = appointments.filter(
    (apt) => new Date(apt.date) < today || apt.status === "completed" || apt.status === "cancelled"
  );

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
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

      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
        Your Bookings
      </h1>

      <form
        onSubmit={handleSearch}
        style={{ marginBottom: "30px", display: "flex", gap: "10px" }}
      >
        <input
          type="email"
          placeholder="Enter your email"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          style={{
            flex: 1,
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "default" : "pointer",
          }}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && (
        <p
          style={{
            color: "red",
            textAlign: "center",
            padding: "10px",
            backgroundColor: "#f8d7da",
            borderRadius: "4px",
          }}
        >
          {error}
        </p>
      )}

      {searched && appointments.length === 0 && (
        <p style={{ textAlign: "center", color: "#6c757d" }}>
          No bookings found for this email.
        </p>
      )}

      {appointments.length > 0 && (
        <div>
          {/* Upcoming Bookings */}
          {upcomingAppointments.length > 0 && (
            <>
              <h2 style={{ marginBottom: "15px" }}>Upcoming Bookings</h2>
              {upcomingAppointments.map((apt) => (
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
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                      marginBottom: "15px",
                    }}
                  >
                    <div>
                      <h3 style={{ margin: "0 0 5px 0" }}>{apt.hairstyle}</h3>
                      <p style={{ margin: "0", color: "#6c757d", fontSize: "14px" }}>
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
                    <p style={{ margin: "5px 0" }}>
                      <strong>Name:</strong> {apt.customerName}
                    </p>
                    <p style={{ margin: "5px 0" }}>
                      <strong>Email:</strong> {apt.customerEmail}
                    </p>
                    {/* Cancel button */}
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
              <h2 style={{ marginBottom: "15px", marginTop: "30px" }}>Past Bookings</h2>
              {pastAppointments.map((apt) => (
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
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                      marginBottom: "15px",
                    }}
                  >
                    <div>
                      <h3 style={{ margin: "0 0 5px 0" }}>{apt.hairstyle}</h3>
                      <p style={{ margin: "0", color: "#6c757d", fontSize: "14px" }}>
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
                    <p style={{ margin: "5px 0" }}>
                      <strong>Name:</strong> {apt.customerName}
                    </p>
                    <p style={{ margin: "5px 0" }}>
                      <strong>Email:</strong> {apt.customerEmail}
                    </p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
