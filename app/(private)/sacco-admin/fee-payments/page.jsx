"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFetchFeeAccounts } from "@/hooks/feeaccounts/actions";
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
    CreditCard,
    Eye,
    Receipt,
    FileUp,
    Plus,
    Users,
    BadgePercent,
    ArrowLeft,
    ListFilter,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    Wallet
} from "lucide-react";
import Link from "next/link";

import BulkFeePaymentCreate from "@/forms/feepayments/BulkFeePaymentCreate";
import BulkFeePaymentUploadCreate from "@/forms/feepayments/BulkFeePaymentUploadCreate";
import CreateFeePayment from "@/forms/feepayments/CreateFeePayment";
import { formatCurrency } from "@/lib/utils";

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

const PAGE_SIZE = 50;

const feeTypeName = (acc) => (typeof acc.fee_type === "string" ? acc.fee_type : acc.fee_type?.name) || "";
const memberNo = (acc) => (typeof acc.member === "string" ? acc.member : acc.member?.member_no) || "";
const memberName = (acc) =>
    acc.member_name ||
    (acc.member?.first_name ? `${acc.member.first_name} ${acc.member.last_name || ""}`.trim() : "") ||
    memberNo(acc);

// Paid in full, partly paid, or nothing paid yet.
const feeStatus = (acc) => {
    const outstanding = Number(acc.outstanding_balance || 0);
    const paid = Number(acc.amount_paid || 0);
    if (outstanding <= 0) return "paid";
    if (paid > 0) return "partial";
    return "owing";
};

const STATUS_STYLES = {
    paid: { label: "Fully Paid", dot: "bg-emerald-500", text: "text-emerald-600" },
    partial: { label: "Partly Paid", dot: "bg-amber-500", text: "text-amber-600" },
    owing: { label: "Not Paid", dot: "bg-rose-500", text: "text-rose-600" },
};

function PaymentHistory({ payments }) {
    if (!payments?.length) {
        return <p className="text-xs text-slate-400 italic px-1 py-2">No payments recorded on this account yet.</p>;
    }
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-xs">
                <thead>
                    <tr className="text-slate-400 uppercase tracking-wider text-[10px]">
                        <th className="text-left font-semibold py-1.5 pr-3">Date</th>
                        <th className="text-left font-semibold py-1.5 pr-3">Method</th>
                        <th className="text-left font-semibold py-1.5 pr-3">Status</th>
                        <th className="text-right font-semibold py-1.5">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {payments.map((p) => (
                        <tr key={p.reference} className="border-t border-slate-100">
                            <td className="py-1.5 pr-3 text-slate-600">
                                {p.transaction_date ? new Date(p.transaction_date).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" }) : "-"}
                            </td>
                            <td className="py-1.5 pr-3 text-slate-600">{p.payment_method || "-"}</td>
                            <td className="py-1.5 pr-3 text-slate-600">{p.transaction_status || "-"}</td>
                            <td className="py-1.5 text-right font-mono text-slate-800">{formatCurrency(p.amount || 0)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function FeePaymentsManagementPage() {
    const router = useRouter();
    const { data: feeAccountsData, isLoading, refetch } = useFetchFeeAccounts();
    const feeAccounts = useMemo(() => (Array.isArray(feeAccountsData) ? feeAccountsData : []), [feeAccountsData]);

    const [searchTerm, setSearchTerm] = useState("");
    const [feeTypeFilter, setFeeTypeFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [expanded, setExpanded] = useState({});
    const [selectedAccountForPayment, setSelectedAccountForPayment] = useState(null);
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);

    // Opened from Fee Types with ?type=<name>: start filtered to that fee.
    useEffect(() => {
        const type = new URLSearchParams(window.location.search).get("type");
        if (type) setFeeTypeFilter(type);
    }, []);

    const feeTypesList = useMemo(() => {
        const types = new Set();
        feeAccounts.forEach((acc) => {
            const name = feeTypeName(acc);
            if (name) types.add(name);
        });
        return Array.from(types).sort();
    }, [feeAccounts]);

    const filteredAccounts = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        return feeAccounts.filter((acc) => {
            const matchesSearch =
                !term ||
                acc.account_number?.toLowerCase().includes(term) ||
                memberNo(acc).toLowerCase().includes(term) ||
                memberName(acc).toLowerCase().includes(term) ||
                feeTypeName(acc).toLowerCase().includes(term);
            const matchesFeeType = feeTypeFilter === "all" || feeTypeName(acc) === feeTypeFilter;
            const status = feeStatus(acc);
            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "unpaid" && status !== "paid") ||
                status === statusFilter;
            return matchesSearch && matchesFeeType && matchesStatus;
        });
    }, [feeAccounts, searchTerm, feeTypeFilter, statusFilter]);

    // One row per member, with all of that member's fee accounts inside it.
    const groupedList = useMemo(() => {
        const groups = {};
        filteredAccounts.forEach((acc) => {
            const key = memberNo(acc) || memberName(acc);
            if (!groups[key]) {
                groups[key] = { member_no: memberNo(acc), member_name: memberName(acc), accounts: [], outstanding: 0, paid: 0 };
            }
            groups[key].accounts.push(acc);
            groups[key].outstanding += Number(acc.outstanding_balance || 0);
            groups[key].paid += Number(acc.amount_paid || 0);
        });
        Object.values(groups).forEach((g) => g.accounts.sort((a, b) => feeTypeName(a).localeCompare(feeTypeName(b))));
        return Object.values(groups).sort((a, b) => a.member_name.localeCompare(b.member_name));
    }, [filteredAccounts]);

    const totalMembers = groupedList.length;
    const totalPages = Math.max(1, Math.ceil(totalMembers / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const paginatedGroups = groupedList.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const totals = useMemo(() => {
        const outstanding = feeAccounts.reduce((sum, acc) => sum + Number(acc.outstanding_balance || 0), 0);
        const collected = feeAccounts.reduce((sum, acc) => sum + Number(acc.amount_paid || 0), 0);
        const owingMembers = new Set(feeAccounts.filter((a) => feeStatus(a) !== "paid").map(memberNo)).size;
        const paidAccounts = feeAccounts.filter((a) => feeStatus(a) === "paid").length;
        return { outstanding, collected, owingMembers, paidAccounts };
    }, [feeAccounts]);

    const resetPage = (setter) => (value) => {
        setter(value);
        setPage(1);
    };

    const openPayment = (acc) => {
        setSelectedAccountForPayment(acc);
        setIsPayModalOpen(true);
    };

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
                        <h1 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                            <Receipt className="w-6 h-6 text-[var(--accent)]" /> Fee Accounts
                        </h1>
                        <p className="text-slate-500 text-sm">
                            Every member&apos;s fees in one place: what each fee costs, what has been paid and what is still owed.
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Link href="/sacco-admin/setup/feetypes" className="w-full sm:w-auto">
                        <Button variant="outline" className="text-xs font-semibold px-4 h-10 gap-1.5 w-full sm:w-auto">
                            <BadgePercent className="w-4 h-4" /> Fee Types
                        </Button>
                    </Link>
                    <Button
                        onClick={() => openPayment(null)}
                        className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold px-4 h-10 shadow-sm gap-1.5 w-full sm:w-auto"
                    >
                        <Plus className="w-4 h-4" /> Record Fee Payment
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border shadow-sm bg-[var(--accent)] text-white rounded">
                    <CardHeader className="p-5">
                        <CardDescription className="text-white/70 uppercase tracking-widest text-[9px]">Still Owed</CardDescription>
                        <CardTitle className="text-xl font-semibold font-mono">{formatCurrency(totals.outstanding)}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="border shadow-sm bg-white rounded">
                    <CardHeader className="p-5">
                        <CardDescription className="text-slate-400 uppercase tracking-widest text-[9px]">Collected So Far</CardDescription>
                        <CardTitle className="text-xl font-semibold text-emerald-600 font-mono">{formatCurrency(totals.collected)}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="border shadow-sm bg-white rounded">
                    <CardHeader className="p-5">
                        <CardDescription className="text-slate-400 uppercase tracking-widest text-[9px]">Members Still Owing</CardDescription>
                        <CardTitle className="text-xl font-semibold text-slate-800">{totals.owingMembers}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="border shadow-sm bg-white rounded">
                    <CardHeader className="p-5">
                        <CardDescription className="text-slate-400 uppercase tracking-widest text-[9px]">Fee Accounts Fully Paid</CardDescription>
                        <CardTitle className="text-xl font-semibold text-slate-800">
                            {totals.paidAccounts} <span className="text-sm text-slate-400 font-medium">of {feeAccounts.length}</span>
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="list" className="w-full">
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
                        <span className="hidden md:inline">CSV Import</span>
                        <span className="md:hidden">CSV</span>
                    </TabsTrigger>
                </TabsList>

                {/* List Tab */}
                <TabsContent value="list" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Card className="shadow-sm border-none overflow-hidden">
                        <CardHeader className="bg-white border-b px-6 py-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="text-lg font-semibold">Member Fee Accounts</CardTitle>
                                    <CardDescription className="text-xs font-medium">
                                        Grouped by member. Click a fee to see its payments.
                                    </CardDescription>
                                </div>
                                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded w-fit">
                                    {totalMembers} Members · {filteredAccounts.length} Fee Accounts
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 space-y-6 bg-white">
                            {/* Filter Bar */}
                            <div className="flex flex-col md:flex-row gap-3">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                    <Input
                                        placeholder="Search by member name, member #, account # or fee type..."
                                        className="pl-10 border-slate-200 focus:border-[var(--accent)] rounded text-sm bg-slate-50/50"
                                        value={searchTerm}
                                        onChange={(e) => resetPage(setSearchTerm)(e.target.value)}
                                    />
                                </div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => resetPage(setStatusFilter)(e.target.value)}
                                    className="w-full md:w-48 border border-slate-200 rounded px-3 py-2 text-sm bg-slate-50/50 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="unpaid">Still Owing (any)</option>
                                    <option value="owing">Not Paid</option>
                                    <option value="partial">Partly Paid</option>
                                    <option value="paid">Fully Paid</option>
                                </select>
                                <select
                                    value={feeTypeFilter}
                                    onChange={(e) => resetPage(setFeeTypeFilter)(e.target.value)}
                                    className="w-full md:w-48 border border-slate-200 rounded px-3 py-2 text-sm bg-slate-50/50 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
                                >
                                    <option value="all">All Fee Types</option>
                                    {feeTypesList.map((type) => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            {isLoading ? (
                                <TableSkeleton rows={8} cols={2} />
                            ) : (
                                <>
                                    <div className="overflow-x-auto border border-slate-100 rounded">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-slate-50/50">
                                                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 pl-6 py-3 w-1/4">Member Details</TableHead>
                                                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 py-3">Fee Accounts</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {paginatedGroups.length > 0 ? (
                                                    paginatedGroups.map((group) => (
                                                        <TableRow key={group.member_no || group.member_name} className="hover:bg-slate-50/30 transition-colors border-b border-slate-100">
                                                            <TableCell className="pl-6 py-4 align-top">
                                                                <div className="flex flex-col gap-1">
                                                                    <Link
                                                                        href={`/sacco-admin/members/${group.member_no}`}
                                                                        className="text-sm font-semibold text-slate-900 uppercase tracking-tight hover:text-[var(--accent)] hover:underline"
                                                                    >
                                                                        {group.member_name}
                                                                    </Link>
                                                                    <span className="text-[11px] text-slate-500 font-mono">{group.member_no}</span>
                                                                    <div className="mt-2 space-y-0.5 text-[11px]">
                                                                        <div className="text-slate-500">
                                                                            Owes <span className={`font-semibold font-mono ${group.outstanding > 0 ? "text-rose-600" : "text-emerald-600"}`}>{formatCurrency(group.outstanding)}</span>
                                                                        </div>
                                                                        <div className="text-slate-400">
                                                                            Paid <span className="font-mono">{formatCurrency(group.paid)}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="py-4 pr-4 sm:pr-6 align-top">
                                                                <div className="space-y-3">
                                                                    {group.accounts.map((acc) => {
                                                                        const status = feeStatus(acc);
                                                                        const style = STATUS_STYLES[status];
                                                                        const paid = Number(acc.amount_paid || 0);
                                                                        const outstanding = Number(acc.outstanding_balance || 0);
                                                                        const total = paid + outstanding;
                                                                        const pct = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 100;
                                                                        const isOpen = !!expanded[acc.reference];
                                                                        return (
                                                                            <div key={acc.reference} className="bg-slate-50/50 hover:bg-slate-50/80 border border-slate-100 rounded-md transition-all">
                                                                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3">
                                                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 min-w-0">
                                                                                        <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-[var(--accent)] font-mono">
                                                                                            {acc.account_number}
                                                                                        </span>
                                                                                        <span className="text-xs font-semibold text-slate-700">{feeTypeName(acc)}</span>
                                                                                        <div className="flex items-center gap-1">
                                                                                            <div className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                                                                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${style.text}`}>{style.label}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="flex flex-wrap items-center justify-between lg:justify-end gap-4">
                                                                                        <div className="flex flex-col min-w-[160px]">
                                                                                            <span className="text-[11px] text-slate-500">
                                                                                                Paid <span className="font-mono text-slate-700">{formatCurrency(paid)}</span> of <span className="font-mono text-slate-700">{formatCurrency(total)}</span>
                                                                                            </span>
                                                                                            <div className="h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                                                                                                <div className={`h-full ${status === "paid" ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${pct}%` }} />
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="flex flex-col items-end">
                                                                                            <span className="text-[10px] uppercase tracking-wider text-slate-400">Balance</span>
                                                                                            <span className={`text-sm font-semibold font-mono ${outstanding > 0 ? "text-slate-900" : "text-emerald-600"}`}>
                                                                                                {formatCurrency(outstanding)}
                                                                                            </span>
                                                                                        </div>
                                                                                        <div className="flex gap-1.5">
                                                                                            {outstanding > 0 && (
                                                                                                <Button
                                                                                                    size="sm"
                                                                                                    variant="outline"
                                                                                                    onClick={() => openPayment(acc)}
                                                                                                    className="h-7 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-200"
                                                                                                    title="Record a payment on this fee"
                                                                                                >
                                                                                                    <Wallet className="h-3.5 w-3.5 mr-1" /> Pay
                                                                                                </Button>
                                                                                            )}
                                                                                            <Button
                                                                                                variant="outline"
                                                                                                size="icon"
                                                                                                className="h-7 w-7 text-slate-400 hover:text-[var(--accent)] hover:bg-slate-100 rounded"
                                                                                                onClick={() => setExpanded((e) => ({ ...e, [acc.reference]: !e[acc.reference] }))}
                                                                                                title={isOpen ? "Hide payments" : "Show payments"}
                                                                                            >
                                                                                                {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                                                                            </Button>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                {isOpen && (
                                                                                    <div className="border-t border-slate-100 bg-white px-3 py-2 rounded-b-md">
                                                                                        <PaymentHistory payments={acc.fee_payments} />
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={2} className="text-center h-64 text-slate-400 text-sm font-medium">
                                                            <div className="flex flex-col items-center gap-2">
                                                                <Receipt className="w-12 h-12 text-slate-100" />
                                                                No fee accounts found.
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-2">
                                            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                                                Members {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, totalMembers)} of {totalMembers} · Page {currentPage} of {totalPages}
                                            </p>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={currentPage === 1}
                                                    onClick={() => setPage(Math.max(1, currentPage - 1))}
                                                    className="h-8 text-[11px] font-semibold uppercase tracking-wider"
                                                >
                                                    <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={currentPage === totalPages}
                                                    onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                                                    className="h-8 text-[11px] font-semibold uppercase tracking-wider"
                                                >
                                                    Next <ChevronRight className="w-4 h-4 ml-1" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Bulk Form Tab */}
                <TabsContent value="bulk-create" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Card className="shadow-sm border-none bg-transparent">
                        <CardContent className="p-0">
                            <BulkFeePaymentCreate onBatchSuccess={refetch} />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Bulk Upload Tab */}
                <TabsContent value="bulk-upload" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Card className="shadow-sm border-none bg-white rounded p-6 mt-4">
                        <CardContent className="p-0">
                            <BulkFeePaymentUploadCreate onBatchSuccess={refetch} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Single Fee Payment Modal */}
            {isPayModalOpen && (
                <CreateFeePayment
                    isOpen={isPayModalOpen}
                    onClose={() => {
                        setIsPayModalOpen(false);
                        setSelectedAccountForPayment(null);
                    }}
                    refetchMember={refetch}
                    accounts={selectedAccountForPayment ? [selectedAccountForPayment] : (feeAccounts || [])}
                />
            )}
        </div>
    );
}
