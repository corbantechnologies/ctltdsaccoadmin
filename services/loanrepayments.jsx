"use client";

import { apiActions, apiMultipartActions } from "@/tools/axios";

// SACCO Admins
export const createLoanRepayment = async (values, token) => {
  const response = await apiActions?.post(
    "/api/v1/loanpayments/",
    values,
    token
  );
  return response?.data;
};

export const getLoanRepayments = async (token) => {
  const response = await apiActions?.get("/api/v1/loanpayments/", token);
  return response?.data?.results;
};

export const getLoanRepayment = async (reference, token) => {
  const response = await apiActions?.get(
    `/api/v1/loanpayments/${reference}/`,
    token
  );
  return response?.data;
};

export const createBulkLoanRepayment = async (values, token) => {
  await apiMultipartActions?.post(
    "/api/v1/loanpayments/bulk/upload/",
    values,
    token
  );
};

// MPesa
export const createLoanRepaymentMpesa = async (values, token) => {
  const response = await apiActions?.post(
    "/api/v1/loanpayments/list/mpesa/",
    values,
    token
  );
  return response?.data;
};

export const getMpesaLoanPayment = async (reference, token) => {
  const response = await apiActions?.get(
    `/api/v1/loanpayments/list/mpesa/${reference}/`,
    token
  );
  return response?.data;
};
