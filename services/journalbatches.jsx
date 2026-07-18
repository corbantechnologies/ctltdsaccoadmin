"use client";

import { apiActions, apiMultipartActions } from "@/tools/axios";

// create
export const createJournalBatch = async (values, token) => {
    await apiActions?.post("/api/v1/journalbatches/", values, token);
};

// update
export const updateJournalBatch = async (reference, values, token) => {
    const response = await apiActions?.patch(
        `/api/v1/journalbatches/${reference}/`,
        values,
        token
    );
    return response?.data;
};

// post journal
export const postJournalBatch = async (reference, token) => {
    const response = await apiActions?.patch(

        `/api/v1/journalbatches/${reference}/`,
        { posted: true },
        token
    );
    return response?.data;
};

export const getJournalBatches = async (token) => {
    const response = await apiActions?.get("/api/v1/journalbatches/", token);
    return response?.data?.results;
};

export const getJournalBatch = async (reference, token) => {
    const response = await apiActions?.get(
        `/api/v1/journalbatches/${reference}/`,
        token
    );
    return response?.data;
};

// Bulk Functions
export const bulkCreateJournalBatches = async (values, token) => {
    await apiActions?.post("/api/v1/journalbatches/bulk/create/", values, token);
};

export const bulkUploadJournalBatches = async (values, token) => {
    await apiMultipartActions?.post("/api/v1/journalbatches/bulk/upload/", values, token);
};

export const downloadJournalBatchesTemplate = async (token) => {
    const config = { ...token, responseType: "blob" };
    const response = await apiActions?.get("/api/v1/journalbatches/bulk/template/", config);

    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "journalbatches_bulk_template.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();

    return response?.data;
};