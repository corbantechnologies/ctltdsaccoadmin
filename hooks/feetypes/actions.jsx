"use client";

import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "../authentication/useAxiosAuth";
import { getFeeTypes, getFeeTypeDetail } from "@/services/feetypes";

export function useFetchFeeTypes() {
    const token = useAxiosAuth();

    return useQuery({
        queryKey: ["feetypes"],
        queryFn: () => getFeeTypes(token),
    });
}

export function useFetchFeeType(reference) {
    const token = useAxiosAuth();

    return useQuery({
        queryKey: ["feetype", reference],
        queryFn: () => getFeeTypeDetail(reference, token),
        enabled: !!reference,
    });
}
