"use client";

import { getLoanRepayment, getLoanRepayments } from "@/services/loanrepayments";
import useAxiosAuth from "../authentication/useAxiosAuth";
import { useQuery } from "@tanstack/react-query";

export function useFetchLoanRepayments() {
  const token = useAxiosAuth();

  return useQuery({
    queryKey: ["loanRepayments"],
    queryFn: () => getLoanRepayments(token),
  });
}

export function useFetchLoanRepaymentDetail(reference) {
  const token = useAxiosAuth();

  return useQuery({
    queryKey: ["loanRepayment", reference],
    queryFn: () => getLoanRepayment(reference, token),
    enabled: !!reference,
  });
}
