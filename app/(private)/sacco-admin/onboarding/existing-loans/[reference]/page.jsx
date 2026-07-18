"use client";

import React, { use, useState } from "react";
import { 
    ArrowLeft, 
    Banknote, 
    History, 
    Info, 
    TrendingUp, 
    CheckCircle2, 
    Clock, 
    AlertCircle,
    User,
    FileText,
    Calendar,
    ChevronRight,
    Search
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { useFetchExistingLoan } from "@/hooks/existingloans/actions";
import LoadingSpinner from "@/components/general/LoadingSpinner";
import CreateExistingLoanPayment from "@/forms/existingloanspayments/CreateExistingLoanPayment";

const ExistingLoanDetailSkeleton = () => (
  <div className="mx-auto p-4 sm:p-6 space-y-6 animate-pulse">
    <div className="h-4 w-48 bg-slate-200 rounded" />
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <div className="h-6 w-64 bg-slate-200 rounded" />
        <div className="h-4 w-40 bg-slate-200 rounded" />
      </div>
      <div className="h-10 w-32 bg-slate-200 rounded" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="h-24 bg-slate-200 rounded-lg" />
          <div className="h-24 bg-slate-200 rounded-lg" />
          <div className="h-24 bg-slate-200 rounded-lg" />
        </div>
        <div className="h-96 bg-slate-200 rounded-lg" />
      </div>
      <div className="h-96 bg-slate-200 rounded-lg" />
    </div>
  </div>
);

export default function ExistingLoanDetailPage({ params }) {
    const { reference } = use(params);
    const router = useRouter();
    const { data: loan, isLoading, refetch } = useFetchExistingLoan(reference);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50/50">
                <ExistingLoanDetailSkeleton />
            </div>
        );
    }

    if (!loan) {
        return (
            <div className="p-8 text-center flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <AlertCircle className="h-16 w-16 text-red-500 opacity-20" />
                <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Loan Not Found</h2>
                <p className="text-slate-500 font-medium">The existing loan account you are looking for does not exist or has been removed.</p>
                <Button onClick={() => router.push("/sacco-admin/onboarding/existing-loans")} className="bg-[var(--accent)] mt-4 font-semibold rounded">
                    Back to Inventory
                </Button>
            </div>
        );
    }

    const getStatusStyles = (status) => {
        switch (status?.toLowerCase()) {
            case "active":
                return "bg-emerald-50 text-emerald-700 border-emerald-100 ring-4 ring-emerald-50/50";
            case "closed":
                return "bg-slate-100 text-slate-600 border-slate-200 ring-4 ring-slate-50/50";
            case "defaulted":
                return "bg-red-50 text-red-700 border-red-100 ring-4 ring-red-50/50";
            default:
                return "bg-blue-50 text-[var(--accent)] border-blue-100 ring-4 ring-blue-50/50";
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Breadcrumb */}
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
                        <BreadcrumbPage className="text-[11px] font-semibold uppercase tracking-wider text-[var(--accent)]">Loan Details</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-5">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => router.back()}
                        className="h-12 w-12 rounded bg-white shadow-sm border border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Button>
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-semibold text-[var(--accent)] tracking-tight">
                                {loan.member_name}
                            </h1>
                            <Badge className={`px-4 py-1 rounded font-semibold uppercase tracking-widest text-[10px] ${getStatusStyles(loan.status)}`} variant="outline">
                                {loan.status}
                            </Badge>
                        </div>
                        <p className="text-slate-500 font-medium flex items-center gap-2">
                             <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded border">ACC: {loan.account_number}</span>
                             <span className="text-slate-300">•</span>
                             <span className="text-xs uppercase tracking-tighter">Onboarded Account Detail</span>
                        </p>
                    </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <Button 
                        onClick={() => setIsPaymentModalOpen(true)}
                        className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold h-12 px-8 rounded shadow-sm flex-1 md:flex-none flex items-center gap-2 transition-all active:scale-95"
                    >
                        <Banknote className="w-5 h-5" /> Log Payment
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-3 space-y-8">
                    {/* Financial Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="bg-[var(--accent)] border-none shadow-sm text-white rounded overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                <TrendingUp className="w-24 h-24" />
                            </div>
                            <CardHeader className="pb-2">
                                <CardDescription className="text-blue-100/70 font-semibold text-[10px] uppercase tracking-[0.2em]">Outstanding Balance</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xl font-semibold">KES {Number(loan.outstanding_balance).toLocaleString()}</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-none shadow-sm rounded overflow-hidden ring-1 ring-slate-100 border-l-4 border-l-emerald-500">
                            <CardHeader className="pb-2">
                                <CardDescription className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">Total Principal</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xl font-semibold text-slate-900">KES {Number(loan.principal).toLocaleString()}</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-none shadow-sm rounded overflow-hidden ring-1 ring-slate-100 border-l-4 border-l-blue-400">
                            <CardHeader className="pb-2">
                                <CardDescription className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">Recovered Amount</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xl font-semibold text-slate-900">KES {Number(loan.total_amount_paid).toLocaleString()}</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Payment History Table */}
                    <Card className="shadow-sm border-none overflow-hidden rounded ring-1 ring-slate-100 bg-white">
                        <CardHeader className="bg-white border-b px-8 py-6 flex flex-row items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-lg font-semibold text-[var(--accent)] uppercase tracking-tight flex items-center gap-2">
                                    <History className="w-5 h-5" /> Repayment Trail
                                </CardTitle>
                                <CardDescription className="text-sm font-medium">Historical payment log for this specific loan account.</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/80 border-b">
                                            <TableHead className="font-semibold text-slate-800 h-14 pl-8 pt-4">Date</TableHead>
                                            <TableHead className="font-semibold text-slate-800 pt-4">Transaction Code</TableHead>
                                            <TableHead className="font-semibold text-slate-800 pt-4">Method</TableHead>
                                            <TableHead className="font-semibold text-slate-800 pt-4 text-center">Status</TableHead>
                                            <TableHead className="font-semibold text-slate-800 pt-4 text-right pr-8">Amount Paid</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loan.existing_loan_payments?.length > 0 ? (
                                            loan.existing_loan_payments.map((payment) => (
                                                <TableRow key={payment.reference} className="hover:bg-blue-50/30 transition-all border-b border-slate-50 group">
                                                    <TableCell className="font-semibold text-slate-700 pl-8 py-5">
                                                        {format(new Date(payment.payment_date), "MMM dd, yyyy")}
                                                    </TableCell>
                                                    <TableCell className="font-mono text-xs text-slate-500 uppercase">
                                                        {payment.payment_code}
                                                    </TableCell>
                                                    <TableCell className="text-xs font-semibold text-slate-600 uppercase tracking-tighter">
                                                        {payment.payment_method_name || payment.payment_method}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded text-[10px] font-semibold uppercase tracking-widest border border-emerald-100">
                                                            {payment.transaction_status || "Completed"}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right pr-8 font-semibold text-[var(--accent)] font-mono">
                                                        KES {Number(payment.amount).toLocaleString()}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-64 text-center">
                                                    <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                                                        <History className="w-12 h-12 opacity-20" />
                                                        <p className="font-semibold italic">No payment history found for this loan.</p>
                                                        <Button variant="link" onClick={() => setIsPaymentModalOpen(true)} className="text-[var(--accent)] font-semibold">Record first payment</Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-8">
                    {/* Member Card */}
                    <Card className="bg-white rounded border-none shadow-sm ring-1 ring-slate-100 overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b p-5">
                            <CardTitle className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)] flex items-center gap-2">
                                <User className="w-4 h-4" /> Borrower Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded bg-[var(--accent)] flex items-center justify-center text-white font-semibold text-lg shadow-sm ring-4 ring-blue-50">
                                    {loan.member_name?.charAt(0) || "U"}
                                </div>
                                <div className="space-y-0.5">
                                    <p className="font-semibold text-slate-900 tracking-tight">{loan.member_name}</p>
                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Member #: {loan.member || "N/A"}</p>
                                </div>
                            </div>
                            <Separator className="bg-slate-100" />
                            <Link href={`/sacco-admin/members/${loan.member}`} className="flex items-center justify-between text-xs font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] transition-all group">
                                View Full Profile
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Meta Data Card */}
                    <Card className="bg-white rounded border-none shadow-sm ring-1 ring-slate-100 overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b p-5">
                            <CardTitle className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)] flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Migration Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-tighter">GL Principal</span>
                                    <span className="text-xs font-semibold text-slate-700">{loan.gl_principal_asset || "System Default"}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-tighter">Onboarded On</span>
                                    <span className="text-xs font-semibold text-slate-700">{loan.created_at ? format(new Date(loan.created_at), "MMM d, yyyy") : "N/A"}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-tighter">Legacy Acc No</span>
                                    <span className="text-xs font-semibold text-slate-700 font-mono italic">{loan.account_number}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <div className="p-6 bg-[var(--accent)] rounded text-white space-y-4 shadow-sm ring-4 ring-blue-50">
                        <div className="flex items-center gap-3">
                            <Info className="w-5 h-5 text-blue-200" />
                            <p className="font-semibold text-sm tracking-tight">Onboarding Notice</p>
                        </div>
                        <p className="text-[11px] leading-relaxed text-blue-100/80 font-medium">
                            This loan was migrated from a legacy system. Financial records prior to the migration date are not tracked in the main ledger but are stored in historical trails.
                        </p>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CreateExistingLoanPayment 
                isOpen={isPaymentModalOpen} 
                onClose={() => { setIsPaymentModalOpen(false); refetch(); }} 
                initialLoanAcc={loan.account_number}
            />
        </div>
    );
}
