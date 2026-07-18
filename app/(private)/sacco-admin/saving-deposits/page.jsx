"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useFetchSavings } from "@/hooks/savings/actions";
import { useFetchMember } from "@/hooks/members/actions";
import LoadingSpinner from "@/components/general/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    ArrowLeft,
    PiggyBank,
    Plus,
    FileUp,
    ListFilter,
    ChevronLeft,
    ChevronRight,
    Eye,
    TrendingUp
} from "lucide-react";

import CreateDepositAdmin from "@/forms/savingsdeposits/CreateDepositAdmin";
import BulkSavingDepositCreate from "@/forms/savingsdeposits/BulkSavingDepositCreate";
import BulkSavingDepositUploadCreate from "@/forms/savingsdeposits/BulkSavingDepositUploadCreate";
import BulkSavingDepositEditUpload from "@/forms/savingsdeposits/BulkSavingDepositEditUpload";
import SavingsDepositsTable from "@/components/savings/SavingsDepositsTable";
import { useFetchSavingsDeposits } from "@/hooks/savingsdeposits/actions";

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

export default function SavingDepositsPage() {
    const router = useRouter();
    const {
        data: savingsData,
        refetch
    } = useFetchSavings();

    const { data: depositsData, isLoading: isLoadingDeposits } = useFetchSavingsDeposits();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);

    const savings = savingsData?.results || savingsData || [];

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="rounded hover:bg-white"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <PiggyBank className="w-6 h-6 text-[var(--accent)]" /> Savings & Deposits
                        </h1>
                        <p className="text-slate-500 text-sm font-medium">
                            Manage member savings accounts and process deposit transactions.
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold px-6 h-10 shadow-lg shadow-blue-100"
                    >
                        <Plus className="w-4 h-4 mr-1" /> Single Deposit
                    </Button>
                </div>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="deposits">
                <TabsList className="bg-white border p-1 shadow-sm mb-6 w-full h-auto grid grid-cols-4 gap-1 rounded overflow-hidden min-w-0">

                    <TabsTrigger
                        value="deposits"
                        className="flex items-center justify-center gap-2 px-3 py-3 text-xs sm:text-sm font-medium transition-all rounded data-[state=active]:bg-slate-50 data-[state=active]:text-[var(--accent)] data-[state=active]:shadow-sm"
                    >
                        <span className="hidden sm:inline">All Deposits</span>
                        <span className="sm:hidden">Deposits</span>
                    </TabsTrigger>

                    <TabsTrigger
                        value="bulk-create"
                        className="flex items-center justify-center gap-2 px-3 py-3 text-xs sm:text-sm font-medium transition-all rounded data-[state=active]:bg-slate-50 data-[state=active]:text-[var(--accent)] data-[state=active]:shadow-sm"
                    >
                        <span className="hidden sm:inline">Bulk Deposit</span>
                        <span className="sm:hidden">Bulk Deposit</span>
                    </TabsTrigger>

                    <TabsTrigger
                        value="bulk-upload"
                        className="flex items-center justify-center gap-2 px-3 py-3 text-xs sm:text-sm font-medium transition-all rounded data-[state=active]:bg-slate-50 data-[state=active]:text-[var(--accent)] data-[state=active]:shadow-sm"
                    >
                        <span className="hidden md:inline">CSV Upload</span>
                        <span className="md:hidden">CSV Upload</span>
                    </TabsTrigger>

                    <TabsTrigger
                        value="bulk-edit-upload"
                        className="flex items-center justify-center gap-2 px-3 py-3 text-xs sm:text-sm font-medium transition-all rounded data-[state=active]:bg-slate-50 data-[state=active]:text-[var(--accent)] data-[state=active]:shadow-sm"
                    >
                        <span className="hidden md:inline">Edit Dates CSV</span>
                        <span className="md:hidden">Edit Dates CSV</span>
                    </TabsTrigger>

                </TabsList>

                {/* Bulk Form Tab */}
                <TabsContent value="bulk-create" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Card className="shadow-sm border-none bg-white rounded">
                        <CardContent>
                            <BulkSavingDepositCreate onBatchSuccess={refetch} />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Bulk Upload Tab */}
                <TabsContent value="bulk-upload" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Card className="shadow-sm border-none bg-white rounded p-6">
                        <CardContent className="p-0">
                            <BulkSavingDepositUploadCreate onBatchSuccess={refetch} />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Bulk Edit Upload Tab */}
                <TabsContent value="bulk-edit-upload" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Card className="shadow-sm border-none bg-white rounded p-6">
                        <CardContent className="p-0">
                            <BulkSavingDepositEditUpload onBatchSuccess={refetch} />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* All Deposits Tab */}
                <TabsContent value="deposits" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Card className="shadow-sm border-none bg-white rounded">
                        <CardContent className="p-6">
                            {isLoadingDeposits ? (
                                <TableSkeleton rows={8} cols={5} />
                            ) : (
                                <SavingsDepositsTable deposits={depositsData} />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Single Deposit Modal */}
            <CreateDepositAdmin
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setSelectedAccount(null);
                }}
                refetchMember={refetch}
                accounts={savings}
            />
        </div>
    );
}
