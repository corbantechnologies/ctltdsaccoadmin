"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useFetchLoans } from "@/hooks/loans/actions";
import LoadingSpinner from "@/components/general/LoadingSpinner";
import { Card } from "@/components/ui/card";
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
import {
    Search,
    HandCoins,
    FileUp,
    Plus,
    ArrowLeft,
    ChevronRight,
    ClipboardList,
    Import,
    RefreshCw,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { refreshArrears } from "@/services/loanaccounts";
import { ArrearsBadge } from "@/forms/loans/LoanRecoveryModals";

import PageActions from "@/components/general/PageActions";
import StatTiles from "@/components/general/StatTiles";
import DateRangeFilter, { inDateRange, formatDay } from "@/components/general/DateRangeFilter";

// The day the loan was paid out; older records fall back to when the account was created.
const loanDate = (loan) => loan.start_date || loan.created_at;

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
    const token = useAxiosAuth();
    const [refreshing, setRefreshing] = useState(false);

    // Re-check every open loan's arrears stage now, e.g. after entering
    // payments that members made earlier. It also runs once a day by itself.
    const handleRefreshArrears = async () => {
        setRefreshing(true);
        try {
            const r = await refreshArrears(token);
            toast.success(
                `Updated: ${r?.Current ?? 0} current, ${r?.["In Arrears"] ?? 0} in arrears, ${r?.Defaulted ?? 0} defaulted.`
            );
            refetch();
        } catch (error) {
            toast.error(error?.response?.data?.detail || "Could not refresh loan stages.");
        } finally {
            setRefreshing(false);
        }
    };

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [productFilter, setProductFilter] = useState("all");
    const [dateRange, setDateRange] = useState({ from: "", to: "" });

    // Distinct product names from loaded loans (for filter dropdown)
    const productOptions = useMemo(() => {
        if (!loans) return [];
        const seen = new Set();
        loans.forEach(l => { if (l.product) seen.add(l.product); });
        return Array.from(seen).sort();
    }, [loans]);

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

            const open = status === "active" || status === "funded";
            if (open) {
                totalPortfolioValue += principal;
                totalOutstanding += balance;
                activeCount++;
                if (loan.arrears_stage && loan.arrears_stage !== "Current") arrearsCount++;
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
                (statusFilter === "arrears" &&
                    (status === "Active" || status === "Funded") &&
                    (loan.arrears_stage === "In Arrears" || loan.arrears_stage === "Defaulted")) ||
                (statusFilter === "defaulted" &&
                    (status === "Active" || status === "Funded") &&
                    loan.arrears_stage === "Defaulted") ||
                (statusFilter === "written off" && status === "Written Off");

            const matchesProduct =
                productFilter === "all" || loan.product === productFilter;

            const matchesDate = inDateRange(loanDate(loan), dateRange.from, dateRange.to);

            return matchesSearch && matchesStatus && matchesProduct && matchesDate;
        })
        // Newest loan first.
        .sort((a, b) =>
            String(loanDate(b) || "").localeCompare(String(loanDate(a) || "")) ||
            String(b.created_at || "").localeCompare(String(a.created_at || ""))
        );
    }, [loans, searchTerm, statusFilter, productFilter, dateRange]);

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
            case "Written Off":
                return "bg-red-100 text-red-700 border-red-200";
            default:
                return "bg-blue-100 text-blue-700 border-blue-200";
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-6 space-y-4 pb-16">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="rounded-lg hover:bg-white border shadow-sm h-9 w-9 shrink-0"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-lg font-semibold tracking-tight text-slate-900 flex items-center gap-2">
                            <HandCoins className="w-5 h-5 text-[var(--accent)]" /> Loans Portfolio
                        </h1>
                        <p className="text-slate-500 text-xs">
                            Loan accounts, balances and disbursements, newest first.
                        </p>
                    </div>
                </div>

                <PageActions
                    items={[
                        { label: "Manual Batch", description: "Disburse several loans by filling in a form", icon: Plus, href: "/sacco-admin/loans/batch" },
                        { label: "CSV Upload", description: "Disburse loans from a CSV file", icon: FileUp, href: "/sacco-admin/loans/upload" },
                        null,
                        { label: "View Applications", description: "Loan applications waiting for action", icon: ClipboardList, href: "/sacco-admin/loan-applications" },
                        { label: "Onboard Existing Loans", description: "Bring in loans from before the system", icon: Import, href: "/sacco-admin/onboarding/loans" },
                        { label: refreshing ? "Refreshing..." : "Refresh arrears", description: "Re-check which loans are current, in arrears or defaulted", icon: RefreshCw, onClick: handleRefreshArrears, disabled: refreshing },
                    ]}
                />
            </div>

            <StatTiles
                tiles={[
                    { label: "Total Loan Book", value: formatCurrency(stats.totalPortfolioValue), hint: "Principal of open loans" },
                    { label: "Outstanding", value: formatCurrency(stats.totalOutstanding), tone: "good", hint: "Still to recover" },
                    { label: "Active Accounts", value: `${stats.activeCount} of ${loans?.length || 0}`, hint: "In repayment" },
                    { label: "In Arrears", value: stats.arrearsCount, tone: stats.arrearsCount > 0 ? "bad" : "default", hint: "With overdue instalments" },
                ]}
            />

            <div className="space-y-3">
                    {/* Filter & Search Bar */}
                    <div className="bg-white rounded-lg p-3 border border-slate-200 space-y-2.5">
                        <div className="flex flex-col md:flex-row gap-2 md:items-center">
                            <div className="flex-1 relative w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                <Input
                                    placeholder="Search by member, account number or product..."
                                    className="pl-9 h-8 rounded-md border-slate-200 text-xs"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            {productOptions.length > 0 && (
                                <select
                                    value={productFilter}
                                    onChange={(e) => setProductFilter(e.target.value)}
                                    className="h-8 px-2 rounded-md text-xs border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                                >
                                    <option value="all">All Products</option>
                                    {productOptions.map(p => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                            )}
                            <DateRangeFilter label="Disbursed" from={dateRange.from} to={dateRange.to} onChange={setDateRange} />
                        </div>
                        <div className="flex gap-1 overflow-x-auto no-scrollbar">
                            {[
                                { label: "All", value: "all" },
                                { label: "Active", value: "active" },
                                { label: "In Arrears", value: "arrears" },
                                { label: "Defaulted", value: "defaulted" },
                                { label: "Written Off", value: "written off" },
                                { label: "Closed", value: "closed" },
                            ].map((tab) => (
                                <button
                                    key={tab.value}
                                    onClick={() => setStatusFilter(tab.value)}
                                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap ${
                                        statusFilter === tab.value
                                            ? "bg-slate-900 text-white"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Desktop & Tablet Table View */}
                    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white hidden md:block">
                        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200">
                            <p className="text-sm font-semibold text-slate-900">
                                Loan Accounts <span className="text-slate-400 font-normal">({filteredLoans.length})</span>
                            </p>
                            <p className="text-[11px] text-slate-400">Open a loan to see its schedule or record repayments.</p>
                        </div>
                            <div className="overflow-x-auto w-full">
                                <Table className="min-w-[900px]">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Disbursed</TableHead>
                                            <TableHead>Member &amp; Account</TableHead>
                                            <TableHead>Product</TableHead>
                                            <TableHead className="text-right">Principal</TableHead>
                                            <TableHead className="text-right">Interest</TableHead>
                                            <TableHead className="text-right">Processing Fee</TableHead>
                                            <TableHead className="text-right">Balance</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right"><span className="sr-only">Action</span></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={9} className="p-4">
                                                    <TableSkeleton rows={6} cols={8} />
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredLoans.length > 0 ? (
                                            filteredLoans.map((loan) => (
                                                <TableRow
                                                    key={loan.reference}
                                                    className="cursor-pointer"
                                                    onClick={() => router.push(`/sacco-admin/members/${loan.member}/${loan.reference}`)}
                                                >
                                                    <TableCell className="text-slate-600 tabular-nums">
                                                        {formatDay(loanDate(loan))}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col leading-tight">
                                                            <span className="font-medium text-slate-900">
                                                                {loan.member_name || loan.member}
                                                            </span>
                                                            <span className="font-mono text-[10px] text-slate-400">
                                                                {loan.account_number}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-slate-700">{loan.product}</TableCell>
                                                    <TableCell className="text-right tabular-nums text-slate-800">
                                                        {formatCurrency(loan.principal)}
                                                    </TableCell>
                                                    <TableCell className="text-right tabular-nums text-slate-600">
                                                        {formatCurrency(loan.total_interest_accrued)}
                                                    </TableCell>
                                                    <TableCell className="text-right tabular-nums text-slate-600">
                                                        {formatCurrency(loan.processing_fee)}
                                                    </TableCell>
                                                    <TableCell className="text-right tabular-nums font-semibold text-slate-900">
                                                        {formatCurrency(loan.outstanding_balance)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-wrap items-center gap-1">
                                                            <Badge className={`${getStatusColor(loan.status)} text-[10px] px-1.5 py-0`} variant="outline">
                                                                {loan.status}
                                                            </Badge>
                                                            <ArrearsBadge loan={loan} />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Link
                                                            href={`/sacco-admin/members/${loan.member}/${loan.reference}`}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="inline-flex items-center gap-0.5 text-[11px] font-medium text-[var(--accent)] hover:underline"
                                                        >
                                                            View <ChevronRight className="h-3 w-3" />
                                                        </Link>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={9} className="text-center py-12 text-slate-400">
                                                    No loan accounts match your search or filters.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                    </div>

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
                                                    {loan.account_number} • {loan.product} • {formatDay(loanDate(loan))}
                                                </p>
                                            </div>
                                            <Badge className={getStatusColor(loan.status)} variant="outline">
                                                {loan.status}
                                            </Badge>
                                            <ArrearsBadge loan={loan} />
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
            </div>
        </div>
    );
}
