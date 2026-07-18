"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useFetchPaymentAccounts } from "@/hooks/paymentaccounts/actions";
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
    Wallet,
    Pencil,
    Plus,
    FileUp,
    ListFilter
} from "lucide-react";

import CreatePaymentAccountModal from "@/forms/paymentaccounts/CreatePaymentAccount";
import UpdatePaymentAccountModal from "@/forms/paymentaccounts/UpdatePaymentAccount";
import BulkPaymentAccountCreate from "@/forms/paymentaccounts/BulkPaymentAccountCreate";
import BulkPaymentAccountUploadCreate from "@/forms/paymentaccounts/BulkPaymentAccountUploadCreate";

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

export default function PaymentAccountsSetupPage() {
    const router = useRouter();
    const { data: myself } = useFetchMember();
    const {
        data: paymentaccounts,
        isLoading,
        refetch
    } = useFetchPaymentAccounts();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push("/sacco-admin/setup")}
                        className="rounded hover:bg-white"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-slate-900 flex items-center gap-2">
                            <Wallet className="w-6 h-6 text-[var(--accent)]" /> Payment Accounts Setup
                        </h1>
                        <p className="text-slate-500 text-sm">
                            Configure bank, cash, and mobile money accounts for SACCO transactions.
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold shadow-sm"
                    >
                        <Plus className="w-4 h-4 mr-1" /> Add Payment Account
                    </Button>
                </div>
            </div>

            {/* Main Tabs */}
            <Tabs defaultValue="list" className="w-full">
                <TabsList className="bg-white border p-1 shadow-sm mb-6 w-full h-auto rounded grid grid-cols-3 gap-1 overflow-hidden">
                    <TabsTrigger
                        value="list"
                        className="flex items-center justify-center gap-2 px-4 py-3 text-xs sm:text-sm font-medium transition-all rounded data-[state=active]:bg-slate-50 data-[state=active]:text-[var(--accent)] data-[state=active]:shadow-sm"
                    >
                        <ListFilter className="w-4 h-4 flex-shrink-0" />
                        <span className="hidden sm:inline">Listing</span>
                        <span className="sm:hidden">List</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="bulk-create"
                        className="flex items-center justify-center gap-2 px-4 py-3 text-xs sm:text-sm font-medium transition-all rounded data-[state=active]:bg-slate-50 data-[state=active]:text-[var(--accent)] data-[state=active]:shadow-sm"
                    >
                        <Plus className="w-4 h-4 flex-shrink-0" />
                        <span className="hidden sm:inline">Bulk Form</span>
                        <span className="sm:hidden">Bulk</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="bulk-upload"
                        className="flex items-center justify-center gap-2 px-4 py-3 text-xs sm:text-sm font-medium transition-all rounded data-[state=active]:bg-slate-50 data-[state=active]:text-[var(--accent)] data-[state=active]:shadow-sm"
                    >
                        <FileUp className="w-4 h-4 flex-shrink-0" />
                        <span className="hidden md:inline">CSV Import</span>
                        <span className="md:hidden">CSV</span>
                    </TabsTrigger>
                </TabsList>

                {/* List Tab */}
                <TabsContent value="list" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Card className="shadow-sm border-none overflow-hidden rounded">
                        <CardHeader className="bg-white border-b px-6 py-5">
                            <CardTitle className="text-lg font-semibold text-slate-800">Payment Accounts Inventory</CardTitle>
                            <CardDescription className="text-xs">All configured bank and mobile wallets linked to the ledger.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/50">
                                            <TableHead className="text-xs font-semibold uppercase tracking-widest text-slate-500 pl-6 px-4 py-4">Account Name</TableHead>
                                            <TableHead className="text-xs font-semibold uppercase tracking-widest text-slate-500 px-4 py-4">Linked GL Account</TableHead>
                                            <TableHead className="text-xs font-semibold uppercase tracking-widest text-slate-500 px-4 py-4">Current Status</TableHead>
                                            <TableHead className="text-xs font-semibold uppercase tracking-widest text-slate-500 text-right pr-6 px-4 py-4">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="p-6">
                                                    <TableSkeleton rows={5} cols={4} />
                                                </TableCell>
                                            </TableRow>
                                        ) : paymentaccounts?.length > 0 ? (
                                            paymentaccounts.map((acc) => (
                                                <TableRow key={acc.reference} className="hover:bg-slate-50 transition-colors group border-b border-slate-50">
                                                    <TableCell className="text-sm font-semibold pl-6 py-5 text-slate-900">{acc.name}</TableCell>
                                                    <TableCell className="text-sm">
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-slate-700">{acc.gl_account}</span>
                                                            <span className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">Ledger Category</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className={`px-2.5 py-1 rounded text-[10px] font-semibold tracking-tighter shadow-sm ${acc.is_active ? "bg-green-100 text-green-700 border border-green-200" : "bg-slate-100 text-slate-500 border border-slate-200"
                                                            }`}>
                                                            {acc.is_active ? "ACTIVE" : "INACTIVE"}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right pr-6 py-5">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-slate-400 hover:text-[var(--accent)] hover:bg-white border border-transparent hover:border-slate-200 rounded shadow-none"
                                                            onClick={() => {
                                                                setSelectedAccount(acc);
                                                                setIsUpdateModalOpen(true);
                                                            }}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center h-48 text-slate-400 text-sm italic py-12">
                                                    No payment accounts configured.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Bulk Form Tab */}
                <TabsContent value="bulk-create" className="animate-in fade-in zoom-in-95 duration-200">
                    <Card className="shadow-none border-none bg-transparent">
                        <CardContent className="p-0">
                            <BulkPaymentAccountCreate onBatchSuccess={refetch} />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Bulk Upload Tab */}
                <TabsContent value="bulk-upload" className="animate-in fade-in zoom-in-95 duration-200">
                    <Card className="shadow-sm border-none bg-white rounded p-8">
                        <CardContent className="p-0">
                            <BulkPaymentAccountUploadCreate onBatchSuccess={refetch} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Existing Modals */}
            <CreatePaymentAccountModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                refetchPaymentAccounts={refetch}
            />
            <UpdatePaymentAccountModal
                isOpen={isUpdateModalOpen}
                onClose={() => setIsUpdateModalOpen(false)}
                refetchPaymentAccounts={refetch}
                paymentAccount={selectedAccount}
            />
        </div>
    );
}
