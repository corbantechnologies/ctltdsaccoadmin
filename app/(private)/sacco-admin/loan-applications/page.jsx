"use client";

import React, { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { useFetchLoanApplications } from "@/hooks/loanapplications/actions";
import MemberLoadingSpinner from "@/components/general/MemberLoadingSpinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import useUserMemberNo from "@/hooks/authentication/useUserMemberNo";
import { ChevronLeft, ChevronRight, FileText, User, Plus, X } from "lucide-react";
import { LoanProductShowcase } from "@/components/loans/LoanProductShowcase";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CreateLoanApplication } from "@/forms/loanapplications/CreateLoanApplication";
import { AdminCreatesLoanApplicationForm } from "@/forms/loanapplications/AdminCreatesLoanApplication";
import { useFetchMembers } from "@/hooks/members/actions";
import BulkLoanApplicationUpload from "@/forms/loanapplications/BulkLoanApplicationUploadCreate";
import { downloadLoanApplicationsTemplate } from "@/services/loanapplications";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import toast from "react-hot-toast";

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

export default function AdminLoanApplications() {
  const { data: loanApplications, isLoading } = useFetchLoanApplications();
  const userMemberNo = useUserMemberNo();
  const {
    isLoading: isLoadingMembers,
    data: members,
    refetch: refetchMembers,
  } = useFetchMembers();

  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'mine'
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isCreateForMeModalOpen, setIsCreateForMeModalOpen] = useState(false);
  const [isAdminCreateModalOpen, setIsAdminCreateModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const token = useAxiosAuth();

  // 1. Filter by Tab (Ownership)
  let filteredApps = loanApplications || [];
  if (activeTab === "mine") {
    filteredApps = filteredApps.filter((app) => app.member === userMemberNo);
  }

  // 2. Filter by Status
  if (statusFilter !== "all") {
    filteredApps = filteredApps.filter((app) => app.status === statusFilter);
  }

  // 3. Pagination Logic
  const totalItems = filteredApps.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedApps = filteredApps.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-700 hover:bg-green-200 border-green-200";
      case "Disbursed":
        return "bg-blue-100 text-green-700 hover:bg-green-200 border-green-200";
      case "Rejected":
      case "Declined":
        return "bg-red-100 text-red-700 hover:bg-red-200 border-red-200";
      case "In Progress":
      case "Amended":
        return "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200";
      case "Ready for Submission":
      case "Submitted":
        return "bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200";
      default:
        return "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200";
    }
  };

  const uniqueStatuses = [
    "In Progress",
    "Submitted",
    "Approved",
    "Declined",
    "Disbursed",
    "Ready for Submission",
    "Amended",
    "Rejected",
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="mx-auto p-4 sm:p-6 space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/sacco-admin/dashboard">
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage>Loan Applications</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Loan Applications
            </h1>
            <p className="text-muted-foreground mt-1">
              Review and manage member loan applications
            </p>
          </div>

          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button className="bg-[#045e32] hover:bg-[#034625] shadow-sm">
                <Plus className="mr-2 h-4 w-4" />
                New Application
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="end">
              <div className="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  className="justify-start font-normal"
                  onClick={() => {
                    setIsPopoverOpen(false);
                    setIsCreateForMeModalOpen(true);
                  }}
                >
                  Apply for Myself
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start font-normal"
                  onClick={() => {
                    setIsPopoverOpen(false);
                    setIsAdminCreateModalOpen(true);
                  }}
                >
                  Apply for a Member
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start font-normal"
                  onClick={async () => {
                    setIsPopoverOpen(false);
                    try {
                      const loadingToast = toast.loading("Downloading template...");
                      await downloadLoanApplicationsTemplate(token);
                      toast.success("Template downloaded!", { id: loadingToast });
                    } catch (error) {
                      toast.error("Failed to download template.");
                    }
                  }}
                >
                  Download Template
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start font-normal"
                  onClick={() => {
                    setIsPopoverOpen(false);
                    setIsBulkUploadModalOpen(true);
                  }}
                >
                  Bulk Upload
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3 flex flex-col gap-4">


            {/* Controls Section */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-end sm:items-center bg-white p-4 rounded border shadow-sm">
              {/* Tabs */}
              <div className="flex bg-gray-100 p-1 rounded w-full sm:w-auto">
                <button
                  onClick={() => {
                    setActiveTab("all");
                    setCurrentPage(1);
                  }}
                  className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded transition-all ${activeTab === "all"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                    }`}
                >
                  All Applications
                </button>
                <button
                  onClick={() => {
                    setActiveTab("mine");
                    setCurrentPage(1);
                  }}
                  className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded transition-all ${activeTab === "mine"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                    }`}
                >
                  My Applications
                </button>
              </div>

              {/* Filters */}
              <div className="w-full sm:w-[200px]">
                <Select
                  value={statusFilter}
                  onValueChange={(val) => {
                    setStatusFilter(val);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {uniqueStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="space-y-1">
                  <CardTitle>
                    {activeTab === "all" ? "All Applications" : "My Applications"}
                  </CardTitle>
                  <CardDescription>
                    Showing {paginatedApps.length} of {totalItems} applications
                  </CardDescription>
                </div>
              </CardHeader>
               <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-6">
                    <TableSkeleton rows={8} cols={7} />
                  </div>
                ) : !paginatedApps || paginatedApps.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded bg-gray-100 mb-4">
                      <FileText className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">
                      No applications found
                    </h3>
                    <p className="text-muted-foreground mt-1 max-w-sm mx-auto">
                      {statusFilter !== "all"
                        ? `No applications found with status "${statusFilter}". Try changing the filter.`
                        : activeTab === "mine"
                          ? "You haven't created any loan applications yet."
                          : "No loan applications exist in the system."}
                    </p>
                    {statusFilter !== "all" && (
                      <Button
                        variant="outline"
                        onClick={() => setStatusFilter("all")}
                        className="mt-4"
                      >
                        Clear Filter
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="border-t">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 block sm:table-row">
                          <TableHead className="hidden sm:table-cell">
                            Applicant
                          </TableHead>
                          <TableHead className="hidden sm:table-cell">
                            Product
                          </TableHead>
                          <TableHead className="hidden sm:table-cell">
                            Admin Created
                          </TableHead>
                          <TableHead className="hidden sm:table-cell text-right">
                            Amount
                          </TableHead>
                          <TableHead className="hidden sm:table-cell">
                            Date
                          </TableHead>
                          <TableHead className="hidden sm:table-cell">
                            Status
                          </TableHead>
                          <TableHead className="hidden sm:table-cell text-right">
                            Action
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedApps.map((app) => (
                          <TableRow
                            key={app.reference}
                            className="block sm:table-row p-4 sm:p-0 border-b last:border-0 hover:bg-gray-50/50"
                          >
                            {/* Mobile View: Flexible Layout */}
                            <TableCell className="sm:hidden w-full block border-none p-0 pb-2">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-mono text-xs text-muted-foreground">
                                  {app.reference}
                                </span>
                                <Badge
                                  className={`font-normal scale-90 origin-right ${getStatusColor(
                                    app.status
                                  )}`}
                                  variant="secondary"
                                >
                                  {app.status}
                                </Badge>
                              </div>
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {app.product}
                                  </div>
                                  {app.admin_created ? (
                                    <Badge
                                      className="font-normal scale-90 origin-right"
                                      variant="secondary"
                                    >
                                      Admin
                                    </Badge>
                                  ) : (
                                    <Badge
                                      className="font-normal scale-90 origin-right"
                                      variant="secondary"
                                    >
                                      Member
                                    </Badge>
                                  )}
                                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {app.member_name || app.member}
                                  </div>
                                </div>
                                <div className="font-semibold text-gray-900">
                                  {formatCurrency(app.requested_amount)}
                                </div>
                              </div>
                              <div className="flex justify-between items-center pt-2 border-t border-dashed mt-2">
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(app.created_at), "MMM dd, yyyy")}
                                </span>
                                <Button
                                  asChild
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs border-[#045e32] text-[#045e32]"
                                >
                                  <Link
                                    href={`/sacco-admin/loan-applications/${app.reference}`}
                                  >
                                    View Details
                                  </Link>
                                </Button>
                              </div>
                            </TableCell>

                            {/* Desktop View */}
                            <TableCell className="hidden sm:table-cell">
                              <div className="flex flex-col">
                                <span className="font-semibold text-slate-800 text-sm">
                                  {app.member_name}
                                </span>
                                <span className="text-xs text-slate-500 font-mono">
                                  {app.member}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell font-medium">
                              {app.product}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              {app.admin_created ? (
                                <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-normal">
                                  Admin
                                </Badge>
                              ) : (
                                <span className="text-gray-400 text-sm">Member</span>
                              )}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell font-medium">
                              {formatCurrency(app.requested_amount)}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-muted-foreground">
                              {format(new Date(app.created_at), "MMM dd, yyyy")}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <Badge
                                className={`font-normal ${getStatusColor(
                                  app.status
                                )}`}
                                variant="outline"
                              >
                                {app.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <Button
                                asChild
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <Link
                                  href={`/sacco-admin/loan-applications/${app.reference}`}
                                  className="flex items-center justify-center"
                                >
                                  <ChevronRight className="h-4 w-4 text-gray-400 hover:text-[#045e32]" />
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>

              {/* Pagination */}
              {totalItems > 0 && (
                <CardFooter className="flex items-center justify-between border-t p-4">
                  <div className="text-sm text-muted-foreground">
                    Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                    <span className="font-medium">
                      {Math.min(startIndex + itemsPerPage, totalItems)}
                    </span>{" "}
                    of <span className="font-medium">{totalItems}</span>{" "}
                    applications
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-sm font-medium">
                      Page {currentPage} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              )}
            </Card>
          </div>

          <div className="lg:col-span-1">
            <LoanProductShowcase />
          </div>
        </div>
      </div>

      {isCreateForMeModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-xl font-semibold text-gray-900">
                New Loan Application (For Myself)
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCreateForMeModalOpen(false)}
                className="h-8 w-8 rounded"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6">
              <CreateLoanApplication
                onSuccess={() => setIsCreateForMeModalOpen(false)}
                memberPath="sacco-admin"
              />
            </div>
          </div>
        </div>
      )}

      {isAdminCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-xl font-semibold text-gray-900">
                New Loan Application (For Member)
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsAdminCreateModalOpen(false)}
                className="h-8 w-8 rounded"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6">
              <AdminCreatesLoanApplicationForm
                onSuccess={() => setIsAdminCreateModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {isBulkUploadModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-xl font-semibold text-gray-900">
                Bulk Upload Process
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsBulkUploadModalOpen(false)}
                className="h-8 w-8 rounded"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6">
              <BulkLoanApplicationUpload
                onBatchSuccess={() => {
                  window.location.reload();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
