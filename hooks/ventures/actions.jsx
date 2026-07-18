"use client";

import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "../authentication/useAxiosAuth";
import { getVenture, getVentures } from "@/services/ventures";

export function useFetchVentures() {
  const token = useAxiosAuth();

  return useQuery({
    queryKey: ["ventures"],
    queryFn: () => getVentures(token),
  });
}

export function useFetchVentureDetail(reference) {
  const token = useAxiosAuth();

  return useQuery({
    queryKey: ["venture", reference],
    queryFn: () => getVenture(reference, token),
    enabled: !!reference,
  });
}
