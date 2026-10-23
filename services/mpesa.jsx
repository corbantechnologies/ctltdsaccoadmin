"use client";

import { apiActions } from "@/tools/axios";

// `token` is the auth config from useAxiosAuth(). The STK push endpoints
// require a signed-in member.
export const generateDepositSTKPush = async (payload, token) => {
  const response = await apiActions.post("/api/v1/mpesa/pay/", payload, token);
  return response.data;
};

export const generateLoanSTKPush = async (payload, token) => {
  const response = await apiActions.post("/api/v1/mpesa/pay/loan/member/", payload, token);
  return response.data;
};
