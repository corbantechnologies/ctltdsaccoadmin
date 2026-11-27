"use client";

import { X } from "lucide-react";

/** From / to date inputs for list filters. Values are "YYYY-MM-DD" strings ("" = open). */
export default function DateRangeFilter({ from, to, onChange, label = "Date" }) {
    const input =
        "h-8 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]";
    return (
        <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-medium text-slate-500">{label}</span>
            <input
                type="date"
                aria-label={`${label} from`}
                value={from}
                max={to || undefined}
                onChange={(e) => onChange({ from: e.target.value, to })}
                className={input}
            />
            <span className="text-[11px] text-slate-400">to</span>
            <input
                type="date"
                aria-label={`${label} to`}
                value={to}
                min={from || undefined}
                onChange={(e) => onChange({ from, to: e.target.value })}
                className={input}
            />
            {(from || to) && (
                <button
                    type="button"
                    onClick={() => onChange({ from: "", to: "" })}
                    className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-[11px] font-medium text-slate-500 hover:bg-slate-100"
                    title="Clear dates"
                >
                    <X className="h-3 w-3" /> Clear
                </button>
            )}
        </div>
    );
}

/** "2026-11-27" or an ISO timestamp -> "2026-11-27", for comparing with the inputs. */
export const dayOf = (value) => (value ? String(value).slice(0, 10) : "");

/** True when the day falls inside the range. Rows with no date only pass an empty range. */
export const inDateRange = (value, from, to) => {
    if (!from && !to) return true;
    const d = dayOf(value);
    if (!d) return false;
    if (from && d < from) return false;
    if (to && d > to) return false;
    return true;
};

export const formatDay = (value) =>
    value
        ? new Date(value).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" })
        : "-";
