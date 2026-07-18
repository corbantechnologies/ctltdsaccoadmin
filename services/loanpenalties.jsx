"use client";

import { apiActions, apiMultipartActions } from "@/tools/axios";

// SACCO Admins
export const createLoanPenalty = async (values, token) => {
    const response = await apiActions?.post(
        "/api/v1/loanpenalties/",
        values,
        token
    );
    return response?.data;
};

export const updateLoanPenalty = async (reference, values, token) => {
    const response = await apiActions?.patch(
        `/api/v1/loanpenalties/${reference}/`,
        values,
        token
    );
    return response?.data;
};

// Members
export const getLoanPenalties = async (token, params = {}) => {
    const response = await apiActions?.get("/api/v1/loanpenalties/", {
        ...token,
        params,
    });
    return response?.data?.results;
};

export const getLoanPenalty = async (reference, token) => {
    const response = await apiActions?.get(
        `/api/v1/loanpenalties/${reference}/`,
        token
    );
    return response?.data;
};

