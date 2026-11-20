"use client";

import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { Download, FileText, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { useFetchUploads } from "@/hooks/uploads/actions";
import { downloadUploadFile, formatDateTime, formatSize } from "@/services/uploads";

const TYPES = [
  "Savings Deposits",
  "Savings Deposit Date Edits",
  "Fee Payments Upload",
  "Loan Disbursements Upload",
  "Universal Bulk Transaction",
  "Combined Bulk Upload",
  "Journal Batches Upload",
  "Loan Application Onboarding",
  "Loan Balance Forward Onboarding",
  "GL Accounts Upload",
  "Payment Accounts Upload",
  "Saving Types Upload",
  "Fee Types Upload",
  "Loan Products Upload",
];

export default function UploadHistoryPage() {
  const token = useAxiosAuth();
  const [page, setPage] = useState(1);
  const [type, setType] = useState("");
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const { data, isLoading, error } = useFetchUploads({ page, type, search });

  const uploads = data?.results || [];
  const totalPages = data?.count ? Math.ceil(data.count / 25) : 1;

  const handleDownload = async (upload) => {
    try {
      await downloadUploadFile(token, upload.reference, upload.file_name);
    } catch (e) {
      toast.error("Could not download the file.");
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Upload history</h1>
        <p className="text-sm text-slate-500 max-w-2xl">
          Every bulk CSV upload, with the original file and what happened to each row. Files are kept in
          the SACCO&apos;s own database, with a fingerprint (SHA-256) showing they have not been changed.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <form
          className="flex gap-2 flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setSearch(searchText.trim());
          }}
        >
          <Input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by file name or reference"
            className="h-9"
          />
          <Button type="submit" variant="outline" size="sm" className="h-9">
            <Search className="h-4 w-4" />
          </Button>
        </form>
        <select
          value={type}
          onChange={(e) => {
            setPage(1);
            setType(e.target.value);
          }}
          className="border rounded px-3 h-9 text-sm bg-white"
        >
          <option value="">All upload types</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading uploads...</p>
      ) : error ? (
        <p className="text-sm text-red-600">Could not load the upload history.</p>
      ) : uploads.length === 0 ? (
        <p className="text-sm text-slate-500">No uploads found.</p>
      ) : (
        <div className="border rounded bg-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Uploaded</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">File</th>
                <th className="px-3 py-2 text-right">Saved</th>
                <th className="px-3 py-2 text-right">Failed</th>
                <th className="px-3 py-2 text-right">Skipped</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {uploads.map((u) => (
                <tr key={u.reference} className="border-t align-top">
                  <td className="px-3 py-2 whitespace-nowrap">
                    {formatDateTime(u.created_at)}
                    <div className="text-xs text-slate-500">{u.uploaded_by}</div>
                  </td>
                  <td className="px-3 py-2">{u.transaction_type}</td>
                  <td className="px-3 py-2 max-w-xs break-words">
                    {u.file_name || <span className="text-slate-400">(no name)</span>}
                    <div className="text-xs text-slate-500">
                      {u.has_file ? formatSize(u.file_size) : u.cloudinary_url ? "Older upload: copy on Cloudinary" : "No copy kept"}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right text-emerald-700">{u.success_count}</td>
                  <td className={`px-3 py-2 text-right ${u.error_count ? "text-red-600 font-semibold" : ""}`}>{u.error_count}</td>
                  <td className="px-3 py-2 text-right text-slate-500">{u.skipped_count ?? "-"}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2 justify-end">
                      <Link href={`/sacco-admin/uploads/${u.reference}`}>
                        <Button variant="outline" size="sm" className="h-8">
                          <FileText className="h-4 w-4 mr-1" /> Rows
                        </Button>
                      </Link>
                      {u.has_file ? (
                        <Button variant="outline" size="sm" className="h-8" onClick={() => handleDownload(u)}>
                          <Download className="h-4 w-4 mr-1" /> File
                        </Button>
                      ) : u.cloudinary_url ? (
                        <a href={u.cloudinary_url} target="_blank" rel="noreferrer">
                          <Button variant="outline" size="sm" className="h-8">
                            <Download className="h-4 w-4 mr-1" /> File
                          </Button>
                        </a>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <span>Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
