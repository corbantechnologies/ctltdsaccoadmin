"use client";

import { apiActions } from "@/tools/axios";

export const getLoanTopUps = async (token, params = {}) => {
  const response = await apiActions?.get("/api/v1/loantopups/", {
    ...token,
    params,
  });
  return response?.data?.results;
};

export const getLoanTopUp = async (reference, token) => {
  const response = await apiActions?.get(`/api/v1/loantopups/${reference}/`, token);
  return response?.data;
};

export const createLoanTopUp = async (values, token) => {
  const response = await apiActions?.post("/api/v1/loantopups/", values, token);
  return response?.data;
};

export const disburseLoanTopUp = async (reference, values, token) => {
  const response = await apiActions?.post(
    `/api/v1/loantopups/${reference}/disburse/`,
    values,
    token
  );
  return response?.data;
};

export const rejectLoanTopUp = async (reference, token) => {
  const response = await apiActions?.post(
    `/api/v1/loantopups/${reference}/reject/`,
    {},
    token
  );
  return response?.data;
};
