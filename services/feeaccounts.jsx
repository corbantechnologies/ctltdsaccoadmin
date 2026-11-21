"use client";

import { apiActions, getAllPages } from "@/tools/axios";

// For all members
export const createFeeAccount = async (values, token) => {
    const response = await apiActions?.post("/api/v1/feeaccounts/", values, token);
    return response?.data;
};

export const getFeeAccounts = async (token) => {
    // Every page, so no fee account is silently left out once a SACCO passes
    // the API's page size.
    return getAllPages("/api/v1/feeaccounts/", token);
};

export const getFeeAccount = async (reference, token) => {
    const response = await apiActions?.get(`/api/v1/feeaccounts/${reference}/`, token);
    return response?.data;
};
