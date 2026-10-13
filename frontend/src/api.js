const BASE = (import.meta.env.VITE_API_URL || "http://localhost:8080").replace(/\/$/, "");
const KEY = "parking_auth";

export const getAuth = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY));
  } catch {
    return null;
  }
};
export const setAuth = (data) => localStorage.setItem(KEY, JSON.stringify(data));
export const clearAuth = () => localStorage.removeItem(KEY);

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  const stored = getAuth();
  if (auth && stored?.token) headers.Authorization = `Bearer ${stored.token}`;

  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Cannot reach the server. If it was idle, wait a few seconds and try again.");
  }

  if (res.status === 401 && auth) {
    clearAuth();
    window.location.assign("/login");
    throw new Error("Session expired. Please log in again.");
  }

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!res.ok) throw new Error(data?.message || `Request failed (${res.status})`);
  return data;
}

export const api = {
  login: (email, password) => request("/api/auth/login", { method: "POST", body: { email, password }, auth: false }),
  register: (name, email, password) =>
    request("/api/auth/register", { method: "POST", body: { name, email, password }, auth: false }),

  slots: (startIso, endIso) => {
    const q = startIso && endIso ? `?start=${encodeURIComponent(startIso)}&end=${encodeURIComponent(endIso)}` : "";
    return request(`/api/slots${q}`);
  },

  createBooking: (payload) => request("/api/bookings", { method: "POST", body: payload }),
  myBookings: () => request("/api/bookings/my"),
  cancelBooking: (id) => request(`/api/bookings/${id}`, { method: "DELETE" }),

  adminStats: () => request("/api/admin/stats"),
  adminBookings: () => request("/api/admin/bookings"),
  addSlot: (slotNumber, zone) => request("/api/admin/slots", { method: "POST", body: { slotNumber, zone } }),
  toggleSlot: (id) => request(`/api/admin/slots/${id}/toggle`, { method: "PATCH" }),
  deleteSlot: (id) => request(`/api/admin/slots/${id}`, { method: "DELETE" }),
};
