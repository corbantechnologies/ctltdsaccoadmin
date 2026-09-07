"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useFetchMember, useFetchMembers } from "@/hooks/members/actions";
import { useFetchSavingsTypes } from "@/hooks/savingtypes/actions";
import { useFetchLoanProducts } from "@/hooks/loanproducts/actions";
import { useFetchFeeTypes } from "@/hooks/feetypes/actions";
import { useFetchSavings } from "@/hooks/savings/actions";
import { useFetchLoans } from "@/hooks/loans/actions";
import { useFetchLoanApplications } from "@/hooks/loanapplications/actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Users,
  Wallet,
  CreditCard,
  TrendingUp,
  Plus,
  Loader2,
  ChevronDown,
  User,
  UsersRound,
  FileUp,
  FileDown,
  HandCoins,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ShieldAlert,
  Settings,
  ArrowRight,
} from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import SaccoMembersTable from "@/components/members/SaccoMembersTable";
import CreateMember from "@/forms/members/CreateMember";
import BulkMemberCreate from "@/forms/members/BulkMemberCreate";
import BulkMemberUploadCreate from "@/forms/members/BulkMemberUploadCreate";
import CreateSavingTypeModal from "@/forms/savingtypes/CreateSavingType";
import CreateLoanProduct from "@/forms/loanproducts/CreateLoanProduct";
import { downloadBulkMembersTemplate } from "@/services/members";
import { downloadAccountsListCSV } from "@/services/transactions";
import toast from "react-hot-toast";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import CreateFeeTypeModal from "@/forms/feetypes/CreateFeeType";

const TableSkeleton = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="border border-slate-100 rounded-lg overflow-hidden bg-white">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            {Array.from({ length: cols }).map((_, i) => (
              <TableHead key={i}>
                <div className="h-4 bg-slate-200 rounded w-16 animate-pulse" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: cols }).map((_, colIndex) => (
                <TableCell key={colIndex}>
                  <div
                    className="h-4 bg-slate-200 rounded animate-pulse"
                    style={{ width: `${Math.floor(((rowIndex + colIndex) % 5) * 10) + 40}%` }}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default function SaccoAdminDashboard() {
  const token = useAxiosAuth();
  const { data: myself, isLoading: isLoadingMyself } = useFetchMember();
  const {
    data: members,
    isLoading: isLoadingMembers,
    refetch: refetchMembers,
  } = useFetchMembers();

  const { data: savingsData, isLoading: isLoadingSavings } = useFetchSavings();
  const { data: loansData, isLoading: isLoadingLoans } = useFetchLoans();
  const { data: applicationsData, isLoading: isLoadingApplications } = useFetchLoanApplications();

  const {
    data: savingTypes,
    isLoading: isLoadingSavingTypes,
    refetch: refetchSavingTypes,
  } = useFetchSavingsTypes();

  const {
    data: loanProducts,
    isLoading: isLoadingLoanProducts,
    refetch: refetchLoanProducts,
  } = useFetchLoanProducts();

  const {
    data: feeTypes,
    isLoading: isLoadingFeeTypes,
    refetch: refetchFeeTypes,
  } = useFetchFeeTypes();

  const [createMemberOpen, setCreateMemberOpen] = useState(false);
  const [bulkMemberCreateOpen, setBulkMemberCreateOpen] = useState(false);
  const [bulkMemberUploadOpen, setBulkMemberUploadOpen] = useState(false);
  const [memberPopoverOpen, setMemberPopoverOpen] = useState(false);
  const [createSavingTypeOpen, setCreateSavingTypeOpen] = useState(false);
  const [createLoanProductOpen, setCreateLoanProductOpen] = useState(false);
  const [createFeeTypeOpen, setCreateFeeTypeOpen] = useState(false);

  // Computed Financial Totals for Executive Command Center
  const executiveMetrics = useMemo(() => {
    // 1. Savings
    const savingsList = Array.isArray(savingsData) ? savingsData : savingsData?.results || [];
    const totalSavings = savingsList.reduce((sum, item) => sum + parseFloat(item.balance || 0), 0);

    // 2. Loans
    const loansList = Array.isArray(loansData) ? loansData : [];
    const totalLoansOutstanding = loansList.reduce((sum, item) => sum + parseFloat(item.outstanding_balance || 0), 0);
    const activeLoans = loansList.filter((l) => l.status === "Active" || l.status === "Funded").length;

    // 3. Members
    const totalMembers = members?.length || 0;
    const approvedMembers = (members || []).filter((m) => m.is_approved).length;

    // 4. Applications needing review
    const appsList = Array.isArray(applicationsData) ? applicationsData : [];
    const pendingApps = appsList.filter((a) => a.status === "Submitted" || a.status === "Pending");

    return {
      totalSavings,
      totalLoansOutstanding,
      activeLoans,
      totalMembers,
      approvedMembers,
      pendingApps,
      appsList,
    };
  }, [savingsData, loansData, members, applicationsData]);

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Admin Command Center
          </h1>
          <p className="text-slate-500 mt-1 text-xs sm:text-sm">
            Executive overview of SACCO members, financial portfolios, and operational queues.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="bg-white px-3.5 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2.5">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            {isLoadingMyself ? (
              <div className="h-4 bg-slate-200 rounded w-24 animate-pulse" />
            ) : (
              <p className="text-xs font-semibold text-slate-800">
                {myself?.salutation} {myself?.last_name} <span className="text-muted-foreground font-normal">(Admin)</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Top 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Members */}
        <Link href="/sacco-admin/members" className="block group">
          <Card className="border border-slate-200/80 shadow-sm bg-white hover:border-[var(--accent)] hover:shadow-md transition-all h-full flex flex-col justify-between">
            <CardHeader className="p-4 sm:p-5 pb-2">
              <CardDescription className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] flex items-center justify-between">
                <span>Total Members</span>
                <Users className="h-4 w-4 text-[var(--accent)]" />
              </CardDescription>
              <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight pt-1 group-hover:text-[var(--accent)] transition-colors">
                {isLoadingMembers ? <span className="text-sm font-normal text-muted-foreground animate-pulse">Loading...</span> : executiveMetrics.totalMembers}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-5 pb-4 pt-0">
              <p className="text-xs text-muted-foreground">
                <strong className="text-emerald-700 font-semibold">{executiveMetrics.approvedMembers}</strong> approved accounts
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Card 2: Savings Portfolio */}
        <Link href="/sacco-admin/saving-accounts" className="block group">
          <Card className="border border-slate-200/80 shadow-sm bg-white hover:border-green-500 hover:shadow-md transition-all h-full flex flex-col justify-between">
            <CardHeader className="p-4 sm:p-5 pb-2">
              <CardDescription className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] flex items-center justify-between">
                <span>Savings Portfolio</span>
                <Wallet className="h-4 w-4 text-green-600" />
              </CardDescription>
              <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight pt-1 group-hover:text-green-700 transition-colors">
                {isLoadingSavings ? <span className="text-sm font-normal text-muted-foreground animate-pulse">Loading...</span> : formatCurrency(executiveMetrics.totalSavings)}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-5 pb-4 pt-0">
              <p className="text-xs text-muted-foreground">Total member deposits held</p>
            </CardContent>
          </Card>
        </Link>

        {/* Card 3: Loans Outstanding */}
        <Link href="/sacco-admin/loans" className="block group">
          <Card className="border border-slate-200/80 shadow-sm bg-white hover:border-blue-500 hover:shadow-md transition-all h-full flex flex-col justify-between">
            <CardHeader className="p-4 sm:p-5 pb-2">
              <CardDescription className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] flex items-center justify-between">
                <span>Active Loan Book</span>
                <HandCoins className="h-4 w-4 text-blue-600" />
              </CardDescription>
              <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight pt-1 group-hover:text-blue-700 transition-colors">
                {isLoadingLoans ? <span className="text-sm font-normal text-muted-foreground animate-pulse">Loading...</span> : formatCurrency(executiveMetrics.totalLoansOutstanding)}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-5 pb-4 pt-0">
              <p className="text-xs text-muted-foreground">
                <strong className="text-slate-800 font-semibold">{executiveMetrics.activeLoans}</strong> loans currently in repayment
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Card 4: Actionable Pending Queue */}
        <Link href="/sacco-admin/loan-applications" className="block group">
          <Card className={`border shadow-sm transition-all h-full flex flex-col justify-between ${
            executiveMetrics.pendingApps.length > 0 
              ? "border-amber-200 bg-amber-50/20 hover:border-amber-400 hover:shadow-md" 
              : "border-slate-200/80 bg-white hover:border-slate-400 hover:shadow-md"
          }`}>
            <CardHeader className="p-4 sm:p-5 pb-2">
              <CardDescription className="font-semibold uppercase tracking-wider text-[10px] flex items-center justify-between">
                <span className={executiveMetrics.pendingApps.length > 0 ? "text-amber-700" : "text-slate-400"}>
                  Pending Approvals
                </span>
                <Clock className={`h-4 w-4 ${executiveMetrics.pendingApps.length > 0 ? "text-amber-600" : "text-slate-400"}`} />
              </CardDescription>
              <CardTitle className={`text-2xl font-bold tracking-tight pt-1 ${
                executiveMetrics.pendingApps.length > 0 ? "text-amber-700" : "text-slate-900"
              }`}>
                {isLoadingApplications ? <span className="text-sm font-normal text-muted-foreground animate-pulse">Loading...</span> : executiveMetrics.pendingApps.length}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-5 pb-4 pt-0">
              <p className="text-xs text-muted-foreground">
                {executiveMetrics.pendingApps.length > 0
                  ? "Applications awaiting decision"
                  : "All applications processed"}
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Quick Action Navigation Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Quick Shortcuts:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/sacco-admin/loan-applications">
            <Button variant="outline" size="sm" className="h-8 text-xs font-medium border-slate-200 hover:bg-slate-50">
              Loan Applications
            </Button>
          </Link>
          <Link href="/sacco-admin/loans">
            <Button variant="outline" size="sm" className="h-8 text-xs font-medium border-slate-200 hover:bg-slate-50">
              Loans Portfolio
            </Button>
          </Link>
          <Link href="/sacco-admin/saving-accounts">
            <Button variant="outline" size="sm" className="h-8 text-xs font-medium border-slate-200 hover:bg-slate-50">
              Savings Accounts
            </Button>
          </Link>
          <Link href="/sacco-admin/accounting">
            <Button variant="outline" size="sm" className="h-8 text-xs font-medium border-slate-200 hover:bg-slate-50">
              General Ledger
            </Button>
          </Link>
          <Link href="/sacco-admin/setup">
            <Button variant="outline" size="sm" className="h-8 text-xs font-medium border-slate-200 hover:bg-slate-50">
              <Settings className="h-3.5 w-3.5 mr-1 text-slate-500" />
              Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Operations Tabs */}
      <Tabs defaultValue="members" className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <TabsList className="bg-white border p-1 rounded-lg w-full sm:w-auto flex overflow-x-auto no-scrollbar gap-1">
            <TabsTrigger value="members" className="text-xs sm:text-sm py-2 px-3 data-[state=active]:bg-slate-100 font-medium">
              Members Directory ({members?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="queue" className="text-xs sm:text-sm py-2 px-3 data-[state=active]:bg-slate-100 font-medium flex items-center gap-1.5">
              <span>Approval Queue</span>
              {executiveMetrics.pendingApps.length > 0 && (
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {executiveMetrics.pendingApps.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="setup" className="text-xs sm:text-sm py-2 px-3 data-[state=active]:bg-slate-100 font-medium">
              Platform Products & Setup
            </TabsTrigger>
          </TabsList>

          {/* Add Member Dropdown Popover */}
          <div className="flex justify-end">
            <Popover open={memberPopoverOpen} onOpenChange={setMemberPopoverOpen}>
              <PopoverTrigger asChild>
                <Button className="bg-primary hover:bg-[#022007] text-white shadow-sm font-medium h-9 text-xs flex items-center gap-1.5">
                  <Plus className="h-4 w-4" /> Add Member <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-1.5" align="end">
                <div className="flex flex-col space-y-0.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start font-medium text-xs h-9 text-slate-700"
                    onClick={() => {
                      setCreateMemberOpen(true);
                      setMemberPopoverOpen(false);
                    }}
                  >
                    <User className="mr-2 h-4 w-4 text-slate-500" /> Single Member
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start font-medium text-xs h-9 text-slate-700"
                    onClick={() => {
                      setBulkMemberCreateOpen(true);
                      setMemberPopoverOpen(false);
                    }}
                  >
                    <UsersRound className="mr-2 h-4 w-4 text-slate-500" /> Bulk Member Form
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start font-medium text-xs h-9 text-slate-700"
                    onClick={() => {
                      setBulkMemberUploadOpen(true);
                      setMemberPopoverOpen(false);
                    }}
                  >
                    <FileUp className="mr-2 h-4 w-4 text-slate-500" /> Bulk CSV Upload
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start font-medium text-xs h-9 text-slate-700"
                    onClick={async () => {
                      try {
                        const response = await downloadBulkMembersTemplate(token);
                        const contentDisposition = response.headers["content-disposition"];
                        let filename = "bulk_members_template.csv";
                        if (contentDisposition && contentDisposition.indexOf("attachment") !== -1) {
                          const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                          const matches = filenameRegex.exec(contentDisposition);
                          if (matches != null && matches[1]) {
                            filename = matches[1].replace(/['"]/g, "");
                          }
                        }

                        const blob = new Blob([response.data], { type: "text/csv" });
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.href = url;
                        link.setAttribute("download", filename);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);
                      } catch (error) {
                        toast.error("Download failed");
                      }
                    }}
                  >
                    <FileUp className="mr-2 h-4 w-4 text-slate-500" /> Download CSV Template
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start font-medium text-xs h-9 text-slate-700"
                    onClick={async () => {
                      try {
                        await downloadAccountsListCSV(token);
                        setMemberPopoverOpen(false);
                      } catch (error) {
                        toast.error("Download failed");
                      }
                    }}
                  >
                    <FileDown className="mr-2 h-4 w-4 text-slate-500" /> Export Accounts CSV
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Tab 1: Members Management */}
        <TabsContent value="members" className="m-0 focus-visible:outline-none">
          {isLoadingMembers ? (
            <TableSkeleton rows={8} cols={5} />
          ) : (
            <SaccoMembersTable members={members} />
          )}
        </TabsContent>

        {/* Tab 2: Approval Queue */}
        <TabsContent value="queue" className="m-0 focus-visible:outline-none">
          <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b bg-slate-50/70 px-6 py-4">
              <CardTitle className="text-base font-semibold text-slate-900">
                Loan Applications Awaiting Admin Decision ({executiveMetrics.pendingApps.length})
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Applications submitted by members or staff that require review, approval, or disbursement.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto w-full">
                <Table className="min-w-[700px]">
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Requested Amount</TableHead>
                      <TableHead>Term</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {executiveMetrics.pendingApps.length > 0 ? (
                      executiveMetrics.pendingApps.map((app) => (
                        <TableRow key={app.reference} className="hover:bg-slate-50/60 transition-colors">
                          <TableCell className="font-mono text-xs font-semibold text-slate-800">
                            {app.reference}
                          </TableCell>
                          <TableCell className="text-xs font-medium text-slate-900">
                            {app.member_name || app.member}
                          </TableCell>
                          <TableCell className="text-xs text-slate-600">
                            {app.product}
                          </TableCell>
                          <TableCell className="text-right font-bold text-xs text-slate-900">
                            {formatCurrency(app.requested_amount)}
                          </TableCell>
                          <TableCell className="text-xs text-slate-600">
                            {app.term_months} Months
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] py-0 font-medium">
                              {app.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Link href={`/sacco-admin/loan-applications/${app.reference}`}>
                              <Button size="sm" variant="outline" className="h-8 text-xs font-medium border-slate-200 hover:bg-primary hover:text-white transition-colors">
                                Review & Approve
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-slate-400 text-sm">
                          <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                          <p className="font-medium text-slate-700">All caught up!</p>
                          <p className="text-xs text-muted-foreground mt-0.5">There are no pending loan applications requiring approval.</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Platform Setup & Products Hub */}
        <TabsContent value="setup" className="m-0 focus-visible:outline-none">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Saving Types Card */}
            <Card className="border border-slate-200 shadow-sm bg-white p-5 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-lg bg-green-50 text-green-700">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-xs font-bold text-slate-700">
                    {savingTypes?.length || 0} Products
                  </Badge>
                </div>
                <h3 className="text-base font-bold text-slate-900 pt-2">Savings Products</h3>
                <p className="text-xs text-muted-foreground">
                  Configure deposit types, minimum balances, and guarantee eligibility rules.
                </p>
              </div>
              <div className="pt-4 flex items-center gap-2 border-t border-slate-100 mt-4">
                <Button
                  size="sm"
                  onClick={() => setCreateSavingTypeOpen(true)}
                  className="bg-green-700 hover:bg-green-800 text-white text-xs h-8 flex-1"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> New Type
                </Button>
                <Link href="/sacco-admin/setup/saving-types" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full text-xs h-8 border-slate-200">
                    Manage
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Loan Products Card */}
            <Card className="border border-slate-200 shadow-sm bg-white p-5 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-lg bg-blue-50 text-blue-700">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-xs font-bold text-slate-700">
                    {loanProducts?.length || 0} Products
                  </Badge>
                </div>
                <h3 className="text-base font-bold text-slate-900 pt-2">Loan Products</h3>
                <p className="text-xs text-muted-foreground">
                  Configure interest calculation methods (Flat vs Reducing), interest rates, and GL mappings.
                </p>
              </div>
              <div className="pt-4 flex items-center gap-2 border-t border-slate-100 mt-4">
                <Button
                  size="sm"
                  onClick={() => setCreateLoanProductOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 flex-1"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> New Product
                </Button>
                <Link href="/sacco-admin/setup/loan-products" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full text-xs h-8 border-slate-200">
                    Manage
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Fee Types Card */}
            <Card className="border border-slate-200 shadow-sm bg-white p-5 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-lg bg-purple-50 text-purple-700">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-xs font-bold text-slate-700">
                    {feeTypes?.length || 0} Fees
                  </Badge>
                </div>
                <h3 className="text-base font-bold text-slate-900 pt-2">Fee Types & Charges</h3>
                <p className="text-xs text-muted-foreground">
                  Manage administrative levies, membership fees, and automated GL account recognition.
                </p>
              </div>
              <div className="pt-4 flex items-center gap-2 border-t border-slate-100 mt-4">
                <Button
                  size="sm"
                  onClick={() => setCreateFeeTypeOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-8 flex-1"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> New Fee
                </Button>
                <Link href="/sacco-admin/setup/feetypes" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full text-xs h-8 border-slate-200">
                    Manage
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals (Preserved from existing flow) */}
      <CreateMember
        openModal={createMemberOpen}
        closeModal={() => {
          setCreateMemberOpen(false);
          refetchMembers();
        }}
      />
      <BulkMemberCreate
        openModal={bulkMemberCreateOpen}
        closeModal={() => {
          setBulkMemberCreateOpen(false);
          refetchMembers();
        }}
      />
      <BulkMemberUploadCreate
        openModal={bulkMemberUploadOpen}
        closeModal={() => {
          setBulkMemberUploadOpen(false);
          refetchMembers();
        }}
      />
      <CreateSavingTypeModal
        isOpen={createSavingTypeOpen}
        onClose={() => setCreateSavingTypeOpen(false)}
        refetchSavingTypes={refetchSavingTypes}
      />
      <CreateLoanProduct
        isOpen={createLoanProductOpen}
        onClose={() => setCreateLoanProductOpen(false)}
        refetchLoanTypes={refetchLoanProducts}
      />
      <CreateFeeTypeModal
        isOpen={createFeeTypeOpen}
        onClose={() => setCreateFeeTypeOpen(false)}
        refetchFeeTypes={refetchFeeTypes}
      />
    </div>
  );
}
