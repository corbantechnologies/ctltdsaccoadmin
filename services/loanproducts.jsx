"use client";

import { apiActions } from "@/tools/axios";

// SACCO Admins
// create loan type
export const createLoanProduct = async (values, token) => {
  await apiActions?.post("/api/v1/loanproducts/", values, token);
};

// get loan types
export const getLoanProducts = async (token) => {
  const response = await apiActions?.get("/api/v1/loanproducts/", token);
  return response?.data?.results || [];
};

// get loan type detail by reference
export const getLoanProductDetail = async (reference, token) => {
  const response = await apiActions?.get(
    `/api/v1/loanproducts/${reference}/`,
    token
  );
  return response?.data;
};

// update loan type: to be used rarely
export const updateLoanProduct = async (reference, formData, token) => {
  const response = await apiActions?.patch(
    `/api/v1/loanproducts/${reference}/`,
    formData,
    token
  );
  return response?.data;
};

// Bulk Functions
export const bulkCreateLoanProducts = async (values, token) => {
    await apiActions?.post("/api/v1/loanproducts/bulk/create/", values, token);
};

export const bulkUploadLoanProducts = async (values, token) => {
    await apiMultipartActions?.post("/api/v1/loanproducts/bulk/upload/", values, token);
};

export const downloadLoanProductsTemplate = async (token) => {
    const config = { ...token, responseType: "blob" };
    const response = await apiActions?.get("/api/v1/loanproducts/bulk/template/", config);

    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "loan_products_bulk_template.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();

    return response?.data;
};