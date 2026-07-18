"use client";

import { apiActions, apiMultipartActions } from "@/tools/axios";

// create
export const createGLAccount = async (values, token) => {
    await apiActions?.post("/api/v1/glaccounts/", values, token);
};

// update
export const updateGLAccount = async (reference, values, token) => {
    const response = await apiActions?.patch(
        `/api/v1/glaccounts/${reference}/`,
        values,
        token
    );
    return response?.data;
};

export const getGLAccounts = async (token) => {
    const response = await apiActions?.get("/api/v1/glaccounts/", token);
    return response?.data?.results;
};

export const getGLAccount = async (reference, token) => {
    const response = await apiActions?.get(
        `/api/v1/glaccounts/${reference}/`,
        token
    );
    return response?.data;
};


// Bulk Functions
export const bulkCreateGLAccounts = async (values, token) => {
    await apiActions?.post("/api/v1/glaccounts/bulk/create/", values, token);
};

export const bulkUploadGLAccounts = async (values, token) => {
    await apiMultipartActions?.post("/api/v1/glaccounts/bulk/upload/", values, token);
};

export const downloadGLAccountsTemplate = async (token) => {
    const config = { ...token, responseType: "blob" };
    const response = await apiActions?.get("/api/v1/glaccounts/bulk/template/", config);
    
    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "gl_accounts_bulk_template.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return response?.data;
};