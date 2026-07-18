"use client";

import { apiActions, apiMultipartActions } from "@/tools/axios";

export const getTrialBalance = async (token, asOfDate) => {
    const url = asOfDate ? `/api/v1/financials/trial-balance/?as_of_date=${asOfDate}` : "/api/v1/financials/trial-balance/";
    const response = await apiActions?.get(url, token);
    return response?.data;
};

export const getBalanceSheet = async (token, asOfDate) => {
    const url = asOfDate ? `/api/v1/financials/balance-sheet/?as_of_date=${asOfDate}` : "/api/v1/financials/balance-sheet/";
    const response = await apiActions?.get(url, token);
    return response?.data;
};

export const getPnL = async (token, startDate, endDate) => {
    let url = "/api/v1/financials/pnl/";
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await apiActions?.get(url, token);
    return response?.data;
};

export const getCashBook = async (token, asOfDate) => {
    const url = asOfDate ? `/api/v1/financials/cash-balance/?as_of_date=${asOfDate}` : "/api/v1/financials/cash-balance/";
    const response = await apiActions?.get(url, token);
    return response?.data;
};

export const getDebtors = async (token) => {
    const response = await apiActions?.get("/api/v1/financials/debtors/", token);
    return response?.data;
};