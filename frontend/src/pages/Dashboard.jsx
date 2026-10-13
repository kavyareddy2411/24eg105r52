import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../api";
import SlotGrid from "../components/SlotGrid";
import BookingPanel from "../components/BookingPanel";
import { toIso, toLocalInput } from "../utils";
import { colors, s } from "../theme";

export default function Dashboard() {
  const [start, setStart] = useState(() => toLocalInput(new Date()));
  const [end, setEnd] = useState(() => toLocalInput(new Date(Date.now() + 2 * 3600 * 1000)));
  const [slots, setSlots] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const rangeError = useMemo(() => {
    if (!start || !end) return "Choose a start and end time.";
    if (new Date(end) <= new Date(start)) return "End time must be after start time.";
    return "";
  }, [start, end]);

  const load = useCallback(async () => {
    if (rangeError) return;
    try {
      const data = await api.slots(toIso(start), toIso(end));
      setSlots(data);
      setError("");
      // drop the selection if the slot just became unavailable
      setSelected((sel) => (sel && data.find((x) => x.id === sel.id && x.active && !x.occupied) ? sel : null));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [start, end, rangeError]);

  useEffect(() => {
    load();
    const timer = setInterval(load, 30000); // keep availability fresh
    return () => clearInterval(timer);
  }, [load]);

  const available = slots.filter((x) => x.active && !x.occupied).length;
  const occupied = slots.filter((x) => x.active && x.occupied).length;

  return (
    <div style={s.page}>
      <h1 style={s.h1}>Parking lot</h1>
      <p style={{ ...s.muted, marginBottom: 20 }}>
        Pick the time you need, then choose a green slot to book it.
      </p>

      {message && <div style={s.success}>{message}</div>}

      <div style={{ ...s.card, marginBottom: 20 }}>
        <div style={s.row}>
          <div style={{ flex: "1 1 220px" }}>
            <label style={s.label}>From</label>
            <input style={s.input} type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div style={{ flex: "1 1 220px" }}>
            <label style={s.label}>Until</label>
            <input style={s.input} type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
          <div style={{ flex: "1 1 160px", display: "flex", alignItems: "flex-end", gap: 16, fontSize: 14 }}>
            <span style={{ color: colors.green, fontWeight: 700 }}>{available} free</span>
            <span style={{ color: colors.red, fontWeight: 700 }}>{occupied} occupied</span>
          </div>
        </div>
        {rangeError && <div style={{ ...s.error, marginTop: 12, marginBottom: 0 }}>{rangeError}</div>}
      </div>

      {error && <div style={s.error}>{error}</div>}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "flex-start" }}>
        <div style={{ ...s.card, flex: "2 1 460px", minWidth: 0 }}>
          {loading ? <p style={s.muted}>Loading parking layout...</p> : (
            <SlotGrid slots={slots} selectedId={selected?.id} onSelect={setSelected} />
          )}
        </div>

        <div style={{ flex: "1 1 280px", minWidth: 0 }}>
          {selected && !rangeError ? (
            <BookingPanel
              key={selected.id}
              slot={selected}
              start={start}
              end={end}
              onClose={() => setSelected(null)}
              onDone={(msg) => {
                if (msg) {
                  setMessage(msg);
                  setSelected(null);
                } else {
                  setMessage("");
                }
                load();
              }}
            />
          ) : (
            <div style={s.card}>
              <h2 style={s.h2}>How booking works</h2>
              <p style={s.muted}>
                1. Set your arrival and leaving time.
                <br />2. Click a green slot.
                <br />3. Enter your vehicle number and confirm.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
