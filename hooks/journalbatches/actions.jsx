"use client";

import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "../authentication/useAxiosAuth";
import { getJournalBatches, getJournalBatch } from "@/services/journalbatches";

export function useFetchJournalBatches(params = {}) {
    const token = useAxiosAuth();

    return useQuery({
        queryKey: ["journalbatches", params],
        queryFn: () => getJournalBatches(token, params),
    });
}

export function useFetchJournalBatch(reference) {
    const token = useAxiosAuth();

    return useQuery({
        queryKey: ["journalbatch", reference],
        queryFn: () => getJournalBatch(reference, token),
        enabled: !!reference,
    });
}
