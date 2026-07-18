"use client";

import { apiActions } from "@/tools/axios";

export const getMemberSummary = async (memberNo, token) => {
  const response = await apiActions?.get(
    `/api/v1/transactions/summary/yearly/${memberNo}/`,
    token
  );
  return response.data;
};

export const downloadMemberSummary = async (memberNo, token) => {
  const response = await apiActions?.get(
    `/api/v1/transactions/summary/yearly/${memberNo}/pdf/`,
    { ...token, responseType: "blob" }
  );
  return response.data;
};
