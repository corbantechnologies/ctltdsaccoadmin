"use client";

import { apiActions, apiMultipartActions } from "@/tools/axios";

// Onboarding existing loans. Every endpoint is SACCO-admin only.
// `token` is the config from useAxiosAuth().

export const ONBOARDING_ENDPOINTS = {
  // Methods 1 and 2 share the loan application upload. Method 2 fills the
  // optional Cut-off Date and Total Paid To Date columns.
  original: {
    template: "/api/v1/loanapplications/admin/bulk/template/",
    upload: "/api/v1/loanapplications/admin/bulk/upload/",
    filename: "existing_loans_template.csv",
  },
  balanceForward: {
    template: "/api/v1/loanapplications/admin/balance-forward/template/",
    upload: "/api/v1/loanapplications/admin/balance-forward/upload/",
    filename: "loan_balance_forward_template.csv",
  },
};

export const downloadTemplate = async (kind, token) => {
  const { template, filename } = ONBOARDING_ENDPOINTS[kind];
  const response = await apiActions.get(template, { ...token, responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// dryRun=true checks every row and returns the results without saving.
export const uploadLoans = async (kind, file, dryRun, token) => {
  const form = new FormData();
  form.append("file", file);
  const url = `${ONBOARDING_ENDPOINTS[kind].upload}${dryRun ? "?dry_run=true" : ""}`;
  const response = await apiMultipartActions.post(url, form, token);
  return response?.data;
};

export const getLoanOpeningPreview = async (token) =>
  (await apiActions.get("/api/v1/accounting/opening-balances/loans/", token))?.data;

export const postLoanOpeningBalances = async (values, token) =>
  (await apiActions.post("/api/v1/accounting/opening-balances/loans/", values, token))?.data;

export const removeOnboardedLoan = async (reference, token) =>
  (await apiActions.post(`/api/v1/loanaccounts/${reference}/remove-onboarded/`, {}, token))?.data;
