import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";

interface Appointment {
  id: string;
  name: string;
  email: string;
  date: string;
  time: string;
  service: string;
  status?: "pending" | "confirmed" | "completed";
}

type SortBy = "date" | "name";

export default function AppointmentList() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError("");
        const snapshot = await getDocs(collection(db, "appointments"));
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), status: (doc.data() as any).status || "pending" } as Appointment));
        setAppointments(data);
      } catch (err) {
        setError("Failed to fetch appointments");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handleCancel = async (appointmentId: string) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      try {
        await deleteDoc(doc(db, "appointments", appointmentId));
        setAppointments(appointments.filter(app => app.id !== appointmentId));
        alert("Appointment cancelled successfully!");
      } catch (err) {
        console.error("Failed to cancel appointment:", err);
        setError("Failed to cancel appointment");
      }
    }
  };

  const handleEdit = async (appointmentId: string) => {
    if (!editDate || !editTime) {
      alert("Please fill in date and time");
      return;
    }
    try {
      await updateDoc(doc(db, "appointments", appointmentId), {
        date: editDate,
        time: editTime
      });
      setAppointments(appointments.map(app => 
        app.id === appointmentId ? { ...app, date: editDate, time: editTime } : app
      ));
      setEditingId(null);
      alert("Appointment updated successfully!");
    } catch (err) {
      console.error("Failed to update appointment:", err);
      setError("Failed to update appointment");
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: "pending" | "confirmed" | "completed") => {
    try {
      await updateDoc(doc(db, "appointments", appointmentId), { status: newStatus });
      setAppointments(appointments.map(app => 
        app.id === appointmentId ? { ...app, status: newStatus } : app
      ));
    } catch (err) {
      console.error("Failed to update status:", err);
      setError("Failed to update status");
    }
  };

  const filteredAppointments = appointments
    .filter(app => app.name?.toLowerCase().includes(searchName.toLowerCase()))
    .filter(app => !searchDate || app.date === searchDate)
    .sort((a, b) => {
      if (sortBy === "date") return new Date(a.date).getTime() - new Date(b.date).getTime();
      return (a.name || "").localeCompare(b.name || "");
    });

  if (loading) return <p style={{ textAlign: "center", padding: "20px" }}>Loading appointments...</p>;
  if (error) return <p style={{ color: "red", padding: "20px" }}>{error}</p>;

  if (filteredAppointments.length === 0) return <p style={{ padding: "20px", textAlign: "center" }}>No appointments found.</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Booked Appointments</h2>
      
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search by name..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
        />
        <input
          type="date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
        />
        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
        >
          <option value="date">Sort by Date</option>
          <option value="name">Sort by Name</option>
        </select>
        {(searchName || searchDate) && (
          <button 
            onClick={() => { setSearchName(""); setSearchDate(""); }}
            style={{ padding: "8px 12px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            Clear Filters
          </button>
        )}
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
            <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Name</th>
            <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Email</th>
            <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Date</th>
            <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Time</th>
            <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Service</th>
            <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Status</th>
            <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAppointments.map(app => (
            <tr key={app.id} style={{ borderBottom: "1px solid #dee2e6" }}>
              <td style={{ padding: "12px" }}>{app.name || "N/A"}</td>
              <td style={{ padding: "12px" }}>{app.email || "N/A"}</td>
              <td style={{ padding: "12px" }}>
                {editingId === app.id ? (
                  <input 
                    type="date" 
                    value={editDate} 
                    onChange={(e) => setEditDate(e.target.value)}
                    style={{ padding: "4px", border: "1px solid #ccc" }}
                  />
                ) : app.date || "N/A"}
              </td>
              <td style={{ padding: "12px" }}>
                {editingId === app.id ? (
                  <input 
                    type="time" 
                    value={editTime} 
                    onChange={(e) => setEditTime(e.target.value)}
                    style={{ padding: "4px", border: "1px solid #ccc" }}
                  />
                ) : app.time || "N/A"}
              </td>
              <td style={{ padding: "12px" }}>{app.service || "N/A"}</td>
              <td style={{ padding: "12px" }}>
                <select 
                  value={app.status || "pending"}
                  onChange={(e) => handleStatusChange(app.id, e.target.value as "pending" | "confirmed" | "completed")}
                  style={{ padding: "4px", borderRadius: "4px", border: "1px solid #ccc" }}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                </select>
              </td>
              <td style={{ padding: "12px", display: "flex", gap: "5px" }}>
                {editingId === app.id ? (
                  <>
                    <button 
                      onClick={() => handleEdit(app.id)}
                      style={{ padding: "4px 8px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => setEditingId(null)}
                      style={{ padding: "4px 8px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => { setEditingId(app.id); setEditDate(app.date); setEditTime(app.time); }}
                      style={{ padding: "4px 8px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleCancel(app.id)}
                      style={{ padding: "4px 8px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
