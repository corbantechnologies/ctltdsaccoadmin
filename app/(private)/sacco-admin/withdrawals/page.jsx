"use client";

import LoadingSpinner from "@/components/general/LoadingSpinner";
import { useFetchSavingsWithdrawals } from "@/hooks/savingswithdrawals/actions";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WithdrawalsTable from "@/components/withdrawals/WithdrawalsTable";
import { SACCO_CONFIG } from "@/lib/sacco-config";

const TableSkeleton = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="space-y-4 w-full animate-pulse p-4">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex gap-4 items-center py-2 border-b border-slate-100 last:border-0">
          {[...Array(cols)].map((_, j) => (
            <div key={j} className="h-6 bg-slate-100 rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};

function Withdrawals() {
  if (!SACCO_CONFIG.enableWithdrawals) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <Card className="shadow-md max-w-xl">
          <CardHeader>
            <CardTitle>Withdrawals are not enabled</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            This SACCO does not process savings withdrawals through the
            platform.
          </CardContent>
        </Card>
      </div>
    );
  }
  return <WithdrawalRequests />;
}

function WithdrawalRequests() {
  const {
    isLoading: isLoadingWithdrawals,
    data: withdrawals,
    refetch: refetchWithdrawals,
  } = useFetchSavingsWithdrawals();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto p-4 sm:p-6 space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/sacco-admin/dashboard">
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Withdrawals</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <section className="mb-3">
          <h1 className="text-xl  font-semibold">
            Withdrawal Requests
          </h1>
          <p className="text-gray-500 mt-1">
            Manage member withdrawal requests
          </p>
        </section>

        <Card className="shadow-md">
          <CardContent className="p-0">
            {isLoadingWithdrawals ? (
              <TableSkeleton rows={8} cols={5} />
            ) : (
              <WithdrawalsTable
                withdrawals={withdrawals || []}
                refetchWithdrawals={refetchWithdrawals}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Withdrawals;
