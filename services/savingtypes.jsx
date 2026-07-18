"use client";

import { apiActions } from "@/tools/axios";

// SACCO ADMINS
// create saving type
export const createSavingType = async (values, token) => {
  await apiActions?.post("/api/v1/savingtypes/", values, token);
};

// get saving types
export const getSavingTypes = async (token) => {
  const response = await apiActions?.get("/api/v1/savingtypes/", token);
  return response?.data?.results;
};

// get saving type detail by reference
export const getSavingTypeDetail = async (reference, token) => {
  const response = await apiActions?.get(
    `/api/v1/savingtypes/${reference}/`,
    token
  );
  return response?.data;
};

// update saving type: to be used rarely
export const updateSavingType = async (reference, formData, token) => {
  const response = await apiActions?.patch(
    `/api/v1/savingtypes/${reference}/`,
    formData,
    token
  );
  return response?.data;
};

// Bulk Functions
export const bulkCreateSavingTypes = async (values, token) => {
    await apiActions?.post("/api/v1/savingtypes/bulk/create/", values, token);
};

export const bulkUploadSavingTypes = async (values, token) => {
    await apiMultipartActions?.post("/api/v1/savingtypes/bulk/upload/", values, token);
};

export const downloadSavingTypesTemplate = async (token) => {
    const config = { ...token, responseType: "blob" };
    const response = await apiActions?.get("/api/v1/savingtypes/bulk/template/", config);

    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "saving_types_bulk_template.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();

    return response?.data;
};  