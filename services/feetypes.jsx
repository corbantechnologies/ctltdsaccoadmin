"use client";

import { apiActions } from "@/tools/axios";

// SACCO ADMINS
// create fee type
export const createFeeType = async (values, token) => {
    await apiActions?.post("/api/v1/feetypes/", values, token);
};

// get fee types
export const getFeeTypes = async (token) => {
    const response = await apiActions?.get("/api/v1/feetypes/", token);
    return response?.data?.results;
};

// get fee type detail by reference
export const getFeeTypeDetail = async (reference, token) => {
    const response = await apiActions?.get(
        `/api/v1/feetypes/${reference}/`,
        token
    );
    return response?.data;
};

// update fee type
export const updateFeeType = async (reference, formData, token) => {
    const response = await apiActions?.patch(
        `/api/v1/feetypes/${reference}/`,
        formData,
        token
    );
    return response?.data;
};

// Bulk Functions
export const bulkCreateFeeTypes = async (values, token) => {
    await apiActions?.post("/api/v1/feetypes/bulk/create/", values, token);
};

export const bulkUploadFeeTypes = async (values, token) => {
    await apiMultipartActions?.post("/api/v1/feetypes/bulk/upload/", values, token);
};

export const downloadFeeTypesTemplate = async (token) => {
    const config = { ...token, responseType: "blob" };
    const response = await apiActions?.get("/api/v1/feetypes/bulk/template/", config);

    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "fee_types_bulk_template.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();

    return response?.data;
};