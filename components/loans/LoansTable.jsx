"use client";

import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Link from "next/link";

const getPageNumbers = (currentPage, totalPages) => {
  return [currentPage];
};;;


function LoansTable({ loans, isLoading, route }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState("All");
  const itemsPerPage = 5;

  // Get unique loan types for filter
  const loanTypes = useMemo(() => {
    const types = new Set(loans?.map((item) => item.loan_type));
    return ["All", ...types];
  }, [loans]);


  // Filter loans by loan_type
  const filteredLoans = useMemo(() => {
    if (filterType === "All") return loans;
    return loans?.filter((item) => item.loan_type === filterType);
  }, [loans, filterType]);

  // Pagination logic
  const totalItems = filteredLoans?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedLoans = filteredLoans?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Status badge logic
  const getStatus = (loan) => {
    if (!loan.is_approved) return "Pending";
    return loan.is_active ? "Active" : "Inactive";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-emerald-50 text-emerald-700 border border-emerald-100/50";
      case "Pending":
        return "bg-amber-50 text-amber-700 border border-amber-100/50";
      case "Inactive":
        return "bg-slate-50 text-slate-700 border border-slate-200";
      default:
        return "bg-slate-50 text-slate-600 border border-slate-100";
    }
  };

  if (isLoading) {
    return <div className="text-center text-gray-700">Loading loans...</div>;
  }

  if (!loans || loans.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-[#045e32]">My Loans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-700">No loans found.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-[#045e32]">My Loans</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filter */}
          <div className="flex items-center gap-4">
            <Label
              htmlFor="loan-type-filter"
              className="text-sm font-medium text-gray-700"
            >
              Filter by Loan Type
            </Label>
            <select
              id="loan-type-filter"
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(1); // Reset to first page on filter change
              }}
              className="w-[200px] h-10 px-3 py-2 rounded border border-gray-300 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#045e32] focus:border-transparent"
              aria-label="Filter by loan type"
            >
              {loanTypes.map((type) => (
                <option key={type} value={type}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="bg-white shadow-sm border border-slate-100 rounded overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-[var(--primary)] hover:bg-[var(--primary-hover)]">
                  <TableHead className="text-white font-bold text-sm h-12">
                    Loan Type
                  </TableHead>
                  <TableHead className="text-white font-bold text-sm h-12">
                    Account
                  </TableHead>
                  <TableHead className="text-white font-bold text-sm h-12">
                    Loan Amount
                  </TableHead>
                  <TableHead className="text-white font-bold text-sm h-12">
                    Balance
                  </TableHead>
                  <TableHead className="text-white font-bold text-sm h-12">
                    Status
                  </TableHead>
                  <TableHead className="text-white font-bold text-sm h-12">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLoans?.map((loan) => (
                  <TableRow
                    key={loan.reference}
                    className="border-b border-gray-200"
                  >
                    <TableCell className="text-sm text-gray-700">
                      {loan.loan_type}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {loan.account_number}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      KES {parseFloat(loan.loan_amount).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      KES {parseFloat(loan.outstanding_balance).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-sm">
                      <span
                        className={`px-2 py-0.5 font-bold uppercase tracking-wider text-[10px] rounded ${getStatusColor(
                          getStatus(loan),
                        )}`}
                      >
                        {getStatus(loan)}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      <Link
                        href={`/${route}/loans/${loan.identity}`}
                        className="text-[#045e32] hover:underline cursor-pointer"
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
              entries
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="bg-[#045e32] hover:bg-[#067a46] text-white text-sm disabled:opacity-50"
                aria-label="Previous page"
              >
                Previous
              </Button>
              {getPageNumbers(currentPage, totalPages).map((page, index) => page === "..." ? <span key={`ellipsis-${index}`} className="px-2 py-1 text-slate-400 text-sm select-none">...</span> : (((page) => (
                  <Button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    variant={currentPage === page ? "default" : "outline"}
                    className={`${currentPage === page
                        ? "bg-[#045e32] text-white"
                        : "border-[#045e32] text-[#045e32] hover:bg-[#045e32] hover:text-white"
                      } text-sm`}
                    aria-label={`Go to page ${page}`}
                  >
                    {page}
                  </Button>
                ),)(page)))}
              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="bg-[#045e32] hover:bg-[#067a46] text-white text-sm disabled:opacity-50"
                aria-label="Next page"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default LoansTable;