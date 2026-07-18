"use client";

import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "../authentication/useAxiosAuth";
import {
  getVentureDeposit,
  getVentureDeposits,
} from "@/services/venturedeposits";

export function useFetchVentureDeposits() {
  const token = useAxiosAuth();

  return useQuery({
    queryKey: ["venturedeposits"],
    queryFn: () => getVentureDeposits(token),
  });
}

export function useFetchVentureDeposit(reference) {
  const token = useAxiosAuth();

  return useQuery({
    queryKey: ["venturedeposit", reference],
    queryFn: () => getVentureDeposit(reference, token),
    enabled: !!reference,
  });
}
