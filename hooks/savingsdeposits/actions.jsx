"use client";

import {
  getSavingsDepositDetail,
  getSavingsDeposits,
  updateSavingsDeposit,
  bulkUpdateSavingsDepositsCSV,
  bulkUpdateSavingsDepositsJSON,
} from "@/services/savingsdeposits";
import useAxiosAuth from "../authentication/useAxiosAuth";
import { useQuery, useMutation } from "@tanstack/react-query";

export function useFetchSavingsDeposits() {
  const token = useAxiosAuth();

  return useQuery({
    queryKey: ["deposits"],
    queryFn: () => getSavingsDeposits(token),
  });
}

export function useFetchSavingsDepositDetail(reference) {
  const token = useAxiosAuth();
  return useQuery({
    queryKey: ["deposit", reference],
    queryFn: () => getSavingsDepositDetail(reference, token),
    enabled: !!reference,
  });
}

export function useUpdateSavingsDeposit() {
  const token = useAxiosAuth();
  return useMutation({
    mutationFn: (data) => updateSavingsDeposit(data, token),
  });
}

export function useBulkUpdateSavingsDepositsCSV() {
  const token = useAxiosAuth();
  return useMutation({
    mutationFn: (data) => bulkUpdateSavingsDepositsCSV(data, token),
  });
}

export function useBulkUpdateSavingsDepositsJSON() {
  const token = useAxiosAuth();
  return useMutation({
    mutationFn: (data) => bulkUpdateSavingsDepositsJSON(data, token),
  });
}
