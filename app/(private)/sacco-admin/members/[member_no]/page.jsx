"use client";

import { useQueryClient } from "@tanstack/react-query";
import LoadingSpinner from "@/components/general/LoadingSpinner";
import { useFetchMemberDetail } from "@/hooks/members/actions";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  CheckCircle,
  Clock,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building,
  CreditCard,
  Shield,
  Settings,
  Wallet,
  Wallet2,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  XCircle,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { apiActions } from "@/tools/axios";
import CreateDepositAdmin from "@/forms/savingsdeposits/CreateDepositAdmin";
import CreateLoanAccountAdmin from "@/forms/loans/CreateLoanAdmin";
import CreateFeePayment from "@/forms/feepayments/CreateFeePayment";
import UpdateMemberRole from "@/forms/members/UpdateMemberRole";
import UpdateMemberDetails from "@/forms/members/UpdateMemberDetails";
import { useFetchLoanProducts } from "@/hooks/loanproducts/actions";
import { useFetchMemberSummary } from "@/hooks/summary/actions";
import MemberFinancialSummary from "@/components/members/dashboard/MemberFinancialSummary";
import { downloadMemberSummary } from "@/services/membersummary";
import { Download, Loader2 } from "lucide-react";
import EmptyState from "@/components/general/EmptyState";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const MemberDetailSkeleton = () => (
  <div className="mx-auto space-y-8 animate-pulse p-4 md:p-6">
    <div className="h-4 w-48 bg-slate-200 rounded" />
    <div className="h-40 bg-slate-200 rounded-lg" />
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <div className="h-64 bg-slate-200 rounded-lg" />
        <div className="h-48 bg-slate-200 rounded-lg" />
      </div>
      <div className="h-64 bg-slate-200 rounded-lg" />
    </div>
  </div>
);

function MemberDetail() {
  const { member_no } = useParams();
  const token = useAxiosAuth();
  const {
    isLoading: isLoadingMember,
    data: member,
    refetch: refetchMember,
  } = useFetchMemberDetail(member_no);


  const currentYear = new Date().getFullYear();
  const [summaryYear, setSummaryYear] = useState(currentYear);

  const {
    isLoading: isLoadingSummary,
    data: summary,
    refetch: refetchSummary,
  } = useFetchMemberSummary(member_no, summaryYear);

  const { data: loanProducts } = useFetchLoanProducts();
  const queryClient = useQueryClient();

  const handleRefreshAll = () => {
    refetchMember();
    refetchSummary();
    queryClient.invalidateQueries({ queryKey: ["member", member_no] });
    queryClient.invalidateQueries({ queryKey: ["memberSummary", member_no] });
    queryClient.invalidateQueries({ queryKey: ["members"] });
    queryClient.invalidateQueries({ queryKey: ["saccoSummary"] });
    queryClient.invalidateQueries({ queryKey: ["savingsDeposits"] });
    queryClient.invalidateQueries({ queryKey: ["loans"] });
  };

  const [isApproving, setIsApproving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [depositModal, setDepositModal] = useState(false);
  const [loanModal, setLoanModal] = useState(false);
  const [feePaymentModal, setFeePaymentModal] = useState(false);
  const [roleModal, setRoleModal] = useState(false);
  const [detailsModal, setDetailsModal] = useState(false);

  // Pagination states
  const ITEMS_PER_PAGE = 3;
  const [savingsPage, setSavingsPage] = useState(1);
  const [feesPage, setFeesPage] = useState(1);
  const [loansPage, setLoansPage] = useState(1);

  const paginate = (items, page) => {
    if (!items) return [];
    const start = (page - 1) * ITEMS_PER_PAGE;
    return items.slice(start, start + ITEMS_PER_PAGE);
  };

  const PaginationControls = ({ currentPage, totalItems, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-4 pt-2 border-t border-secondary/30">
        <span className="text-xs text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  const handleToggleActiveStatus = async () => {
    try {
      setIsTogglingStatus(true);
      await apiActions?.patch(
        `/api/v1/auth/member/${member_no}/`,
        { is_active: !member?.is_active },
        token
      );
      toast.success(
        member?.is_active ? "User deactivated successfully" : "User activated successfully"
      );
      refetchMember();
    } catch (error) {
      toast.error("Failed to update user status");
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleDownloadSummary = async () => {
    if (!member_no) return;
    setIsDownloading(true);
    try {
      const blob = await downloadMemberSummary(member_no, summaryYear, token);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Financial_Summary_${summaryYear}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success("Download started");
    } catch (error) {
      console.error(error);
      toast.error("Failed to download summary");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      await apiActions?.patch(
        `/api/v1/auth/approve-member/${member_no}/`,
        {},
        token
      );
      toast.success("Member approved successfully");
      refetchMember();
    } catch (error) {
      toast.error("Failed to approve member. Please try again");
    } finally {
      setIsApproving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Improved: handles string balances like "40000.00"
  const formatBalance = (balance) => {
    if (!balance && balance !== "0.00" && balance !== 0) return "N/A";
    const num = parseFloat(balance);
    if (isNaN(num)) return "N/A";
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""
      }`.toUpperCase();
  };

  const InfoField = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 p-4 rounded bg-secondary/50 hover:bg-secondary/80 transition-colors">
      <Icon className="h-5 w-5 text-primary mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-base font-semibold text-foreground break-words">
          {value || "N/A"}
        </p>
      </div>
    </div>
  );

  // Conditional employment section
  const hasEmploymentData =
    member?.employment_type || member?.employer || member?.job_title;

  // Active roles
  const activeRoles = [];
  if (member?.is_staff) activeRoles.push("Staff");
  if (member?.is_member) activeRoles.push("Member");
  if (member?.is_superuser) activeRoles.push("Superuser");
  if (member?.is_sacco_admin) activeRoles.push("SACCO Admin");
  if (member?.is_sacco_staff) activeRoles.push("SACCO Staff");
  if (member?.is_treasurer) activeRoles.push("Treasurer");
  if (member?.is_bookkeeper) activeRoles.push("Bookkeeper");

  if (isLoadingMember) {
    return (
      <div className="min-h-screen bg-background">
        <MemberDetailSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto space-y-8">
        {/* Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/sacco-admin/dashboard">
                Dashboard
              </BreadcrumbLink>
              <BreadcrumbSeparator />
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href="/sacco-admin/members">
                Members
              </BreadcrumbLink>
              <BreadcrumbSeparator />
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbPage>
                {member?.first_name} {member?.last_name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header Card */}
        <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-4 md:p-8">
            <div className="flex flex-col lg:flex-row items-center lg:items-center gap-6 text-center lg:text-left">
              <Avatar className="h-10 w-10 md:h-12 md:w-12 border-4 border-primary/20">
                <AvatarFallback className="bg-primary text-white text-base md:text-lg">
                  {getInitials(member?.first_name, member?.last_name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-xl md:text-xl font-semibold text-foreground mb-2">
                    {member?.first_name}{" "}
                    {member?.middle_name && member.middle_name + " "}
                    {member?.last_name}
                  </h1>
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-muted-foreground">
                    <span className="flex items-center gap-1 text-sm">
                      <CreditCard className="h-4 w-4" />
                      Member #{member?.member_no}
                    </span>
                    <span className="flex items-center gap-1 text-sm">
                      <Calendar className="h-4 w-4" />
                      Joined {formatDate(member?.created_at)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                  <Badge
                    variant={member?.is_approved ? "default" : "secondary"}
                    className={
                      member?.is_approved
                        ? "bg-green-600 text-white"
                        : "bg-yellow-600 text-white"
                    }
                  >
                    {member?.is_approved ? (
                      <CheckCircle className="h-4 w-4 mr-1" />
                    ) : (
                      <Clock className="h-4 w-4 mr-1" />
                    )}
                    {member?.is_approved ? "Approved" : "Pending Approval"}
                  </Badge>

                  <Badge
                    variant={member?.is_active ? "default" : "destructive"}
                  >
                    {member?.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center w-full lg:w-auto gap-3">
                {!member?.is_approved && (
                  <Button
                    onClick={handleApprove}
                    disabled={isApproving}
                    className="bg-primary hover:bg-primary/90 text-white px-8"
                  >
                    {isApproving ? "Approving..." : "Approve Member"}
                  </Button>
                )}

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2 border-primary/20 text-primary hover:bg-primary/5 w-full sm:w-auto">
                      Actions
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-2" align="end">
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        onClick={handleDownloadSummary}
                        disabled={isDownloading}
                        className="justify-start font-normal h-9 w-full flex items-center gap-2"
                      >
                        {isDownloading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                        Download Summary
                      </Button>

                      <Button
                        variant="ghost"
                        onClick={() => setDetailsModal(true)}
                        className="justify-start font-normal h-9 w-full flex items-center gap-2"
                      >
                        <User className="h-4 w-4" />
                        Edit Profile
                      </Button>

                      <Button
                        variant="ghost"
                        onClick={handleToggleActiveStatus}
                        disabled={isTogglingStatus}
                        className={`justify-start font-normal h-9 w-full flex items-center gap-2 ${member?.is_active
                          ? "text-destructive hover:text-destructive hover:bg-destructive/10"
                          : "text-green-600 hover:text-green-700 hover:bg-green-50"
                          }`}
                      >
                        {isTogglingStatus ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          member?.is_active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />
                        )}
                        {member?.is_active ? "Deactivate User" : "Activate User"}
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <div className="mt-8">
          <MemberFinancialSummary
            summary={summary}
            memberNo={member_no}
            summaryYear={summaryYear}
            setSummaryYear={setSummaryYear}
          />
        </div>

        {/* Quick Action Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Savings Accounts */}
          <Card className="shadow-md border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Wallet className="h-6 w-6 text-primary" />
                  Savings Accounts
                </CardTitle>
                {member?.is_approved && (
                  <Button
                    onClick={() => setDepositModal(true)}
                    size="sm"
                    className="h-8 w-full sm:w-auto bg-primary hover:bg-primary/90 text-white"
                  >
                    Deposit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {member?.savings?.length > 0 ? (
                <>
                  {paginate(member.savings, savingsPage).map((account) => (
                    <Link
                      key={account.reference}
                      href={`/sacco-admin/saving-accounts/${account.reference}`}
                      className="block transition-transform hover:scale-[1.01]"
                    >
                      <InfoField
                        icon={Wallet2}
                        label={`${account.account_type} - ${account.account_number}`}
                        value={`${formatBalance(account.balance)} KES`}
                      />
                    </Link>
                  ))}
                  <PaginationControls
                    currentPage={savingsPage}
                    totalItems={member.savings.length}
                    onPageChange={setSavingsPage}
                  />
                </>
              ) : (
                <div className="py-4">
                  <EmptyState
                    title="No Savings Accounts"
                    message="This member has no active savings accounts."
                    icon={Wallet2}
                    className="border-0 bg-transparent p-0"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fee Accounts */}
          <Card className="shadow-md border-l-4 border-l-amber-500">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Shield className="h-6 w-6 text-primary" />
                  Fee Accounts
                </CardTitle>
                {member?.is_approved && (
                  <Button
                    onClick={() => setFeePaymentModal(true)}
                    size="sm"
                    className="h-8 w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white disabled:bg-slate-300 disabled:text-slate-500"
                  >
                    Pay Fee
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {member?.fee_accounts?.length > 0 ? (
                <>
                  {paginate(member.fee_accounts, feesPage).map((account) => (
                    <InfoField
                      key={account.reference}
                      icon={CreditCard}
                      label={`${account.fee_type} - ${account.account_number}`}
                      value={`${formatBalance(account.outstanding_balance)} KES | ${formatBalance(account.amount_paid)} KES`}
                    />
                  ))}
                  <PaginationControls
                    currentPage={feesPage}
                    totalItems={member.fee_accounts.length}
                    onPageChange={setFeesPage}
                  />
                </>
              ) : (
                <div className="py-4">
                  <EmptyState
                    title="No Fee Accounts"
                    message="This member has no active fee accounts."
                    icon={Shield}
                    className="border-0 bg-transparent p-0"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Loan Accounts */}
          <Card className="shadow-md border-l-4 border-l-rose-500">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <CreditCard className="h-6 w-6 text-primary" />
                  Loan Accounts
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {member?.loan_accounts?.length > 0 ? (
                <>
                  {paginate(member.loan_accounts, loansPage).map((account) => (
                    <Link
                      key={account.reference}
                      href={`/sacco-admin/members/${member_no}/${account.reference}`}
                      className="block transition-transform hover:scale-[1.01]"
                    >
                      <InfoField
                        icon={CreditCard}
                        label={`${account.product} - ${account.account_number}`}
                        value={`${formatBalance(account.outstanding_balance)} KES`}
                      />
                    </Link>
                  ))}
                  <PaginationControls
                    currentPage={loansPage}
                    totalItems={member.loan_accounts.length}
                    onPageChange={setLoansPage}
                  />
                </>
              ) : (
                <div className="py-4">
                  <EmptyState
                    title="No Loan Accounts"
                    message="This member has no active loan accounts."
                    icon={CreditCard}
                    className="border-0 bg-transparent p-0"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <User className="h-6 w-6 text-primary" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <InfoField
                  icon={Mail}
                  label="Email Address"
                  value={member?.email}
                />
                <InfoField
                  icon={Phone}
                  label="Phone Number"
                  value={member?.phone}
                />
                <InfoField
                  icon={Calendar}
                  label="Date of Birth"
                  value={formatDate(member?.dob)}
                />
                <InfoField icon={User} label="Gender" value={member?.gender} />
                <InfoField
                  icon={MapPin}
                  label="County"
                  value={member?.county}
                />
                <InfoField
                  icon={CreditCard}
                  label="Reference Code"
                  value={member?.reference}
                />
              </CardContent>
            </Card>

            {member?.custom_attributes && Object.keys(member.custom_attributes).length > 0 && (
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Settings className="h-6 w-6 text-primary" />
                    Custom SACCO Fields
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  {Object.entries(member.custom_attributes).map(([key, val]) => (
                    <InfoField
                      key={key}
                      icon={Settings}
                      label={key.replace(/_/g, " ").toUpperCase()}
                      value={typeof val === "boolean" ? (val ? "Yes" : "No") : String(val)}
                    />
                  ))}
                </CardContent>
              </Card>
            )}

            {hasEmploymentData && (
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Building className="h-6 w-6 text-primary" />
                    Employment Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <InfoField
                    icon={Building}
                    label="Employment Type"
                    value={member?.employment_type}
                  />
                  <InfoField
                    icon={Building}
                    label="Employer"
                    value={member?.employer}
                  />
                  <InfoField
                    icon={User}
                    label="Job Title"
                    value={member?.job_title}
                  />
                </CardContent>
              </Card>
            )}

            {member?.guarantor_profile && (
              <Card className="shadow-md border-l-4 border-l-indigo-500">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Shield className="h-6 w-6 text-primary" />
                      Guarantor Profile
                    </CardTitle>
                    <Badge
                      className={
                        member.guarantor_profile.is_eligible
                          ? "bg-green-100 text-green-700 hover:bg-green-100"
                          : "bg-red-100 text-red-700 hover:bg-red-100"
                      }
                    >
                      {member.guarantor_profile.is_eligible ? "Eligible" : "Ineligible"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <InfoField
                      icon={Wallet}
                      label="Committed Amount"
                      value={`${formatBalance(member.guarantor_profile.committed_amount)} KES`}
                    />
                    <InfoField
                      icon={Wallet2}
                      label="Available Limit"
                      value={`${formatBalance(member.guarantor_profile.available_amount)} KES`}
                    />
                    <InfoField
                      icon={CheckCircle}
                      label="Active Guarantees"
                      value={`${member.guarantor_profile.active_guarantees_count} of ${member.guarantor_profile.max_active_guarantees}`}
                    />
                    <InfoField
                      icon={Clock}
                      label="Last Checked"
                      value={formatDate(member.guarantor_profile.eligibility_checked_at)}
                    />
                  </div>

                  {member.guarantor_profile.guarantees?.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3 ml-1">
                        Active Guarantees
                      </h4>
                      <div className="overflow-x-auto">
                        <Table className="w-full text-sm text-left">
                          <TableHeader>
                            <TableRow>
                              <TableHead>Loan Application</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {member.guarantor_profile.guarantees.map((guarantee, i) => (
                              <TableRow key={i} className="hover:bg-secondary/20">
                                <TableCell className="text-sm">
                                  {guarantee.loan_application}
                                </TableCell>
                                <TableCell className="text-sm">
                                  {formatBalance(guarantee.guaranteed_amount)} KES
                                </TableCell>
                                <TableCell className="text-sm">
                                  <Badge
                                    variant="outline"
                                    className={
                                      guarantee.status === "Accepted"
                                        ? "text-green-600 border-green-200"
                                        : "text-amber-600 border-amber-200"
                                    }
                                  >
                                    {guarantee.status}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-8">
            <Card className="shadow-md border-l-4 border-l-slate-400">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Shield className="h-5 w-5 text-primary" />
                  Identification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoField
                  icon={CreditCard}
                  label="ID Type"
                  value={member?.id_type}
                />
                <InfoField
                  icon={CreditCard}
                  label="ID Number"
                  value={member?.id_number}
                />
                <InfoField
                  icon={CreditCard}
                  label="Tax PIN"
                  value={member?.tax_pin}
                />
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Settings className="h-5 w-5 text-primary" />
                    Roles & Permissions
                  </CardTitle>
                  <Button
                    onClick={() => setRoleModal(true)}
                    size="sm"
                    variant="outline"
                    className="h-8 w-full sm:w-auto border-primary text-primary hover:bg-primary/5"
                  >
                    Edit Roles
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {activeRoles.length > 0 ? (
                  <div className="space-y-3">
                    {activeRoles.map((role) => (
                      <div
                        key={role}
                        className="flex items-center justify-between p-3 rounded bg-primary/5"
                      >
                        <span className="font-medium">{role}</span>
                        <Badge
                          variant="default"
                          className="bg-primary text-white"
                        >
                          Active
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-4">
                    <EmptyState
                      title="No Special Roles"
                      message="This member has no special roles assigned."
                      icon={Shield}
                      className="border-0 bg-transparent p-0"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Clock className="h-5 w-5 text-primary" />
                  Account Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded bg-secondary/50">
                  <div className="h-3 w-3 rounded bg-green-600"></div>
                  <div>
                    <p className="text-sm font-medium">Account Created</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(member?.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded bg-secondary/50">
                  <div className="h-3 w-3 rounded bg-primary"></div>
                  <div>
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(member?.updated_at)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modals */}
        <CreateDepositAdmin
          isOpen={depositModal}
          onClose={() => setDepositModal(false)}
          refetchMember={handleRefreshAll}
          accounts={member?.savings}
        />

        <CreateLoanAccountAdmin
          isOpen={loanModal}
          onClose={() => setLoanModal(false)}
          refetchMember={handleRefreshAll}
          loanProducts={loanProducts}
          member={member}
        />

        <CreateFeePayment
          isOpen={feePaymentModal}
          onClose={() => setFeePaymentModal(false)}
          refetchMember={handleRefreshAll}
          accounts={member?.fee_accounts}
        />

        <UpdateMemberRole
          isOpen={roleModal}
          onClose={() => setRoleModal(false)}
          refetchMember={handleRefreshAll}
          member={member}
        />

        <UpdateMemberDetails
          isOpen={detailsModal}
          onClose={() => setDetailsModal(false)}
          refetchMember={handleRefreshAll}
          member={member}
        />
      </div>
    </div>
  );
}

export default MemberDetail;
