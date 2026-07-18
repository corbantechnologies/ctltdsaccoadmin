"use client";

import React, { useState, useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  isSameDay,
  isWithinInterval,
} from "date-fns";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useUpdateSavingsDeposit } from "@/hooks/savingsdeposits/actions";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Edit } from "lucide-react";
import { usePathname } from "next/navigation";

const getPageNumbers = (currentPage, totalPages) => {
  const pages = [];
  const maxPagesToShow = 5;
  
  if (totalPages <= maxPagesToShow) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
  }
  return pages;
};

function SavingsDepositsTable({ deposits }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [newDate, setNewDate] = useState("");
  
  const queryClient = useQueryClient();
  const updateDepositMutation = useUpdateSavingsDeposit();
  const pathname = usePathname();
  const isAdmin = pathname?.includes("/sacco-admin") || pathname?.includes("/superuser");

  const [searchInput, setSearchInput] = useState("");
  const [specificDate, setSpecificDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [month, setMonth] = useState("");
  const [depositType, setDepositType] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const itemsPerPage = 50;

  const handleEditClick = (deposit) => {
    setSelectedDeposit(deposit);
    const dateStr = deposit.transaction_date || deposit.created_at;
    setNewDate(dateStr ? dateStr.split("T")[0] : "");
    setIsEditDialogOpen(true);
  };
  
  const handleUpdateDate = () => {
    if (!selectedDeposit || !newDate) return;
    updateDepositMutation.mutate({
      reference: selectedDeposit.reference,
      values: { transaction_date: newDate }
    }, {
      onSuccess: () => {
        toast.success("Date updated successfully!");
        setIsEditDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: ["deposits"] });
      },
      onError: (err) => {
        toast.error(err?.response?.data?.detail || "Failed to update date");
      }
    });
  };

  // Filter deposits
  const filteredDeposits = useMemo(() => {
    const depositsArray = Array.isArray(deposits) ? deposits : deposits?.results || [];
    return depositsArray.filter((deposit) => {
      // Text Search Filter
      if (searchInput.trim()) {
        const query = searchInput.toLowerCase().trim();
        const depositor = deposit.deposited_by?.toLowerCase() || "";
        const reference = deposit.reference?.toLowerCase() || "";
        const identity = deposit.identity?.toLowerCase() || "";
        if (!depositor.includes(query) && !reference.includes(query) && !identity.includes(query)) {
          return false;
        }
      }

      const depositDate = new Date(deposit.created_at);

      // Specific Date Filter
      if (specificDate) {
        const selectedDate = new Date(specificDate);
        if (!isSameDay(depositDate, selectedDate)) return false;
      }

      // Date Range Filter
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (!isWithinInterval(depositDate, { start, end })) return false;
      }

      // Month Filter
      if (month) {
        const [year, monthIndex] = month.split("-").map(Number);
        const startOfSelectedMonth = startOfMonth(
          new Date(year, monthIndex - 1)
        );
        const endOfSelectedMonth = endOfMonth(new Date(year, monthIndex - 1));
        if (
          !isWithinInterval(depositDate, {
            start: startOfSelectedMonth,
            end: endOfSelectedMonth,
          })
        ) {
          return false;
        }
      }

      // Deposit Type Filter
      if (depositType && deposit.deposit_type !== depositType) return false;

      // Payment Method Filter
      if (paymentMethod && deposit.payment_method !== paymentMethod)
        return false;

      return true;
    });
  }, [
    deposits,
    searchInput,
    specificDate,
    startDate,
    endDate,
    month,
    depositType,
    paymentMethod,
  ]);

  // Pagination logic
  const totalItems = filteredDeposits?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedDeposits = filteredDeposits?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const resetFilters = () => {
    setSearchInput("");
    setSpecificDate("");
    setStartDate("");
    setEndDate("");
    setMonth("");
    setDepositType("");
    setPaymentMethod("");
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div>
      {/* Filter Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-primary">
            Filter Deposits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="searchDepositor"
                className="text-sm font-medium text-gray-700"
              >
                Search Depositor / Ref
              </Label>
              <input
                type="text"
                id="searchDepositor"
                placeholder="Search depositor or Ref ID..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              />
            </div>
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
                  setMonth("");
                  setCurrentPage(1);
                }}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
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
                  setMonth("");
                  setCurrentPage(1);
                }}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
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
                  setMonth("");
                  setCurrentPage(1);
                }}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="month"
                className="text-sm font-medium text-gray-700"
              >
                Month
              </Label>
              <input
                type="month"
                id="month"
                value={month}
                onChange={(e) => {
                  setMonth(e.target.value);
                  setSpecificDate("");
                  setStartDate("");
                  setEndDate("");
                  setCurrentPage(1);
                }}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="depositType"
                className="text-sm font-medium text-gray-700"
              >
                Deposit Type
              </Label>
              <select
                id="depositType"
                value={depositType}
                onChange={(e) => {
                  setDepositType(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              >
                <option value="">All Types</option>
                <option value="Opening Balance">Opening Balance</option>
                <option value="Payroll Deduction">Payroll Deduction</option>
                <option value="Group Deposit">Group Deposit</option>
                <option value="Dividend Deposit">Dividend Deposit</option>
                <option value="Member Deposit">Member Deposit</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="paymentMethod"
                className="text-sm font-medium text-gray-700"
              >
                Payment Method
              </Label>
              <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={(e) => {
                  setPaymentMethod(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              >
                <option value="">All Methods</option>
                <option value="Cash">Cash</option>
                <option value="Mpesa">Mpesa</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
                <option value="Mobile Banking">Mobile Banking</option>
                <option value="Standing Order">Standing Order</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={resetFilters}
                className="w-full bg-gray-200 text-gray-700 hover:bg-gray-300 h-10 text-sm font-medium"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {(!filteredDeposits || filteredDeposits.length === 0) && (
        <div className="p-12 text-center text-muted-foreground bg-white rounded border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-2">
          <Edit className="w-12 h-12 text-slate-200" />
          No deposits found. Try adjusting your filters.
        </div>
      )}

      {/* Table */}
      {filteredDeposits && filteredDeposits.length > 0 && (
        <div className="overflow-x-auto border rounded bg-white">
          <Table>
            <TableHeader className="bg-[var(--accent)] hover:bg-[var(--accent)]">
              <TableRow>
                <TableHead className="text-white font-semibold">Date</TableHead>
                <TableHead className="text-white font-semibold">
                  Amount
                </TableHead>
                <TableHead className="text-white font-semibold">
                  Deposited By
                </TableHead>
                <TableHead className="text-white font-semibold">
                  Payment Method
                </TableHead>
                <TableHead className="text-white font-semibold">
                  Status
                </TableHead>
                {isAdmin && (
                  <TableHead className="text-white font-semibold text-right">
                    Actions
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedDeposits?.map((deposit) => (
                <TableRow key={deposit.reference} className="border-b hover:bg-gray-50 transition-colors">
                  <TableCell className="text-sm text-gray-700">
                    {formatDate(deposit.transaction_date || deposit.created_at)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-700">
                    KES {parseFloat(deposit.amount).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-700">
                    {deposit.deposited_by}
                  </TableCell>
                  <TableCell className="text-sm text-gray-700">
                    {deposit.payment_method}
                  </TableCell>
                  <TableCell className="text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs ${deposit.transaction_status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                        }`}
                    >
                      {deposit.transaction_status}
                    </span>
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEditClick(deposit)}
                        className="text-primary hover:text-primary/80 hover:bg-primary/10"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Date
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t bg-white border rounded-b mt-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
            entries
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-primary hover:bg-[var(--accent-hover)] text-white text-xs font-semibold uppercase tracking-wider h-8 disabled:opacity-50"
            >
              Previous
            </Button>
            {getPageNumbers(currentPage, totalPages).map((page, index) => page === "..." ? <span key={`ellipsis-${index}`} className="px-2 py-1 text-slate-400 text-xs select-none">...</span> : (
              <Button
                key={page}
                onClick={() => handlePageChange(page)}
                variant={currentPage === page ? "default" : "outline"}
                className={`h-8 w-8 text-xs font-semibold ${currentPage === page
                  ? "bg-primary text-white"
                  : "border-primary text-primary hover:bg-primary hover:text-white"
                  }`}
              >
                {page}
              </Button>
            ))}
            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="bg-primary hover:bg-[var(--accent-hover)] text-white text-xs font-semibold uppercase tracking-wider h-8 disabled:opacity-50"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Edit Date Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Deposit Date</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="newDate" className="mb-2 block">Transaction Date</Label>
            <input
              type="date"
              id="newDate"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Note: Updating this date will automatically update the General Ledger posting date.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={updateDepositMutation.isPending}>
              Cancel
            </Button>
            <Button onClick={handleUpdateDate} disabled={updateDepositMutation.isPending || !newDate} className="bg-primary text-white">
              {updateDepositMutation.isPending ? "Updating..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SavingsDepositsTable;