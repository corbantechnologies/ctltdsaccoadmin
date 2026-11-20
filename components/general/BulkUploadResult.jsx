"use client";

import toast from "react-hot-toast";

// Shown on every bulk CSV upload that has a date column. Excel rewrites
// dates in the computer's own format when the file is saved; the API reads them.
export function BulkUploadDateHint() {
    return (
        <p className="text-[11px] text-slate-500">
            Dates can be DD/MM/YYYY (e.g. 31/01/2026) or YYYY-MM-DD (e.g. 2026-01-31). Dates changed by Excel are fine.
            A date like 05/03/2026 is read as 5 March.
        </p>
    );
}

// The API returns {success_count, error_count, errors: [...]}. Each error names
// its row (row / batch_identifier / index / reference) and has `error` (text)
// or `errors` (field -> messages).
function describe(item) {
    if (typeof item === "string") return item;
    const where =
        item.row != null ? `Row ${item.row}`
            : item.batch_identifier ? `Batch ${item.batch_identifier}`
                : item.index != null ? `Item ${item.index}`
                    : item.reference ? `Ref ${item.reference}`
                        : "";
    let message = item.error ?? "";
    if (!message && item.errors) {
        message = Object.entries(item.errors)
            .map(([field, msgs]) => `${field}: ${[].concat(msgs).join(" ")}`)
            .join("; ");
    }
    return where ? `${where}: ${message}` : String(message);
}

export function hasBulkCounts(data) {
    return data && typeof data === "object" && ("success_count" in data || "error_count" in data);
}

// Toast for a finished upload. Returns true when the response had counts.
export function toastBulkResult(data, label) {
    if (!hasBulkCounts(data)) return false;
    const ok = data.success_count || 0;
    const failed = data.error_count || 0;
    if (failed && ok) toast.error(`${ok} ${label} saved, ${failed} failed. See the list below.`);
    else if (failed) toast.error(`No ${label} saved: ${failed} failed. See the list below.`);
    else toast.success(`${ok} ${label} saved.`);
    return true;
}

export default function BulkUploadResult({ result }) {
    if (!hasBulkCounts(result)) return null;
    const errors = result.errors || [];
    const failed = result.error_count || 0;
    return (
        <div className={`rounded border p-4 text-sm space-y-2 ${failed ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"}`}>
            <p className="font-semibold text-slate-800">
                {result.success_count || 0} saved, {failed} failed
            </p>
            {errors.length > 0 && (
                <ul className="list-disc pl-5 space-y-1 text-slate-700 max-h-64 overflow-y-auto break-words">
                    {errors.map((item, i) => (
                        <li key={i}>{describe(item)}</li>
                    ))}
                </ul>
            )}
            {failed > errors.length && (
                <p className="text-xs text-slate-500">Showing the first {errors.length} problems.</p>
            )}
        </div>
    );
}
