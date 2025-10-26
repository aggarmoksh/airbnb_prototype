import React, { useEffect, useState } from "react";
import api from "../api";

const BOOKINGS_ENDPOINT = "/bookings";

const statusPill = (status) => {
  const s = (status || "").toUpperCase();
  const map = {
    PENDING:  "bg-amber-100 text-amber-800 ring-1 ring-amber-200",
    ACCEPTED: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200",
    REJECTED: "bg-rose-100 text-rose-800 ring-1 ring-rose-200",
    CANCELLED:"bg-gray-100 text-gray-700 ring-1 ring-gray-200",
  };
  return map[s] || "bg-gray-100 text-gray-700 ring-1 ring-gray-200";
};

const fmtDate = (s) =>
  new Date(s).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

const diffNights = (a, b) => {
  const MS = 24 * 60 * 60 * 1000;
  const d = Math.round((new Date(b) - new Date(a)) / MS);
  return d > 0 ? d : 0;
};

export default function BookingsStatus() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setErr("");
      const r = await api.get(BOOKINGS_ENDPOINT, { withCredentials: true });
      setBookings(Array.isArray(r.data) ? r.data : []);
    } catch (e) {
      setErr(e?.response?.data?.error || e.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">My Bookings</h2>
        <button onClick={load} className="text-sm px-3 py-1.5 rounded-lg border hover:bg-gray-50">
          Refresh
        </button>
      </div>

      {loading && <div className="text-sm text-gray-500">Loading bookings…</div>}
      {err && <div className="text-sm text-rose-600">{err}</div>}

      {!loading && !err && bookings.length === 0 && (
        <div className="text-sm text-gray-500">No bookings yet.</div>
      )}

      <ul className="divide-y">
        {bookings.map((b) => {
          const nights = diffNights(b.startDate, b.endDate);
          const propName =
            b.property?.name ||
            (b.propertyId ? `Property ${String(b.propertyId).slice(0, 8)}…` : "Property");

          return (
            <li key={b.id} className="py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{propName}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusPill(b.status)}`}>
                      {(b.status || "UNKNOWN").toUpperCase()}
                    </span>
                  </div>

                  <div className="mt-1 text-sm text-gray-600">
                    {fmtDate(b.startDate)} → {fmtDate(b.endDate)} · {nights} night{nights === 1 ? "" : "s"}
                    {typeof b.guests === "number" ? ` · ${b.guests} guest${b.guests === 1 ? "" : "s"}` : ""}
                  </div>

                  <div className="text-xs text-gray-400 mt-0.5">
                    Booked: {fmtDate(b.createdAt)}
                  </div>
                </div>

                <div className="text-[11px] text-gray-400">{String(b.id).slice(0, 10)}…</div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
