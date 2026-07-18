"use client";

import { apiActions, apiMultipartActions } from "@/tools/axios";

// create
export const createVenturePayment = async (values, token) => {
  await apiActions?.post("/api/v1/venturepayments/", values, token);
};

export const getVenturePayments = async (token) => {
  const response = await apiActions?.get("/api/v1/venturepayments/", token);
  return response?.data?.results;
};

export const getVenturePayment = async (reference, token) => {
  const response = await apiActions?.get(
    `/api/v1/venturepayments/${reference}/`,
    token
  );
  return response?.data;
};

export const createBulkVenturePayments = async (formData, token) => {
  await apiMultipartActions?.post(
    "/api/v1/venturepayments/bulk/upload/",
    formData,
    token
  );
};
