"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useFetchGLAccounts } from "@/hooks/glaccounts/actions";
import { useFetchMember } from "@/hooks/members/actions";
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
    Building2,
    Pencil,
    Plus,
    FileUp,
    ListFilter
} from "lucide-react";

import CreateGLAccountModal from "@/forms/glaccounts/CreateGLAccount";
import UpdateGLAccountModal from "@/forms/glaccounts/UpdateGLAccount";
import BulkGLAccountCreate from "@/forms/glaccounts/BulkGLAccountCreate";
import BulkGLAccountUploadCreate from "@/forms/glaccounts/BulkGLAccountUploadCreate";

const TableSkeleton = ({ rows = 5, cols = 6 }) => {
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

export default function GLAccountsSetupPage() {
    const router = useRouter();
    const { data: myself } = useFetchMember();
    const {
        data: glaccounts,
        isLoading,
        refetch
    } = useFetchGLAccounts();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push("/sacco-admin/setup")}
                        className="rounded hover:bg-white"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-slate-900 flex items-center gap-2">
                            <Building2 className="w-6 h-6 text-[var(--accent)]" /> GL Accounts Setup
                        </h1>
                        <p className="text-slate-500 text-sm">
                            Manage your General Ledger chart of accounts and batch operations.
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold"
                    >
                        <Plus className="w-4 h-4 mr-1" /> Add Single Account
                    </Button>
                </div>
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
                        <span className="hidden sm:inline">Bulk Form</span>
                        <span className="sm:hidden">Bulk</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="bulk-upload"
                        className="flex items-center justify-center gap-2 px-4 py-3 text-xs sm:text-sm font-medium transition-all rounded data-[state=active]:bg-slate-50 data-[state=active]:text-[var(--accent)] data-[state=active]:shadow-sm"
                    >
                        <FileUp className="w-4 h-4 flex-shrink-0" />
                        <span className="hidden md:inline">Bulk Upload</span>
                        <span className="md:hidden">Upload</span>
                    </TabsTrigger>
                </TabsList>

                {/* List Tab */}
                <TabsContent value="list" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Card className="shadow-sm border-none">
                        <CardHeader className="bg-white border-b rounded-t px-6 py-4">
                            <CardTitle className="text-lg font-semibold">Configured GL Accounts</CardTitle>
                            <CardDescription className="text-xs">A comprehensive list of all your current ledger accounts.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/50">
                                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 pl-6 px-4 py-3">Account Name</TableHead>
                                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-4 py-3">Code</TableHead>
                                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-4 py-3">Category</TableHead>
                                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-4 py-3">Status</TableHead>
                                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-4 py-3">Type</TableHead>
                                            <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 text-right pr-6 px-4 py-3">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="p-6">
                                                    <TableSkeleton rows={5} cols={6} />
                                                </TableCell>
                                            </TableRow>
                                        ) : glaccounts?.length > 0 ? (
                                            glaccounts.map((acc) => (
                                                <TableRow key={acc.reference} className="hover:bg-slate-50 transition-colors group">
                                                    <TableCell className="text-sm font-medium pl-6 py-4">{acc.name}</TableCell>
                                                    <TableCell className="text-sm font-mono text-slate-600">{acc.code}</TableCell>
                                                    <TableCell className="text-sm">
                                                        <span className={`px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider ${acc.category === "ASSET" ? "bg-blue-50 text-blue-700" :
                                                            acc.category === "LIABILITY" ? "bg-amber-50 text-amber-700" :
                                                                acc.category === "EQUITY" ? "bg-purple-50 text-purple-700" :
                                                                    acc.category === "REVENUE" ? "bg-green-50 text-green-700" :
                                                                        "bg-rose-50 text-rose-700"
                                                                }`}>
                                                            {acc.category}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1.5">
                                                            <div className={`w-1.5 h-1.5 rounded ${acc.is_active ? "bg-green-500" : "bg-slate-300"}`} />
                                                            <span className={`text-[11px] font-semibold ${acc.is_active ? "text-green-700" : "text-slate-500"}`}>
                                                                {acc.is_active ? "ACTIVE" : "INACTIVE"}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-[11px] text-slate-500 italic">
                                                        {acc.is_current_account ? "Current Account" : "Standard"}
                                                    </TableCell>
                                                    <TableCell className="text-right pr-6 py-4">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-slate-400 hover:text-[var(--accent)] hover:bg-white border-transparent hover:border-slate-100 border"
                                                            onClick={() => {
                                                                setSelectedAccount(acc);
                                                                setIsUpdateModalOpen(true);
                                                            }}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center h-48 text-slate-400 text-sm">
                                                    No GL accounts found. Use the buttons above to create some.
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
                    <Card className="shadow-sm border-none bg-transparent">
                        <CardContent className="p-0">
                            <BulkGLAccountCreate onBatchSuccess={refetch} />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Bulk Upload Tab */}
                <TabsContent value="bulk-upload" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Card className="shadow-sm border-none bg-white rounded p-8">
                        <CardContent className="p-0">
                            <BulkGLAccountUploadCreate onBatchSuccess={refetch} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Existing Modals */}
            <CreateGLAccountModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                refetchGLAccounts={refetch}
            />
            <UpdateGLAccountModal
                isOpen={isUpdateModalOpen}
                onClose={() => setIsUpdateModalOpen(false)}
                refetchGLAccounts={refetch}
                glAccount={selectedAccount}
            />
        </div>
    );
}
