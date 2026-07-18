"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useFetchSavingsTypes } from "@/hooks/savingtypes/actions";
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
    PiggyBank,
    Pencil,
    Plus,
    FileUp,
    ListFilter,
    ShieldCheck,
    Coins
} from "lucide-react";

import CreateSavingTypeModal from "@/forms/savingtypes/CreateSavingType";
import UpdateSavingTypeModal from "@/forms/savingtypes/UpdateSavingType";
import BulkSavingTypeCreate from "@/forms/savingtypes/BulkSavingTypeCreate";
import BulkSavingTypeUploadCreate from "@/forms/savingtypes/BulkSavingTypeUploadCreate";

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

export default function SavingTypesSetupPage() {
    const router = useRouter();
    const { data: myself } = useFetchMember();
    const {
        data: savingTypes,
        isLoading,
        refetch
    } = useFetchSavingsTypes();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedType, setSelectedType] = useState(null);

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push("/sacco-admin/setup")}
                        className="rounded hover:bg-white text-black hover:text-[var(--accent)] transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl  tracking-tight text-slate-900 flex items-center gap-2">
                            <PiggyBank className="w-6 h-6 text-[var(--accent)]" /> Savings Product Setup
                        </h1>
                        <p className="text-black text-sm italic">
                            Configure deposit types, interest yields, and guarantee permissions.
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs  shadow-sm rounded"
                    >
                        <Plus className="w-4 h-4 mr-1.5" /> Define New Product
                    </Button>
                </div>
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="list">
                <TabsList className="bg-white border p-1 shadow-sm mb-6 w-full h-auto rounded grid grid-cols-3 gap-1 overflow-hidden">

                    <TabsTrigger
                        value="list"
                        className="flex items-center justify-center gap-2 px-4 py-3 text-xs sm:text-sm font-medium transition-all rounded data-[state=active]:bg-slate-50 data-[state=active]:text-[var(--accent)] data-[state=active]:shadow-sm"
                    >
                        <ListFilter className="w-4 h-4 flex-shrink-0" />
                        <span className="hidden sm:inline">All Products</span>
                        <span className="sm:hidden">Products</span>
                    </TabsTrigger>

                    <TabsTrigger
                        value="bulk-create"
                        className="flex items-center justify-center gap-2 px-4 py-3 text-xs sm:text-sm font-medium transition-all rounded data-[state=active]:bg-slate-50 data-[state=active]:text-[var(--accent)] data-[state=active]:shadow-sm"
                    >
                        <Plus className="w-4 h-4 flex-shrink-0" />
                        <span className="hidden sm:inline">Batch Entry</span>
                        <span className="sm:hidden">Batch</span>
                    </TabsTrigger>

                    <TabsTrigger
                        value="bulk-upload"
                        className="flex items-center justify-center gap-2 px-4 py-3 text-xs sm:text-sm font-medium transition-all rounded data-[state=active]:bg-slate-50 data-[state=active]:text-[var(--accent)] data-[state=active]:shadow-sm"
                    >
                        <FileUp className="w-4 h-4 flex-shrink-0" />
                        <span className="hidden md:inline">Import CSV</span>
                        <span className="md:hidden">CSV</span>
                    </TabsTrigger>

                </TabsList>

                {/* List Tab */}
                <TabsContent value="list" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Card className="shadow-sm border-none overflow-hidden rounded">
                        <CardHeader className="bg-white border-b px-6 py-4">
                            <CardTitle className="text-lg  text-black">Saving Type</CardTitle>
                            <CardDescription className="text-xs">Active Saving Schemes: {savingTypes?.length || 0}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/50">
                                            <TableHead>Product Name</TableHead>
                                            <TableHead>Interest APY</TableHead>
                                            <TableHead>Guarantee Role</TableHead>
                                            <TableHead>Accounting Control</TableHead>
                                            <TableHead>Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="p-6">
                                                    <TableSkeleton rows={5} cols={5} />
                                                </TableCell>
                                            </TableRow>
                                        ) : savingTypes?.length > 0 ? (
                                            savingTypes.map((type) => (
                                                <TableRow key={type.reference} className="hover:bg-slate-50 transition-colors group border-b border-slate-50">
                                                    <TableCell>{type.name}</TableCell>
                                                    <TableCell>
                                                        {type.interest_rate}% 
                                                    </TableCell>
                                                    <TableCell>
                                                        {type.can_guarantee ? (
                                                            <div className="flex items-center gap-2 text-green-700 bg-green-50 w-fit px-2 py-0.5 rounded border border-green-100 shadow-sm text-[10px]  uppercase">
                                                                <ShieldCheck className="w-3.5 h-3.5" /> Guarantees Loans
                                                            </div>
                                                        ) : (
                                                            <div className="text-black font-medium text-[10px] uppercase">Standard Only</div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {type.gl_account}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-black hover:text-[var(--accent)] hover:bg-white border-transparent hover:border-slate-200 border rounded transition-all"
                                                            onClick={() => {
                                                                setSelectedType(type);
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
                                                <TableCell colSpan={5} className="text-center h-48 text-black text-sm italic py-12">
                                                    Product List Empty
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
                <TabsContent value="bulk-create" className="animate-in fade-in zoom-in-95 duration-200">
                    <BulkSavingTypeCreate onBatchSuccess={refetch} />
                </TabsContent>

                {/* Bulk Upload Tab */}
                <TabsContent value="bulk-upload" className="animate-in fade-in zoom-in-95 duration-200">
                    <Card className="shadow-sm border-none bg-white rounded p-8">
                        <CardContent className="p-0">
                            <BulkSavingTypeUploadCreate onBatchSuccess={refetch} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Modals */}
            <CreateSavingTypeModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                refetchSavingTypes={refetch}
            />
            <UpdateSavingTypeModal
                isOpen={isUpdateModalOpen}
                onClose={() => setIsUpdateModalOpen(false)}
                refetchSavingTypes={refetch}
                savingType={selectedType}
            />
        </div>
    );
}
