"use client";

import { apiActions } from "@/tools/axios";

// Upload history: every bulk CSV upload, with the original file and the
// outcome of each row (kept by the API for audit).

export const getUploads = async (token, { page = 1, type = "", search = "" } = {}) => {
  const params = new URLSearchParams({ page: String(page), page_size: "25" });
  if (type) params.append("type", type);
  if (search) params.append("search", search);
  const response = await apiActions?.get(`/api/v1/transactions/uploads/?${params}`, token);
  return response.data;
};

export const getUpload = async (token, reference) => {
  const response = await apiActions?.get(`/api/v1/transactions/uploads/${reference}/`, token);
  return response.data;
};

export const downloadUploadFile = async (token, reference, fileName) => {
  const response = await apiActions?.get(`/api/v1/transactions/uploads/${reference}/file/`, {
    ...token,
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([response.data], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName || `${reference}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export function formatDateTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export function formatSize(bytes) {
  if (bytes == null) return "";
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}
