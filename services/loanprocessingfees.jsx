"use client";

import { apiActions } from "@/tools/axios";

// SACCO Admins
export const getLoanProcessingFees = async (token, params = {}) => {
    const response = await apiActions?.get("/api/v1/loanprocessingfees/", {
        ...token,
        params,
    });
    return response?.data?.results;
};

export const getLoanProcessingFee = async (reference, token) => {
    const response = await apiActions?.get(
        `/api/v1/loanprocessingfees/${reference}/`,
        token
    );
    return response?.data;
};

export const updateLoanProcessingFee = async (reference, values, token) => {
    const response = await apiActions?.patch(
        `/api/v1/loanprocessingfees/${reference}/`,
        values,
        token
    );
    return response?.data;
};
