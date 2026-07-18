"use client";

import React, { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ChevronLeft,
    ArrowUpRight,
    ArrowDownLeft,
    Wallet,
    Tag,
    Activity,
    Calendar,
    Hash,
    Search
} from "lucide-react";
import { format } from "date-fns";
import { useFetchGLAccount } from "@/hooks/glaccounts/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function GLAccountReferencePage() {
    const { gl_reference } = useParams();
    const router = useRouter();
    const { data: account, isLoading, error } = useFetchGLAccount(gl_reference);
    const [searchTerm, setSearchTerm] = React.useState("");

    // Calculate totals (unchanged)
    const totals = useMemo(() => {
        if (!account?.entries) return { debit: 0, credit: 0 };
        return account.entries.reduce((acc, entry) => ({
            debit: acc.debit + Number(entry.debit),
            credit: acc.credit + Number(entry.credit)
        }), { debit: 0, credit: 0 });
    }, [account]);

    // Determine if this is a credit-normal account (Liability/Equity/Revenue)
    const isCreditNormal = useMemo(() => {
        if (!account?.category) return false;
        return ["LIABILITY", "EQUITY", "REVENUE"].includes(account.category.toUpperCase());
    }, [account?.category]);

    // Process entries: sort chronologically + calculate running balance
    const processedEntries = useMemo(() => {
        if (!account?.entries?.length) return [];

        const sorted = [...account.entries].sort((a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        let running = 0;
        return sorted.map((entry) => {
            const debit = Number(entry.debit || 0);
            const credit = Number(entry.credit || 0);
            const delta = isCreditNormal ? (credit - debit) : (debit - credit);
            running += delta;

            return {
                ...entry,
                runningBalance: running,
            };
        });
    }, [account?.entries, isCreditNormal]);

    // Filtered entries (search works on the processed list)
    const filteredEntries = useMemo(() => {
        if (!processedEntries.length) return [];
        return processedEntries.filter((entry) =>
            entry.batch_details?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.batch?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [processedEntries, searchTerm]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded h-8 w-8 border-b-2 border-[#ea1315]"></div>
            </div>
        );
    }

    if (error || !account) {
        return (
            <div className="p-8 text-center text-slate-500 italic">
                Account not found or an error occurred.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <Link
                        variant="ghost"
                        size="sm"
                        href="/sacco-admin/accounting"
                        className="p-0 hover:bg-transparent text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-2 group transition-all"
                    >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Accounting
                    </Link>
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl text-slate-900">
                            {account.name}
                        </h1>
                        <Badge variant="outline" className="bg-white border-slate-200 text-slate-500 px-2 py-0 h-6">
                            {account.code}
                        </Badge>
                        <Badge variant={account.is_active ? "success" : "secondary"} className="uppercase text-[10px] h-6">
                            {account.is_active ? "Active" : "Inactive"}
                        </Badge>
                    </div>
                    <p className="text-sm text-slate-500 font-medium">
                        GL Ledger Reference: <span className="text-slate-900 font-mono">{account.reference}</span>
                    </p>

                    {/* Extra metadata */}
                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-3">
                        <div>
                            Created: <span className="font-medium text-slate-700">
                                {format(new Date(account.created_at), "MMM dd, yyyy")}
                            </span>
                        </div>
                        {account.is_current_account && (
                            <Badge variant="outline" className="text-[10px] px-2 py-0 h-5">
                                Current Account
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Stats - unchanged layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-xs text-slate-400 uppercase tracking-wider">Current Balance</p>
                                <h3 className="text-xl text-slate-900 font-mono">
                                    KES {Number(account.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </h3>
                            </div>
                            <div className="w-12 h-12 rounded bg-slate-50 flex items-center justify-center group-hover:bg-[#ea1315]/10 transition-colors">
                                <Wallet className="w-6 h-6 text-[#ea1315]" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-xs text-slate-400 uppercase tracking-wider">Account Type</p>
                                <h3 className="text-xl text-slate-900 capitalize">
                                    {account.category?.toLowerCase()}
                                </h3>
                            </div>
                            <div className="w-12 h-12 rounded bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                <Tag className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-xs text-slate-400 uppercase tracking-wider">Total Debits</p>
                                <h3 className="text-xl text-emerald-600 font-mono">
                                    KES {totals.debit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </h3>
                            </div>
                            <div className="w-12 h-12 rounded bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                                <ArrowUpRight className="w-6 h-6 text-emerald-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-xs text-slate-400 uppercase tracking-wider">Total Credits</p>
                                <h3 className="text-xl text-rose-600 font-mono">
                                    KES {totals.credit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </h3>
                            </div>
                            <div className="w-12 h-12 rounded bg-rose-50 flex items-center justify-center group-hover:bg-rose-100 transition-colors">
                                <ArrowDownLeft className="w-6 h-6 text-rose-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Ledger Table */}
            <Card className="border-none shadow-sm bg-white rounded">
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b">
                    <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Activity className="w-5 h-5 text-[#ea1315]" />
                            Transaction Ledger
                        </CardTitle>
                        <CardDescription>
                            {filteredEntries.length} of {account.entries?.length || 0} journal entries • All movements impacting this account
                        </CardDescription>
                    </div>
                    <div className="w-full md:w-80">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search ledger..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 h-10 bg-slate-50 border-none rounded text-sm placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-[#ea1315]"
                            />
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                                <TableHead className="text-[10px] text-slate-500 uppercase tracking-wider py-4 pl-6">
                                    <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3" />DATE & TIME</div>
                                </TableHead>
                                <TableHead className="text-[10px] text-slate-500 uppercase tracking-wider py-4">
                                    <div className="flex items-center gap-1.5"><Hash className="w-3 h-3" />CODES</div>
                                </TableHead>
                                <TableHead className="text-[10px] text-slate-500 uppercase tracking-wider py-4">DESCRIPTION</TableHead>
                                <TableHead className="text-[10px] text-slate-500 uppercase tracking-wider py-4 text-right">DEBIT</TableHead>
                                <TableHead className="text-[10px] text-slate-500 uppercase tracking-wider py-4 text-right">CREDIT</TableHead>
                                <TableHead className="text-[10px] text-slate-500 uppercase tracking-wider py-4 text-right pr-6">BALANCE</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredEntries.map((entry) => (
                                <TableRow key={entry.id} className="hover:bg-slate-50/50 transition-colors border-b-slate-100">
                                    <TableCell className="py-4 pl-6">
                                        <div className="text-xs text-slate-900 leading-none">
                                            {format(new Date(entry.created_at), "MMM dd, yyyy")}
                                        </div>
                                        <div className="text-[10px] text-slate-500 font-medium mt-1 uppercase">
                                            {format(new Date(entry.created_at), "HH:mm:ss a")}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4 font-mono">
                                        <div className="text-[10px] text-slate-900">{entry.code}</div>
                                        <div className="text-[10px] text-slate-500 mt-0.5">{entry.batch}</div>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <div className="text-sm text-slate-700 leading-tight">
                                            {entry.batch_details?.description || "No description provided"}
                                        </div>
                                        <div className="text-[10px] text-[#ea1315] mt-1 uppercase tracking-wider flex items-center gap-1">
                                            <span className="w-1 h-1 rounded bg-[#ea1315]"></span>
                                            {entry.created_by || "System"}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4 text-right">
                                        {Number(entry.debit) > 0 ? (
                                            <span className="text-sm text-emerald-600 font-mono">
                                                {Number(entry.debit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        ) : (
                                            <span className="text-slate-300 font-mono text-xs">0.00</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="py-4 text-right">
                                        {Number(entry.credit) > 0 ? (
                                            <span className="text-sm text-rose-600 font-mono">
                                                {Number(entry.credit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        ) : (
                                            <span className="text-slate-300 font-mono text-xs">0.00</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="py-4 text-right pr-6 font-mono">
                                        <span className={`text-sm ${entry.runningBalance >= 0 ? "text-slate-900" : "text-rose-600"}`}>
                                            KES {Number(entry.runningBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredEntries.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-12 text-center text-slate-400 italic text-sm">
                                        {searchTerm ? "No transactions found matching your search." : "No transactions recorded for this account."}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}