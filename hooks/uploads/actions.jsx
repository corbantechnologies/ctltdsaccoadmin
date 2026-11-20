"use client";

import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "../authentication/useAxiosAuth";
import { getUpload, getUploads } from "@/services/uploads";

export function useFetchUploads(filters) {
  const token = useAxiosAuth();
  return useQuery({
    queryKey: ["uploads", token, filters],
    queryFn: () => getUploads(token, filters),
    enabled: !!token,
  });
}

export function useFetchUpload(reference) {
  const token = useAxiosAuth();
  return useQuery({
    queryKey: ["upload", token, reference],
    queryFn: () => getUpload(token, reference),
    enabled: !!token && !!reference,
  });
}
