"use client";

import { apiActions, apiMultipartActions } from "@/tools/axios";

// create
export const createFeePayment = async (values, token) => {
    await apiActions?.post("/api/v1/feepayments/", values, token);
};

export const getFeePayments = async (token) => {
    const response = await apiActions?.get("/api/v1/feepayments/", token);
    return response?.data?.results;
};

export const getFeePayment = async (reference, token) => {
    const response = await apiActions?.get(
        `/api/v1/feepayments/${reference}/`,
        token
    );
    return response?.data;
};

// Bulk Functions
export const bulkCreateFeePayments = async (values, token) => {
    await apiActions?.post("/api/v1/feepayments/bulk/create/", values, token);
};

export const bulkUploadFeePayments = async (values, token) => {
    await apiMultipartActions?.post("/api/v1/feepayments/bulk/upload/", values, token);
};

export const downloadFeePaymentsTemplate = async (token) => {
    const config = { ...token, responseType: "blob" };
    const response = await apiActions?.get("/api/v1/feepayments/bulk/template/", config);

    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "fee_payments_bulk_template.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();

    return response?.data;
};