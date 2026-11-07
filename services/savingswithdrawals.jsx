"use client";

import { apiActions } from "@/tools/axios";

export const createSavingsWithdrawals = async (values, token) => {
  const response = await apiActions?.post("/api/v1/savingswithdrawals/", values, token);
  return response?.data;
};

// How much can be withdrawn from an account right now (balance less pending
// requests, guarantee commitments and non-withdrawable saving types).
export const getWithdrawableAmount = async (accountNumber, token) => {
  const response = await apiActions?.get(
    `/api/v1/savingswithdrawals/available/${accountNumber}/`,
    token
  );
  return response?.data;
};

export const getSavingsWithdrawals = async (token) => {
  const response = await apiActions?.get("/api/v1/savingswithdrawals/", token);
  return response?.data?.results;
};

export const getSavingsWithdrawal = async (reference, token) => {
  const response = await apiActions?.get(
    `/api/v1/savingswithdrawals/${reference}/`,
    token
  );
  return response?.data;
};

// SACCO Admins
export const updateWithdrawal = async (identity, values, token) => {
  const response = await apiActions?.patch(
    `/api/v1/savingswithdrawals/${identity}/update/`,
    values,
    token
  );
  return response?.data;
};

// The signed-in admin's own withdrawals, as a member (Personal pages).
export const getMyWithdrawals = async (token) => {
  const response = await apiActions?.get("/api/v1/savingswithdrawals/", {
    ...token,
    params: { ...(token?.params || {}), portal: "member", page_size: 1000 },
  });
  return response?.data?.results || [];
};
