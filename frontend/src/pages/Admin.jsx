import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import { formatDateTime } from "../utils";
import { badge, colors, s, statusBadge } from "../theme";

function Stat({ label, value, color }) {
  return (
    <div style={{ ...s.card, flex: "1 1 150px", padding: 16 }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: color || colors.text }}>{value}</div>
      <div style={{ fontSize: 13, color: colors.muted }}>{label}</div>
    </div>
  );
}

export default function Admin() {
  const [tab, setTab] = useState("slots");
  const [stats, setStats] = useState(null);
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [newSlot, setNewSlot] = useState({ slotNumber: "", zone: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try {
      const [st, sl, bk] = await Promise.all([api.adminStats(), api.slots(), api.adminBookings()]);
      setStats(st);
      setSlots(sl);
      setBookings(bk);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // run an action, then refresh everything
  const run = async (fn, successMessage) => {
    setError("");
    setMessage("");
    try {
      await fn();
      if (successMessage) setMessage(successMessage);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const addSlot = (e) => {
    e.preventDefault();
    run(async () => {
      await api.addSlot(newSlot.slotNumber, newSlot.zone);
      setNewSlot({ slotNumber: "", zone: newSlot.zone });
    }, "Slot added.");
  };

  const tabBtn = (key, text) => (
    <button
      onClick={() => setTab(key)}
      style={{
        ...s.btn,
        ...(tab === key ? s.btnPrimary : s.btnGhost),
      }}
    >
      {text}
    </button>
  );

  return (
    <div style={s.page}>
      <h1 style={s.h1}>Admin dashboard</h1>
      <p style={{ ...s.muted, marginBottom: 20 }}>Manage parking slots and every booking on campus.</p>

      {error && <div style={s.error}>{error}</div>}
      {message && <div style={s.success}>{message}</div>}

      {stats && (
        <div style={{ ...s.row, marginBottom: 20 }}>
          <Stat label="Total slots" value={stats.totalSlots} />
          <Stat label="Open for booking" value={stats.activeSlots} />
          <Stat label="Occupied right now" value={stats.occupiedNow} color={colors.red} />
          <Stat label="Current + upcoming bookings" value={stats.activeBookings} color={colors.primary} />
          <Stat label="Registered users" value={stats.totalUsers} />
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        {tabBtn("slots", "Slots")}
        {tabBtn("bookings", "All bookings")}
      </div>

      {tab === "slots" && (
        <div style={s.card}>
          <h2 style={s.h2}>Add a slot</h2>
          <form onSubmit={addSlot} style={{ ...s.row, alignItems: "flex-end", marginBottom: 24 }}>
            <div style={{ flex: "1 1 160px" }}>
              <label style={s.label}>Slot number</label>
              <input
                style={s.input}
                placeholder="e.g. D-01"
                required
                value={newSlot.slotNumber}
                onChange={(e) => setNewSlot({ ...newSlot, slotNumber: e.target.value })}
              />
            </div>
            <div style={{ flex: "1 1 160px" }}>
              <label style={s.label}>Zone</label>
              <input
                style={s.input}
                placeholder="e.g. D"
                required
                value={newSlot.zone}
                onChange={(e) => setNewSlot({ ...newSlot, zone: e.target.value })}
              />
            </div>
            <button style={{ ...s.btn, ...s.btnPrimary }}>Add slot</button>
          </form>

          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Slot</th>
                  <th style={s.th}>Zone</th>
                  <th style={s.th}>State</th>
                  <th style={s.th}></th>
                </tr>
              </thead>
              <tbody>
                {slots.map((sl) => (
                  <tr key={sl.id}>
                    <td style={{ ...s.td, fontWeight: 700 }}>{sl.slotNumber}</td>
                    <td style={s.td}>{sl.zone}</td>
                    <td style={s.td}>
                      {!sl.active ? (
                        <span style={badge(colors.gray, colors.grayBg)}>Closed</span>
                      ) : sl.occupied ? (
                        <span style={badge(colors.red, colors.redBg)}>Occupied</span>
                      ) : (
                        <span style={badge(colors.green, colors.greenBg)}>Available</span>
                      )}
                    </td>
                    <td style={{ ...s.td, textAlign: "right", whiteSpace: "nowrap" }}>
                      <button
                        style={{ ...s.btn, ...s.btnGhost, ...s.btnSmall, marginRight: 8 }}
                        onClick={() => run(() => api.toggleSlot(sl.id))}
                      >
                        {sl.active ? "Close slot" : "Reopen"}
                      </button>
                      <button
                        style={{ ...s.btn, ...s.btnDanger, ...s.btnSmall }}
                        onClick={() => {
                          if (window.confirm(`Delete slot ${sl.slotNumber}?`)) {
                            run(() => api.deleteSlot(sl.id), "Slot deleted.");
                          }
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "bookings" && (
        <div style={{ ...s.card, padding: 8 }}>
          {bookings.length === 0 ? (
            <p style={{ ...s.muted, padding: 12 }}>No bookings yet.</p>
          ) : (
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Slot</th>
                    <th style={s.th}>User</th>
                    <th style={s.th}>Vehicle</th>
                    <th style={s.th}>From</th>
                    <th style={s.th}>Until</th>
                    <th style={s.th}>Status</th>
                    <th style={s.th}></th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id}>
                      <td style={{ ...s.td, fontWeight: 700 }}>{b.slotNumber}</td>
                      <td style={s.td}>
                        {b.userName}
                        <div style={{ fontSize: 12, color: colors.muted }}>{b.userEmail}</div>
                      </td>
                      <td style={s.td}>{b.vehicleNumber}</td>
                      <td style={s.td}>{formatDateTime(b.startTime)}</td>
                      <td style={s.td}>{formatDateTime(b.endTime)}</td>
                      <td style={s.td}><span style={statusBadge(b.status)}>{b.status}</span></td>
                      <td style={{ ...s.td, textAlign: "right" }}>
                        {b.status === "ACTIVE" && (
                          <button
                            style={{ ...s.btn, ...s.btnDanger, ...s.btnSmall }}
                            onClick={() => {
                              if (window.confirm(`Cancel booking for slot ${b.slotNumber}?`)) {
                                run(() => api.cancelBooking(b.id), "Booking cancelled.");
                              }
                            }}
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
