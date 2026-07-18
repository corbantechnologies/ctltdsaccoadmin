"use client";

import React from "react";
import { useFetchSaccoFinancialReport } from "@/hooks/saccosummary/actions";
import MemberLoadingSpinner from "@/components/general/MemberLoadingSpinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileText, AlertCircle } from "lucide-react";
import BalanceSheet from "./BalanceSheet";
import PnLReport from "./PnLReport";
import DebtorsList from "./DebtorsList";
import CashBook from "./CashBook";

export default function SaccoFinancialReports() {
    const { data: reports, isLoading, error } = useFetchSaccoFinancialReport();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <MemberLoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive" className="my-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    Failed to load detailed financial reports. Please try again later.
                </AlertDescription>
            </Alert>
        );
    }

    if (!reports) return null;

    return (
        <div className="space-y-6 mt-8">
            <div className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold tracking-tight">Detailed Financial Statements</h2>
            </div>

            <Tabs defaultValue="balance_sheet" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                    <TabsTrigger value="balance_sheet">Balance Sheet</TabsTrigger>
                    <TabsTrigger value="pnl">Profit & Loss</TabsTrigger>
                    <TabsTrigger value="debtors">Debtors</TabsTrigger>
                    <TabsTrigger value="cash_book">Cash Book</TabsTrigger>
                </TabsList>

                <div className="mt-4">
                    <TabsContent value="balance_sheet">
                        <BalanceSheet data={reports.balance_sheet} />
                    </TabsContent>

                    <TabsContent value="pnl">
                        <PnLReport data={reports.pnl} />
                    </TabsContent>

                    <TabsContent value="debtors">
                        <DebtorsList data={reports.debtors} />
                    </TabsContent>

                    <TabsContent value="cash_book">
                        <CashBook data={reports.cash_book} />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
