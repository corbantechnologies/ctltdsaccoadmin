"use client";

import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "../authentication/useAxiosAuth";
import {
  getVenturePayment,
  getVenturePayments,
} from "@/services/venturepayments";

export function useFetchVenturePayments() {
  const token = useAxiosAuth();

  return useQuery({
    queryKey: ["venturepayments"],
    queryFn: () => getVenturePayments(token),
  });
}

export function useFetchVenturePayment(reference) {
  const token = useAxiosAuth();

  return useQuery({
    queryKey: ["venturepayment", reference],
    queryFn: () => getVenturePayment(reference, token),
    enabled: !!reference,
  });
}
