"use client";

import { getAccountsList } from "@/services/transactions";
import useAxiosAuth from "../authentication/useAxiosAuth";
import { useQuery } from "@tanstack/react-query";

export function useFetchAccountsList() {
  const token = useAxiosAuth();

  return useQuery({
    queryKey: ["accountsList"],
    queryFn: () => getAccountsList(token),
    enabled: !!token,
  });
}
