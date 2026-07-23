"use client";

import { apiActions } from "@/tools/axios";

export const getMemberSummary = async (memberNo, year, token) => {
  const url = year
    ? `/api/v1/transactions/summary/yearly/${memberNo}/?year=${year}`
    : `/api/v1/transactions/summary/yearly/${memberNo}/`;
  const response = await apiActions?.get(url, token);
  return response.data;
};

export const downloadMemberSummary = async (memberNo, year, token) => {
  const url = year
    ? `/api/v1/transactions/summary/yearly/${memberNo}/pdf/?year=${year}`
    : `/api/v1/transactions/summary/yearly/${memberNo}/pdf/`;
  const response = await apiActions?.get(
    url,
    { ...token, responseType: "blob" }
  );
  return response.data;
};
