"use client";

import { apiActions } from "@/tools/axios";

export const getReversals = async (token, params = {}) => {
  const response = await apiActions?.get("/api/v1/reversals/", {
    ...token,
    params,
  });
  return response?.data?.results;
};

export const reverseLoanPayment = async (reference, values, token) => {
  const response = await apiActions?.post(
    `/api/v1/reversals/loan-payment/${reference}/`,
    values,
    token
  );
  return response?.data;
};

export const reverseSavingsDeposit = async (reference, values, token) => {
  const response = await apiActions?.post(
    `/api/v1/reversals/savings-deposit/${reference}/`,
    values,
    token
  );
  return response?.data;
};

export const reverseFeePayment = async (reference, values, token) => {
  const response = await apiActions?.post(
    `/api/v1/reversals/fee-payment/${reference}/`,
    values,
    token
  );
  return response?.data;
};
