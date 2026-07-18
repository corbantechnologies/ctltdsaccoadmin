"use client";

import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "../authentication/useAxiosAuth";
import { getFeePayments, getFeePayment } from "@/services/feepayments";

export function useFetchFeePayments() {
    const token = useAxiosAuth();

    return useQuery({
        queryKey: ["feepayments"],
        queryFn: () => getFeePayments(token),
    });
}

export function useFetchFeePayment(reference) {
    const token = useAxiosAuth();

    return useQuery({
        queryKey: ["feepayment", reference],
        queryFn: () => getFeePayment(reference, token),
        enabled: !!reference,
    });
}
