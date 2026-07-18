"use client";

import { apiActions } from "@/tools/axios";

export const getVentures = async (token) => {
  const response = await apiActions?.get("/api/v1/ventureaccounts/", token);
  return response?.data?.results;
};

export const getVenture = async (reference, token) => {
  const response = await apiActions?.get(
    `/api/v1/ventureaccounts/${reference}/`,
    token
  );
  return response?.data;
};
