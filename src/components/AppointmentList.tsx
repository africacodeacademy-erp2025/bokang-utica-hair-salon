import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/config";

interface Appointment {
  id: string;
  customerName: string;
  customerEmail: string;
  date: string;
  time: string;
  hairstyle: string;
  status?: "pending" | "confirmed" | "completed" | "cancelled";
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

  // Fetch all appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const snapshot = await getDocs(collection(db, "appointments"));
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          customerName: (doc.data() as any).customerName,
          customerEmail: (doc.data() as any).customerEmail,
          hairstyle: (doc.data() as any).hairstyle,
          date: (doc.data() as any).date,
          time: (doc.data() as any).time,
          status: (doc.data() as any).status || "pending",
        })) as Appointment[];
        setAppointments(data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch appointments");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handleCancel = async (appointmentId: string) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await updateDoc(doc(db, "appointments", appointmentId), { status: "cancelled" });
      setAppointments(prev => prev.map(app => app.id === appointmentId ? { ...app, status: "cancelled" } : app));
    } catch (err) {
      console.error(err);
      setError("Failed to cancel appointment");
    }
  };

  const handleEdit = async (appointmentId: string) => {
    if (!editDate || !editTime) {
      alert("Please fill in date and time");
      return;
    }
    try {
      await updateDoc(doc(db, "appointments", appointmentId), { date: editDate, time: editTime });
      setAppointments(prev => prev.map(app => app.id === appointmentId ? { ...app, date: editDate, time: editTime } : app));
      setEditingId(null);
    } catch (err) {
      console.error(err);
      setError("Failed to update appointment");
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: "pending" | "confirmed" | "completed" | "cancelled") => {
    try {
      await updateDoc(doc(db, "appointments", appointmentId), { status: newStatus });
      setAppointments(prev => prev.map(app => app.id === appointmentId ? { ...app, status: newStatus } : app));
    } catch (err) {
      console.error(err);
      setError("Failed to update status");
    }
  };

  const filteredAppointments = appointments
    .filter(app => app.customerName.toLowerCase().includes(searchName.toLowerCase()))
    .filter(app => !searchDate || app.date === searchDate)
    .sort((a, b) => {
      if (sortBy === "date") return new Date(a.date).getTime() - new Date(b.date).getTime();
      return a.customerName.localeCompare(b.customerName);
    });

  if (loading) return <p style={{ textAlign: "center", padding: "20px" }}>Loading appointments...</p>;
  if (error) return <p style={{ color: "red", padding: "20px" }}>{error}</p>;
  if (filteredAppointments.length === 0) return <p style={{ textAlign: "center", padding: "20px" }}>No appointments found.</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Booked Appointments</h2>

      <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search by name..."
          value={searchName}
          onChange={e => setSearchName(e.target.value)}
          style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
        />
        <input
          type="date"
          value={searchDate}
          onChange={e => setSearchDate(e.target.value)}
          style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
        />
        <select value={sortBy} onChange={e => setSortBy(e.target.value as SortBy)} style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}>
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
            <th style={{ padding: "12px", textAlign: "left" }}>Name</th>
            <th style={{ padding: "12px", textAlign: "left" }}>Email</th>
            <th style={{ padding: "12px", textAlign: "left" }}>Date</th>
            <th style={{ padding: "12px", textAlign: "left" }}>Time</th>
            <th style={{ padding: "12px", textAlign: "left" }}>Service</th>
            <th style={{ padding: "12px", textAlign: "left" }}>Status</th>
            <th style={{ padding: "12px", textAlign: "left" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAppointments.map(app => (
            <tr key={app.id} style={{ borderBottom: "1px solid #dee2e6" }}>
              <td style={{ padding: "12px" }}>{app.customerName}</td>
              <td style={{ padding: "12px" }}>{app.customerEmail}</td>
              <td style={{ padding: "12px" }}>
                {editingId === app.id ? (
                  <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} style={{ padding: "4px", border: "1px solid #ccc" }} />
                ) : app.date}
              </td>
              <td style={{ padding: "12px" }}>
                {editingId === app.id ? (
                  <input type="time" value={editTime} onChange={e => setEditTime(e.target.value)} style={{ padding: "4px", border: "1px solid #ccc" }} />
                ) : app.time}
              </td>
              <td style={{ padding: "12px" }}>{app.hairstyle}</td>
              <td style={{ padding: "12px" }}>
                <select 
                  value={app.status || "pending"} 
                  onChange={e => handleStatusChange(app.id, e.target.value as any)}
                  style={{ padding: "4px", borderRadius: "4px", border: "1px solid #ccc" }}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </td>
              <td style={{ padding: "12px", display: "flex", gap: "5px" }}>
                {editingId === app.id ? (
                  <>
                    <button onClick={() => handleEdit(app.id)} style={{ padding: "4px 8px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>Save</button>
                    <button onClick={() => setEditingId(null)} style={{ padding: "4px 8px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setEditingId(app.id); setEditDate(app.date); setEditTime(app.time); }} style={{ padding: "4px 8px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>Edit</button>
                    <button onClick={() => handleCancel(app.id)} style={{ padding: "4px 8px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>Cancel</button>
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
