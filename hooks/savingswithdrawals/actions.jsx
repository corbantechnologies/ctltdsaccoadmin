"use client";

import {
  getSavingsWithdrawal,
  getSavingsWithdrawals,
} from "@/services/savingswithdrawals";
import useAxiosAuth from "../authentication/useAxiosAuth";
import { useQuery } from "@tanstack/react-query";

export function useFetchSavingsWithdrawals() {
  const token = useAxiosAuth();

  return useQuery({
    queryKey: ["withdrawals"],
    queryFn: () => getSavingsWithdrawals(token),
  });
}

export function useFetchSavingsWithdrawal() {
  const token = useAxiosAuth();

  return useQuery({
    queryKey: ["withdrawal", reference],
    queryFn: () => getSavingsWithdrawal(reference, token),
    enabled: !!reference,
  });
}
