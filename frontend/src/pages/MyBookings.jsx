import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import { formatDateTime } from "../utils";
import { colors, s, statusBadge } from "../theme";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setBookings(await api.myBookings());
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const cancel = async (b) => {
    if (!window.confirm(`Cancel booking for slot ${b.slotNumber}?`)) return;
    try {
      await api.cancelBooking(b.id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={s.page}>
      <h1 style={s.h1}>My bookings</h1>
      <p style={{ ...s.muted, marginBottom: 20 }}>Your upcoming and past reservations.</p>
      {error && <div style={s.error}>{error}</div>}

      <div style={{ ...s.card, padding: 8 }}>
        {loading ? (
          <p style={{ ...s.muted, padding: 12 }}>Loading...</p>
        ) : bookings.length === 0 ? (
          <p style={{ ...s.muted, padding: 12 }}>You have no bookings yet.</p>
        ) : (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Slot</th>
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
                    <td style={s.td}>{b.vehicleNumber}</td>
                    <td style={s.td}>{formatDateTime(b.startTime)}</td>
                    <td style={s.td}>{formatDateTime(b.endTime)}</td>
                    <td style={s.td}><span style={statusBadge(b.status)}>{b.status}</span></td>
                    <td style={{ ...s.td, textAlign: "right" }}>
                      {b.status === "ACTIVE" && (
                        <button style={{ ...s.btn, ...s.btnDanger, ...s.btnSmall }} onClick={() => cancel(b)}>
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
      <p style={{ ...s.muted, marginTop: 12, color: colors.muted }}>
        Cancelled bookings free the slot immediately.
      </p>
    </div>
  );
}
