"use client";
import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "../authentication/useAxiosAuth";
import { getSaving, getSavings } from "@/services/savings";
import { useSession } from "next-auth/react";

export function useFetchSavings() {
  const token = useAxiosAuth();
  const { data: session } = useSession();
  const isTokenReady = !!session?.user?.token;

  return useQuery({
    queryKey: ["savings"],
    queryFn: () => getSavings(token),
    enabled: isTokenReady,
  });
}

export function useFetchSavingDetail(reference) {
  const token = useAxiosAuth();

  return useQuery({
    queryKey: ["saving", reference],
    queryFn: () => getSaving(reference, token),
    enabled: !!reference,
  });
}
