import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { colors, s } from "../theme";

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const link = ({ isActive }) => ({
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 600,
    padding: "8px 12px",
    borderRadius: 8,
    color: isActive ? colors.primary : colors.muted,
    background: isActive ? "#eaf0ff" : "transparent",
  });

  return (
    <header style={{ background: colors.card, borderBottom: `1px solid ${colors.border}` }}>
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 18, marginRight: 12 }}>
          <span style={{ color: colors.primary }}>P</span> Campus Parking
        </div>
        <NavLink to="/" end style={link}>Parking Lot</NavLink>
        <NavLink to="/my-bookings" style={link}>My Bookings</NavLink>
        {isAdmin && <NavLink to="/admin" style={link}>Admin</NavLink>}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, color: colors.muted }}>
            {user.name} {isAdmin && "(admin)"}
          </span>
          <button
            style={{ ...s.btn, ...s.btnGhost, ...s.btnSmall }}
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
