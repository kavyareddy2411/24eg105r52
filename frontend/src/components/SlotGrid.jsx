import { colors } from "../theme";

function slotStyle(slot, selected) {
  const base = {
    padding: "14px 6px",
    borderRadius: 10,
    textAlign: "center",
    fontWeight: 700,
    fontSize: 14,
    border: "2px solid transparent",
    fontFamily: "inherit",
  };
  if (!slot.active) {
    return { ...base, background: colors.grayBg, color: colors.gray, cursor: "not-allowed" };
  }
  if (slot.occupied) {
    return { ...base, background: colors.redBg, color: colors.red, cursor: "not-allowed" };
  }
  return {
    ...base,
    background: colors.greenBg,
    color: colors.green,
    cursor: "pointer",
    borderColor: selected ? colors.primary : "transparent",
    boxShadow: selected ? `0 0 0 3px ${colors.primary}33` : "none",
  };
}

const legendDot = (bg) => ({
  display: "inline-block",
  width: 12,
  height: 12,
  borderRadius: 4,
  background: bg,
  marginRight: 6,
  verticalAlign: "middle",
});

export default function SlotGrid({ slots, selectedId, onSelect }) {
  const zones = [...new Set(slots.map((x) => x.zone))].sort();

  return (
    <div>
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", fontSize: 13, color: colors.muted, marginBottom: 14 }}>
        <span><i style={legendDot(colors.green)} />Available</span>
        <span><i style={legendDot(colors.red)} />Occupied</span>
        <span><i style={legendDot(colors.gray)} />Closed by admin</span>
      </div>

      {zones.map((zone) => (
        <div key={zone} style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: colors.muted, marginBottom: 8 }}>ZONE {zone}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(92px, 1fr))", gap: 10 }}>
            {slots
              .filter((x) => x.zone === zone)
              .map((slot) => {
                const free = slot.active && !slot.occupied;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={!free}
                    title={!slot.active ? "Closed" : slot.occupied ? "Occupied for this time" : "Available - click to book"}
                    style={slotStyle(slot, selectedId === slot.id)}
                    onClick={() => free && onSelect(slot)}
                  >
                    {slot.slotNumber}
                  </button>
                );
              })}
          </div>
        </div>
      ))}

      {slots.length === 0 && <p style={{ color: colors.muted }}>No parking slots have been added yet.</p>}
    </div>
  );
}
