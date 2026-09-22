"use client";

import Link from "next/link";
import React, { use, useState } from "react";
import { format } from "date-fns";
import { useFetchLoanDetail, useFetchLoanPayOffAmount } from "@/hooks/loans/actions";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { retryLoanPaymentAccounting } from "@/services/loanrepayments";
import toast from "react-hot-toast";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  Plus,
  Receipt,
  MoreVertical,
  ArrowUpRight,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  RotateCcw,
  Undo2,
} from "lucide-react";
import CreateLoanPayment, { getPendingProcessingFee } from "@/forms/loanrepayments/CreateLoanPayment";
import { useFetchLoanPenaltiesByLoanAccountReference } from "@/hooks/loanpenalties/actions";
import CreateLoanPenalty from "@/forms/loanpenalties/CreateLoanPenalty";
import UpdateLoanPenalty from "@/forms/loanpenalties/UpdateLoanPenalty";
import AdjustScheduleModal from "@/forms/loans/AdjustScheduleModal";
import CreateTopUpModal from "@/forms/loans/CreateTopUpModal";
import ReversePaymentModal from "@/forms/loans/ReversePaymentModal";
import ResetLoanModal from "@/forms/loans/ResetLoanModal";
import ReverseTopUpModal from "@/forms/loans/ReverseTopUpModal";

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="h-28 bg-slate-200 rounded-lg" />
      <div className="h-28 bg-slate-200 rounded-lg" />
      <div className="h-28 bg-slate-200 rounded-lg" />
    </div>
    <div className="h-96 bg-slate-200 rounded-lg" />
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
    isRefetching: isPayoffRefetching,
  } = useFetchLoanPayOffAmount(loan_reference);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPenaltyModalOpen, setIsPenaltyModalOpen] = useState(false);
  const [isUpdatePenaltyModalOpen, setIsUpdatePenaltyModalOpen] = useState(false);
  const [isAdjustScheduleModalOpen, setIsAdjustScheduleModalOpen] = useState(false);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [isReverseModalOpen, setIsReverseModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isReverseTopUpModalOpen, setIsReverseTopUpModalOpen] = useState(false);
  const [selectedPaymentForReversal, setSelectedPaymentForReversal] = useState(null);
  const [selectedTopUpForReversal, setSelectedTopUpForReversal] = useState(null);
  const [selectedPenalty, setSelectedPenalty] = useState(null);
  const [repaymentType, setRepaymentType] = useState("Regular Repayment");
  const [activeTab, setActiveTab] = useState("schedule");

  const token = useAxiosAuth();
  const [retryingPayments, setRetryingPayments] = useState({});

  const handleRetryGL = async (paymentRef) => {
    setRetryingPayments((prev) => ({ ...prev, [paymentRef]: true }));
    try {
      await retryLoanPaymentAccounting(paymentRef, token);
      toast.success("GL posting processed successfully!");
      refetchAll();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Failed to retry GL posting");
    } finally {
      setRetryingPayments((prev) => ({ ...prev, [paymentRef]: false }));
    }
  };

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
      <div className="p-8 text-center min-h-[50vh] flex flex-col items-center justify-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-slate-800">Loan Account Not Found</h2>
        <p className="text-muted-foreground mt-2 max-w-md">
          The loan account details for reference <span className="font-mono">{loan_reference}</span> could not be retrieved.
        </p>
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="mt-4"
        >
          Go Back
        </Button>
      </div>
    );

  // Financial Calculations
  const totalProcessingFee = parseFloat(loan.processing_fee || 0);
  const pendingProcessingFee = getPendingProcessingFee(loan);
  const paidProcessingFee = Math.max(0, totalProcessingFee - pendingProcessingFee);

  const principalAmount = parseFloat(loan.principal || 0);
  const totalPrincipalPaid = parseFloat(loan.total_principal_paid || 0);
  const outstandingPrincipal = parseFloat(
    loan.outstanding_principal !== undefined
      ? loan.outstanding_principal
      : Math.max(0, principalAmount - totalPrincipalPaid)
  );
  const principalProgressPercent = principalAmount > 0
    ? Math.min(100, Math.max(0, Math.round((totalPrincipalPaid / principalAmount) * 100)))
    : 0;

  const totalInterest = parseFloat(loan.total_interest_accrued || 0);
  const outstandingBalance = parseFloat(loan.outstanding_balance || 0);
  const penaltiesOwed = parseFloat(loan.total_penalties_owed || 0);

  const totalObligation = principalAmount + totalInterest;
  const totalRepaid = Math.max(0, totalObligation - outstandingBalance);
  const progressPercent = totalObligation > 0
    ? Math.min(100, Math.max(0, Math.round((totalRepaid / totalObligation) * 100)))
    : 0;

  const getStatusBadge = (status) => {
    switch (status) {
      case "Funded":
      case "Active":
        return "bg-green-100 text-green-800 border-green-200";
      case "Closed":
      case "Paid":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "In Arrears":
      case "Defaulted":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-16">
      <div className="mx-auto p-4 sm:p-6 space-y-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/sacco-admin/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/sacco-admin/loans">Loan Portfolio</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/sacco-admin/members/${member_no}`}>
                {loan.member}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage>{loan.account_number}</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header with Title & Action Controls - Sticky for easy access while scrolling */}
        <div className="sticky top-16 z-20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-sm transition-all">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                {loan.product} Account
              </h1>
              <Badge className={getStatusBadge(loan.status)} variant="outline">
                {loan.status}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-mono">
              Account No: <span className="font-semibold text-slate-700">{loan.account_number}</span> • Member: <Link href={`/sacco-admin/members/${member_no}`} className="text-primary hover:underline font-semibold">{loan.member}</Link>
            </p>
          </div>

          {/* Streamlined Action Buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Primary Action Button */}
            {(outstandingBalance > 0 || pendingProcessingFee > 0) && (
              <Button
                onClick={() => {
                  setRepaymentType("Regular Repayment");
                  setIsPaymentModalOpen(true);
                }}
                className="bg-primary hover:bg-[#022007] text-white flex-1 md:flex-initial shadow-sm font-medium h-10 px-4 flex items-center gap-2"
              >
                <Banknote className="h-4 w-4" />
                <span>Log Payment</span>
              </Button>
            )}

            {/* Secondary Actions Popover Menu */}
            {loan.status !== "Closed" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-slate-200 text-slate-700 hover:bg-slate-50 h-10 px-3 flex items-center gap-1.5"
                    aria-label="More account actions"
                  >
                    <MoreVertical className="h-4 w-4" />
                    <span className="hidden sm:inline text-xs font-medium">Actions</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-52 p-1.5 space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAdjustScheduleModalOpen(true)}
                    className="w-full justify-start text-xs font-medium h-9 text-slate-700 hover:text-slate-900"
                  >
                    <Pencil className="mr-2 h-3.5 w-3.5 text-slate-500" />
                    Adjust Schedule
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsTopUpModalOpen(true)}
                    className="w-full justify-start text-xs font-medium h-9 text-slate-700 hover:text-slate-900"
                  >
                    <Plus className="mr-2 h-3.5 w-3.5 text-slate-500" />
                    Top Up Loan
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsPenaltyModalOpen(true)}
                    className="w-full justify-start text-xs font-medium h-9 text-amber-700 hover:text-amber-800 hover:bg-amber-50"
                  >
                    <AlertTriangle className="mr-2 h-3.5 w-3.5 text-amber-600" />
                    Apply Penalty
                  </Button>
                  <div className="border-t border-slate-100 my-1" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsResetModalOpen(true)}
                    className="w-full justify-start text-xs font-medium h-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <RotateCcw className="mr-2 h-3.5 w-3.5 text-red-600" />
                    Reset Loan Account
                  </Button>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>

        {/* 2-Column Responsive Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
          
          {/* Main Left Column (Financial Summary & Tabbed Tables) */}
          <div className="xl:col-span-3 space-y-6 min-w-0">
            
            {/* Unified 4-Card Financial Overview (2x2 on medium, 4 in a row on large screens) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-4 gap-4">
              
              {/* Card 1: Outstanding Principal (Exact Principal Debt) */}
              <Card className="border border-slate-200/80 shadow-sm bg-white overflow-hidden flex flex-col justify-between min-w-0">
                <CardHeader className="pb-2 pt-4 px-4 sm:px-5">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 shrink-0">
                      <Banknote className="h-4 w-4 text-emerald-600" /> Outstanding Principal
                    </CardTitle>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 whitespace-nowrap">
                      {principalProgressPercent}% Repaid
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="px-4 sm:px-5 pb-4 space-y-3">
                  <div>
                    <p className="text-xl sm:text-2xl 2xl:text-3xl font-bold text-slate-900 tracking-tight whitespace-nowrap">
                      {formatCurrency(outstandingPrincipal)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Remaining principal to be repaid
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${principalProgressPercent}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-100 text-slate-600 font-medium">
                    <span>Initial: <strong>{formatCurrency(principalAmount)}</strong></span>
                    <span>Paid: <strong className="text-emerald-700">{formatCurrency(totalPrincipalPaid)}</strong></span>
                  </div>
                </CardContent>
              </Card>

              {/* Card 2: Outstanding Balance & Total Obligation */}
              <Card className="border border-slate-200/80 shadow-sm bg-white overflow-hidden flex flex-col justify-between min-w-0">
                <CardHeader className="pb-2 pt-4 px-4 sm:px-5">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 shrink-0">
                      <TrendingDown className="h-4 w-4 text-[var(--accent)]" /> Outstanding Balance
                    </CardTitle>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 whitespace-nowrap">
                      {progressPercent}% Total Paid
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="px-4 sm:px-5 pb-4 space-y-3">
                  <div>
                    <p className="text-xl sm:text-2xl 2xl:text-3xl font-bold text-slate-900 tracking-tight whitespace-nowrap">
                      {formatCurrency(outstandingBalance)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Remaining principal + accrued interest
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-100 text-slate-600 font-medium">
                    <span>Accrued Int: <strong>{formatCurrency(totalInterest)}</strong></span>
                    <span>Obligation: <strong>{formatCurrency(totalObligation)}</strong></span>
                  </div>
                </CardContent>
              </Card>

              {/* Card 3: Unified Processing Fee Component */}
              <Card className="border border-slate-200/80 shadow-sm bg-white flex flex-col justify-between min-w-0">
                <CardHeader className="pb-2 pt-4 px-4 sm:px-5">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 shrink-0">
                      <Receipt className="h-4 w-4 text-indigo-500" /> Processing Fee
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-medium py-0.5 px-2 shrink-0 ${
                        totalProcessingFee === 0
                          ? "bg-slate-100 text-slate-600 border-slate-200"
                          : pendingProcessingFee === 0
                          ? "bg-green-50 text-green-700 border-green-200"
                          : paidProcessingFee > 0
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}
                    >
                      {totalProcessingFee === 0 ? (
                        "No Fee"
                      ) : pendingProcessingFee === 0 ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-green-600" /> Paid in Full
                        </span>
                      ) : paidProcessingFee > 0 ? (
                        `Due ${formatCurrency(pendingProcessingFee)}`
                      ) : (
                        `Due ${formatCurrency(pendingProcessingFee)}`
                      )}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="px-4 sm:px-5 pb-4 space-y-3">
                  <div>
                    <p className="text-xl sm:text-2xl 2xl:text-3xl font-bold text-slate-900 tracking-tight whitespace-nowrap">
                      {formatCurrency(totalProcessingFee)}
                    </p>
                    <div className="flex justify-between items-center text-xs text-muted-foreground mt-0.5">
                      <span>Total Assessed Fee</span>
                      <span>Paid: <strong className="text-slate-800">{formatCurrency(paidProcessingFee)}</strong></span>
                    </div>
                  </div>

                  {/* Contextual Action Button if Fee is Pending */}
                  {pendingProcessingFee > 0 ? (
                    <Button
                      size="sm"
                      onClick={() => {
                        setRepaymentType("Processing Fee Payment");
                        setIsPaymentModalOpen(true);
                      }}
                      className="w-full h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-sm transition-all"
                    >
                      Pay Processing Fee ({formatCurrency(pendingProcessingFee)})
                    </Button>
                  ) : (
                    <div className="h-8 flex items-center gap-1.5 text-xs text-green-700 bg-green-50/70 rounded px-2 font-medium border border-green-100">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                      <span>Processing fee settled in full</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Card 4: Penalties & Compliance Status */}
              <Card className={`border shadow-sm flex flex-col justify-between min-w-0 ${
                penaltiesOwed > 0 
                  ? "border-red-200 bg-red-50/20" 
                  : "border-slate-200/80 bg-white"
              }`}>
                <CardHeader className="pb-2 pt-4 px-4 sm:px-5">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 shrink-0 ${
                      penaltiesOwed > 0 ? "text-red-700" : "text-slate-500"
                    }`}>
                      <AlertTriangle className={`h-4 w-4 ${penaltiesOwed > 0 ? "text-red-600" : "text-slate-400"}`} />
                      Loan Penalties
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-medium py-0.5 px-2 shrink-0 ${
                        penaltiesOwed > 0
                          ? "bg-red-100 text-red-700 border-red-200"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {penaltiesOwed > 0 ? "Outstanding" : "Zero Penalties"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="px-4 sm:px-5 pb-4 space-y-3">
                  <div>
                    <p className={`text-xl sm:text-2xl 2xl:text-3xl font-bold tracking-tight whitespace-nowrap ${
                      penaltiesOwed > 0 ? "text-red-600" : "text-slate-900"
                    }`}>
                      {formatCurrency(penaltiesOwed)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {penaltiesOwed > 0
                        ? `${penalties?.length || 0} active penalty assessment(s)`
                        : "No outstanding default penalties"}
                    </p>
                  </div>

                  <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-100 text-slate-600 font-medium">
                    <span>Rate: <strong>{loan.product_details?.interest_rate}% {loan.product_details?.interest_period || "p.a."}</strong></span>
                    <span>Method: <strong>{loan.product_details?.interest_method || "Reducing"}</strong></span>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Tabbed Navigation Interface for Account Tables (Replaces Long Scroll) */}
            <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                
                {/* Well-Spaced Action Tabs */}
                <div className="border-b border-slate-100 bg-slate-50/60 p-3 sm:p-4">
                  <TabsList className="bg-transparent border-0 p-0 h-auto w-full flex flex-wrap items-center gap-2 sm:gap-2.5">
                    <TabsTrigger
                      value="schedule"
                      className="h-10 px-4 rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary data-[state=active]:shadow-sm flex items-center gap-2 text-xs sm:text-sm font-medium whitespace-nowrap"
                    >
                      <Calendar className="h-4 w-4" />
                      <span>Amortization Schedule</span>
                      <span className="ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 data-[state=active]:bg-white/20 data-[state=active]:text-white">
                        {loan.projection_snapshot?.schedule?.length || 0}
                      </span>
                    </TabsTrigger>

                    <TabsTrigger
                      value="repayments"
                      className="h-10 px-4 rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary data-[state=active]:shadow-sm flex items-center gap-2 text-xs sm:text-sm font-medium whitespace-nowrap"
                    >
                      <History className="h-4 w-4" />
                      <span>Repayments & GL</span>
                      <span className="ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 data-[state=active]:bg-white/20 data-[state=active]:text-white">
                        {loan.loan_payments?.length || 0}
                      </span>
                    </TabsTrigger>

                    <TabsTrigger
                      value="penalties"
                      className="h-10 px-4 rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary data-[state=active]:shadow-sm flex items-center gap-2 text-xs sm:text-sm font-medium whitespace-nowrap"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      <span>Penalties</span>
                      {penalties?.length > 0 && (
                        <span className={`ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          penaltiesOwed > 0 ? "bg-red-100 text-red-700 data-[state=active]:bg-red-200/40 data-[state=active]:text-white" : "bg-slate-100 text-slate-700 data-[state=active]:bg-white/20 data-[state=active]:text-white"
                        }`}>
                          {penalties.length}
                        </span>
                      )}
                    </TabsTrigger>

                    <TabsTrigger
                      value="disbursements"
                      className="h-10 px-4 rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary data-[state=active]:shadow-sm flex items-center gap-2 text-xs sm:text-sm font-medium whitespace-nowrap"
                    >
                      <Banknote className="h-4 w-4" />
                      <span>Disbursements</span>
                      <span className="ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 data-[state=active]:bg-white/20 data-[state=active]:text-white">
                        {loan.disbursements?.length || 0}
                      </span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Tab 1: Amortization Schedule */}
                <TabsContent value="schedule" className="m-0 p-0 focus-visible:outline-none">
                  <div className="p-4 bg-slate-50/40 border-b text-xs text-muted-foreground">
                    {loan.product_details?.interest_method === "Flat"
                      ? "Flat-rate amortization: Interest is charged on original principal. Balance column indicates total outstanding debt."
                      : "Reducing balance amortization: Interest is assessed on remaining principal each period. Balance column shows remaining principal balance."}
                  </div>
                  <div className="overflow-x-auto w-full -mx-0">
                    <Table className="min-w-[600px]">
                      <TableHeader className="bg-slate-50/70">
                        <TableRow>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Principal Due</TableHead>
                          <TableHead>Interest Due</TableHead>
                          <TableHead className="font-semibold text-primary">Total Due</TableHead>
                          <TableHead>Principal Paid</TableHead>
                          <TableHead>Interest Paid</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Balance After</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loan.projection_snapshot?.schedule?.length > 0 ? (
                          loan.projection_snapshot.schedule.map((item, i) => (
                            <TableRow key={i} className="hover:bg-slate-50/60 transition-colors">
                              <TableCell className="whitespace-nowrap text-xs">
                                {format(new Date(item.due_date), "MMM dd, yyyy")}
                              </TableCell>
                              <TableCell className="text-xs">
                                {formatCurrency(item.principal_due)}
                              </TableCell>
                              <TableCell className="text-xs">
                                {formatCurrency(item.interest_due)}
                              </TableCell>
                              <TableCell className="text-xs font-bold text-slate-900">
                                {formatCurrency(item.total_due)}
                              </TableCell>
                              <TableCell className="text-xs text-green-700 font-medium">
                                {formatCurrency(item.principal_paid)}
                              </TableCell>
                              <TableCell className="text-xs text-indigo-700 font-medium">
                                {formatCurrency(item.interest_paid)}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] py-0 font-medium ${
                                    item.is_paid
                                      ? "bg-green-100 text-green-700 border-green-200"
                                      : "bg-slate-100 text-slate-600 border-slate-200"
                                  }`}
                                >
                                  {item.is_paid ? "Paid" : "Pending"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right text-xs font-mono text-slate-700">
                                {formatCurrency(item.balance_after)}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-sm">
                              No projection schedule recorded for this loan.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                {/* Tab 2: Repayments & GL Tracking */}
                <TabsContent value="repayments" className="m-0 p-0 focus-visible:outline-none">
                  <div className="overflow-x-auto w-full">
                    <Table className="min-w-[700px]">
                      <TableHeader className="bg-slate-50/70">
                        <TableRow>
                          <TableHead>Transaction Date</TableHead>
                          <TableHead>Transaction Ref</TableHead>
                          <TableHead>Payment Method</TableHead>
                          <TableHead>Repayment Type</TableHead>
                          <TableHead>Accounting / GL Status</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loan.loan_payments?.length > 0 ? (
                          [...loan.loan_payments]
                            .sort((a, b) => new Date(b.transaction_date || b.created_at).getTime() - new Date(a.transaction_date || a.created_at).getTime())
                            .map((payment, i) => (
                            <TableRow key={i} className="hover:bg-slate-50/60 transition-colors">
                              <TableCell className="font-medium text-xs whitespace-nowrap">
                                {payment.transaction_date || (payment.created_at ? new Date(payment.created_at).toLocaleDateString("en-GB") : "-")}
                              </TableCell>
                              <TableCell className="font-mono text-xs font-medium text-slate-700">
                                {payment.transaction_code || payment.reference}
                              </TableCell>
                              <TableCell className="text-xs">
                                {payment.payment_method}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-[10px] py-0">
                                  {payment.repayment_type}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {payment.transaction_status === "Reversed" ? (
                                  <Badge variant="destructive" className="text-[10px] py-0 bg-red-100 text-red-700 border-red-200">
                                    Reversed
                                  </Badge>
                                ) : payment.transaction_status === "Completed" && (
                                  payment.posted_to_gl ? (
                                    <span className="text-[11px] text-green-600 flex items-center gap-1 font-medium">
                                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-600" /> Posted to GL
                                    </span>
                                  ) : (
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[10px] text-amber-600 flex items-center gap-0.5 font-medium">
                                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> Pending
                                      </span>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleRetryGL(payment.reference)}
                                        disabled={!!retryingPayments[payment.reference]}
                                        className="h-6 text-[10px] py-0 px-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200"
                                      >
                                        {retryingPayments[payment.reference] ? "Retrying..." : "Retry GL"}
                                      </Button>
                                    </div>
                                  )
                                )}
                              </TableCell>
                              <TableCell className="text-right font-bold text-slate-900 text-xs">
                                {formatCurrency(payment.amount)}
                              </TableCell>
                              <TableCell className="text-right">
                                {payment.transaction_status === "Completed" && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setSelectedPaymentForReversal(payment.reference);
                                      setIsReverseModalOpen(true);
                                    }}
                                    className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    Reverse
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                              No repayments recorded for this loan yet.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                {/* Tab 3: Loan Penalties */}
                <TabsContent value="penalties" className="m-0 p-0 focus-visible:outline-none">
                  <div className="p-3 bg-slate-50/60 border-b flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                      Administrative late penalties applied to overdue installments.
                    </p>
                    <Button
                      size="sm"
                      onClick={() => setIsPenaltyModalOpen(true)}
                      className="bg-primary hover:bg-[#022007] text-white text-xs h-8"
                    >
                      <Plus className="mr-1.5 h-3.5 w-3.5" /> Apply Penalty
                    </Button>
                  </div>
                  <div className="overflow-x-auto w-full">
                    <Table className="min-w-[700px]">
                      <TableHeader className="bg-slate-50/70">
                        <TableRow>
                          <TableHead>Date / Code</TableHead>
                          <TableHead>Installment</TableHead>
                          <TableHead>Penalty Amount</TableHead>
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
                            <TableRow key={i} className="hover:bg-slate-50/60 transition-colors">
                              <TableCell>
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-xs font-medium">{format(new Date(penalty.created_at), "MMM d, yyyy")}</span>
                                  <span className="font-mono text-[10px] text-muted-foreground">{penalty.penalty_code}</span>
                                </div>
                              </TableCell>
                              <TableCell className="font-mono text-xs">
                                {penalty.installment_code}
                              </TableCell>
                              <TableCell className="font-semibold text-xs">
                                {formatCurrency(penalty.amount)}
                              </TableCell>
                              <TableCell className="text-xs text-green-700">
                                {formatCurrency(penalty.amount_paid)}
                              </TableCell>
                              <TableCell className="font-bold text-xs text-amber-700">
                                {formatCurrency(penalty.balance)}
                              </TableCell>
                              <TableCell className="text-xs text-slate-600">
                                {penalty.charged_by}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] py-0 ${
                                    penalty.status === "Pending" ? "bg-amber-100 text-amber-700 border-amber-200" :
                                    penalty.status === "Paid" ? "bg-green-100 text-green-700 border-green-200" :
                                    "bg-slate-100 text-slate-700 border-slate-200"
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
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-sm">
                              No penalties have been charged to this loan.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                {/* Tab 4: Disbursements */}
                <TabsContent value="disbursements" className="m-0 p-0 focus-visible:outline-none">
                  <div className="overflow-x-auto w-full">
                    <Table className="min-w-[600px]">
                      <TableHeader className="bg-slate-50/70">
                        <TableRow>
                          <TableHead>Disbursement Date</TableHead>
                          <TableHead>Payment Method</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loan.disbursements?.length > 0 ? (
                          [...loan.disbursements]
                            .sort((a, b) => new Date(b.transaction_date || b.created_at).getTime() - new Date(a.transaction_date || a.created_at).getTime())
                            .map((d, i) => {
                              const matchingTopUp = loan.top_ups?.find(
                                (t) => t.disbursement === d.reference || t.reference === d.reference || (t.top_up_amount === d.amount && t.status === "Disbursed")
                              );
                              return (
                                <TableRow key={i} className="hover:bg-slate-50/60 transition-colors">
                                  <TableCell className="font-medium text-xs">
                                    {d.transaction_date || (d.created_at ? new Date(d.created_at).toLocaleDateString("en-GB") : "-")}
                                  </TableCell>
                                  <TableCell className="text-xs">{d.payment_method}</TableCell>
                                  <TableCell className="text-xs">
                                    <Badge variant="outline" className="text-[10px] py-0 font-normal">
                                      {d.disbursement_type}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-xs">
                                    <Badge
                                      variant="outline"
                                      className={`text-[10px] py-0 ${
                                        d.transaction_status === "Completed"
                                          ? "bg-green-50 text-green-700 border-green-200"
                                          : d.transaction_status === "Cancelled" || d.transaction_status === "Reversed"
                                          ? "bg-slate-100 text-slate-600 border-slate-200"
                                          : "bg-amber-50 text-amber-700 border-amber-200"
                                      }`}
                                    >
                                      {d.transaction_status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right font-bold text-slate-900 text-xs">
                                    {formatCurrency(d.amount)}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {d.disbursement_type === "Topup" && matchingTopUp && matchingTopUp.status === "Disbursed" ? (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          setSelectedTopUpForReversal(matchingTopUp);
                                          setIsReverseTopUpModalOpen(true);
                                        }}
                                        className="h-7 text-[11px] text-amber-700 hover:text-amber-800 hover:bg-amber-50 gap-1 border-amber-200 font-medium"
                                      >
                                        <Undo2 className="h-3 w-3" />
                                        Reverse
                                      </Button>
                                    ) : (
                                      <span className="text-slate-400 text-xs">-</span>
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                              No disbursements recorded yet.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

              </Tabs>
            </Card>

          </div>

          {/* Right Column: Loan Details, Unified Payoff Quote & Borrower Info */}
          <div className="space-y-6">
            
            {/* Payoff Quote (Immediate Settlement Breakdown) */}
            <Card className="border border-green-200 bg-gradient-to-b from-green-50/50 to-white shadow-sm overflow-hidden">
              <CardHeader className="bg-green-100/60 pb-3 border-b border-green-200/60">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2 text-green-900">
                    <Banknote className="h-4 w-4 text-green-700" /> Payoff Quote
                  </CardTitle>
                  <span className="text-[10px] bg-green-200/80 text-green-900 font-semibold px-2 py-0.5 rounded uppercase tracking-wider">
                    Instant Quote
                  </span>
                </div>
                <CardDescription className="text-xs text-green-800/80">
                  Exact amount to clear loan today
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 pt-4">
                {isPayoffLoading || isPayoffRefetching ? (
                  <div className="py-6 text-center text-xs text-green-700 animate-pulse">
                    Computing settlement quote...
                  </div>
                ) : payoffQuote ? (
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Principal to Clear</span>
                      <span className="font-semibold text-slate-800">{formatCurrency(payoffQuote.principal_to_clear)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Accrued Interest</span>
                      <span className="font-semibold text-slate-800">{formatCurrency(payoffQuote.interest_to_recognize)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Unpaid Fees</span>
                      <span className="font-semibold text-slate-800">{formatCurrency(payoffQuote.unpaid_fees)}</span>
                    </div>
                    {penaltiesOwed > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-red-600 font-medium">Penalties Owed</span>
                        <span className="font-semibold text-red-600">{formatCurrency(penaltiesOwed)}</span>
                      </div>
                    )}
                    
                    <Separator className="bg-green-200 my-2" />

                    {/* Settlement Amount */}
                    <div className="flex justify-between items-center pt-1">
                      <div>
                        <p className="text-xs font-semibold text-green-900">Settlement Total</p>
                        <p className="text-[10px] text-muted-foreground">Excluding unpaid penalties</p>
                      </div>
                      <span className="text-lg font-bold text-green-800 font-mono">
                        {formatCurrency(payoffQuote.total_payoff_amount)}
                      </span>
                    </div>

                    {/* Full Clearance (with penalties) */}
                    {penaltiesOwed > 0 && (
                      <div className="flex justify-between items-center bg-purple-50 border border-purple-200 rounded-lg p-2.5 mt-2">
                        <div>
                          <p className="text-xs font-semibold text-purple-900">Full Clearance</p>
                          <p className="text-[10px] text-purple-700">Settlement + all penalties</p>
                        </div>
                        <span className="text-base font-bold text-purple-800 font-mono">
                          {formatCurrency(parseFloat(payoffQuote.total_payoff_amount) + penaltiesOwed)}
                        </span>
                      </div>
                    )}

                    <Button
                      size="sm"
                      onClick={() => {
                        setRepaymentType("Clearance Repayment");
                        setIsPaymentModalOpen(true);
                      }}
                      className="w-full mt-3 bg-green-700 hover:bg-green-800 text-white text-xs h-9 font-medium shadow-sm"
                    >
                      Clear Loan Account
                    </Button>
                  </div>
                ) : (
                  <div className="py-4 text-center text-xs text-amber-600 italic">
                    Unable to generate live payoff quote.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Loan Account Metadata Card */}
            <Card className="border border-slate-200 shadow-sm bg-white">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-800">
                  <FileText className="h-4 w-4 text-slate-500" /> Account Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-3">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Original Principal</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(principalAmount)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Outstanding Principal</span>
                  <span className="font-bold text-emerald-700">{formatCurrency(outstandingPrincipal)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Start Date</span>
                  <span className="font-medium text-slate-800">{loan.start_date || "N/A"}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Maturity Date</span>
                  <span className="font-medium text-slate-800">{loan.end_date || "N/A"}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Interest Rate</span>
                  <span className="font-medium text-slate-800">
                    {loan.product_details?.interest_rate || loan.interest_rate}% {loan.product_details?.interest_period || "p.a."}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Total Obligation</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(loan.total_loan_amount)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Borrower Card */}
            <Card className="border border-slate-200 shadow-sm bg-white">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-800">
                  <User className="h-4 w-4 text-slate-500" /> Borrower Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2.5 rounded-lg text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-900 truncate">{loan.member}</p>
                    <p className="text-xs text-muted-foreground">Member #{member_no}</p>
                    <Link
                      href={`/sacco-admin/members/${member_no}`}
                      className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1 mt-1"
                    >
                      <span>View Full Profile</span>
                      <ArrowUpRight className="h-3 w-3" />
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
          initialRepaymentType={repaymentType}
          exactClearanceAmount={
            payoffQuote
              ? parseFloat(payoffQuote.total_payoff_amount) + parseFloat(loan.total_penalties_owed || 0)
              : null
          }
        />

        {/* Penalty Modals */}
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

        {/* Schedule & Top-Up Modals */}
        <AdjustScheduleModal
          isOpen={isAdjustScheduleModalOpen}
          onClose={() => setIsAdjustScheduleModalOpen(false)}
          refetchLoan={refetchAll}
          loan={loan}
        />

        <CreateTopUpModal
          isOpen={isTopUpModalOpen}
          onClose={() => setIsTopUpModalOpen(false)}
          refetchLoan={refetchAll}
          loan={loan}
        />

        {/* Reverse Payment Modal */}
        <ReversePaymentModal
          isOpen={isReverseModalOpen}
          onClose={() => setIsReverseModalOpen(false)}
          refetch={refetchAll}
          paymentRef={selectedPaymentForReversal}
          type="LoanPayment"
        />

        {/* Reset Loan Modal */}
        <ResetLoanModal
          isOpen={isResetModalOpen}
          onClose={() => setIsResetModalOpen(false)}
          refetchLoan={refetchAll}
          loan={loan}
        />

        {/* Reverse Top-Up Modal */}
        <ReverseTopUpModal
          isOpen={isReverseTopUpModalOpen}
          onClose={() => {
            setIsReverseTopUpModalOpen(false);
            setSelectedTopUpForReversal(null);
          }}
          refetchLoan={refetchAll}
          topUp={selectedTopUpForReversal}
        />

      </div>
    </div>
  );
}
