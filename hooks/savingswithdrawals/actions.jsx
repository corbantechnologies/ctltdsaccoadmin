"use client";

import {
  getSavingsWithdrawal,
  getSavingsWithdrawals,
  getMyWithdrawals,
} from "@/services/savingswithdrawals";
import useAxiosAuth from "../authentication/useAxiosAuth";
import { useQuery } from "@tanstack/react-query";

export function useFetchSavingsWithdrawals(enabled = true) {
  const token = useAxiosAuth();

  return useQuery({
    queryKey: ["withdrawals"],
    queryFn: () => getSavingsWithdrawals(token),
    enabled: !!enabled,
  });
}

export function useFetchSavingsWithdrawal(reference) {
  const token = useAxiosAuth();

  return useQuery({
    queryKey: ["withdrawal", reference],
    queryFn: () => getSavingsWithdrawal(reference, token),
    enabled: !!reference,
  });
}

export function useFetchMyWithdrawals(enabled = true) {
  const token = useAxiosAuth();

  return useQuery({
    queryKey: ["my-withdrawals"],
    queryFn: () => getMyWithdrawals(token),
    enabled: !!enabled,
  });
}
