"use client";

import { getVentureTypeDetail, getVentureTypes } from "@/services/venturetypes";
import useAxiosAuth from "../authentication/useAxiosAuth";
import { useQuery } from "@tanstack/react-query";

export function useFetchVentureTypes() {
  const token = useAxiosAuth();

  return useQuery({
    queryKey: ["venturetypes"],
    queryFn: () => getVentureTypes(),
  });
}

export function useFetchVentureTypeDetail(reference) {
  const token = useAxiosAuth();

  return useQuery({
    queryKey: ["venturetype", reference],
    queryFn: () => getVentureTypeDetail(reference, token),
    enabled: !!reference,
  });
}
