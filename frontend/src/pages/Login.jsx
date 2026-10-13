import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import AuthLayout from "../components/AuthLayout";
import { colors, s } from "../theme";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      login(await api.login(email, password));
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to view and book parking slots."
      footer={
        <>
          New here?{" "}
          <Link to="/register" style={{ color: colors.primary, fontWeight: 600 }}>
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit}>
        {error && <div style={s.error}>{error}</div>}
        <label style={s.label}>Email</label>
        <input
          style={{ ...s.input, marginBottom: 14 }}
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label style={s.label}>Password</label>
        <input
          style={{ ...s.input, marginBottom: 18 }}
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          style={{ ...s.btn, ...s.btnPrimary, width: "100%", opacity: busy ? 0.7 : 1 }}
          disabled={busy}
        >
          {busy ? "Logging in..." : "Log in"}
        </button>
      </form>
    </AuthLayout>
  );
}
