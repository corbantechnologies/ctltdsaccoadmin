"use client";

import { apiActions, apiMultipartActions } from "@/tools/axios";

// SACCO Admins
export const createLoanDisbursement = async (values, token) => {
    const response = await apiActions?.post(
        "/api/v1/loandisbursements/",
        values,
        token
    );
    return response?.data;
};

// Bulk Functions
export const bulkCreateLoanDisbursements = async (values, token) => {
    await apiActions?.post("/api/v1/loandisbursements/bulk/create/", values, token);
};

export const bulkUploadLoanDisbursements = async (values, token) => {
    await apiMultipartActions?.post("/api/v1/loandisbursements/bulk/upload/", values, token);
};

export const downloadLoanDisbursementsTemplate = async (token) => {
    const config = { ...token, responseType: "blob" };
    const response = await apiActions?.get("/api/v1/loandisbursements/bulk/template/", config);

    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "loan_disbursements_bulk_template.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();

    return response?.data;
};