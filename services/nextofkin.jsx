"use client";

import { apiActions } from "@/tools/axios";

export const createNextOfKin = async (values, auth) => {
  await apiActions?.post("/api/v1/nextofkin/", values, auth);
};

export const getNextOfKins = async (auth) => {
  const response = await apiActions?.get("/api/v1/nextofkin/", auth);
  return response?.data?.results;
};

export const getNextOfKin = async (reference, auth) => {
  const response = await apiActions?.get(
    `/api/v1/nextofkin/${reference}/`,
    auth
  );
  return response?.data;
};

export const updateNextOfKin = async (reference, formData, auth) => {
  const response = await apiActions?.patch(
    `/api/v1/nextofkin/${reference}/`,
    formData,
    auth
  );
  return response?.data;
};

export const deleteNextOfKin = async (reference, auth) => {
  const response = await apiActions?.delete(
    `/api/v1/nextofkin/${reference}/`,
    auth
  );
  return response?.data;
};
