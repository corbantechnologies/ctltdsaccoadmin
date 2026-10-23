"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useAxiosAuth from "../authentication/useAxiosAuth";
import {
  getAccountingSettings,
  getAccrualRuns,
  getAgeing,
  getDividend,
  getDividendLines,
  getDividends,
  getPeriods,
  getProvisionRuns,
  getReconciliation,
  getSuspenseEntries,
} from "@/services/accounting";

function useAuthedQuery(key, fn, extra = {}) {
  const token = useAxiosAuth();
  const { data: session } = useSession();
  return useQuery({
    queryKey: key,
    queryFn: () => fn(token),
    enabled: !!session?.user?.token && (extra.enabled ?? true),
  });
}

export const useFetchAccountingSettings = () =>
  useAuthedQuery(["accounting-settings"], getAccountingSettings);
export const useFetchPeriods = () => useAuthedQuery(["accounting-periods"], getPeriods);
export const useFetchSuspense = (status) =>
  useAuthedQuery(["suspense", status], (t) => getSuspenseEntries(status, t));
export const useFetchAccrualRuns = () => useAuthedQuery(["accrual-runs"], getAccrualRuns);
export const useFetchProvisionRuns = () => useAuthedQuery(["provision-runs"], getProvisionRuns);
export const useFetchAgeing = (asOf) => useAuthedQuery(["ageing", asOf], (t) => getAgeing(asOf, t));
export const useFetchDividends = () => useAuthedQuery(["dividends"], getDividends);
export const useFetchDividend = (reference) =>
  useAuthedQuery(["dividend", reference], (t) => getDividend(reference, t), { enabled: !!reference });
export const useFetchDividendLines = (reference) =>
  useAuthedQuery(["dividend-lines", reference], (t) => getDividendLines(reference, t), {
    enabled: !!reference,
  });
export const useFetchReconciliation = (asOf) =>
  useAuthedQuery(["reconciliation", asOf], (t) => getReconciliation(asOf, t));
