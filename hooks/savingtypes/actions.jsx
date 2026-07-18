"use client";

import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "../authentication/useAxiosAuth";
import { getSavingTypeDetail, getSavingTypes } from "@/services/savingtypes";

export function useFetchSavingsTypes() {
  const token = useAxiosAuth();

  return useQuery({
    queryKey: ["savingstypes"],
    queryFn: () => getSavingTypes(token),
  });
}

export function useFetchSavingsTypeDetail(reference) {
  const token = useAxiosAuth();

  return useQuery({
    queryKey: ["savingstype", reference],
    queryFn: () => getSavingTypeDetail(reference, token),
    enabled: !!reference,
  });
}
