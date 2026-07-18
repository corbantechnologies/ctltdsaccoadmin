"use client";

import { apiActions } from "@/tools/axios";

// For all members
export const createFeeAccount = async (values, token) => {
    const response = await apiActions?.post("/api/v1/feeaccounts/", values, token);
    return response?.data;
};

export const getFeeAccounts = async (token) => {
    const response = await apiActions?.get("/api/v1/feeaccounts/", token);
    return response?.data?.results;
};

export const getFeeAccount = async (reference, token) => {
    const response = await apiActions?.get(`/api/v1/feeaccounts/${reference}/`, token);
    return response?.data;
};
