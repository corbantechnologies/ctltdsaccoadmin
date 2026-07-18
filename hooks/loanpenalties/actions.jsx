"use client";

import { getLoanPenalty, getLoanPenalties } from "@/services/loanpenalties";
import useAxiosAuth from "../authentication/useAxiosAuth";
import { useQuery } from "@tanstack/react-query";

export function useFetchLoanPenalties() {
    const token = useAxiosAuth();

    return useQuery({
        queryKey: ["loanPenalties"],
        queryFn: () => getLoanPenalties(token),
    });
}

export function useFetchLoanPenaltiesByLoanAccountReference(loanReference) {
    const token = useAxiosAuth();

    return useQuery({
        queryKey: ["loanPenalties", loanReference],
        queryFn: () => getLoanPenalties(token, { loan_account__reference: loanReference }),
        enabled: !!loanReference,
    });
}

export function useFetchLoanPenaltiesByLoanAccountNumber(loanAccountNumber) {
    const token = useAxiosAuth();

    return useQuery({
        queryKey: ["loanPenalties", loanAccountNumber],
        queryFn: () => getLoanPenalties(token, { loan_account__account_number: loanAccountNumber }),
        enabled: !!loanAccountNumber,
    });
}


export function useFetchLoanPenaltyDetail(reference) {
    const token = useAxiosAuth();

    return useQuery({
        queryKey: ["loanPenalty", reference],
        queryFn: () => getLoanPenalty(reference, token),
        enabled: !!reference,
    });
}
