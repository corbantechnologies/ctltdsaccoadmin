"use client";

import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "../authentication/useAxiosAuth";
import { getSaccoFinancialReport, getSaccoSummary } from "@/services/saccosummary";

export function useFetchSaccoSummary(year) {
  const token = useAxiosAuth();

  return useQuery({
    queryKey: ["saccoSummary", token, year],
    queryFn: () => getSaccoSummary(token, year),
    enabled: !!token,
  });
}


export function useFetchSaccoFinancialReport() {
  const token = useAxiosAuth();

  return useQuery({
    queryKey: ["saccoFinancialReport", token],
    queryFn: () => getSaccoFinancialReport(token),
    enabled: !!token,
  });
}
