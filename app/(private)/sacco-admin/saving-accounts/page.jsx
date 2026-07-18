"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFetchSavings } from "@/hooks/savings/actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

    // Filter savings client-side
    const filteredSavings = React.useMemo(() => {
        const rawSavings = savingsData?.results || savingsData || [];
        const term = searchInput.trim().toLowerCase();
        
        return rawSavings.filter((acc) => {
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
    }, [savingsData, searchInput, statusFilter]);

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
    const pageSize = 10;
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
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-6 space-y-6">
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
                        <h1 className="text-xl font-semibold tracking-tight text-slate-900 flex items-center gap-2">
                            <PiggyBank className="w-6 h-6 text-[var(--accent)]" /> Savings Accounts
                        </h1>
                        <p className="text-slate-500 text-sm font-medium">
                            Manage member savings accounts, view balances, and review transaction history.
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

            {/* Filters and List */}
            <Card className="shadow-sm border-none overflow-hidden">
                <CardHeader className="bg-white border-b px-6 py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-lg font-semibold">Member Savings Accounts</CardTitle>
                            <CardDescription className="text-xs font-medium">A comprehensive list of all savings accounts in the SACCO.</CardDescription>
                        </div>
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded w-fit">
                            Total: {totalCount} Accounts
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    {/* Search and Filters */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <Label htmlFor="search" className="sr-only">Search Accounts</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <Input
                                    id="search"
                                    placeholder="Search by member name or account number..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    className="pl-10 border-black rounded text-base"
                                />
                            </div>
                        </div>
                        <div className="w-full sm:w-48">
                            <Label htmlFor="status-filter" className="sr-only">Filter by Status</Label>
                            <select
                                id="status-filter"
                                value={statusFilter}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="w-full border border-black rounded px-3 py-2 text-base focus:ring-2 transition-colors"
                            >
                                <option value="all">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    {/* Table View */}
                    {isLoading ? (
                        <TableSkeleton rows={8} cols={2} />
                    ) : (
                        <>
                            <div className="overflow-x-auto border border-slate-100 rounded">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/50">
                                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 pl-6 py-3 w-1/4">Member Details</TableHead>
                                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 py-3">Savings Accounts Details</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedGroupedList.length > 0 ? (
                                            paginatedGroupedList.map((memberGroup) => (
                                                <TableRow key={memberGroup.member_name} className="hover:bg-slate-50/30 transition-colors border-b border-slate-100">
                                                    <TableCell className="pl-6 py-4 align-top">
                                                        <div className="flex flex-col">
                                                            <Link
                                                                href={`/sacco-admin/members/${memberGroup.accounts[0]?.member}`}
                                                                className="text-sm font-semibold text-slate-900 uppercase tracking-tight hover:text-[var(--accent)] hover:underline block"
                                                            >
                                                                {memberGroup.member_name}
                                                            </Link>
                                                            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-tighter mt-1">Sacco Member</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-4 pr-6 align-top">
                                                        <div className="space-y-3">
                                                            {memberGroup.accounts.map((acc) => (
                                                                <div key={acc.reference} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50/50 hover:bg-slate-50/80 border border-slate-100 rounded-md transition-all">
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-50 text-[var(--accent)] font-mono">
                                                                            {acc.account_number}
                                                                        </span>
                                                                        <span className="text-xs font-semibold text-slate-600">
                                                                            {acc.account_type}
                                                                        </span>
                                                                        <div className="flex items-center gap-1">
                                                                            <div className={`w-1.5 h-1.5 rounded-full ${acc.is_active ? "bg-emerald-500" : "bg-slate-300"}`} />
                                                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${acc.is_active ? "text-emerald-600" : "text-slate-500"}`}>
                                                                                {acc.is_active ? "Active" : "Inactive"}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center justify-between sm:justify-end gap-4 ml-auto sm:ml-0">
                                                                        <span className="text-sm font-semibold text-slate-900 font-mono">
                                                                            KES {parseFloat(acc.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                                        </span>
                                                                        <div className="flex gap-1.5">
                                                                            <Button
                                                                                variant="outline"
                                                                                size="icon"
                                                                                className="h-7 w-7 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 rounded transition-all"
                                                                                onClick={() => {
                                                                                    setSelectedAccount(acc);
                                                                                    setIsCreateModalOpen(true);
                                                                                }}
                                                                                title="Direct Deposit"
                                                                            >
                                                                                <TrendingUp className="h-3.5 w-3.5" />
                                                                            </Button>
                                                                            <Button
                                                                                variant="outline"
                                                                                size="icon"
                                                                                className="h-7 w-7 text-slate-400 hover:text-[var(--accent)] hover:bg-slate-100 hover:border-slate-300 rounded transition-all"
                                                                                onClick={() => router.push(`/sacco-admin/saving-accounts/${acc.reference}`)}
                                                                                title="View Transactions"
                                                                            >
                                                                                <Eye className="h-3.5 w-3.5" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={2} className="text-center h-64 text-slate-400 text-sm font-medium">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <PiggyBank className="w-12 h-12 text-slate-100" />
                                                        No savings accounts found.
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-t rounded-b">
                                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                                        Showing Page {page} of {totalPages}
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={page === 1}
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            className="h-8 text-[11px] font-semibold uppercase tracking-wider"
                                        >
                                            <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={page === totalPages}
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
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

            {/* Single Deposit Modal */}
            {isCreateModalOpen && (
                <CreateDepositAdmin
                    isOpen={isCreateModalOpen}
                    onClose={() => {
                        setIsCreateModalOpen(false);
                        setSelectedAccount(null);
                    }}
                    refetchMember={refetch}
                    accounts={savings} 
                />
            )}
        </div>
    );
}
