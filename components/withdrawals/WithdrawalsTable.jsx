"use client";

import React, { useState, useMemo } from "react";
import { format, isSameDay, isWithinInterval } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { updateWithdrawal } from "@/services/savingswithdrawals";
import toast from "react-hot-toast";

const getPageNumbers = (currentPage, totalPages) => {
  return [currentPage];
};;;


function WithdrawalsTable({ withdrawals, refetchWithdrawals }) {
  const token = useAxiosAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [specificDate, setSpecificDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 5;

  // Filter and sort withdrawals
  const filteredWithdrawals = useMemo(() => {
    let filtered = withdrawals?.filter((withdrawal) => {
      const withdrawalDate = new Date(withdrawal.created_at);

      // Specific Date Filter
      if (specificDate) {
        const selectedDate = new Date(specificDate);
        if (!isSameDay(withdrawalDate, selectedDate)) return false;
      }

      // Date Range Filter
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (!isWithinInterval(withdrawalDate, { start, end })) return false;
      }

      // Status Filter
      if (status && withdrawal.transaction_status !== status) return false;

      return true;
    });

    // Sort: Pending first, then by created_at descending
    return filtered?.sort((a, b) => {
      if (
        a.transaction_status === "Pending" &&
        b.transaction_status !== "Pending"
      )
        return -1;
      if (
        a.transaction_status !== "Pending" &&
        b.transaction_status === "Pending"
      )
        return 1;
      return new Date(b.created_at) - new Date(a.created_at);
    });
  }, [withdrawals, specificDate, startDate, endDate, status]);

  // Pagination logic
  const totalItems = filteredWithdrawals?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedWithdrawals = filteredWithdrawals?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const resetFilters = () => {
    setSpecificDate("");
    setStartDate("");
    setEndDate("");
    setStatus("");
    setCurrentPage(1);
  };

  const handleView = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setIsModalOpen(true);
  };

  const handleApprove = async (identity) => {
    try {
      await updateWithdrawal(
        identity,
        { transaction_status: "Approved" },
        token,
      );
      toast.success("Withdrawal approved successfully");
      refetchWithdrawals();
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Failed to approve withdrawal. Please try again.");
    }
  };

  const handleReject = async (identity) => {
    try {
      await updateWithdrawal(
        identity,
        { transaction_status: "Rejected" },
        token,
      );
      toast.success("Withdrawal rejected successfully");
      refetchWithdrawals();
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Failed to reject withdrawal. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      {/* Filter Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg font-semibold ">
            Filter Withdrawal Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="specificDate"
                className="text-sm font-medium text-gray-700"
              >
                Specific Date
              </Label>
              <input
                type="date"
                id="specificDate"
                value={specificDate}
                onChange={(e) => {
                  setSpecificDate(e.target.value);
                  setStartDate("");
                  setEndDate("");
                  setCurrentPage(1);
                }}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2   transition-colors"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="startDate"
                className="text-sm font-medium text-gray-700"
              >
                Start Date
              </Label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setSpecificDate("");
                  setCurrentPage(1);
                }}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2   transition-colors"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="endDate"
                className="text-sm font-medium text-gray-700"
              >
                End Date
              </Label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setSpecificDate("");
                  setCurrentPage(1);
                }}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2   transition-colors"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="status"
                className="text-sm font-medium text-gray-700"
              >
                Status
              </Label>
              <select
                id="status"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2   transition-colors"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Completed">Completed</option>
                <option value="Failed">Failed</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={resetFilters}
                className="w-full bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {(!filteredWithdrawals || filteredWithdrawals.length === 0) && (
        <div className="p-6 text-center text-muted-foreground">
          No withdrawal requests found.
        </div>
      )}

      {/* Table */}
      {filteredWithdrawals && filteredWithdrawals.length > 0 && (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[var(--accent)] hover:bg-[var(--accent-hover)]">
                <TableHead className="text-white font-semibold">Date</TableHead>
                <TableHead className="text-white font-semibold">
                  Amount
                </TableHead>
                <TableHead className="text-white font-semibold">
                  Savings Account
                </TableHead>
                <TableHead className="text-white font-semibold">
                  Member
                </TableHead>

                <TableHead className="text-white font-semibold">
                  Status
                </TableHead>
                <TableHead className="text-white font-semibold">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedWithdrawals.map((withdrawal) => (
                <TableRow key={withdrawal.reference} className="border-b">
                  <TableCell className="text-sm text-gray-700">
                    {formatDate(withdrawal.created_at)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-700">
                    KES {parseFloat(withdrawal.amount).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-700">
                    {withdrawal.savings_account_detail?.account_number} (
                    {withdrawal.savings_account_detail?.account_type})
                  </TableCell>
                  <TableCell className="text-sm text-gray-700">
                    {withdrawal.savings_account_detail?.member}
                  </TableCell>

                  <TableCell className="text-sm">
                    <span
                      className={`px-2 py-0.5 font-bold uppercase tracking-wider text-[10px] rounded border ${withdrawal.transaction_status === "Completed"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100/50"
                          : withdrawal.transaction_status === "Processing" ||
                            withdrawal.transaction_status === "Pending"
                            ? "bg-amber-50 text-amber-700 border-amber-100/50"
                            : withdrawal.transaction_status === "Approved"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                              : withdrawal.transaction_status === "Rejected"
                                ? "bg-slate-50 text-slate-700 border-slate-200"
                                : "bg-slate-50 text-slate-600 border-slate-100"
                        }`}
                    >
                      {withdrawal.transaction_status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-center">
                    <Button
                      size="sm"
                      className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded text-[12px] font-bold h-8"
                      onClick={() => handleView(withdrawal)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Modal */}
      {selectedWithdrawal && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold ">
                Withdrawal Request Details
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Identity
                </Label>
                <p className="text-sm text-gray-900">
                  {selectedWithdrawal.identity}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Reference
                </Label>
                <p className="text-sm text-gray-900">
                  {selectedWithdrawal.reference}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Date
                </Label>
                <p className="text-sm text-gray-900">
                  {formatDate(selectedWithdrawal.created_at)}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Amount
                </Label>
                <p className="text-sm text-gray-900">
                  KES {parseFloat(selectedWithdrawal.amount).toFixed(2)}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Savings Account
                </Label>
                <p className="text-sm text-gray-900">
                  {selectedWithdrawal.savings_account_detail?.account_number} (
                  {selectedWithdrawal.savings_account_detail?.account_type})
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Member
                </Label>
                <p className="text-sm text-gray-900">
                  {selectedWithdrawal.savings_account_detail?.member}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Payment Method
                </Label>
                <p className="text-sm text-gray-900">
                  {selectedWithdrawal.payment_method}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Status
                </Label>
                <p className="text-sm">
                  <span
                    className={`px-2 py-0.5 font-bold uppercase tracking-wider text-[10px] rounded border ${selectedWithdrawal.transaction_status === "Completed"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100/50"
                        : selectedWithdrawal.transaction_status ===
                          "Processing" ||
                          selectedWithdrawal.transaction_status === "Pending"
                          ? "bg-amber-50 text-amber-700 border-amber-100/50"
                          : selectedWithdrawal.transaction_status === "Approved"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                            : selectedWithdrawal.transaction_status ===
                              "Rejected"
                              ? "bg-slate-50 text-slate-700 border-slate-200"
                              : "bg-slate-50 text-slate-600 border-slate-100"
                      }`}
                  >
                    {selectedWithdrawal.transaction_status}
                  </span>
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Receipt Number
                </Label>
                <p className="text-sm text-gray-900">
                  {selectedWithdrawal.receipt_number || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Updated At
                </Label>
                <p className="text-sm text-gray-900">
                  {formatDate(selectedWithdrawal.updated_at)}
                </p>
              </div>
            </div>
            {(selectedWithdrawal.transaction_status === "Pending" ||
              selectedWithdrawal.transaction_status === "Processing") && (
                <DialogFooter>
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => handleReject(selectedWithdrawal.identity)}
                  >
                    Reject
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleApprove(selectedWithdrawal.identity)}
                  >
                    Approve
                  </Button>
                </DialogFooter>
              )}
          </DialogContent>
        </Dialog>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t">
          <div className="text-sm text-gray-500">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
            entries
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-[#ea1315] hover:bg-[#c71012] text-white text-sm disabled:opacity-50"
            >
              Previous
            </Button>
            {getPageNumbers(currentPage, totalPages).map((page, index) => page === "..." ? <span key={`ellipsis-${index}`} className="px-2 py-1 text-slate-400 text-sm select-none">...</span> : (((page) => (
              <Button
                key={page}
                onClick={() => handlePageChange(page)}
                variant={currentPage === page ? "default" : "outline"}
                className={`${currentPage === page
                    ? "bg-[#ea1315] text-white"
                    : "border-[#ea1315]  hover:bg-[#ea1315] hover:text-white"
                  } text-sm`}
              >
                {page}
              </Button>
            ))(page)))}
            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="bg-[#ea1315] hover:bg-[#c71012] text-white text-sm disabled:opacity-50"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default WithdrawalsTable;