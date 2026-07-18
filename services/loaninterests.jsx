"use client";

import { apiMultipartActions } from "@/tools/axios";

export const createBulkInterest = async (formData, token) => {
  await apiMultipartActions?.post(
    "/api/v1/tamarindloaninterests/bulk/upload/",
    formData,
    token
  );
};
