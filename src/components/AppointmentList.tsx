import { useEffect, useState } from "react";
import { collection, doc, updateDoc, onSnapshot } from "firebase/firestore";
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
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [todayFilter, setTodayFilter] = useState(false);

  const formatDateWithDay = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return `${dateString} (${dayNames[date.getDay()]})`;
    } catch {
      return dateString;
    }
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "appointments"),
      snapshot => {
        setLoading(true);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as any),
          status: (doc.data() as any).status || "pending",
        })) as Appointment[];
        setAppointments(data);
        setLoading(false);
      },
      err => {
        console.error(err);
        setError("Failed to fetch appointments");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleCancel = async (id: string) => {
    const appointment = appointments.find(a => a.id === id);
    if (!appointment) return;
    const confirmed = window.confirm(
      `Are you sure you want to cancel the appointment for ${appointment.customerName} on ${appointment.date} at ${appointment.time}?`
    );
    if (!confirmed) return;
    try {
      await updateDoc(doc(db, "appointments", id), { status: "cancelled" });
      setAppointments(prev =>
        prev.map(a => (a.id === id ? { ...a, status: "cancelled" } : a))
      );
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      setError("Failed to cancel appointment. Please try again.");
    }
  };

  const handleEdit = async (id: string) => {
    if (!editDate || !editTime) {
      alert("Please fill in both date and time");
      return;
    }
    try {
      await updateDoc(doc(db, "appointments", id), { date: editDate, time: editTime });
      setAppointments(prev =>
        prev.map(a => (a.id === id ? { ...a, date: editDate, time: editTime } : a))
      );
      setEditingId(null);
    } catch (error) {
      console.error("Error updating appointment:", error);
      setError("Failed to update appointment. Please try again.");
    }
  };

  const handleStatusChange = async (id: string, status: Appointment["status"]) => {
    try {
      await updateDoc(doc(db, "appointments", id), { status });
      setAppointments(prev =>
        prev.map(a => (a.id === id ? { ...a, status } : a))
      );
    } catch (error) {
      console.error("Error updating status:", error);
      setError("Failed to update appointment status. Please try again.");
    }
  };

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  };

  const getStatusPriority = (status: string) => {
    switch (status) {
      case "pending": return 0;
      case "confirmed": return 1;
      case "completed": return 2;
      case "cancelled": return 3;
      default: return 4;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'confirmed': return '#28a745';
      case 'completed': return '#6c757d';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusStyle = (status: string): React.CSSProperties => ({
    backgroundColor: getStatusColor(status),
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  });

  const filtered = appointments
    .filter(a => a.customerName.toLowerCase().includes(searchName.toLowerCase()))
    .filter(a => !searchDate || a.date === searchDate)
    .filter(a => !statusFilter || a.status === statusFilter)
    .filter(a => {
      if (!todayFilter) return true;
      const today = new Date().toISOString().split("T")[0];
      return a.date === today;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.customerName.localeCompare(b.customerName);
      const statusDiff = getStatusPriority(a.status || "pending") - getStatusPriority(b.status || "pending");
      if (statusDiff !== 0) return statusDiff;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  if (loading) return <p style={{ textAlign: "center", padding: "20px" }}>Loading appointments...</p>;
  if (error) return <p style={{ textAlign: "center", padding: "20px", color: "red" }}>{error}</p>;
  if (!filtered.length) return <p style={{ textAlign: "center", padding: "20px" }}>No appointments found</p>;

  return (
    <div style={{ padding: "15px", maxWidth: "1200px", margin: "0 auto" }}>
      <h2 style={{ textAlign: "center" }}>Booked Appointments</h2>

      {/* Statistics */}
      <div style={{
        display: "flex",
        justifyContent: "space-around",
        marginBottom: "20px",
        flexWrap: "wrap",
        gap: "10px"
      }}>
        <div style={{ ...statCard, cursor: 'pointer', opacity: statusFilter === null ? 1 : 0.7 }} onClick={() => setStatusFilter(null)}>
          <div style={statNumber}>{stats.total}</div>
          <div style={statLabel}>Total</div>
        </div>
        <div style={{ ...statCard, cursor: 'pointer', opacity: statusFilter === 'pending' ? 1 : 0.7 }} onClick={() => setStatusFilter(statusFilter === 'pending' ? null : 'pending')}>
          <div style={{ ...statNumber, color: '#ffc107' }}>{stats.pending}</div>
          <div style={statLabel}>Pending</div>
        </div>
        <div style={{ ...statCard, cursor: 'pointer', opacity: statusFilter === 'confirmed' ? 1 : 0.7 }} onClick={() => setStatusFilter(statusFilter === 'confirmed' ? null : 'confirmed')}>
          <div style={{ ...statNumber, color: '#28a745' }}>{stats.confirmed}</div>
          <div style={statLabel}>Confirmed</div>
        </div>
        <div style={{ ...statCard, cursor: 'pointer', opacity: statusFilter === 'completed' ? 1 : 0.7 }} onClick={() => setStatusFilter(statusFilter === 'completed' ? null : 'completed')}>
          <div style={{ ...statNumber, color: '#6c757d' }}>{stats.completed}</div>
          <div style={statLabel}>Completed</div>
        </div>
        <div style={{ ...statCard, cursor: 'pointer', opacity: statusFilter === 'cancelled' ? 1 : 0.7 }} onClick={() => setStatusFilter(statusFilter === 'cancelled' ? null : 'cancelled')}>
          <div style={{ ...statNumber, color: '#dc3545' }}>{stats.cancelled}</div>
          <div style={statLabel}>Cancelled</div>
        </div>
      </div>

      {/* Filters + Today's Appointments (now horizontal) */}
      <div style={{
        display: "flex",
        justifyContent: "flex-start",
        gap: "10px",
        flexWrap: "wrap",
        marginBottom: "20px"
      }}>
        <input type="text" placeholder="Search name" value={searchName} onChange={e => setSearchName(e.target.value)} style={{ ...input, flex: "1 1 150px" }} />
        <input type="date" value={searchDate} onChange={e => setSearchDate(e.target.value)} style={{ ...input, flex: "1 1 150px" }} />
        <select value={sortBy} onChange={e => setSortBy(e.target.value as SortBy)} style={{ ...input, flex: "1 1 150px" }}>
          <option value="date">Sort by Status & Date</option>
          <option value="name">Sort by Name</option>
        </select>
        <button style={{
          ...primaryBtn,
          backgroundColor: todayFilter ? "#28a745" : "#007bff",
          flex: "1 1 150px"
        }} onClick={() => setTodayFilter(prev => !prev)}>
          {todayFilter ? "Showing Today" : "Today's Appointments"}
        </button>
      </div>

      {/* Appointment Cards */}
      <div style={cardGrid}>
        {filtered.map(app => (
          <div key={app.id} style={card}>
            <h3 style={{ margin: "0 0 5px" }}>{app.customerName}</h3>
            <p style={small}>{app.customerEmail}</p>
            {editingId === app.id ? (
              <>
                <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} style={input} />
                <input type="time" value={editTime} onChange={e => setEditTime(e.target.value)} style={input} />
              </>
            ) : (
              <>
                <p><b>Date:</b> {formatDateWithDay(app.date)}</p>
                <p><b>Time:</b> {app.time}</p>
              </>
            )}
            <p><b>Service:</b> {app.hairstyle}</p>
            <span style={getStatusStyle(app.status || 'pending')}>{app.status || 'pending'}</span>
            <select value={app.status} onChange={e => handleStatusChange(app.id, e.target.value as any)} style={input}>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <div style={actions}>
              {editingId === app.id ? (
                <>
                  <button style={saveBtn} onClick={() => handleEdit(app.id)}>Save</button>
                  <button style={secondaryBtn} onClick={() => setEditingId(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <button style={primaryBtn} onClick={() => { setEditingId(app.id); setEditDate(app.date); setEditTime(app.time); }}>Edit</button>
                  <button style={dangerBtn} onClick={() => handleCancel(app.id)}>Cancel</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= Styles ================= */

const statCard: React.CSSProperties = {
  backgroundColor: "#f8f9fa",
  border: "1px solid #dee2e6",
  borderRadius: "8px",
  padding: "15px",
  textAlign: "center",
  minWidth: "100px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
};

const statNumber: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#333",
};

const statLabel: React.CSSProperties = {
  fontSize: "14px",
  color: "#666",
  marginTop: "5px",
};

const input: React.CSSProperties = {
  padding: "8px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  width: "100%",
};

const cardGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "15px",
};

const card: React.CSSProperties = {
  background: "#fff",
  padding: "15px",
  borderRadius: "10px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};

const actions: React.CSSProperties = {
  display: "flex",
  gap: "8px",
  marginTop: "10px",
  flexWrap: "wrap",
};

const primaryBtn: React.CSSProperties = {
  padding: "6px 10px",
  background: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const saveBtn: React.CSSProperties = {
  ...primaryBtn,
  background: "#28a745",
};

const secondaryBtn: React.CSSProperties = {
  ...primaryBtn,
  background: "#6c757d",
};

const dangerBtn: React.CSSProperties = {
  ...primaryBtn,
  background: "#dc3545",
};

const small: React.CSSProperties = {
  fontSize: "12px",
  color: "#666",
};