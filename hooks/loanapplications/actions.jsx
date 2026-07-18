"use client"

import { useQuery } from "@tanstack/react-query"
import useAxiosAuth from "../authentication/useAxiosAuth"
import { getLoanApplications, getLoanApplicationDetail } from "@/services/loanapplications"


export function useFetchLoanApplications() {
    const token = useAxiosAuth()

    return useQuery({
        queryKey: ["loanapplications"],
        queryFn: () => getLoanApplications(token),
        enabled: !!token,
    })
}

export function useFetchLoanApplicationDetail(reference) {
    const token = useAxiosAuth()

    return useQuery({
        queryKey: ["loanapplication", reference],
        queryFn: () => getLoanApplicationDetail(reference, token),
        enabled: !!token && !!reference
    })
}
