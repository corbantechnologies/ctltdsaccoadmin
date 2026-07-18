"use client";

import React from "react";
import MemberLoadingSpinner from "@/components/general/MemberLoadingSpinner";
import { useFetchMember } from "@/hooks/members/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Wallet,
  PiggyBank,
  TrendingUp,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import SavingsCard from "@/components/members/dashboard/SavingsCard";
import LoanCard from "@/components/members/dashboard/LoanCard";
import { useFetchMemberSummary } from "@/hooks/summary/actions";
import MemberFinancialSummary from "@/components/members/dashboard/MemberFinancialSummary";

function MemberDashboard() {
  const {
    isLoading: isLoadingMember,
    data: member,
    refetch: refetchMember,
  } = useFetchMember();

  const {
    isLoading: isLoadingSummary,
    data: summary,
    refetch: refetchSummary,
  } = useFetchMemberSummary(member?.member_no);


const PersonalDashboardSkeleton = () => (
  <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 md:p-8 space-y-8 animate-pulse">
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <div className="h-6 w-48 bg-slate-200 rounded" />
        <div className="h-4 w-64 bg-slate-200 rounded" />
      </div>
      <div className="h-10 w-32 bg-slate-200 rounded" />
    </div>
    <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div className="h-24 bg-slate-200 rounded-lg" />
      <div className="h-24 bg-slate-200 rounded-lg" />
      <div className="h-24 bg-slate-200 rounded-lg" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 h-96 bg-slate-200 rounded-lg" />
      <div className="h-96 bg-slate-200 rounded-lg" />
    </div>
  </div>
);

  if (isLoadingMember || isLoadingSummary) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <PersonalDashboardSkeleton />
      </div>
    );
  }

  // Calculate totals
  const totalSavings =
    member?.savings?.reduce(
      (acc, curr) => acc + parseFloat(curr.balance || 0),
      0,
    ) || 0;

  const activeLoansCount =
    member?.loan_accounts?.filter(
      (l) => l.status === "Active" || l.status === "Funded",
    ).length || 0;

  const totalOutstandingLoan =
    member?.loan_accounts?.reduce(
      (acc, curr) => acc + parseFloat(curr.outstanding_balance || 0),
      0,
    ) || 0;

  const availableGuarantorAmount =
    member?.guarantor_profile?.available_amount || 0;

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 md:p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-xl font-semibold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="text-slate-500 mt-1 text-base sm:text-lg">
            Welcome back,{" "}
            <span className="font-semibold text-[var(--primary)]">
              {member?.first_name} {member?.last_name}
            </span>
            .
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white px-4 py-2 rounded border shadow-sm">
          <span>Member No:</span>
          <span className="font-mono font-semibold text-gray-900">
            {member?.member_no}
          </span>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-l-4 border-l-[var(--primary)] hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Savings
            </CardTitle>
            <PiggyBank className="h-4 w-4 text-[var(--primary)]" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold text-slate-900">
              {formatCurrency(totalSavings)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Across {member?.savings?.length || 0} accounts
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Outstanding Loans
            </CardTitle>
            <CreditCard className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">
              {formatCurrency(totalOutstandingLoan)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeLoansCount} Active Loan{activeLoansCount !== 1 && "s"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Guarantor Limit
            </CardTitle>
            <ShieldCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">
              {formatCurrency(availableGuarantorAmount)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Available to guarantee
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        {/* Savings Breakdown */}
        <Card className="col-span-1 lg:col-span-3 shadow-sm h-full">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Savings Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {member?.savings?.map((account, index) => (
                <SavingsCard
                  key={index}
                  account={account}
                  memberPath="sacco-admin/personal"
                />
              ))}
              {(!member?.savings || member.savings.length === 0) && (
                <p className="text-center text-muted-foreground py-4">
                  No savings accounts found.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Loan Activity / Active Loans Brief */}
        <Card className="col-span-1 lg:col-span-2 shadow-sm h-full">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              Active Loans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {member?.loan_accounts
                ?.filter((l) => l.status === "Active" || l.status === "Funded")
                .slice(0, 3)
                .map((loan, index) => (
                  <LoanCard key={index} loan={loan} memberPath="sacco-admin/personal" />
                ))}
              {(!member?.loan_accounts ||
                member.loan_accounts.filter(
                  (l) => l.status === "Active" || l.status === "Funded",
                ).length === 0) && (
                  <div className="flex flex-col items-center justify-center py-8 text-center h-full">
                    <div className="h-12 w-12 rounded bg-gray-100 flex items-center justify-center mb-3">
                      <CreditCard className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-muted-foreground text-sm">
                      No active loans
                    </p>
                  </div>
                )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <div className="mt-8">
        <MemberFinancialSummary
          summary={summary}
          memberNo={member?.member_no}
        />
      </div>
    </div>
  );
}

export default MemberDashboard;
