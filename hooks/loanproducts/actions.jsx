"use client";

import { getLoanProductDetail, getLoanProducts } from "@/services/loanproducts";
import useAxiosAuth from "../authentication/useAxiosAuth";
import { useQuery } from "@tanstack/react-query";

export function useFetchLoanProducts() {
  const token = useAxiosAuth();

  return useQuery({
    queryKey: ["loanProducts"],
    queryFn: () => getLoanProducts(token),
  });
}

export function useFetchLoanProductDetail(reference) {
  const token = useAxiosAuth();

  return useQuery({
    queryKey: ["loanProduct", reference],
    queryFn: () => getLoanProductDetail(reference, token),
    enabled: !!reference,
  });
}
