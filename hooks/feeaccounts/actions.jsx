"use client";

import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "../authentication/useAxiosAuth";
import { getFeeAccounts, getFeeAccount } from "@/services/feeaccounts";

export function useFetchFeeAccounts() {
    const token = useAxiosAuth();

    return useQuery({
        queryKey: ["feeaccounts"],
        queryFn: () => getFeeAccounts(token),
    });
}

export function useFetchFeeAccount(reference) {
    const token = useAxiosAuth();

    return useQuery({
        queryKey: ["feeaccount", reference],
        queryFn: () => getFeeAccount(reference, token),
        enabled: !!reference,
    });
}
