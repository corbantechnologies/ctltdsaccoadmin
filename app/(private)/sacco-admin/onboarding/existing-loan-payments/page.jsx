"use client";

import React, { useState } from "react";
import { 
    Search, 
    Download, 
    Plus, 
    Banknote, 
    ChevronRight, 
    Filter,
    Calendar as CalendarIcon,
    History,
    ArrowLeft
} from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useFetchExistingLoanPayments } from "@/hooks/existingloanpayments/actions";
import LoadingSpinner from "@/components/general/LoadingSpinner";
import { formatCurrency } from "@/lib/utils";
import CreateExistingLoanPayment from "@/forms/existingloanspayments/CreateExistingLoanPayment";
import BulkUploadCreateExistingLoanPayment from "@/forms/existingloanspayments/BulkUploadCreateExistingLoanPayment";

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

export default function ExistingLoanPaymentsPage() {
    const router = useRouter();
    const { data: payments, isLoading, refetch } = useFetchExistingLoanPayments();
    const [searchTerm, setSearchTerm] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    const filteredPayments = payments?.filter((p) =>
        p.payment_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.loan_acc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.payment_method?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Breadcrumbs */}
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/sacco-admin/dashboard" className="text-[11px] font-semibold uppercase tracking-wider">Dashboard</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/sacco-admin/onboarding/existing-loans" className="text-[11px] font-semibold uppercase tracking-wider">Onboarding</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage className="text-[11px] font-semibold uppercase tracking-wider text-[var(--accent)]">Payment History</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded border shadow-sm ring-4 ring-blue-50/20">
                <div className="space-y-1">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-[var(--accent)] rounded shadow-sm">
                            <History className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-[var(--accent)] tracking-tight">Onboarding Payments</h1>
                            <p className="text-slate-500 font-medium text-sm flex items-center gap-2">
                                <span className="uppercase tracking-widest text-[10px] font-semibold bg-blue-50 text-[var(--accent)] px-2 py-0.5 rounded">Legacy Systems</span>
                                • Historical payment trails for migrated loans
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <Button 
                        variant="outline"
                        onClick={() => setIsUploadModalOpen(true)}
                        className="border-slate-200 text-slate-600 font-semibold h-12 px-6 rounded hover:bg-slate-50 flex items-center gap-2"
                    >
                        <Download className="w-5 h-5 opacity-50" /> Bulk Upload
                    </Button>
                    <Button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold h-12 px-8 rounded shadow-sm flex items-center gap-2 transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5" /> Record Payment
                    </Button>
                </div>
            </div>

            {/* Main Table Card */}
            <Card className="shadow-sm border-none overflow-hidden rounded ring-1 ring-slate-100 bg-white">
                <CardHeader className="bg-white border-b px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[var(--accent)] transition-colors" />
                        <Input 
                            placeholder="Search by code, account or method..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-10 border-slate-200 focus:ring-2 focus:ring-blue-100 rounded bg-slate-50/50 focus:bg-white transition-all font-medium"
                        />
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="h-8 px-3 rounded bg-slate-50 text-slate-600 font-semibold text-[10px] border-slate-200 uppercase tracking-tight">
                            Total Records: {filteredPayments?.length || 0}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/80 border-b">
                                    <TableHead className="font-semibold text-[var(--accent)] h-14 pl-8 pt-4 text-[11px] uppercase tracking-wider">Date</TableHead>
                                    <TableHead className="font-semibold text-[var(--accent)] pt-4 text-[11px] uppercase tracking-wider">Transaction Code</TableHead>
                                    <TableHead className="font-semibold text-[var(--accent)] pt-4 text-[11px] uppercase tracking-wider">Loan Account</TableHead>
                                    <TableHead className="font-semibold text-[var(--accent)] pt-4 text-[11px] uppercase tracking-wider">Method</TableHead>
                                    <TableHead className="font-semibold text-[var(--accent)] pt-4 text-[11px] uppercase tracking-wider text-right pr-8">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="p-6">
                                            <TableSkeleton rows={5} cols={5} />
                                        </TableCell>
                                    </TableRow>
                                ) : filteredPayments?.length > 0 ? (
                                    filteredPayments.map((payment) => (
                                        <TableRow key={payment.reference} className="hover:bg-blue-50/30 transition-all border-b border-slate-50 group">
                                            <TableCell className="font-semibold text-slate-700 pl-8 py-5">
                                                {format(new Date(payment.payment_date), "MMM dd, yyyy")}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-mono text-xs font-semibold text-slate-500 group-hover:text-[var(--accent)] transition-colors uppercase">
                                                        {payment.payment_code}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-medium">REF: {payment.reference?.substring(0, 8)}...</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 rounded px-2 py-0.5 font-mono text-xs border border-slate-200">
                                                    {payment.loan_acc}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-tighter">
                                                    <div className="w-2 h-2 rounded bg-emerald-400" />
                                                    {payment.payment_method_name || payment.payment_method}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-8 font-semibold text-[var(--accent)] font-mono text-base">
                                                {formatCurrency(payment.amount)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-96 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-400 gap-4">
                                                <div className="p-6 bg-slate-50 rounded border-2 border-dashed border-slate-200">
                                                    <History className="w-12 h-12 opacity-20" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-semibold text-[var(--accent)] text-lg uppercase tracking-tight">No Payments Found</p>
                                                    <p className="text-sm font-medium">Try adjusting your filters or record a new payment to begin.</p>
                                                </div>
                                                <Button onClick={() => setIsCreateModalOpen(true)} className="bg-[var(--accent)] mt-2 font-semibold px-8 rounded">
                                                    Record First Payment
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Modals */}
            <CreateExistingLoanPayment 
                isOpen={isCreateModalOpen} 
                onClose={() => { setIsCreateModalOpen(false); refetch(); }} 
            />
            <BulkUploadCreateExistingLoanPayment 
                isOpen={isUploadModalOpen} 
                onClose={() => { setIsUploadModalOpen(false); refetch(); }} 
            />
        </div>
    );
}
