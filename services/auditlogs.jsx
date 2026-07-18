"use client";

import { apiActions } from "@/tools/axios";

// View all audit logs
export const getAuditLogs = async (token) => {
  const response = await apiActions?.get("/api/v1/auditlogs/", token);
  return response?.data?.results || [];
};
