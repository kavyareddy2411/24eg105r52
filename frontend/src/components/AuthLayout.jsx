import { colors, s } from "../theme";

/** Centered card used by the Login and Register pages. */
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 16 }}>
      <div style={{ ...s.card, width: "100%", maxWidth: 400, padding: 28 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: colors.primary, marginBottom: 8 }}>
          COLLEGE PARKING SLOT MANAGER
        </div>
        <h1 style={s.h1}>{title}</h1>
        <p style={{ ...s.muted, marginBottom: 20 }}>{subtitle}</p>
        {children}
        <p style={{ ...s.muted, textAlign: "center", marginTop: 18 }}>{footer}</p>
      </div>
    </div>
  );
}
