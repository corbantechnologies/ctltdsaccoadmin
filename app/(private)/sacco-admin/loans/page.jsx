"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useFetchLoans } from "@/hooks/loans/actions";
import LoadingSpinner from "@/components/general/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
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
    ListFilter,
    Wallet,
    TrendingDown,
    ShieldAlert,
    ChevronRight,
} from "lucide-react";
import Link from "next/link";

import BulkLoanDisbursementCreate from "@/forms/loandisbursements/BulkLoanDisbursementCreate";
import BulkLoanDisbursementUploadCreate from "@/forms/loandisbursements/BulkLoanDisbursementUploadCreate";

const TableSkeleton = ({ rows = 5, cols = 8 }) => {
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

    // Portfolio KPI metrics calculated from active loan accounts
    const stats = useMemo(() => {
        if (!loans || loans.length === 0) {
            return {
                totalPortfolioValue: 0,
                totalOutstanding: 0,
                activeCount: 0,
                arrearsCount: 0,
            };
        }

        let totalPortfolioValue = 0;
        let totalOutstanding = 0;
        let activeCount = 0;
        let arrearsCount = 0;

        loans.forEach((loan) => {
            const principal = parseFloat(loan.principal || 0);
            const balance = parseFloat(loan.outstanding_balance || 0);
            const status = String(loan.status || "").toLowerCase();

            if (status !== "closed") {
                totalPortfolioValue += principal;
                totalOutstanding += balance;
            }

            if (status === "active" || status === "funded") {
                activeCount++;
            } else if (status.includes("arrear") || status.includes("default")) {
                arrearsCount++;
            }
        });

        return {
            totalPortfolioValue,
            totalOutstanding,
            activeCount,
            arrearsCount,
        };
    }, [loans]);

    const filteredLoans = useMemo(() => {
        if (!loans) return [];
        return loans.filter((loan) => {
            const term = searchTerm.toLowerCase();
            const matchesSearch =
                !term ||
                loan.account_number?.toLowerCase().includes(term) ||
                loan.member?.toLowerCase().includes(term) ||
                loan.member_name?.toLowerCase().includes(term) ||
                loan.product?.toLowerCase().includes(term);

            const status = String(loan.status || "");
            const matchesStatus =
                statusFilter === "all" ||
                status.toLowerCase() === statusFilter.toLowerCase() ||
                (statusFilter === "active" && (status === "Active" || status === "Funded")) ||
                (statusFilter === "arrears" && (status.includes("Arrear") || status.includes("Default")));

            return matchesSearch && matchesStatus;
        });
    }, [loans, searchTerm, statusFilter]);

    const getStatusColor = (status) => {
        switch (status) {
            case "Funded":
            case "Active":
                return "bg-green-100 text-green-800 border-green-200";
            case "Closed":
            case "Paid":
                return "bg-slate-100 text-slate-700 border-slate-200";
            case "In Arrears":
            case "Defaulted":
                return "bg-red-100 text-red-700 border-red-200";
            default:
                return "bg-blue-100 text-blue-700 border-blue-200";
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-6 space-y-6 pb-16">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="rounded-lg hover:bg-white border shadow-sm h-10 w-10 shrink-0"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                            <HandCoins className="w-6 h-6 text-[var(--accent)]" /> Loans Portfolio
                        </h1>
                        <p className="text-slate-500 text-xs sm:text-sm">
                            Real-time tracking of SACCO loan accounts, outstanding balances, and disbursements.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Link href="/sacco-admin/loan-applications" className="w-full sm:w-auto">
                        <Button variant="outline" className="w-full sm:w-auto border-slate-200 text-slate-700 hover:bg-white text-xs h-9">
                            View Applications
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Accurate Executive Portfolio KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border border-slate-200/80 shadow-sm bg-white">
                    <CardHeader className="p-4 sm:p-5 pb-2">
                        <CardDescription className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] flex items-center justify-between">
                            <span>Total Loan Book</span>
                            <Wallet className="h-4 w-4 text-[var(--accent)]" />
                        </CardDescription>
                        <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight pt-1">
                            {formatCurrency(stats.totalPortfolioValue)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-5 pb-4 pt-0">
                        <p className="text-xs text-muted-foreground">Original principal of open loans</p>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200/80 shadow-sm bg-white">
                    <CardHeader className="p-4 sm:p-5 pb-2">
                        <CardDescription className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] flex items-center justify-between">
                            <span>Outstanding Balance</span>
                            <TrendingDown className="h-4 w-4 text-emerald-600" />
                        </CardDescription>
                        <CardTitle className="text-xl sm:text-2xl font-bold text-emerald-700 tracking-tight pt-1">
                            {formatCurrency(stats.totalOutstanding)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-5 pb-4 pt-0">
                        <p className="text-xs text-muted-foreground">Total remaining debt to recover</p>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200/80 shadow-sm bg-white">
                    <CardHeader className="p-4 sm:p-5 pb-2">
                        <CardDescription className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] flex items-center justify-between">
                            <span>Active Accounts</span>
                            <CheckCircle2 className="h-4 w-4 text-blue-600" />
                        </CardDescription>
                        <CardTitle className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight pt-1">
                            {stats.activeCount} <span className="text-xs text-muted-foreground font-normal">/ {loans?.length || 0} total</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-5 pb-4 pt-0">
                        <p className="text-xs text-muted-foreground">Accounts currently in repayment</p>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200/80 shadow-sm bg-white">
                    <CardHeader className="p-4 sm:p-5 pb-2">
                        <CardDescription className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] flex items-center justify-between">
                            <span>In Arrears</span>
                            <ShieldAlert className="h-4 w-4 text-red-500" />
                        </CardDescription>
                        <CardTitle className={`text-xl sm:text-2xl font-bold tracking-tight pt-1 ${stats.arrearsCount > 0 ? "text-red-600" : "text-slate-800"}`}>
                            {stats.arrearsCount}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-5 pb-4 pt-0">
                        <p className="text-xs text-muted-foreground">Accounts with overdue installments</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="list">
                <TabsList className="bg-white border p-1 shadow-sm mb-4 w-full h-auto rounded-lg grid grid-cols-3 gap-1">
                    <TabsTrigger
                        value="list"
                        className="flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-medium rounded-md data-[state=active]:bg-slate-100 data-[state=active]:text-primary"
                    >
                        <ListFilter className="w-4 h-4 shrink-0" />
                        <span>Portfolio List</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="bulk-create"
                        className="flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-medium rounded-md data-[state=active]:bg-slate-100 data-[state=active]:text-primary"
                    >
                        <Plus className="w-4 h-4 shrink-0" />
                        <span>Manual Batch</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="bulk-upload"
                        className="flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-medium rounded-md data-[state=active]:bg-slate-100 data-[state=active]:text-primary"
                    >
                        <FileUp className="w-4 h-4 shrink-0" />
                        <span>CSV Upload</span>
                    </TabsTrigger>
                </TabsList>

                {/* List Tab Content */}
                <TabsContent value="list" className="space-y-4 m-0">
                    {/* Filter & Search Bar */}
                    <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-3 items-center">
                        <div className="flex-1 relative w-full">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search by member name, account number, or product..."
                                className="pl-10 h-10 rounded-lg border-slate-200 bg-slate-50/50 text-sm focus-visible:ring-1 focus-visible:ring-primary"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 no-scrollbar">
                            {[
                                { label: "All", value: "all" },
                                { label: "Active", value: "active" },
                                { label: "In Arrears", value: "arrears" },
                                { label: "Closed", value: "closed" },
                            ].map((tab) => (
                                <button
                                    key={tab.value}
                                    onClick={() => setStatusFilter(tab.value)}
                                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                                        statusFilter === tab.value
                                            ? "bg-slate-900 text-white shadow-sm"
                                            : "bg-slate-100/80 text-slate-600 hover:bg-slate-200"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Desktop & Tablet Table View */}
                    <Card className="border border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white hidden md:block">
                        <CardHeader className="bg-white border-b px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base font-semibold text-slate-900">
                                        All Loan Accounts ({filteredLoans.length})
                                    </CardTitle>
                                    <CardDescription className="text-xs text-slate-500">
                                        Click &apos;View Details&apos; to view schedule, record repayments, or clear an account.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto w-full">
                                <Table className="min-w-[850px]">
                                    <TableHeader className="bg-slate-50/70">
                                        <TableRow>
                                            <TableHead>Member & Account</TableHead>
                                            <TableHead>Product</TableHead>
                                            <TableHead className="text-right">Principal</TableHead>
                                            <TableHead className="text-right">Total Interest</TableHead>
                                            <TableHead className="text-right">Processing Fee</TableHead>
                                            <TableHead className="text-right font-semibold">Balance</TableHead>
                                            <TableHead className="text-center">Status</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
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
                                                <TableRow key={loan.reference} className="hover:bg-slate-50/60 transition-colors">
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-xs text-slate-900">
                                                                {loan.member_name || loan.member}
                                                            </span>
                                                            <span className="font-mono text-[11px] text-slate-500">
                                                                {loan.account_number}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-xs font-medium text-slate-700">
                                                        {loan.product}
                                                    </TableCell>
                                                    <TableCell className="text-right text-xs font-medium text-slate-800">
                                                        {formatCurrency(loan.principal)}
                                                    </TableCell>
                                                    <TableCell className="text-right text-xs text-slate-600">
                                                        {formatCurrency(loan.total_interest_accrued)}
                                                    </TableCell>
                                                    <TableCell className="text-right text-xs text-slate-600">
                                                        {formatCurrency(loan.processing_fee)}
                                                    </TableCell>
                                                    <TableCell className="text-right text-xs font-bold text-slate-900">
                                                        {formatCurrency(loan.outstanding_balance)}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge className={getStatusColor(loan.status)} variant="outline">
                                                            {loan.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Link href={`/sacco-admin/members/${loan.member}/${loan.reference}`}>
                                                            <Button size="sm" variant="outline" className="h-8 text-xs font-medium border-slate-200 hover:bg-primary hover:text-white transition-colors">
                                                                View Details
                                                            </Button>
                                                        </Link>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-16 text-slate-400 text-sm">
                                                    No loan accounts match your search or filter.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Mobile PWA Card View (< 640px) */}
                    <div className="space-y-3 md:hidden">
                        {isLoading ? (
                            <TableSkeleton rows={4} cols={3} />
                        ) : filteredLoans.length > 0 ? (
                            filteredLoans.map((loan) => (
                                <Link
                                    key={loan.reference}
                                    href={`/sacco-admin/members/${loan.member}/${loan.reference}`}
                                    className="block"
                                >
                                    <Card className="border border-slate-200 shadow-sm bg-white p-4 active:bg-slate-50 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-bold text-sm text-slate-900">
                                                    {loan.member_name || loan.member}
                                                </p>
                                                <p className="font-mono text-xs text-slate-500">
                                                    {loan.account_number} • {loan.product}
                                                </p>
                                            </div>
                                            <Badge className={getStatusColor(loan.status)} variant="outline">
                                                {loan.status}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                                            <div>
                                                <span className="text-slate-400 block text-[10px] uppercase">Principal</span>
                                                <span className="font-semibold text-slate-800">{formatCurrency(loan.principal)}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-slate-400 block text-[10px] uppercase">Balance</span>
                                                <span className="font-bold text-slate-900">{formatCurrency(loan.outstanding_balance)}</span>
                                            </div>
                                        </div>

                                        <div className="mt-3 flex items-center justify-between text-xs text-primary font-medium pt-2 border-t border-slate-50">
                                            <span>Manage Loan Account</span>
                                            <ChevronRight className="h-4 w-4" />
                                        </div>
                                    </Card>
                                </Link>
                            ))
                        ) : (
                            <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-400 text-sm">
                                No loan accounts found.
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* Bulk Form Tab */}
                <TabsContent value="bulk-create" className="m-0">
                    <BulkLoanDisbursementCreate onBatchSuccess={refetch} />
                </TabsContent>

                {/* Bulk Upload Tab */}
                <TabsContent value="bulk-upload" className="m-0">
                    <Card className="shadow-sm border border-slate-200 bg-white rounded-xl p-6">
                        <CardContent className="p-0">
                            <BulkLoanDisbursementUploadCreate onBatchSuccess={refetch} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
