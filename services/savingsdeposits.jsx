"use client";
import { apiActions, apiMultipartActions } from "@/tools/axios";

export const createSavingsDeposit = async (values, token) => {
  await apiActions?.post(
    "/api/v1/savingsdeposits/admin/create/",
    values,
    token
  );
};

export const getSavingsDeposits = async (token) => {
  const response = await apiActions?.get("/api/v1/savingsdeposits/", token);
  return response?.data;
};

export const getSavingsDepositDetail = async (reference, token) => {
  const response = await apiActions?.get(
    `/api/v1/savingsdeposits/${reference}/`,
    token
  );
  return response?.data;
};

export const updateSavingsDeposit = async ({ reference, values }, token) => {
  const response = await apiActions?.patch(
    `/api/v1/savingsdeposits/${reference}/`,
    values,
    token
  );
  return response?.data;
};


// Used for Mpesa
export const createSavingsDepositMpesa = async (values, token) => {
  const response = await apiActions?.post(
    "/api/v1/savingsdeposits/",
    values,
    token
  );
  return response?.data;
};

// Bulk Functions
export const bulkCreateSavingsDeposits = async (values, token) => {
  await apiActions?.post("/api/v1/savingsdeposits/bulk/create/", values, token);
};

export const bulkUploadSavingsDeposits = async (values, token) => {
  await apiMultipartActions?.post("/api/v1/savingsdeposits/bulk/upload/", values, token);
};

export const downloadSavingsDepositsTemplate = async (token, savingType = "", transactionDate = "") => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
    responseType: "blob",
  };
  
  const params = new URLSearchParams();
  if (savingType) params.append("saving_type", savingType);
  if (transactionDate) params.append("transaction_date", transactionDate);
  
  const queryString = params.toString();
  const url = queryString 
    ? `/api/v1/savingsdeposits/bulk/template/?${queryString}`
    : "/api/v1/savingsdeposits/bulk/template/";
    
  const response = await apiActions?.get(url, config);
  
  // Create blob link to download
  const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.setAttribute("download", savingType ? `savings_deposits_${savingType.replace(/\s+/g, "_").toLowerCase()}_template.csv` : "savings_deposits_bulk_template.csv");
  document.body.appendChild(link);
  link.click();
  link.remove();
  
  return response?.data;
};

// Bulk Update Dates
export const downloadBulkUpdateTemplate = async (token, depositType = "") => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
    responseType: "blob",
  };
  const url = depositType 
    ? `/api/v1/savingsdeposits/bulk/update/template/?deposit_type=${encodeURIComponent(depositType)}` 
    : `/api/v1/savingsdeposits/bulk/update/template/`;
  const response = await apiActions?.get(url, config);

  // Create blob link to download
  const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.setAttribute("download", `bulk_edit_dates_${depositType ? depositType.replace(/\s+/g, "_").toLowerCase() : "all"}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();

  return response?.data;
};

export const bulkUpdateSavingsDepositsCSV = async (values, token) => {
  await apiMultipartActions?.post("/api/v1/savingsdeposits/bulk/update/upload/", values, token);
};

export const bulkUpdateSavingsDepositsJSON = async (updates, token) => {
  const response = await apiActions?.patch("/api/v1/savingsdeposits/bulk/update/json/", { updates }, token);
  return response?.data;
};