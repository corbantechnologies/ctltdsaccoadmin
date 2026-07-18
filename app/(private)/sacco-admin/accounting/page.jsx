"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useFetchGLAccounts } from "@/hooks/glaccounts/actions";
import { useFetchJournalBatches } from "@/hooks/journalbatches/actions";
import { useFetchJournalEntries } from "@/hooks/journalentries/actions";
import CreateGLAccountModal from "@/forms/glaccounts/CreateGLAccount";
import JournalBatchDetails from "@/components/saccoadmin/accounting/JournalBatchDetails";
import BulkJournalBatchCreate from "@/forms/journalbatches/BulkJournalBatchCreate";
import BulkJournalBatchUploadCreate from "@/forms/journalbatches/BulkJournalBatchUploadCreate";
import LoadingSpinner from "@/components/general/LoadingSpinner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    Search,
    Filter,
    Plus,
    Eye,
    BookOpen,
    List,
    Receipt,
    ChevronLeft,
    ChevronRight,
    Download,
    Fingerprint
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

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

export default function AccountingPage() {
    const [activeTab, setActiveTab] = useState("gl-accounts");

    // States for GL Accounts
    const [createGLOpen, setCreateGLOpen] = useState(false);
    const { data: glAccounts, isLoading: isLoadingGL, refetch: refetchGL } = useFetchGLAccounts();

    // States for Journal Batches
    const { data: journalBatches, isLoading: isLoadingBatches, refetch: refetchBatches } = useFetchJournalBatches();
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [batchDetailsOpen, setBatchDetailsOpen] = useState(false);
    const [batchViewMode, setBatchViewMode] = useState("list"); // "list", "form", "upload"

    // States for Journal Entries
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedGL, setSelectedGL] = useState("all");
    const [selectedBatchFilter, setSelectedBatchFilter] = useState("all");

    const params = useMemo(() => ({
        page,
        search: searchQuery || undefined,
        account: selectedGL !== "all" ? selectedGL : undefined,
        batch: selectedBatchFilter !== "all" ? selectedBatchFilter : undefined,
    }), [page, searchQuery, selectedGL, selectedBatchFilter]);

    const { data: entriesData, isLoading: isLoadingEntries } = useFetchJournalEntries(params);

    const entries = entriesData?.results || [];
    const totalEntries = entriesData?.count || 0;
    const totalPages = Math.ceil(totalEntries / 10); // Assuming page_size=10

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight text-slate-900 flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-[#ea1315]" />
                        Accounting Dashboard
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Manage General Ledger, Journal Batches and Entries
                    </p>
                </div>
                <div className="flex gap-2">
                    {activeTab === "gl-accounts" && (
                        <Button
                            onClick={() => setCreateGLOpen(true)}
                            className="bg-[#ea1315] hover:bg-[#c71012] text-white flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            New GL Account
                        </Button>
                    )}
                    {/* <Button variant="outline" className="flex items-center gap-2 border-slate-300">
                        <Download className="w-4 h-4" />
                        Export
                    </Button> */}
                </div>
            </div>

            <Tabs defaultValue="gl-accounts" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-white border shadow-sm p-1 mb-6 flex h-auto overflow-x-auto no-scrollbar justify-start md:justify-center">
                    <TabsTrigger value="gl-accounts" className="flex items-center gap-2 px-3 md:px-6 py-2 text-xs md:text-sm whitespace-nowrap">
                        <List className="w-4 h-4" />
                        GL Accounts
                    </TabsTrigger>
                    <TabsTrigger value="journal-batches" className="flex items-center gap-2 px-3 md:px-6 py-2 text-xs md:text-sm whitespace-nowrap">
                        <Receipt className="w-4 h-4" />
                        Journal Batches
                    </TabsTrigger>
                    <TabsTrigger value="journal-entries" className="flex items-center gap-2 px-3 md:px-6 py-2 text-xs md:text-sm whitespace-nowrap">
                        <Fingerprint className="w-4 h-4" />
                        Journal Entries
                    </TabsTrigger>
                </TabsList>

                {/* GL ACCOUNTS TAB */}
                <TabsContent value="gl-accounts">
                    <Card className="shadow-sm border-none">
                        <CardHeader className="bg-white border-b rounded-t p-4 md:p-6">
                            <CardTitle className="text-lg font-semibold">Chart of Accounts</CardTitle>
                            <CardDescription>All general ledger accounts configured in the system</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 overflow-x-auto">
                            {isLoadingGL ? (
                                <TableSkeleton rows={5} cols={5} />
                            ) : glAccounts?.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/50">
                                            <TableHead className="font-semibold text-xs">ACCOUNT NAME</TableHead>
                                            <TableHead className="font-semibold text-xs">CODE</TableHead>
                                            <TableHead className="font-semibold text-xs">CATEGORY</TableHead>
                                            <TableHead className="font-semibold text-xs">BALANCE</TableHead>
                                            <TableHead className="font-semibold text-xs">ACTION</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {glAccounts.map((acc) => (
                                            <TableRow key={acc.id || acc.reference} className="hover:bg-slate-50/50 transition-colors">
                                                <TableCell className="text-sm font-medium text-slate-700">{acc.name}</TableCell>
                                                <TableCell className="text-sm text-slate-500 font-mono">{acc.code}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="capitalize text-[10px] font-semibold">
                                                        {acc.category?.toLowerCase()}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm font-semibold text-slate-900 font-mono">
                                                    KES {Number(acc.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </TableCell>
                                                <TableCell>
                                                    <Link href={`/sacco-admin/accounting/${acc.reference}`} target="_blank">
                                                        <Button variant="ghost" size="sm" className="text-[#ea1315] hover:bg-[#ea1315]/10 flex items-center gap-1 font-semibold group">
                                                            <Eye className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                                            View
                                                        </Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="p-12 text-center">
                                    <p className="text-slate-500 italic">No GL accounts found.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* JOURNAL BATCHES TAB */}
                <TabsContent value="journal-batches">
                    <Card className="shadow-sm border-none">
                        <CardHeader className="bg-white border-b rounded-t p-4 md:p-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <CardTitle className="text-lg font-semibold">Journal Batches</CardTitle>
                                    <CardDescription>Overview of transaction batches</CardDescription>
                                </div>
                                <div className="flex bg-slate-100 p-1 rounded self-end md:self-auto">
                                    <button
                                        onClick={() => setBatchViewMode("list")}
                                        className={`px-4 py-1.5 text-xs font-semibold rounded transition-all ${batchViewMode === "list" ? "bg-white text-[#ea1315] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                                    >
                                        List View
                                    </button>
                                    <button
                                        onClick={() => setBatchViewMode("form")}
                                        className={`px-4 py-1.5 text-xs font-semibold rounded transition-all ${batchViewMode === "form" ? "bg-white text-[#ea1315] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                                    >
                                        Bulk Form
                                    </button>
                                    <button
                                        onClick={() => setBatchViewMode("upload")}
                                        className={`px-4 py-1.5 text-xs font-semibold rounded transition-all ${batchViewMode === "upload" ? "bg-white text-[#ea1315] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                                    >
                                        Bulk Upload
                                    </button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 overflow-x-auto min-h-[400px]">
                            {isLoadingBatches ? (
                                <TableSkeleton rows={5} cols={6} />
                            ) : batchViewMode === "list" ? (
                                <>
                                    {journalBatches?.length > 0 ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-slate-50/50">
                                                    <TableHead className="font-semibold text-xs">BATCH CODE</TableHead>
                                                    <TableHead className="font-semibold text-xs">DESCRIPTION</TableHead>
                                                    <TableHead className="font-semibold text-xs">DATE</TableHead>
                                                    <TableHead className="font-semibold text-xs">STATUS</TableHead>
                                                    <TableHead className="font-semibold text-xs text-right">ENTRIES</TableHead>
                                                    <TableHead className="font-semibold text-xs text-right">ACTION</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {journalBatches.map((batch) => (
                                                    <TableRow key={batch.id || batch.reference} className="hover:bg-slate-50/50 transition-colors">
                                                        <TableCell className="text-sm font-semibold text-slate-700">{batch.code}</TableCell>
                                                        <TableCell className="text-sm text-slate-500 max-w-xs truncate">{batch.description}</TableCell>
                                                        <TableCell className="text-sm text-slate-500">
                                                            {batch.posting_date}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant={batch.posted ? "success" : "secondary"} className="text-[10px] font-semibold">
                                                                {batch.posted ? "Posted" : "Draft"}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-sm text-right font-medium">{batch.entries?.length || 0}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-[#ea1315]"
                                                                onClick={() => {
                                                                    setSelectedBatch(batch);
                                                                    setBatchDetailsOpen(true);
                                                                }}
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <div className="p-12 text-center text-slate-500 italic">No journal batches available.</div>
                                    )}
                                </>
                            ) : null}

                            {batchViewMode === "form" && (
                                <div className="p-6">
                                    <BulkJournalBatchCreate
                                        onBatchSuccess={() => {
                                            setBatchViewMode("list");
                                            refetchBatches();
                                        }}
                                    />
                                </div>
                            )}

                            {batchViewMode === "upload" && (
                                <div className="p-6">
                                    <BulkJournalBatchUploadCreate
                                        onBatchSuccess={() => {
                                            setBatchViewMode("list");
                                            refetchBatches();
                                        }}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* JOURNAL ENTRIES TAB */}
                <TabsContent value="journal-entries">
                    <Card className="shadow-sm border-none">
                        <CardHeader className="bg-white border-b rounded-t p-4 md:p-6">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="text-lg font-semibold">Journal Entries</CardTitle>
                                    <CardDescription>Detailed list of all ledger entries</CardDescription>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                                        <Input
                                            placeholder="Search code or account..."
                                            className="pl-9 w-[200px] h-9 text-xs"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <Select value={selectedGL} onValueChange={setSelectedGL}>
                                        <SelectTrigger className="w-[160px] h-9 text-xs">
                                            <Filter className="w-3 h-3 mr-2 text-slate-500" />
                                            <SelectValue placeholder="GL Account" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Accounts</SelectItem>
                                            {glAccounts?.map(acc => (
                                                <SelectItem key={acc.id || acc.reference} value={acc.name}>{acc.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Select value={selectedBatchFilter} onValueChange={setSelectedBatchFilter}>
                                        <SelectTrigger className="w-[160px] h-9 text-xs">
                                            <Receipt className="w-3 h-3 mr-2 text-slate-500" />
                                            <SelectValue placeholder="Batch" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Batches</SelectItem>
                                            {journalBatches?.map(batch => (
                                                <SelectItem key={batch.id || batch.reference} value={batch.code}>{batch.code}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 overflow-x-auto">
                            {isLoadingEntries ? (
                                <TableSkeleton rows={5} cols={6} />
                            ) : entries.length > 0 ? (
                                <>
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50/50">
                                                <TableHead className="font-semibold text-xs">CODE</TableHead>
                                                <TableHead className="font-semibold text-xs">ACCOUNT</TableHead>
                                                <TableHead className="font-semibold text-xs text-right">DEBIT</TableHead>
                                                <TableHead className="font-semibold text-xs text-right">CREDIT</TableHead>
                                                <TableHead className="font-semibold text-xs">BATCH</TableHead>
                                                <TableHead className="font-semibold text-xs">DATE</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {entries.map((entry) => (
                                                <TableRow key={entry.id || entry.reference} className="hover:bg-slate-50/50 transition-colors">
                                                    <TableCell className="text-sm font-medium text-slate-600">{entry.code}</TableCell>
                                                    <TableCell className="text-sm font-semibold text-slate-800">{entry.account}</TableCell>
                                                    <TableCell className="text-sm text-right font-mono text-slate-900 font-semibold">
                                                        {Number(entry.debit) > 0 ? Number(entry.debit).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-"}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-right font-mono text-slate-900 font-semibold">
                                                        {Number(entry.credit) > 0 ? Number(entry.credit).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-"}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-slate-500 font-mono text-xs">{entry.batch}</TableCell>
                                                    <TableCell className="text-sm text-slate-500">
                                                        {entry.created_at ? format(new Date(entry.created_at), "MMM d, HH:mm") : "-"}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                    {/* Pagination */}
                                    <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t bg-slate-50/30 gap-4">
                                        <p className="text-xs text-slate-500 font-medium order-2 sm:order-1">
                                            Showing <span className="text-slate-900">{entries.length}</span> of <span className="text-slate-900">{totalEntries}</span> entries
                                        </p>
                                        <div className="flex items-center gap-2 order-1 sm:order-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={page === 1}
                                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                                className="h-8 px-2"
                                            >
                                                <ChevronLeft className="w-4 h-4 mr-1" />
                                                Prev
                                            </Button>
                                            <div className="flex items-center px-4 text-xs font-semibold text-slate-700 bg-white border rounded h-8">
                                                Page {page} of {totalPages || 1}
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={page >= totalPages}
                                                onClick={() => setPage(p => p + 1)}
                                                className="h-8 px-2"
                                            >
                                                Next
                                                <ChevronRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="p-12 text-center text-slate-500 italic">No journal entries found matching filters.</div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* MODALS */}
            <CreateGLAccountModal
                isOpen={createGLOpen}
                onClose={() => setCreateGLOpen(false)}
                refetchGLAccounts={refetchGL}
            />

            <JournalBatchDetails
                isOpen={batchDetailsOpen}
                onClose={() => setBatchDetailsOpen(false)}
                batch={selectedBatch}
                refetch={refetchBatches}
            />
        </div>
    );
}
