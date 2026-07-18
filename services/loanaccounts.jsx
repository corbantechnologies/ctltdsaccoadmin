"use client";

import { apiActions } from "@/tools/axios";


export const getLoans = async (token) => {
  const response = await apiActions?.get("/api/v1/loanaccounts/", token);
  return response?.data?.results;
};

export const getLoan = async (reference, token) => {
  const response = await apiActions?.get(`/api/v1/loanaccounts/${reference}/`, token);
  return response?.data;
};

export const getLoanPayOffAmount = async (reference, token) => {
  const response = await apiActions?.get(
    `/api/v1/loanaccounts/${reference}/payoff-quote/`,
    token
  );
  return response?.data;
};

// Admin creates a loan for a member
export const adminCreateLoanForMember = async (values, token) => {
  await apiActions?.post(`/api/v1/loanaccounts/`, values, token);
};
