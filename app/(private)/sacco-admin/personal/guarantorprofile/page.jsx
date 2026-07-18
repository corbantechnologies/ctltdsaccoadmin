"use client";

import { useState } from "react";
import { useFetchGuarantorProfile } from "@/hooks/guarantors/actions";
import MemberLoadingSpinner from "@/components/general/MemberLoadingSpinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Check, X, Eye, AlertCircle } from "lucide-react";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { updateGuaranteeRequest } from "@/services/guaranteerequests";
import toast from "react-hot-toast";
import EmptyState from "@/components/general/EmptyState";

export default function GuarantorProfilePage() {
  const { data: profile, isPending, isError, refetch } = useFetchGuarantorProfile();
  const token = useAxiosAuth();

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState(null); // 'accept' | 'decline' | null
  const [guaranteeAmount, setGuaranteeAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReviewClick = (request) => {
    setSelectedRequest(request);
    setActionType(null);
    setGuaranteeAmount("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
    setActionType(null);
    setGuaranteeAmount("");
  };

  const handleSubmit = async () => {
    if (!selectedRequest) return;

    if (actionType === "accept" && !guaranteeAmount) {
      toast.error("Please enter an amount to guarantee.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        status: actionType === "accept" ? "Accepted" : "Declined",
        guaranteed_amount: actionType === "accept" ? guaranteeAmount : 0,
      };

      await updateGuaranteeRequest(selectedRequest.reference, payload, token);
      toast.success(
        actionType === "accept"
          ? "Request accepted successfully!"
          : "Request declined."
      );
      refetch();
      handleCloseModal();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update request.");
    } finally {
      setIsSubmitting(false);
    }
  };

const GuarantorProfileSkeleton = () => (
  <div className="mx-auto p-4 sm:p-6 space-y-6 animate-pulse">
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <div className="h-6 w-48 bg-slate-200 rounded" />
        <div className="h-4 w-64 bg-slate-200 rounded" />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="h-28 bg-slate-200 rounded-lg" />
      <div className="h-28 bg-slate-200 rounded-lg" />
      <div className="h-28 bg-slate-200 rounded-lg" />
    </div>
    <div className="h-96 bg-slate-200 rounded-lg" />
  </div>
);

  if (isPending) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <GuarantorProfileSkeleton />
      </div>
    );
  }
  if (isError || !profile)
    return (
      <div className="p-8">
        <EmptyState
          title={isError ? "Error Loading Profile" : "Profile Not Found"}
          message={
            isError
              ? "There was a problem fetching your guarantor profile. Please try again later."
              : "Could not load your guarantor profile. Please try again later."
          }
          icon={AlertCircle}
        />
      </div>
    );

  const stats = [
    {
      label: "Available Limit",
      value: formatCurrency(profile.available_amount),
      color: "text-green-600",
    },
    {
      label: "Committed Amount",
      value: formatCurrency(profile.committed_amount),
      color: "text-blue-600",
    },
    {
      label: "Active Guarantees",
      value: `${profile.active_guarantees_count} / ${profile.max_active_guarantees}`,
      color: "text-gray-900",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Accepted":
        return "bg-green-100 text-green-700 hover:bg-green-200 border-green-200";
      case "Declined":
      case "Rejected":
        return "bg-red-100 text-red-700 hover:bg-red-200 border-red-200";
      case "Pending":
        return "bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200";
      default:
        return "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200";
    }
  };

  return (
    <div className="space-y-6 mx-auto px-4 py-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-gray-900">
          Guarantor Profile
        </h1>
        <p className="text-muted-foreground">
          Manage your guarantee requests and view your limit status.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-xl font-semibold ${stat.color}`}>
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Guarantee Requests</CardTitle>
          <CardDescription>
            A list of all guarantee requests made to you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Loan Details</TableHead>
                  <TableHead>Guaranteed</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profile.guarantees?.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No requests found.
                    </TableCell>
                  </TableRow>
                )}
                {profile.guarantees?.map((request) => (
                  <TableRow key={request.reference}>
                    <TableCell className="font-medium">
                      {format(new Date(request.created_at), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {request.loan_application_details?.member}
                        </span>
                        {/* If we had the name, we would show it here */}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{request.loan_application_details?.product}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatCurrency(
                            request.loan_application_details?.amount
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {request.status === "Accepted"
                        ? formatCurrency(request.guaranteed_amount)
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getStatusColor(request.status)}
                        variant="outline"
                      >
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {request.status === "Pending" && (
                        <Button
                          size="sm"
                          onClick={() => handleReviewClick(request)}
                          className="bg-[#045e32] hover:bg-[#034625]"
                        >
                          Review
                        </Button>
                      )}
                      {request.status !== "Pending" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled
                          className="opacity-50"
                        >
                          {request.status}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Review Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Guarantee Request</DialogTitle>
            <DialogDescription>
              Action request from{" "}
              <span className="font-semibold text-gray-900">
                {selectedRequest?.loan_application_details?.member}
              </span>
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6 py-4">
              {/* Request Summary */}
              {/* Loan Details & Projection */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Loan Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Product:</span>
                        <span className="font-medium">
                          {selectedRequest.loan_application_details?.product}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-medium">
                          {formatCurrency(
                            selectedRequest.loan_application_details?.amount
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Remaining to Cover:
                        </span>
                        <span className="font-semibold text-amber-600">
                          {formatCurrency(selectedRequest.remaining_to_cover)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Term:</span>
                        <span className="font-medium">
                          {
                            selectedRequest.loan_application_details
                              ?.projection_snapshot?.term_months
                          }{" "}
                          Months
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Financials</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Total Interest:
                        </span>
                        <span className="font-medium">
                          {formatCurrency(
                            selectedRequest.loan_application_details
                              ?.projection_snapshot?.total_interest
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Monthly Payment:
                        </span>
                        <span className="font-medium">
                          {formatCurrency(
                            selectedRequest.loan_application_details
                              ?.projection_snapshot?.monthly_payment
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Total Repayment:
                        </span>
                        <span className="font-medium">
                          {formatCurrency(
                            selectedRequest.loan_application_details
                              ?.projection_snapshot?.total_repayment
                          )}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Repayment Schedule */}
                {selectedRequest.loan_application_details?.projection_snapshot
                  ?.schedule?.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                          Projected Repayment Schedule
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="max-h-[300px] overflow-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-gray-50/50">
                                <TableHead className="w-[100px]">Date</TableHead>
                                <TableHead>Principal</TableHead>
                                <TableHead>Interest</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead className="text-right">
                                  Balance
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedRequest.loan_application_details.projection_snapshot.schedule.map(
                                (row, index) => (
                                  <TableRow key={index}>
                                    <TableCell className="text-xs">
                                      {format(
                                        new Date(row.due_date),
                                        "MMM dd, yyyy"
                                      )}
                                    </TableCell>
                                    <TableCell className="text-xs">
                                      {formatCurrency(row.principal_due)}
                                    </TableCell>
                                    <TableCell className="text-xs">
                                      {formatCurrency(row.interest_due)}
                                    </TableCell>
                                    <TableCell className="text-xs font-semibold text-[#045e32]">
                                      {formatCurrency(row.total_due)}
                                    </TableCell>
                                    <TableCell className="text-xs text-right text-muted-foreground">
                                      {formatCurrency(row.balance_after)}
                                    </TableCell>
                                  </TableRow>
                                )
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  )}
              </div>

              {!actionType ? (
                /* Initial Choice */
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col gap-2 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                    onClick={() => setActionType("decline")}
                  >
                    <X className="h-8 w-8 text-red-500" />
                    <span className="font-semibold">Decline Request</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col gap-2 border-green-200 hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                    onClick={() => setActionType("accept")}
                  >
                    <Check className="h-8 w-8 text-green-500" />
                    <span className="font-semibold">Accept Request</span>
                  </Button>
                </div>
              ) : (
                /* Action Form */
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  {actionType === "decline" && (
                    <div className="rounded bg-red-50 p-4 flex gap-3 text-red-800">
                      <AlertCircle className="h-5 w-5 shrink-0" />
                      <div className="text-sm">
                        <p className="font-semibold">Decline this request?</p>
                        <p>This action cannot be undone.</p>
                      </div>
                    </div>
                  )}

                  {actionType === "accept" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="amount">Amount to Guarantee</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-gray-500">
                            KES
                          </span>
                          <Input
                            id="amount"
                            type="number"
                            placeholder="Enter amount"
                            className="pl-12"
                            value={guaranteeAmount}
                            onChange={(e) => setGuaranteeAmount(e.target.value)}
                            max={profile.available_amount}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Available limit:{" "}
                          {formatCurrency(profile.available_amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Remaining to cover:{" "}
                          {formatCurrency(selectedRequest.remaining_to_cover)}
                        </p>
                      </div>
                    </div>
                  )}

                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setActionType(null);
                        setGuaranteeAmount("");
                      }}
                      disabled={isSubmitting}
                    >
                      Back
                    </Button>
                    <Button
                      variant={
                        actionType === "accept" ? "default" : "destructive"
                      }
                      className={
                        actionType === "accept"
                          ? "bg-[#045e32] hover:bg-[#034625]"
                          : ""
                      }
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting
                        ? "Processing..."
                        : actionType === "accept"
                          ? "Confirm Guarantee"
                          : "Confirm Decline"}
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
