"use client";

import { apiActions } from "@/tools/axios";

export const createGuaranteeRequest = async (values, token) => {
  // guarantor
  // loan_application
  await apiActions?.post("/api/v1/guaranteerequests/", values, token);
};

export const getGuaranteeRequests = async (token) => {
  await apiActions?.get("/api/v1/guaranteerequests/", token);
};

export const getGuaranteeRequest = async (id, token) => {
  await apiActions?.get(`api/v1/guaranteerequests/${id}/`, token);
};

export const updateGuaranteeRequest = async (reference, values, token) => {
  // update status 2 options:
  // 1. Declined
  // 3. Accepted and inputs the amount they wish to guarantee
  // Values: status, guaranteed_amount
  await apiActions?.patch(
    `api/v1/guaranteerequests/${reference}/status/`,
    values,
    token
  );
};
