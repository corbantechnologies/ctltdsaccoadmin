"use client";

import { apiActions } from "@/tools/axios";

// getting current year
const currentYear = new Date().getFullYear();

export const getSaccoSummary = async (token, year) => {
  const selectedYear = year || currentYear;
  const response = await apiActions?.get(
    `/api/v1/transactions/summary/sacco/yearly/?year=${selectedYear}`,
    token
  );
  return response.data;
};

export const downloadSaccoSummary = async (token, year) => {
  const selectedYear = year || currentYear;
  const response = await apiActions?.get(
    `/api/v1/transactions/summary/sacco/yearly/pdf/?year=${selectedYear}`,
    { ...token, responseType: "blob" }
  );
  return response.data;
};


export const getSaccoFinancialReport = async (token) => {
  const response = await apiActions?.get(
    `/api/v1/transactions/summary/sacco/reports/`,
    token,
  );
  return response.data;
};