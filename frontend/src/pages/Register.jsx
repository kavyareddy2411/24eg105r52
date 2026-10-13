import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import AuthLayout from "../components/AuthLayout";
import { colors, s } from "../theme";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      login(await api.register(form.name, form.email, form.password));
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Create account"
      subtitle="Students and staff can register to book parking."
      footer={
        <>
          Already registered?{" "}
          <Link to="/login" style={{ color: colors.primary, fontWeight: 600 }}>
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={submit}>
        {error && <div style={s.error}>{error}</div>}
        <label style={s.label}>Full name</label>
        <input style={{ ...s.input, marginBottom: 14 }} required value={form.name} onChange={set("name")} />
        <label style={s.label}>Email</label>
        <input
          style={{ ...s.input, marginBottom: 14 }}
          type="email"
          required
          autoComplete="email"
          value={form.email}
          onChange={set("email")}
        />
        <label style={s.label}>Password (min 6 characters)</label>
        <input
          style={{ ...s.input, marginBottom: 18 }}
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          value={form.password}
          onChange={set("password")}
        />
        <button
          style={{ ...s.btn, ...s.btnPrimary, width: "100%", opacity: busy ? 0.7 : 1 }}
          disabled={busy}
        >
          {busy ? "Creating..." : "Register"}
        </button>
      </form>
    </AuthLayout>
  );
}
