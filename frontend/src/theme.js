// All styling lives in JS objects (no .css files).

export const colors = {
  bg: "#f3f5fa",
  card: "#ffffff",
  primary: "#2f5bea",
  primaryDark: "#2347c0",
  text: "#1c2333",
  muted: "#667089",
  border: "#e1e5ef",
  green: "#1f9d55",
  greenBg: "#e5f6ec",
  red: "#d64040",
  redBg: "#fde8e8",
  gray: "#8a93a6",
  grayBg: "#eceef3",
  amber: "#b7791f",
  amberBg: "#fdf3dc",
};

export const font =
  'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export const s = {
  page: { maxWidth: 1100, margin: "0 auto", padding: "24px 16px 48px" },
  card: {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: 14,
    padding: 20,
    boxShadow: "0 1px 3px rgba(20,30,60,0.05)",
  },
  h1: { fontSize: 26, margin: "0 0 4px", fontWeight: 700 },
  h2: { fontSize: 18, margin: "0 0 12px", fontWeight: 650 },
  muted: { color: colors.muted, fontSize: 14, margin: 0 },
  label: { display: "block", fontSize: 13, fontWeight: 600, margin: "0 0 6px", color: colors.muted },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    fontSize: 15,
    border: `1px solid ${colors.border}`,
    borderRadius: 10,
    outline: "none",
    background: "#fff",
    color: colors.text,
    fontFamily: font,
  },
  btn: {
    padding: "10px 16px",
    fontSize: 14,
    fontWeight: 600,
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontFamily: font,
  },
  btnPrimary: { background: colors.primary, color: "#fff" },
  btnDanger: { background: colors.redBg, color: colors.red },
  btnGhost: { background: colors.grayBg, color: colors.text },
  btnSmall: { padding: "6px 10px", fontSize: 13 },
  error: {
    background: colors.redBg,
    color: colors.red,
    padding: "10px 12px",
    borderRadius: 10,
    fontSize: 14,
    marginBottom: 12,
  },
  success: {
    background: colors.greenBg,
    color: colors.green,
    padding: "10px 12px",
    borderRadius: 10,
    fontSize: 14,
    marginBottom: 12,
  },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14 },
  th: {
    textAlign: "left",
    padding: "10px 12px",
    color: colors.muted,
    fontWeight: 600,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    borderBottom: `1px solid ${colors.border}`,
    whiteSpace: "nowrap",
  },
  td: { padding: "12px", borderBottom: `1px solid ${colors.border}`, verticalAlign: "middle" },
  row: { display: "flex", gap: 12, flexWrap: "wrap" },
};

export const badge = (fg, bg) => ({
  display: "inline-block",
  padding: "3px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  color: fg,
  background: bg,
});

export const statusBadge = (status) => {
  switch (status) {
    case "ACTIVE":
      return badge(colors.green, colors.greenBg);
    case "COMPLETED":
      return badge(colors.gray, colors.grayBg);
    case "CANCELLED":
      return badge(colors.red, colors.redBg);
    default:
      return badge(colors.gray, colors.grayBg);
  }
};
