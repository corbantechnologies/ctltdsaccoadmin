"use client";

import { getAllPages, apiActions } from "@/tools/axios";


export const getLoans = async (token) => getAllPages("/api/v1/loanaccounts/", token);

export const getLoan = async (reference, token) => {
  const response = await apiActions?.get(`/api/v1/loanaccounts/${reference}/`, token);
  return response?.data;
};

export const getLoanPayOffAmount = async (reference, token) => {
  const response = await apiActions?.get(
    `/api/v1/loanaccounts/${reference}/payoff-quote/`,
    token
  );
  return response?.data;
};

// Admin creates a loan for a member
export const adminCreateLoanForMember = async (values, token) => {
  await apiActions?.post(`/api/v1/loanaccounts/`, values, token);
};


export const adjustSchedule = async (reference, values, token) => {
  const response = await apiActions?.post(
    `/api/v1/loanaccounts/${reference}/adjust-schedule/`,
    values,
    token
  );
  return response?.data;
};

export const resetLoanAccount = async (accountNumber, values, token) => {
  const response = await apiActions?.post(
    `/api/v1/loanaccounts/${accountNumber}/reset/`,
    values,
    token
  );
  return response?.data;
};

// Bad loans: arrears, guarantor recovery, write-off and recovery afterwards.
export const refreshArrears = async (token) =>
  (await apiActions.post("/api/v1/loanaccounts/refresh-arrears/", {}, token))?.data;

export const getGuarantorRecoveryPlan = async (reference, token) =>
  (await apiActions.get(`/api/v1/loanaccounts/${reference}/guarantor-recovery/`, token))?.data;

export const recoverFromGuarantors = async (reference, values, token) =>
  (await apiActions.post(`/api/v1/loanaccounts/${reference}/guarantor-recovery/`, values, token))?.data;

export const writeOffLoan = async (reference, values, token) =>
  (await apiActions.post(`/api/v1/loanaccounts/${reference}/write-off/`, values, token))?.data;

export const recordWrittenOffRecovery = async (reference, values, token) =>
  (await apiActions.post(`/api/v1/loanaccounts/${reference}/recovery/`, values, token))?.data;

export const getLoanRecoveryEvents = async (reference, token) =>
  (await apiActions.get(`/api/v1/loanaccounts/${reference}/recovery-events/`, token))?.data;
