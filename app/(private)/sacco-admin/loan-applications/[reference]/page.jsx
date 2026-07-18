"use client";

import React, { use, useMemo, useState } from "react";
import { format } from "date-fns";
import { useFetchLoanApplicationDetail } from "@/hooks/loanapplications/actions";
import MemberLoadingSpinner from "@/components/general/MemberLoadingSpinner";
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
  Pencil,
  X,
  Send,
  ThumbsUp,
  ThumbsDown,
  Edit,
  Users,
  Loader2,
} from "lucide-react";
import { MemberUpdateLoanApplication } from "@/forms/loanapplications/MemberUpdateLoanApplication";
import { AdminUpdateLoanApplication } from "@/forms/loanapplications/AdminUpdateLoanApplication";
import { AdminFinalizeAmendment } from "@/forms/loanapplications/AdminFinalizeAmendment";
import {
  submitForAmendment,
  approveLoanApplication,
  rejectLoanApplication,
  acceptAmendment,
  rejectAmendment,
  submitLoanApplication,
} from "@/services/loanapplications";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import toast from "react-hot-toast";
import CreateGuaranteeRequest from "@/forms/guaranteerequests/CreateGuaranteeRequest";
import CreateLoanDisbursementModal from "@/forms/loandisbursements/CreateLoanDisbursement";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import EmptyState from "@/components/general/EmptyState";

export default function AdminLoanApplicationDetail({ params }) {
  const { reference } = use(params);
  const {
    data: application,
    isPending,
    isError,
    refetch,
  } = useFetchLoanApplicationDetail(reference);
  const token = useAxiosAuth();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isAmendModalOpen, setIsAmendModalOpen] = useState(false);
  const [isUpdateAdminModalOpen, setIsUpdateAdminModalOpen] = useState(false);
  const [isGuarantorModalOpen, setIsGuarantorModalOpen] = useState(false);
  const [isDisburseModalOpen, setIsDisburseModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log(application);

  // TODO: Verify how to identify "My Application" (e.g., check created_by vs current user)
  // For now, assuming false to show Admin actions by default, or true if status requires member action
  // In a real scenario, this should be: const isOwnApplication = application?.created_by === currentUser.id;
  const isOwnApplication = false;

  const handleSubmitForAmendment = async () => {
    setIsSubmitting(true);
    try {
      await submitForAmendment(reference, token);
      toast.success("Application submitted for amendment!");
      refetch();
    } catch (error) {
      console.error("Submission failed", error);
      toast.error("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptAmendment = async () => {
    setIsSubmitting(true);
    try {
      await acceptAmendment(reference, token);
      toast.success("Amendment accepted successfully!");
      refetch();
    } catch (error) {
      console.error("Acceptance failed", error);
      toast.error("Failed to accept amendment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectAmendment = async () => {
    if (
      !confirm(
        "Are you sure you want to reject this amendment? This will cancel your application."
      )
    )
      return;
    setIsSubmitting(true);
    try {
      await rejectAmendment(reference, token);
      toast.success("Amendment rejected. Application cancelled.");
      refetch();
    } catch (error) {
      console.error("Rejection failed", error);
      toast.error("Failed to reject amendment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitLoanApplication = () => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <div className="font-medium text-gray-900">
            Submit application for approval?
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast.dismiss(t.id)}
              className="h-8 border-gray-300"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="h-8 bg-[#045e32] hover:bg-[#034625]"
              onClick={async () => {
                toast.dismiss(t.id);
                setIsSubmitting(true);
                try {
                  await submitLoanApplication(reference, token);
                  toast.success("Application submitted for approval!");
                  refetch();
                } catch (error) {
                  console.error("Submission failed", error);
                  toast.error("Failed to submit application.");
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              Confirm
            </Button>
          </div>
        </div>
      ),
      { duration: Infinity, position: "top-center" }
    );
  };

  const handleApprove = () => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <div className="font-medium text-gray-900">
            Approve this loan application?
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast.dismiss(t.id)}
              className="h-8 border-gray-300"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="h-8 bg-[#045e32] hover:bg-[#034625]"
              onClick={async () => {
                toast.dismiss(t.id);
                setIsSubmitting(true);
                try {
                  await approveLoanApplication(reference, token);
                  toast.success("Loan Application Approved!");
                  refetch();
                } catch (error) {
                  console.error("Approval failed", error);
                  toast.error("Failed to approve application.");
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              Confirm
            </Button>
          </div>
        </div>
      ),
      { duration: Infinity, position: "top-center" }
    );
  };

  const handleReject = () => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <div className="font-medium text-gray-900">
            Decline this loan application?
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast.dismiss(t.id)}
              className="h-8 border-gray-300"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="h-8"
              onClick={async () => {
                toast.dismiss(t.id);
                setIsSubmitting(true);
                try {
                  await rejectLoanApplication(reference, token);
                  toast.success("Loan Application Declined.");
                  refetch();
                } catch (error) {
                  console.error("Decline failed", error);
                  toast.error("Failed to decline application.");
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              Confirm
            </Button>
          </div>
        </div>
      ),
      { duration: Infinity, position: "top-center" }
    );
  };

  const schedule = useMemo(() => {
    return application?.projection?.schedule || [];
  }, [application]);

const LoanApplicationDetailSkeleton = () => (
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

  if (isPending) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <LoanApplicationDetailSkeleton />
      </div>
    );
  }
  if (isError || !application)
    return (
      <div className="p-8">
        <EmptyState
          title={isError ? "Error Loading Application" : "Application Not Found"}
          message={
            isError
              ? "There was a problem fetching the loan application. Please try again later."
              : "The loan application you are looking for does not exist or has been deleted."
          }
          icon={FileText}
        />
      </div>
    );

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
      case "Disbursed":
        return "bg-green-100 text-green-700 hover:bg-green-200 border-green-200";
      case "Rejected":
      case "Declined":
        return "bg-red-100 text-red-700 hover:bg-red-200 border-red-200";
      case "In Progress":
        return "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200";
      case "Amended":
        return "bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200";
      case "Ready for Submission":
      case "Submitted":
        return "bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200";
      default:
        return "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="mx-auto p-4 sm:p-6 space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/sacco-admin/dashboard">
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/sacco-admin/loan-applications">
                Loan Applications
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage>{application.reference}</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-gray-900">
                {application.product} Application
              </h1>
            </div>
            <p className="text-muted-foreground font-mono mt-1">
              Ref: {application.reference}{" "}
              {application.member ? ` | Member: ${application.member}` : ""}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Badge
              className={getStatusColor(application.status)}
              variant="outline"
            >
              {application.status}
            </Badge>

            <Badge
              className={
                application.admin_created
                  ? "bg-blue-50 text-blue-700 border-blue-200 font-normal"
                  : "bg-gray-50 text-gray-700 border-gray-200 font-normal"
              }
              variant="outline"
            >
              {application.admin_created ? "Admin" : "Member"}
            </Badge>

            {/* Logic for Own Application (Member Actions) */}
            {isOwnApplication && (
              <>
                {application.status === "Pending" && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setIsUpdateModalOpen(true)}
                      className="border-[#045e32] text-[#045e32] hover:bg-[#045e32]/10 w-full sm:w-auto"
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Update
                    </Button>
                    <Button
                      onClick={handleSubmitForAmendment}
                      disabled={isSubmitting}
                      className="bg-[#045e32] hover:bg-[#034625] w-full sm:w-auto"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-4 w-4" />
                      )}
                      Submit for Amendment
                    </Button>
                  </>
                )}
                {application.status === "Amended" && (
                  <>
                    <Button
                      onClick={handleRejectAmendment}
                      disabled={isSubmitting}
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50 w-full sm:w-auto"
                    >
                      Reject
                    </Button>
                    <Button
                      onClick={handleAcceptAmendment}
                      disabled={isSubmitting}
                      className="bg-[#045e32] hover:bg-[#034625] w-full sm:w-auto"
                    >
                      Accept Amendment
                    </Button>
                  </>
                )}
                {application.status === "Ready for Submission" && (
                  <Button
                    onClick={handleSubmitLoanApplication}
                    disabled={isSubmitting}
                    className="bg-[#045e32] hover:bg-[#034625] w-full sm:w-auto"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    Submit Application
                  </Button>
                )}
                {application.status === "In Progress" && (
                  <Button
                    onClick={() => setIsGuarantorModalOpen(true)}
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    Request Guarantors
                  </Button>
                )}
              </>
            )}

            {/* Logic for Other Applications (Admin Actions) */}
            {!isOwnApplication && (
              <>
                {application.status === "Submitted" && (
                  <>
                    <Button
                      onClick={handleReject}
                      disabled={isSubmitting}
                      variant="destructive"
                      className="w-full sm:w-auto"
                    >
                      <ThumbsDown className="mr-2 h-4 w-4" />
                      Decline
                    </Button>
                    <Button
                      onClick={handleApprove}
                      disabled={isSubmitting}
                      className="bg-[#045e32] hover:bg-[#034625] w-full sm:w-auto"
                    >
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                  </>
                )}
                {application.status === "Approved" && (
                  <Button
                    onClick={() => setIsDisburseModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Disburse Loan
                  </Button>
                )}
                {application.status === "Ready for Amendment" && (
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button
                      onClick={() => setIsUpdateAdminModalOpen(true)}
                      variant="outline"
                      className="border-amber-600 text-amber-600 hover:bg-amber-50 w-full sm:w-auto"
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Update Application
                    </Button>
                    <Button
                      onClick={() => setIsAmendModalOpen(true)}
                      className="bg-amber-600 hover:bg-amber-700 w-full sm:w-auto"
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Finalize Amendment
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-3 space-y-6">
            {/* Financial Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#045e32]">
                  Application Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Requested Amount
                  </p>
                  <p className="text-xl font-semibold text-gray-900">
                    {formatCurrency(application.requested_amount)}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Repayment Frequency:
                    </span>
                    <span className="font-medium capitalize">
                      {application.repayment_frequency}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Term:</span>
                    <span className="font-medium">
                      {application.term_months} Months
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Target Start Date:
                    </span>
                    <span className="font-medium">
                      {application.start_date}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Loan Account:
                    </span>
                    <span className="font-medium">
                      {application.loan_account}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50/50 border-t p-4 flex flex-col gap-2">
                <div className="w-full flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">
                    Projected Total Interest:
                  </span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(application.total_interest)}
                  </span>
                </div>

                <div className="w-full flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">
                    Processing Fee:
                  </span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(application.processing_fee)}
                  </span>
                </div>
              </CardFooter>
            </Card>

            {/* Repayment Schedule Projection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Projected Repayment Schedule
                </CardTitle>
                <CardDescription>
                  {application.product_details?.interest_method === "Flat"
                    ? "Flat-rate: interest is charged on the original principal. Processing fee is spread evenly across all installments. The balance column shows total amount still outstanding."
                    : "Reducing balance: interest is charged on the remaining principal each period. The balance column shows remaining principal after each payment."}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 sm:p-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50">
                        <TableHead>Due Date</TableHead>
                        <TableHead>Principal</TableHead>
                        <TableHead>{application.product_details?.interest_method === "Flat" ? "Interest (Flat)" : "Interest (Reducing)"}</TableHead>
                        <TableHead>Processing Fee</TableHead>
                        <TableHead>Total Due</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">{application.product_details?.interest_method === "Flat" ? "Remaining Balance (Total)" : "Remaining Principal"}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {schedule.map((row, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium whitespace-nowrap">
                            {format(new Date(row.due_date), "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(row.principal_due)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(row.interest_due)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(row.fee_due)}
                          </TableCell>
                          <TableCell className="font-semibold text-[#045e32]">
                            {formatCurrency(row.total_due)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                row.is_paid
                                  ? "bg-green-100 text-green-700 border-green-200"
                                  : "bg-gray-100 text-gray-700 border-gray-200"
                              }
                            >
                              {row.is_paid ? "Paid" : "Not Paid"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {formatCurrency(row.balance_after)}
                          </TableCell>
                        </TableRow>
                      ))}
                      {schedule.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center h-24 text-muted-foreground"
                          >
                            {application.status === "Pending"
                              ? "Schedule will be generated upon approval."
                              : "No schedule available."}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Guarantee Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#045e32]" />
                  Coverage Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Required Coverage
                    </span>
                    <span className="font-medium">
                      {formatCurrency(application.requested_amount)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span>Self Guaranteed</span>
                    <span className="font-medium text-green-700">
                      {formatCurrency(application.self_guaranteed_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Guarantors</span>
                    <span className="font-medium text-blue-700">
                      {formatCurrency(application.total_guaranteed_by_others)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold pt-2 border-t">
                    <span>Total Coverage</span>
                    <span>
                      {formatCurrency(application.effective_coverage)}
                    </span>
                  </div>
                </div>

                {application.is_fully_covered ? (
                  <div className="rounded bg-green-50 p-3 text-sm text-green-700 flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                    Loan is fully covered and ready for review.
                  </div>
                ) : (
                  <div className="rounded bg-amber-50 p-3 text-sm text-amber-700 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    Remaining coverage needed:{" "}
                    {formatCurrency(application.remaining_to_cover)}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Guarantors List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Guarantors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {application.guarantors?.length > 0 ? (
                  application.guarantors.map((g, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-start border-b pb-3 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {g.guarantor_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {g.guarantor}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">
                          {formatCurrency(g.guaranteed_amount)}
                        </p>
                        <Badge
                          variant="outline"
                          className={`text-xs mt-1 ${g.status === "Accepted"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : g.status === "Declined" ||
                              g.status === "Cancelled"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-gray-100 text-gray-700"
                            }`}
                        >
                          {g.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No guarantors added.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-500" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 italic">
                  {application.amendment_note || "No additional notes."}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Edit Modal (reused from member for now if Own Application) */}
        {isUpdateModalOpen && isOwnApplication && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  Update Application
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="h-8 w-8 rounded"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-6">
                <MemberUpdateLoanApplication
                  closeModal={() => setIsUpdateModalOpen(false)}
                  reference={reference}
                  loanApplication={application}
                  onSuccess={refetch}
                />
              </div>
            </div>
          </div>
        )}

        {/* Admin Update Draft Modal */}
        {isUpdateAdminModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  Update Draft
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsUpdateAdminModalOpen(false)}
                  className="h-8 w-8 rounded"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-6">
                <AdminUpdateLoanApplication
                  closeModal={() => setIsUpdateAdminModalOpen(false)}
                  reference={reference}
                  loanApplication={application}
                  onSuccess={refetch}
                />
              </div>
            </div>
          </div>
        )}

        {/* Admin Finalize Amendment Modal */}
        {isAmendModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  Finalize Amendment
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsAmendModalOpen(false)}
                  className="h-8 w-8 rounded"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-6">
                <AdminFinalizeAmendment
                  closeModal={() => setIsAmendModalOpen(false)}
                  reference={reference}
                  loanApplication={application}
                  onSuccess={refetch}
                />
              </div>
            </div>
          </div>
        )}

        {/* Guarantee Request Modal */}
        {isOwnApplication && (
          <Dialog
            open={isGuarantorModalOpen}
            onOpenChange={setIsGuarantorModalOpen}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Guarantor</DialogTitle>
                <DialogDescription>
                  Select a guarantor to send a request to.
                </DialogDescription>
              </DialogHeader>
              <CreateGuaranteeRequest
                loanApplication={application}
                onSuccess={() => {
                  setIsGuarantorModalOpen(false);
                  refetch();
                }}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Loan Disbursement Modal */}
        <CreateLoanDisbursementModal
          isOpen={isDisburseModalOpen}
          onClose={() => setIsDisburseModalOpen(false)}
          refetch={refetch}
          application={application}
        />
      </div>
    </div>
  );
}
