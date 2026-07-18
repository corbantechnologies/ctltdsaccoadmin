"use client";

import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "../authentication/useAxiosAuth";
import { getTrialBalance, getBalanceSheet, getPnL, getCashBook, getDebtors } from "@/services/financials";

export function useFetchTrialBalance(asOfDate) {
    const token = useAxiosAuth();

    return useQuery({
        queryKey: ["trial-balance", asOfDate],
        queryFn: () => getTrialBalance(token, asOfDate),
    });
}

export function useFetchBalanceSheet(asOfDate) {
    const token = useAxiosAuth();

    return useQuery({
        queryKey: ["balance-sheet", asOfDate],
        queryFn: () => getBalanceSheet(token, asOfDate),
    });
}

export function useFetchPnL(startDate, endDate) {
    const token = useAxiosAuth();

    return useQuery({
        queryKey: ["pnl", startDate, endDate],
        queryFn: () => getPnL(token, startDate, endDate),
    });
}

export function useFetchCashBook(asOfDate) {
    const token = useAxiosAuth();

    return useQuery({
        queryKey: ["cash-book", asOfDate],
        queryFn: () => getCashBook(token, asOfDate),
    });
}

export function useFetchDebtors() {
    const token = useAxiosAuth();

    return useQuery({
        queryKey: ["debtors"],
        queryFn: () => getDebtors(token),
    });
}
