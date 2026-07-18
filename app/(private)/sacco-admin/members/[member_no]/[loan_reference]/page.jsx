"use client";

import Link from "next/link";
import React, { use, useState } from "react";
import { format } from "date-fns";
import { useFetchLoanDetail, useFetchLoanPayOffAmount } from "@/hooks/loans/actions";
import LoadingSpinner from "@/components/general/LoadingSpinner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  CreditCard,
  History,
  Info,
  Banknote,
  Calendar,
  User,
  AlertTriangle,
  Pencil,
} from "lucide-react";
import CreateLoanPayment from "@/forms/loanrepayments/CreateLoanPayment";
import { useFetchLoanPenaltiesByLoanAccountReference } from "@/hooks/loanpenalties/actions";
import CreateLoanPenalty from "@/forms/loanpenalties/CreateLoanPenalty";
import UpdateLoanPenalty from "@/forms/loanpenalties/UpdateLoanPenalty";

const LoanDetailSkeleton = () => (
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="h-24 bg-slate-200 rounded-lg" />
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

export default function LoanAccountDetail({ params }) {
  const { member_no, loan_reference } = use(params);
  const {
    data: loan,
    isLoading: isLoanLoading,
    refetch,
  } = useFetchLoanDetail(loan_reference);

  const {
    data: penalties,
    isLoading: isPenaltiesLoading,
    refetch: refetchPenalties,
  } = useFetchLoanPenaltiesByLoanAccountReference(loan_reference);

  const {
    data: payoffQuote,
    isLoading: isPayoffLoading,
    isRefetching: isPayoffRefetching
  } = useFetchLoanPayOffAmount(loan_reference);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPenaltyModalOpen, setIsPenaltyModalOpen] = useState(false);
  const [isUpdatePenaltyModalOpen, setIsUpdatePenaltyModalOpen] = useState(false);
  const [selectedPenalty, setSelectedPenalty] = useState(null);

  const refetchAll = () => {
    refetch();
    refetchPenalties();
  };

  if (isLoanLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <LoanDetailSkeleton />
      </div>
    );
  }

  if (!loan)
    return (
      <div className="p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold">Loan Account Not Found</h2>
        <p className="text-muted-foreground mt-2">The loan account details could not be retrieved.</p>
        <Button
          variant="link"
          onClick={() => window.history.back()}
          className="mt-4"
        >
          Go Back
        </Button>
      </div>
    );

  const getStatusColor = (status) => {
    switch (status) {
      case "Funded":
      case "Active":
        return "bg-green-100 text-green-700 border-green-200";
      case "Closed":
      case "Paid":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "Defaulted":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="mx-auto p-4 sm:p-6 space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/sacco-admin/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/sacco-admin/members">Members</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/sacco-admin/members/${member_no}`}>Member Profile</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage>Loan {loan.account_number}</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-gray-900">
                {loan.product} Account
              </h1>
              <Badge className={getStatusColor(loan.status)} variant="outline">
                {loan.status}
              </Badge>
            </div>
            <p className="text-muted-foreground font-mono mt-1">
              Acc: {loan.account_number} | Member: {loan.member}
            </p>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            {parseFloat(loan.outstanding_balance) > 0 && (
              <Button
                onClick={() => setIsPaymentModalOpen(true)}
                className="bg-primary hover:bg-[#022007] text-white flex-1 md:flex-none"
              >
                <Banknote className="mr-2 h-4 w-4" />
                Log Payment
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-3 space-y-6">
            {/* Financial Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Card className="bg-white border-l-4 border-l-[var(--accent)]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <Info className="h-4 w-4" /> Outstanding Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-semibold text-[var(--accent)]">
                    {formatCurrency(loan.outstanding_balance)}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-l-4 border-l-green-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Principal Amount
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-semibold text-slate-900">
                    {formatCurrency(loan.principal)}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-l-4 border-l-amber-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Interest Accrued
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-semibold text-slate-900">
                    {formatCurrency(loan.total_interest_accrued)}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-l-4 border-l-indigo-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Processing Fee
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-semibold text-slate-900">
                    {formatCurrency(loan.processing_fee)}
                  </p>
                </CardContent>
              </Card>

              {/* Penalty & Clearance summary cards — only shown for active loans */}
              {parseFloat(loan.total_penalties_owed) > 0 && (
                <Card className="bg-white border-l-4 border-l-red-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-red-500 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" /> Penalties Owed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-semibold text-red-600">
                      {formatCurrency(loan.total_penalties_owed)}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">Total outstanding penalty balance</p>
                  </CardContent>
                </Card>
              )}

              {loan.status !== "Closed" && (
                <Card className="bg-white border-l-4 border-l-purple-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Estimated Clearance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-semibold text-purple-700">
                      {formatCurrency(loan.total_clearance_amount)}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {parseFloat(loan.total_penalties_owed) > 0
                        ? "Loan balance + pending penalties"
                        : "Full outstanding balance"}
                    </p>
                  </CardContent>
                </Card>
              )}

            </div>

            {/* Repayment History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <History className="h-5 w-5" /> Repayment History
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 sm:p-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50">
                        <TableHead>Date</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loan.loan_payments?.length > 0 ? (
                        loan.loan_payments.map((payment, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">
                              {format(new Date(payment.created_at), "MMM dd, yyyy")}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {payment.transaction_code || payment.reference}
                            </TableCell>
                            <TableCell>{payment.payment_method}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-[10px] py-0">
                                {payment.repayment_type}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatCurrency(payment.amount)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                            No payments recorded yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>


            {/* Repayment Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" /> Projected Repayment Schedule
                </CardTitle>
                <CardDescription>
                  {loan.product_details?.interest_method === "Flat"
                    ? "Flat-rate: interest is charged on the original principal. Processing fee is spread evenly. The balance column shows total amount still outstanding."
                    : "Reducing balance: interest is charged on the remaining principal each period. The balance column shows remaining principal after each payment."}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 sm:p-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50">
                        <TableHead>Code</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Principal</TableHead>
                        <TableHead>{loan.product_details?.interest_method === "Flat" ? "Interest (Flat)" : "Interest (Reducing)"}</TableHead>
                        <TableHead>Processing Fee</TableHead>
                        <TableHead>Total Due</TableHead>
                        <TableHead>Principal Paid</TableHead>
                        <TableHead>Interest Paid</TableHead>
                        <TableHead>Fees Paid</TableHead>
                        <TableHead>Total Paid</TableHead>
                        <TableHead>Total Uncleared</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">{loan.product_details?.interest_method === "Flat" ? "Remaining Balance (Total)" : "Remaining Principal"}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loan.projection_snapshot?.schedule?.length > 0 ? (
                        loan.projection_snapshot.schedule.map((item, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium whitespace-nowrap">
                              {item.installment_code}
                            </TableCell>
                            <TableCell className="font-medium whitespace-nowrap">
                              {format(new Date(item.due_date), "MMM dd, yyyy")}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(item.principal_due)}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(item.interest_due)}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(item.fee_due)}
                            </TableCell>
                            <TableCell className="font-semibold text-primary">
                              {formatCurrency(item.total_due)}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(item.principal_paid)}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(item.interest_paid)}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(item.fee_paid)}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(item.amount_paid)}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(item.total_due - item.amount_paid)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  item.is_paid
                                    ? "bg-green-100 text-green-700 border-green-200"
                                    : "bg-gray-100 text-gray-700 border-gray-200"
                                }
                              >
                                {item.is_paid ? "Paid" : "Not Paid"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              {formatCurrency(item.balance_after)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                            No projection schedule found for this loan.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Loan Penalties */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" /> Loan Penalties
                </CardTitle>
                <Button
                  size="sm"
                  onClick={() => setIsPenaltyModalOpen(true)}
                  className="bg-primary hover:bg-[#022007] text-white text-xs"
                >
                  Apply Penalty
                </Button>
              </CardHeader>
              <CardContent className="p-0 sm:p-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50">
                        <TableHead>Date / Code</TableHead>
                        <TableHead>Installment</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Amount Paid</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Charged By</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {penalties?.length > 0 ? (
                        penalties.map((penalty, i) => (
                          <TableRow key={i}>
                            <TableCell>
                              <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-medium">{format(new Date(penalty.created_at), "MMM d, yyyy")}</span>
                                <span className="font-mono text-[10px] text-muted-foreground">{penalty.penalty_code}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {penalty.installment_code}
                            </TableCell>
                            <TableCell className="font-semibold">
                              {formatCurrency(penalty.amount)}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(penalty.amount_paid)}
                            </TableCell>
                            <TableCell className="font-semibold text-amber-700">
                              {formatCurrency(penalty.balance)}
                            </TableCell>
                            <TableCell className="text-sm">
                              {penalty.charged_by}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`text-[10px] py-0 ${penalty.status === "Pending" ? "bg-amber-100 text-amber-700 border-amber-200" :
                                  penalty.status === "Paid" ? "bg-green-100 text-green-700 border-green-200" :
                                    "bg-gray-100 text-gray-700 border-gray-200"
                                  }`}
                              >
                                {penalty.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-primary"
                                onClick={() => {
                                  setSelectedPenalty(penalty);
                                  setIsUpdatePenaltyModalOpen(true);
                                }}
                                disabled={penalty.status !== "Pending"}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                            No penalties recorded for this loan.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Disbursements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Banknote className="h-5 w-5" /> Disbursement History
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 sm:p-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50">
                        <TableHead>Date</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loan.disbursements?.map((d, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            {format(new Date(d.created_at), "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell>{d.payment_method}</TableCell>
                          <TableCell>{d.disbursement_type}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(d.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-500" /> Loan Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Start Date</span>
                    <span className="font-medium">{loan.start_date}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">End Date</span>
                    <span className="font-medium">{loan.end_date}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Interest Rate</span>
                    <span className="font-medium">{loan.product_details?.interest_rate}% {loan.product_details?.interest_period}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Loan Amount</span>
                    <span className="font-semibold">{formatCurrency(loan.total_loan_amount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50/30 overflow-hidden">
              <CardHeader className="bg-green-100/50 pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-green-800">
                  <Banknote className="h-5 w-5" /> Payoff Quote
                </CardTitle>
                <CardDescription className="text-green-700/70">
                  Breakdown for immediate settlement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                {isPayoffLoading || isPayoffRefetching ? (
                  <div className="py-4 text-center text-sm text-green-600 animate-pulse">
                    Calculating payoff amount...
                  </div>
                ) : payoffQuote ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Principal to Clear</span>
                      <span className="font-medium">{formatCurrency(payoffQuote.principal_to_clear)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Accrued Interest</span>
                      <span className="font-medium">{formatCurrency(payoffQuote.interest_to_recognize)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Unpaid Fees</span>
                      <span className="font-medium">{formatCurrency(payoffQuote.unpaid_fees)}</span>
                    </div>
                    {parseFloat(loan.total_penalties_owed) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-red-600 font-medium">Penalties Owed</span>
                        <span className="font-medium text-red-600">{formatCurrency(loan.total_penalties_owed)}</span>
                      </div>
                    )}
                    <Separator className="bg-green-200" />
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-sm font-semibold text-green-900">Settlement Only</span>
                      <span className="text-lg font-semibold text-green-700">{formatCurrency(payoffQuote.total_payoff_amount)}</span>
                    </div>
                    {parseFloat(loan.total_penalties_owed) > 0 && (
                      <div className="flex justify-between items-center bg-purple-50 border border-purple-200 rounded px-3 py-2 mt-1">
                        <span className="text-sm font-semibold text-purple-900">Full Clearance</span>
                        <span className="text-lg font-semibold text-purple-700">
                          {formatCurrency(parseFloat(payoffQuote.total_payoff_amount) + parseFloat(loan.total_penalties_owed))}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-4 text-center text-xs text-amber-600 italic">
                    Unable to generate payoff quote
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-green-50 px-6 py-3 border-t border-green-100 flex items-start gap-2">
                <Info className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                <p className="text-[10px] leading-tight text-green-800/60 font-medium">
                  This amount includes the outstanding principal, interest
                  accrued to date, and any unpaid fees.
                </p>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-500" /> Borrower
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{loan.member}</p>
                    <Link
                      href={`/sacco-admin/members/${member_no}`}
                      className="text-xs text-primary hover:underline"
                    >
                      View Member Profile
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Payment Modal */}
        <CreateLoanPayment
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          refetchLoan={refetchAll}
          loan_account={loan.account_number}
          maxAmount={parseFloat(loan.outstanding_balance)}
          loanData={loan}
          exactClearanceAmount={
            payoffQuote
              ? parseFloat(payoffQuote.total_payoff_amount) + parseFloat(loan.total_penalties_owed || 0)
              : null
          }
        />

        <CreateLoanPenalty
          isOpen={isPenaltyModalOpen}
          onClose={() => setIsPenaltyModalOpen(false)}
          refetchLoan={refetchAll}
          loan_account={loan.account_number}
        />

        <UpdateLoanPenalty
          isOpen={isUpdatePenaltyModalOpen}
          onClose={() => setIsUpdatePenaltyModalOpen(false)}
          refetchLoan={refetchAll}
          penalty={selectedPenalty}
        />
      </div>
    </div>
  );
}
