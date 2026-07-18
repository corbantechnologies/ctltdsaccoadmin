"use client";

import React, { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { useParams } from "next/navigation";
import { useFetchLoanDetail, useFetchLoanPayOffAmount } from "@/hooks/loans/actions";
import { useFetchMember } from "@/hooks/members/actions";
import { Banknote, Calendar, History } from "lucide-react";
import MemberLoadingSpinner from "@/components/general/MemberLoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import MpesaCreateLoanPaymentForm from "@/forms/loanrepayments/MpesaCreateLoanPayment";

function LoanDetail() {
    const { reference } = useParams(); // This is the correct loan REFERENCE for URLs

    const [activeTab, setActiveTab] = useState("overview");
    const [monthFilter, setMonthFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [isMpesaModalOpen, setIsMpesaModalOpen] = useState(false);

    const itemsPerPage = 50;

    const { isLoading: isLoadingLoan, data: loan } = useFetchLoanDetail(reference);
    const { isLoading: isLoadingMember } = useFetchMember();
    const { data: payoffQuote } = useFetchLoanPayOffAmount(reference);

    const schedule = useMemo(() =>
        loan?.application_details?.projection_snapshot?.schedule ||
        loan?.projection_snapshot?.schedule || [],
        [loan]
    );

    const allTransactions = useMemo(() => {
        if (!loan) return [];
        const disbursements = (loan.disbursements || []).map(d => ({
            ...d,
            type: 'Disbursement',
            date: d.created_at
        }));
        const payments = (loan.loan_payments || loan.repayments || []).map(p => ({
            ...p,
            type: 'Repayment',
            date: p.created_at
        }));
        return [...disbursements, ...payments].sort((a, b) =>
            new Date(b.date) - new Date(a.date)
        );
    }, [loan]);

    const filteredTransactions = useMemo(() => {
        return allTransactions.filter((t) => {
            const tDate = new Date(t.date);
            if (monthFilter) {
                const [year, month] = monthFilter.split("-").map(Number);
                const start = startOfMonth(new Date(year, month - 1));
                const end = endOfMonth(new Date(year, month - 1));
                if (!isWithinInterval(tDate, { start, end })) return false;
            }
            if (statusFilter && t.status !== statusFilter) return false;
            return true;
        });
    }, [allTransactions, monthFilter, statusFilter]);

    const paginatedTransactions = filteredTransactions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const formatCurrency = (amount) => `KES ${parseFloat(amount || 0).toFixed(2)}`;
    const formatDate = (dateStr) => dateStr ? format(new Date(dateStr), "MMM dd, yyyy") : "N/A";

const PersonalLoanDetailSkeleton = () => (
  <div className="mx-auto p-4 sm:p-6 space-y-6 animate-pulse">
    <div className="h-4 w-48 bg-slate-200 rounded" />
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <div className="h-6 w-64 bg-slate-200 rounded" />
        <div className="h-4 w-40 bg-slate-200 rounded" />
      </div>
      <div className="h-10 w-32 bg-slate-200 rounded" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
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

    if (isLoadingLoan || isLoadingMember) {
        return (
            <div className="min-h-screen bg-gray-50/50">
                <PersonalLoanDetailSkeleton />
            </div>
        );
    }
    if (!loan) return <div className="p-8 text-center text-muted-foreground">Loan details not found.</div>;

    return (
        <div className="min-h-screen bg-gray-50/50">
            <div className="mx-auto p-4 sm:p-6 space-y-6">

                {/* Breadcrumbs */}
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/sacco-admin/personal">Personal Profile</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbPage>{loan.product} Loan</BreadcrumbPage>
                    </BreadcrumbList>
                </Breadcrumb>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-xl font-semibold text-gray-900">{loan.product} Loan</h1>
                            <Badge
                                variant={loan.status === 'Active' ? 'default' : 'secondary'}
                                className={loan.status === 'Active' ? 'bg-[#045e32] text-white' : ''}
                            >
                                {loan.status}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground font-mono">{loan.account_number}</p>
                    </div>

                    <Button
                        className="bg-[#045e32] hover:bg-[#034625]"
                        onClick={() => setIsMpesaModalOpen(true)}
                    >
                        Make Repayment
                    </Button>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 rounded bg-gray-200 p-1 w-fit">
                    {['overview', 'schedule', 'transactions'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2.5 text-sm font-medium rounded transition-all ${activeTab === tab
                                ? 'bg-white text-[#045e32] shadow'
                                : 'text-gray-600 hover:bg-white/70'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="space-y-6">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            {/* Summary Cards */}
                            <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Card className="border-l-4 border-l-[var(--accent)]">
                                    <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wider text-slate-500">Outstanding Balance</CardTitle></CardHeader>
                                    <CardContent><p className="text-xl font-semibold text-[var(--accent)]">{formatCurrency(loan.outstanding_balance)}</p></CardContent>
                                </Card>
                                <Card className="border-l-4 border-l-green-600">
                                    <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wider text-slate-500">Principal</CardTitle></CardHeader>
                                    <CardContent><p className="text-xl font-semibold">{formatCurrency(loan.principal)}</p></CardContent>
                                </Card>
                                <Card className="border-l-4 border-l-amber-500">
                                    <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wider text-slate-500">Interest Accrued</CardTitle></CardHeader>
                                    <CardContent><p className="text-xl font-semibold">{formatCurrency(loan.total_interest_accrued)}</p></CardContent>
                                </Card>
                                <Card className="border-l-4 border-l-[#045e32]">
                                    <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-wider text-slate-500">Total Loan Amount</CardTitle></CardHeader>
                                    <CardContent><p className="text-xl font-semibold text-[#045e32]">{formatCurrency(loan.total_loan_amount)}</p></CardContent>
                                </Card>
                            </div>

                            {/* Payoff Quote */}
                            <Card className="lg:col-span-5 border-green-200 bg-green-50/30">
                                <CardHeader className="bg-green-100/60">
                                    <CardTitle className="text-lg flex items-center gap-2 text-green-800">
                                        <Banknote className="h-5 w-5" /> Payoff Quote
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-3">
                                    {payoffQuote ? (
                                        <>
                                            <div className="flex justify-between"><span className="text-muted-foreground">Principal</span><span>{formatCurrency(payoffQuote.principal_to_clear)}</span></div>
                                            <div className="flex justify-between"><span className="text-muted-foreground">Accrued Interest</span><span>{formatCurrency(payoffQuote.interest_to_recognize)}</span></div>
                                            <div className="flex justify-between"><span className="text-muted-foreground">Unpaid Fees</span><span>{formatCurrency(payoffQuote.unpaid_fees)}</span></div>
                                            <Separator />
                                            <div className="flex justify-between text-lg font-semibold text-green-700">
                                                <span>Total Payoff Today</span>
                                                <span>{formatCurrency(payoffQuote.total_payoff_amount)}</span>
                                            </div>
                                        </>
                                    ) : <p className="text-center py-8 text-muted-foreground">Payoff quote not available</p>}
                                </CardContent>
                            </Card>

                            {/* Loan Terms */}
                            <Card className="lg:col-span-7">
                                <CardHeader><CardTitle>Loan Terms</CardTitle></CardHeader>
                                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                                    <div><span className="text-muted-foreground">Start Date</span><p className="font-medium">{formatDate(loan.start_date)}</p></div>
                                    <div><span className="text-muted-foreground">End Date</span><p className="font-medium">{formatDate(loan.end_date)}</p></div>
                                    <div>
                                        <span className="text-muted-foreground">Interest Rate</span>
                                        <p className="font-medium">
                                            {loan.product_details?.interest_rate}% {loan.product_details?.interest_period}
                                            {" "}·{" "}
                                            <span className={loan.product_details?.interest_method === "Flat" ? "text-amber-600" : "text-blue-600"}>
                                                {loan.product_details?.interest_method === "Flat" ? "Flat-rate" : "Reducing Balance"}
                                            </span>
                                        </p>
                                    </div>
                                    <div><span className="text-muted-foreground">Product</span><p className="font-medium">{loan.product}</p></div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'schedule' && (
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" /> Repayment Schedule
                                    </CardTitle>
                                    <CardDescription>
                                        {loan.product_details?.interest_method === "Flat"
                                            ? "Flat-rate: interest is charged on the original principal. Processing fee is spread evenly. The balance column shows total amount still outstanding."
                                            : "Reducing balance: interest is charged on the remaining principal each period. The balance column shows remaining principal after each payment."}
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50">
                                            <TableHead>Installment</TableHead>
                                            <TableHead>Due Date</TableHead>
                                            <TableHead>Principal</TableHead>
                                            <TableHead>{loan.product_details?.interest_method === "Flat" ? "Interest (Flat)" : "Interest (Reducing)"}</TableHead>
                                            <TableHead>Processing Fee</TableHead>
                                            <TableHead>Total Due</TableHead>
                                            <TableHead>Principal Paid</TableHead>
                                            <TableHead>Interest Paid</TableHead>
                                            <TableHead>Fees Paid</TableHead>
                                            <TableHead>Total Paid</TableHead>
                                            <TableHead>Uncleared</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">{loan.product_details?.interest_method === "Flat" ? "Remaining Balance (Total)" : "Remaining Principal"}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {schedule.map((item, i) => (
                                            <TableRow key={i}>
                                                <TableCell className="font-medium">{item.installment_code}</TableCell>
                                                <TableCell>{formatDate(item.due_date)}</TableCell>
                                                <TableCell>{formatCurrency(item.principal_due)}</TableCell>
                                                <TableCell>{formatCurrency(item.interest_due)}</TableCell>
                                                <TableCell>{formatCurrency(item.fee_due)}</TableCell>
                                                <TableCell className="font-semibold text-[#045e32]">{formatCurrency(item.total_due)}</TableCell>
                                                <TableCell>{formatCurrency(item.principal_paid || 0)}</TableCell>
                                                <TableCell>{formatCurrency(item.interest_paid || 0)}</TableCell>
                                                <TableCell>{formatCurrency(item.fee_paid || 0)}</TableCell>
                                                <TableCell className="font-medium">{formatCurrency(item.amount_paid || 0)}</TableCell>
                                                <TableCell className="font-medium text-amber-700">{formatCurrency((item.total_due || 0) - (item.amount_paid || 0))}</TableCell>
                                                <TableCell>
                                                    <Badge variant={item.is_paid ? "default" : "secondary"} className={item.is_paid ? "bg-green-100 text-green-700" : ""}>
                                                        {item.is_paid ? "Paid" : "Pending"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right text-muted-foreground">{formatCurrency(item.balance_after)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === 'transactions' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <History className="h-5 w-5" /> Transaction History
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="overflow-x-auto">
                                <div className="flex justify-between mb-4">
                                    <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="border rounded px-3 py-2 text-sm">
                                        <option value="">All Months</option>
                                    </select>
                                </div>

                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50">
                                            <TableHead>Date</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Method</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedTransactions.map((t, i) => (
                                            <TableRow key={i}>
                                                <TableCell>{formatDate(t.date)}</TableCell>
                                                <TableCell>
                                                    <Badge variant={t.type === 'Disbursement' ? "default" : "secondary"}>
                                                        {t.type}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-semibold">{formatCurrency(t.amount)}</TableCell>
                                                <TableCell>{t.payment_method || t.method || 'N/A'}</TableCell>
                                                <TableCell>{t.status || 'Completed'}</TableCell>
                                            </TableRow>
                                        ))}
                                        {paginatedTransactions.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                                    No transactions found
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Correct Modal */}
            <MpesaCreateLoanPaymentForm
                isOpen={isMpesaModalOpen}
                onClose={() => setIsMpesaModalOpen(false)}
                loanReference={reference}           // Correct reference for URL
                loanAccountNumber={loan?.account_number}
            />
        </div>
    );
}

export default LoanDetail;