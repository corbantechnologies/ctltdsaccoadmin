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

export const downloadFeePaymentsTemplate = async (token, feeType = "", transactionDate = "") => {
    const config = { ...token, responseType: "blob" };
    
    const params = new URLSearchParams();
    if (feeType) params.append("fee_type", feeType);
    if (transactionDate) params.append("transaction_date", transactionDate);
    
    const queryString = params.toString();
    const url_path = queryString 
        ? `/api/v1/feepayments/bulk/template/?${queryString}`
        : "/api/v1/feepayments/bulk/template/";
        
    const response = await apiActions?.get(url_path, config);

    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", feeType ? `fee_payments_${feeType.replace(/\s+/g, "_").toLowerCase()}_template.csv` : "fee_payments_bulk_template.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();

    return response?.data;
};