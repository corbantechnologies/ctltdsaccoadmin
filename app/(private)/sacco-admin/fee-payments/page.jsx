"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFetchFeeAccounts } from "@/hooks/feeaccounts/actions";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Search,
    Receipt,
    FileUp,
    Plus,
    BadgePercent,
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    History,
    Wallet,
} from "lucide-react";
import Link from "next/link";

import CreateFeePayment from "@/forms/feepayments/CreateFeePayment";
import { formatCurrency } from "@/lib/utils";
import PageActions from "@/components/general/PageActions";
import StatTiles from "@/components/general/StatTiles";
import DateRangeFilter, { inDateRange, formatDay } from "@/components/general/DateRangeFilter";

const TableSkeleton = ({ rows = 5, cols = 5 }) => (
    <div className="space-y-2 w-full animate-pulse p-4">
        {[...Array(rows)].map((_, i) => (
            <div key={i} className="flex gap-4 items-center py-1.5 border-b border-slate-100 last:border-0">
                {[...Array(cols)].map((_, j) => (
                    <div key={j} className="h-4 bg-slate-100 rounded flex-1" />
                ))}
            </div>
        ))}
    </div>
);

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

// Date of the latest completed payment on a fee account, or "" if none.
const lastPaymentDate = (acc) => {
    const dates = (acc.fee_payments || [])
        .filter((p) => p.transaction_date && (!p.transaction_status || p.transaction_status === "Completed"))
        .map((p) => String(p.transaction_date));
    return dates.length ? dates.sort().at(-1) : "";
};

// Used to put the most recent activity first: last payment, else when the account was opened.
const activityDate = (acc) => lastPaymentDate(acc) || String(acc.created_at || "");

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
    const [dateRange, setDateRange] = useState({ from: "", to: "" });
    const [page, setPage] = useState(1);
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
            const matchesDate = inDateRange(lastPaymentDate(acc), dateRange.from, dateRange.to);
            return matchesSearch && matchesFeeType && matchesStatus && matchesDate;
        });
    }, [feeAccounts, searchTerm, feeTypeFilter, statusFilter, dateRange]);

    // One block per member, with all of that member's fee accounts under it.
    // Members with the most recent fee activity come first.
    const groupedList = useMemo(() => {
        const groups = {};
        filteredAccounts.forEach((acc) => {
            const key = memberNo(acc) || memberName(acc);
            if (!groups[key]) {
                groups[key] = { member_no: memberNo(acc), member_name: memberName(acc), accounts: [], outstanding: 0, paid: 0, latest: "" };
            }
            const g = groups[key];
            g.accounts.push(acc);
            g.outstanding += Number(acc.outstanding_balance || 0);
            g.paid += Number(acc.amount_paid || 0);
            const d = activityDate(acc);
            if (d > g.latest) g.latest = d;
        });
        Object.values(groups).forEach((g) =>
            g.accounts.sort((a, b) => activityDate(b).localeCompare(activityDate(a)) || feeTypeName(a).localeCompare(feeTypeName(b)))
        );
        return Object.values(groups).sort((a, b) => b.latest.localeCompare(a.latest) || a.member_name.localeCompare(b.member_name));
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

    const selectCls =
        "h-8 px-2 rounded-md text-xs border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]";

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
                            <Receipt className="w-5 h-5 text-[var(--accent)]" /> Fee Accounts
                        </h1>
                        <p className="text-slate-500 text-xs">
                            What each member&apos;s fees cost, what has been paid and what is still owed.
                        </p>
                    </div>
                </div>
                <PageActions
                    items={[
                        { label: "Record Fee Payment", description: "One payment for one member", icon: Wallet, onClick: () => openPayment(null) },
                        { label: "Manual Batch", description: "Several payments by filling in a form", icon: Plus, href: "/sacco-admin/fee-payments/batch" },
                        { label: "CSV Import", description: "Payments in bulk from a CSV file", icon: FileUp, href: "/sacco-admin/fee-payments/upload" },
                        null,
                        { label: "Fee Types", description: "Set up the fees members pay", icon: BadgePercent, href: "/sacco-admin/setup/feetypes" },
                    ]}
                />
            </div>

            <StatTiles
                tiles={[
                    { label: "Still Owed", value: formatCurrency(totals.outstanding), tone: totals.outstanding > 0 ? "bad" : "default" },
                    { label: "Collected So Far", value: formatCurrency(totals.collected), tone: "good" },
                    { label: "Members Still Owing", value: totals.owingMembers },
                    { label: "Fully Paid Accounts", value: `${totals.paidAccounts} of ${feeAccounts.length}` },
                ]}
            />

            {/* Filter Bar */}
            <div className="bg-white rounded-lg p-3 border border-slate-200 flex flex-col lg:flex-row gap-2 lg:items-center">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <Input
                        placeholder="Search by member name, member #, account # or fee type..."
                        className="pl-9 h-8 rounded-md border-slate-200 text-xs"
                        value={searchTerm}
                        onChange={(e) => resetPage(setSearchTerm)(e.target.value)}
                    />
                </div>
                <select value={statusFilter} onChange={(e) => resetPage(setStatusFilter)(e.target.value)} className={selectCls}>
                    <option value="all">All Statuses</option>
                    <option value="unpaid">Still Owing (any)</option>
                    <option value="owing">Not Paid</option>
                    <option value="partial">Partly Paid</option>
                    <option value="paid">Fully Paid</option>
                </select>
                <select value={feeTypeFilter} onChange={(e) => resetPage(setFeeTypeFilter)(e.target.value)} className={selectCls}>
                    <option value="all">All Fee Types</option>
                    {feeTypesList.map((type) => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
                <DateRangeFilter label="Paid" from={dateRange.from} to={dateRange.to} onChange={resetPage(setDateRange)} />
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200">
                    <p className="text-sm font-semibold text-slate-900">Member Fee Accounts</p>
                    <p className="text-[11px] text-slate-400">
                        {totalMembers} members · {filteredAccounts.length} fee accounts
                    </p>
                </div>

                {isLoading ? (
                    <TableSkeleton rows={8} cols={6} />
                ) : (
                    <Table className="min-w-[880px]">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Member</TableHead>
                                <TableHead>Account</TableHead>
                                <TableHead>Fee</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Paid</TableHead>
                                <TableHead className="text-right">Balance</TableHead>
                                <TableHead>Last Payment</TableHead>
                                <TableHead className="text-right"><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedGroups.length > 0 ? (
                                paginatedGroups.map((group) =>
                                    group.accounts.map((acc, i) => {
                                        const status = feeStatus(acc);
                                        const style = STATUS_STYLES[status];
                                        const paid = Number(acc.amount_paid || 0);
                                        const outstanding = Number(acc.outstanding_balance || 0);
                                        const total = paid + outstanding;
                                        const last = i === group.accounts.length - 1;
                                        return (
                                            <TableRow
                                                key={acc.reference}
                                                className={last ? "border-b border-slate-200" : "border-b border-dashed border-slate-100"}
                                            >
                                                {i === 0 && (
                                                    <TableCell rowSpan={group.accounts.length} className="align-top bg-white border-r border-slate-100">
                                                        <Link
                                                            href={`/sacco-admin/members/${group.member_no}`}
                                                            className="font-medium text-slate-900 hover:text-[var(--accent)] hover:underline"
                                                        >
                                                            {group.member_name}
                                                        </Link>
                                                        <div className="font-mono text-[10px] text-slate-400">{group.member_no}</div>
                                                        <div className="mt-1 text-[10px] text-slate-500">
                                                            Owes{" "}
                                                            <span className={`font-semibold tabular-nums ${group.outstanding > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                                                                {formatCurrency(group.outstanding)}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                )}
                                                <TableCell className="font-mono text-[11px] text-slate-500">{acc.account_number}</TableCell>
                                                <TableCell className="text-slate-800">{feeTypeName(acc)}</TableCell>
                                                <TableCell>
                                                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide ${style.text}`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                                                        {style.label}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums text-slate-600">
                                                    {formatCurrency(paid)} <span className="text-slate-400">/ {formatCurrency(total)}</span>
                                                </TableCell>
                                                <TableCell className={`text-right tabular-nums font-semibold ${outstanding > 0 ? "text-slate-900" : "text-emerald-600"}`}>
                                                    {formatCurrency(outstanding)}
                                                </TableCell>
                                                <TableCell className="tabular-nums text-slate-600">{formatDay(lastPaymentDate(acc) || null)}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="inline-flex items-center gap-1">
                                                        {outstanding > 0 && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => openPayment(acc)}
                                                                className="h-6 px-2 text-[11px] font-medium text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                                                                title="Record a payment on this fee"
                                                            >
                                                                Pay
                                                            </Button>
                                                        )}
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6 text-slate-400 hover:text-[var(--accent)]"
                                                                    title="Payments on this fee"
                                                                >
                                                                    <History className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent align="end" className="w-96 max-w-[90vw] p-3">
                                                                <p className="mb-1 text-xs font-semibold text-slate-800">
                                                                    {feeTypeName(acc)} · <span className="font-mono font-normal text-slate-500">{acc.account_number}</span>
                                                                </p>
                                                                <PaymentHistory payments={acc.fee_payments} />
                                                            </PopoverContent>
                                                        </Popover>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-12 text-slate-400">
                                        No fee accounts match your search or filters.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-4 py-2.5 border-t border-slate-200">
                        <p className="text-[11px] text-slate-500">
                            Members {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, totalMembers)} of {totalMembers} · Page {currentPage} of {totalPages}
                        </p>
                        <div className="flex gap-1.5">
                            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setPage(Math.max(1, currentPage - 1))} className="h-7 text-[11px]">
                                <ChevronLeft className="w-3.5 h-3.5 mr-0.5" /> Previous
                            </Button>
                            <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setPage(Math.min(totalPages, currentPage + 1))} className="h-7 text-[11px]">
                                Next <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

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
