"use client";

import { apiActions, apiMultipartActions } from "@/tools/axios";

// create
export const createPaymentAccount = async (values, token) => {
    await apiActions?.post("/api/v1/paymentaccounts/", values, token);
};

// update
export const updatePaymentAccount = async (reference, values, token) => {
    const response = await apiActions?.patch(
        `/api/v1/paymentaccounts/${reference}/`,
        values,
        token
    );
    return response?.data;
};

export const getPaymentAccounts = async (token) => {
    const response = await apiActions?.get("/api/v1/paymentaccounts/", token);
    return response?.data?.results;
};

export const getPaymentAccount = async (reference, token) => {
    const response = await apiActions?.get(
        `/api/v1/paymentaccounts/${reference}/`,
        token
    );
    return response?.data;
};

// Bulk Functions
export const bulkCreatePaymentAccounts = async (values, token) => {
    await apiActions?.post("/api/v1/paymentaccounts/bulk/create/", values, token);
};

export const bulkUploadPaymentAccounts = async (values, token) => {
    await apiMultipartActions?.post("/api/v1/paymentaccounts/bulk/upload/", values, token);
};

export const downloadPaymentAccountsTemplate = async (token) => {
    const config = { ...token, responseType: "blob" };
    const response = await apiActions?.get("/api/v1/paymentaccounts/bulk/template/", config);

    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "payment_accounts_bulk_template.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();

    return response?.data;
};