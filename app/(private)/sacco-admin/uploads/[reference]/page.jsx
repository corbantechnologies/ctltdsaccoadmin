"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { useFetchUpload } from "@/hooks/uploads/actions";
import { downloadUploadFile, formatDateTime, formatSize } from "@/services/uploads";

const STATUS_STYLES = {
  Success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Error: "bg-red-50 text-red-700 border-red-200",
  Skipped: "bg-slate-50 text-slate-600 border-slate-200",
};

export default function UploadDetailPage() {
  const { reference } = useParams();
  const token = useAxiosAuth();
  const { data: upload, isLoading, error } = useFetchUpload(reference);
  const [filter, setFilter] = useState("");

  if (isLoading) return <p className="p-8 text-sm text-slate-500">Loading upload...</p>;
  if (error || !upload) return <p className="p-8 text-sm text-red-600">Could not load this upload.</p>;

  const rows = upload.rows || [];
  const shown = filter ? rows.filter((r) => r.status === filter) : rows;
  const counts = rows.reduce((acc, r) => ({ ...acc, [r.status]: (acc[r.status] || 0) + 1 }), {});

  const handleDownload = async () => {
    try {
      await downloadUploadFile(token, upload.reference, upload.file_name);
    } catch (e) {
      toast.error("Could not download the file.");
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <Link href="/sacco-admin/uploads" className="text-sm text-slate-500 flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" /> Upload history
      </Link>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <h1 className="text-xl font-semibold break-words">{upload.file_name || upload.reference_prefix}</h1>
          <p className="text-sm text-slate-500">
            {upload.transaction_type} · {formatDateTime(upload.created_at)} · by {upload.uploaded_by}
          </p>
          <p className="text-xs text-slate-500">Reference: {upload.reference_prefix}</p>
          {upload.has_file && (
            <p className="text-xs text-slate-500 break-all">
              {formatSize(upload.file_size)} · SHA-256 {upload.file_sha256}
            </p>
          )}
        </div>
        {upload.has_file ? (
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" /> Download original file
          </Button>
        ) : upload.cloudinary_url ? (
          <a href={upload.cloudinary_url} target="_blank" rel="noreferrer">
            <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Download (older copy)</Button>
          </a>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        {[["", `All (${rows.length})`], ["Success", `Saved (${counts.Success || 0})`], ["Error", `Failed (${counts.Error || 0})`], ["Skipped", `Skipped (${counts.Skipped || 0})`]].map(([value, label]) => (
          <Button key={value || "all"} size="sm" variant={filter === value ? "default" : "outline"} onClick={() => setFilter(value)}>
            {label}
          </Button>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">
          No row details were kept for this upload (uploads before row tracking was added). Saved: {upload.success_count}, failed: {upload.error_count}.
        </p>
      ) : (
        <div className="border rounded bg-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Row</th>
                <th className="px-3 py-2">Result</th>
                <th className="px-3 py-2">Details</th>
                <th className="px-3 py-2">Data in the file</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r, i) => (
                <tr key={`${r.row_number}-${i}`} className="border-t align-top">
                  {/* +1: row 1 of the data is line 2 of the spreadsheet, under the headings */}
                  <td className="px-3 py-2 whitespace-nowrap">{r.row_number}<div className="text-xs text-slate-400">line {r.row_number + 1}</div></td>
                  <td className="px-3 py-2">
                    <span className={`inline-block border rounded px-2 py-0.5 text-xs ${STATUS_STYLES[r.status] || ""}`}>
                      {r.status === "Success" ? "Saved" : r.status === "Error" ? "Failed" : "Skipped"}
                    </span>
                  </td>
                  <td className="px-3 py-2 max-w-sm break-words">
                    {r.message}
                    {r.references?.length > 0 && (
                      <div className="text-xs text-slate-500 break-all">Created: {r.references.join(", ")}</div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-600 max-w-md break-words">
                    {Object.entries(r.data || {})
                      .filter(([, v]) => v !== "" && v != null)
                      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
                      .join(" · ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
