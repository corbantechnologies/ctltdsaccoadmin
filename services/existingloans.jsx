"use client";

import { apiActions } from "@/tools/axios";

// SACCO Admins
// create Existing Loan
export const createExistingLoan = async (values, token) => {
  await apiActions?.post("/api/v1/existingloans/", values, token);
};

// get Existing Loans
export const getExistingLoans = async (token) => {
  const response = await apiActions?.get("/api/v1/existingloans/", token);
  return response?.data?.results || [];
};

// get Existing Loan detail by reference
export const getExistingLoanDetail = async (reference, token) => {
  const response = await apiActions?.get(
    `/api/v1/existingloans/${reference}/`,
    token
  );
  return response?.data;
};

// update Existing Loan: to be used rarely
export const updateExistingLoan = async (reference, formData, token) => {
  const response = await apiActions?.patch(
    `/api/v1/existingloans/${reference}/`,
    formData,
    token
  );
  return response?.data;
};

// Bulk Functions
export const bulkCreateExistingLoans = async (values, token) => {
    await apiActions?.post("/api/v1/existingloans/bulk/create/", values, token);
};

export const bulkUploadExistingLoans = async (values, token) => {
    await apiMultipartActions?.post("/api/v1/existingloans/bulk/upload/", values, token);
};

export const downloadExistingLoansTemplate = async (token) => {
    const config = { ...token, responseType: "blob" };
    const response = await apiActions?.get("/api/v1/existingloans/bulk/template/", config);

    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "existing_loans_bulk_template.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();

    return response?.data;
};