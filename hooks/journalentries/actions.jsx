"use client";

import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "../authentication/useAxiosAuth";
import { getJournalEntries, getJournalEntry } from "@/services/journalentries";

export function useFetchJournalEntries(params = {}) {
    const token = useAxiosAuth();

    return useQuery({
        queryKey: ["journalentries", params],
        queryFn: () => getJournalEntries(token, params),
    });
}

export function useFetchJournalEntry(reference) {
    const token = useAxiosAuth();

    return useQuery({
        queryKey: ["journalentry", reference],
        queryFn: () => getJournalEntry(reference, token),
        enabled: !!reference,
    });
}
