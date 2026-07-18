"use client";

import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "../authentication/useAxiosAuth";
import { getGLAccount, getGLAccounts } from "@/services/glaccounts";

export function useFetchGLAccounts() {
    const token = useAxiosAuth();

    return useQuery({
        queryKey: ["glaccounts"],
        queryFn: () => getGLAccounts(token),
    });
}

export function useFetchGLAccount(reference) {
    const token = useAxiosAuth();

    return useQuery({
        queryKey: ["glaccount", reference],
        queryFn: () => getGLAccount(reference, token),
        enabled: !!reference,
    });
}
