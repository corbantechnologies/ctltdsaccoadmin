"use client";

import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "../authentication/useAxiosAuth";
import {
  getGuaranteeRequests,
  getGuaranteeRequest,
} from "@/services/guaranteerequests";

export function useFetchGuaranteeRequests() {
  const token = useAxiosAuth();

  return useQuery({
    queryKey: ["guarantee-requests"],
    queryFn: () => getGuaranteeRequests(token),
    enabled: !!token,
  });
}

export function useFetchGuaranteeRequest(reference) {
  const token = useAxiosAuth();

  return useQuery({
    queryKey: ["guarantee-request", reference],
    queryFn: () => getGuaranteeRequest(reference, token),
    enabled: !!token,
  });
}
