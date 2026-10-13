import { useState } from "react";
import { api } from "../api";
import { toIso } from "../utils";
import { colors, s } from "../theme";

export default function BookingPanel({ slot, start, end, onDone, onClose }) {
  const [vehicle, setVehicle] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.createBooking({
        slotId: slot.id,
        vehicleNumber: vehicle,
        startTime: toIso(start),
        endTime: toIso(end),
      });
      onDone(`Slot ${slot.slotNumber} booked for ${vehicle.toUpperCase()}.`);
    } catch (err) {
      setError(err.message);
      onDone(null); // refresh the layout in case someone else just took the slot
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ ...s.card, borderColor: colors.primary }}>
      <h2 style={s.h2}>Book slot {slot.slotNumber}</h2>
      <p style={{ ...s.muted, marginBottom: 14 }}>
        Zone {slot.zone}
        <br />
        {new Date(start).toLocaleString()} to {new Date(end).toLocaleString()}
      </p>
      {error && <div style={s.error}>{error}</div>}
      <label style={s.label}>Vehicle number</label>
      <input
        style={{ ...s.input, marginBottom: 14, textTransform: "uppercase" }}
        placeholder="e.g. TS09AB1234"
        required
        autoFocus
        maxLength={15}
        value={vehicle}
        onChange={(e) => setVehicle(e.target.value)}
      />
      <div style={{ display: "flex", gap: 10 }}>
        <button style={{ ...s.btn, ...s.btnPrimary, flex: 1, opacity: busy ? 0.7 : 1 }} disabled={busy}>
          {busy ? "Booking..." : "Confirm booking"}
        </button>
        <button type="button" style={{ ...s.btn, ...s.btnGhost }} onClick={onClose}>
          Cancel
        </button>
      </div>
    </form>
  );
}
