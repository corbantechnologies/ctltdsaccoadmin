"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFetchFeeTypes } from "@/hooks/feetypes/actions";
import { useFetchMember } from "@/hooks/members/actions";
import { useFetchFeeAccounts } from "@/hooks/feeaccounts/actions";
import { formatCurrency } from "@/lib/utils";
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
    BadgePercent,
    Pencil,
    Plus,
    FileUp,
    ListFilter,
    CheckCircle2,
    Eye
} from "lucide-react";

import CreateFeeTypeModal from "@/forms/feetypes/CreateFeeType";
import UpdateFeeTypeModal from "@/forms/feetypes/UpdateFeeType";
import BulkFeeTypeCreate from "@/forms/feetypes/BulkFeeTypeCreate";
import BulkFeeTypeUploadCreate from "@/forms/feetypes/BulkFeeTypeUploadCreate";

const TableSkeleton = ({ rows = 5, cols = 7 }) => {
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

export default function FeeTypesSetupPage() {
    const router = useRouter();
    const { data: myself } = useFetchMember();
    const {
        data: feetypes,
        isLoading,
        refetch
    } = useFetchFeeTypes();

    const { data: feeAccountsData, isLoading: isLoadingAccounts } = useFetchFeeAccounts();

    // Per fee type: how many members carry it, how many have paid, and money in/out.
    const statsByType = useMemo(() => {
        const stats = {};
        (Array.isArray(feeAccountsData) ? feeAccountsData : []).forEach((acc) => {
            const name = typeof acc.fee_type === "string" ? acc.fee_type : acc.fee_type?.name;
            if (!name) return;
            if (!stats[name]) stats[name] = { accounts: 0, paid: 0, partial: 0, owing: 0, collected: 0, outstanding: 0 };
            const s = stats[name];
            const outstanding = Number(acc.outstanding_balance || 0);
            const paid = Number(acc.amount_paid || 0);
            s.accounts += 1;
            s.collected += paid;
            s.outstanding += Math.max(0, outstanding);
            if (outstanding <= 0) s.paid += 1;
            else if (paid > 0) s.partial += 1;
            else s.owing += 1;
        });
        return stats;
    }, [feeAccountsData]);

    const summary = useMemo(() => {
        const list = feetypes || [];
        const all = Object.values(statsByType);
        return {
            active: list.filter((f) => f.is_active).length,
            total: list.length,
            collected: all.reduce((t, s) => t + s.collected, 0),
            outstanding: all.reduce((t, s) => t + s.outstanding, 0),
        };
    }, [feetypes, statsByType]);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedFee, setSelectedFee] = useState(null);

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push("/sacco-admin/setup")}
                        className="rounded hover:bg-white text-slate-400 hover:text-[var(--accent)] transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                            <BadgePercent className="w-6 h-6 text-[var(--accent)]" /> Fee Management Setup
                        </h1>
                        <p className="text-slate-500 text-sm">
                            Define registration, insurance, and other SACCO service fees.
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs  shadow-sm"
                    >
                        <Plus className="w-4 h-4 mr-1" /> New Fee Type
                    </Button>
                </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border shadow-sm bg-white rounded">
                    <CardHeader className="p-5">
                        <CardDescription className="text-slate-400 uppercase tracking-widest text-[9px]">Fee Types</CardDescription>
                        <CardTitle className="text-xl font-semibold text-slate-800">
                            {summary.active} <span className="text-sm text-slate-400 font-medium">active of {summary.total}</span>
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card className="border shadow-sm bg-white rounded">
                    <CardHeader className="p-5">
                        <CardDescription className="text-slate-400 uppercase tracking-widest text-[9px]">Collected So Far</CardDescription>
                        <CardTitle className="text-xl font-semibold text-emerald-600 font-mono">{formatCurrency(summary.collected)}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="border shadow-sm bg-white rounded">
                    <CardHeader className="p-5">
                        <CardDescription className="text-slate-400 uppercase tracking-widest text-[9px]">Still Owed by Members</CardDescription>
                        <CardTitle className="text-xl font-semibold text-rose-600 font-mono">{formatCurrency(summary.outstanding)}</CardTitle>
                    </CardHeader>
                </Card>
                <Link href="/sacco-admin/fee-payments" className="block">
                    <Card className="border shadow-sm bg-[var(--accent)] text-white rounded h-full hover:opacity-90 transition-opacity">
                        <CardHeader className="p-5">
                            <CardDescription className="text-white/70 uppercase tracking-widest text-[9px]">Member Fee Accounts</CardDescription>
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <Eye className="w-4 h-4" /> See who has paid
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </Link>
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="list" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger
                        value="list"
                    >
                        <ListFilter className="w-4 h-4 flex-shrink-0" />
                        <span className="hidden sm:inline">Current Fees</span>
                        <span className="sm:hidden">Fees</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="bulk-create"
                    >
                        <Plus className="w-4 h-4 flex-shrink-0" />
                        <span className="hidden sm:inline">Batch Entry</span>
                        <span className="sm:hidden">Batch</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="bulk-upload"
                    >
                        <FileUp className="w-4 h-4 flex-shrink-0" />
                        <span className="hidden md:inline">Import CSV</span>
                        <span className="md:hidden">CSV</span>
                    </TabsTrigger>
                </TabsList>

                {/* List Tab */}
                <TabsContent value="list" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Card className="shadow-sm border-none overflow-hidden rounded">
                        <CardHeader className="bg-white border-b px-6 py-4">
                            <CardTitle className="text-lg  text-slate-800">Fee Inventory</CardTitle>
                            <CardDescription className="text-xs">What each fee costs, who it applies to, and how much has been collected. Click the eye to see the members.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/50">
                                            <TableHead className="text-xs uppercase tracking-wider text-slate-500">Fee</TableHead>
                                            <TableHead className="text-xs uppercase tracking-wider text-slate-500 text-right">Amount</TableHead>
                                            <TableHead className="text-xs uppercase tracking-wider text-slate-500">Rules</TableHead>
                                            <TableHead className="text-xs uppercase tracking-wider text-slate-500">Members</TableHead>
                                            <TableHead className="text-xs uppercase tracking-wider text-slate-500 text-right">Collected</TableHead>
                                            <TableHead className="text-xs uppercase tracking-wider text-slate-500 text-right">Still Owed</TableHead>
                                            <TableHead className="text-xs uppercase tracking-wider text-slate-500 text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="p-6">
                                                    <TableSkeleton rows={5} cols={7} />
                                                </TableCell>
                                            </TableRow>
                                        ) : feetypes?.length > 0 ? (
                                            feetypes.map((fee) => {
                                                const st = statsByType[fee.name] || { accounts: 0, paid: 0, partial: 0, owing: 0, collected: 0, outstanding: 0 };
                                                return (
                                                    <TableRow key={fee.reference} className="align-top">
                                                        <TableCell className="">
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-sm font-semibold text-slate-900">{fee.name}</span>
                                                                <span className="text-[11px] text-slate-500">GL: {fee.gl_account || "-"}</span>
                                                                <div className="flex items-center gap-1">
                                                                    <div className={`w-1.5 h-1.5 rounded-full ${fee.is_active ? "bg-emerald-500" : "bg-slate-300"}`} />
                                                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${fee.is_active ? "text-emerald-600" : "text-slate-500"}`}>
                                                                        {fee.is_active ? "Active" : "Inactive"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right font-mono text-slate-800 whitespace-nowrap">
                                                            {formatCurrency(fee.amount || 0)}
                                                        </TableCell>
                                                        <TableCell className="">
                                                            <div className="flex flex-col gap-1 text-[11px] text-slate-600">
                                                                <span>{fee.is_everyone ? "Charged to every member" : "Charged to selected members"}</span>
                                                                <span className="text-slate-400">{fee.can_exceed_limit ? "Members may pay more than the amount" : "Payments capped at the amount"}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="">
                                                            {isLoadingAccounts ? (
                                                                <div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
                                                            ) : (
                                                                <div className="flex flex-col gap-0.5 text-[11px] whitespace-nowrap">
                                                                    <span className="text-slate-700 font-semibold">{st.accounts} {st.accounts === 1 ? "member" : "members"}</span>
                                                                    <span className="text-emerald-600">{st.paid} fully paid</span>
                                                                    {st.partial > 0 && <span className="text-amber-600">{st.partial} partly paid</span>}
                                                                    <span className="text-rose-600">{st.owing} not paid</span>
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right font-mono text-emerald-600 whitespace-nowrap">
                                                            {isLoadingAccounts ? "…" : formatCurrency(st.collected)}
                                                        </TableCell>
                                                        <TableCell className="text-right font-mono text-rose-600 whitespace-nowrap">
                                                            {isLoadingAccounts ? "…" : formatCurrency(st.outstanding)}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-1.5">
                                                                <Link href={`/sacco-admin/fee-payments?type=${encodeURIComponent(fee.name)}`}>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-slate-400 hover:text-[var(--accent)] hover:bg-slate-100 rounded"
                                                                        title="See member accounts for this fee"
                                                                    >
                                                                        <Eye className="h-4 w-4" />
                                                                    </Button>
                                                                </Link>
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-slate-400 hover:text-[var(--accent)] hover:bg-slate-100 rounded"
                                                                    title="Edit fee type"
                                                                    onClick={() => {
                                                                        setSelectedFee(fee);
                                                                        setIsUpdateModalOpen(true);
                                                                    }}
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center h-48 text-slate-400 font-medium italic py-12">
                                                    No fee types defined yet.
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
                <TabsContent value="bulk-create" className="animate-in fade-in zoom-in-95 duration-200 border-none">
                    <BulkFeeTypeCreate onBatchSuccess={refetch} />
                </TabsContent>

                {/* Bulk Upload Tab */}
                <TabsContent value="bulk-upload" className="animate-in fade-in zoom-in-95 duration-200">
                    <Card className="shadow-sm border-none bg-white rounded p-8">
                        <CardContent className="p-0">
                            <BulkFeeTypeUploadCreate onBatchSuccess={refetch} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Modals */}
            <CreateFeeTypeModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                refetchFeeTypes={refetch}
            />
            <UpdateFeeTypeModal
                isOpen={isUpdateModalOpen}
                onClose={() => setIsUpdateModalOpen(false)}
                refetchFeeTypes={refetch}
                feeType={selectedFee}
            />
        </div>
    );
}
