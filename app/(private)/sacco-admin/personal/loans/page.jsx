"use client";

import React from "react";
import { useFetchLoans } from "@/hooks/loans/actions";
import MemberLoadingSpinner from "@/components/general/MemberLoadingSpinner";
import LoanCard from "@/components/members/dashboard/LoanCard";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

function LoansPage() {
    const { data: loans, isLoading, isError } = useFetchLoans();

const PersonalLoansSkeleton = () => (
  <div className="w-full px-4 sm:px-6 py-6 space-y-6 animate-pulse">
    <div className="h-4 w-48 bg-slate-200 rounded" />
    <div className="h-6 w-32 bg-slate-200 rounded" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-56 bg-slate-200 rounded-lg" />
      ))}
    </div>
  </div>
);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50/50">
                <PersonalLoansSkeleton />
            </div>
        );
    }
    if (isError) return <div className="p-8 text-center text-red-500">Failed to load loans.</div>;

    // Check if loans is an array, if not it might be an empty state or object wrapper
    const loanList = Array.isArray(loans) ? loans : (loans?.results || []);

    return (
        <div className="min-h-screen bg-gray-50/50">
            <div className="w-full px-4 sm:px-6 py-6 space-y-6">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/sacco-admin/personal">Personal Profile</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbPage>Loans</BreadcrumbPage>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold text-gray-900">My Loans</h1>
                </div>

                {loanList.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded border border-dashed">
                        <p className="text-muted-foreground">You have no active loans.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loanList.map((loan) => (
                            <LoanCard key={loan.id || loan.reference} loan={loan} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default LoansPage;