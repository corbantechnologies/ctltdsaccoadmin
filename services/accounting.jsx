"use client";

import { apiActions } from "@/tools/axios";

// All endpoints are SACCO-admin only. `token` is the config from useAxiosAuth().
const BASE = "/api/v1/accounting";

const get = async (url, token, params) => {
  const response = await apiActions?.get(url, { ...token, params });
  return response?.data;
};
const post = async (url, values, token) => {
  const response = await apiActions?.post(url, values, token);
  return response?.data;
};

// Setup and settings
export const setupAccounting = (values, token) => post(`${BASE}/setup/`, values, token);
export const getAccountingSettings = (token) => get(`${BASE}/settings/`, token);
export const updateAccountingSettings = async (values, token) => {
  const response = await apiActions?.patch(`${BASE}/settings/`, values, token);
  return response?.data;
};

// Periods
export const getPeriods = async (token) => (await get(`${BASE}/periods/`, token))?.results;
export const closePeriod = (values, token) => post(`${BASE}/periods/close/`, values, token);
export const reopenPeriod = (reference, values, token) =>
  post(`${BASE}/periods/${reference}/reopen/`, values, token);

// Suspense
export const getSuspenseEntries = async (status, token) =>
  (await get(`${BASE}/suspense/`, token, status ? { status } : {}))?.results;
export const recordUnmatchedReceipt = (values, token) => post(`${BASE}/suspense/receipt/`, values, token);
export const allocateSuspense = (reference, values, token) =>
  post(`${BASE}/suspense/${reference}/allocate/`, values, token);

// Accrual, ageing, provisioning
export const getAccrualRuns = async (token) => (await get(`${BASE}/accruals/`, token))?.results;
export const runAccrual = (values, token) => post(`${BASE}/accruals/`, values, token);
export const getAgeing = (asOf, token) => get(`${BASE}/ageing/`, token, asOf ? { as_of: asOf } : {});
export const getProvisionRuns = async (token) => (await get(`${BASE}/provisions/`, token))?.results;
export const runProvisioning = (values, token) => post(`${BASE}/provisions/`, values, token);

// Dividends
export const getDividends = async (token) => (await get(`${BASE}/dividends/`, token))?.results;
export const getDividend = (reference, token) => get(`${BASE}/dividends/${reference}/`, token);
export const getDividendLines = async (reference, token) =>
  (await get(`${BASE}/dividends/${reference}/lines/`, token))?.results;
export const createDividend = (values, token) => post(`${BASE}/dividends/`, values, token);
export const dividendAction = (reference, action, token) =>
  post(`${BASE}/dividends/${reference}/${action}/`, {}, token);

// Opening balances and reconciliation
export const postGLOpeningBalances = (values, token) => post(`${BASE}/opening-balances/gl/`, values, token);
export const postSavingsOpeningBalances = (values, token) =>
  post(`${BASE}/opening-balances/savings/`, values, token);
export const getReconciliation = (asOf, token) =>
  get(`${BASE}/reconciliation/`, token, asOf ? { as_of: asOf } : {});
