const pad = (n) => String(n).padStart(2, "0");

/** Date -> value for <input type="datetime-local"> (local time). */
export const toLocalInput = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

/** datetime-local string -> ISO string in UTC for the API. */
export const toIso = (local) => new Date(local).toISOString();

export const formatDateTime = (iso) =>
  new Date(iso).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
