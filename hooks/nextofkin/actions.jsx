"use client";

import { getNextOfKin, getNextOfKins } from "@/services/nextofkin";
import useAxiosAuth from "../authentication/useAxiosAuth";
import { useQuery } from "@tanstack/react-query";

export function useFetchNextOfKins() {
  const auth = useAxiosAuth();

  return useQuery({
    queryKey: ["nextofkins"],
    queryFn: () => getNextOfKins(auth),
  });
}

export function useFetchNextOfKin(reference) {
  const auth = useAxiosAuth();

  return useQuery({
    queryKey: ["nextofkin", reference],
    queryFn: () => getNextOfKin(reference, auth),
    enabled: !!reference,
  });
}
