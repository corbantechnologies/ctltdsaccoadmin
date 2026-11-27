"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFetchSavings } from "@/hooks/savings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    ChevronLeft,
    ChevronRight,
    Eye,
    TrendingUp,
    Search
} from "lucide-react";

import CreateDepositAdmin from "@/forms/savingsdeposits/CreateDepositAdmin";
import { formatCurrency } from "@/lib/utils";

const TableSkeleton = ({ rows = 5, cols = 6 }) => {
    return (
        <div className="border border-slate-100 rounded overflow-hidden bg-white">
            <Table>
                <TableHeader className="bg-slate-50">
                    <TableRow>
                        {Array.from({ length: cols }).map((_, i) => (
                            <TableHead key={i}>
                                <div className="h-4 bg-slate-200 rounded w-16 animate-pulse" />
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: rows }).map((_, rowIndex) => (
                        <TableRow key={rowIndex}>
                            {Array.from({ length: cols }).map((_, colIndex) => (
                                <TableCell key={colIndex}>
                                    <div
                                        className="h-4 bg-slate-200 rounded animate-pulse"
                                        style={{ width: `${Math.floor(((rowIndex + colIndex) % 5) * 10) + 40}%` }}
                                    />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default function SavingAccountsPage() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const { 
        data: savingsData, 
        isLoading, 
        refetch 
    } = useFetchSavings();
    
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);

    const savings = React.useMemo(() => {
        return savingsData?.results || (Array.isArray(savingsData) ? savingsData : []);
    }, [savingsData]);

    // Filter savings client-side
    const filteredSavings = React.useMemo(() => {
        const term = searchInput.trim().toLowerCase();
        
        return savings.filter((acc) => {
            const matchesSearch = 
                !term || 
                acc.member_name?.toLowerCase().includes(term) ||
                acc.account_number?.toLowerCase().includes(term);

            const matchesStatus = 
                statusFilter === "all" ||
                (statusFilter === "active" && acc.is_active) ||
                (statusFilter === "inactive" && !acc.is_active);

            return matchesSearch && matchesStatus;
        });
    }, [savings, searchInput, statusFilter]);

    // Group the FILTERED savings by member name
    const groupedSavings = React.useMemo(() => {
        return filteredSavings.reduce((acc, current) => {
            const memberName = current.member_name;
            if (!acc[memberName]) {
                acc[memberName] = {
                    member_name: memberName,
                    accounts: []
                };
            }
            acc[memberName].accounts.push(current);
            return acc;
        }, {});
    }, [filteredSavings]);
    
    const groupedList = React.useMemo(() => Object.values(groupedSavings), [groupedSavings]);

    const totalCount = groupedList.length; // total unique members matching filters
    const pageSize = 50;
    const totalPages = Math.ceil(totalCount / pageSize);
    
    const paginatedGroupedList = React.useMemo(() => {
        return groupedList.slice((page - 1) * pageSize, page * pageSize);
    }, [groupedList, page, pageSize]);

    const handleSearchChange = (val) => {
        setSearchInput(val);
        setPage(1);
    };

    const handleStatusChange = (val) => {
        setStatusFilter(val);
        setPage(1);
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-6 space-y-4 pb-16">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="rounded hover:bg-white border"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-lg font-semibold tracking-tight text-slate-900 flex items-center gap-2">
                            <PiggyBank className="w-5 h-5 text-[var(--accent)]" /> Savings Accounts
                        </h1>
                        <p className="text-slate-500 text-xs">
                            Manage member savings accounts, view balances, and review transaction history.
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold px-4 h-9"
                    >
                        <Plus className="w-4 h-4 mr-1" /> Single Deposit
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg p-3 border border-slate-200 flex flex-col sm:flex-row gap-2">
                <div className="flex-1 relative">
                    <Label htmlFor="search" className="sr-only">Search Accounts</Label>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <Input
                        id="search"
                        placeholder="Search by member name or account number..."
                        value={searchInput}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-9 h-8 rounded-md border-slate-200 text-xs"
                    />
                </div>
                <Label htmlFor="status-filter" className="sr-only">Filter by Status</Label>
                <select
                    id="status-filter"
                    value={statusFilter}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="h-8 px-2 rounded-md text-xs border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200">
                    <p className="text-sm font-semibold text-slate-900">Member Savings Accounts</p>
                    <p className="text-[11px] text-slate-400">
                        {totalCount} members · {filteredSavings.length} accounts
                    </p>
                </div>

                {isLoading ? (
                    <TableSkeleton rows={8} cols={5} />
                ) : (
                    <Table className="min-w-[720px]">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Member</TableHead>
                                <TableHead>Account</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Balance</TableHead>
                                <TableHead className="text-right"><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedGroupedList.length > 0 ? (
                                paginatedGroupedList.map((memberGroup) => {
                                    const memberTotal = memberGroup.accounts.reduce((sum, a) => sum + Number(a.balance || 0), 0);
                                    return memberGroup.accounts.map((acc, i) => (
                                        <TableRow
                                            key={acc.reference}
                                            className={i === memberGroup.accounts.length - 1 ? "border-b border-slate-200" : "border-b border-dashed border-slate-100"}
                                        >
                                            {i === 0 && (
                                                <TableCell rowSpan={memberGroup.accounts.length} className="align-top bg-white border-r border-slate-100">
                                                    <Link
                                                        href={`/sacco-admin/members/${acc.member}`}
                                                        className="font-medium text-slate-900 hover:text-[var(--accent)] hover:underline"
                                                    >
                                                        {memberGroup.member_name}
                                                    </Link>
                                                    {memberGroup.accounts.length > 1 && (
                                                        <div className="mt-0.5 text-[10px] text-slate-500">
                                                            {memberGroup.accounts.length} accounts · <span className="tabular-nums font-semibold text-slate-700">{formatCurrency(memberTotal)}</span>
                                                        </div>
                                                    )}
                                                </TableCell>
                                            )}
                                            <TableCell className="font-mono text-[11px] text-slate-500">{acc.account_number}</TableCell>
                                            <TableCell className="text-slate-800">{acc.account_type}</TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide ${acc.is_active ? "text-emerald-600" : "text-slate-500"}`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${acc.is_active ? "bg-emerald-500" : "bg-slate-300"}`} />
                                                    {acc.is_active ? "Active" : "Inactive"}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums font-semibold text-slate-900">
                                                {formatCurrency(acc.balance || 0)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="inline-flex items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-slate-400 hover:text-emerald-600"
                                                        onClick={() => {
                                                            setSelectedAccount(acc);
                                                            setIsCreateModalOpen(true);
                                                        }}
                                                        title="Deposit"
                                                    >
                                                        <TrendingUp className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-slate-400 hover:text-[var(--accent)]"
                                                        onClick={() => router.push(`/sacco-admin/saving-accounts/${acc.reference}`)}
                                                        title="View transactions"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ));
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                                        No savings accounts found.
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
                            Members {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)} of {totalCount} · Page {page} of {totalPages}
                        </p>
                        <div className="flex gap-1.5">
                            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="h-7 text-[11px]">
                                <ChevronLeft className="w-3.5 h-3.5 mr-0.5" /> Previous
                            </Button>
                            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="h-7 text-[11px]">
                                Next <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Single Deposit Modal */}
            {isCreateModalOpen && (
                <CreateDepositAdmin
                    isOpen={isCreateModalOpen}
                    onClose={() => {
                        setIsCreateModalOpen(false);
                        setSelectedAccount(null);
                    }}
                    refetchMember={refetch}
                    accounts={selectedAccount ? [selectedAccount] : savings} 
                />
            )}
        </div>
    );
}
