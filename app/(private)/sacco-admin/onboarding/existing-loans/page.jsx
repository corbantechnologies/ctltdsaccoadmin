"use client";

import React, { useState, useMemo } from "react";
import { 
    Plus, 
    HandCoins, 
    History, 
    TrendingUp, 
    Users, 
    FileSpreadsheet, 
    Table as TableIcon, 
    ListFilter,
    Search,
    Eye,
    Banknote,
    FileUp,
    CheckCircle2,
    Clock,
    AlertCircle,
    ArrowLeft
} from "lucide-react";
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
import { useFetchExistingLoans } from "@/hooks/existingloans/actions";
import { useFetchExistingLoanPayments } from "@/hooks/existingloanpayments/actions";
import { useFetchMembers } from "@/hooks/members/actions";
import { useFetchGLAccounts } from "@/hooks/glaccounts/actions";
import { useFetchPaymentAccounts } from "@/hooks/paymentaccounts/actions";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Forms
import CreateExistingLoan from "@/forms/existingloans/CreateExistingLoan";
import BulkCreateExistingLoan from "@/forms/existingloans/BulkCreateExistingLoan";
import BulkUploadCreateExistingLoan from "@/forms/existingloans/BulkUploadCreateExistingLoan";
import CreateExistingLoanPayment from "@/forms/existingloanspayments/CreateExistingLoanPayment";
import BulkCreateExistingLoanPayment from "@/forms/existingloanspayments/BulkCreateExistingLoanPayment";
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

export default function ExistingLoansOnboardingPage() {
    const router = useRouter();
    
    // Core Data Fetching
    const { data: loans, isLoading: isLoadingLoans, refetch: refetchLoans } = useFetchExistingLoans();
    const { data: payments, isLoading: isLoadingPayments, refetch: refetchPayments } = useFetchExistingLoanPayments();
    
    // Dependency Pre-fetching (to ensure forms have data ready)
    useFetchMembers();
    useFetchGLAccounts();
    useFetchPaymentAccounts();

    const [searchTerm, setSearchTerm] = useState("");
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isIndividualModalOpen, setIsIndividualModalOpen] = useState(false);
    const [selectedLoanAcc, setSelectedLoanAcc] = useState("");

    const filteredLoans = useMemo(() => {
        if (!loans) return [];
        return loans.filter(loan => 
            loan.member_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            loan.account_number?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [loans, searchTerm]);

    const totalOutstanding = loans?.reduce((acc, loan) => acc + Number(loan.outstanding_balance), 0) || 0;
    const totalPrincipal = loans?.reduce((acc, loan) => acc + Number(loan.principal), 0) || 0;

    const handlePay = (loan) => {
        setSelectedLoanAcc(loan.account_number);
        setIsPaymentModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="rounded hover:bg-white border shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="space-y-1">
                        <h1 className="text-xl font-semibold tracking-tight text-[var(--accent)]">
                            Existing Loans Onboarding
                        </h1>
                        <p className="text-slate-500 font-medium">
                            Manage and migrate legacy loan portfolios into the SACCO system.
                        </p>
                    </div>
                </div>

                <Button 
                    onClick={() => setIsIndividualModalOpen(true)}
                    className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold px-6 h-12 flex items-center gap-2 rounded shadow-sm"
                >
                    <Plus className="w-5 h-5" /> New Individual Loan
                </Button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <Card className="border-none shadow-sm bg-white rounded overflow-hidden ring-1 ring-slate-100">
                    <CardHeader className="p-5 pb-2">
                        <CardDescription className="text-slate-500 font-semibold text-[10px] uppercase tracking-wider">Total Principal</CardDescription>
                        <CardTitle className="text-xl font-semibold text-slate-900">KES {totalPrincipal.toLocaleString()}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 pt-0">
                        <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                            <TrendingUp className="w-3 h-3" /> Portfolio Value
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white rounded overflow-hidden ring-1 ring-slate-100">
                    <CardHeader className="p-5 pb-2">
                        <CardDescription className="text-slate-500 font-semibold text-[10px] uppercase tracking-wider">Outstanding Balance</CardDescription>
                        <CardTitle className="text-xl font-semibold text-[var(--accent)]">KES {totalOutstanding.toLocaleString()}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 pt-0">
                        <div className="flex items-center gap-1 text-[10px] text-blue-600 font-semibold uppercase tracking-tighter">
                            Active Recovery
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white rounded overflow-hidden ring-1 ring-slate-100">
                    <CardHeader className="p-5 pb-2">
                        <CardDescription className="text-slate-500 font-semibold text-[10px] uppercase tracking-wider">Loan Records</CardDescription>
                        <CardTitle className="text-xl font-semibold text-slate-900">{loans?.length || 0}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 pt-0">
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold uppercase tracker-tighter">
                             Total Onboarded
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white rounded overflow-hidden ring-1 ring-slate-100">
                    <CardHeader className="p-5 pb-2">
                        <CardDescription className="text-slate-500 font-semibold text-[10px] uppercase tracking-wider">Payments Tracked</CardDescription>
                        <CardTitle className="text-xl font-semibold text-slate-900">{payments?.length || 0}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 pt-0">
                        <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold uppercase tracking-tighter">
                            Historical Payments
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Tabs */}
            <Tabs defaultValue="list" className="w-full">
                <TabsList className="bg-white border p-1 shadow-sm mb-8 w-full h-auto rounded grid grid-cols-2 lg:grid-cols-4 gap-1 overflow-hidden ring-1 ring-slate-100">
                    <TabsTrigger
                        value="list"
                        className="flex items-center justify-center gap-2 px-4 py-3 text-xs sm:text-sm font-medium transition-all rounded data-[state=active]:bg-[var(--accent)] data-[state=active]:text-white data-[state=active]:shadow-sm"
                    >
                        <ListFilter className="w-4 h-4 flex-shrink-0" />
                        <span className="hidden sm:inline">List View</span>
                        <span className="sm:hidden">List</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="manual"
                        className="flex items-center justify-center gap-2 px-4 py-3 text-xs sm:text-sm font-medium transition-all rounded data-[state=active]:bg-[var(--accent)] data-[state=active]:text-white data-[state=active]:shadow-sm"
                    >
                        <Plus className="w-4 h-4 flex-shrink-0" />
                        <span className="hidden sm:inline">Manual Batch</span>
                        <span className="sm:hidden">Batch</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="upload"
                        className="flex items-center justify-center gap-2 px-4 py-3 text-xs sm:text-sm font-medium transition-all rounded data-[state=active]:bg-[var(--accent)] data-[state=active]:text-white data-[state=active]:shadow-sm"
                    >
                        <FileUp className="w-4 h-4 flex-shrink-0" />
                        <span className="hidden md:inline">CSV Upload</span>
                        <span className="md:hidden">CSV</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="payments"
                        className="flex items-center justify-center gap-2 px-4 py-3 text-xs sm:text-sm font-medium transition-all rounded data-[state=active]:bg-[var(--accent)] data-[state=active]:text-white data-[state=active]:shadow-sm"
                    >
                        <History className="w-4 h-4 flex-shrink-0" />
                        <span className="hidden md:inline">Payment Trails</span>
                        <span className="md:hidden">Trails</span>
                    </TabsTrigger>
                </TabsList>

                {/* List View Tab */}
                <TabsContent value="list" className="animate-in fade-in slide-in-from-bottom-3 duration-500 space-y-6">
                    {/* Search Bar */}
                    <div className="bg-white rounded p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
                        <div className="flex-1 relative group w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[var(--accent)] transition-colors" />
                            <Input
                                placeholder="Search by member name or account number..."
                                className="pl-12 h-12 rounded border-slate-100 focus:border-[var(--accent)] bg-slate-50/50 shadow-none ring-offset-transparent focus-visible:ring-1 focus-visible:ring-slate-200"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <Card className="shadow-sm border-none overflow-hidden rounded ring-1 ring-slate-100">
                        <CardHeader className="bg-white border-b px-8 py-6">
                            <CardTitle className="text-lg font-semibold text-[var(--accent)] uppercase tracking-tight">Onboarded Loan Inventory</CardTitle>
                            <CardDescription className="text-sm font-medium">A detailed list of legacy loans migrated to the system.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/80 border-b hover:bg-slate-50/80">
                                            <TableHead className="font-semibold text-slate-800 h-14 pl-8">Member</TableHead>
                                            <TableHead className="font-semibold text-slate-800">Acc No</TableHead>
                                            <TableHead className="font-semibold text-slate-800 text-right">Principal</TableHead>
                                            <TableHead className="font-semibold text-slate-800 text-right">Paid</TableHead>
                                            <TableHead className="font-semibold text-[var(--accent)] text-right">Outstanding</TableHead>
                                            <TableHead className="font-semibold text-slate-800 text-center">Status</TableHead>
                                            <TableHead className="font-semibold text-slate-800 text-right pr-8">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoadingLoans ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="p-6">
                                                    <TableSkeleton rows={5} cols={7} />
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredLoans?.length > 0 ? (
                                            filteredLoans.map((loan) => (
                                                <TableRow key={loan.reference} className="hover:bg-blue-50/30 transition-all border-b border-slate-50 group">
                                                    <TableCell className="font-semibold text-slate-900 pl-8 py-5 flex items-center gap-3">
                                                        {loan.member}
                                                    </TableCell>
                                                    <TableCell className="font-mono text-xs text-slate-500">{loan.account_number}</TableCell>
                                                    <TableCell className="text-right font-medium text-slate-600 font-mono">KES {Number(loan.principal).toLocaleString()}</TableCell>
                                                    <TableCell className="text-right font-medium text-emerald-600 font-mono">KES {Number(loan.total_amount_paid).toLocaleString()}</TableCell>
                                                    <TableCell className="text-right font-semibold text-[var(--accent)] font-mono">KES {Number(loan.outstanding_balance).toLocaleString()}</TableCell>
                                                    <TableCell className="text-center">
                                                        <span className={`px-3 py-1 rounded text-[10px] font-semibold uppercase tracking-widest ${
                                                            loan.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 
                                                            loan.status === 'closed' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
                                                        }`}>
                                                            {loan.status}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right pr-8">
                                                        <div className="flex justify-end gap-2">
                                                            <Button 
                                                                size="icon" 
                                                                variant="ghost" 
                                                                onClick={() => handlePay(loan)}
                                                                className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded"
                                                                title="Record Payment"
                                                            >
                                                                <Banknote className="w-4 h-4" />
                                                            </Button>
                                                            <Link href={`/sacco-admin/onboarding/existing-loans/${loan.reference}`}>
                                                                <Button 
                                                                    size="icon" 
                                                                    variant="ghost" 
                                                                    className="h-8 w-8 text-[var(--accent)] hover:text-[var(--accent-hover)] hover:bg-blue-50 rounded"
                                                                    title="View Details"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={7} className="h-64 text-center">
                                                    <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                                                        <HandCoins className="w-12 h-12 opacity-20" />
                                                        <p className="font-semibold italic">No loans found.</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Manual Batch Tab */}
                <TabsContent value="manual" className="animate-in fade-in slide-in-from-bottom-3 duration-500">
                    <BulkCreateExistingLoan isOpen={true} isInline={true} onClose={refetchLoans} />
                </TabsContent>

                {/* CSV Import Tab */}
                <TabsContent value="upload" className="animate-in fade-in slide-in-from-bottom-3 duration-500">
                    <Card className="bg-white rounded shadow-sm p-8 border border-slate-100">
                        <BulkUploadCreateExistingLoan isOpen={true} isInline={true} onClose={refetchLoans} onBatchSuccess={refetchLoans} />
                    </Card>
                </TabsContent>

                {/* Payment Trail Tab */}
                <TabsContent value="payments" className="animate-in fade-in slide-in-from-bottom-3 duration-500">
                    <Card className="shadow-sm border-none overflow-hidden rounded ring-1 ring-slate-100">
                        <CardHeader className="bg-white border-b px-8 py-6">
                            <CardTitle className="text-lg font-semibold text-[var(--accent)] uppercase tracking-tight">Onboarded Payment History</CardTitle>
                            <CardDescription className="text-sm font-medium">Historical records of payments recovered during the migration.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/80 border-b hover:bg-slate-50/80">
                                            <TableHead className="font-semibold text-slate-800 h-14 pl-8">Loan Acc</TableHead>
                                            <TableHead className="font-semibold text-slate-800">Payment Date</TableHead>
                                            <TableHead className="font-semibold text-slate-800">Code</TableHead>
                                            <TableHead className="font-semibold text-slate-800 text-right">Amount</TableHead>
                                            <TableHead className="font-semibold text-slate-800">Method</TableHead>
                                            <TableHead className="font-semibold text-slate-800 text-center">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {payments?.map((payment) => (
                                            <TableRow key={payment.reference} className="hover:bg-emerald-50/20 transition-all border-b border-slate-50">
                                                <TableCell className="font-semibold text-[var(--accent)] pl-8 py-5">{payment.existing_loan_acc}</TableCell>
                                                <TableCell className="text-xs text-slate-500 font-medium">{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                                                <TableCell className="font-mono text-[10px] text-slate-400">{payment.payment_code}</TableCell>
                                                <TableCell className="text-right font-semibold text-emerald-600 font-mono">KES {Number(payment.amount).toLocaleString()}</TableCell>
                                                <TableCell className="text-xs font-semibold text-slate-600 uppercase tracking-tighter">{payment.payment_method_name}</TableCell>
                                                <TableCell className="text-center">
                                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded text-[10px] font-semibold uppercase tracking-wider">
                                                        {payment.transaction_status}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {(!payments || payments.length === 0) && (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-64 text-center">
                                                    <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                                                        <History className="w-12 h-12 opacity-20" />
                                                        <p className="font-semibold italic">No historical payments recorded.</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Modals */}
            <CreateExistingLoan 
                isOpen={isIndividualModalOpen} 
                onClose={() => { setIsIndividualModalOpen(false); refetchLoans(); }} 
            />
            
            <CreateExistingLoanPayment 
                isOpen={isPaymentModalOpen} 
                onClose={() => { setIsPaymentModalOpen(false); refetchPayments(); refetchLoans(); }} 
                initialLoanAcc={selectedLoanAcc}
            />
        </div>
    );
}