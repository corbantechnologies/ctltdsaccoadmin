"use client";

import { apiActions, apiMultipartActions } from "@/tools/axios";

// create
export const createJournalEntry = async (values, token) => {
    await apiActions?.post("/api/v1/journalentries/", values, token);
};

// update
export const updateJournalEntry = async (reference, values, token) => {
    const response = await apiActions?.patch(
        `/api/v1/journalentries/${reference}/`,
        values,
        token
    );
    return response?.data;
};

export const getJournalEntries = async (token, params = {}) => {
    const response = await apiActions?.get("/api/v1/journalentries/", {
        headers: { Authorization: `Bearer ${token}` }, // Axios instance might not have it set, but useAxiosAuth handles it usually
        params
    });
    // Wait, let's check how apiActions is used in other services
    return response?.data;
};

export const getJournalEntry = async (reference, token) => {
    const response = await apiActions?.get(
        `/api/v1/journalentries/${reference}/`,
        token
    );
    return response?.data;
};
