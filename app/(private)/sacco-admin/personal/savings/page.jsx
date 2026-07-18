"use client";

import React from "react";
import { useFetchSavings } from "@/hooks/savings/actions";
import MemberLoadingSpinner from "@/components/general/MemberLoadingSpinner";
import SavingsCard from "@/components/members/dashboard/SavingsCard";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

function SavingsPage() {
    const { data: savings, isLoading, isError } = useFetchSavings();

const PersonalSavingsSkeleton = () => (
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
                <PersonalSavingsSkeleton />
            </div>
        );
    }
    if (isError) return <div className="p-8 text-center text-red-500">Failed to load savings accounts.</div>;

    const savingsList = Array.isArray(savings) ? savings : (savings?.results || []);

    return (
        <div className="min-h-screen bg-gray-50/50">
            <div className="w-full px-4 sm:px-6 py-6 space-y-6">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/sacco-admin/personal">Personal Profile</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbPage>Savings</BreadcrumbPage>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold text-gray-900">My Savings</h1>
                </div>

                {savingsList.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded border border-dashed">
                        <p className="text-muted-foreground">You have no savings accounts.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {savingsList.map((account) => (
                            <SavingsCard key={account.id || account.reference} account={account} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default SavingsPage;