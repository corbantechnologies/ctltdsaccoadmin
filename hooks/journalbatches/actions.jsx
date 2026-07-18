"use client";

import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "../authentication/useAxiosAuth";
import { getJournalBatches, getJournalBatch } from "@/services/journalbatches";

export function useFetchJournalBatches() {
    const token = useAxiosAuth();

    return useQuery({
        queryKey: ["journalbatches"],
        queryFn: () => getJournalBatches(token),
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
