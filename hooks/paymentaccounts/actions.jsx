"use client";

import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "../authentication/useAxiosAuth";
import { getPaymentAccount, getPaymentAccounts } from "@/services/paymentaccounts";
import { useSession } from "next-auth/react";

export function useFetchPaymentAccounts() {
    const token = useAxiosAuth();
    const { data: session } = useSession();
    const isTokenReady = !!session?.user?.token;

    return useQuery({
        queryKey: ["paymentaccounts"],
        queryFn: () => getPaymentAccounts(token),
        enabled: isTokenReady,
    });
}

export function useFetchPaymentAccount(reference) {
    const token = useAxiosAuth();

    return useQuery({
        queryKey: ["paymentaccount", reference],
        queryFn: () => getPaymentAccount(reference, token),
        enabled: !!reference,
    });
}
