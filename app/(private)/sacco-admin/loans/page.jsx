"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useFetchLoans } from "@/hooks/loans/actions";
import LoadingSpinner from "@/components/general/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Search,
    HandCoins,
    Eye,
    ArrowUpRight,
    FileUp,
    Plus,
    CheckCircle2,
    Clock,
    AlertCircle,
    ArrowLeft,
    ListFilter
} from "lucide-react";
import Link from "next/link";

import BulkLoanDisbursementCreate from "@/forms/loandisbursements/BulkLoanDisbursementCreate";
import BulkLoanDisbursementUploadCreate from "@/forms/loandisbursements/BulkLoanDisbursementUploadCreate";

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

export default function LoansManagementPage() {
    const router = useRouter();
    const { data: loans, isLoading, refetch } = useFetchLoans();


    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const filteredLoans = useMemo(() => {
        if (!loans) return [];
        return loans.filter(loan => {
            const matchesSearch =
                loan.account_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (`${loan.member?.first_name} ${loan.member?.last_name}`).toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === "all" || loan.application?.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [loans, searchTerm, statusFilter]);

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-6 space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="rounded hover:bg-white border shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-lg font-semibold tracking-tight text-slate-900 flex items-center gap-2">
                            <HandCoins className="w-6 h-6 text-[var(--accent)]" /> Loans Portfolio
                        </h1>
                        <p className="text-slate-500 text-sm font-medium">
                            Manage all SACCO loan accounts and disbursements.
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border shadow-sm bg-[var(--accent)] text-white rounded">
                    <CardHeader className="p-6">
                        <CardDescription className="text-white/60 font-semibold uppercase tracking-widest text-[10px]">Active Accounts</CardDescription>
                        <CardTitle className="text-xl font-semibold tracking-tight">{loans?.length || 0}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="border shadow-sm bg-white rounded">
                    <CardHeader className="p-6">
                        <CardDescription className="text-slate-400 font-semibold uppercase tracking-widest text-[10px]">Pending Approval</CardDescription>
                        <CardTitle className="text-xl font-semibold tracking-tight text-slate-800">
                            {loans?.filter(l => l.application?.status === 'Pending')?.length || 0}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card className="border shadow-sm bg-white rounded">
                    <CardHeader className="p-6">
                        <CardDescription className="text-slate-400 font-semibold uppercase tracking-widest text-[10px]">Approved (Awaiting Funding)</CardDescription>
                        <CardTitle className="text-xl font-semibold tracking-tight text-emerald-600">
                            {loans?.filter(l => l.application?.status === 'Approved')?.length || 0}
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="list">
                <TabsList className="bg-white border p-1 shadow-sm mb-6 w-full h-auto rounded grid grid-cols-3 gap-1 overflow-hidden">
                    <TabsTrigger
                        value="list"
                        className="flex items-center justify-center gap-2 px-4 py-3 text-xs sm:text-sm font-medium transition-all rounded data-[state=active]:bg-slate-50 data-[state=active]:text-[var(--accent)] data-[state=active]:shadow-sm"
                    >
                        <ListFilter className="w-4 h-4 flex-shrink-0" />
                        <span className="hidden sm:inline">List View</span>
                        <span className="sm:hidden">List</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="bulk-create"
                        className="flex items-center justify-center gap-2 px-4 py-3 text-xs sm:text-sm font-medium transition-all rounded data-[state=active]:bg-slate-50 data-[state=active]:text-[var(--accent)] data-[state=active]:shadow-sm"
                    >
                        <Plus className="w-4 h-4 flex-shrink-0" />
                        <span className="hidden sm:inline">Manual Batch</span>
                        <span className="sm:hidden">Batch</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="bulk-upload"
                        className="flex items-center justify-center gap-2 px-4 py-3 text-xs sm:text-sm font-medium transition-all rounded data-[state=active]:bg-slate-50 data-[state=active]:text-[var(--accent)] data-[state=active]:shadow-sm"
                    >
                        <FileUp className="w-4 h-4 flex-shrink-0" />
                        <span className="hidden md:inline">CSV Upload</span>
                        <span className="md:hidden">Upload</span>
                    </TabsTrigger>
                </TabsList>

                {/* List Tab */}
                <TabsContent value="list" className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
                    {/* Filter Bar */}
                    <div className="bg-white rounded p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
                        <div className="flex-1 relative group w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[var(--accent)] transition-colors" />
                            <Input
                                placeholder="Search by member name or account number..."
                                className="pl-12 h-12 rounded border-slate-100 focus:border-[var(--accent)] bg-slate-50/50 shadow-none border-0 ring-offset-transparent focus-visible:ring-1 focus-visible:ring-slate-200"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                            <div className="inline-flex bg-slate-100/50 rounded p-1 gap-1 border border-slate-200/50">
                                {['all', 'Approved', 'Disbursed', 'Pending'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setStatusFilter(status)}
                                        className={`px-4 h-9 rounded text-[10px] font-semibold uppercase tracking-widest transition-all whitespace-nowrap ${statusFilter === status
                                            ? "bg-white text-[var(--accent)] shadow-sm ring-1 ring-slate-200"
                                            : "text-slate-400 hover:text-slate-600"
                                            }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Loans Table */}
                    <Card className="border shadow-sm rounded overflow-hidden bg-white">
                        <CardHeader className="bg-white border-b px-8 py-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-semibold text-slate-900 tracking-tight">Active Portfolio</CardTitle>
                                    <CardDescription className="text-xs font-medium text-slate-500 mt-1">A detailed view of all member loan accounts.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Member</TableHead>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Principal</TableHead>
                                            <TableHead>Total Interest</TableHead>
                                            <TableHead>Pro. Fees</TableHead>
                                            <TableHead>Balance</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="p-6">
                                                    <TableSkeleton rows={6} cols={8} />
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredLoans.length > 0 ? (
                                            filteredLoans.map((loan) => (
                                                <TableRow key={loan.reference} className="hover:bg-slate-50/50 transition-all border-b last:border-0 group h-20">
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span>{loan.member_name} - {loan?.member}</span>
                                                            <span>{loan.account_number}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {loan?.product}
                                                    </TableCell>
                                                    <TableCell>
                                                        {loan?.principal}
                                                    </TableCell>
                                                    <TableCell>
                                                        {loan?.total_interest_accrued}
                                                    </TableCell>
                                                    <TableCell>
                                                        {loan?.processing_fee}
                                                    </TableCell>
                                                    <TableCell>
                                                        {loan?.outstanding_balance}
                                                    </TableCell>
                                                    <TableCell>
                                                        {loan.status}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Link href={`/sacco-admin/members/${loan.member}/${loan.reference}`} target="_blank">
                                                            <Button size="sm" variant="outline">
                                                                View Details
                                                            </Button>
                                                        </Link>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-24 text-slate-300 font-semibold uppercase tracking-[0.2em] text-sm">
                                                    No loan accounts found
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
                <TabsContent value="bulk-create" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <BulkLoanDisbursementCreate onBatchSuccess={refetch} />
                </TabsContent>

                {/* Bulk Upload Tab */}
                <TabsContent value="bulk-upload" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Card className="shadow-sm border-none bg-white rounded p-8 mt-4">
                        <CardContent className="p-0">
                            <BulkLoanDisbursementUploadCreate onBatchSuccess={refetch} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
