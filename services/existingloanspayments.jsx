"use client";

import { apiActions } from "@/tools/axios";

// SACCO Admins
// create Existing Loan
export const createExistingLoanPayment = async (values, token) => {
    await apiActions?.post("/api/v1/existingloanspayments/", values, token);
};

// get Existing Loans
export const getExistingLoanPayments = async (token) => {
    const response = await apiActions?.get("/api/v1/existingloanspayments/", token);
    return response?.data?.results || [];
};

// get Existing Loan detail by reference
export const getExistingLoanPaymentDetail = async (reference, token) => {
    const response = await apiActions?.get(
        `/api/v1/existingloanspayments/${reference}/`,
        token
    );
    return response?.data;
};

// update Existing Loan: to be used rarely
export const updateExistingLoanPayment = async (reference, formData, token) => {
    const response = await apiActions?.patch(
        `/api/v1/existingloanspayments/${reference}/`,
        formData,
        token
    );
    return response?.data;
};

// Bulk Functions
export const bulkCreateExistingLoanPayments = async (values, token) => {
    await apiActions?.post("/api/v1/existingloanspayments/bulk/create/", values, token);
};

export const bulkUploadExistingLoanPayments = async (values, token) => {
    await apiMultipartActions?.post("/api/v1/existingloanspayments/bulk/upload/", values, token);
};

export const downloadExistingLoanPaymentsTemplate = async (token) => {
    const config = { ...token, responseType: "blob" };
    const response = await apiActions?.get("/api/v1/existingloanspayments/bulk/template/", config);

    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "existing_loans_payments_bulk_template.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();

    return response?.data;
};