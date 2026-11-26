"use client";

import { apiActions, apiMultipartActions } from "@/tools/axios";

// SACCO settings stored in the database (API: /api/v1/settings/).
// Admins can change branding, contacts and loan policy; superusers can
// change everything. Every change is logged on the API.

export const getSaccoSettings = async (token) => (await apiActions.get("/api/v1/settings/", token))?.data;

export const updateSaccoSettings = async (settings, reason, token) =>
  (await apiActions.patch("/api/v1/settings/", { settings, reason }, token))?.data;

export const getSettingChanges = async (token, params = {}) =>
  (await apiActions.get("/api/v1/settings/changes/", { ...token, params }))?.data;

export const uploadSaccoLogo = async (file, variant, token) => {
  const form = new FormData();
  form.append("file", file);
  form.append("variant", variant);
  return (await apiMultipartActions.post("/api/v1/settings/logo/", form, token))?.data;
};

export const deleteSaccoLogo = async (variant, token) =>
  apiActions.delete("/api/v1/settings/logo/", { ...token, params: { variant } });

export const testMpesaKeys = async (values, token) =>
  (await apiActions.post("/api/v1/settings/test-mpesa/", values, token))?.data;

export const sendTestEmail = async (sender, token) =>
  (await apiActions.post("/api/v1/settings/test-email/", { sender }, token))?.data;

// Turns an API error into one readable line, or a {field: message} map.
export function settingsErrors(error) {
  const data = error?.response?.data;
  if (data?.errors && typeof data.errors === "object") return data.errors;
  return { detail: data?.detail || data?.message || "Something went wrong. Try again." };
}
